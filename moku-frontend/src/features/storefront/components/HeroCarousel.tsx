import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBarcodeParams } from "@/features/storefront/hooks/useBarcodeParams";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { Heart, Store } from "lucide-react";
import type { Banner } from "@/features/storefront/types/Banner";
import type { Outlet } from "@/features/product/types/ProductQuery";

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

/**
 * Convert localhost URLs to 127.0.0.1:8000
 */
const convertBannerUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/http:\/\/localhost(?:\/|$)/, 'http://127.0.0.1:8000/');
};

interface SlideshowProps {
    banners: Banner[] | undefined;
    outlet: Outlet | null;
    isOpen: boolean;
    nextOpenTime: string | null;
}

export default function Slideshow({ banners: bannerList, outlet, isOpen, nextOpenTime }: SlideshowProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [autoPlay] = useState(true);
    const [showTableInfo, setShowTableInfo] = useState(false);
    const { tableNumber } = useBarcodeParams();
    const { navigateToTableNumber, navigateToFavorite } = useOutletNavigation();

    const banners = bannerList || [];
    const outletName = outlet?.name || outlet?.slug || "Outlet";

    useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(() => {
            paginate(1);
        }, 10000);

        return () => clearInterval(timer);
    }, [currentSlide, autoPlay]);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentSlide((prev) => {
            const next = prev + newDirection;
            if (banners.length === 0) return 0;
            if (next < 0) return banners.length - 1;
            if (next >= banners.length) return 0;
            return next;
        });
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
    };

    // Don't render if no banners
    if (banners.length === 0) {
        return (
            <div className="w-full max-w-4xl">
                <div className="relative h-[200px] rounded-b-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                    {/* top controls */}
                    <div className="absolute flex flex-row gap-2 right-4 top-4">
                        <motion.div
                            className="flex p-2 bg-white flex-row items-center justify-center w-fit rounded-full cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setShowTableInfo(!showTableInfo)}
                        >
                            <img loading="lazy" src="/icons/icon-table.svg" className="size-4" width={16} height={16} alt="table icon" />
                            <p className="font-rubik font-medium text-xs pl-2 whitespace-nowrap">Meja {tableNumber || '-'}</p>
                        </motion.div>
                        <button onClick={() => navigateToFavorite()} className="p-2 rounded-full bg-white hover:shadow-md">
                            <Heart className="w-4 h-4 text-title-black" />
                        </button>
                    </div>

                    <p className="text-gray-500">No banners available</p>
                </div>
            </div>
        );
    }

    // Show closed message if outlet is closed
    if (!isOpen) {
        return (
            <div className="w-full max-w-4xl">
                <div className="relative h-[220px] rounded-b-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-700 font-medium">Outlet is currently closed</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {nextOpenTime ? `Will open back ${nextOpenTime}` : 'Will open back soon'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const currentBanner = banners[currentSlide];

    return (
        <div className="w-full max-w-4xl">
            <div className="relative h-60 rounded-b-2xl overflow-hidden ">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.a
                        key={currentBanner.id}
                        href={currentBanner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(_e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing block"
                    >
                        <img loading="eager"
                            fetchPriority="high"
                            style={{ contentVisibility: 'auto' }}
                            decoding='async'
                            width={440}
                            height={220}
                            src={convertBannerUrl(currentBanner.banner_url)}
                            alt={`Banner ${currentSlide + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay from bottom white to top transparent */}
                        <div className="absolute inset-0 bg-linear-to-t from-white to-60% to-transparent" />
                    </motion.a>
                </AnimatePresence>
                <div className="absolute flex flex-row gap-2 right-4 top-4">
                    <motion.div
                        className="flex p-2 bg-white flex-row items-center justify-center w-fit rounded-full cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setShowTableInfo(!showTableInfo)}
                    >
                        <img loading="lazy" decoding="async" fetchPriority="auto" src="/icons/icon-table.svg" className="size-4" width={16} height={16} alt="table icon" />
                        <p className="font-rubik font-medium text-xs pl-2 items-center flex gap-1 text-shadow-title-black whitespace-nowrap">
                            Meja {tableNumber || '-'}
                            <motion.span
                                initial={false}
                                animate={{ width: showTableInfo ? "auto" : 0, opacity: showTableInfo ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden inline-block"
                            >
                                {" • "}
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToTableNumber();
                                }} className="text-primary-orange hover:underline font-semibold">
                                    Pindah Meja Tap Sini
                                </button>
                            </motion.span>
                        </p>
                    </motion.div>
                    <button onClick={() => navigateToFavorite()} className="p-2 rounded-full bg-white cursor-pointer hover:shadow-md transition-shadow" aria-label="favorite" title="favorite">
                        <Heart className="w-4 h-4 text-title-black" />
                    </button>
                </div>
                <div className="absolute flex flex-row gap-3 left-4 top-4">
                    <motion.div
                        className="flex p-2 bg-white flex-row  items-center justify-center w-fit rounded-full cursor-pointer line-clamp-1 max-w-2xs hover:shadow-md transition-shadow"
                        onClick={() => setShowTableInfo(showTableInfo)}
                    >
                        <Store className="size-5" />
                        <p className="font-rubik font-medium text-xs pl-2 text-shadow-title-black whitespace-nowrap">
                            {outletName}
                        </p>
                    </motion.div>
                </div>

                {/* Dot Pagination */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2  rounded-full">
                    {banners.map((banner, index) => (
                        <button
                            key={banner.id}
                            onClick={() => goToSlide(index)}
                            className="relative group"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <motion.div
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? "w-6 bg-primary-orange"
                                    : "w-2 bg-primary-orange/50 hover:bg-primary-orange/70"
                                    }`}
                                animate={{
                                    scale: index === currentSlide ? 1 : 0.9,
                                }}
                                whileHover={{ scale: 1.1 }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}