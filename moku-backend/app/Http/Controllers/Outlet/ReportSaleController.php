<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Controller;
use App\Jobs\SendFeedbackRequestJob;
use App\Mail\CustomerRetentionMail;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\SplitPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ReportSaleController extends Controller
{
    protected $feedbackService;

    public function __construct(\App\Services\Payment\FeedbackService $feedbackService)
    {
        $this->feedbackService = $feedbackService;
    }

    public function index(Outlet $outlet)
    {
        $reports = Order::with([
            'user',
            'orderProducts.product',
            'orderProducts.orderProductVariants.productAttributeValue.productAttribute',
        ])
            ->filter(request()->query())
            ->where('outlet_id', $outlet->id)
            ->whereYear('created_at', date('Y'))
            ->latest()
            ->paginate(maxRowParams());

        $orders = Order::where('outlet_id', $outlet->id)
            ->isFinishedOrder()
            ->get();

        $totalOrders = $orders->count();
        $totalSales = $orders->sum('total');

        $totalProfit = SplitPayment::where('outlet_id', $outlet->id)
            ->whereYear('created_at', date('Y'))
            ->sum('outlet');

        $data = [
            'reports' => $reports,
            'totalOrders' => $totalOrders,
            'totalSales' => $totalSales,
            'totalProfit' => $totalProfit,
        ];

        return view('pages.outlets.report-sales.index', $data);
    }

    public function sendFeedback(Outlet $outlet, Order $order)
    {
        try {
            DB::beginTransaction();
            // Create feedback data using service (respects frequency limits)
            $feedback = $this->feedbackService->createFeedback($order);

            if (!@$feedback) {
                // If null implementation, likely blocked by frequency limit or status
                DB::rollBack();
                notyf('Gagal mengirim feedback. Mungkin batas frekuensi tercapai (maks 2x per 2 minggu) atau status order tidak valid.', 'error');
                return back();
            }

            if (!$order->user || !$order->user->email) {
                DB::rollBack();
                notyf('Order tidak memiliki customer email', 'error');
                return back();
            }

            // Dispatch job (sync for manual trigger to verify immediately, or async as per user pref. User used sync in testing)
            SendFeedbackRequestJob::dispatchSync($order, $feedback);

            DB::commit();
            notyf('Email feedback berhasil dikirim ke ' . $order->user->email, 'success');
            return back();
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    public function sendRetention(Outlet $outlet, Order $order)
    {
        try {
            if (!$order->user || !$order->user->email) {
                notyf('Order tidak memiliki customer email', 'error');
                return back();
            }

            Mail::to($order->user->email)->send(new CustomerRetentionMail($order));

            notyf('Email pengingat berhasil dikirim ke ' . $order->user->email, 'success');
            return back();
        } catch (\Throwable $e) {
            throw $e;
        }
    }
}
