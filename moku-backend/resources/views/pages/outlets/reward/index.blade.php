<x-panel-layout title="Manajemen Reward">    
    <div class="p-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Manajemen Reward</h5>
                <div>
                    <a href="{{ route('outlets.rewards.create', [$currentOutlet->slug]) }}" class="btn btn-primary">
                        <i class="mdi mdi-plus-circle me-1"></i>
                        Tambah Reward
                    </a>
                </div>
            </div>
            <div class="card-body">
                <form action="" class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.rows />
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Reward..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Poin</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($rewards as $index => $reward)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $reward->name }}</td>
                                    <td>{{ $reward->point }}</td>
                                    <td>
                                        <a href="#!" class="btn btn-sm btn-success"
                                            data-bs-toggle="modal"
                                            data-bs-target=".reward-form"
                                            data-url="{{ route('outlets.rewards.edit', [$currentOutlet->slug, $reward]) }}"
                                            data-title="Edit Reward"
                                        >
                                            <i class="mdi mdi-square-edit-outline me-1"></i>
                                            {{ __('Edit') }}
                                        </a>
                                        <x-button.delete 
                                            :url="route('outlets.rewards.destroy', [$currentOutlet->slug, $reward])"
                                        />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada data reward.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$rewards" />
            </div>
        </div>
    </div>

    <x-modal.dynamic class="reward-form" />

    @push('scripts')
        <script>
            function updateRewardableType() {
                const type = $('#rewardable_id').find(':selected').data('type');
                $('#rewardable_type').val(type || '');
            }
        </script>
    @endpush

    {{-- @push('scripts')
        <script>
            $(document).ready(function () {
                updateRewardableTypeOnChange();
            });

            function updateRewardableTypeOnChange() {
                const $rewardSelect = $('#reward');
                const $rewardableTypeInput = $('#rewardable_type');

                function updateRewardableType() {
                    const type = $rewardSelect.find(':selected').data('type');
                    $rewardableTypeInput.val(type || '');
                }

                $rewardSelect.on('change', updateRewardableType);
                updateRewardableType(); // Initialize on load
            }
        </script>
    @endpush --}}
</x-panel-layout>
