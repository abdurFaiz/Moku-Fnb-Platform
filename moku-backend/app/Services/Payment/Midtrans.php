<?php

namespace App\Services\Payment;

use App\Helpers\GeneratingHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class Midtrans
{
    protected $serverKey; // midtrans server key
    protected $url; // midtrans url
    protected $authorization;

    /**
     * Instantiate a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->serverKey = base64_encode(config('services.midtrans.server_key') . ':'); // encode to base 64
        $this->url = config('services.midtrans.url') . '/charge';
        $this->authorization = [
            'Authorization' => 'Basic ' . $this->serverKey,
        ];
    }

    /**
     * Fungsi untuk request ke midtrans core api
     */
    public function request($request, $order, $payment_type)
    {
        $data = [
            'order' => $order,
            'request' => $request,
        ];

        // check payment type
        if ($payment_type == 'qris') {
            // return $this->body($data, 'qris');
            $response = Http::acceptJson()->withHeaders($this->authorization)->post($this->url, $this->body($data, 'qris'));

            if (!in_array($response->json()['status_code'], [200, 201])) {
                return $response->json();
            }
        } else {
            // update code order
            $this->updateCodeOrder($order);

            return [
                'status' => 404,
                'order' => $order,
            ];
        }

        // return if ok
        if ($response->ok()) {
            // create payment log
            if (in_array($response->json()['status_code'], [200, 201])) {
                $order->paymentLogs()->create([
                    'status' => $response->json()['transaction_status'],
                    'payment_type' => $response->json()['payment_type'],
                    'raw_response' => $response->json(),
                ]);
            }

            return [
                'status' => $response->json()['status_code'],
                'message' => $response->body(),
                'order' => $order,
            ];
        } else {
            // delete order
            $this->updateCodeOrder($order);

            return [
                'status_code' => $response->status(),
                'message' => $response->body(),
            ];
        }
    }

    /**
     * Set request body
     */
    private function body($data, $payment_type)
    {
        $order = $data['order'];
        $request = $data['request'];

        // $callback_url = route('user.payment.index', $order->code);

        $attr = [
            'payment_type' => $payment_type,
            'transaction_details' => [
                'order_id' => $order->code,
                'gross_amount' => $order->total,
            ],
        ];

        // E-Money
        if (in_array($payment_type, ['gopay', 'qris', 'shopeepay'])) {
            $attr[$payment_type] = [
                'enable_callback' => false,
                // 'callback_url' => $callback_url,
            ];
        }

        // set item details
        $attr['item_details'] = [];
        $dataProductId = [];
        foreach ($data['order']->orderProducts as $item) {
            array_push($attr['item_details'], [
                'id' => $item->product_id,
                'name' => $item->meta_data['product_name'],
                'price' => $item->sub_total,
                'quantity' => $item->quantity,
            ]);

            // add product id to data product id
            array_push($dataProductId, $item->product_id);
        }

        // add fee service to item
        if ($order->total_fee_service) {
            array_push($attr['item_details'], [
                'id' => 0,
                'name' => 'Biaya Layanan',
                'price' => $order->total_fee_service,
                'quantity' => 1,
            ]);

            // add product id to data product id
            array_push($dataProductId, 0);
        }

        // add tax
        if ($order->tax) {
            array_push($attr['item_details'], [
                'id' => $this->generateUniqueId($dataProductId),
                'name' => 'Biaya Pajak',
                'price' => $order->tax,
                'quantity' => 1,
            ]);
        }
        
        // add discount
        if ($order->discount) {
            array_push($attr['item_details'], [
                'id' => $this->generateUniqueId($dataProductId),
                'name' => 'Diskon Voucher',
                'price' => -($order->discount),
                'quantity' => 1,
            ]);
        }

        // set customer details
        $attr['customer_details'] = [
            'first_name' => str()->substr($order->user_meta_data['name'], 0, 50),
            'email' => $order->user_meta_data['email'],
        ];

        return $attr;
    }

    /**
     * Delete Order
     */
    private function updateCodeOrder($order)
    {
        // delete order
        if ($order) {
            $order->update([
                'code' => GeneratingHelper::generateCode('orders'),
            ]);
        }
    }

    /**
     * Generate unique id
     */
    private function generateUniqueId($dataProductId)
    {
        $id = mt_rand(0, 100);
        while (in_array($id, $dataProductId)) {
            $id = mt_rand(0, 100);
        }
        return $id;
    }
}
