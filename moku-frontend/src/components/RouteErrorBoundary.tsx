import { useEffect, useMemo } from "react";
import {
    isRouteErrorResponse,
    
    useNavigate,
    useRouteError,
} from "react-router-dom";
import { AlertTriangle} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScreenWrapper } from "./layout/ScreenWrapper";

const DYNAMIC_IMPORT_ERROR = "Failed to fetch dynamically imported module";

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    useEffect(() => {
        console.error("Route error captured", error);
    }, [error]);

    const { title, description } = useMemo(() => {
        if (isRouteErrorResponse(error)) {
            if (error.status === 404) {
                return {
                    title: "Halaman tidak ditemukan",
                    description:
                        "Kami tidak dapat menemukan halaman yang Anda minta. Periksa URL atau kembali ke beranda.",

                };
            }

            return {
                title: "Terjadi kesalahan",
                description:
                    "Kami mengalami kendala saat memuat halaman ini. Silakan coba lagi beberapa saat.",
            };
        }

        if (error instanceof Error) {
            if (error.message.includes(DYNAMIC_IMPORT_ERROR)) {
                return {
                    title: "Gagal memuat halaman",
                    description:
                        "Komponen halaman tidak dapat dimuat sepenuhnya. Pastikan koneksi internet stabil lalu coba lagi.",
                    technicalDetails: error.message,
                };
            }

            return {
                title: "Ups, ada yang salah",
                description:
                    "Aplikasi mengalami kendala tak terduga. Kami sudah mencatatnya, silakan coba muat ulang.",
                technicalDetails: `${error.name}: ${error.message}`,
            };
        }

        return {
            title: "Terjadi kesalahan",
            description:
                "Halaman tidak dapat ditampilkan saat ini. Coba muat ulang atau kembali ke beranda.",
            technicalDetails: typeof error === "string" ? error : JSON.stringify(error, null, 2),
        };
    }, [error]);

    const handleReload = () => {
        navigate(0);
    };

    const handleGoHome = () => {
        navigate("/outlet-selection", { replace: true });
    };

    return (
        <ScreenWrapper>
            <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-white to-slate-50 px-4 py-16">
                <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/80 p-10 shadow-xl backdrop-blur">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-primary-orange">
                        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">{title}</h1>
                    <p className="mt-3 text-center text-sm text-slate-600">
                        {description}
                    </p>

                    <div className=" mt-5 flex flex-col gap-3 sm:flex-row">
                        <Button onClick={handleReload} className="flex-1 text-xs" size="sm">
                             Muat ulang halaman
                        </Button>
                        <Button onClick={handleGoHome} variant="outline" className="flex-1 text-xs" size="sm">
                            Kembali ke beranda
                        </Button>
                    </div>
                </div>
            </div>
        </ScreenWrapper>
    );
}