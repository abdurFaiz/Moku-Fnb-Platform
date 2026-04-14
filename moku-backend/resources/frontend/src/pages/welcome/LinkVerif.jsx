export default function LinkVerif() {
    const handleWhatsAppClick = () => {
        // WhatsApp integration - update with actual WhatsApp number
        window.open("https://wa.me/", "_blank");
    };

    return (
        <div className="min-h-[844px] bg-white flex flex-col">
            <div className="flex-1 flex justify-between flex-col max-w-[390px] mx-auto w-full">
                <div className="flex flex-col mt-32 gap-4">
                    <img
                        src="./icons/link-verif-icon.svg"
                        alt=""
                        className="size-12"
                    />
                    <div className="flex flex-col gap-3">
                        <h1 className="text-2xl font-bold text-title-black leading-tight font-rubik">
                            Kirim Pesan untuk Verifikasi
                        </h1>
                        <p className="text-base text-body-grey leading-normal">
                            Anda akan diarahkan ke WhatsApp. Kirim pesan yang
                            sudah tersedia untuk mendapatkan link verifikasi
                            dari sistem kami.
                        </p>
                    </div>
                </div>
                <div className="relative mb-20 w-full">
                    <button className=" p-4 w-full  bg-primary-orange hover:bg-primary-orange/90 transition-colors rounded-[32px] text-white font-medium text-base">
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    );
}
