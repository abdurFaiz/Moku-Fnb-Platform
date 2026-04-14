import React from "react";
import { useNavigate } from "react-router-dom";
import { getDay } from "date-fns";
import { Clock8, MapPin } from "lucide-react";
import type { OperationalSchedule } from "@/features/outlets/types/Outlet";
import { SkeletonLoader } from "@/components/LoadingSpinner";
import { useOutlets } from "@/features/outlets/hooks/api/useQueryOutlet";

/**
 * Convert localhost URLs to 127.0.0.1:8000
 */
const convertImageUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/http:\/\/localhost(?:\/|$)/, 'http://127.0.0.1:8000/');
};

const toReadableTime = (time: string | null) => {
    if (!time) return ""
    const [h, m] = time.split(":")
    const hour = parseInt(h, 10)
    const minute = m
    const isMorning = hour < 12

    const label = isMorning ? "Pagi" : "Sore"
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute} ${label}`
}

const getTodaySchedule = (schedules: OperationalSchedule[]) => {
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return "Jadwal tidak tersedia"
    }

    const today = new Date()
    const dayOfWeek = getDay(today)
    const schedule = schedules.find(s => s.day === dayOfWeek)

    if (!schedule || !schedule.is_open) {
        return "Tutup hari ini"
    }

    const openReadable = toReadableTime(schedule.open_time)
    const closeReadable = toReadableTime(schedule.close_time)

    return `Buka Jam  ${openReadable} - ${closeReadable}`
}

interface OutletSelectionProps {
    onOutletSelect?: (outletSlug: string) => void;
}

export const OutletSelection: React.FC<OutletSelectionProps> = ({ onOutletSelect }) => {
    const navigate = useNavigate();
    const {
        data: outlets,
        isLoading,
        error
    } = useOutlets({
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const handleOutletSelect = (outletSlug: string) => {
        if (onOutletSelect) {
            onOutletSelect(outletSlug);
        } else {
            navigate(`/${outletSlug}/home`);
        }
    };

    if (isLoading) {
        return (
            <SkeletonLoader className="max-w-none w-full" />
        );
    }

    if (error || !outlets?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <p className="text-red-500 text-center">
                    {error ? "Failed to load outlets" : "No outlets available"}
                </p>
                <button
                    onClick={() => globalThis.location.reload()}
                    className="mt-4 px-4 py-2 bg-primary-orange text-white rounded-lg"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-medium text-title-black mb-2">
                    Pilih Outlet Kamu Inginkan
                </h2>
            </div>

            <div className="flex flex-col gap-4">
                {outlets.map((outlet) => (
                    <div key={outlet.id} className="">
                        <div className="relative border bg-white border-body-grey/15 rounded-3xl p-0.5 transition-shadow duration-300 ease-out hover:shadow-neutral-50 hover:shadow-xs hover:border-primary-orange/20 cursor-pointer ">
                            <button
                                onClick={() => handleOutletSelect(outlet.slug)}
                                className="flex max-w-full h-28 flex-row cursor-pointer overflow-hidden justify-between w-full items-center rounded-3xl bg-white">
                                <div className="relative max-w-32 w-full h-28">
                                    <img loading="lazy"
                                        style={{ contentVisibility: 'auto' }}
                                        decoding='async'
                                        src={convertImageUrl(outlet.media[0]?.original_url || outlet.logo_url)} alt="logo outlet" className=" h-full w-full object-contain rounded-3xl" />
                                </div>
                                <div className="flex relative items-start size-full flex-col gap-2 overflow-clip justify-center px-4 py-3">
                                    <div className="flex z-50 flex-col items-start gap-2">
                                        <div className="absolute top-0 right-0 px-0.5 w-fit rounded-bl-3xl rounded-tr-3xl">
                                            <div className="flex justify-end items-center gap-2 px-2 py-1 rounded-bl-3xl rounded-tr-3xl bg-white">
                                                <img loading="lazy" src="/icons/icon-poin.svg" alt="" className="size-5" />
                                                <span className="text-sm font-medium text-title-black truncate font-rubik max-w-[120px]">{outlet.total_point}</span>
                                                <span className="text-xs text-gray-500">poin</span>
                                            </div>
                                        </div>

                                        <h1 className="font-medium text-base font-rubik line-clamp-1 text-ellipsis text-title-black">
                                            {outlet.name}
                                        </h1>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex gap-2 items-center justify-start ">
                                            <Clock8 className="size-4 text-body-grey" />
                                            <span className="text-sm text-body-grey">{getTodaySchedule(outlet.operational_schedules)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 z-50 text-left max-w-60 w-full">
                                            {outlet.address && (
                                                <div className="flex gap-2 items-center justify-start">
                                                    <MapPin className="size-4 text-body-grey" />
                                                    <p className="text-sm text-body-grey line-clamp-1 text-ellipsis">
                                                        {outlet.address}
                                                    </p>
                                                </div>
                                            )}

                                            {/* {outlet.phone && (
                                                <div className="flex gap-2 items-center justify-start">
                                                    <Phone className="size-4 text-body-grey" />
                                                    <p className="text-sm text-body-grey line-clamp-1">
                                                        {outlet.phone}
                                                    </p>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        {/* <div
                            onClick={() => {
                                setSelectedOutlet(outlet);
                                setDrawerOpen(true);
                            }}
                            className="flex items-center flex-row px-6 pt-8 -mt-6 pb-3 rounded-b-3xl bg-primary-orange/20 cursor-pointer hover:bg-primary-orange/30 transition-colors">
                            <span className="text-sm text-primary-orange font-rubik font-medium leading-relaxed">Lihat Selengkapnya Jadwal Outlet</span>
                            <ChevronRightIcon className="w-4 h-4 text-primary-orange ml-1" />
                        </div> */}

                    </div>
                ))}
            </div>
        </div>
    );
};
