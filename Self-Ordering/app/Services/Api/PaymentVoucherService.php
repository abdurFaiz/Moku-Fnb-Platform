<?php

namespace App\Services\Api;

use App\Enums\OrderStatusEnum;
use App\Enums\OutletServiceFeeConfigEnum;
use App\Models\Order;
use App\Models\Product;
use App\Models\UserVoucher;
use App\Enums\VoucherTypeEnum;
use App\Helpers\ResponseFormatter;
use App\Enums\VoucherPriceTypeEnum;
use Illuminate\Support\Facades\Http;

class PaymentVoucherService
{
    public function validateVoucher($voucher, $order)
    {
        $productIds = $order->orderProducts->pluck('product_id')->toArray();
        $total = $order->total;

        return $this->validateVoucherGeneral($voucher, $productIds, $total);
    }

    public function validateVoucherGeneral($voucher, $productIds, $total)
    {
        // check voucher can use
        if (!$voucher) {
            return ResponseFormatter::warning('Voucher tidak ditemukan', [
                'voucher' => $voucher,
            ]);
        }

        if (@$voucher?->voucherProducts->count() > 0) {
            // check same product
            $voucherProducts = $voucher->voucherProducts->pluck('product_id')->toArray();

            if (count(array_intersect($productIds, $voucherProducts)) == 0) {
                return ResponseFormatter::warning('Voucher tidak dapat digunakan karena tidak memiliki produk yang sama', [
                    'voucher' => $voucher,
                ]);
            }
        }

        // check miniumum order price
        if ($voucher->min_transaction > $total) {
            // count difference price
            $differencePrice = $voucher->min_transaction - $total;

            return ResponseFormatter::warning('Silahkan belanja sebesar Rp. ' . number_format($differencePrice, 0, ',', '.') . ' lagi, agar voucher dapat digunakan', [
                'voucher' => $voucher,
                'difference_price' => $differencePrice,
            ]);
        }

        return ResponseFormatter::success([
            'voucher' => $voucher,
        ], 'Voucher valid');
    }

    public function validateVoucherUsage($voucher, $userId = null)
    {
        // check type voucher
        if ($voucher->type == VoucherTypeEnum::PRIVATE) {
            // check user voucher for private vouchers
            if ($userId) {
                $userVoucher = UserVoucher::where('user_id', $userId)
                    ->where('voucher_id', $voucher->id)
                    ->where('is_used', false)
                    ->where('expired_at', '>', now())
                    ->first();

                if (!$userVoucher) {
                    return ResponseFormatter::warning('Voucher tidak ditemukan atau sudah digunakan', [
                        'voucher' => $voucher,
                    ]);
                }
            }
        } elseif ($voucher->type == VoucherTypeEnum::PUBLIC) {
            // check max usage
            if ($voucher->max_usage > 0) {
                $usageCount = Order::where('voucher_id', $voucher->id)->count();

                if ($voucher->max_usage <= $usageCount) {
                    return ResponseFormatter::warning('Voucher tidak dapat digunakan karena sudah mencapai batas maksimal', [
                        'voucher' => $voucher,
                        'max_usage' => $voucher->max_usage,
                        'current_usage' => $usageCount,
                    ]);
                }
            }
        }

        return ResponseFormatter::success([
            'voucher' => $voucher,
        ], 'Voucher usage valid');
    }

    protected function countTotalDiscountByPriceType($voucher, $order, $voucherProductIds)
    {
        // prepare items for common calculation
        // each item must have 'id' (product_id) and 'price'
        $items = $order->orderProducts->map(function ($op) {
            return (object) [
                'id' => $op->product_id,
                'price' => $op->price
            ];
        });

        return $this->calculateDiscountCommon($voucher, $items);
    }

    public function calculateDiscountCommon($voucher, $items, $selectedProductId = null)
    {
        // check product in voucher
        if (@$voucher?->voucherProducts->count() > 0) {
            // get voucher product ids
            $voucherProductIds = $voucher->voucherProducts->pluck('product_id')->toArray();

            // filter products that are in voucher
            $applicableItems = $items->filter(function ($item) use ($voucherProductIds) {
                return in_array($item->id, $voucherProductIds);
            });

            // if products > 0 get product with highest price
            if ($selectedProductId) {
                $selectedItem = $applicableItems->where('id', $selectedProductId)->first();
                $highestPrice = $selectedItem ? $selectedItem->price : 0;
            } else {
                $highestPrice = $applicableItems->max('price');
            }

            // calculate price of applicable products
            $productPrice = $highestPrice;
        } else {
            // if no specific products, use subtotal
            if ($selectedProductId) {
                $selectedItem = $items->where('id', $selectedProductId)->first();
                $productPrice = $selectedItem ? $selectedItem->price : 0;
            } else {
                $productPrice = $items->max('price');
            }
        }

        // check type discount voucher
        if ($voucher->price_type == VoucherPriceTypeEnum::PERCENT) {
            // count discount price
            $discountPrice = $productPrice * $voucher->discount_percent / 100;
        } elseif ($voucher->price_type == VoucherPriceTypeEnum::FIXED) {
            // count discount price
            $discountPrice = $productPrice - $voucher->discount_fixed;

            // check discount price dont higher than product price
            if ($discountPrice < 0) {
                $discountPrice = $productPrice;
            } else {
                $discountPrice = $voucher->discount_fixed;
            }
        }

        // return discount price
        return $discountPrice ?? 0;
    }

