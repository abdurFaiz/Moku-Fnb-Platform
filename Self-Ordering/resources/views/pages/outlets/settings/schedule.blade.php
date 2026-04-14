<x-panel-layout title="Jam Operasional">
    <div class="p-4">
        @include('pages.outlets.settings._header')
        <div class="row justify-content-center">
            <div class="col-md-8 card">
                <div class="card-body">
                    <x-form :action="route('outlets.settings.schedule.update', $currentOutlet->slug)">
                        @method('PUT')
                        <div class="d-grid">
                            <x-form.operation-schedule :schedules="$outlet->operationalSchedules" />
    
                            <x-button.submit>Simpan Jadwal</x-button.submit>
                        </div>
                    </x-form>
                </div>
            </div>
        </div>
    </div>
</x-panel-layout>
