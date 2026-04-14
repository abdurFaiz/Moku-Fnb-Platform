<?php

namespace App\Livewire\Outlet;

use App\Models\Outlet;
use Livewire\Component;

class ProductCategoryIndex extends Component
{
    public $outlet;

    public $name;

    public $id;

    public $selectedCategory = null;

    public $isMobile = false;

    protected $queryString = [
        'selectedCategory' => ['as' => 'category', 'except' => null],
    ];

    public function render()
    {
        $productCategories = $this->outlet->productCategories()->withCount(['products' => function ($query) {
            $query->where('outlet_id', $this->outlet->id);
        }])->get();

        return view('livewire.outlet.product-category-index', compact('productCategories'));
    }

    public function mount(Outlet $outlet, $isMobile = false)
    {
        $this->outlet = $outlet->loadCount('products');
        $this->isMobile = $isMobile;

        if (! is_null($this->selectedCategory)) {
            $this->selectedCategory = (int) $this->selectedCategory;
            $this->loadCategoryForEdit($this->selectedCategory);
        }
    }

    public function selectCategory($categoryId = null)
    {
        $this->selectedCategory = is_null($categoryId) ? null : (int) $categoryId;

        if ($this->selectedCategory) {
            $this->loadCategoryForEdit($this->selectedCategory);
        } else {
            $this->reset(['id', 'name']);
        }

        $this->dispatch('set-product-category', categoryId: $this->selectedCategory)
            ->to('outlet.product-index');
    }

    protected function loadCategoryForEdit($categoryId)
    {
        $category = $this->outlet->productCategories()->find($categoryId);
        if ($category) {
            $this->id = $category->id;
            $this->name = $category->name;
        }
    }

    public function store()
    {
        $this->validate([
            'name' => 'required',
        ]);

        $count = $this->outlet->productCategories->count();

        $this->outlet->productCategories()->create([
            'position' => $count + 1,
            'name' => $this->name,
        ]);

        $message = "Kategori produk $this->name berhasil ditambahkan";
        $this->dispatch(
            'success',
            message: $message
        );

        // Dispatch event to notify ProductIndex component about new category
        $this->dispatch('refresh-products')->to('outlet.product-index');

        $this->reset(['name']);
    }

    public function edit($id, $name)
    {
        $this->id = $id;
        $this->name = $name;
    }

    public function update()
    {
        $this->validate([
            'name' => 'required',
        ]);

        $productCategory = $this->outlet->productCategories()->findOrFail($this->id);
        $productCategory->update([
            'name' => $this->name,
        ]);

        $message = "Kategori produk $this->name berhasil diupdate";
        $this->dispatch(
            'success',
            message: $message
        );

        // Dispatch event to notify ProductIndex component about category update
        $this->dispatch('refresh-products')->to('outlet.product-index');

        // $this->reset(['id', 'name']);
    }
}
