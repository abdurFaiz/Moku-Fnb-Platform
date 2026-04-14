<?php

namespace Database\Seeders;

use App\Enums\CustomerPointTypeEnum;
use App\Enums\OrderStatusEnum;
use App\Enums\RoleEnum;
use App\Models\CustomerProfile;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Outlet;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\User;
use App\Services\Api\PaymentService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserOrderSeeder extends Seeder
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@example.com',
                'phone' => '081234567890',
                'gender' => 1,
                'job' => 'Software Engineer',
                'date_birth' => '1990-05-15',
            ],
            [
                'name' => 'Andi Setiawan',
                'email' => 'andi.setiawan@example.com',
                'phone' => '08986754123',
                'gender' => 1,
                'job' => 'Desainer',
                'date_birth' => '1990-05-15',
            ],
            [
                'name' => 'Ilham',
                'email' => 'ilham@example.com',
                'phone' => '0864735821',
                'gender' => 1,
                'job' => 'Marketing',
                'date_birth' => '1990-05-15',
            ],
            [
                'name' => 'Dika',
                'email' => 'dika@example.com',
                'phone' => '0898234131',
                'gender' => 1,
                'job' => 'Marketing',
                'date_birth' => '1990-05-15',
            ],
            [
                'name' => 'Nisa',
                'email' => 'nisa@example.com',
                'phone' => '0878123921',
                'gender' => 2,
                'job' => 'Sales',
                'date_birth' => '1990-05-15',
            ],
            [
                'name' => 'Lisa',
                'email' => 'lisa@example.com',
                'phone' => '08413761623',
                'gender' => 2,
                'job' => 'Sales',
                'date_birth' => '1990-05-15',
            ],
            [
                'name' => 'Rizky Pratama',
                'email' => 'rizky.pratama@example.com',
                'phone' => '082134567890',
                'gender' => 1,
                'job' => 'Backend Developer',
                'date_birth' => '1988-07-22',
            ],
            [
                'name' => 'Sari Dewi',
                'email' => 'sari.dewi@example.com',
                'phone' => '083245678901',
                'gender' => 2,
                'job' => 'UI/UX Designer',
                'date_birth' => '1992-03-10',
            ],
            [
                'name' => 'Agus Wijaya',
                'email' => 'agus.wijaya@example.com',
                'phone' => '084356789012',
                'gender' => 1,
                'job' => 'Digital Marketing',
                'date_birth' => '1991-11-05',
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya.sari@example.com',
                'phone' => '085467890123',
                'gender' => 2,
                'job' => 'Content Creator',
                'date_birth' => '1993-09-18',
            ],
            [
                'name' => 'Bambang Sutejo',
                'email' => 'bambang.sutejo@example.com',
                'phone' => '086578901234',
                'gender' => 1,
                'job' => 'Sales Executive',
                'date_birth' => '1989-12-30',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.lestari@example.com',
                'phone' => '087689012345',
                'gender' => 2,
                'job' => 'Account Manager',
                'date_birth' => '1990-02-14',
            ],
            [
                'name' => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@example.com',
                'phone' => '088790123456',
                'gender' => 1,
                'job' => 'Product Manager',
                'date_birth' => '1987-08-25',
            ],
            [
                'name' => 'Fitri Handayani',
                'email' => 'fitri.handayani@example.com',
                'phone' => '089801234567',
                'gender' => 2,
                'job' => 'Business Analyst',
                'date_birth' => '1994-06-08',
            ],
            [
                'name' => 'Hadi Kurniawan',
                'email' => 'hadi.kurniawan@example.com',
                'phone' => '080912345678',
                'gender' => 1,
                'job' => 'Operations Manager',
                'date_birth' => '1986-04-12',
            ],
        ];

        try {
            DB::beginTransaction();

            // foreach ($users as $user) {
            //     $this->storeOrder($user);
            // }

            $this->storeOrder();

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    // public function storeOrder($userData)
    public function storeOrder()
    {
        // Find Spinocafe outlet
        $outlet = Outlet::where('slug', 'spinotek-coffee')->first();

        if (! $outlet) {
            throw new \Exception('Spinocafe outlet not found. Please run OutletSpinotekSeeder first.');
        }

        // Find QRIS payment method
        $paymentMethod = PaymentMethod::where('code', 'qris')->first();

        if (! $paymentMethod) {
            throw new \Exception('QRIS payment method not found. Please run PaymentMethodSeeder first.');
        }

        // Check if user already exists and has an order at this specific outlet
        // $existingUser = User::where('email', $userData['email'])
        //     ->whereHas('orders', function ($query) use ($outlet) {
        //         $query->where('outlet_id', $outlet->id);
        //     })
        //     ->first();

        // if ($existingUser) {
        //     // If user already exists, return existing user
        //     return $existingUser;
        // } else {
        // Create customer user if not exists
        // $user = User::updateOrCreate([
        //     'email' => $userData['email'],
        // ], [
        //     'name' => $userData['name'],
        //     'phone' => $userData['phone'],
        //     'password' => bcrypt('password'),
        // ]);
        // }

        $user = User::where('email', 'ardirizqiansyah@gmail.com')->first();

        // Assign customer role
        if (! $user->hasRole(RoleEnum::CUSTOMER)) {
            $user->assignRole(RoleEnum::CUSTOMER);
        }

        // Create customer profile
        // CustomerProfile::updateOrCreate([
        //     'user_id' => $user->id,
        // ], [
        //     'gender' => $userData['gender'],
        //     'job' => $userData['job'],
        //     'date_birth' => $userData['date_birth'],
        // ]);

        // Get available products from Spinocafe
        $products = Product::where('outlet_id', $outlet->id)
            ->where('is_published', 1)
            ->where('is_available', 1)
            ->get();

        if ($products->isEmpty()) {
            throw new \Exception('No products found for Spinocafe outlet. Please create products first.');
        }

        // Generate orders over 2 months (8 weeks)
        // 2-3 orders per week = 16-24 orders total
        $startDate = Carbon::now();
        $endDate = Carbon::now()->subMonths(2);
        // $startDate = Carbon::now()->subMonths(2);
        // $endDate = Carbon::now()->subMonths(12);

        // total weeks ago
        $totalWeeks = 8;
        $ordersCreated = 0;

        // Loop through each week
        for ($week = 0; $week < $totalWeeks; $week++) {
            // Randomly decide how many orders this week (3 or 5)
            $ordersThisWeek = rand(3, 5);

            for ($orderInWeek = 0; $orderInWeek < $ordersThisWeek; $orderInWeek++) {
                // Calculate order date
                // Start from now and go backwards
                $weeksAgo = $week;
                $daysIntoWeek = rand(0, 6); // Random day in the week
                $hoursInDay = rand(8, 20); // Random hour between 8 AM and 8 PM
                $minutes = rand(0, 59);

                $orderDate = Carbon::now()
                    ->subWeeks($weeksAgo)
                    ->subDays($daysIntoWeek)
                    ->setTime($hoursInDay, $minutes, 0);

                // Make sure we don't go beyond 2 months
                if ($orderDate->lt($endDate)) {
                    continue;
                }

                // Random number of products per order (2-4)
                $numProducts = rand(2, 4);
                $selectedProducts = $products->random(min($numProducts, $products->count()));

                // Calculate order totals
                $subTotal = 0;
                $orderProductsData = [];

                foreach ($selectedProducts as $product) {
                    $quantity = rand(1, 3);
                    $price = $product->price;
                    $total = $price * $quantity;
                    $subTotal += $total;

                    $orderProductsData[] = [
                        'product_id' => $product->id,
                        'user_id' => $user->id,
                        'price' => $price,
                        'quantity' => $quantity,
                        'extra_price' => 0,
                        'sub_total' => $total,
                        'total' => $total,
                        'note' => null,
                        'meta_data' => null,
                    ];
                }

                // Calculate tax (assuming 10% tax from outlet fee_tax or default)
                $taxRate = $outlet->fee_tax ?? 10;
                $tax = ($subTotal * $taxRate) / 100;
                $total = $subTotal + $tax;

                // get order with same date and completed status
                $orderNumber = Order::where('outlet_id', $outlet->id)
                    ->whereDate('created_at', $orderDate->toDateString())
                    ->whereIn('status', [OrderStatusEnum::COMPLETED, OrderStatusEnum::SUCCESS])
                    ->count();

                // Create order with default timestamps first
                $order = Order::create([
                    'user_id' => $user->id,
                    'outlet_id' => $outlet->id,
                    'sub_total' => $subTotal,
                    'discount' => 0,
                    'tax' => $tax,
                    'fee_service' => 0,
                    'spinofy_fee' => 0,
                    'total_fee_service' => 0,
                    'total' => $total,
                    'status' => OrderStatusEnum::COMPLETED,
                    'order_number' => $orderNumber,
                    'payment_method_id' => $paymentMethod->id,
                ]);

                $payMethod = $this->paymentService->calculateFeeService($order, $paymentMethod->id);
                if (! $payMethod['success']) {
                    throw new \Exception('Failed to calculate payment fee service.');
                }

                // add fee service to order
                $totalFeePayment = $payMethod['fee_service'];
                $totalSpinofyFee = $payMethod['spinofy_fee'];
                $totalOrder = ($order->sub_total + $order->tax - $order->discount) + $totalFeePayment + $totalSpinofyFee;
                $totalFeeService = $totalFeePayment + $totalSpinofyFee;

                // user meta data
                $userMetaData = [
                    'name' => $order->user->name,
                    'phone' => $order->user->phone,
                    'email' => $order->user->email,
                ];

                // Update timestamps to the desired date
                DB::table('orders')
                    ->where('id', $order->id)
                    ->update([
                        'fee_service' => $totalFeePayment,
                        'spinofy_fee' => $totalSpinofyFee,
                        'total_fee_service' => $totalFeeService,
                        'total' => $totalOrder,
                        'user_meta_data' => $userMetaData,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);

                // Create order products
                foreach ($orderProductsData as $orderProductData) {
                    $orderProduct = OrderProduct::create(array_merge($orderProductData, [
                        'order_id' => $order->id,
                    ]));

                    // Update timestamps for order product
                    DB::table('order_products')
                        ->where('id', $orderProduct->id)
                        ->update([
                            'created_at' => $orderDate,
                            'updated_at' => $orderDate,
                        ]);
                }

                // add point user
                $totalPoint = calculatePoints($order->total);

                if ($totalPoint > 0) {
                    $order->customerPoint()->create([
                        'outlet_id' => $order->outlet_id,
                        'user_id' => $order->user_id,
                        'point' => $totalPoint,
                        'type' => CustomerPointTypeEnum::CREDIT,
                        'info' => 'Pembelian Item di ' . $order->outlet->name,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);
                }

                $ordersCreated++;
            }
        }

        $this->command->info("Successfully created user '{$user->name}' with {$ordersCreated} orders at {$outlet->name} outlet.");
    }
}
