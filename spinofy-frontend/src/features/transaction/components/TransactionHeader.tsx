import React from "react";
import { DateFormatterUtils } from "@/utils/formatters";

interface TransactionHeaderProps {
    title: string;
    dateTime: string;
    transactionInfo: string;
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({
    title,
    dateTime,
    transactionInfo,
}) => {
    const formattedDate = DateFormatterUtils.formatTransactionDate(dateTime);

    return (
        <div className="flex justify-between gap-6 items-start px-4 py-4">
            <h2 className="text-base text-title-black font-rubik font-medium capitalize">{title}</h2>
            <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-rubik text-body-grey text-right">
                    {formattedDate}
                </p>
                <p className="text-sm font-rubik text-right leading-relaxed text-body-grey">
                    {transactionInfo}
                </p>
            </div>
        </div>
    );
};
