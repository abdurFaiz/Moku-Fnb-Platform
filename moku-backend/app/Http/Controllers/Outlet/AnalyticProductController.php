<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\SplitPayment;
use Illuminate\Http\Request;

class AnalyticProductController extends Controller
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

        // Helper to get stats
        $getStats = function ($year, $month = null) use ($outlet) {
            $ordersQuery = Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year)
                ->isFinishedOrder()
                ->with('orderProducts');

            if ($month) {
                $ordersQuery->whereMonth('created_at', $month);
            }

            $orders = $ordersQuery->get();

            // Total Items Sold
            $totalItemsSold = $orders->sum(fn($order) => $order->orderProducts->sum('quantity'));

            // Total Revenue (from products) - simple approximation using order totals derived from products
            // Or specifically summing order_products.total if available.
            // AnalyticSalesController uses $orders->sum('total') for Average Sales.
            // Let's use orders->sum('total') as "Total Revenue" for simplicity context, or be more specific.
            // AnalyticSalesController calculates "net_income" from SplitPayment.
            // Let's use Order Product Sum for Product Revenue.

            // $totalProductRevenue = $orders->sum(fn($order) => $order->orderProducts->sum('total'));

            $splitPaymentQuery = SplitPayment::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year);

            if ($month) {
                $splitPaymentQuery->whereMonth('created_at', $month);
            }

            $totalProductRevenue = $splitPaymentQuery->sum('outlet');

            return [
                'total_items_sold' => $totalItemsSold,
                'total_product_revenue' => $totalProductRevenue,
                'total_orders' => $orders->count(),
                'avg_items_per_order' => $orders->count() > 0 ? $totalItemsSold / $orders->count() : 0,
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
            'total_items_sold' => $calculateDiff($currentStats['total_items_sold'], $lastStats['total_items_sold']),
            'total_product_revenue' => $calculateDiff($currentStats['total_product_revenue'], $lastStats['total_product_revenue']),
            'total_orders' => $calculateDiff($currentStats['total_orders'], $lastStats['total_orders']),
            'avg_items_per_order' => $calculateDiff($currentStats['avg_items_per_order'], $lastStats['avg_items_per_order']),
        ];

        // Chart Data (Items Sold)
        $labels = [];
        $data = [];
        $lastPeriodData = [];

        if ($filterType === 'monthly') {
            // Daily Items Sold
            $dailyItems = OrderProduct::whereHas('order', function ($q) use ($outlet, $currentMonth, $currentYear) {
                $q->where('outlet_id', $outlet->id)
                    ->whereMonth('created_at', $currentMonth)
                    ->whereYear('created_at', $currentYear)
                    ->isFinishedOrder();
            })
                ->selectRaw('DATE(created_at) as date, SUM(quantity) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('total', 'date');

            // Previous Month
            $lastMonthDailyItems = OrderProduct::whereHas('order', function ($q) use ($outlet, $lastMonth, $lastMonthYear) {
                $q->where('outlet_id', $outlet->id)
                    ->whereMonth('created_at', $lastMonth)
                    ->whereYear('created_at', $lastMonthYear)
                    ->isFinishedOrder();
            })
                ->selectRaw('DAY(created_at) as day, SUM(quantity) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            $daysInMonth = $currentDate->daysInMonth;

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $currentDate->copy()->setDay($i)->format('Y-m-d');
                $labels[] = $currentDate->copy()->setDay($i)->format('M d');
                $data[] = $dailyItems[$date] ?? 0;
                $lastPeriodData[] = $lastMonthDailyItems[$i] ?? 0;
            }
        } else {
            // Monthly Items Sold
            $monthlyItems = OrderProduct::whereHas('order', function ($q) use ($outlet, $currentYear) {
                $q->where('outlet_id', $outlet->id)
                    ->whereYear('created_at', $currentYear)
                    ->isFinishedOrder();
            })
                ->selectRaw('MONTH(created_at) as month, SUM(quantity) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month');

            $lastYearMonthlyItems = OrderProduct::whereHas('order', function ($q) use ($outlet, $lastYear) {
                $q->where('outlet_id', $outlet->id)
                    ->whereYear('created_at', $lastYear)
                    ->isFinishedOrder();
            })
                ->selectRaw('MONTH(created_at) as month, SUM(quantity) as total')
                ->groupBy('month')
                ->pluck('total', 'month');

            for ($i = 1; $i <= 12; $i++) {
                $labels[] = \Carbon\Carbon::create()->month($i)->translatedFormat('F');
                $data[] = $monthlyItems[$i] ?? 0;
                $lastPeriodData[] = $lastYearMonthlyItems[$i] ?? 0;
            }
        }

        $chartData = [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Items Sold',
                    'data' => $data,
                ],
                [
                    'label' => 'Previous Period',
                    'data' => $lastPeriodData,
                ],
            ],
        ];

        // Top Products Ranking (Same as Sales Analysis but maybe list more?)
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
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'sold' => $item->sold,
                    'revenue' => $item->revenue,
                    'image' => $item->product->imageUrl,
                ];
            });

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

        // Most Liked Products
        $mostLikedProducts = \App\Models\Product::where('outlet_id', $outlet->id)
            ->mostLiked()
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'name' => $product->name,
                    'image' => $product->imageUrl,
                    'likes' => $product->likes_count,
                    'price' => $product->price,
                ];
            });

        // Most Searched Products
        $mostSearchedProducts = \App\Models\Product::where('outlet_id', $outlet->id)
            ->mostSearched()
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'name' => $product->name,
                    'image' => $product->imageUrl,
                    'search_count' => $product->search_count ?? 0,
                    'price' => $product->price,
                ];
            });

        return view('pages.outlets.analytic.product', compact(
            'stats',
            'chartData',
            'products',
            'mostLikedProducts',
            'mostSearchedProducts',
            'years',
            'months',
            'filterYear',
            'filterMonth',
            'filterType'
        ));
    }
}
