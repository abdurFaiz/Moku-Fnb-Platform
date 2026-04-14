import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isOutletOpen, getNextOpenTime } from '../utils/outletUtils';
import { mockOutlet, mockClosedOutlet } from './mockData';
import type { Outlet } from '../types/Outlet';

describe('outletUtils', () => {
    describe('isOutletOpen', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return false when outlet is null', () => {
            expect(isOutletOpen(null)).toBe(false);
        });

        it('should return false when outlet has no operational schedules', () => {
            const outletWithoutSchedules: Outlet = {
                ...mockOutlet,
                operational_schedules: [],
            };
            expect(isOutletOpen(outletWithoutSchedules)).toBe(false);
        });

        it('should return false when outlet is closed today', () => {
            // Set date to Monday 10:00 AM
            vi.setSystemTime(new Date('2024-01-01T10:00:00'));
            expect(isOutletOpen(mockClosedOutlet)).toBe(false);
        });

        it('should return true when outlet is open during operating hours', () => {
            // Set date to Monday 10:00 AM (within 08:00-22:00)
            vi.setSystemTime(new Date('2024-01-01T10:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(true);
        });

        it('should return false when current time is before opening time', () => {
            // Set date to Monday 07:00 AM (before 08:00)
            vi.setSystemTime(new Date('2024-01-01T07:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(false);
        });

        it('should return false when current time is after closing time', () => {
            // Set date to Monday 23:00 PM (after 22:00)
            vi.setSystemTime(new Date('2024-01-01T23:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(false);
        });

        it('should return true when current time equals opening time', () => {
            // Set date to Monday 08:00 AM (exactly opening time)
            vi.setSystemTime(new Date('2024-01-01T08:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(true);
        });

        it('should return true when current time equals closing time', () => {
            // Set date to Monday 22:00 PM (exactly closing time)
            vi.setSystemTime(new Date('2024-01-01T22:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(true);
        });

        it('should return false when schedule has no open_time', () => {
            const outletWithoutOpenTime: Outlet = {
                ...mockOutlet,
                operational_schedules: [
                    {
                        ...mockOutlet.operational_schedules[0],
                        open_time: null,
                    },
                ],
            };
            vi.setSystemTime(new Date('2024-01-01T10:00:00'));
            expect(isOutletOpen(outletWithoutOpenTime)).toBe(false);
        });

        it('should return false when schedule has no close_time', () => {
            const outletWithoutCloseTime: Outlet = {
                ...mockOutlet,
                operational_schedules: [
                    {
                        ...mockOutlet.operational_schedules[0],
                        close_time: null,
                    },
                ],
            };
            vi.setSystemTime(new Date('2024-01-01T10:00:00'));
            expect(isOutletOpen(outletWithoutCloseTime)).toBe(false);
        });

        it('should handle different days of the week correctly', () => {
            // Sunday (day 0)
            vi.setSystemTime(new Date('2024-01-07T10:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(true);

            // Saturday (day 6)
            vi.setSystemTime(new Date('2024-01-06T10:00:00'));
            expect(isOutletOpen(mockOutlet)).toBe(true);
        });
    });

    describe('getNextOpenTime', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return null when outlet is null', () => {
            expect(getNextOpenTime(null)).toBeNull();
        });

        it('should return null when outlet has no operational schedules', () => {
            const outletWithoutSchedules: Outlet = {
                ...mockOutlet,
                operational_schedules: [],
            };
            expect(getNextOpenTime(outletWithoutSchedules)).toBeNull();
        });

        it('should return "Today at HH:MM" when outlet opens later today', () => {
            // Set date to Monday 07:00 AM (before 08:00 opening)
            vi.setSystemTime(new Date('2024-01-01T07:00:00'));
            expect(getNextOpenTime(mockOutlet)).toBe('Today at 08:00');
        });

        it('should return next day when outlet is closed today', () => {
            // Set date to Monday 23:00 PM (after closing)
            vi.setSystemTime(new Date('2024-01-01T23:00:00'));
            const result = getNextOpenTime(mockOutlet);
            expect(result).toContain('at 08:00');
            expect(result).toContain('Tuesday');
        });

        it('should return null when no open days are found in the next week', () => {
            const alwaysClosedOutlet: Outlet = {
                ...mockOutlet,
                operational_schedules: mockOutlet.operational_schedules.map(schedule => ({
                    ...schedule,
                    is_open: 0,
                })),
            };
            vi.setSystemTime(new Date('2024-01-01T10:00:00'));
            expect(getNextOpenTime(alwaysClosedOutlet)).toBeNull();
        });

        it('should handle schedule without open_time', () => {
            const outletWithoutOpenTime: Outlet = {
                ...mockOutlet,
                operational_schedules: mockOutlet.operational_schedules.map(schedule => ({
                    ...schedule,
                    open_time: null,
                })),
            };
            vi.setSystemTime(new Date('2024-01-01T07:00:00'));
            expect(getNextOpenTime(outletWithoutOpenTime)).toBeNull();
        });

        it('should find next open day correctly across week boundary', () => {
            // Create outlet that's only open on Monday
            const mondayOnlyOutlet: Outlet = {
                ...mockOutlet,
                operational_schedules: mockOutlet.operational_schedules.map(schedule => ({
                    ...schedule,
                    is_open: schedule.day === 1 ? 1 : 0, // Only Monday
                })),
            };

            // Set to Sunday evening
            vi.setSystemTime(new Date('2024-01-07T20:00:00'));
            const result = getNextOpenTime(mondayOnlyOutlet);
            expect(result).toBe('Monday at 08:00');
        });

        it('should return correct day names for each day of the week', () => {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            dayNames.forEach((dayName, dayIndex) => {
                const singleDayOutlet: Outlet = {
                    ...mockOutlet,
                    operational_schedules: mockOutlet.operational_schedules.map(schedule => ({
                        ...schedule,
                        is_open: schedule.day === dayIndex ? 1 : 0,
                    })),
                };

                // Set to a day before the target day
                const testDate = new Date('2024-01-01T23:00:00'); // Monday evening
                vi.setSystemTime(testDate);

                const result = getNextOpenTime(singleDayOutlet);
                if (dayIndex > 1) {
                    // Should find the day in the same week
                    expect(result).toContain(dayName);
                }
            });
        });
    });
});
