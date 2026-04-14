<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn btn-primary waves-effect waves-light']) }}
    :disabled="loading">
    <div x-show="!loading">
        <span class="d-flex align-items-center justify-content-center gap-1">
            {{ $slot }}
        </span>
    </div>
    <div style="display: none;" x-show="loading">
        <div class="spinner-border spinner-border-sm me-1" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <span>loading...</span>
    </div>
</button>
