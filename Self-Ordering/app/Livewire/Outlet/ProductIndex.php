<?php

namespace App\Livewire\Outlet;

use App\Models\Outlet;
use App\Models\ProductCategory;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\Attributes\On;

class ProductIndex extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public $outlet;
    public $search = '';
    public $category = null;

    protected $queryString = [
        'search' => ['except' => ''],
        'category' => ['except' => null],
    ];

    public function render()
    {
        $selectedCategory = is_null($this->category) ? null : (int) $this->category;

        $productsQuery = $this->outlet
            ->products()
            ->with(['productCategory'])
            ->filter([
                'search' => $this->search,
                'product_category' => $selectedCategory,
            ]);

        // Get total count before pagination
        $totalProducts = $productsQuery->count();

        // Paginate the results
        $products = $productsQuery->paginate(12);

        // Lazy load image URLs only when needed
        $products->getCollection()->each(function ($product) {
            $product->append('image_url');
        });

        // Load category data if a category is selected
        $categoryActive = null;
        if ($selectedCategory) {
            $categoryActive = ProductCategory::where('id', $selectedCategory)
                ->where('outlet_id', $this->outlet->id)
                ->first();
        }

        $data = [
            'products' => $products,
            'totalProducts' => $totalProducts,
            'category_id' => $selectedCategory,
            'category_model' => $categoryActive,
        ];

        return view('livewire.outlet.product-index', $data);
    }

    public function mount(Outlet $outlet)
    {
        $this->outlet = $outlet->loadCount('products');
    }

    public function updatingSearch()
    {
        $this->resetPage();
    }

    #[On('set-product-category')]
    public function setCategory($categoryId = null)
    {
        $this->category = is_null($categoryId) ? null : (int) $categoryId;
        $this->resetPage();
    }

    public function toggleRecommendation($productId)
    {
        $product = $this->outlet->products()->findOrFail($productId);

        $product->update([
            'is_recommended' => !$product->is_recommended
        ]);

        $message = "Status rekomendasi produk $product->name berhasil diubah";
        $this->dispatch(
            'success',
            message: $message
        );
    }

    /**
     * Manual refresh method that can be called if needed
     */
    #[On('refresh-products')]
    public function refreshProducts()
    {
        $this->render();
    }
}
