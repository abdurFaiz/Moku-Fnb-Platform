<!-- JAVASCRIPT -->
<script src="{{ asset('assets/libs/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('assets/libs/metismenu/metisMenu.min.js') }}"></script>
<script src="{{ asset('assets/libs/simplebar/simplebar.min.js') }}"></script>
<script src="{{ asset('assets/libs/node-waves/waves.min.js') }}"></script>
<script src="{{ asset('assets/libs/feather-icons/feather.min.js') }}"></script>
<script src="{{ asset('assets/libs/pace-js/pace.min.js') }}"></script>

{{-- sweetalert --}}
<script src="{{ asset('assets/libs/sweetalert2/js/sweetalert2.all.min.js') }}"></script>

<script src="{{ asset('assets/libs/dropify/js/dropify.min.js') }}"></script>
<script>
    $(document).ready(function() {
        $('.dropify').dropify();
    });
</script>

@if (auth()->check())
    <script>
        window.currentOutletId = @json(auth()->user()->outlet_id);
    </script>
@endif

<script src="{{ asset('assets/js/app.js') }}"></script>

<script>
    document.querySelectorAll('.card-clickable').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('[ignore-clickable-parent]')) {
                return;
            }

            const url = card.getAttribute('data-url');
            if (url) {
                window.location.href = url;
            }
        });
    });
</script>
