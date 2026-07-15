import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads, events, quotes } from "@/lib/db/schema";
import { eq, sum } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";
import { HBarChart, TrendArea, ChartLegend, type BarRow, type TrendPoint } from "@/components/charts";
import { fmtMoney, APP_TIMEZONE } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Referral", social: "Social Media",
  email: "Email", phone: "Phone", other: "Other",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding", corporate: "Corporate", birthday: "Birthday",
  conference: "Conference", gala: "Gala", other: "Other",
};

// Pipeline order — the ordinal ramp follows this, not the counts
const STAGE_ORDER = ["inquiry", "proposal", "contract", "planning", "confirmed", "completed"] as const;

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

  // ── Leads by source (converted vs open, two-tone stack) ────────────────
  const sourceMap: Record<string, { leads: number; converted: number }> = {};
  for (const lead of allLeads) {
    const src = lead.source ?? "other";
    if (!sourceMap[src]) sourceMap[src] = { leads: 0, converted: 0 };
    sourceMap[src].leads++;
    if (lead.status === "converted") sourceMap[src].converted++;
  }
  const sourceRows: BarRow[] = Object.entries(sourceMap)
    .sort((a, b) => b[1].leads - a[1].leads)
    .map(([src, { leads: cnt, converted: conv }]) => ({
      label: SOURCE_LABELS[src] ?? src,
      parts: [
        { value: conv, color: "var(--viz-pair-hi)", name: "Converted" },
        { value: cnt - conv, color: "var(--viz-pair-lo)", name: "Open" },
      ],
      display: String(cnt),
      detail: [
        `${conv} converted · ${cnt - conv} open`,
        `${cnt > 0 ? Math.round((conv / cnt) * 100) : 0}% conversion`,
      ],
    }));

  // ── Events by stage (ordinal ramp in pipeline order) ───────────────────
  const stageMap: Record<string, number> = {};
  for (const ev of allEvents) stageMap[ev.stage] = (stageMap[ev.stage] ?? 0) + 1;
  const stageRows: BarRow[] = STAGE_ORDER.map((stage, i) => ({
    label: stage[0].toUpperCase() + stage.slice(1),
    parts: [{ value: stageMap[stage] ?? 0, color: `var(--viz-step-${i + 1})` }],
    display: String(stageMap[stage] ?? 0),
  }));
  if (stageMap["cancelled"]) {
    stageRows.push({
      label: "Cancelled",
      parts: [{ value: stageMap["cancelled"], color: "hsl(var(--st-slate))" }],
      display: String(stageMap["cancelled"]),
    });
  }

  // ── Revenue by event type (second sequential context: teal) ────────────
  const revenueBars: BarRow[] = revenueRows
    .filter((r) => r.total && Number(r.total) > 0)
    .sort((a, b) => Number(b.total ?? 0) - Number(a.total ?? 0))
    .map((r) => ({
      label: EVENT_TYPE_LABELS[r.type ?? ""] ?? r.type ?? "Other",
      parts: [{ value: Number(r.total ?? 0), color: "var(--viz-teal)" }],
      display: fmtMoney(r.total),
    }));

  // ── New leads per week, last 12 weeks ───────────────────────────────────
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const buckets: number[] = Array(12).fill(0);
  for (const lead of allLeads) {
    const age = now - lead.createdAt.getTime();
    const idx = 11 - Math.floor(age / weekMs);
    if (idx >= 0 && idx <= 11) buckets[idx]++;
  }
  const trendPoints: TrendPoint[] = buckets.map((value, i) => ({
    value,
    label: new Date(now - (11 - i) * weekMs).toLocaleDateString("en-AU", {
      day: "numeric", month: "short", timeZone: APP_TIMEZONE,
    }),
  }));

  // ── KPIs ────────────────────────────────────────────────────────────────
  const totalLeads = allLeads.length;
  const converted = allLeads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const activeEvents = allEvents.filter((e) => !["completed", "cancelled"].includes(e.stage)).length;

  const card = "bg-surface border border-border rounded-lg card-lift";
  const heading = "text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3";

  return (
    <>
      <PageHeader title="Analytics" sub="Lead performance, conversion rates, and revenue" />

      <div className="px-7 pt-6 pb-16 flex flex-col gap-6 max-w-5xl">

        {/* KPI row */}
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem><KpiCard label="Total Leads" value={totalLeads} trend={buckets} /></StaggerItem>
          <StaggerItem><KpiCard label="Conversion Rate" value={`${conversionRate}%`} /></StaggerItem>
          <StaggerItem><KpiCard label="Active Events" value={activeEvents} /></StaggerItem>
          <StaggerItem><KpiCard label="Total Events" value={allEvents.length} /></StaggerItem>
        </Stagger>

        {/* Lead volume trend */}
        <FadeUp delay={0.12} className={card}>
          <div className="flex items-baseline justify-between px-5 pt-4 pb-1">
            <p className={heading}>New Leads · last 12 weeks</p>
          </div>
          <div className="px-3 pb-3">
            {totalLeads === 0
              ? <p className="text-[13px] text-text-3 px-2 pb-3">No leads yet.</p>
              : <TrendArea points={trendPoints} series="new leads" />}
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Leads by source */}
          <FadeUp delay={0.18} className={card}>
            <div className="flex items-center justify-between gap-3 flex-wrap px-5 pt-4 pb-1">
              <p className={heading}>Leads by Source</p>
              <ChartLegend items={[
                { label: "Converted", color: "var(--viz-pair-hi)" },
                { label: "Open", color: "var(--viz-pair-lo)" },
              ]} />
            </div>
            <div className="px-5 pb-4 pt-1">
              {sourceRows.length === 0
                ? <p className="text-[13px] text-text-3 pb-3">No leads yet.</p>
                : <HBarChart rows={sourceRows} />}
            </div>
          </FadeUp>

          {/* Events by stage */}
          <FadeUp delay={0.24} className={card}>
            <div className="px-5 pt-4 pb-1">
              <p className={heading}>Events by Stage</p>
            </div>
            <div className="px-5 pb-4 pt-1">
              {allEvents.length === 0
                ? <p className="text-[13px] text-text-3 pb-3">No events yet.</p>
                : <HBarChart rows={stageRows} />}
            </div>
          </FadeUp>

          {/* Revenue by event type */}
          {revenueBars.length > 0 && (
            <FadeUp delay={0.3} className={`${card} md:col-span-2`}>
              <div className="px-5 pt-4 pb-1">
                <p className={heading}>Quoted Revenue by Event Type</p>
              </div>
              <div className="px-5 pb-4 pt-1">
                <HBarChart rows={revenueBars} />
              </div>
            </FadeUp>
          )}
        </div>
      </div>
    </>
  );
}
