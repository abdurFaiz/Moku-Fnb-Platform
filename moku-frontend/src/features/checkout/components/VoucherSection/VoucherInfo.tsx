interface VoucherInfoProps {
    name: string;
    savings: number;
}

export function VoucherInfo({ name, savings }: VoucherInfoProps) {
    return (
        <div className="flex flex-col gap-1 max-w-[241px]">
            <h3 className="text-sm font-medium font-rubik">{name}</h3>
            <p className="text-xs font-rubik text-light-green">
                Yeay!, Kamu Hemat Rp {savings.toLocaleString("id-ID")} 🎉
            </p>
        </div>
    );
}
