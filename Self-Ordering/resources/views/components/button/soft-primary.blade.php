<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn btn-soft-primary waves-effect waves-light']) }}>
    {{ $slot }}
</button>
