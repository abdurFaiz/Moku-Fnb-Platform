<?php

namespace App\Console\Commands;

use App\Enums\OrderStatusEnum;
use App\Models\OrderProduct;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;

class CustomerOrderComand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'customer-order-comand';

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
        $user = User::updateOrCreate([
            'email' => 'customer@spinocafe.com',
        ], [
            'name' => 'Customer',
            'password' => bcrypt('password'),
        ]);

        $user->assignRole('customer');

        // get oultet spinocafe
        $outlet = Outlet::find(1);

        // get random product spinocafe and store to order
        $products = Product::where('outlet_id', $outlet->id)->limit(3)->get();

        foreach ($products as $product) {
            $subTotal = $product->price;
            $tax = $subTotal * ($outlet->fee_tax / 100);
            $total = $subTotal + $tax;

            $order = $outlet->orders()->create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'sub_total' => $subTotal,
                'tax' => $tax,
                'total' => $total,
                'fee_service' => $outlet->fee_service,
                'status' => OrderStatusEnum::WAITING_CONFIRMATION,
            ]);

            // create product order item
            $orderProduct = OrderProduct::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'user_id' => $user->id,
                'price' => $product->price,
                'quantity' => 1,
                'total' => $product->price,
                'note' => 'Command ' . $product->name,
            ]);
        }
    }
}
