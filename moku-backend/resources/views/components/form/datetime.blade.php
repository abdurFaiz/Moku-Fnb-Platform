<div class="input-group">
    <input {!! $attributes->merge(['class' => 'form-control datepicker-datetime']) !!} {!! $attributes !!} />
    <span class="input-group-text">{{ config('app.timezone_idn') }}</span>
</div>
