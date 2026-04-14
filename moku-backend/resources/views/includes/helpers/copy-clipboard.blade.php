@push('scripts')
    <script>
        (function($){
            function copyToClipboard(button, input) {
                input.select();
                document.execCommand("copy");

                // Change tooltip title to 'Copied!'
                button.attr('data-bs-original-title', 'Copied!').tooltip('show');

                // Reset tooltip title back to 'Copy' after 2 seconds
                setTimeout(function() {
                    button.attr('data-bs-original-title', 'Copy').tooltip('hide');
                }, 2000);
            }
            window.copyToClipboard = copyToClipboard;

            $(document).on('click', '.copy-input button', function() {
                var button = $(this);
                var input = button.prev();
                copyToClipboard(button, input);
            });
        })(jQuery);
    </script>
@endpush
