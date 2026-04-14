import { UserStatItem } from "./UserStatItem";

interface UserHeaderTopProps {
    name: string;
    vouchers: number;
    points: number;
}

export function UserHeaderTop({ name, vouchers, points }: UserHeaderTopProps) {
    return (
        <div className="flex items-center justify-between pb-5">
            <h2 className="text-base font-medium text-title-black font-rubik min-w-0 flex-1 truncate">Hi, {name} 👋</h2>
            <div className="flex items-center gap-1  p-1 rounded-full shrink-0 bg-body-grey/15">
                <UserStatItem icon="/icons/icon-voucher.svg" value={vouchers} />
                <UserStatItem icon="/icons/icon-poin.svg" value={points}/>
            </div>
        </div>
    );
}