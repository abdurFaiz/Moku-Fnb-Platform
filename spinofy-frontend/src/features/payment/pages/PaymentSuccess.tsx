import { Button, ScreenWrapper } from "@/components";
import { motion } from "framer-motion";
import { Confetti } from "@/components/ui/confetti";
import { useEffect, useRef, useState } from "react";
import type { Options as ConfettiOptions } from "canvas-confetti";
import { useLocation, useNavigate } from "react-router-dom";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";

export default function PaymentSuccess() {
    const confettiRef = useRef<{ fire: (options?: ConfettiOptions) => void } | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const outletSlug = useOutletSlug();
    const [countdown, setCountdown] = useState(15);

    // Get order data from location state
    const orderCode = location.state?.orderCode;
    const transactionStatus = location.state?.status || 'dalam-proses';
    const customerPoints = location.state?.points;

    useEffect(() => {
        const fireConfetti = () => {
            if (confettiRef.current) {
                // Left cannon
                confettiRef.current.fire({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 },
                    startVelocity: 50,
                });

                // Right cannon
                confettiRef.current.fire({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 },
                    startVelocity: 50,
                });
            }
        };

        // Initial fire
        const initialTimer = setTimeout(fireConfetti, 500);

        // Continuous side cannons - fire every 400ms
        const interval = setInterval(fireConfetti, 4000);

        // Cleanup
        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    // Countdown timer and auto-redirect to DetailTransaction
    useEffect(() => {
        if (!orderCode) return;

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Auto redirect after 15 seconds
        const redirectTimer = setTimeout(() => {
            if (outletSlug && orderCode) {
                navigate(`/${outletSlug}/detail-transaction?code=${orderCode}&status=${transactionStatus}`, {
                    state: {
                        showPointsToast: true,
                        points: customerPoints,
                    },
                    replace: true,
                });
            }
        }, 10000); // 10 seconds

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimer);
        };
    }, [orderCode, outletSlug, navigate, transactionStatus]);

    // Manual navigation to detail transaction
    const handleViewOrder = () => {
        if (outletSlug && orderCode) {
            navigate(`/${outletSlug}/detail-transaction?code=${orderCode}&status=${transactionStatus}`, {
                state: {
                    showPointsToast: true,
                    points: customerPoints,
                },
                replace: true,
            });
        }
    };

    return (
        <ScreenWrapper>
            {/* Confetti canvas - fixed positioning */}
            <Confetti
                ref={confettiRef}
                className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
                manualstart={true}
            />

            <div className="flex flex-col justify-center gap-6 items-center h-auto px-6 my-auto relative">
                {/* Animated Image with fade in and floating coffee effect */}
                <motion.img
                    src="/images/transfer-success.png"
                    alt=""
                    className="size-[360px] mt-20"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        y: [0, -15, 0],
                    }}
                    transition={{
                        opacity: {
                            duration: 0.8,
                            ease: "easeOut"
                        },
                        y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.8
                        }
                    }}
                />

                <div className="flex flex-col gap-40">
                    {/* Animated Text Content */}
                    <motion.div
                        className="flex flex-col gap-2"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <motion.h1
                            className="font-rubik text-2xl font-medium text-title-black leading-normal"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            Sip, Pesanan Diterima
                        </motion.h1>
                        <motion.p
                            className="font-rubik font-normal text-sm text-body-grey"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            Barista udah dapet pesananmu. Waktunya santai dulu sambil nunggu aroma kopi nyebar.
                        </motion.p>
                    </motion.div>

                    {/* Animated Button with hover effect and countdown */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="primary"
                            className="w-full"
                            size="xl"
                            onClick={handleViewOrder}
                        >
                            Pantau Terus Pesanan {countdown > 0 && `(${countdown}s)`}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </ScreenWrapper>
    )
}