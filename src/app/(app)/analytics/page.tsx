import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads, events, quotes } from "@/lib/db/schema";
import { eq, and, count, sum } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { fmtMoney } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Referral", social: "Social Media",
  email: "Email", phone: "Phone", other: "Other",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding", corporate: "Corporate", birthday: "Birthday",
  conference: "Conference", gala: "Gala", other: "Other",
};

export default async function AnalyticsPage() {
  const user = await requireUser();
  const orgId = user.orgId;

  const [allLeads, allEvents, revenueRows] = await Promise.all([
    db.select().from(leads).where(eq(leads.orgId, orgId)),
    db.select().from(events).where(eq(events.orgId, orgId)),
    db.select({ type: events.type, total: sum(quotes.total) })
      .from(quotes)
      .leftJoin(events, eq(quotes.eventId, events.id))
      .where(eq(quotes.orgId, orgId))
      .groupBy(events.type),
  ]);

  // Lead source breakdown
  const sourceMap: Record<string, { leads: number; converted: number }> = {};
  for (const lead of allLeads) {
    const src = lead.source ?? "other";
    if (!sourceMap[src]) sourceMap[src] = { leads: 0, converted: 0 };
    sourceMap[src].leads++;
    if (lead.status === "converted") sourceMap[src].converted++;
  }
  const sources = Object.entries(sourceMap).sort((a, b) => b[1].leads - a[1].leads);
  const maxLeads = Math.max(...sources.map(([, v]) => v.leads), 1);

  // Event stage summary
  const stageMap: Record<string, number> = {};
  for (const ev of allEvents) {
    stageMap[ev.stage] = (stageMap[ev.stage] ?? 0) + 1;
  }

  // Revenue by event type
  const revenueByType = revenueRows
    .filter((r) => r.total && Number(r.total) > 0)
    .sort((a, b) => Number(b.total ?? 0) - Number(a.total ?? 0));
  const maxRevenue = Math.max(...revenueByType.map((r) => Number(r.total ?? 0)), 1);

  // Overall KPIs
  const totalLeads = allLeads.length;
  const converted = allLeads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const activeEvents = allEvents.filter((e) => !["completed", "cancelled"].includes(e.stage)).length;

  return (
    <>
      <PageHeader title="Analytics" sub="Lead performance, conversion rates, and revenue" />

      <div className="px-7 pt-6 pb-16 flex flex-col gap-8 max-w-5xl">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: totalLeads },
            { label: "Conversion Rate", value: `${conversionRate}%` },
            { label: "Active Events", value: activeEvents },
            { label: "Total Events", value: allEvents.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border rounded-lg px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3">{label}</p>
              <p className="text-[28px] font-semibold tabular-nums tracking-tight text-foreground mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Lead source breakdown */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">Leads by Source</p>
            <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
              {sources.length === 0
                ? <p className="text-[13px] text-text-3 p-4">No leads yet.</p>
                : sources.map(([src, { leads: cnt, converted: conv }]) => (
                  <div key={src} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-foreground">{SOURCE_LABELS[src] ?? src}</span>
                      <div className="flex items-center gap-3 text-[12px] text-text-3 tabular-nums">
                        <span>{conv} converted</span>
                        <span className="font-semibold text-foreground">{cnt} leads</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(cnt / maxLeads) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-text-3 mt-1">
                      {cnt > 0 ? Math.round((conv / cnt) * 100) : 0}% conversion
                    </p>
                  </div>
                ))
              }
            </div>
          </section>

          {/* Event stages */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">Events by Stage</p>
            <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
              {Object.keys(stageMap).length === 0
                ? <p className="text-[13px] text-text-3 p-4">No events yet.</p>
                : Object.entries(stageMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([stage, cnt]) => (
                      <div key={stage} className="flex items-center justify-between px-4 py-3">
                        <span className="text-[13px] font-medium text-foreground capitalize">{stage}</span>
                        <span className="text-[13px] tabular-nums text-text-3">{cnt}</span>
                      </div>
                    ))
              }
            </div>
          </section>

          {/* Revenue by event type */}
          {revenueByType.length > 0 && (
            <section className="md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">Quoted Revenue by Event Type</p>
              <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
                {revenueByType.map((r) => (
                  <div key={r.type ?? "other"} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-foreground capitalize">
                        {EVENT_TYPE_LABELS[r.type ?? ""] ?? r.type ?? "Other"}
                      </span>
                      <span className="text-[13px] font-semibold text-foreground tabular-nums">{fmtMoney(r.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(Number(r.total ?? 0) / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
