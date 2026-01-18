// utils/challenge/dates.js

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function toDateOnly(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

export function calculateTotalDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  return Math.floor((endDate - startDate) / MS_PER_DAY) + 1;
}

export function calculateElapsedDays(startDate, endDate, today) {
  if (!startDate || !endDate) return 0;
  if (today < startDate) return 0;
  if (today > endDate)
    return calculateTotalDays(startDate, endDate);
  return Math.floor((today - startDate) / MS_PER_DAY) + 1;
}
