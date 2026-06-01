import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients, runSheetItems, eventStaff, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PrintButton } from "./print-button";

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function fmtTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function RunSheetPrintPage({ params }: { params: { id: string } }) {
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
    db.select().from(runSheetItems).where(eq(runSheetItems.eventId, event.id)).orderBy(runSheetItems.time),
    db.select({ staff: eventStaff, member: users })
      .from(eventStaff)
      .leftJoin(users, eq(eventStaff.userId, users.id))
      .where(eq(eventStaff.eventId, event.id)),
  ]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Controls — hidden on print */}
      <div className="no-print" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href={`/events/${event.id}`} style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
            ← Back to event
          </a>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{event.name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`/api/events/${event.id}/run-sheet-pdf`}
            download
            style={{
              fontSize: 13, fontWeight: 500, padding: "6px 14px",
              border: "1px solid #e5e7eb", borderRadius: 6,
              color: "#374151", textDecoration: "none", background: "#f9fafb",
            }}
          >
            Download PDF
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Page */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 48px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6d4ed8", margin: "0 0 6px" }}>
                Run Sheet
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>
                {event.name}
              </h1>
              {client?.name && (
                <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>{client.name}</p>
              )}
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "#6d4ed8",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
            }}>V</div>
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 13, color: "#6b7280" }}>
            {event.eventDate && <span>📅 {fmtDate(event.eventDate)}</span>}
            {event.venue && <span>📍 {event.venue}</span>}
            {event.guestCount && <span>👥 {event.guestCount} guests</span>}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "2px solid #111", marginBottom: 0 }} />
        <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 28 }} />

        {/* Staff summary */}
        {staffRows.length > 0 && (
          <div style={{ marginBottom: 28, padding: "14px 16px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", margin: "0 0 8px" }}>
              Team
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
              {staffRows.map(({ staff, member }) => (
                <span key={staff.id} style={{ fontSize: 12, color: "#374151" }}>
                  <strong>{member?.name}</strong> · <span style={{ color: "#6b7280", textTransform: "capitalize" }}>{staff.role}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Run sheet items */}
        {items.length === 0 ? (
          <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
            No run sheet items added yet.
          </p>
        ) : (
          <div>
            {items.map((item, i) => (
              <div key={item.id} style={{ display: "flex", gap: 20, marginBottom: 0 }}>
                {/* Time column */}
                <div style={{ width: 72, flexShrink: 0, paddingTop: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6d4ed8", fontVariantNumeric: "tabular-nums" }}>
                    {fmtTime(item.time)}
                  </span>
                  {item.duration && (
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0" }}>{item.duration}min</p>
                  )}
                </div>

                {/* Timeline line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6d4ed8", marginTop: 17, flexShrink: 0 }} />
                  {i < items.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "#e5e7eb", minHeight: 24 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: 12, paddingBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{item.title}</p>
                  {item.description && (
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "3px 0 0", lineHeight: 1.5 }}>{item.description}</p>
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    {item.location && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>📍 {item.location}</span>
                    )}
                    {item.assignedTo && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>👤 {item.assignedTo}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 40, paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
          <span>Generated by VivaOps · Event Management</span>
          <span>Confidential</span>
        </div>
      </div>
    </>
  );
}
