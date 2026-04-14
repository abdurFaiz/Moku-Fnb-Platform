<x-panel-layout title="Profil">
    <div class="p-4">
        @include('pages.outlets.settings._header')
        <div class="row justify-content-center">
            <div class="card col-md-8">
                <div class="card-body">
                    <x-form :action="route('outlets.settings.profile.update', $currentOutlet->slug)" enctype="multipart/form-data">
                        @method('PUT')
                        <div class="d-grid">
                            <div class="row">
                                <div class="mb-3 col-md-6">
                                    <x-form.input-label :required="true">Nama</x-form.input-label>
                                    <x-form.input name="name" id="name-outlet" placeholder="masukkan nama outlet"
                                        :value="$user->name ?? ''" required />
                                    <x-form.input-error name="name" />
                                </div>
                                <div class="mb-3 col-md-6">
                                    <x-form.input-label>Email</x-form.input-label>
                                    <x-form.input type="email" name="email" id="email"
                                        placeholder="masukkan email" :value="$user->email ?? ''" readonly />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <x-form.input-label>
                                            VA Name Ipaymu
                                            <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                                title="Silakan hubungi administrator untuk melakukan perubahan pada VA Name Ipaymu.">
                                                <i class="mdi mdi-help-circle-outline"></i>
                                            </span>
                                        </x-form.input-label>
                                        <x-form.input name="va_name" type="text" id="va_name" :value="$user->outlet->va_name"
                                            readonly />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <x-form.input-label>
                                            VA Number Ipaymu
                                            <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                                title="Silakan hubungi administrator untuk melakukan perubahan pada VA Number Ipaymu.">
                                                <i class="mdi mdi-help-circle-outline"></i>
                                            </span>
                                        </x-form.input-label>
                                        <x-form.input name="va_number" type="text" id="va_number" :value="$user->outlet->va_number"
                                            readonly />
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <x-form.input-label>Password</x-form.input-label>
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
