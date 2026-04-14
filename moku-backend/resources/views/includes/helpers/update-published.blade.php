@push('scripts')
    <script>
        // Generic reusable toggle-update-published handler
        function toggleUpdatePublished(id, field, switchId = null) {
            // If no explicit switchId is provided, fall back to legacy ID pattern
            const elId = switchId ? switchId : `update-published-${id}`;
            console.log(elId);
            const el = $(`#${elId}`);

            const status = el.is(':checked') ? 1 : 0;
            const table = el.data('table');
            const url = el.data('url');

            // Optional label swap
            if (el.data('label-on') !== '' && el.data('label-off') !== '') {
                changeLabelPublishSwitch(id, elId, field);
            }

            const csrfToken = $('meta[name="csrf-token"]').attr('content');

            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    _token: csrfToken,
                    field: field,
                    id: id,
                    table: table,
                    status: status,
                },
                success: function(res) {
                    window.showSuccess('Status berhasil diubah');
                },
                error: function(err) {
                    console.log(err);
                    window.showError('Status gagal diubah');
                }
            });
        }

        // Generic label swap helper
        function changeLabelPublishSwitch(id, elId, field) {
            const $this = $(`#${elId}`);
            const labelOn = $this.data('label-on');
            const labelOff = $this.data('label-off');
            $(`#label-${field}-${id}`)
                .fadeOut(150, function() {
                    $(this).text($this.is(':checked') ? labelOn : labelOff)
                        .fadeIn(150);
                });
        }
    </script>
@endpush
