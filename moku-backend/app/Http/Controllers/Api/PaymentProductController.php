<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\OrderProduct;
use Illuminate\Http\Request;
use App\Enums\OrderStatusEnum;
use App\Helpers\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use App\Models\OrderProductVariant;
use App\Services\Api\OutletService;
use App\Http\Controllers\Controller;
use App\Services\Api\PaymentService;
use App\Services\Api\ProductService;
use App\Models\ProductAttributeValue;

class PaymentProductController extends Controller
{
    protected PaymentService $paymentService;
    protected ProductService $productService;
    protected OutletService $outletService;


    public function __construct(PaymentService $paymentService, ProductService $productService, OutletService $outletService)
    {
        $this->paymentService = $paymentService;
        $this->productService = $productService;
        $this->outletService = $outletService;
    }

    public function storeProduct(Request $request, Outlet $outlet)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|array',
            'variant_id.*' => 'nullable|exists:product_attribute_values,id',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        try {
            DB::beginTransaction();

            $product = Product::where('outlet_id', $outlet->id)
                ->find($request->product_id);

            if (!$product) {
                return ResponseFormatter::error('Product not found', [
                    'product_id' => $request->product_id,
                ], 404);
            }

            // check product available
            $productAvailable = $this->productService->checkProductAvailable($product);
            if ($productAvailable !== true) {
                return $productAvailable;
            }

            if (@$request->variant_id) {
                $variants = ProductAttributeValue::where('outlet_id', $outlet->id)
                    ->whereIn('id', @$request->variant_id)
                    ->get();
            } else {
                $variants = [];
            }

            $order = $this->paymentService->storeProduct($outlet, $product, $variants, $request->quantity, $request->note);

            DB::commit();

            // return order
            return ResponseFormatter::success([
                'message' => 'Order created successfully',
                'data' => $order,
            ], 'Successfully create order');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to create order');
        }
    }

    public function updateOrderProduct(Request $request, Outlet $outlet, OrderProduct $orderProduct)
    {
        $request->validate([
            'variant_id' => 'nullable|array',
            'variant_id.*' => 'nullable|exists:product_attribute_values,id',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        // find order
        $order = $orderProduct->order;

        // check order status
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('Order status is not pending', [
                'order' => $order,
            ]);
        }

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        try {
            DB::beginTransaction();

            $product = Product::where('outlet_id', $orderProduct->order->outlet_id)
                ->findOrFail($orderProduct->product_id);

            // check product available
            $productAvailable = $this->productService->checkProductAvailable($product);
            if ($productAvailable !== true) {
                return $productAvailable;
            }

            $variants = ProductAttributeValue::where('outlet_id', $orderProduct->order->outlet_id)
                ->whereIn('id', $request->variant_id)
                ->get();

            if ($variants->count() > 0) {
                // get total extra price variants
                $subTotalExtraPrice = $variants->sum('extra_price');
                $totalExtraPrice = $subTotalExtraPrice * $request->quantity;
                $totalProduct = $product->price * $request->quantity;

                // get total price order
                $totalPrice = $totalProduct + $totalExtraPrice;

                // check if tax outlet is not null or > 0, and add tax
                if (@$outlet->fee_tax && $outlet->fee_tax > 0) {
                    $tax = ($outlet->fee_tax / 100) * $totalPrice;
                    $totalPrice += $tax;
                } else {
                    $tax = 0;
                }

                // update order item
                $orderProduct->update([
                    'quantity' => $request->quantity,
                    'note' => $request->note,
                    'price' => $product->price,
                    'extra_price' => $subTotalExtraPrice,
                    'tax' => $tax,
                    'total' => $totalPrice,
                ]);

                // delete order product variant
                $orderProduct->orderProductVariants()->delete();

                // update order product variant
                foreach ($variants as $variant) {
                    OrderProductVariant::updateOrCreate([
                        'order_product_id' => $orderProduct->id,
                        'product_attribute_value_id' => $variant->id,
                    ], [
                        'price' => $variant->extra_price,
                    ]);
                }
            } else {
                // if no variant, set extra price to 0
                $subTotalExtraPrice = 0;
                $totalExtraPrice = 0;
                $totalProduct = $product->price * $request->quantity;

                // get total price order
                $totalPrice = $totalProduct + $totalExtraPrice;

                // update order item
                $orderProduct->update([
                    'quantity' => $request->quantity,
                    'note' => $request->note,
                    'price' => $product->price,
                    'extra_price' => $subTotalExtraPrice,
                    'total' => $totalPrice,
                ]);

                // delete order product variant
                $orderProduct->orderProductVariants()->delete();
            }

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

            $order->load([
                'orderProducts.product',
                'orderProducts.orderProductVariants.productAttributeValue',
            ]);
            DB::commit();

            // return order
            return ResponseFormatter::success([
                'order' => $order,
            ], 'Successfully update order');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to update order');
        }
    }

    public function updateQuantityOrderProduct(Request $request, Outlet $outlet, OrderProduct $orderProduct)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        // find order
        $order = $orderProduct->order;

        // check order status
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('Order status is not pending', [
                'order' => $order,
            ]);
        }

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        // check product available
        $product = Product::where('outlet_id', $orderProduct->order->outlet_id)
            ->findOrFail($orderProduct->product_id);
        $productAvailable = $this->productService->checkProductAvailable($product);
        if ($productAvailable !== true) {
            return $productAvailable;
        }

        try {
            DB::beginTransaction();

            // if quantity is 0, delete order product
            if ($request->quantity == 0) {
                $orderProduct->delete();
            } else {
                // get total product price
                $totalProduct = $orderProduct->price * $request->quantity;
                $totalExtraPrice = $orderProduct->extra_price * $request->quantity;
                $totalPrice = $totalProduct + $totalExtraPrice;

                // update order item
                $orderProduct->update([
                    'quantity' => $request->quantity,
                    'total' => $totalPrice,
                ]);
            }

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

            $order->load([
                'orderProducts.product',
                'orderProducts.orderProductVariants.productAttributeValue',
            ]);
            DB::commit();

            // return order
            return ResponseFormatter::success([
                'order' => $order,
            ], 'Successfully update order');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to update order');
        }
    }

    public function destroyProduct(Outlet $outlet, OrderProduct $orderProduct)
    {
        $order = Order::where('outlet_id', $outlet->id)
            ->findOrFail($orderProduct->order_id);

        // check order status
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('Order status is not pending', [
                'order' => $order,
            ]);
        }

        try {
            DB::beginTransaction();

            // delete order product variant
            $orderProduct->orderProductVariants()->delete();

            // delete order product
            $orderProduct->delete();

            // get all order product
            $orderProducts = $order->orderProducts()->get();

            if ($orderProducts->count() == 0) {
                $order->delete();

                $order = null;
            } else {
                $subTotal = $orderProducts->sum('total');
                $tax = ($outlet->fee_tax / 100) * $subTotal;
                $totalPrice = $subTotal + $tax;

                // update total order price
                $order->update([
                    'sub_total' => $subTotal,
                    'tax' => $tax,
                    'total' => $totalPrice,
                ]);

                $order->load([
                    'orderProducts.product',
                    'orderProducts.orderProductVariants.productAttributeValue',
                ]);
            }


            DB::commit();

            // return order
            return ResponseFormatter::success([
                'order' => $order,
                'orderProduct' => $orderProduct,
            ], 'Successfully delete order product');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to delete order product');
        }
    }
}
