import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
    className?: string;
}

export function SkeletonLoader({ className = '' }: SkeletonLoaderProps) {
    // allow callers to override or extend the default container styles
    const base = 'flex flex-col max-w-[440px] mx-auto px-4 mt-6 gap-6';
    const classes = `${base} ${className}`.trim();

    return (
        <div className={classes}>
            {/* Hero/Title Section */}
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="w-3/4 h-8 rounded" />
                <Skeleton className="w-1/2 h-6 rounded" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-5/6 h-4 rounded" />
            </div>

            {/* Card/List Section */}
            <div className="flex flex-col gap-3">
                <Skeleton className="w-full h-20 rounded-lg" />
                <Skeleton className="w-full h-20 rounded-lg" />
                <Skeleton className="w-full h-20 rounded-lg" />
            </div>

            {/* Footer/Action Section */}
            <div className="flex gap-4">
                <Skeleton className="flex-1 h-12 rounded-lg" />
                <Skeleton className="flex-1 h-12 rounded-lg" />
            </div>
        </div>
    );
}