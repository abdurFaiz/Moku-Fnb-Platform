interface EmptyVoucherStateProps {
    readonly message?: string;
    readonly icon?: React.ReactNode;
}

export function EmptyVoucherState({
    message = "Belum ada voucher tersedia",
    icon = ''
}: EmptyVoucherStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm text-gray-600">{message}</p>
        </div>
    );
}
