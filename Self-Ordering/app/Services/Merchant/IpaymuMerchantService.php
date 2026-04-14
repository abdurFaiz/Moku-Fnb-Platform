<?php

namespace App\Services\Merchant;

use App\Enums\OutletServiceFeeConfigEnum;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\SplitPaymentLog;
use App\Services\Payment\IpayMuService;

class IpaymuMerchantService
{
    public function registerMerchant(Outlet $outlet)
    {
        // create ipaymu merchant
        $ipaymuService = new IpayMuService;
        $merchant = $ipaymuService->send('/register', [
            'name' => $outlet->name,
            'phone' => $outlet->phone,
            'email' => $outlet->email,
            'password' => stripZeroPhoneNumber($outlet->phone),
        ]);

        if (! isset($merchant['Status']) || $merchant['Status'] != 200) {
            return [
                'status' => false,
                'message' => $merchant['Message'],
            ];
        }

        // update data va outlet
        $outlet->update([
            'va_name' => $merchant['Data']['VaName'],
            'va_number' => $merchant['Data']['Va'],
        ]);

        return [
            'status' => true,
            'message' => 'Merchant created successfully',
        ];
    }

    public function spiltPaymentMerchant(Outlet $outlet, Order $order)
    {
        $order->load('splitPayment');

        $amount = $order->splitPayment->outlet;

        // check servic fee config outlet
        if ($outlet->service_fee_config == OutletServiceFeeConfigEnum::PAID_BY_CUSTOMER) {
            $amount += config('ipaymu.split_fee');
        }

        // set split payment to ipaymu
        $ipaymuService = new IpayMuService;
        $splitPayment = $ipaymuService->send('/transferva', [
            'sender' => env('IPAYMU_VA'),
            'receiver' => $outlet->va_number,
            'amount' => $amount,
            'relatedId' => $order->meta_data['TransactionId'],
            'referenceId' => $order->id,
            'notes' => 'Pembayaran Order Kode ' . $order->code,
        ]);

        if (! isset($splitPayment['Status']) || $splitPayment['Status'] != 200) {
            return [
                'status' => false,
                'message' => $splitPayment['Message'],
            ];
        }

        // save to split payment logs
        SplitPaymentLog::create([
            'order_id' => $order->id,
            'split_payment_id' => $order->splitPayment->id,
            'raw_response' => $splitPayment,
        ]);

        return [
            'status' => true,
            'message' => 'Split payment created successfully',
        ];
    }
}
