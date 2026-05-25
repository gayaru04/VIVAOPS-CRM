import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { suppliers, workOrders, events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/utils";
import Link from "next/link";
import { Star } from "lucide-react";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [supplier] = await db.select().from(suppliers)
    .where(and(eq(suppliers.id, params.id), eq(suppliers.orgId, user.orgId))).limit(1);
  if (!supplier) notFound();

  const wos = await db
    .select({ wo: workOrders, event: events })
    .from(workOrders)
    .leftJoin(events, eq(workOrders.eventId, events.id))
    .where(eq(workOrders.supplierId, supplier.id));

  const fields: [string, string | null | undefined][] = [
    ["Category",       supplier.category],
    ["Contact name",   supplier.contactName],
    ["Email",          supplier.email],
    ["Phone",          supplier.phone],
    ["Website",        supplier.website],
  ];

  return (
    <>
      <PageHeader eyebrow="Suppliers" title={supplier.name}>
        {supplier.isPreferred && (
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Preferred
          </span>
        )}
        <Button asChild variant="outline" size="sm">
          <Link href={`/suppliers/${supplier.id}/edit`}>Edit</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6 flex flex-col gap-6 max-w-2xl">
        {/* Fields */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {fields.filter(([, v]) => v).map(([label, value], i) => (
            <div key={label} className={`grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
              <span className="text-text-3 capitalize">{label}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
          {supplier.notes && (
            <div className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[13px] border-t border-border">
              <span className="text-text-3">Notes</span>
              <span className="text-foreground whitespace-pre-wrap">{supplier.notes}</span>
            </div>
          )}
        </div>

        {/* Work orders */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Work Orders · {wos.length}
          </h2>
          {wos.length === 0 ? (
            <p className="text-[13px] text-text-3">No work orders yet.</p>
          ) : (
            <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
              {wos.map(({ wo, event }) => (
                <div key={wo.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{event?.name ?? "—"}</p>
                    <p className="text-[11.5px] text-text-3 tabular-nums font-mono">{wo.number} · {fmtMoney(wo.amount)}</p>
                  </div>
                  <StatusBadge status={wo.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
