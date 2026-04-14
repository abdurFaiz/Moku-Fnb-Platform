import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes.js";
// pages
import Home from "../pages/welcome/Welcome.jsx";
import LinkVerification from "../pages/welcome/LinkVerif.jsx";

// routes guards

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.welcome} element={<Home />} />
                <Route
                    path="*"
                    element={<Navigate to={ROUTES.welcome} replace />}
                />
                <Route path={ROUTES.veriflink} element={<LinkVerification />} />
            </Routes>
        </BrowserRouter>
    );
};
