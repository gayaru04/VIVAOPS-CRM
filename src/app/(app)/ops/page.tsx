import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, tasks, workOrders } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { fmtDate } from "@/lib/utils";
import Link from "next/link";

export default async function OpsPage() {
  const user = await requireRole("admin", "manager");

  const today = new Date();
  const in14 = new Date(today);
  in14.setDate(today.getDate() + 14);

  const upcoming = await db
    .select()
    .from(events)
    .where(and(
      eq(events.orgId, user.orgId),
      gte(events.eventDate, today.toISOString().slice(0, 10)),
      lte(events.eventDate, in14.toISOString().slice(0, 10))
    ))
    .orderBy(events.eventDate);

  const overdueTasks = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.orgId, user.orgId),
      eq(tasks.status, "todo"),
      lte(tasks.dueDate, today.toISOString().slice(0, 10))
    ));

  return (
    <div>
      <PageHeader title="Ops Dashboard" sub="Manager view — next 14 days" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Upcoming Events ({upcoming.length})
          </h2>
          <div className="border border-border rounded-lg divide-y divide-border">
            {upcoming.length === 0 && <p className="text-xs text-muted-foreground p-4">No events in the next 14 days.</p>}
            {upcoming.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20">
                <div>
                  <p className="text-sm font-medium">{ev.name}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(ev.eventDate)}</p>
                </div>
                <StatusBadge status={ev.stage} />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="border border-border rounded-lg divide-y divide-border">
            {overdueTasks.length === 0 && <p className="text-xs text-muted-foreground p-4">No overdue tasks.</p>}
            {overdueTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-red-500">Due {fmtDate(task.dueDate)}</p>
                </div>
                <StatusBadge status={task.priority} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
