<x-panel-layout title="Profil">
    <div class="p-4">
        <div class="row justify-content-center">
            <div class="col-md-8 card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-sm order-2 order-sm-1">
                            <div class="d-flex align-items-center mt-3 mt-sm-0">
                                <div class="flex-shrink-0">
                                    <div class="avatar-xl me-3">
                                        <img src="{{ auth()->user()->avatarUrl }}" alt=""
                                            class="img-fluid rounded-circle d-block">
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <div>
                                        <h5 class="font-size-16 mb-1">{{ $user->name }}</h5>
                                        <p class="text-muted font-size-13 mb-0">{{ $user->email }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- end card body -->
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="card col-md-8">
                <div class="card-body">
                    <x-form :action="route('spinotek.profile.update')" enctype="multipart/form-data">
                        @method('PUT')
                        <div class="d-grid">
                            <div class="mb-3">
                                <x-form.input-label :required="true">Nama</x-form.input-label>
                                <x-form.input name="name" id="name-outlet" placeholder="masukkan nama outlet"
                                    :value="$user->name ?? ''" required />
                                <x-form.input-error name="name" />
                            </div>
                            <div class="mb-3">
                                <x-form.input-label>Email</x-form.input-label>
                                <x-form.input type="email" name="email" id="email" placeholder="masukkan email"
                                    :value="$user->email ?? ''" />
                            </div>
                            <div class="mb-3">
                                <x-form.input-label>
                                    Password <small>(Kosongkan jika tidak ada perubahan)</small>
                                </x-form.input-label>
                                <x-form.input-password name="password" placeholder="••••••••" />
                                <small class="text-muted">kosongkan jika tidak ada perubahan</small>
                                <x-form.input-error name="password" />
                            </div>
                            <div class="mb-3">
                                <x-form.input-label>Foto Profil</x-form.input-label>
                                <p class="text-muted">Unggah gambar dengan format JPG, PNG, atau JPEG. Maksimal ukuran
                                    gambar 2MB.</p>
                                <x-form.dropify name="avatar" id="avatar-outlet"
                                    data-default-file="{{ $user->avatarUrl ?? '' }}" />
                                <x-form.input-error name="avatar" />
                            </div>

                            <x-button.submit>Simpan</x-button.submit>
                        </div>
                    </x-form>

                </div>
            </div>


        </div>
    </div>
</x-panel-layout>
