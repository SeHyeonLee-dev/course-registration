export function formatDateRange(start: string, end: string) {
  return `${start} - ${end}`;
}

export function formatDateTime(value: string) {
  return value.replace("T", " ");
}

export function formatDateTimeRange(start: string, end: string) {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
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

export function toDateTimeLocalValue(value: string) {
  return value.slice(0, 16);
}
