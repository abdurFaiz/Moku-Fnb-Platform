<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn btn-soft-primary waves-effect waves-light']) }}
    :disabled="loading">
    <span class="mx-auto" x-show="!loading">
        <i class="bx bx-search-alt me-1"></i> Apply
    </span>
    <div style="display: none;" x-show="loading">
        <div class="spinner-border spinner-border-sm me-1" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <span>loading...</span>
    </div>
</button>
