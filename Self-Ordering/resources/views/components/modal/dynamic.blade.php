@props(['class' => 'open-modal', 'size' => 'modal-md'])

<div class="modal modal-blur fade {{ $class }}" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered {{ $size }}" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title modal-title-custom"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body modal-body-custom">
                <div class="d-flex justify-content-center">
                    <div class="spinner-border text-secondary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
    <script>
        document.querySelector('.{{ $class }}').addEventListener('show.bs.modal', e => {
            var title = $(e.relatedTarget).data('title');
            var url = $(e.relatedTarget).data('url');

            document.querySelector('.{{ $class }}').querySelector('.modal-title-custom').innerHTML = title;

            // load ajax
            $.ajax({
                type: "GET",
                url: url,
                success: function(response) {
                    document.querySelector('.{{ $class }}').querySelector('.modal-body-custom')
                        .innerHTML = response;
                },
                error: function(err) {
                    console.log(err);
                }
            })
        })
    </script>
@endpush
