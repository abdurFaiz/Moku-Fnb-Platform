@push('styles')
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1/dist/fancybox/fancybox.css" />
@endpush

@push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1/dist/fancybox/fancybox.umd.js"></script>

    <script>
        Fancybox.bind("[data-fancybox]", {
            Carousel: {
                Toolbar: {
                    display: {
                        left: ["counter"],
                        middle: [],
                        right: ["download", "thumbs", "close"],
                    },
                },
            },
        });
    </script>
@endpush
