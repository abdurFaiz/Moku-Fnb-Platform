import { ArrowUpIcon } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from 'react';
import { ScreenWrapper } from "./layout/ScreenWrapper";

export default function ButtonBackToUp({ threshold = 240 }: { threshold?: number }) {
    const [visible, setVisible] = useState(false);
    const rafRef = useRef<number | null>(null);

    const checkScroll = useCallback((target: EventTarget | null) => {
        try {
            if (target === window) {
                const y = window.scrollY || window.pageYOffset;
                setVisible(y > threshold);
            } else if (target && target instanceof HTMLElement) {
                setVisible((target as HTMLElement).scrollTop > threshold);
            }
        } catch (e) {
            // ignore
        }
    }, [threshold]);

    useEffect(() => {
        // Throttle scroll events using requestAnimationFrame
        const createThrottledHandler = (target: EventTarget) => {
            return () => {
                if (rafRef.current !== null) return;

                rafRef.current = requestAnimationFrame(() => {
                    checkScroll(target);
                    rafRef.current = null;
                });
            };
        };

        const handlers: Array<{ el: EventTarget; fn: EventListener }> = [];

        const windowHandler = createThrottledHandler(window);
        window.addEventListener('scroll', windowHandler, { passive: true });
        handlers.push({ el: window, fn: windowHandler });

        const containers = Array.from(document.querySelectorAll<HTMLElement>('[class*="overflow-y-auto"]'));
        containers.forEach((c) => {
            const fn = createThrottledHandler(c);
            c.addEventListener('scroll', fn, { passive: true });
            handlers.push({ el: c, fn });
        });

        // Initial check
        checkScroll(window);
        if (containers.length > 0) checkScroll(containers[0]);

        return () => {
            // Cancel any pending animation frame
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }

            handlers.forEach(({ el, fn }) => {
                try {
                    if (el === window) window.removeEventListener('scroll', fn);
                    else if (el instanceof HTMLElement) el.removeEventListener('scroll', fn);
                } catch (e) {
                    // ignore
                }
            });
        };
    }, [checkScroll]);

    const handleBackToUp = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <ScreenWrapper>
            <div
                className={`fixed bottom-44 left-0 right-0 mx-auto max-w-[440px] px-4 z-30 flex justify-end transition-all duration-500 ease-out pointer-events-none ${visible
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-8 scale-95'
                    }`}
            >
                <button
                    aria-hidden={!visible}
                    className="bg-primary-orange w-fit text-white p-2 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 pointer-events-auto"
                    onClick={handleBackToUp}
                    onKeyDown={(e) => e.key === 'Enter' && handleBackToUp()}
                    tabIndex={visible ? 0 : -1}
                    type="button"
                >
                    <ArrowUpIcon className="size-6" />
                </button>
            </div>
        </ScreenWrapper>
    );
}