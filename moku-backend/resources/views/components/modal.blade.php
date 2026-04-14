@props(['id', 'title' => null, 'position' => null, 'size' => null, 'closeButton' => true])

<div class="modal fade" id="{{ $id }}" tabindex="-1" aria-labelledby="{{ $id }}" aria-hidden="true">
    <div class="modal-dialog {{ $size }} {{ $position }}">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="{{ $id }}">{{ $title }}</h1>
                @if ($closeButton)
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                @endif
            </div>
            <div class="modal-body">
                {{ $slot }}
            </div>
            @if (@$footer)
                <div class="modal-footer">
                    {{ $footer }}
                </div>
            @endif
        </div>
    </div>
</div>
