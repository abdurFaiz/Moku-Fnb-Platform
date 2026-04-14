<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\FeedbackQuestionCategoryEnum;
use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\FeedbackAnswer;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticFeedbackController extends Controller
{
    public function index(Outlet $outlet, Request $request)
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
            $feedbackQuery = Feedback::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $year);

            if ($month) {
                $feedbackQuery->whereMonth('created_at', $month);
            }

            // Total Feedback Sent
            $totalFeedback = $feedbackQuery->count();

            // Total Feedback Done (Answers)
            $totalAnswers = (clone $feedbackQuery)->isDone()->count();

            return [
                'total_feedback' => $totalFeedback,
                'response_rate' => $totalFeedback > 0 ? ($totalAnswers / $totalFeedback) * 100 : 0,
                'total_answers' => $totalAnswers,
            ];
        };

        if ($filterType === 'monthly') {
            $currentStats = $getStats($currentYear, $currentMonth);
            $lastStats = $getStats($lastMonthYear, $lastMonth);
        } else {
            $currentStats = $getStats($currentYear);
            $lastStats = $getStats($lastYear);
        }

        // Calculate diffs
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
            'total_feedback' => $calculateDiff($currentStats['total_feedback'], $lastStats['total_feedback']),
            'response_rate' => $calculateDiff($currentStats['response_rate'], $lastStats['response_rate']),
            'total_answers' => $calculateDiff($currentStats['total_answers'], $lastStats['total_answers']),
        ];

        // Charts
        $labels = [];
        $data = [];
        $lastPeriodData = [];

        if ($filterType === 'monthly') {
            // Daily Feedback
            $dailyFeedback = Feedback::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->isDone()
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->pluck('count', 'date');

            $lastMonthDaily = Feedback::where('outlet_id', $outlet->id)
                ->whereMonth('created_at', $lastMonth)
                ->whereYear('created_at', $lastMonthYear)
                ->isDone()
                ->selectRaw('DAY(created_at) as day, COUNT(*) as count')
                ->groupBy('day')
                ->pluck('count', 'day');

            $daysInMonth = $currentDate->daysInMonth;
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $date = $currentDate->copy()->setDay($i)->format('Y-m-d');
                $labels[] = $currentDate->copy()->setDay($i)->format('M d');
                $data[] = $dailyFeedback[$date] ?? 0;
                $lastPeriodData[] = $lastMonthDaily[$i] ?? 0;
            }
        } else {
            // Monthly Feedback
            $monthlyFeedback = Feedback::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $currentYear)
                ->isDone()
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->groupBy('month')
                ->pluck('count', 'month');

            $lastYearMonthly = Feedback::where('outlet_id', $outlet->id)
                ->whereYear('created_at', $lastYear)
                ->isDone()
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->groupBy('month')
                ->pluck('count', 'month');

            for ($i = 1; $i <= 12; $i++) {
                $labels[] = \Carbon\Carbon::create()->month($i)->translatedFormat('F');
                $data[] = $monthlyFeedback[$i] ?? 0;
                $lastPeriodData[] = $lastYearMonthly[$i] ?? 0;
            }
        }

        $chartData = [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Feedback',
                    'data' => $data,
                ],
                [
                    'label' => 'Previous Period',
                    'data' => $lastPeriodData,
                ],
            ],
        ];

        // Category Distribution
        $categoryDist = FeedbackAnswer::where('feedback_answers.outlet_id', $outlet->id)
            ->join('feedback_questions', 'feedback_answers.feedback_question_id', '=', 'feedback_questions.id')
            ->join('feedback', 'feedback_answers.feedback_id', '=', 'feedback.id')
            ->whereYear('feedback.created_at', $currentYear)
            ->when($filterType === 'monthly', function ($q) use ($currentMonth) {
                $q->whereMonth('feedback.created_at', $currentMonth);
            })
            ->selectRaw('feedback_questions.category as category, COUNT(*) as count')
            ->groupBy('category')
            ->get();

        $categoryConfig = [
            'labels' => [],
            'data' => [],
            'colors' => [],
        ];

        foreach ($categoryDist as $dist) {
            $categoryConfig['labels'][] = FeedbackQuestionCategoryEnum::getDescription((int)$dist->category);
            $categoryConfig['data'][] = $dist->count;
            // You might want to define colors map in Enum or check what badgeClass used
            $categoryConfig['colors'][] = match ((int)$dist->category) {
                FeedbackQuestionCategoryEnum::GENERAL => '#4e73df', // Primary
                FeedbackQuestionCategoryEnum::PRODUCT => '#1cc88a', // Success
                default => '#858796', // Secondary
            };
        }

        // Questions Analysis
        $questions = \App\Models\FeedbackQuestion::where('outlet_id', $outlet->id)->with('options')->get();
        $recentFeedbacks = $questions->map(function ($q) use ($outlet, $currentYear, $currentMonth, $filterType) {
            $answersQuery = $q->answers()
                ->where('outlet_id', $outlet->id)
                ->whereHas('feedback', function ($query) use ($currentYear, $currentMonth, $filterType) {
                    $query->whereYear('created_at', $currentYear);
                    if ($filterType === 'monthly') $query->whereMonth('created_at', $currentMonth);
                });

            $total = $answersQuery->count();
            $topOption = '-';
            $topOptionPercent = 0;

            if ($total > 0 && $q->options->count() > 0) {
                $counts = $answersQuery->select('feedback_option_question_id', DB::raw('count(*) as total'))
                    ->groupBy('feedback_option_question_id')
                    ->orderByDesc('total')
                    ->first();

                if ($counts) {
                    $option = $q->options->where('id', $counts->feedback_option_question_id)->first();
                    $topOption = $option ? $option->option : '-';
                    $topOptionPercent = round(($counts->total / $total) * 100, 1);
                }
            }

            // For text questions (no options), maybe show latest comment?
            // "Opsi jawaban customer" implies options. For now text questions will show '-'

            return (object) [
                'question' => $q->question,
                'category' => $q->category,
                'total_answers' => $total,
                'top_option' => $topOption,
                'top_option_percent' => $topOptionPercent
            ];
        })->sortByDesc('total_answers')->values();

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

        return view('pages.outlets.analytic.feedback', compact(
            'stats',
            'chartData',
            'categoryConfig',
            'recentFeedbacks',
            'years',
            'months',
            'filterYear',
            'filterMonth',
            'filterType'
        ));
    }
}
