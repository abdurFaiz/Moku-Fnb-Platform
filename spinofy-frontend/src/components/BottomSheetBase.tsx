import React from "react";
import { ScreenWrapper } from "./layout/ScreenWrapper";

interface BottomSheetBaseProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly children: React.ReactNode;
    readonly maxWidth?: string;
}

export default function BottomSheetBase({
    isOpen,
    onClose,
    children,
    maxWidth = "440px"
}: Readonly<BottomSheetBaseProps>) {
    if (!isOpen) return null;

    return (
        <ScreenWrapper>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <button
                        type="button"
                        className={`fixed inset-0 mx-auto bg-black/30 backdrop-blur-md z-40 animate-[fadeIn_0.3s_ease-out] cursor-default border-none p-0`}
                        style={{ maxWidth }}
                        onClick={onClose}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                onClose();
                            }
                        }}
                        aria-label="Close bottom sheet"
                    />

                    {/* Bottom Sheet Container */}
                    <div className="fixed inset-x-0 bottom-0 z-50 animate-[slideUp_0.3s_ease-out]">
                        {children}
                    </div>
                </>
            )}
        </ScreenWrapper>
    );
}
