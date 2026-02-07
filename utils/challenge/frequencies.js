import {
    isSameDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isWithinInterval,
    subDays,
    addDays,
    parseISO,
    format
} from "date-fns";

/**
 * Checks if a check-in is allowed for a specific date given the frequency and existing check-ins.
 * 
 * @param {Date|string} targetDate - The date attempting to check in
 * @param {string} frequency - 'daily' | 'every_other_day' | 'weekly' | 'monthly'
 * @param {Set<string>|Array<string>} existingCheckinDates - List/Set of date strings (YYYY-MM-DD) where check-ins exist
 * @returns {boolean} true if allowed, false if blocked
 */
export function isCheckinAllowed(targetDate, frequency, existingCheckinDates) {
    const dateObj = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
    const dateStr = format(dateObj, 'yyyy-MM-dd');

    // Convert Set to Array if needed, filtering out the target date itself 
    // (though usually we call this before inserting)
    const dates = Array.from(existingCheckinDates).map(d => typeof d === 'string' ? d : format(new Date(d), 'yyyy-MM-dd'));

    // Basic: Already done?
    if (dates.includes(dateStr)) return false;

    switch (frequency) {
        case 'daily':
            // Always allowed if not already done (checked above)
            return true;

        case 'every_other_day':
            // Blocked if check-in exists on yesterday or tomorrow
            const yesterday = format(subDays(dateObj, 1), 'yyyy-MM-dd');
            const tomorrow = format(addDays(dateObj, 1), 'yyyy-MM-dd');
            return !dates.includes(yesterday) && !dates.includes(tomorrow);

        case 'weekly':
            // Blocked if any other check-in exists in the same ISO week
            const wStart = startOfWeek(dateObj, { weekStartsOn: 1 }); // Monday start
            const wEnd = endOfWeek(dateObj, { weekStartsOn: 1 });

            const hasCheckinInWeek = dates.some(d => {
                const checkDate = parseISO(d);
                return isWithinInterval(checkDate, { start: wStart, end: wEnd });
            });
            return !hasCheckinInWeek;

        case 'monthly':
            // Blocked if any other check-in exists in the same month
            const mStart = startOfMonth(dateObj);
            const mEnd = endOfMonth(dateObj);

            const hasCheckinInMonth = dates.some(d => {
                const checkDate = parseISO(d);
                return isWithinInterval(checkDate, { start: mStart, end: mEnd });
            });
            return !hasCheckinInMonth;

        default:
            return true;
    }
}

/**
 * Checks if the requirement for the period is already fulfilled.
 * Useful for weekly/monthly to show "Done" instead of "Locked".
 */
export function isPeriodCompleted(targetDate, frequency, existingCheckinDates) {
    if (frequency === 'daily') return false; // Daily is reset every day, so "period completed" is just "done today" which is checked elsewhere

    const dateObj = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
    const dates = Array.from(existingCheckinDates).map(d => typeof d === 'string' ? d : format(new Date(d), 'yyyy-MM-dd'));

    switch (frequency) {
        case 'weekly':
            const wStart = startOfWeek(dateObj, { weekStartsOn: 1 });
            const wEnd = endOfWeek(dateObj, { weekStartsOn: 1 });
            return dates.some(d => {
                const checkDate = parseISO(d);
                return isWithinInterval(checkDate, { start: wStart, end: wEnd });
            });

        case 'monthly':
            const mStart = startOfMonth(dateObj);
            const mEnd = endOfMonth(dateObj);
            return dates.some(d => {
                const checkDate = parseISO(d);
                return isWithinInterval(checkDate, { start: mStart, end: mEnd });
            });

        case 'every_other_day':
            // For every_other_day, "period completed" isn't exactly the right concept.
            // If I did it yesterday, today is a break day. It should probably stay "Locked" (Rest Day).
            // Unless we want to show "Rest Day" specifically?
            // User only asked about weekly/monthly.
            return false;

        default:
            return false;
    }
}
