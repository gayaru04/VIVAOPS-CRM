import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads, events, tasks } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { KpiCard } from "@/components/kpi";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { fmtMoney, fmtDate } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();
  const orgId = user.orgId;

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-AU", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  const [[leadCount], [activeEventCount], [openTaskCount], recentLeads, upcomingEvents] =
    await Promise.all([
      db.select({ count: count() }).from(leads).where(and(eq(leads.orgId, orgId), eq(leads.status, "new"))),
      db.select({ count: count() }).from(events).where(eq(events.orgId, orgId)),
      db.select({ count: count() }).from(tasks).where(and(eq(tasks.orgId, orgId), eq(tasks.status, "todo"))),
      db.select().from(leads).where(eq(leads.orgId, orgId)).orderBy(leads.createdAt).limit(5),
      db.select().from(events).where(eq(events.orgId, orgId)).orderBy(events.eventDate).limit(5),
    ]);

  return (
    <>
      <PageHeader
        eyebrow="Workspace · Today"
        title={`Good day, ${user.name.split(" ")[0]}`}
        sub={`${dayOfWeek}, ${dateStr}`}
      >
        <Link href="/leads/new" className="btn-primary">+ New lead</Link>
      </PageHeader>

      <div className="px-7 pt-5 pb-16 flex flex-col gap-[18px]">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard label="New Leads"     value={leadCount?.count ?? 0}        delta="+3 this week" deltaUp />
          <KpiCard label="Active Events" value={activeEventCount?.count ?? 0} delta="+1 this week" deltaUp />
          <KpiCard label="Open Tasks"    value={openTaskCount?.count ?? 0} />
          <KpiCard label="Revenue (MTD)" value={fmtMoney("0")} />
        </div>

        {/* Pipeline summary + needs attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Upcoming events */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-3">Delivery</p>
                <p className="text-[12.5px] font-semibold leading-tight mt-0.5">Upcoming events</p>
              </div>
              <Link href="/events" className="ml-auto text-[12px] text-text-3 hover:text-foreground flex items-center gap-1">
                All events <span className="opacity-60">›</span>
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  {["Event", "Date", "Status"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-3 bg-black/[0.015] border-b border-border">
                      {h}
                    </th>
                  ))}
                  <th className="w-5 border-b border-border bg-black/[0.015]" />
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-4 text-[12.5px] text-text-3">No events yet.</td></tr>
                )}
                {upcomingEvents.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-hover transition-colors">
                    <td className="px-3 py-2.5 text-[13px] font-medium">
                      <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">{event.name}</Link>
                    </td>
                    <td className="px-3 py-2.5 text-[12.5px] tabular-nums text-text-3">{fmtDate(event.eventDate)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={event.stage} /></td>
                    <td className="px-3 py-2.5 text-text-4 text-[12px]">›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Needs attention */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-3">Pipeline</p>
                <p className="text-[12.5px] font-semibold leading-tight mt-0.5">Needs attention</p>
              </div>
            </div>
            <div className="px-3.5 py-1.5">
              {recentLeads.length === 0 && (
                <p className="py-3 text-[12.5px] text-text-3">No leads yet.</p>
              )}
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                    style={{ background: `hsl(${(lead.name.charCodeAt(0) * 17) % 360} 60% 55%)` }}
                  >
                    {lead.name.split(" ").slice(0, 2).map((s: string) => s[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/leads/${lead.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors truncate block">
                      {lead.name}
                    </Link>
                    <p className="text-[11.5px] text-text-3 capitalize">{lead.source}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
              <div className="pt-2.5 pb-1">
                <Link href="/leads" className="text-[12.5px] text-primary hover:underline underline-offset-2">
                  View all leads →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
