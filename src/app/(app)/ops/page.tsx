import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, tasks, workOrders, suppliers } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { fmtDate } from "@/lib/utils";
import Link from "next/link";

export default async function OpsPage() {
  const user = await requireRole("admin", "manager");

  const today = new Date();
  const in14 = new Date(today);
  in14.setDate(today.getDate() + 14);
  const todayStr = today.toISOString().slice(0, 10);
  const in14Str = in14.toISOString().slice(0, 10);

  const [upcoming, overdueTasks, pendingWOs] = await Promise.all([
    db
      .select()
      .from(events)
      .where(and(
        eq(events.orgId, user.orgId),
        gte(events.eventDate, todayStr),
        lte(events.eventDate, in14Str),
      ))
      .orderBy(events.eventDate),

    db
      .select({ task: tasks, event: events })
      .from(tasks)
      .leftJoin(events, eq(tasks.eventId, events.id))
      .where(and(
        eq(tasks.orgId, user.orgId),
        eq(tasks.status, "todo"),
        lte(tasks.dueDate, todayStr),
      )),

    db
      .select({ wo: workOrders, supplier: suppliers })
      .from(workOrders)
      .leftJoin(suppliers, eq(workOrders.supplierId, suppliers.id))
      .where(and(
        eq(workOrders.orgId, user.orgId),
        inArray(workOrders.status, ["draft", "sent"]),
      ))
      .orderBy(workOrders.dueDate),
  ]);

  return (
    <div>
      <PageHeader title="Ops Dashboard" sub="Manager view — next 14 days" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Upcoming Events */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Upcoming Events ({upcoming.length})
          </h2>
          <div className="border border-border rounded-lg divide-y divide-border bg-surface">
            {upcoming.length === 0
              ? <p className="text-xs text-text-3 p-4">No events in the next 14 days.</p>
              : upcoming.map((ev) => (
                <Link key={ev.id} href={`/events/${ev.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors">
                  <div>
                    <p className="text-sm font-medium">{ev.name}</p>
                    <p className="text-xs text-text-3 mt-0.5">
                      {fmtDate(ev.eventDate)}{ev.venue ? ` · ${ev.venue}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={ev.stage} />
                </Link>
              ))
            }
          </div>
        </section>

        {/* Overdue Tasks */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="border border-border rounded-lg divide-y divide-border bg-surface">
            {overdueTasks.length === 0
              ? <p className="text-xs text-text-3 p-4">No overdue tasks.</p>
              : overdueTasks.map(({ task, event }) => (
                <div key={task.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-text-3 mt-0.5">
                      Due {fmtDate(task.dueDate)}
                      {event ? (
                        <> · <Link href={`/events/${event.id}`} className="underline underline-offset-2 hover:text-text-1">{event.name}</Link></>
                      ) : null}
                    </p>
                  </div>
                  <StatusBadge status={task.priority} />
                </div>
              ))
            }
          </div>
        </section>

        {/* Pending Work Orders */}
        <section className="md:col-span-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Pending Work Orders ({pendingWOs.length})
          </h2>
          <div className="border border-border rounded-lg divide-y divide-border bg-surface">
            {pendingWOs.length === 0
              ? <p className="text-xs text-text-3 p-4">No pending work orders.</p>
              : pendingWOs.map(({ wo, supplier }) => (
                <Link key={wo.id} href={`/work-orders`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors">
                  <div>
                    <p className="text-sm font-medium">{wo.number}</p>
                    <p className="text-xs text-text-3 mt-0.5">
                      {supplier?.name ?? "Unknown supplier"}
                      {wo.dueDate ? ` · Due ${fmtDate(wo.dueDate)}` : ""}
                      {wo.amount ? ` · $${Number(wo.amount).toLocaleString()}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={wo.status} />
                </Link>
              ))
            }
          </div>
        </section>

      </div>
    </div>
  );
}
