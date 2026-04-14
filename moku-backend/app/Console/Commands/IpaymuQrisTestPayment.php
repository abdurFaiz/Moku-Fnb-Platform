<?php

namespace App\Console\Commands;

use App\Services\Payment\IpayMuService;
use Illuminate\Console\Command;

class IpaymuQrisTestPayment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:ipaymu-qris-test-payment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // create ipaymu payment
            $ipaymuService = new IpayMuService();
            $payment = $ipaymuService->send('/payment/direct', [
                'name' => 'ardi',
                'phone' => '081234567890',
                'email' => 'user@gmail.com',
                'amount' => 1000,
                'notifyUrl' => route('webhook.payment.handler'),
                'referenceId' => '1',
                'paymentMethod' => 'qris',
                'paymentChannel' => 'mpm',
            ]);

        return $payment;
    }
}
