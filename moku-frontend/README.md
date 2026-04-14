# Self-Ordering PWA Frontend

Ini adalah repositori frontend untuk aplikasi Self-Ordering PWA (Progressive Web App). Aplikasi ini memungkinkan pelanggan untuk memesan langsung dari perangkat mereka sendiri, mendukung alur pemesanan yang efisien, manajemen keranjang, pembayaran, dan sistem loyalitas (poin & voucher).

Aplikasi ini dibangun sebagai PWA untuk memastikan pengalaman pengguna yang cepat, andal, dan dapat diinstal di perangkat seluler maupun desktop.

## Fitur Utama

Berdasarkan analisis struktur proyek, berikut adalah fitur-fitur utama yang diimplementasikan:

* **Autentikasi Pengguna:** Login (termasuk Google Login) dan manajemen profil pengguna.
* **Pemilihan Outlet:** Pengguna dapat memilih outlet atau lokasi F&B yang spesifik.
* **Katalog Produk:** Menampilkan daftar produk dengan kategori, detail produk, dan kustomisasi (ukuran, atribut, opsi).
* **Keranjang Belanja (Cart):** Fungsionalitas tambah/ubah/hapus item di keranjang belanja yang persisten menggunakan Zustand.
* **Checkout & Pembayaran:** Alur checkout multi-langkah, termasuk integrasi gateway pembayaran.
* **Sistem Voucher & Poin:** Pengguna dapat menggunakan voucher dan mendapatkan poin loyalitas dari transaksi.
* **Riwayat Transaksi:** Pengguna dapat melihat daftar transaksi sebelumnya beserta detailnya.
* **PWA Ready:** Fungsionalitas offline, dapat diinstal (Add-to-Homescreen), dan pembaruan service worker berkat `vite-plugin-pwa`.
* **Manajemen Status:** Pengelolaan status aplikasi yang *robust* menggunakan TanStack Query untuk data fetching, caching, dan mutasi.

## Teknologi yang Digunakan

Proyek ini dibangun menggunakan tumpukan teknologi modern untuk frontend:

* **Framework:** [React](https://reactjs.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Komponen UI:** [shadcn/ui](https://ui.shadcn.com/)
* **Routing:** [React Router v6](https://reactrouter.com/)
* **Manajemen Status & Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/)
* **Manajemen Status (Lokal):** [Zustand](https://github.com/pmndrs/zustand)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Validasi Skema:** [Zod](https://zod.dev/)
* **Manajemen Form:** [React Hook Form](https://react-hook-form.com/)
* **PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
* **Testing (E2E):** [Playwright](https://playwright.dev/)
* **Linting:** [ESLint](https://eslint.org/)

## Prasyarat Instalasi

Sebelum Anda memulai, pastikan Anda telah menginstal perangkat lunak berikut di mesin Anda:

* [Node.js](https://nodejs.org/en/) (v18.x atau v20.x direkomendasikan)
* [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)

## Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini secara lokal:

1.  **Clone repositori ini:**
    ```sh
    git clone [https://github.com/spinotek-organization/self-ordering-pwa-fe.git](https://github.com/spinotek-organization/self-ordering-pwa-fe.git)
    cd self-ordering-pwa-fe
    ```

2.  **Instal dependensi:**
    ```sh
    npm install
    ```

3.  **Siapkan Variabel Lingkungan (Environment Variables):**
    Salin file `.env.example` menjadi file `.env` baru.
    ```sh
    cp .env.example .env
    ```
    Buka file `.env` dan isi variabel yang diperlukan, seperti `VITE_API_BASE_URL` dan kunci API lainnya.

4.  **Jalankan server pengembangan (Development Server):**
    ```sh
    npm run dev
    ```
    Aplikasi sekarang akan berjalan di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan).

5.  **Build untuk Produksi:**
    Untuk membuat build produksi yang dioptimalkan:
    ```sh
    npm run build
    ```
    Hasil build akan tersedia di direktori `dist/`.

6.  **Menjalankan Tes (E2E):**
    Untuk menjalankan tes Playwright:
    ```sh
    npm run test:e2e
    ```

## Susunan Proyek

Struktur direktori utama dalam proyek ini adalah sebagai berikut:

Struktur direktori utama dalam proyek ini adalah sebagai berikut:

```sh
self-ordering-pwa-fe/
├── public/                 # Aset statis, ikon PWA, dan manifest.json
├── src/
│   ├── api/                # Fungsi panggilan API (endpoint)
│   ├── components/         # Komponen React yang dapat digunakan kembali
│   │   ├── layout/         # Komponen tata letak (wrapper, header)
│   │   ├── skeletons/      # Komponen loading skeleton
│   │   └── ui/             # Komponen shadcn/ui (Button, Input, dll.)
│   ├── constants/          # Nilai konstan (mis. status, filter)
│   ├── contexts/           # React Context (Auth, Cart)
│   ├── hooks/              # Custom hooks (mis. useAuth, useCart)
│   ├── lib/                # Konfigurasi library (axios, query-client)
│   ├── pages/              # Komponen halaman (sesuai rute)
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── item/
│   │   ├── payments/
│   │   ├── poin/
│   │   ├── transactions/
│   │   └── vouchers/
│   ├── providers/          # Penyedia global (QueryProvider)
│   ├── routes/             # Konfigurasi rute (AppRoutes)
│   ├── schemas/            # Skema validasi Zod
│   ├── services/           # Logika bisnis (layanan)
│   ├── store/              # Penyimpanan state global (Zustand)
│   ├── types/              # Definisi tipe TypeScript
│   ├── utils/              # Fungsi utilitas (formatters, mappers)
│   ├── App.tsx             # (Tergantung struktur, mungkin di main.tsx)
│   ├── main.tsx            # Titik masuk aplikasi (root)
│   └── sw.ts               # Logika Service Worker kustom
├── tests/                  # Tes E2E (Playwright)
├── .env.example            # Contoh file environment
├── package.json            # Dependensi dan skrip proyek
├── tsconfig.json           # Konfigurasi TypeScript
└── vite.config.ts          # Konfigurasi Vite (termasuk PWA)

## Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**.

MIT License

Copyright (c) 2025 Spinotek
