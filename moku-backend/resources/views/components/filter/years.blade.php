<x-form.select name="year" onchange="this.form.submit()">
    @for ($y = date('Y') - 5; $y <= date('Y'); $y++)
        <option value="{{ $y }}" {{ (@$_GET['year'] ?? date('Y')) == $y ? 'selected' : '' }}>{{ $y }}</option>
    @endfor
</x-form.select>