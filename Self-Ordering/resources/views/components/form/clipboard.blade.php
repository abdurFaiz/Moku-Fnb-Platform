{{-- note: use script in file "includes.functions.copy-clipboard" for run clipboard component --}}

@props(['value'])

<div class="input-group copy-input" {{ $attributes }}>
    <input type="text" class="form-control border" value="{{ $value }}" readonly />
    <button type="button" class="btn btn-light text-secondary border border-start-0" data-bs-toggle="tooltip"
        data-bs-original-title="Copy" onclick="initCopyClipboard()">
        <i class="mdi mdi-content-copy"></i>
    </button>
</div>
