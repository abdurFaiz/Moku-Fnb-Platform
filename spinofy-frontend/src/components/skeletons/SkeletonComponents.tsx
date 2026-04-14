import { Skeleton } from "@/components/ui/skeleton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";

// Base skeleton container with shimmer animation
export function SkeletonContainer({
    children,
    className = "",
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={`animate-pulse ${className}`} {...props}>
            {children}
        </div>
    );
}

// Header Bar Skeleton
export function SkeletonHeaderBar() {
    return (
        <div className="flex items-center justify-between px-4 py-5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </div>
    );
}

// Voucher Card Skeleton
export function SkeletonVoucherCard() {
    return (
        <SkeletonContainer className="w-full h-[190px] relative">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full">
                <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                </div>
            </div>
        </SkeletonContainer>
    );
}

// Transaction Card Skeleton
export function SkeletonTransactionCard() {
    return (
        <SkeletonContainer className="p-4 rounded-[20px] border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4">
                {/* Status badge skeleton */}
                <div className="flex justify-between items-start">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Content skeleton */}
                <div className="flex flex-col gap-3 pb-4 border-b border-dashed border-gray-200">
                    <div className="flex gap-3">
                        <Skeleton className="w-[143px] h-[112px] rounded-2xl flex-shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                </div>

                {/* Footer skeleton */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            </div>
        </SkeletonContainer>
    );
}

// Product Item Skeleton
export function SkeletonProductItem() {
    return (
        <SkeletonContainer className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-200">
            <Skeleton className="w-full h-40 rounded-xl" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex items-center justify-between mt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </SkeletonContainer>
    );
}

// Menu Item Skeleton (for lists)
export function SkeletonMenuItem() {
    return (
        <SkeletonContainer className="flex items-center gap-4 p-4">
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
            </div>
        </SkeletonContainer>
    );
}

// Payment Detail Section Skeleton
export function SkeletonPaymentDetails() {
    return (
        <ScreenWrapper>
            <SkeletonContainer className="flex flex-col gap-4">
                <Skeleton className="h-5 w-32" />
                <div className="flex flex-col gap-3">
                    {Array(4).fill(0).map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </SkeletonContainer>
        </ScreenWrapper>
    );
}

// User Stats Card Skeleton
export function SkeletonUserStats() {
    return (
        <SkeletonContainer className="flex gap-4 px-4">
            {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex-1 p-4 bg-white rounded-2xl border border-gray-200">
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            ))}
        </SkeletonContainer>
    );
}

// Filter Chips Skeleton
export function SkeletonFilterChips() {
    return (
        <SkeletonContainer className="flex gap-3 px-4 py-6">
            {Array(4).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-8 w-20 rounded-full" />
            ))}
        </SkeletonContainer>
    );
}

// List Section Skeleton
export function SkeletonListSection({ itemCount = 3 }: { itemCount?: number }) {
    return (
        <SkeletonContainer className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col gap-4 px-4">
                {Array(itemCount).fill(0).map((_, index) => (
                    <SkeletonVoucherCard key={index} />
                ))}
            </div>
        </SkeletonContainer>
    );
}

// Point History Item Skeleton
export function SkeletonPointHistoryItem() {
    return (
        <SkeletonContainer className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
        </SkeletonContainer>
    );
}

// Full Page Skeletons for different pages
export function SkeletonVouchersPage() {
    return (
        <ScreenWrapper>
            <div className="sticky top-0 z-10 bg-white rounded-b-3xl shadow-sm">
                <div className="px-4 py-5 flex flex-col gap-6">
                    <SkeletonHeaderBar />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>

            <div className="flex flex-col gap-9 mt-6 mb-28">
                <SkeletonListSection itemCount={2} />
                <SkeletonListSection itemCount={3} />
                <SkeletonListSection itemCount={1} />
            </div>
        </ScreenWrapper>
    );
}

export function SkeletonTransactionsPage() {
    return (
        <ScreenWrapper>
            <SkeletonHeaderBar />
            <SkeletonFilterChips />
            <div className="flex flex-col gap-6 px-4 pb-4">
                {Array(5).fill(0).map((_, index) => (
                    <SkeletonTransactionCard key={index} />
                ))}
            </div>
        </ScreenWrapper>
    );
}

export function SkeletonAccountPage() {
    return (
        <ScreenWrapper>
            {/* User info skeleton */}
            <div className="px-4 pt-6 pb-4">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-32 bg-white/20" />
                            <Skeleton className="h-4 w-48 bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats skeleton */}
            <SkeletonUserStats />

            {/* Settings sections skeleton */}
            <div className="px-4 pb-6 flex-col flex gap-6 mt-8">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-5 w-32" />
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center justify-between py-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <Skeleton className="h-5 w-20" />
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center justify-between py-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                    ))}
                </div>
            </div>
        </ScreenWrapper>
    );
}

