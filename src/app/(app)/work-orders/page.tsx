import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { workOrders, suppliers, events } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function WorkOrdersPage() {
  const user = await requireUser();
  const rows = await db
    .select({ wo: workOrders, supplier: suppliers, event: events })
    .from(workOrders)
    .leftJoin(suppliers, eq(workOrders.supplierId, suppliers.id))
    .leftJoin(events, eq(workOrders.eventId, events.id))
    .where(eq(workOrders.orgId, user.orgId))
    .orderBy(desc(workOrders.createdAt));

  return (
    <>
      <PageHeader title="Work Orders" sub={`${rows.length} total`}>
        <Button asChild size="sm">
          <Link href="/work-orders/new"><Plus className="h-3.5 w-3.5" />Issue Work Order</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-5">
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Number</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Supplier</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Event</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Amount</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-[13px] text-text-3">No work orders yet.</td>
                </tr>
              )}
              {rows.map(({ wo, supplier, event }) => (
                <tr key={wo.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-3 text-[12px] font-mono text-text-2 tabular-nums">{wo.number}</td>
                  <td className="px-4 py-3 text-[13px] text-foreground">{supplier?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px]">
                    {event
                      ? <Link href={`/events/${event.id}`} className="text-foreground hover:text-primary transition-colors">{event.name}</Link>
                      : <span className="text-text-3">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-foreground tabular-nums">{fmtMoney(wo.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={wo.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
