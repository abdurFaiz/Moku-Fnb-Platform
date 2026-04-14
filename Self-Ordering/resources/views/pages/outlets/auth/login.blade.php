<x-auth-layout>
    <div class="row justify-content-center w-100">
        <div class="col-lg-6">
            <div class="text-center">
                <x-form :action="route('outlets.authenticate', $outlet->slug)" id="pinForm">
                    <img src="{{ $outlet->logoUrl }}" alt="Logo" height="40"
                        class="mb-4">
                    <h5 class="fw-semibold">Masukan PIN Anda</h5>
                    <p class="text-muted mb-4">Akses akun kamu dengan aman</p>

                    @error('pin')
                        <div class="alert alert-danger">
                            <i class="fas fa-info-circle me-1"></i>
                            {{ $message }}
                        </div>
                    @enderror

                    <!-- PIN Dot Display -->
                    <div id="pinDots" class="d-flex justify-content-center gap-4 mb-4">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>

                    <!-- Hidden Input -->
                    <input type="hidden" name="pin" id="pinInput">

                    <div class="keypad mt-3">
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            <button type="button" onclick="appendPin('1')">1</button>
                            <button type="button" onclick="appendPin('2')">2</button>
                            <button type="button" onclick="appendPin('3')">3</button>
                        </div>
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            <button type="button" onclick="appendPin('4')">4</button>
                            <button type="button" onclick="appendPin('5')">5</button>
                            <button type="button" onclick="appendPin('6')">6</button>
                        </div>
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            <button type="button" onclick="appendPin('7')">7</button>
                            <button type="button" onclick="appendPin('8')">8</button>
                            <button type="button" onclick="appendPin('9')">9</button>
                        </div>
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            <button type="button" onclick="removePin()">⌫</button>
                            <button type="button" onclick="appendPin('0')">0</button>
                            <button class="invisible">⌫</button>
                        </div>
                    </div>

                    <div class="d-grid">
                        <x-button.submit id="signInBtn" class="mt-4 disabled">
                            Masuk
                        </x-button.submit>
                    </div>
                </x-form>
            </div>
        </div>
    </div>

    @push('styles')
        <style>
            .keypad button {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                font-size: 1.25rem;
                background-color: #fff;
                border: 1px solid #fff;
                margin: 5px;
                transition: 0.1s;
            }

            .keypad button:hover {
                background-color: rgba(27, 85, 246, 0.1);
                color: var(--bs-blue);
                border: 1px solid rgba(27, 85, 246, 0.1);
            }

            /* PIN dots */
            .dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #e0e0e0;
                transition: background-color 0.2s;
            }

            .dot.filled {
                background-color: var(--bs-primary);
            }
        </style>
    @endpush

    @push('scripts')
        <script>
            let pin = "";

            const dots = document.querySelectorAll("#pinDots .dot");
            const pinInput = document.getElementById("pinInput");
            const signInBtn = document.getElementById("signInBtn");
            const form = document.getElementById("pinForm");

            function updateDots() {
                dots.forEach((dot, index) => {
                    dot.classList.toggle("filled", index < pin.length);
                });

                // Update hidden input
                pinInput.value = pin;

                // Enable sign-in button when full PIN entered
                if (pin.length === 6) {
                    signInBtn.classList.remove("disabled");
                } else {
                    signInBtn.classList.add("disabled");
                }
            }

            function appendPin(num) {
                if (pin.length < 6) {
                    pin += num;
                    updateDots();
                }
            }

            function removePin() {
                pin = pin.slice(0, -1);
                updateDots();
            }

            // Allow typing via keyboard
            document.addEventListener("keydown", (e) => {
                if (/^[0-9]$/.test(e.key)) {
                    appendPin(e.key);
                } else if (e.key === "Backspace") {
                    removePin();
                } else if (e.key === "Enter" && pin.length === 6) {
                    form.submit();
                }
            });
        </script>
    @endpush
</x-auth-layout>
