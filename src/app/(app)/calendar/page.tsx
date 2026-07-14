import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { fmtTime, todayInMelbourne } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STAGE_DOT: Record<string, string> = {
  inquiry: "bg-st-slate",
  proposal: "bg-st-violet",
  contract: "bg-st-amber",
  planning: "bg-st-blue",
  confirmed: "bg-st-green",
  completed: "bg-st-green",
  cancelled: "bg-st-red",
};

function monthGrid(year: number, month: number): string[] {
  // month is 1-12. Grid is Monday-start, always 6 rows (42 cells) so layout never shifts.
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekdayMon0 = (firstOfMonth.getUTCDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - firstWeekdayMon0));

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const user = await requireUser();

  const todayStr = todayInMelbourne();
  const [defaultYear, defaultMonth] = todayStr.split("-").map(Number);
  const [year, month] = searchParams.month?.match(/^\d{4}-\d{2}$/)
    ? searchParams.month.split("-").map(Number)
    : [defaultYear, defaultMonth];

  const grid = monthGrid(year, month);
  const gridStart = grid[0];
  const gridEnd = grid[grid.length - 1];

  const rows = await db.select().from(events).where(
    and(eq(events.orgId, user.orgId), gte(events.eventDate, gridStart), lte(events.eventDate, gridEnd))
  );

  const eventsByDate = new Map<string, typeof rows>();
  for (const event of rows) {
    if (!event.eventDate) continue;
    const list = eventsByDate.get(event.eventDate) ?? [];
    list.push(event);
    eventsByDate.set(event.eventDate, list);
  }

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-AU", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
  const prevMonthStr = new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
  const nextMonthStr = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);

  return (
    <>
      <PageHeader title="Calendar" sub="Events by date">
        <div className="flex items-center gap-1.5">
          <Link href={`/calendar?month=${prevMonthStr}`} className="h-8 w-8 grid place-items-center rounded-md border border-border bg-surface hover:bg-hover transition-colors text-text-2">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-[13px] font-semibold text-foreground min-w-[140px] text-center">{monthLabel}</span>
          <Link href={`/calendar?month=${nextMonthStr}`} className="h-8 w-8 grid place-items-center rounded-md border border-border bg-surface hover:bg-hover transition-colors text-text-2">
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link href="/calendar" className="h-8 px-3 grid place-items-center rounded-md border border-border bg-surface hover:bg-hover transition-colors text-[12.5px] font-medium text-text-2 ml-1">
            Today
          </Link>
        </div>
      </PageHeader>

      <div className="px-7 py-5">
        <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 bg-black/[0.015] border-b border-r border-border">
              {d}
            </div>
          ))}
          {grid.map((dateStr) => {
            const inMonth = dateStr.slice(5, 7) === String(month).padStart(2, "0");
            const isToday = dateStr === todayStr;
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const visible = dayEvents.slice(0, 3);
            const overflow = dayEvents.length - visible.length;

            return (
              <div
                key={dateStr}
                className={`min-h-[104px] px-1.5 py-1.5 border-b border-r border-border flex flex-col gap-1 ${inMonth ? "bg-surface" : "bg-black/[0.01]"}`}
              >
                <span className={`text-[11.5px] tabular-nums w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                  isToday ? "bg-primary text-primary-foreground font-semibold" : inMonth ? "text-text-2" : "text-text-4"
                }`}>
                  {Number(dateStr.slice(8, 10))}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  {visible.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-1 px-1 py-[1px] rounded text-[11px] text-foreground hover:bg-hover transition-colors truncate"
                      title={`${event.name}${event.eventTime ? ` · ${fmtTime(event.eventTime)}` : ""}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STAGE_DOT[event.stage] ?? "bg-st-slate"}`} />
                      <span className="truncate">{event.name}</span>
                    </Link>
                  ))}
                  {overflow > 0 && (
                    <span className="px-1 text-[10.5px] text-text-3">+{overflow} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
