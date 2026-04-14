import { ScreenWrapper } from "./components/layout/ScreenWrapper";
import Button from "./components/ui/button";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"

export default function ComingSoon() {
    const { navigateToHome } = useOutletNavigation();

    return (
        <ScreenWrapper>
            <div className="flex flex-col gap-6 items-center justify-center p-4 my-auto">
                <img loading="lazy" src="/images/comingsoon.svg" alt="" className="w-full" />
                <div className="flex flex-col gap-4 px-6">
                    <h1 className="text-2xl text-center font-rubik text-primary-orange font-medium">
                        Halaman ini masih dalam pengembangan
                    </h1>
                    <p className="text-base text-center font-rubik text-body-grey">
                        Kamu bisa kembali dan lanjut pesan seperti biasa
                    </p>
                    <Button onClick={navigateToHome} variant="primary" size="xl">
                        Kembali Ke Beranda
                    </Button>
                </div>
            </div>
        </ScreenWrapper>
    );
}
