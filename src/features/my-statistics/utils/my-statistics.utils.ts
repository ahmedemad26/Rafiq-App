import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";

export const MAX_DAYS_RANGE = 7;

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TO_DO: "#94A3B8",
  IN_PROGRESS: "#1D4ED8",
  BLOCKED: "#DC2626",
  IN_REVIEW: "#7C3AED",
  READY_FOR_QA: "#0EA5E9",
  REOPENED: "#F97316",
  READY_FOR_PRODUCTION: "#14B8A6",
  DONE: "#047857",
};

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDefaultCurrentWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) };
}

export function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateRangeError(startDate: string, endDate: string): string | null {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return "Start and end dates are required.";
  if (start > end) return "Start date must be before end date.";
  const diffInDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (diffInDays > MAX_DAYS_RANGE) return "You can select up to 7 days only.";
  return null;
}

export function enumerateDays(startDate: string, endDate: string): string[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || start > end) return [];
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(toDateInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days.slice(0, MAX_DAYS_RANGE);
}

export function weekdayLabel(value: string): string {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date).toUpperCase();
}

export function dayLabel(value: string): string {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" }).format(date);
}

export function buildDonutGradient(entries: Array<{ percent: number; color: string }>): string {
  if (!entries.length) return "#E2E8F0";
  let runningPercent = 0;
  const slices = entries.map((entry) => {
    const start = runningPercent;
    runningPercent += entry.percent;
    return `${entry.color} ${start}% ${Math.min(runningPercent, 100)}%`;
  });
  return `conic-gradient(${slices.join(", ")})`;
}

export function buildDailyMap(
  daily: Array<{ day: string; statuses: Partial<Record<TaskStatus, number>> }>,
): Map<string, Partial<Record<TaskStatus, number>>> {
  const map = new Map<string, Partial<Record<TaskStatus, number>>>();
  daily.forEach((item) => map.set(item.day, item.statuses ?? {}));
  return map;
}

export function buildDonutEntries(stats: {
  total_tasks?: number;
  totals?: Partial<Record<TaskStatus, number>>;
}) {
  const total = Number(stats.total_tasks ?? 0);
  return TASK_STATUSES.map((item) => {
    const value = Number(stats.totals?.[item] ?? 0);
    return {
      key: item,
      value,
      color: STATUS_COLORS[item],
      percent: total > 0 ? (value / total) * 100 : 0,
    };
  }).filter((item) => item.value > 0);
}

export function shiftRange(startDate: string, endDate: string, offsetDays: number) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return { startDate, endDate };
  const nextStart = new Date(start);
  const nextEnd = new Date(end);
  nextStart.setDate(nextStart.getDate() + offsetDays);
  nextEnd.setDate(nextEnd.getDate() + offsetDays);
  return {
    startDate: toDateInputValue(nextStart),
    endDate: toDateInputValue(nextEnd),
  };
}

export function formatRangeLabel(startDate: string, endDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return `${startDate} - ${endDate}`;
  const startText = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(start);
  const endText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);
  return `${startText} - ${endText}`;
}

export function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
