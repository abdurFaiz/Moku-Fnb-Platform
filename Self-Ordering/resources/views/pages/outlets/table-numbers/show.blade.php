<!-- QR Code Preview -->
<div class="text-center mb-4">
    <img src="{{ $tableNumber->qrCodeUrl }}" class="img-fluid border rounded shadow-sm" alt="QR Code Meja" style="max-height: 200px;">
    <br>
    <a href="{{ $tableNumber->qrCodeUrl }}" download="qr-code-meja-{{ $tableNumber->number }}.png" class="small text-decoration-none">Download QR Code</a>
</div>

<!-- QR Code Link -->
<div class="mb-3">
    <x-form.input-label :required="true">Link QR Code</x-form.input-label>
    <x-form.clipboard id="qr_code_url" name="qr_code_url" :value="$tableNumber->qrCodeLinkRedirect" required />
</div>