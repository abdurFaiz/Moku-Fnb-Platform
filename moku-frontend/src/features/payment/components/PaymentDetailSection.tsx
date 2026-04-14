export interface PaymentDetailItem {
    id: string;
    label: string;
    value: string;
    highlight?: boolean;
    isDiscount?: boolean;
    dashed?: boolean;
}


interface PaymentDetailSectionProps {
    title: string;
    items: PaymentDetailItem[];
}


export const PaymentDetailSection: React.FC<PaymentDetailSectionProps> = ({ title, items }) => {
    const getValueTextColor = (item: PaymentDetailItem): string => {
        if (item.highlight) return 'text-light-green';
        if (item.label.toLowerCase().includes('biaya')) return 'text-title-black';
        return 'text-title-black';
    };

    return (
        <div className="flex flex-col gap-4 py-4 px-4">
            {/* Header */}
            <h3 className="text-base font-rubik font-medium capitalize">{title}</h3>

            {/* Items */}
            <div className="flex flex-col rounded-lg border border-gray-200 overflow-hidden">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`flex justify-between items-center px-4 py-3 ${index < items.length - 1 ? 'border-b border-gray-200' : ''
                            } ${item.dashed
                            }`}
                    >
                        <span
                            className={`text-sm font-rubik font-medium ${item.highlight ? 'text-light-green' : 'text-body-grey'
                                }`}
                        >
                            {item.label}
                        </span>
                        <span
                            className={`text-sm font-rubik font-semibold ${getValueTextColor(item)}`}
                        >
                            {item.isDiscount ? ` ${item.value}` : item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};