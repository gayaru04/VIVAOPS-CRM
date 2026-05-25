import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, workOrders, suppliers, tasks, runSheetItems } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { fmtDate } from "@/lib/utils";
import Link from "next/link";

export default async function EventDayPage() {
  const user = await requireUser();
  const today = new Date().toISOString().slice(0, 10);

  const todayEvents = await db
    .select()
    .from(events)
    .where(and(eq(events.orgId, user.orgId), eq(events.eventDate, today)));

  if (todayEvents.length === 0) {
    return (
      <>
        <PageHeader title="Event Day" sub={`Today · ${fmtDate(today)}`} />
        <div className="px-7 py-5">
          <div className="bg-surface border border-border rounded-xl px-6 py-12 text-center max-w-sm">
            <p className="text-[15px] font-medium text-foreground mb-1">No events today</p>
            <p className="text-[13px] text-text-3">Check the calendar for upcoming events.</p>
          </div>
        </div>
      </>
    );
  }

  const eventIds = todayEvents.map((e) => e.id);

  const [allWOs, allTasks, allRunSheet] = await Promise.all([
    db.select({ wo: workOrders, supplier: suppliers })
      .from(workOrders)
      .leftJoin(suppliers, eq(workOrders.supplierId, suppliers.id))
      .where(inArray(workOrders.eventId, eventIds)),
    db.select().from(tasks).where(inArray(tasks.eventId, eventIds)),
    db.select().from(runSheetItems)
      .where(inArray(runSheetItems.eventId, eventIds))
      .orderBy(runSheetItems.time),
  ]);

  return (
    <>
      <PageHeader title="Event Day" sub={`Today · ${fmtDate(today)}`} />

      <div className="px-7 py-5 flex flex-col gap-6">
        {todayEvents.map((event) => {
          const wos = allWOs.filter((w) => w.wo.eventId === event.id);
          const openTasks = allTasks.filter((t) => t.eventId === event.id && t.status === "todo");
          const runSheet = allRunSheet.filter((r) => r.eventId === event.id);
          const confirmedCount = wos.filter((w) => w.wo.status === "confirmed").length;

          return (
            <div key={event.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-border">
                <div>
                  <Link href={`/events/${event.id}`} className="text-[15px] font-semibold text-foreground hover:text-primary transition-colors">
                    {event.name}
                  </Link>
                  <p className="text-[12.5px] text-text-3 mt-0.5">{event.venue || "No venue set"}</p>
                </div>
                <StatusBadge status={event.stage} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {[
                  { value: `${confirmedCount}/${wos.length}`, label: "Suppliers confirmed" },
                  { value: openTasks.length,                  label: "Open tasks" },
                  { value: event.guestCount ?? "—",           label: "Guests" },
                ].map(({ value, label }) => (
                  <div key={label} className="px-4 py-3 text-center">
                    <p className="text-[24px] font-semibold tabular-nums text-foreground leading-none mb-1">{value}</p>
                    <p className="text-[11px] uppercase tracking-[0.07em] text-text-3 font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {/* Run sheet preview */}
              {runSheet.length > 0 && (
                <div className="divide-y divide-border">
                  {runSheet.map((item) => (
                    <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 px-5 py-2.5 text-[13px]">
                      <span className="font-mono text-[12px] text-text-3 tabular-nums pt-0.5">{item.time}</span>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        {item.description && <p className="text-[11.5px] text-text-3">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
