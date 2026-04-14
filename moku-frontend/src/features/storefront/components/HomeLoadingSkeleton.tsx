import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-10 animate-pulse">
            {/* Slideshow Skeleton */}
            <Skeleton className="w-full h-60 rounded-lg" />

            {/* User Points Card Skeleton */}
            <Skeleton className="w-full h-20 px-6 rounded-lg" />

            {/* Recommended Products Section */}
            <div className="px-4 flex flex-col gap-4">
                <Skeleton className="w-32 h-6 rounded" />
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="shrink-0 w-48">
                            <Skeleton className="w-full h-40 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories Section */}
            <div className="flex flex-col gap-10 mb-44">
                {/* Menu Section */}
                <div className="px-4 flex flex-col gap-4">
                    <Skeleton className="w-24 h-6 rounded" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((item) => (
                            <Skeleton key={item} className="w-20 h-10 rounded-full" />
                        ))}
                    </div>
                </div>

                {/* Product Cards */}
                {[1, 2, 3].map((section) => (
                    <div key={section} className="px-4 flex flex-col gap-4">
                        <Skeleton className="w-32 h-6 rounded" />
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((item) => (
                                <Skeleton key={item} className="w-full h-48 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
