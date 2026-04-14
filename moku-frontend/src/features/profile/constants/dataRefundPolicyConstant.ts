export interface RefundPolicy {
    title: string
    subtitle: string
    sections: RefundSection[]
}

export interface RefundSection {
    id: number
    title: string
    content: string
    list?: string[]
    contacts?: { label: string, value: string, link?: string }[]
}

export const refundPolicyData: RefundPolicy = {
    title: "Refund Policy",
    subtitle: "Kebijakan Pengembalian Dana",
    sections: [
        {
            id: 1,
            title: "Transaksi Melalui Sistem Spinofy",
            content: "Refund diberikan jika terjadi double charge, transaksi gagal tetapi saldo terpotong, atau kesalahan sistem yang membuat transaksi tidak valid. Proses refund 1 sampai 3 hari kerja sesuai metode pembayaran."
        },
        {
            id: 2,
            title: "Permasalahan Produk atau Layanan Kedai",
            content: "Spinofy tidak mengelola produk atau layanan kedai kopi. Refund terkait rasa, penyajian, atau operasional kedai diajukan langsung ke kedai terkait."
        },
        {
            id: 3,
            title: "Refund Biaya Service Fee",
            content: "Biaya service fee tidak dapat direfund kecuali terjadi kesalahan pemotongan oleh sistem Spinofy."
        },
        {
            id: 4,
            title: "Cara Mengajukan Refund",
            content: "Ajukan refund melalui WhatsApp atau email dengan melampirkan:",
            list: [
                "Screenshot transaksi",
                "Nomor referensi pembayaran",
                "Nominal transaksi",
                "Penjelasan masalah"
            ],
            contacts: [
                { label: "WhatsApp", value: "+6282164599911", link: "https://wa.me/6282164599911" },
                { label: "Email", value: "info@spinotek.com", link: "mailto:info@spinotek.com" }
            ]
        }
    ]
}