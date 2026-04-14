import React from "react";

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    minHeight?: string;
    maxWidth?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    className = "",
    maxWidth = "440px",
}) => {
    return (
        <div
            className={`bg-white h-auto flex flex-col ${className}`}
        >
            <div
                className="flex-1 border-b-0 border-r-2 border-l-2 border-body-grey/10 flex flex-col mx-auto w-full"
                style={{ maxWidth }}
            >
                {children}
            </div>
        </div>
    );
};