<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\SplitPayment;
use Illuminate\Http\Request;

class AnalyticSalesController extends Controller
{
    public function index(\App\Models\Outlet $outlet, Request $request)
    {
        $filterYear = $request->input('year', now()->year);
        $filterMonth = $request->input('month', now()->month);
        $filterType = $request->input('filter_type', 'monthly');
        $currentMonth = null;

        if ($filterType === 'monthly') {
            $currentDate = \Carbon\Carbon::createFromDate($filterYear, $filterMonth, 1);
            $currentMonth = $currentDate->month;
            $currentYear = $currentDate->year;

            $lastDate = $currentDate->copy()->subMonth();
            $lastMonth = $lastDate->month;
            $lastMonthYear = $lastDate->year;
        } else {
            $currentDate = \Carbon\Carbon::createFromDate($filterYear, 1, 1);
            $currentYear = $currentDate->year;

            $lastDate = $currentDate->copy()->subYear();
            $lastYear = $lastDate->year;
        }

        // Helper to get stats for a specific period
        $getStats = function ($year, $month = null) use ($outlet) {
            $ordersQuery = Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year)
                ->isFinishedOrder()
                ->with('orderProducts');

            if ($month) {
                $ordersQuery->whereMonth('created_at', $month);
            }

            $orders = $ordersQuery->get();

            $netIncomeQuery = SplitPayment::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year);

            if ($month) {
                $netIncomeQuery->whereMonth('created_at', $month);
            }

            return [
                'net_income' => $netIncomeQuery->sum('outlet'),
                'total_order' => $orders->count(),
                'average_sales' => $orders->count() > 0 ? $orders->sum('total') / $orders->count() : 0,
                'total_items_sold' => $orders->sum(fn($order) => $order->orderProducts->sum('quantity')),
            ];
        };

        if ($filterType === 'monthly') {
            $currentStats = $getStats($currentYear, $currentMonth);
            $lastStats = $getStats($lastMonthYear, $lastMonth);
        } else {
            $currentStats = $getStats($currentYear);
            $lastStats = $getStats($lastYear);
        }

        // Calculate percentages and diffs
        $calculateDiff = function ($current, $last) use ($filterType) {
            $diff = $current - $last;
            $percentage = $last > 0 ? ($diff / $last) * 100 : ($current > 0 ? 100 : 0);

            return [
                'value' => $current,
                'diff' => $diff,
                'percentage' => round(abs($percentage), 1),
                'is_increase' => $diff >= 0,
                'label' => $filterType === 'monthly' ? 'from last month' : 'from last year',
            ];
        };

        $stats = [
            'net_income' => $calculateDiff($currentStats['net_income'], $lastStats['net_income']),
            'average_sales' => $calculateDiff($currentStats['average_sales'], $lastStats['average_sales']),
            'total_order' => $calculateDiff($currentStats['total_order'], $lastStats['total_order']),
            'total_items_sold' => $calculateDiff($currentStats['total_items_sold'], $lastStats['total_items_sold']),
        ];

        $labels = [];
        $data = [];
        $lastPeriodData = [];

        if ($filterType === 'monthly') {
            // Chart Data (Daily Sales for Selected Month)
            $dailySales = \App\Models\Order::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->isFinishedOrder()
                ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('total', 'date');

            // Previous Month Data for Chart Comparison
            $lastMonthDailySales = \App\Models\Order::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $lastMonth)
                ->whereYear('created_at', $lastMonthYear)
                ->isFinishedOrder()
                ->selectRaw('DAY(created_at) as day, SUM(total) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            $daysInMonth = $currentDate->daysInMonth;

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $currentDate->copy()->setDay($i)->format('Y-m-d');
                $labels[] = $currentDate->copy()->setDay($i)->format('M d');
                $data[] = $dailySales[$date] ?? 0;
                $lastPeriodData[] = $lastMonthDailySales[$i] ?? 0;
            }
        } else {
            // Monthly Sales for Selected Year
            $monthlySales = \App\Models\Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $currentYear)
                ->isFinishedOrder()
                ->selectRaw('MONTH(created_at) as month, SUM(total) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month');

            // Previous Year Data
            $lastYearMonthlySales = \App\Models\Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $lastYear)
                ->isFinishedOrder()
                ->selectRaw('MONTH(created_at) as month, SUM(total) as total')
                ->groupBy('month')
                ->pluck('total', 'month');

            for ($i = 1; $i <= 12; $i++) {
                $labels[] = \Carbon\Carbon::create()->month($i)->translatedFormat('F');
                $data[] = $monthlySales[$i] ?? 0;
                $lastPeriodData[] = $lastYearMonthlySales[$i] ?? 0;
            }
        }

        $chartData = [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Net Sales',
                    'data' => $data,
                ],
                [
                    'label' => 'Previous Period',
                    'data' => $lastPeriodData,
                ],
            ],
        ];

        // Top Products
        $products = OrderProduct::with(['product'])->whereHas('order', function ($q) use ($outlet, $currentMonth, $currentYear, $filterType) {
            $q->where('outlet_id', $outlet->id)
                ->whereYear('created_at', $currentYear)
                ->isFinishedOrder();
            if ($filterType === 'monthly') {
                $q->whereMonth('created_at', $currentMonth);
            }
        })
            ->selectRaw('order_products.product_id, SUM(order_products.quantity) as sold, SUM(order_products.total) as revenue')
            ->groupBy('order_products.product_id')
            ->orderByDesc('sold')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'sold' => $item->sold,
                    'revenue' => $item->revenue,
                    'active' => true,
                    'image' => $item->product->imageUrl,
                ];
            });

        // Order Info Stats (At Table vs At Cashier)
        // Order Info Stats (At Table vs At Cashier)
        $orderInfoStatsQuery = Order::where('outlet_id', $outlet->id)
            ->whereYear('created_at', $currentYear)
            ->isFinishedOrder();

        if ($filterType === 'monthly') {
            $orderInfoStatsQuery->whereMonth('created_at', $currentMonth);
        }

        $orderInfoStats = $orderInfoStatsQuery->selectRaw('
                COUNT(CASE WHEN table_number_id IS NOT NULL THEN 1 END) as at_table,
                COUNT(CASE WHEN table_number_id IS NULL THEN 1 END) as at_cashier,
                COUNT(*) as total_orders,
                SUM(total) as total_revenue
            ')
            ->first();

        $orderInfo = [
            'at_table' => $orderInfoStats->at_table,
            'at_cashier' => $orderInfoStats->at_cashier,
            'total_orders' => $orderInfoStats->total_orders,
            'total_revenue' => $orderInfoStats->total_revenue,
        ];

        $years = range(now()->year, 2020);
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        return view('pages.outlets.analytic.sales', compact(
            'stats',
            'chartData',
            'orderInfo',
            'products',
            'years',
            'months',
            'filterYear',
            'filterMonth',
            'filterType'
        ));
    }
}
