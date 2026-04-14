<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\CustomerPointTypeEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerPoint;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Http\Request;

class AnalyticPoinController extends Controller
{
    public function index(Outlet $outlet, Request $request)
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

        // Helper to get stats for a specific period
        // For monthly: specific month & year
        // For yearly: specific year (all months)
        $getStats = function ($year, $month = null) use ($outlet) {
            $query = CustomerPoint::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year);

            if ($month) {
                $query->whereMonth('created_at', $month);
            }

            $points = $query->get();

            $creditPoints = $points->where('type', CustomerPointTypeEnum::CREDIT);
            $debitPoints = $points->where('type', CustomerPointTypeEnum::DEBIT);

            // Average points per transaction (only for CREDIT type which usually comes from orders)
            $transactionPoints = $creditPoints->where('pointable_type', Order::class);
            $avgPoints = $transactionPoints->count() > 0 ? $transactionPoints->avg('point') : 0;

            return [
                'total_issued' => $creditPoints->sum('point'),
                'total_redeemed' => $debitPoints->sum('point'),
                'average_per_transaction' => $avgPoints,
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
            'total_issued' => $calculateDiff($currentStats['total_issued'], $lastStats['total_issued']),
            'total_redeemed' => $calculateDiff($currentStats['total_redeemed'], $lastStats['total_redeemed']),
            'average_per_transaction' => $calculateDiff($currentStats['average_per_transaction'], $lastStats['average_per_transaction']),
        ];

        // Chart Data
        $labels = [];
        $data = [];
        $lastPeriodData = [];

        if ($filterType === 'monthly') {
            // Daily Points Issued for Selected Month
            $dailyPoints = CustomerPoint::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->where('type', CustomerPointTypeEnum::CREDIT)
                ->selectRaw('DATE(created_at) as date, SUM(point) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('total', 'date');

            // Previous Month Data for Chart Comparison
            $lastMonthDailyPoints = CustomerPoint::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $lastMonth)
                ->whereYear('created_at', $lastMonthYear)
                ->where('type', CustomerPointTypeEnum::CREDIT)
                ->selectRaw('DAY(created_at) as day, SUM(point) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            $daysInMonth = $currentDate->daysInMonth;

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $currentDate->copy()->setDay($i)->format('Y-m-d');
                $labels[] = $currentDate->copy()->setDay($i)->format('M d');
                $data[] = $dailyPoints[$date] ?? 0;
                $lastPeriodData[] = $lastMonthDailyPoints[$i] ?? 0;
            }
        } else {
            // Monthly Points Issued for Selected Year
            $monthlyPoints = CustomerPoint::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $currentYear)
                ->where('type', CustomerPointTypeEnum::CREDIT)
                ->selectRaw('MONTH(created_at) as month, SUM(point) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month');

            // Previous Year Data
            $lastYearMonthlyPoints = CustomerPoint::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $lastYear)
                ->where('type', CustomerPointTypeEnum::CREDIT)
                ->selectRaw('MONTH(created_at) as month, SUM(point) as total')
                ->groupBy('month')
                ->pluck('total', 'month');

            for ($i = 1; $i <= 12; $i++) {
                $labels[] = \Carbon\Carbon::create()->month($i)->translatedFormat('F');
                $data[] = $monthlyPoints[$i] ?? 0;
                $lastPeriodData[] = $lastYearMonthlyPoints[$i] ?? 0;
            }
        }

        $chartData = [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Points Issued',
                    'data' => $data,
                ],
                [
                    'label' => 'Last Period',
                    'data' => $lastPeriodData,
                ],
            ],
        ];

        $rewardProducts = Reward::where('outlet_id', $outlet->id)->whereNotNull('product_id')->get();
        // NOTE: Product total_voucher_claimed is global, not filtered by date in this context usually,
        // but if we need it filtered, we would need to implement a scope or manual query.
        // Assuming keeping it simple as per original code for now, or just adding slight context if possible.
        // The original code used a scope `addTotalVoucherClaimed` which likely doesn't support date filtering easily without modification.
        // We will keep it as is for now regarding products.
        $products = Product::where('outlet_id', $outlet->id)
            ->addTotalVoucherClaimed($rewardProducts->pluck('voucher_id'))
            ->orderBy('total_voucher_claimed', 'desc')
            ->limit(5)
            ->get();

        // Top Customers by Points (Transactions)
        $customersQuery = User::role(RoleEnum::CUSTOMER)
            ->with('customerProfile')
            ->whereHas('orders', function ($query) use ($outlet, $currentYear, $filterType, $filterMonth) {
                $query->where('outlet_id', $outlet->id)
                    ->whereYear('created_at', $currentYear);
                if ($filterType === 'monthly') {
                    $query->whereMonth('created_at', $filterMonth);
                }
            });

        $customers = $customersQuery
            ->get()
            ->map(function ($user) use ($outlet, $currentYear, $filterType, $filterMonth) {
                $pointsQuery = CustomerPoint::where('user_id', $user->id)
                    ->where('outlet_id', $outlet->id)
                    ->whereYear('created_at', $currentYear)
                    ->where('type', CustomerPointTypeEnum::CREDIT)
                    ->where('pointable_type', Order::class);

                if ($filterType === 'monthly') {
                    $pointsQuery->whereMonth('created_at', $filterMonth);
                }

                $points = $pointsQuery->avg('point');

                $user->current_avg_points = $points ?? 0;

                return $user;
            })
            ->sortByDesc('current_avg_points')
            ->take(10);

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

        return view('pages.outlets.analytic.poin', compact(
            'stats',
            'chartData',
            'products',
            'customers',
            'years',
            'months',
            'filterYear',
            'filterMonth',
            'filterType'
        ));
    }
}
