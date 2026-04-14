<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn btn-danger waves-effect waves-light']) }}>
    {{ $slot }}
</button>
