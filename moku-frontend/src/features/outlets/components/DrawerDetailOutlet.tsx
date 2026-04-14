import { Clock8, MapPin, Phone, X } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useState } from "react";
import type { OperationalSchedule } from "@/features/outlets/types/Outlet";
import { getDay } from "date-fns";

export default function DrawerDetailOutlet() {
    const [selectedOutlet, _setSelectedOutlet] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
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
    const getDayName = (day: number): string => {
        const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return dayNames[day] || "";
    };

    const convertImageUrl = (url: string): string => {
        if (!url) return '';
        return url.replace(/http:\/\/localhost(?:\/|$)/, 'http://127.0.0.1:8000/');
    };
    return (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[85vh] max-w-[440px] mx-auto">
                <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div className="flex-1">
                        <DrawerTitle className="text-xl font-bold text-title-black">
                            {selectedOutlet?.name}
                        </DrawerTitle>
                    </div>
                    <DrawerClose asChild>
                        <button className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4">
                    {selectedOutlet && (
                        <>
                            {/* Logo dan Info Dasar */}
                            <div className="mb-6">
                                <div className="relative w-full h-60 mb-4 rounded-2xl overflow-hidden">
                                    <img loading="lazy"
                                        src={convertImageUrl(selectedOutlet.logo_url)}
                                        alt={selectedOutlet.name}
                                        className="w-full h-full object-cover "
                                    />
                                </div>

                                {/* Status Hari Ini */}
                                <div className="bg-primary-orange/10 border border-primary-orange/20 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock8 className="w-5 h-5 text-primary-orange" />
                                        <span className="text-sm font-medium text-primary-orange">
                                            {getTodaySchedule(selectedOutlet.operational_schedules)}
                                        </span>
                                    </div>
                                </div>

                                {/* Informasi Kontak */}
                                <div className="space-y-3">
                                    {selectedOutlet.address && (
                                        <div className="flex gap-3">
                                            <MapPin className="w-5 h-5 text-body-grey shrink-0 mt-0.5" />
                                            <p className="text-sm text-body-grey">{selectedOutlet.address}</p>
                                        </div>
                                    )}
                                    {selectedOutlet.phone && (
                                        <div className="flex gap-3">
                                            <Phone className="w-5 h-5 text-body-grey shrink-0 mt-0.5" />
                                            <p className="text-sm text-body-grey">{selectedOutlet.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Poin */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-body-grey">Poin Terkumpul</span>
                                        <div className="flex items-center gap-2">
                                            <img loading="lazy" src="/icons/icon-poin.svg" alt="poin" className="w-5 h-5" />
                                            <span className="font-semibold text-title-black">
                                                {selectedOutlet.total_point} poin
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Jadwal Lengkap */}
                            <div>
                                <h3 className="text-lg font-semibold text-title-black mb-4">
                                    Jadwal Operasional
                                </h3>
                                <div className="space-y-3">
                                    {selectedOutlet.operational_schedules &&
                                        selectedOutlet.operational_schedules.length > 0 ? (
                                        selectedOutlet.operational_schedules.map((schedule: OperationalSchedule) => {
                                            const dayName = getDayName(schedule.day);
                                            const isToday = getDay(new Date()) === schedule.day;
                                            const openReadable = toReadableTime(schedule.open_time);
                                            const closeReadable = toReadableTime(
                                                schedule.close_time
                                            );

                                            return (
                                                <div
                                                    key={schedule.id}
                                                    className={`p-3 rounded-lg border flex justify-between items-center ${isToday
                                                        ? "bg-primary-orange/10 border-primary-orange/30"
                                                        : "bg-gray-50 border-gray-200"
                                                        }`}
                                                >
                                                    <div className="flex-1">
                                                        <p
                                                            className={`text-sm font-medium ${isToday ? "text-primary-orange" : "text-title-black"
                                                                }`}
                                                        >
                                                            {dayName}
                                                            {isToday && " (Hari Ini)"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        {schedule.is_open ? (
                                                            <p className="text-sm text-body-grey">
                                                                {openReadable} - {closeReadable}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-red-500 font-medium">
                                                                Tutup
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-body-grey text-center py-4">
                                            Jadwal tidak tersedia
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer >
    )
}