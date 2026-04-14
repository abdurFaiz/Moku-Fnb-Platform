import React from "react";
import { motion } from "framer-motion";
import type { TransactionStatus } from "@/features/transaction/types/Transaction";

interface TransactionProgressIndicatorProps {
  status: TransactionStatus;
}

export default function TransactionProgressIndicator({
  status = "dalam-proses",
}: TransactionProgressIndicatorProps) {
  const [currentDalamProsesStep, setCurrentDalamProsesStep] = React.useState(1);

  // Reset step when status changes
  React.useEffect(() => {
    setCurrentDalamProsesStep(1);
  }, [status]);

  // Timer to advance to "Pesanan Disiapkan" step after 10 seconds when second step is active
  React.useEffect(() => {
    if (status === "dalam-proses" && currentDalamProsesStep === 1) {
      const timer = setTimeout(() => {
        setCurrentDalamProsesStep(2);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [status, currentDalamProsesStep]);
  const getStepLabel = (): string => {
    if (status === "pending") {
      return "Menunggu Pembayaran";
    }
    if (status === "dalam-proses") {
      return "Transaksi Berhasil";
    }
    if (status === "expired") {
      return "Waktu Habis";
    }
    return "Menunggu Pembayaran";
  };

  const getStepIcon = () => {
    if (status === "pending") {
      return (
        <svg width="28" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (status === "menunggu-konfirmasi") {
      return (
        <svg width="28" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (status === "expired") {
      return (
        <svg width="28" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
        <path fill="#e9e9e9" d="m10.6 13.8l-2.15-2.15q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7L9.9 15.9q.3.3.7.3t.7-.3l5.65-5.65q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22" />
      </svg>
    );
  };

  const getStepStatus = (step: number) => {
    switch (status) {
      case "pending":
        return step === 0 ? "active" : "inactive";
      case "menunggu-konfirmasi":
        return step === 0 ? "current" : "inactive";
      case "dalam-proses": {
        return step <= currentDalamProsesStep ? "active" : "inactive";
      }
      case "selesai":
        return "active";
      case "dibatalkan":
      case "ditolak":
        return step === 0 ? "active" : "inactive";
      case "expired":
        return step === 0 ? "error" : "inactive";
      default:
        return "inactive";
    }
  };

  const getStepStyles = (stepStatus: string) => {
    switch (stepStatus) {
      case "active":
        return {
          outer: "bg-orange-500 ",
          inner: "bg-orange-500 ",
          icon: "white",
          text: "text-title-black font-medium",
        };
      case "current":
        return {
          outer: "bg-indigo-100",
          inner: "bg-orange-500 ",
          icon: "white",
          text: "text-title-black font-medium",
        };
      case "error":
        return {
          outer: "bg-red-100",
          inner: "bg-red-500",
          icon: "white",
          text: "text-red-600 font-medium",
        };
      case "inactive":
      default:
        return {
          outer: "bg-gray-200",
          inner: "bg-white",
          icon: "#D1D5DB",
          text: "text-gray-400",
        };
    }
  };

  const steps = [
    {
      label: getStepLabel(),
      icon: getStepIcon(),
    },
    {
      label: "Pesanan Diterima",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 512 512">
          <path fill="currentColor" d="M255 22.31c-21.2 0-40.5 10.78-50.5 27.63l-4.4 7.42l-7.6-4.08c-7.1-3.85-15.2-5.89-23.3-5.89c-28.3 0-51.3 23.57-51.3 53.21c0 26.5 18.6 48.6 43.5 52.6l7.6 1.2v53.4c57.9-11.1 116-11.6 174 0v-69.7l4.8-2.6c15.7-8.3 26.1-26.1 26.1-46.15c0-28.8-20.7-51.12-45.4-51.12c-6.5 0-13 1.61-18.9 4.72l-6.2 3.2l-4.6-5.09C288 29.29 272 22.31 255 22.31m1 194.79c-25.6 0-51.1 2.4-76.7 7c-.9 6-1.3 12.2-1.3 18.6c0 29 9.2 55.2 23.6 73.7s33.5 29.3 54.4 29.3s40-10.8 54.4-29.3s23.6-44.7 23.6-73.7c0-6.4-.5-12.7-1.3-18.7c-25.6-4.7-51.1-7-76.7-6.9M208.7 348l-89.2 29.7l-27.98 112H321.6L307.1 388l17.8-2.6l14.9 104.3h80.7l-28-112l-89.2-29.7c-13.8 9.9-30 15.7-47.3 15.7s-33.5-5.8-47.3-15.7m69.3 52.7a10 10 0 0 1 10 10a10 10 0 0 1-10 10a10 10 0 0 1-10-10a10 10 0 0 1 10-10m7 46a10 10 0 0 1 10 10a10 10 0 0 1-10 10a10 10 0 0 1-10-10a10 10 0 0 1 10-10" />
        </svg>
      ),
    },
    {
      label: "Pesanan Disiapkan",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
          <path fill="currentColor" d="M1 15q0-2.725 2.275-4.362T8.5 9t5.225 1.638T16 15zm0 4v-2h15v2zm1 4q-.425 0-.712-.288T1 22v-1h15v1q0 .425-.288.713T15 23zm16 0v-8q0-2.85-1.95-4.925T11.275 7.3L11 5h5V1h2v4h5l-1.625 16.2q-.075.775-.638 1.288T19.4 23z" />
        </svg>
      ),
    },
    {
      label: "Selesai",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 48 48">
          <defs>
            <mask id="SVG92SymFYr">
              <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                <path fill="#fff" stroke="#fff" d="M38 4H10a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2" />
                <path stroke="#000" d="M17 30h14m-14 6h7m6-23l-8 8l-4-4" />
              </g>
            </mask>
          </defs>
          <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#SVG92SymFYr)" />
        </svg>),
    },
  ];

  const getActiveStepIndex = () => {
    switch (status) {
      case "pending":
      case "menunggu-konfirmasi":
      case "expired":
        return 0;
      case "dalam-proses":
        return currentDalamProsesStep;
      case "selesai":
        return 3;
      default:
        return 0;
    }
  };

  const activeStepIndex = getActiveStepIndex();

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between ">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const styles = getStepStyles(stepStatus);
          const isActive = stepStatus === "active" || stepStatus === "current" || stepStatus === "error";
          const stepKey = `${step.label}-${index}`;
          const isLineActive = index < activeStepIndex;

          const shouldShowLineOrange = status === "selesai" ? true : isLineActive;

          return (
            <React.Fragment key={stepKey}>
              {/* Step Circle */}
              <div className="flex flex-col items-center shrink-0">
                <motion.div
                  className={`relative ${styles.outer} rounded-lg flex items-center justify-center mb-1`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isActive ? [1, 1.05, 1] : 1,
                    opacity: 1
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.2
                  }}
                >
                  {stepStatus === "current" && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary-orange"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  )}
                  <motion.div
                    className={`${styles.inner} rounded-full size-10 flex items-center justify-center`}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.2 + 0.1
                    }}
                  >
                    <motion.div
                      style={{ color: styles.icon }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.2 + 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      {step.icon}
                    </motion.div>
                  </motion.div>
                </motion.div>
                <motion.p
                  className={`text-xs text-center w-20 ${styles.text} font-normal leading-tight `}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.2 + 0.2
                  }}
                >
                  {step.label}
                </motion.p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-[3px] relative overflow-hidden rounded-full ${shouldShowLineOrange ? "bg-orange-500" : "bg-gray-300"}`} style={{ minHeight: '4px' }}>
                  {/* Solid filled orange background */}
                  <motion.div
                    className="absolute inset-y-0 left-0 h-full bg-linear-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full shadow-lg"
                    initial={{ scaleX: shouldShowLineOrange ? 1 : 0, originX: 0 }}
                    animate={{
                      scaleX: shouldShowLineOrange ? 1 : 0,
                      boxShadow: shouldShowLineOrange ? [
                        "0 0 0 0 rgba(249, 115, 22, 0.4)",
                        "0 0 10px 2px rgba(249, 115, 22, 0.2)",
                        "0 0 0 0 rgba(249, 115, 22, 0)"
                      ] : "0 0 0 0 rgba(249, 115, 22, 0)"
                    }}
                    transition={{
                      scaleX: { duration: shouldShowLineOrange ? 0 : 1, delay: index * 0.2 + 0.4, ease: "easeInOut" },
                      boxShadow: { duration: 1.5, repeat: shouldShowLineOrange ? Infinity : 0, ease: "easeInOut" }
                    }}
                  />

                  {/* Animated progress bar indicator ONLY on the current active line (not completed lines) */}
                  {index === activeStepIndex && activeStepIndex < steps.length - 1 && (
                    <motion.div
                      className="absolute inset-y-0 h-full bg-linear-to-r from-orange-300 via-white to-transparent rounded-full shadow-lg"
                      style={{ width: '120px' }}
                      initial={{ left: '-120px' }}
                      animate={{ left: '100%' }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}