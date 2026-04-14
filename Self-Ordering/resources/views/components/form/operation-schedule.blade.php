@props(['schedules'])

@foreach ($schedules as $schedule)
    <div class="mb-3">
        <div class="row align-items-center">
            <div class="col-md-4">
                <div class="d-flex align-items-center justify-content-between gap-3">
                    <x-form.input-label :required="false" class="mb-0">{{ $schedule->dayName }}</x-form.input-label>
                    <div class="form-check form-switch mb-0">
                        <input type="hidden" name="is_open[{{ $schedule->day }}]" value="0">
                        <input class="form-check-input switch-open" type="checkbox" id="switch-{{ $schedule->day }}"
                            name="is_open[{{ $schedule->day }}]" value="1" {{ $schedule->is_open ? 'checked' : '' }}
                            data-day="{{ $schedule->day }}">
                        <label class="form-check-label text-muted" for="switch-{{ $schedule->day }}">
                            {{ $schedule->is_open ? 'Buka' : 'Tutup' }}
                        </label>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="row g-2" style="{{ $schedule->is_open ? '' : 'display: none;' }}" id="{{ $schedule->day }}-time">
                    <div class="col">
                        <x-form.input type="time" name="open_time[{{ $schedule->day }}]" id="{{ $schedule->day }}-open"
                            :value="old(
                                'open_time.' . $schedule->day,
                                optional($schedule)->open_time
                                    ? \Carbon\Carbon::parse($schedule->open_time)->format('H:i')
                                    : '09:00',
                            )" />
                        <x-form.input-error :name="'open_time.' . $schedule->day" />
                    </div>
                    <div class="col-auto d-flex align-items-center">–</div>
                    <div class="col">
                        <x-form.input type="time" name="close_time[{{ $schedule->day }}]" id="{{ $schedule->day }}-close"
                            :value="old(
                                'close_time.' . $schedule->day,
                                optional($schedule)->close_time
                                    ? \Carbon\Carbon::parse($schedule->close_time)->format('H:i')
                                    : '21:00',
                            )" />
                        <x-form.input-error :name="'close_time.' . $schedule->day" />
                    </div>
                </div>
            </div>
        </div>
    </div>
@endforeach

@push('scripts')
    <script>
        $(document).ready(function() {
            $('.switch-open').change(function() {
                const day = $(this).data('day');
                const isOpen = $(this).is(':checked');
                const label = $(this).siblings('label');
                if (isOpen) {
                    label.text('Buka');
                    $(`#${day}-time`).hide().removeClass('hidden').slideDown(250);
                } else {
                    label.text('Tutup');
                    $(`#${day}-time`).slideUp(250, function() {
                        $(this).addClass('hidden');
                    });
                }
            });
        });
    </script>
@endpush
