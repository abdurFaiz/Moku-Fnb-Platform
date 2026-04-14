<?php

namespace App\Services\Api;

use App\Enums\CustomerPointTypeEnum;
use App\Enums\OrderStatusEnum;
use App\Enums\OutletServiceFeeConfigEnum;
use App\Events\NewOrderLineCreatedEvent;
use App\Helpers\ResponseFormatter;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\OrderProductVariant;
use App\Models\PaymentMethod;
use App\Models\PaymentLog;
use App\Models\SplitPayment;
use App\Models\TableNumber;
use App\Services\Payment\IpayMuService;
use App\Services\Payment\Midtrans;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendFeedbackRequestJob;
use App\Services\Payment\FeedbackService;

class PaymentService
{
    protected FeedbackService $feedbackService;

    public function __construct(FeedbackService $feedbackService)
    {
        $this->feedbackService = $feedbackService;
    }

    public function calculateFeeService($order, $paymentMethodId)
    {
        $paymentMethod = PaymentMethod::find($paymentMethodId);

        if (! $paymentMethod) {
            return ResponseFormatter::error('Payment method not found', [
                'payment_method_id' => $paymentMethodId,
            ], 400);
        }

        $totalOrder = $order->sub_total + $order->tax - $order->discount;

        if (@$paymentMethod->percentage_fee) {
            $fee = $totalOrder * ($paymentMethod->percentage_fee / 100);

            // bulatkan fee mejadi kelipatan 50, misal 19 -> 50, 108 -> 150
            $fee = max(50, ceil($fee / 50) * 50);
        }

        // hitung spinofy fee kelipatan 100
        $spinofyFee = max(100, ceil($totalOrder / 10000) * 100);

        return [
            'success' => true,
            'payment_method' => $paymentMethod,
            'spinofy_fee' => $spinofyFee,
            'fee_service' => $fee,
            'total_order' => $totalOrder,
        ];
    }

