<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn btn-success waves-effect waves-light']) }}>
    {{ $slot }}
</button>
