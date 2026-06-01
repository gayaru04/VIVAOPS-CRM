import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients, runSheetItems, suppliers, eventStaff, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PrintButton } from "./print-button";

function fmtTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default async function RunSheetPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const [row] = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);
  if (!row) notFound();

  const { event, client } = row;

  const [items, staffRows] = await Promise.all([
    db.select({ item: runSheetItems, supplier: suppliers })
      .from(runSheetItems)
      .leftJoin(suppliers, eq(runSheetItems.supplierId, suppliers.id))
      .where(eq(runSheetItems.eventId, event.id))
      .orderBy(runSheetItems.time),
    db.select({ staff: eventStaff, member: users })
      .from(eventStaff)
      .leftJoin(users, eq(eventStaff.userId, users.id))
      .where(eq(eventStaff.eventId, event.id)),
  ]);

  return (
    <>
      {/* Hide sidebar + topbar when printing */}
      <style>{`
        @media print {
          aside, nav, header { display: none !important; }
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-page { padding: 32px 48px !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="print-page max-w-2xl mx-auto px-7 pt-8 pb-16">

        {/* Top bar — hidden on print */}
        <div className="no-print flex items-center justify-between mb-8">
          <a href={`/events/${event.id}`} className="text-[13px] text-text-3 hover:text-foreground transition-colors">
            ← Back to event
          </a>
          <div className="flex gap-2">
            <a
              href={`/api/events/${event.id}/run-sheet-pdf`}
              download
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-[12px] font-medium text-foreground hover:bg-hover transition-colors"
            >
              Download PDF
            </a>
            <PrintButton />
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary mb-2">Run Sheet</p>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight">{event.name}</h1>
          {client?.name && <p className="text-[13px] text-text-3 mt-1">{client.name}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-[12.5px] text-text-2">
            {event.eventDate && <span>📅 {fmtDate(event.eventDate)}</span>}
            {event.venue && <span>📍 {event.venue}</span>}
            {event.guestCount && <span>👥 {event.guestCount} guests</span>}
          </div>
        </div>

        {/* Double divider */}
        <div className="border-t-2 border-foreground mb-px" />
        <div className="border-t border-border mb-6" />

        {/* Staff */}
        {staffRows.length > 0 && (
          <div className="bg-surface-2 border border-border rounded-lg px-4 py-3 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-4 mb-2">Team on the day</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {staffRows.map(({ staff, member }) => (
                <span key={staff.id} className="text-[12.5px] text-foreground">
                  <strong>{member?.name}</strong>
                  <span className="text-text-3 capitalize"> · {staff.role}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {items.length === 0 ? (
          <p className="text-[13px] text-text-3 text-center py-12">No items on the run sheet yet.</p>
        ) : (
          <div>
            {items.map(({ item, supplier }, i) => (
              <div key={item.id} className="flex gap-4">
                {/* Time */}
                <div className="w-[68px] flex-shrink-0 pt-3 text-right">
                  <span className="text-[11.5px] font-bold text-primary tabular-nums">{fmtTime(item.time)}</span>
                  {item.duration && (
                    <p className="text-[10px] text-text-4 mt-0.5">{item.duration}m</p>
                  )}
                </div>

                {/* Dot + line */}
                <div className="flex flex-col items-center w-5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-3.5 flex-shrink-0" />
                  {i < items.length - 1 && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2 pb-5">
                  <p className="text-[13.5px] font-semibold text-foreground">{item.title}</p>
                  {item.description && (
                    <p className="text-[12px] text-text-2 mt-1 leading-relaxed">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {item.location && <span className="text-[11.5px] text-text-3">📍 {item.location}</span>}
                    {item.assignedTo && <span className="text-[11.5px] text-text-3">👤 {item.assignedTo}</span>}
                    {supplier && <span className="text-[11.5px] text-text-3">🏢 {supplier.name}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border mt-8 pt-4 flex justify-between text-[11px] text-text-4">
          <span>VivaOps · Event Management</span>
          <span>Confidential</span>
        </div>
      </div>
    </>
  );
}
