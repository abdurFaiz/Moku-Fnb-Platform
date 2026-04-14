<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\OrderStatusEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Jobs\SendFeedbackRequestJob;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackQuestion;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\SplitPayment;
use App\Models\User;
use App\Services\Payment\FeedbackService;

class DashboardController extends Controller
{
    protected FeedbackService $feedbackService;

    public function __construct(FeedbackService $feedbackService)
    {
        $this->feedbackService = $feedbackService;
    }

    public function index(Outlet $outlet)
    {
        $request = request()->query();
        $year = $request['year'] ?? date('Y');
        $lastYear = $year - 1;

        // Helper to get stats for a specific year
        $getStats = function ($y) use ($outlet) {
            $orders = Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $y)
                ->isFinishedOrder()
                ->get();

            $totalProfit = SplitPayment::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $y)
                ->sum('outlet');

            return [
                'total_completed_orders' => $orders->count(),
                'total_sales' => $orders->sum('total'),
                'total_profit' => $totalProfit,
            ];
        };

        $currentStats = $getStats($year);
        $lastStats = $getStats($lastYear);

        // Calculate percentages and diffs
        $calculateDiff = function ($current, $last) {
            $diff = $current - $last;
            $percentage = $last > 0 ? ($diff / $last) * 100 : ($current > 0 ? 100 : 0);

            return [
                'value' => $current,
                'diff' => $diff,
                'percentage' => round(abs($percentage), 1),
                'is_increase' => $diff >= 0,
            ];
        };

        $stats = [
            'total_completed_orders' => $calculateDiff($currentStats['total_completed_orders'], $lastStats['total_completed_orders']),
            'total_sales' => $calculateDiff($currentStats['total_sales'], $lastStats['total_sales']),
            'total_profit' => $calculateDiff($currentStats['total_profit'], $lastStats['total_profit']),
        ];

        // get popular product (based on current selected year)
        $popularProductIds = Order::where('outlet_id', $outlet->id)
            ->whereYear('created_at', $year)
            ->where('status', OrderStatusEnum::COMPLETED)
            ->with('orderProducts')
            ->get()
            ->flatMap(function ($order) {
                return $order->orderProducts;
            })->groupBy('product_id')
            ->map(function ($items) {
                return $items->sum('quantity');
            })
            ->sortDesc()
            ->take(5)
            ->keys();

        $popularProducts = Product::addTotalSales()->whereIn('id', $popularProductIds)->get();

        // get data total sales for chart with filter year
        $totalSalesChart = Order::salesPerMonth($year)->where('outlet_id', $outlet->id)->get();

        // format data for chart
        $raw = $totalSalesChart->keyBy('label');

        // List Januari - Desember
        $months = collect([
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
        ]);

        // Merge bulan kosong → 0
        $totalSalesChart = $months->map(function ($month, $index) use ($raw) {
            $monthNumber = $index + 1;

            return [
                'label' => $month,
                'total_sales' => $raw[$monthNumber]->total_sales ?? 0,
            ];
        });

        // outlet profile data (All time stats)
        $totalCustomers = User::role(RoleEnum::CUSTOMER)
            ->whereHas('orders', function ($query) use ($outlet) {
                $query->where('outlet_id', $outlet->id);
            })
            ->count();
        $totalProducts = Product::where('outlet_id', $outlet->id)->count();
        $totalOrders = Order::where('outlet_id', $outlet->id)->count();

        $data = [
            'stats' => $stats,
            'popularProducts' => $popularProducts,
            'totalSalesChart' => $totalSalesChart,
            'totalCustomers' => $totalCustomers,
            'totalProducts' => $totalProducts,
            'totalOrders' => $totalOrders,
            'filterYear' => $year,
        ];

        return view('pages.outlets.dashboard.index', $data);
    }
}
