import React from "react";
import { ProtectedOutletRoute } from "@/components/ProtectedOutletRoute";

export const createProtectedOutletElement = (Component: React.ComponentType<any>) => {
    return (
        <ProtectedOutletRoute>
            {React.createElement(Component)}
        </ProtectedOutletRoute>
    );
};