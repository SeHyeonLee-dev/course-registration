const DAY_OF_WEEK_LABELS: Record<string, string> = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
  SAT: "토",
  SUN: "일",
};

export function formatDateRange(start: string, end: string) {
  return `${start} ~ ${end}`;
}

export function formatDateTime(value: string) {
  return value.replace("T", " ");
}

export function formatDateTimeRange(start: string, end: string) {
  return `${formatDateTime(start)} ~ ${formatDateTime(end)}`;
}

export function formatPeriods(startPeriod: number, endPeriod: number) {
  return `${startPeriod}~${endPeriod}교시`;
}

export function formatDayOfWeek(dayOfWeek: string) {
  return DAY_OF_WEEK_LABELS[dayOfWeek] ?? dayOfWeek;
}

export function formatSchedule(dayOfWeek: string, startPeriod: number, endPeriod: number) {
  return `${formatDayOfWeek(dayOfWeek)} ${formatPeriods(startPeriod, endPeriod)}`;
}

export function formatSeatSummary(remainingCount: number, capacity: number) {
  return `잔여 ${remainingCount}석 / 정원 ${capacity}석`;
}

export function toDateTimeLocalValue(value: string) {
  return value.slice(0, 16);
}
