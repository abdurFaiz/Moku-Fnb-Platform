<x-panel-layout title="Manajemen Produk" bgClass="bg-white">
    <div class="row">
        <div class="col-md-3 pe-0 bg-light-200 min-h-screen d-none d-md-block">
            <div class="px-3 py-3 position-sticky">
                <livewire:outlet.product-category-index :outlet="$currentOutlet" />
            </div>
        </div>
        <div class="col-md-9 min-h-screen">
            <div class="px-3 py-3">
                <div class="d-md-none mb-3">
                    <livewire:outlet.product-category-index :outlet="$currentOutlet" :isMobile="true" />
                </div>
                <livewire:outlet.product-index :outlet="$currentOutlet" />
            </div>
        </div>
    </div>
</x-panel-layout>
