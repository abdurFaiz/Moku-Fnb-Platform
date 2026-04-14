import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
} from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface SelectDateBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: Date | null) => void;
    selectedDate: Date | null;
}

const SelectDateBottomSheet: React.FC<SelectDateBottomSheetProps> = ({
    isOpen,
    onClose,
    onSelectDate,
    selectedDate,
}) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const sheetRef = useRef<HTMLDivElement>(null);

    const handleDayClick = (day: Date) => {
        onSelectDate(day);
        onClose();
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                <FiChevronLeft
                    className="text-gray-500 cursor-pointer"
                    size={24}
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                />
                <div className="text-lg font-semibold text-gray-800">
                    {format(currentMonth, 'MMM yyyy')}
                </div>
                <FiChevronRight
                    className="text-gray-500 cursor-pointer"
                    size={24}
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                />
            </div>
        );
    };

    const renderDaysOfWeek = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return (
            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 py-2">
                {days.map((day, index) => (
                    <div key={index}>{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;

                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        key={cloneDay.toISOString()}
                        className={`flex justify-center items-center h-10 w-10 rounded-full cursor-pointer
              ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
              ${isToday && !isSelected ? 'border border-blue-500' : ''}
              ${isSelected ? 'bg-orange-500 text-white font-bold' : 'hover:bg-gray-100'}
            `}
                        onClick={() => handleDayClick(cloneDay)}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 text-center py-1" key={day.toISOString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="p-4">{rows}</div>;
    };

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-600 bg-opacity-50">
            <div
                ref={sheetRef}
                className="bg-white rounded-t-2xl shadow-xl w-full max-w-md transform transition-transform duration-300 ease-out translate-y-0"
                role="dialog"
                aria-modal="true"
                aria-labelledby="select-date-title"
            >
                <div className="flex justify-center pt-3">
                    <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                </div>
                <h2 id="select-date-title" className="sr-only">Select Date</h2>
                {renderHeader()}
                {renderDaysOfWeek()}
                {renderCells()}
            </div>
        </div>
    );
};

export default SelectDateBottomSheet;