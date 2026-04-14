export interface TermsAndConditions {
    title: string
    description: string
    sections: TermsSection[]
}

export interface TermsSection {
    id: number
    title: string
    content: string
}

export const termsData: TermsAndConditions = {
    title: "Syarat dan Ketentuan",
    description: "Selamat datang di Spinofy. Dengan mengakses dan menggunakan layanan kami, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan yang berlaku di halaman ini.",
    sections: [
        {
            id: 1,
            title: "Penggunaan Layanan",
            content: "Spinofy menyediakan platform digital untuk operasional kedai kopi, termasuk sistem pemesanan mandiri dan program loyalitas. Layanan digunakan untuk tujuan bisnis yang sah sesuai hukum Indonesia."
        },
        {
            id: 2,
            title: "Akun dan Keamanan",
            content: "Pengguna bertanggung jawab atas keamanan akun, termasuk kerahasiaan kata sandi dan aktivitas di dalam akun. Spinofy tidak bertanggung jawab atas kerugian akibat penyalahgunaan akun."
        },
        {
            id: 3,
            title: "Hak Kekayaan Intelektual",
            content: "Logo, desain, konten, dan elemen visual dalam platform Spinofy dilindungi hak cipta. Dilarang menggunakan atau mendistribusikan tanpa izin tertulis dari Spinofy."
        },
        {
            id: 4,
            title: "Perubahan Layanan",
            content: "Spinofy berhak melakukan pembaruan, penambahan, atau penghentian fitur kapan saja. Pemberitahuan akan diberikan jika terjadi perubahan besar."
        },
        {
            id: 5,
            title: "Batasan Tanggung Jawab",
            content: "Spinofy tidak bertanggung jawab atas kerugian tidak langsung atau kehilangan data akibat penggunaan layanan. Spinofy berupaya menjaga stabilitas sistem tetapi tidak menjamin bebas gangguan."
        },
        {
            id: 6,
            title: "Perubahan Syarat dan Ketentuan",
            content: "Syarat dan ketentuan dapat berubah sesuai perkembangan layanan. Versi terbaru akan diperbarui di halaman resmi Spinofy."
        }
    ]
}