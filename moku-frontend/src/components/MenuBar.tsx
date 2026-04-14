import { cn } from "@/lib/utils";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";

const IconHome = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.97 2.59a1.5 1.5 0 0 0-1.94 0l-7.5 6.363A1.5 1.5 0 0 0 3 10.097V19.5A1.5 1.5 0 0 0 4.5 21h4.75a.75.75 0 0 0 .75-.75V14h4v6.25c0 .414.336.75.75.75h4.75a1.5 1.5 0 0 0 1.5-1.5v-9.403a1.5 1.5 0 0 0-.53-1.144z" />
    </svg>
);

const IconVoucher = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M4 4a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2a2 2 0 0 1-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1-2-2a2 2 0 0 1 2-2V6a2 2 0 0 0-2-2zm11.5 3L17 8.5L8.5 17L7 15.5zm-6.69.04c.98 0 1.77.79 1.77 1.77a1.77 1.77 0 0 1-1.77 1.77c-.98 0-1.77-.79-1.77-1.77a1.77 1.77 0 0 1 1.77-1.77m6.38 6.38c.98 0 1.77.79 1.77 1.77a1.77 1.77 0 0 1-1.77 1.77c-.98 0-1.77-.79-1.77-1.77a1.77 1.77 0 0 1 1.77-1.77" />
    </svg>
);

const IconTransaction = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <g fill="none">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
            <path fill="currentColor" d="M16 3a3 3 0 0 1 2.995 2.824L19 6v10h.75c.647 0 1.18.492 1.244 1.122l.006.128V19a3 3 0 0 1-2.824 2.995L18 22H8a3 3 0 0 1-2.995-2.824L5 19V9H3.25a1.25 1.25 0 0 1-1.244-1.122L2 7.75V6a3 3 0 0 1 2.824-2.995L5 3zm3 15h-9v1c0 .35-.06.687-.17 1H18a1 1 0 0 0 1-1zm-7-6h-2a1 1 0 0 0-.117 1.993L10 14h2a1 1 0 0 0 .117-1.993zm2-4h-4a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2M5 5a1 1 0 0 0-1 1v1h1z" />
        </g>
    </svg>
);

const IconUser = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="21px" height="24px" viewBox="0 0 448 512" fill="currentColor" {...props}>
        <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128m89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4" />
    </svg>
);

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        id: "home",
        icon: <IconHome />,
        label: "Home",
        path: "/home"
    },
    {
        id: "voucher",
        icon: <IconVoucher />,
        label: "Voucher",
        path: "/vouchers"
    },
    {
        id: "pesanan",
        icon: <IconTransaction />,
        label: "Pesanan",
        path: "/transactions"
    },
    {
        id: "akun",
        icon: <IconUser />,
        label: "Akun",
        path: "/account"
    }
];

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const outletSlug = useOutletSlug();
    const { navigateToHome, navigateToVouchers, navigateToAccount } = useOutletNavigation();

    const getActiveTab = () => {
        const currentPath = location.pathname;
        // Remove outlet slug from path for comparison
        const pathWithoutSlug = currentPath.replace(`/${outletSlug}`, '') || '/';
        const activeItem = NAV_ITEMS.find(item => item.path === pathWithoutSlug);
        return activeItem ? activeItem.id : "home";
    };

    const activeTab = getActiveTab();

    const handleTabChange = (path: string) => {
        // Handle specific routes with proper navigation
        switch (path) {
            case '/home':
                navigateToHome();
                break;
            case '/vouchers':
                navigateToVouchers();
                break;
            case '/account':
                navigateToAccount();
                break;
            case '/transactions':
                if (outletSlug) {
                    navigate(`/${outletSlug}/transactions`);
                } else {
                    navigate('/onboard');
                }
                break;
            default:
                if (outletSlug) {
                    navigate(`/${outletSlug}${path}`);
                } else {
                    navigate('/onboard');
                }
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[440px] rounded-t-2xl bg-white shadow-[0_-4px_12px_rgba(214,214,213,0.4)]">
            <div className="flex h-20 flex-row justify-between gap-10 items-center px-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.path)}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[58px] cursor-pointer transition-colors",
                                isActive ? "text-primary-orange" : "text-body-grey"
                            )}
                        >
                            <div className={cn("size-6 transition-all")}>
                                {item.icon}
                            </div>

                            <span
                                className={cn(
                                    "text-sm capitalize font-rubik transition-all",
                                    isActive
                                        ? "font-medium text-primary-orange"
                                        : "font-normal text-body-grey"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}