<x-auth-layout>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div class="text-center">
                            <div class="rounded-circle p-3 d-flex align-items-center mx-auto" style="background-color: #F8CFB3; width: 80px; height: 80px;">
                                <img src="{{ asset('assets/images/logo/spinofy_logo_symbol.png') }}" class="img-fluid" alt="">
                            </div>
                            <h4 class="mt-2 mb-1">
                                Welcome to Spinofy
                            </h4>
                            <p class="text-muted">
                                Login to Spinofy Dashboard
                            </p>
                        </div>
                        <x-form method="POST" action="{{ route('login') }}">
                            @csrf

                            <div class="mb-2">
                                <label for="email"
                                    class=" col-form-label text-md-end">{{ __('Email Address') }}</label>
                                <div class="">
                                    <input id="email" type="email"
                                        class="form-control @error('email') is-invalid @enderror" name="email"
                                        value="{{ old('email') }}" required autocomplete="email" autofocus>
                                    @error('email')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>

                            <div class="mb-2">
                                <label for="password"
                                    class="col-form-label text-md-end">{{ __('Password') }}</label>

                                <div class="">
                                    <x-form.input-password name="password" />

                                    @error('password')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="remember" id="remember"
                                        {{ old('remember') ? 'checked' : '' }}>

                                    <label class="form-check-label" for="remember">
                                        {{ __('Remember Me') }}
                                    </label>
                                </div>
                            </div>

                            <div class="d-grid">
                                <x-button.submit>
                                    {{ __('Login') }}
                                </x-button.submit>
                            </div>
                        </x-form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-auth-layout>
