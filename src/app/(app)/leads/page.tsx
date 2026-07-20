import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and, or, ilike, gte, desc, asc, type SQL } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { FilterBar } from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { fmtDate, fmtMoney } from "@/lib/utils";
import { Plus, ChevronRight } from "lucide-react";

const UPDATED_WINDOW_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; source?: string; updated?: string; sort?: string };
}) {
  const user = await requireUser();

  const conditions: SQL[] = [eq(leads.orgId, user.orgId)];
  if (searchParams.q) {
    conditions.push(or(ilike(leads.name, `%${searchParams.q}%`), ilike(leads.email, `%${searchParams.q}%`))!);
  }
  if (searchParams.status) conditions.push(eq(leads.status, searchParams.status as typeof leads.status.enumValues[number]));
  if (searchParams.source) conditions.push(eq(leads.source, searchParams.source as typeof leads.source.enumValues[number]));
  const updatedDays = searchParams.updated ? UPDATED_WINDOW_DAYS[searchParams.updated] : undefined;
  if (updatedDays) conditions.push(gte(leads.updatedAt, new Date(Date.now() - updatedDays * 86400000)));

  const orderBy =
    searchParams.sort === "oldest" ? asc(leads.updatedAt) :
    searchParams.sort === "name" ? asc(leads.name) :
    desc(leads.updatedAt);

  const rows = await db.select().from(leads).where(and(...conditions)).orderBy(orderBy);

  return (
    <>
      <PageHeader eyebrow={`Records · ${rows.length} ${rows.length === 1 ? "lead" : "leads"}`} title="Leads" sub="Inbound and outbound inquiries.">
        <Button asChild size="sm">
          <Link href="/leads/new"><Plus className="h-3 w-3" /> New lead</Link>
        </Button>
      </PageHeader>

      <FilterBar
        searchPlaceholder="Search leads by name or email…"
        filters={[
          { key: "status", label: "Status", options: [
            { value: "new", label: "New" },
            { value: "contacted", label: "Contacted" },
            { value: "qualified", label: "Qualified" },
            { value: "unqualified", label: "Unqualified" },
            { value: "converted", label: "Converted" },
          ] },
          { key: "source", label: "Source", options: [
            { value: "website", label: "Website" },
            { value: "referral", label: "Referral" },
            { value: "social", label: "Social" },
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "other", label: "Other" },
          ] },
          { key: "updated", label: "Updated", options: [
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "90d", label: "Last 90 days" },
          ] },
        ]}
        sortOptions={[
          { value: "newest", label: "Recently updated" },
          { value: "oldest", label: "Oldest updated" },
          { value: "name", label: "Name (A–Z)" },
        ]}
        defaultSort="newest"
      />

      <div className="px-7 pb-16">
        {rows.length === 0 ? (
          <EmptyState title="No leads yet" description="Add one manually or wait for website inquiries.">
            <Button asChild size="sm"><Link href="/leads/new">Add lead</Link></Button>
          </EmptyState>
        ) : (
          <table className="w-full bg-surface border border-border rounded-lg overflow-hidden mt-3.5" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="w-7 px-3 py-[7px] border-b border-t border-border bg-black/[0.015]" />
                {["Name", "Type", "Source", "Stage", "Value", "Owner", "Next action", "Updated"].map((h) => (
                  <th key={h} className="text-left px-3 py-[7px] text-[11px] font-medium uppercase tracking-[0.06em] text-text-3 border-b border-t border-border bg-black/[0.015] whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="w-7 border-b border-t border-border bg-black/[0.015]" />
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => {
                const hue = (lead.name.charCodeAt(0) * 23) % 360;
                return (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-hover transition-colors">
                    <td className="px-3 py-2.5">
                      <div
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                        style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 55%), hsl(${(hue + 40) % 360} 60% 55%))` }}
                      >
                        {lead.name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Link href={`/leads/${lead.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">
                        {lead.name}
                      </Link>
                      {lead.email && <p className="text-[11.5px] text-text-3">{lead.email}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status="new" className="invisible" />
                      {/* type badge placeholder — same dot pattern */}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-[7px] py-[1px] text-[11.5px] font-medium text-text-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-st-violet flex-shrink-0" />
                        {lead.eventType ?? "Event"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-text-3 capitalize">{lead.source?.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={lead.status} /></td>
                    <td className="px-3 py-2.5 text-[13px] tabular-nums text-right">{fmtMoney(lead.estimatedBudget)}</td>
                    <td className="px-3 py-2.5 text-[13px] text-text-3">—</td>
                    <td className="px-3 py-2.5 text-[13px] text-text-3">—</td>
                    <td className="px-3 py-2.5 text-[13px] text-text-3 text-right tabular-nums">{fmtDate(lead.updatedAt.toISOString())}</td>
                    <td className="px-3 py-2.5 text-text-4">
                      <ChevronRight className="h-4 w-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
