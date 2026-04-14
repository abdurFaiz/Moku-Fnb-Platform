@props(['data' => []])

<div class="row pagination-link">
    <div class="col-12">
        {{ $data->withQueryString()->links() }}
    </div>
</div>
