<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SplitPayment;
use Illuminate\Http\Request;

class AnalyticCustomerController extends Controller
{
    public function index(\App\Models\Outlet $outlet, Request $request)
    {
        $filterYear = $request->input('year', now()->year);
        $filterMonth = $request->input('month', now()->month);
        $filterType = $request->input('filter_type', 'monthly');

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
            // Base query for active customers and revenue
            $orderQuery = Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year)
                ->isFinishedOrder();

            if ($month) {
                $orderQuery->whereMonth('created_at', $month);
            }

            // Clone query for active customers
            $activeCustomers = (clone $orderQuery)
                ->distinct('user_id')
                ->count('user_id');

            // Clone query for revenue
            // $totalRevenue = (clone $orderQuery)
            //     ->sum('total');

            // get total Revenue from split payment
            $totalRevenue = SplitPayment::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year)
                ->sum('outlet');

            // Total Customers (Cumulative unique users up to end of this period)
            // We assume a customer is "acquired" when they make their first order at this outlet
            if ($month) {
                $endDate = \Carbon\Carbon::createFromDate($year, $month, 1)->endOfMonth();
            } else {
                $endDate = \Carbon\Carbon::createFromDate($year, 12, 31)->endOfDay();
            }

            $totalCustomers = Order::where('outlet_id', $outlet->id)
                ->where('created_at', '<=', $endDate)
                ->isFinishedOrder()
                ->distinct('user_id')
                ->count('user_id');

            return [
                'active_customers' => $activeCustomers,
                'total_revenue' => $totalRevenue,
                'total_customers' => $totalCustomers,
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
                'label' => $filterType === 'monthly' ? 'from last month' : 'from last year'
            ];
        };

        $stats = [
            'total_customers' => $calculateDiff($currentStats['total_customers'], $lastStats['total_customers']),
            'active_customers' => $calculateDiff($currentStats['active_customers'], $lastStats['active_customers']),
            'total_revenue' => $calculateDiff($currentStats['total_revenue'], $lastStats['total_revenue']),
        ];

        $labels = [];
        $data = [];
        $lastPeriodData = [];

        if ($filterType === 'monthly') {
            // Chart Data (Total Purchases / Orders per day)
            $dailyPurchases = Order::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->isFinishedOrder()
                ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('total', 'date');

            // Previous Period Data for Chart Comparison
            $lastMonthDailyPurchases = Order::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $lastMonth)
                ->whereYear('created_at', $lastMonthYear)
                ->isFinishedOrder()
                ->selectRaw('DAY(created_at) as day, COUNT(*) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            $daysInMonth = $currentDate->daysInMonth;

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $currentDate->copy()->setDay($i)->format('Y-m-d');
                $labels[] = $currentDate->copy()->setDay($i)->format('M d');
                $data[] = $dailyPurchases[$date] ?? 0;
                $lastPeriodData[] = $lastMonthDailyPurchases[$i] ?? 0;
            }
        } else {
            // Monthly Purchases for Selected Year
            $monthlyPurchases = Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $currentYear)
                ->isFinishedOrder()
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month');

            // Previous Year Data
            $lastYearMonthlyPurchases = Order::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $lastYear)
                ->isFinishedOrder()
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
                ->groupBy('month')
                ->pluck('total', 'month');

            for ($i = 1; $i <= 12; $i++) {
                $labels[] = \Carbon\Carbon::create()->month($i)->translatedFormat('F');
                $data[] = $monthlyPurchases[$i] ?? 0;
                $lastPeriodData[] = $lastYearMonthlyPurchases[$i] ?? 0;
            }
        }

        $chartData = [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Total Purchases',
                    'data' => $data,
                ],
                [
                    'label' => 'Last Period',
                    'data' => $lastPeriodData,
                ]
            ]
        ];

        // Top Customers Ranking
        $topCustomersQuery = Order::where('outlet_id', $outlet->id)
            ->whereYear('created_at', $currentYear)
            ->isFinishedOrder();

        if ($filterType === 'monthly') {
            $topCustomersQuery->whereMonth('created_at', $currentMonth);
        }

        $topCustomers = $topCustomersQuery
            ->selectRaw('user_id, COUNT(*) as total_purchases, SUM(total) as total_spent')
            ->groupBy('user_id')
            ->orderByDesc('total_purchases')
            ->limit(5)
            ->with('user')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->user->name ?? 'Unknown',
                    'total_purchases' => $item->total_purchases,
                    'total_spent' => $item->total_spent,
                    'image' => $item->user->avatar_url,
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
            12 => 'Desember'
        ];

        return view('pages.outlets.analytic.customer', compact(
            'stats',
            'chartData',
            'topCustomers',
            'years',
            'months',
            'filterYear',
            'filterMonth',
            'filterType'
        ));
    }
}
