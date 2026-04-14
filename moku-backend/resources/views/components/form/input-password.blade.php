@props(['name' => 'password', 'placeholder' => '•••••••••'])

<div class="input-group" x-data="{ show: true }">
    <input :type="show ? 'password' : 'text'" type="password" name="{{ $name }}" {!! $attributes->merge(['class' => 'form-control border-end-0']) !!}
        value="{{ old($name) }}" placeholder="{{ $placeholder }}">
    <span class="input-group-text border-start-0 cursor-pointer px-3 bg-white" @click="show = !show">
        <i :class="show ? 'mdi mdi-eye' : 'mdi mdi-eye-off'" class="text-muted"></i>
    </span>
</div>
