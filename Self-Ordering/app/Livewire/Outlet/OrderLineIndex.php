<?php

namespace App\Livewire\Outlet;

use App\Enums\OrderStatusEnum;
use App\Events\OrderCompletedEvent;
use App\Models\Order;
use App\Models\Outlet;
use App\Services\Payment\FeedbackService;
use App\Jobs\SendFeedbackRequestJob;
use Livewire\Attributes\On;
use Livewire\Component;

class OrderLineIndex extends Component
{
    public $outlet;

    public $status = OrderStatusEnum::SUCCESS;

    public ?Order $selectedOrder = null;

    public $orderLines = [];

    protected $listeners = [
        'orderDetailModalClosed' => 'closeOrderDetail',
        'new-order-line-created' => 'handleNewOrderLineCreated',
    ];

    public function render()
    {
        $this->loadOrderLines();

        $categories = [
            [
                'id' => OrderStatusEnum::SUCCESS,
                'name' => 'New Order',
            ],
            [
                'id' => OrderStatusEnum::COMPLETED,
                'name' => 'Completed Order',
            ],
        ];

        $data = [
            'status' => $this->status,
            'orderLines' => $this->orderLines,
            'categories' => $categories,
            'selectedOrder' => $this->selectedOrder,
        ];

        return view('livewire.outlet.order-line-index', $data);
    }

    protected function loadOrderLines(): void
    {
        $this->orderLines = $this->outlet->orders()
            ->with([
                'user',
                'tableNumber',
                'orderProducts.product',
                'orderProducts.orderProductVariants.productAttributeValue',
            ])
            ->withCount([
                'orderProducts',
            ])
            ->filter([
                'status' => $this->status,
            ])
            ->whereDate('created_at', now()->toDateString())
            ->latest()
            ->get();
    }

    public function mount(Outlet $outlet)
    {
        $this->outlet = $outlet;
    }

    public function setStatus($status): void
    {
        $status = (int) $status;

        if (! OrderStatusEnum::hasValue($status)) {
            return;
        }

        $this->status = $status;
    }

    public function completeOrder(int $orderId): void
    {
        $order = Order::query()
            ->where('outlet_id', $this->outlet->id)
            ->findOrFail($orderId);

        if ($order->status !== OrderStatusEnum::SUCCESS) {
            return;
        }

        $order->update([
            'status' => OrderStatusEnum::COMPLETED,
        ]);

        if ($this->selectedOrder?->id === $order->id) {
            $this->selectedOrder = $this->outlet->orders()
                ->with([
                    'user',
                    'tableNumber',
                    'orderProducts.product',
                    'orderProducts.orderProductVariants.productAttributeValue.productAttribute',
                ])
                ->withCount(['orderProducts'])
                ->find($order->id);
        }

        $this->dispatch(
            'hide-order-detail-modal'
        );

        $this->dispatch(
            'success',
            message: "Pesanan {$order->code} berhasil diselesaikan"
        );

        broadcast(new OrderCompletedEvent($order->fresh()))->toOthers();

        // Send feedback email request delayed by 2 hours
        $feedbackService = app(FeedbackService::class);
        $feedback = $feedbackService->createFeedback($order);

        if ($feedback) {
            SendFeedbackRequestJob::dispatch($order, $feedback)->delay(now()->addHours(2));
        }
    }

    public function showOrderDetail(int $orderId): void
    {
        $order = $this->outlet->orders()
            ->with([
                'user',
                'tableNumber',
                'orderProducts.product',
                'orderProducts.orderProductVariants.productAttributeValue.productAttribute',
            ])
            ->withCount(['orderProducts'])
            ->findOrFail($orderId);

        $this->selectedOrder = $order;

        $this->dispatch('show-order-detail-modal');
    }

    public function closeOrderDetail(): void
    {
        $this->reset(['selectedOrder']);
    }

    // broadcast realtime
    #[On('newOrderLineCreated')]
    #[On('echo-private:new-order-line-created.{outlet.id},newOrderLineCreated')]
    public function handleNewOrderLineCreated($payload = null): void
    {
        if (is_object($payload)) {
            $payload = json_decode(json_encode($payload), true);
        }

        if (! is_array($payload)) {
            $this->loadOrderLines();

            return;
        }

        if (($payload['order']['outlet_id'] ?? null) !== $this->outlet->id) {
            return;
        }

        $this->loadOrderLines();

        if ($this->selectedOrder?->id === ($payload['order']['id'] ?? null)) {
            $this->selectedOrder = $this->outlet->orders()
                ->with([
                    'user',
                    'tableNumber',
                    'orderProducts.product',
                    'orderProducts.orderProductVariants.productAttributeValue.productAttribute',
                ])
                ->withCount(['orderProducts'])
                ->find($this->selectedOrder->id);
        }
    }
}
