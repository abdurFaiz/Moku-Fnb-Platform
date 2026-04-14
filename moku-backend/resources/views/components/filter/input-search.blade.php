@props(['name' => 'search', 'placeholder' => 'Cari...'])

<div class="custom-search">
    <i class='bx bx-search'></i>
    <x-form.input name="{{ $name }}" type="search" placeholder="{{ $placeholder }}" value="{{ request($name) }}" />
</div>