    public function storeProduct($outlet, $product, $variants, $quantity, $note = null)
    {
        // get total extra price variants
        if (count($variants) > 0) {
            $subTotalExtraPrice = @$variants->sum('extra_price');
        } else {
            $subTotalExtraPrice = 0;
        }
        $totalExtraPrice = $subTotalExtraPrice * $quantity;
        $totalProduct = $product->price * $quantity;

        // get total price order
        $subTotalOrder = $totalProduct + $totalExtraPrice;

        // check if tax outlet is not null or > 0, and add tax
        if (@$outlet->fee_tax && $outlet->fee_tax > 0) {
            $tax = ($outlet->fee_tax / 100) * $subTotalOrder;
            $totalPrice = $subTotalOrder + $tax;
        } else {
            $tax = 0;
            $totalPrice = $subTotalOrder;
        }

        // check order user if already have order pending
        $orderPending = $outlet->orders()
            ->where('user_id', auth()->user()->id)
            ->where('status', OrderStatusEnum::PENDING)
            ->where('outlet_id', $outlet->id)
            ->first();

        if ($orderPending) {
            $order = $orderPending;
        } else {
            // create order
            $order = $outlet->orders()->create([
                'user_id' => auth()->user()->id,
                'outlet_id' => $outlet->id,
                'sub_total' => $subTotalOrder,
                'tax' => $tax,
                'total' => $totalPrice,
                'status' => OrderStatusEnum::PENDING,
            ]);
        }

        $subTotalProudct = $product->price + $subTotalExtraPrice;

        // create order item
        $orderProduct = OrderProduct::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'user_id' => auth()->user()->id,
            'quantity' => $quantity,
            'note' => $note,
            'price' => $product->price,
            'extra_price' => $subTotalExtraPrice,
            'sub_total' => $subTotalProudct,
            'total' => $subTotalOrder,
            'meta_data' => [
                'product_name' => $product->name,
                'product_price' => $product->price,
            ],
        ]);

        // crate order product variant
        foreach ($variants as $variant) {
            OrderProductVariant::create([
                'order_product_id' => $orderProduct->id,
                'product_attribute_value_id' => $variant->id,
                'price' => $variant->extra_price,
            ]);
        }

        // if order pending, update total
        if ($orderPending) {
            // get all order product
            $orderProducts = $order->orderProducts()->get();
            $subTotal = $orderProducts->sum('total');
            $tax = ($outlet->fee_tax / 100) * $subTotal;
            $totalPrice = $subTotal + $tax;

            // update total order price
            $order->update([
                'sub_total' => $subTotal,
                'tax' => $tax,
                'total' => $totalPrice,
            ]);
        }

        $order->load([
            'orderProducts.product',
            'orderProducts.orderProductVariants.productAttributeValue',
        ]);
        $order->append('status_label');

        return $order;
    }

    public function calculateOrder($order, $outlet, $paymentMethod, $tableNumber = null)
    {
        $order->load('user');

        // add fee service to order
        $totalFeePayment = $paymentMethod['fee_service'];
        $totalSpinofyFee = $paymentMethod['spinofy_fee'];
        $totalSplitFee = config('ipaymu.split_fee');

        // check servic fee config outlet
        if ($outlet->service_fee_config == OutletServiceFeeConfigEnum::PAID_BY_OUTLET) {
            $totalServicePayment = 0;
        } elseif ($outlet->service_fee_config == OutletServiceFeeConfigEnum::PAID_BY_CUSTOMER) {
            $totalServicePayment = $totalFeePayment + $totalSpinofyFee + $totalSplitFee;
        }

        $totalOrder = ($order->sub_total + $order->tax - $order->discount) + $totalServicePayment;

        // user meta data
        $userMetaData = [
            'name' => $order->user->name,
            'phone' => $order->user->phone,
            'email' => $order->user->email,
        ];

        // update order
        $order->update([
            'fee_service' => $totalFeePayment,
            'spinofy_fee' => $totalSpinofyFee,
            'total_fee_service' => $totalFeePayment + $totalSplitFee,
            'total' => $totalOrder,
            'status' => OrderStatusEnum::WAITING_CONFIRMATION,
            'table_number_id' => @$tableNumber ? $tableNumber->id : null,
            'payment_method_id' => $paymentMethod['payment_method']->id,
            'user_meta_data' => $userMetaData,
        ]);
        $order->append('status_label');

        // store split payment order
        $this->storeSplitPayment($order);

        return $order;
    }

    public function storeSplitPayment($order)
    {
        $totalOutletSplit = $order->total - $order->total_fee_service - $order->spinofy_fee;

        $splitPayment = SplitPayment::create([
            'order_id' => $order->id,
            'outlet_id' => $order->outlet_id,
            'spinofy' => $order->spinofy_fee,
            'payment_service' => $order->total_fee_service,
            'outlet' => $totalOutletSplit,
        ]);
    }

    public function getTableNumber($outletId, $tableNumberId)
    {
        if (!$tableNumberId) {
            return null;
        }

        return TableNumber::where('outlet_id', $outletId)
            ->where('id', $tableNumberId)
            ->firstOrFail();
    }

    public function processIpaymuPayment($order, $paymentMethod)
    {
        try {
            // create ipaymu payment
            $ipaymuService = new IpayMuService;
            $payment = $ipaymuService->send('/payment/direct', [
                'name' => $order->user->name,
                'phone' => @$order?->user?->phone ?? env('ADMIN_NUMBER'),
                'email' => $order->user->email,
                'amount' => $order->total,
                'notifyUrl' => route('webhook.payment.handler'),
                'referenceId' => $order->id,
                'paymentMethod' => $paymentMethod->code,
                'paymentChannel' => $paymentMethod->channel,
                // 'paymentMethod' => 'cc',
                // 'paymentChannel' => 'cc',
            ]);

            // check payment status
            if (! isset($payment['Status']) || $payment['Status'] != 200) {
                Log::error('IpayMu payment creation failed: ' . ($payment['Message'] ?? 'Unknown error'), ['order_id' => $order->id, 'payment_response' => $payment]);

                // add payment log
                PaymentLog::create([
                    'status' => 'failed',
                    'payment_type' => $paymentMethod->channel,
                    'order_id' => $order->id,
                    'raw_response' => $payment,
                ]);

                $errorMessage = $payment['Message'] ?? 'Failed to create payment with IpayMu.';
                $statusCode = $payment['Status'] ?? 500;

                return [
                    'success' => false,
                    'response' => ResponseFormatter::warning($errorMessage, $payment, $statusCode)
                ];
            }

            // create payment log
            $order->paymentLogs()->create([
                'status' => 'pending',
                'payment_type' => $paymentMethod->channel,
                'order_id' => $order->id,
                'raw_response' => $payment,
            ]);

            // update meta data order
            $order->update([
                'meta_data' => [
                    'Via' => $payment['Data']['Via'],
                    'TransactionId' => $payment['Data']['TransactionId']
                ]
            ]);

            return [
                'success' => true,
                'payment' => $payment
            ];
        } catch (\GuzzleHttp\Exception\ConnectException $e) {
            Log::error('IpayMu service timeout or connection error for order ' . $order->id . ': ' . $e->getMessage());

            return [
                'success' => false,
                'response' => ResponseFormatter::error('IpayMu service timeout or connection error: ' . $e->getMessage(), 'IpayMu Service Error', 504)
            ];
        } catch (\Throwable $e) {
            Log::error('An unexpected error occurred with IpayMu service for order ' . $order->id . ': ' . $e->getMessage());

            return [
                'success' => false,
                'response' => ResponseFormatter::error('An unexpected error occurred with IpayMu service: ' . $e->getMessage(), 'IpayMu Service Error', 500)
            ];
        }
    }

    public function processMidtransPayment($request, $order, $paymentMethod)
    {
        try {
            $midtrans = new Midtrans;
            $response = $midtrans->request($request, $order, $paymentMethod->code);

            if (isset($response['status']) && in_array($response['status'], [200, 201])) {
                return [
                    'success' => true,
                    'payment' => $response
                ];
            } else {
                return [
                    'success' => false,
                    'response' => ResponseFormatter::error($response, 'Failed to pay order')
                ];
            }
        } catch (\Throwable $th) {
            return [
                'success' => false,
                'response' => ResponseFormatter::error($th->getMessage(), 'Failed to store order')
            ];
        }
    }

    public function processSuccessOrder($order)
    {
        // count total order in this day
        $totalOrder = Order::where('outlet_id', $order->outlet_id)
            ->whereIn('status', [OrderStatusEnum::SUCCESS, OrderStatusEnum::COMPLETED])
            ->whereDate('created_at', now()->toDateString())
            ->where('id', '!=', $order->id)
            ->count() + 1;

        $order->update([
            'status' => OrderStatusEnum::SUCCESS,
            'order_number' => $totalOrder,
            'created_at' => now(),

            // update fee service to 0 (null)
            'fee_service' => null,
            'spinofy_fee' => null,
            'total_fee_service' => null,
        ]);

        // add point user
        $totalPoint = calculatePoints($order->total);

        if ($totalPoint > 0) {
            $order->customerPoint()->create([
                'outlet_id' => $order->outlet_id,
                'user_id' => $order->user_id,
                'point' => $totalPoint,
                'type' => CustomerPointTypeEnum::CREDIT,
                'info' => 'Pembelian Item di ' . $order->outlet->name,
            ]);
        }

        broadcast(new NewOrderLineCreatedEvent($order->fresh()))->toOthers();

        // Create feedback data (questions, etc.) - Frequency check is inside service
        $feedback = $this->feedbackService->createFeedback($order);

        if ($feedback) {
            // Send feedback email request delayed by 2 hours
            SendFeedbackRequestJob::dispatch($order, $feedback)->delay(now()->addHours(2));
        }
    }

    public function handleFreeOrder($order)
    {
        // update split payment to 0
        $order->splitPayment()->update([
            'spinofy' => 0,
            'payment_service' => 0,
            'outlet' => 0,
        ]);

        $this->processSuccessOrder($order);
    }
}
