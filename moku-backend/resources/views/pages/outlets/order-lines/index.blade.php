<x-panel-layout title="Manajemen Pesanan">
    <div class="p-4">
        <div>
            <h5 class="mb-1">
                Daftar Pesanan
            </h5>
            <h6 class="text-muted">
                {{ now()->locale('id')->isoFormat('MMMM DD YYYY') }}
            </h6>
        </div>
        <div class="py-3">
            <livewire:outlet.order-line-index :outlet="$currentOutlet" />
        </div>
    </div>
</x-panel-layout>
