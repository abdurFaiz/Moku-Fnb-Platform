<?php

namespace App\Http\Controllers\Webhook;

use App\Enums\CustomerPointTypeEnum;
use App\Enums\OrderStatusEnum;
use App\Events\NewOrderLineCreatedEvent;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentLog;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\Api\PaymentService;

class PaymentHandlerController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }
    // public function handle(Request $request)
    // {
    //     try {
    //         DB::beginTransaction();

    //         $order = Order::where('code', $request->code)->firstOrFail();

    //         // count total order in this day
    //         $totalOrder = Order::where('outlet_id', $order->outlet_id)->where('status', OrderStatusEnum::SUCCESS)->whereDate('created_at', now()->toDateString())->count() + 1;

    //         $order->update([
    //             'status' => OrderStatusEnum::SUCCESS,
    //             'order_number' => $totalOrder,
    //             'created_at' => now(),
    //         ]);
    //         $order->append('status_label');

    //         // add point user
    //         $totalPoint = calculatePoints($order->total);

    //         if($totalPoint > 0) {
    //             $order->customerPoint()->create([
    //                 'outlet_id' => $order->outlet_id,
    //                 'user_id' => $order->user_id,
    //                 'point' => $totalPoint,
    //                 'type' => CustomerPointTypeEnum::CREDIT,
    //                 'info' => 'Pembelian Item di ' . $order->outlet->name,
    //             ]);
    //         }

    //         broadcast(new NewOrderLineCreatedEvent($order->fresh()))->toOthers();

    //         DB::commit();

    //         return ResponseFormatter::success([
    //             'order' => $order,
    //         ], 'Successfully update order');
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return ResponseFormatter::error(null, 'Failed to update order: ' . $e->getMessage(), 500);
    //     }
    // }

    public function handle(Request $request)
    {
        $validation = validator($request->all(), $this->validation());

        if ($validation->fails()) {
            return ResponseFormatter::error($validation->errors(), 'Validation error', 422);
        }

        // define data
        $data = $request->all();

        // Signature check
        if (!$this->signatureCheck($data)) {
            return $this->response('error', 'Signature key is invalid', 400);
        }

        try {
            DB::beginTransaction();

            // get Order
            $order = $this->getOrder($data['order_id']);

            if (!$order) {
                return ResponseFormatter::warning('order not found', '', 404);
            }

            // order status check
            if ($order->status != OrderStatusEnum::WAITING_CONFIRMATION) {
                return ResponseFormatter::warning('order status not waiting confirmation', '', 400);
            }

            // get status midtrans
            $status = $this->getStatusMidtrans($data);

            $order->update([
                'status' => $status,
                'created_at' => now(),
            ]);
            $order->append('status_label');

            // add payment log order
            PaymentLog::create([
                'status' => $data['transaction_status'],
                'payment_type' => $data['payment_type'],
                'order_id' => $order->id,
                'raw_response' => $data,
            ]);

            if ($status == OrderStatusEnum::SUCCESS) {
                // process success order using shared service logic
                $this->paymentService->processSuccessOrder($order);
            }

            DB::commit();

            return ResponseFormatter::success([
                'order' => $order,
            ], 'Successfully update order');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error(null, 'Failed to update order: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Validation rules
     */
    private function validation(): array
    {
        return [
            'order_id' => 'required',
            'status_code' => 'required',
            'transaction_status' => 'required',
            'payment_type' => 'required',
            'gross_amount' => 'required',
            'fraud_status' => 'required',
        ];
    }

    /**
     * Get single order
     * 
     * @param string $orderId
     */
    private function getOrder($orderId)
    {
        return Order::where('code', $orderId)->first();
    }

    /**
     * Check signature key
     */
    private function signatureCheck($data)
    {
        $serverKey = config('services.midtrans.server_key');
        $signature = $data['order_id'] . $data['status_code'] . $data['gross_amount'] . $serverKey;
        $mySignatureKey = hash('sha512', $signature);

        return $data['signature_key'] === $mySignatureKey;
    }

    /**
     * Get status midtrans
     */
    private function getStatusMidtrans($data)
    {
        $status = OrderStatusEnum::PENDING;
        $transactionStatus = $data['transaction_status'];
        $fraudStatus = $data['fraud_status'];

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $status = OrderStatusEnum::CHALLENGE;
            } else if ($fraudStatus == 'accept') {
                $status = OrderStatusEnum::SUCCESS;
            }
        } else if ($transactionStatus == 'settlement') {
            $status = OrderStatusEnum::SUCCESS;
        } else if (
            $transactionStatus == 'cancel' ||
            $transactionStatus == 'deny'
        ) {
            $status = OrderStatusEnum::FAILED;
        } else if ($transactionStatus == 'expire') {
            $status = OrderStatusEnum::EXPIRED;
        } else if ($transactionStatus == 'pending') {
            $status = OrderStatusEnum::WAITING_CONFIRMATION;
        }

        return $status;
    }
}
