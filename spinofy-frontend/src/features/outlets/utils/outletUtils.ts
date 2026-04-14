import type { Outlet, OperationalSchedule } from '@/features/outlets/types/Outlet';

/**
 * Check if the outlet is currently open based on operational schedules
 */
export const isOutletOpen = (outlet: Outlet | null): boolean => {
    if (!outlet || !outlet.operational_schedules) {
        return false;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Find the schedule for today
    const todaySchedule = outlet.operational_schedules.find(
        (schedule: OperationalSchedule) => schedule.day === currentDay
    );

    if (!todaySchedule || todaySchedule.is_open !== 1) {
        return false;
    }

    const openTime = todaySchedule.open_time;
    const closeTime = todaySchedule.close_time;

    if (!openTime || !closeTime) {
        return false;
    }

    // Compare times (assuming 24-hour format)
    return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * Get the next open time for the outlet
 */
export const getNextOpenTime = (outlet: Outlet | null): string | null => {
    if (!outlet || !outlet.operational_schedules) {
        return null;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    // Check if open today and after current time
    const todaySchedule = outlet.operational_schedules.find(
        (schedule: OperationalSchedule) => schedule.day === currentDay && schedule.is_open === 1
    );

    if (todaySchedule && todaySchedule.open_time && currentTime < todaySchedule.open_time) {
        return `Today at ${todaySchedule.open_time}`;
    }

    // Find next open day
    for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7;
        const schedule = outlet.operational_schedules.find(
            (s: OperationalSchedule) => s.day === nextDay && s.is_open === 1
        );
        if (schedule && schedule.open_time) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return `${dayNames[nextDay]} at ${schedule.open_time}`;
        }
    }

    return null;
};