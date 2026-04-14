{{-- script input format rupiah --}}
{{-- add data-format="rupiah" for use this script and add input hidden for send value to controller --}}
{{-- example use : --}}
{{-- <input type="text" 
    * data-format="rupiah" 
    * id="harga_display" 
    name="harga_display" 
    class="form-control" 
    value="{{ old('harga_display') }}" 
    required> 
--}}
{{-- <input type="hidden" 
    * id="harga" 
    name="harga" 
    value="{{ old('harga') }}" 
    required> 
--}}

@push('scripts')
    <script>
        (function($){
            function formatRupiah($input) {                
                let value = $input.val().replace(/[^,\d]/g, '').toString();
                let split = value.split(',');
                let sisa = split[0].length % 3;
                let rupiah = split[0].substr(0, sisa);
                let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

                if (ribuan) {
                    let separator = sisa ? '.' : '';
                    rupiah += separator + ribuan.join('.');
                }

                rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
                $input.val(rupiah);
            }

            function updateRupiahAndHidden(input) {
                const $input = input instanceof jQuery ? input : $(input);
                formatRupiah($input);
                let numericValue = $input.val().replace(/\./g, '').replace(/,/g, '.');
                $('#' + $input.attr('id').replace('_display', '')).val(numericValue);
            }
            window.updateRupiahAndHidden = updateRupiahAndHidden;

            $(document).on('input', 'input[data-format="rupiah"]', function() {
                updateRupiahAndHidden(this);
            });
        })(jQuery);
    </script>
@endpush