export function SkeletonCheckoutPage() {
    return (
        <ScreenWrapper>
            <SkeletonHeaderBar />

            {/* Order items skeleton */}
            <div className="px-4 mt-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex flex-col gap-4">
                    {Array(2).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
                            <Skeleton className="w-16 h-16 rounded-xl" />
                            <div className="flex-1 flex flex-col gap-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-6" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment details skeleton */}
            <div className="px-4 mt-8">
                <SkeletonPaymentDetails />
            </div>

            {/* Checkout button skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </ScreenWrapper>
    );
}

export function SkeletonPaymentPage() {
    return (
        <ScreenWrapper>
            <SkeletonHeaderBar />

            <div className="flex-1 px-4 pt-6 pb-8">
                {/* Timer skeleton */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-8 w-24" />
                </div>

                {/* QR Code section skeleton */}
                <div className="flex flex-col items-center gap-6 mb-8">
                    <Skeleton className="w-64 h-64 rounded-2xl" />
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>
                </div>

                {/* Payment details skeleton */}
                <SkeletonPaymentDetails />
            </div>
        </ScreenWrapper>
    );
}

export function SkeletonDetailTransactionPage() {
    return (
        <ScreenWrapper>
            <SkeletonHeaderBar />

            {/* Progress indicator skeleton */}
            <div className="px-4 py-6">
                <div className="flex items-center justify-between">
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Order details skeleton */}
            <div className="px-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        {/* Order items */}
                        <div className="flex flex-col gap-4">
                            {Array(2).fill(0).map((_, index) => (
                                <SkeletonMenuItem key={index} />
                            ))}
                        </div>

                        {/* Payment details */}
                        <SkeletonPaymentDetails />
                    </div>
                </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                </div>
            </div>
        </ScreenWrapper>
    );
}

export function SkeletonDetailItemPage() {
    return (
        <ScreenWrapper>
            <SkeletonHeaderBar />

            {/* Product image skeleton */}
            <div className="px-4 mt-6">
                <Skeleton className="w-full h-64 rounded-2xl" />
            </div>

            {/* Product info skeleton */}
            <div className="px-4 mt-6">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>

            {/* Attributes skeleton */}
            <div className="px-4 mt-8">
                <div className="flex flex-col gap-6">
                    {Array(2).fill(0).map((_, attrIndex) => (
                        <div key={attrIndex} className="flex flex-col gap-4">
                            <Skeleton className="h-5 w-32" />
                            <div className="flex flex-wrap gap-3">
                                {Array(3).fill(0).map((_, optionIndex) => (
                                    <Skeleton key={optionIndex} className="h-10 w-20 rounded-full" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes section skeleton */}
            <div className="px-4 mt-8">
                <Skeleton className="h-5 w-24 mb-4" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>

            {/* Quantity and add to cart skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-8" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
            </div>
        </ScreenWrapper>
    );
}

// Small skeleton components for inline loading states
export function SkeletonText({ className = "h-4 w-20" }: { className?: string }) {
    return <Skeleton className={className} />;
}

export function SkeletonButton({ className = "h-10 w-24" }: { className?: string }) {
    return <Skeleton className={`rounded-md ${className}`} />;
}

export function SkeletonAvatar({ className = "w-10 h-10" }: { className?: string }) {
    return <Skeleton className={`rounded-full ${className}`} />;
}

export function SkeletonCard({ className = "w-full h-32" }: { className?: string }) {
    return <Skeleton className={`rounded-xl ${className}`} />;
}

// Skeleton for product grid
export function SkeletonProductGrid({ itemCount = 6 }: { itemCount?: number }) {
    return (
        <div className="grid grid-cols-2 gap-4 px-4">
            {Array(itemCount).fill(0).map((_, index) => (
                <SkeletonProductItem key={index} />
            ))}
        </div>
    );
}

// Skeleton for menu list
export function SkeletonMenuList({ itemCount = 5 }: { itemCount?: number }) {
    return (
        <div className="flex flex-col gap-3 px-4">
            {Array(itemCount).fill(0).map((_, index) => (
                <SkeletonMenuItem key={index} />
            ))}
        </div>
    );
}

export function SkeltonReward() {
return(
    <div className="flex flex-col gap-8">
        {/* Points Summary Skeleton */}
        <div className="mx-4 p-6 rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-24 mb-4" />
            <Skeleton className="h-4 w-48" />
        </div>

        {/* Voucher Section Skeleton */}
        <div className="mx-4">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16" />
            </div>

            {/* Voucher Cards Skeleton */}
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((index) => (
                    <div key={index} className="p-4 rounded-3xl bg-white border">
                        <div className="flex justify-between items-start mb-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)
}