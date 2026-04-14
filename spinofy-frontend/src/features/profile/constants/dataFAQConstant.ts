export interface FaqItem {
    id: number
    question: string
    answer: string
}

export interface FaqList {
    items: FaqItem[]
}

export const faqData: FaqList = {
    items: [
        {
            id: 1,
            question: "Apa itu Spinofy?",
            answer: "Spinofy adalah platform loyalty digital untuk coffeeshop yang menggabungkan sistem poin, voucher, dan self-ordering agar pelanggan lebih mudah menikmati layanan."
        },
        {
            id: 2,
            question: "Bagaimana cara menjadi mitra?",
            answer: "Mudah saja cukup menghubungi tim kami langsung melalui email atau whatsapp."
        },
        {
            id: 3,
            question: "Apakah Spinofy mendukung banyak outlet?",
            answer: "Untuk saat ini Spinofy berfokus pada pengelolaan satu outlet utama. Namun, kami sedang mengembangkan fitur multi-outlet agar kedai kopi dengan beberapa cabang dapat dikelola dari satu dashboard terpusat di masa mendatang."
        },
        {
            id: 4,
            question: "Bagaimana sistem poin di Spinofy bekerja?",
            answer: "Setiap pelanggan akan otomatis mengumpulkan poin setiap kali bertransaksi. Poin tersebut bisa ditukar dengan voucher, promo, atau hadiah sesuai kebijakan kedai kopi."
        },
        {
            id: 5,
            question: "Apakah Spinofy hanya untuk coffee shop besar?",
            answer: "Tidak. Spinofy dapat digunakan oleh semua ukuran kedai kopi — dari usaha kecil hingga jaringan franchise."
        }
    ]
}
