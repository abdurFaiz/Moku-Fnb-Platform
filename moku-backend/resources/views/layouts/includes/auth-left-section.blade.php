<div id="illustrationCarousel" class="carousel carousel-slidein" data-bs-ride="carousel" data-bs-interval="4000">
    <div class="carousel-inner">
        <div class="carousel-item active">
            <img class="mb-3" src="{{ asset('assets/images/ilustrations/undraw_mobile-payments_uate.svg') }}"
                alt="POS Cepat">
            <h4 class="mt-3 fw-bold">Fast & Easy Transactions</h4>
            <p class="text-muted">
                Gak perlu ribet! Proses pesanan dan pembayaran bisa super cepat lewat sistem POS yang easy to use.
            </p>
        </div>
        <div class="carousel-item">
            <img class="mb-3" src="{{ asset('assets/images/ilustrations/undraw_projections_fhch.svg') }}"
                alt="Analitik Penjualan">
            <h4 class="mt-3 fw-bold">Smart Sales Analytics</h4>
            <p class="text-muted">
                Cek omzet harian, menu paling laku, dan kebiasaan pelanggan langsung dari dashboard — real time &
                akurat!
            </p>
        </div>
        <div class="carousel-item">
            <img class="mb-3" src="{{ asset('assets/images/ilustrations/undraw_cloud-files_8upc.svg') }}"
                alt="Cloud Sync">
            <h4 class="mt-3 fw-bold">Cloud Backup & Sync</h4>
            <p class="text-muted">
                Semua data otomatis ke-save dan bisa diakses dari mana aja. Jadi, no worries kalau ganti device!
            </p>
        </div>
    </div>

    <!-- Clickable Dots (Bootstrap's data attributes handle the clicks) -->
    <div class="mt-3 d-flex justify-content-center">
        <button class="slider-dot active" type="button" data-bs-target="#illustrationCarousel" data-bs-slide-to="0"
            aria-label="Slide 1"></button>
        <button class="slider-dot" type="button" data-bs-target="#illustrationCarousel" data-bs-slide-to="1"
            aria-label="Slide 2"></button>
        <button class="slider-dot" type="button" data-bs-target="#illustrationCarousel" data-bs-slide-to="2"
            aria-label="Slide 3"></button>
    </div>
</div>

<style>
    /* Simple slide-in: incoming slides move from right -> center, outgoing use default left movement */
    .carousel.carousel-slidein .carousel-item {
        opacity: 0;
        transform: translateX(50px);
        transition: transform 0.8s ease-in-out, opacity 0.6s ease;
    }

    .carousel.carousel-slidein .carousel-item.active {
        opacity: 1;
        transform: translateX(0);
    }

    /* Ensure images render normally */
    .carousel-item img {
        width: 280px;
        max-width: 100%;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    /* Dots styling */
    .slider-dot {
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: #ccc;
        margin: 0 6px;
        display: inline-block;
        cursor: pointer;
        border: none;
        transition: all 0.3s ease;
    }

    .slider-dot.active,
    .slider-dot[aria-current="true"] {
        width: 26px;
        height: 10px;
        background-color: var(--bs-blue);
        border-radius: 6px;
    }

    /* Small accessibility: focus outline for keyboard nav */
    .slider-dot:focus {
        outline: 2px solid rgba(13, 110, 253, 0.25);
        outline-offset: 3px;
    }
</style>

<script>
    // Sync dots with Bootstrap carousel events (keeps active class consistent)
    (function() {
        const carouselEl = document.getElementById('illustrationCarousel');
        const dots = Array.from(carouselEl.querySelectorAll('.slider-dot'));

        carouselEl.addEventListener('slid.bs.carousel', function(event) {
            // event.to is the new index
            dots.forEach(d => d.classList.remove('active'));
            const newDot = dots[event.to];
            if (newDot) newDot.classList.add('active');
        });

        // Also mark active on page load (in case carousel started on a non-zero index)
        document.addEventListener('DOMContentLoaded', () => {
            const activeIndex = Array.from(carouselEl.querySelectorAll('.carousel-item')).findIndex(i => i
                .classList.contains('active'));
            dots.forEach(d => d.classList.remove('active'));
            if (dots[activeIndex]) dots[activeIndex].classList.add('active');
        });
    })();
</script>
