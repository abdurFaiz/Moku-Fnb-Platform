export interface PrivacyPolicy {
    title: string
    description: string
    sections: PrivacySection[]
}

export interface PrivacySection {
    id: number
    title: string
    content: string
}

export const privacyPolicyData: PrivacyPolicy = {
    title: "Kebijakan Privasi",
    description: "Penjelasan mengenai bagaimana Spinofy mengumpulkan, menggunakan, dan melindungi data pribadi pengguna.",
    sections: [
        {
            id: 1,
            title: "Informasi yang Dikumpulkan",
            content: "Spinofy mengumpulkan data seperti nama, alamat email, nomor telepon, dan informasi transaksi pelanggan untuk kebutuhan operasional dan peningkatan layanan."
        },
        {
            id: 2,
            title: "Penggunaan Data",
            content: "Data digunakan untuk analitik, personalisasi layanan, dan komunikasi relevan. Spinofy tidak menjual atau membagikan data pribadi kepada pihak ketiga tanpa izin."
        },
        {
            id: 3,
            title: "Keamanan Data",
            content: "Langkah teknis dan organisasi digunakan untuk melindungi data dari akses tidak sah, kehilangan, atau penyalahgunaan."
        },
        {
            id: 4,
            title: "Cookie dan Pelacakan",
            content: "Platform dapat menggunakan cookie untuk meningkatkan pengalaman pengguna. Preferensi cookie dapat diatur melalui browser."
        },
        {
            id: 5,
            title: "Hak Pengguna",
            content: "Pengguna berhak meminta akses, pembaruan, atau penghapusan data pribadi dengan menghubungi info@spinotek.com."
        },
        {
            id: 6,
            title: "Pembaruan Kebijakan",
            content: "Kebijakan dapat diperbarui sewaktu waktu sesuai kebutuhan hukum atau pengembangan layanan. Tanggal revisi terakhir akan tercantum pada halaman."
        }
    ]
}
