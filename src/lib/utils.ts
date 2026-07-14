import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  const hasCents = Math.round(num * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
}

// VivaOps is a single-org, Melbourne-based CRM — pin every date/time computation
// to this timezone explicitly. Without it, formatting and "today" calculations
// silently fall back to the server's runtime timezone (UTC on Vercel), which lags
// Melbourne by 10-11 hours and shows the wrong calendar day for most of the day.
export const APP_TIMEZONE = "Australia/Melbourne";

export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIMEZONE,
  });
}

// Formats a Postgres `time` column ("14:16:00") as "2:16 PM". Pure string
// parsing — no Date object, so it's unaffected by timezone.
export function fmtTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Today's calendar date in Melbourne, as "YYYY-MM-DD" — for comparing against
// Postgres `date` columns. Never use `new Date().toISOString().slice(0, 10)`
// for this: toISOString() is always UTC and will report yesterday's date for
// most of the Melbourne day.
export function todayInMelbourne(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(new Date());
}

// Adds `days` (negative to subtract) to a "YYYY-MM-DD" date string, staying in
// pure calendar-date arithmetic (anchored to UTC midnight for that date) so it
// never drifts through a local timezone.
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