    protected function updateOrder($order, $voucher, $discountPrice, $outlet)
    {
        // count total after discount
        $totalAfterDiscount = $order->sub_total - $discountPrice;

        if ($order->service_fee_config == OutletServiceFeeConfigEnum::PAID_BY_CUSTOMER && $totalAfterDiscount > 0) {
            $totalAfterDiscount += $order->fee_service;
        }

        // count tax order
        if ($outlet->fee_tax > 0) {
            $taxOrder = $totalAfterDiscount * $outlet->fee_tax / 100;
        } else {
            $taxOrder = 0;
        }

        // count total order
        $totalOrder = $totalAfterDiscount + $taxOrder;

        // update order
        $order->update([
            'total' => $totalOrder,
            'tax' => $taxOrder,
            'voucher_id' => $voucher->id,
            'discount' => $discountPrice,
        ]);
    }

    public function useVoucher($voucher, $order, $outlet, $selectedProductId = null)
    {
        // validate usage
        if ($voucher->type == VoucherTypeEnum::PRIVATE) {
            $response = $this->validateVoucherUsage($voucher, auth()->user()->id);
            if ($response->getStatusCode() != 200) {
                return $response;
            }
        } elseif ($voucher->type == VoucherTypeEnum::PUBLIC) {
            $response = $this->validateVoucherUsage($voucher);
            if ($response->getStatusCode() != 200) {
                return $response;
            }
        }

        // define items
        $items = $order->orderProducts->map(function ($op) {
            return (object) [
                'id' => $op->product_id,
                'price' => $op->price
            ];
        });

        // count total discount price
        $discountPrice = $this->calculateDiscountCommon($voucher, $items, $selectedProductId);

        // update order
        $this->updateOrder($order, $voucher, $discountPrice, $outlet);

        // if private, mark voucher as used
        if ($voucher->type == VoucherTypeEnum::PRIVATE) {
            $userVoucher = UserVoucher::where('user_id', auth()->user()->id)
                ->where('voucher_id', $voucher->id)
                ->where('is_used', false)
                ->where('expired_at', '>', now())
                ->first();

            if ($userVoucher) {
                $userVoucher->update(['is_used' => true]);
            }
        }

        return ResponseFormatter::success([
            'voucher' => $voucher,
        ], 'Voucher berhasil digunakan');
    }

    public function useInputCodeVoucher($voucher, $order, $outlet, $selectedProductId = null)
    {
        if ($voucher->type != VoucherTypeEnum::PRIVATE) {
            return ResponseFormatter::warning('Voucher tidak ditemukan', [
                'voucher' => $voucher,
            ]);
        }

        // define items
        $items = $order->orderProducts->map(function ($op) {
            return (object) [
                'id' => $op->product_id,
                'price' => $op->price
            ];
        });

        // count total discount price
        $discountPrice = $this->calculateDiscountCommon($voucher, $items, $selectedProductId);

        // update order
        $this->updateOrder($order, $voucher, $discountPrice, $outlet);

        return ResponseFormatter::success([
            'voucher' => $voucher,
        ], 'Voucher berhasil digunakan');
    }

    public function removeVoucher($order, $outlet)
    {
        // check order status
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('Order status is not pending', [
                'order' => $order,
            ]);
        }

        // check voucher is used
        if (!$order->voucher_id) {
            return ResponseFormatter::warning('Order tidak memiliki voucher', [
                'order' => $order,
            ]);
        }

        // update user voucher
        $userVoucher = UserVoucher::where('user_id', auth()->user()->id)
            ->where('voucher_id', $order->voucher_id)
            ->where('is_used', true)
            ->where('expired_at', '>', now())
            ->first();

        if (@$userVoucher) {
            $userVoucher->update([
                'is_used' => false,
            ]);
        }

        // count total order
        $totalOrder = $order->sub_total + $order->fee_service;

        // count tax order
        if ($outlet->fee_tax > 0) {
            $taxOrder = $totalOrder * $outlet->fee_tax / 100;
        } else {
            $taxOrder = 0;
        }

        // update order
        $order->update([
            'total' => $order->sub_total + $order->fee_service + $order->tax,
            'tax' => $taxOrder,
            'voucher_id' => null,
            'discount' => null,
        ]);

        return ResponseFormatter::success([
            'order' => $order,
        ], 'Successfully remove voucher');
    }
}
