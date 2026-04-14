import React from "react";

interface CardProps {
    children: React.ReactNode;
    /**
     * Optional additional class names to merge with base styles.
     */
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    const baseStyles =
        "p-1 rounded-2xl border border-body-grey/15 bg-white overflow-hidden";

    return <div className={`${baseStyles} ${className}`}>{children}</div>;
}