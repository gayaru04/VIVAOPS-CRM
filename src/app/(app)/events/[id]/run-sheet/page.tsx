import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients, runSheetItems, suppliers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { fmtDate } from "@/lib/utils";
import { PrintButton } from "./print-button";

export default async function RunSheetPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const [row] = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);
  if (!row) notFound();

  const items = await db
    .select({ item: runSheetItems, supplier: suppliers })
    .from(runSheetItems)
    .leftJoin(suppliers, eq(runSheetItems.supplierId, suppliers.id))
    .where(eq(runSheetItems.eventId, params.id))
    .orderBy(runSheetItems.time);

  const { event, client } = row;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 print:px-0 print:py-0">
      {/* Header */}
      <div className="mb-8 print:mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-3 mb-1">Run Sheet</p>
        <h1 className="text-[24px] font-semibold text-foreground tracking-tight">{event.name}</h1>
        <p className="text-[13px] text-text-3 mt-1">
          {client?.name}{event.eventDate ? ` · ${fmtDate(event.eventDate)}` : ""}
          {event.venue ? ` · ${event.venue}` : ""}
        </p>
      </div>

      {/* Items */}
      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        {items.length === 0 ? (
          <p className="px-4 py-3 text-[13px] text-text-3">No items on the run sheet yet.</p>
        ) : (
          items.map(({ item, supplier }, i) => (
            <div
              key={item.id}
              className={`grid grid-cols-[80px_1fr] gap-4 px-4 py-3 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}
            >
              <span className="font-mono text-[12px] text-text-3 tabular-nums pt-0.5">{item.time}</span>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                {item.description && <p className="text-[11.5px] text-text-3 mt-0.5">{item.description}</p>}
                <div className="flex gap-3 mt-1 flex-wrap">
                  {item.location && <span className="text-[11.5px] text-text-3">📍 {item.location}</span>}
                  {item.assignedTo && <span className="text-[11.5px] text-text-3">👤 {item.assignedTo}</span>}
                  {supplier && <span className="text-[11.5px] text-text-3">🏢 {supplier.name}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
