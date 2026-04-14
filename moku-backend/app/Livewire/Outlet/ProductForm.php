<?php

namespace App\Livewire\Outlet;

use App\Models\Outlet;
use App\Models\Product;
use App\Services\ImageCompressionService;
use Livewire\Component;
use Livewire\WithFileUploads;

class ProductForm extends Component
{
    use WithFileUploads;

    protected ImageCompressionService $imageCompressionService;

    public function boot(ImageCompressionService $imageCompressionService)
    {
        $this->imageCompressionService = $imageCompressionService;
    }

    public $name, $price, $description, $image, $category_id;
    public $outlet;
    public $product = null;

    public function render()
    {
        $data = [
            'product' => $this->product,
            'categories' => $this->outlet->productCategories,
        ];

        return view('livewire.outlet.product-form', $data);
    }

    public function mount(Outlet $outlet, Product $product = null)
    {
        $this->outlet = $outlet->load('productCategories');
        $this->product = @$product;

        if (@$this->product) {
            $this->name = $this->product->name;
            $this->price = $this->product->price;
            $this->description = $this->product->description;
            $this->category_id = $this->product->category_id;            
        }
    }

    public function store()
    {
        $this->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $product = $this->outlet->products()->create([
            'name' => $this->name,
            'price' => $this->price,
            'description' => $this->description,
        ]);

        $this->imageCompressionService->compress($this->image);
        $product->addMedia($this->image)->toMediaCollection('image');

        $message = "Produk $this->name berhasil ditambahkan";
        $this->dispatch(
            'success',
            message: $message
        );

        $this->reset(['name', 'price', 'description', 'image']);
    }
}
