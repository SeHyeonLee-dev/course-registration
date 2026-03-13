export function formatDateRange(start: string, end: string) {
  return `${start} - ${end}`;
}

export function formatDateTimeRange(start: string, end: string) {
  return `${start} - ${end}`;
}

export function formatPeriods(startPeriod: number, endPeriod: number) {
  return `${startPeriod}-${endPeriod}`;
}

export function formatSchedule(dayOfWeek: string, startPeriod: number, endPeriod: number) {
  return `${dayOfWeek} ${formatPeriods(startPeriod, endPeriod)}`;
}

export function formatSeatSummary(remainingCount: number, capacity: number) {
  return `${remainingCount} / ${capacity} seats left`;
}
