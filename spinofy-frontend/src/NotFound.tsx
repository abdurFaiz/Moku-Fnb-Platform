import { ScreenWrapper } from "./components/layout/ScreenWrapper";
import Button from "./components/ui/button";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"

export default function NotFound() {
    const { navigateToHome } = useOutletNavigation();

    return (
        <ScreenWrapper className="min-h-screen">
            <div className="flex flex-col gap-6 items-center justify-center  p-4 my-auto">
                <img loading="lazy" src="/images/404.svg" alt="" className="w-full" />
                <div className="flex flex-col gap-4 px-6">
                    <h1 className="text-2xl text-center font-rubik text-primary-orange font-medium">
                        Sistem Tidak Mengerti Permintaan Ini
                    </h1>
                    <p className="text-base text-center font-rubik text-body-grey">
                        Bisa jadi link-nya salah atau sudah nggak tersedia. Yuk pilih halaman yang tersedia.
                    </p>
                    <Button onClick={navigateToHome} variant="primary" size="xl">
                        Kembali Ke Beranda
                    </Button>
                </div>
            </div>
        </ScreenWrapper>
    );
}
