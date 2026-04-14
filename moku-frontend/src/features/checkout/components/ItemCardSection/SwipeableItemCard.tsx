import React, { useState, useRef, useEffect } from 'react';
import { OrderItemCard, type OrderItemProps } from './OrderItemCard';

interface SwipeableItemCardProps extends OrderItemProps {
    onDelete: () => void;
    itemId: string;
}

export function SwipeableItemCard({
    onDelete,
    itemId,
    ...orderItemProps
}: SwipeableItemCardProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const isDraggingRef = useRef(false);
    const animationRef = useRef<number | null>(null);
    const hasDeletedRef = useRef(false);

    const SWIPE_DELETE_THRESHOLD = 120; // Minimum distance to trigger immediate deletion
    const MAX_SWIPE_DISTANCE = 200; // Maximum swipe distance for visual feedback

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isDeleting || hasDeletedRef.current) return;

        startXRef.current = e.touches[0].clientX;
        isDraggingRef.current = true;

        // Cancel any ongoing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDraggingRef.current || isDeleting || hasDeletedRef.current) return;

        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startXRef.current;

        // Only allow left swipe (negative deltaX)
        if (deltaX < 0) {
            const newTranslateX = Math.max(deltaX, -MAX_SWIPE_DISTANCE);
            setTranslateX(newTranslateX);

            // Trigger delete when threshold is reached
            if (Math.abs(deltaX) >= SWIPE_DELETE_THRESHOLD && !hasDeletedRef.current) {
                hasDeletedRef.current = true;
                handleDelete();
            }
        }
    };

    const handleTouchEnd = () => {
        isDraggingRef.current = false;

        // If not deleted and not currently deleting, snap back to original position
        if (!hasDeletedRef.current && !isDeleting) {
            animateToPosition(0);
        }
    };

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        try {
            // Animate item sliding away
            animateToPosition(-300);

            // Trigger delete after short delay for animation
            setTimeout(() => {
                try {
                    onDelete();
                } catch (error) {
                    setIsDeleting(false);
                    hasDeletedRef.current = false;
                    // Reset position on error
                    animateToPosition(0);
                }
            }, 150);
        } catch (error) {
            setIsDeleting(false);
            hasDeletedRef.current = false;

            // Reset position on error
            animateToPosition(0);
        }
    };

    const animateToPosition = (targetX: number) => {
        const startX = translateX;
        const distance = targetX - startX;
        const duration = 200; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentX = startX + (distance * easeOut);

            setTranslateX(currentX);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    // Clean up animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="relative overflow-hidden" ref={containerRef}>
            {/* Delete indicator background (behind the item) */}
            <div
                className={`absolute right-0 top-0 h-full bg-linear-to-l from-dark-red to-dark-red/70 flex items-center justify-center transition-all duration-200 rounded-r-3xl ${Math.abs(translateX) > 60 ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{
                    width: Math.min(Math.abs(translateX), MAX_SWIPE_DISTANCE),
                    zIndex: 1
                }}
            >
                <div className="text-white text-sm font-medium flex items-center gap-2 pr-4">
                    {Math.abs(translateX) >= SWIPE_DELETE_THRESHOLD ? (
                        <>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                            >
                                <path
                                    d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {isDeleting ? 'Menghapus...' : 'Lepas untuk hapus'}
                        </>
                    ) : (
                        <>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                            >
                                <path
                                    d="M15 18l-6-6 6-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Geser untuk hapus
                        </>
                    )}
                </div>
            </div>

            {/* Main item content */}
            <div
                className={`relative bg-white transition-transform rounded-3xl ${Math.abs(translateX) > 20 ? 'shadow-lg' : ''
                    } ${isDeleting ? 'opacity-75' : ''}`}
                style={{
                    transform: `translateX(${translateX}px)`,
                    zIndex: 2,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <OrderItemCard {...orderItemProps} />
            </div>
        </div>
    );
}