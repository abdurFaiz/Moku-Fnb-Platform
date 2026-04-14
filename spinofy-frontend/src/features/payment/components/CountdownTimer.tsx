import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialMinutes: number;
  onTimeUp?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialMinutes,
  onTimeUp,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  const getTimerColor = () => {
    const percentage = (timeLeft / (initialMinutes * 60)) * 100;
    if (percentage > 50) return 'text-light-green';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBackgroundColor = () => {
    const percentage = (timeLeft / (initialMinutes * 60)) * 100;
    if (percentage > 50) return 'bg-green-100';
    if (percentage > 20) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getBorderColor = () => {
    const percentage = (timeLeft / (initialMinutes * 60)) * 100;
    if (percentage > 50) return 'border-green-200';
    if (percentage > 20) return 'border-yellow-200';
    return 'border-red-200';
  };

  if (timeLeft <= 0) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-2xl ${className}`}>
        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-sm font-medium text-red-600">Waktu Pembayaran Habis</p>
            <p className="text-xs text-red-500 mt-1">Silakan buat pesanan baru</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 ${getBackgroundColor()} border ${getBorderColor()} rounded-2xl ${className}`}>
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 flex gap-3 flex-row items-center justify-between">
          <div className="flex flex-col gap-1 mb-1 max-w-[240px]">
            <span className="text-sm  font-rubik font-medium text-title-black ">
              Sisa Waktu Pembayaran
            </span>
            <p className='text-xs font-rubik  text-gray-700'>Segera selesaikan pembayaran sebelum waktu habis</p>
          </div>
          <p className={`text-2xl font-rubik font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;