<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'QRIS',
                'code' => 'qris',
                'channel' => 'mpm',                
                'percentage_fee' => 0.7,
                'is_published' => true,
            ]
        ];

        foreach ($paymentMethods as $paymentMethod) {
            PaymentMethod::updateOrCreate(
                [
                    'code' => $paymentMethod['code'],
                ],
                [
                    'name' => $paymentMethod['name'],
                    'channel' => $paymentMethod['channel'],
                    'percentage_fee' => $paymentMethod['percentage_fee'],
                    'is_published' => $paymentMethod['is_published'],
                ]
            );
        }
    }
}
