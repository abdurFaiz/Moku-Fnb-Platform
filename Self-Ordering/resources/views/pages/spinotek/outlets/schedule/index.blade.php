<x-panel-layout>
    <div class="d-grid p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Jam Operasional {{ $outlet->name }}</h5>
                    <div class="flex gap-3">
                        <x-button.back url="{{ route('spinotek.outlets.index') }}" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <x-form :action="route('spinotek.outlets.schedule.update', $outlet)">
                    @method('PUT')
                    <div class="d-grid">
                        <x-form.operation-schedule :schedules="$outlet->operationalSchedules" />

                        <x-button.submit>Simpan Jadwal</x-button.submit>
                    </div>
                </x-form>
            </div>
        </div>
    </div>
</x-panel-layout>
