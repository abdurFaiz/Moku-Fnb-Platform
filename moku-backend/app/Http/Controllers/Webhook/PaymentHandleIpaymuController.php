<?php

namespace App\Http\Controllers\Webhook;

use App\Enums\CustomerPointTypeEnum;
use App\Enums\OrderStatusEnum;
use App\Events\NewOrderLineCreatedEvent;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentLog;
use App\Services\Api\PaymentService;
use App\Services\Merchant\IpaymuMerchantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentHandleIpaymuController extends Controller
{
    protected PaymentService $paymentService;
    protected IpaymuMerchantService $ipaymuMerchantService;

    public function __construct(PaymentService $paymentService, IpaymuMerchantService $ipaymuMerchantService)
    {
        $this->paymentService = $paymentService;
        $this->ipaymuMerchantService = $ipaymuMerchantService;
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

        try {
            DB::beginTransaction();

            // get Order
            $order = $this->getOrder($data['reference_id']);

            if (! $order) {
                return ResponseFormatter::warning('order not found', '', 404);
            }

            // order status check
            if ($order->status != OrderStatusEnum::WAITING_CONFIRMATION) {
                return ResponseFormatter::warning('order status not waiting confirmation', '', 400);
            }

            // get status ipaymu
            $status = $this->getStatusIpaymu($data);

            $order->update([
                'status' => $status,
                'created_at' => now(),
            ]);
            $order->append('status_label');

            // add payment log order
            PaymentLog::create([
                'status' => $this->getStatusIpaymuForPaymentLog($data),
                'payment_type' => $data['channel'],
                'order_id' => $order->id,
                'raw_response' => $data,
            ]);

            if ($status == OrderStatusEnum::SUCCESS) {
                // process success order using shared service logic
                $this->paymentService->processSuccessOrder($order);
            }

            // store split payment
            $merchantSplit = $this->ipaymuMerchantService->spiltPaymentMerchant($order->outlet, $order);
            if (! $merchantSplit['status']) {
                return [
                    'success' => false,
                    'response' => ResponseFormatter::error('Ipaymu Split Payment error: ' . $merchantSplit['message'], 'Ipaymu Service Error')
                ];
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
            'reference_id' => 'required',
            'status_code' => 'required',
            'via' => 'required',
            'channel' => 'required',
            'amount' => 'required',
            'trx_id' => 'required',
            'status' => 'required',
        ];
    }

    /**
     * Get single order
     *
     * @param  string  $orderId
     */
    private function getOrder($orderId)
    {
        return Order::where('id', $orderId)->first();
    }

    /**
     * Get status ipaymu
     */
    private function getStatusIpaymu($data)
    {
        $status = OrderStatusEnum::PENDING;
        $transactionStatus = $data['status_code'];

        if ($transactionStatus == 0) {
            $status = OrderStatusEnum::WAITING_CONFIRMATION;
        } elseif ($transactionStatus == 1) {
            $status = OrderStatusEnum::SUCCESS;
        } elseif ($transactionStatus == 2) {
            $status = OrderStatusEnum::CANCEL;
        } else {
            $status = OrderStatusEnum::FAILED;
        }

        return $status;
    }

    public function getStatusIpaymuForPaymentLog($data)
    {
        $status = $data['status_code'];

        if ($status == 0) {
            $status = 'pending';
        } elseif ($status == 1) {
            $status = 'settlement';
        } elseif ($status == 2 || $status == 3) {
            $status = 'cancel';
        } elseif ($status == 6) {
            $status = 'waiting';
        } else {
            $status = 'failed';
        }

        return $status;
    }
}
