import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { FilterBar } from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { fmtDate, fmtMoney } from "@/lib/utils";
import { Plus, ChevronRight, CalendarDays } from "lucide-react";

export default async function EventsPage() {
  const user = await requireUser();
  const rows = await db
    .select({ event: events, client: clients })
    .from(events)
    .leftJoin(clients, eq(events.clientId, clients.id))
    .where(eq(events.orgId, user.orgId))
    .orderBy(desc(events.createdAt));

  return (
    <>
      <PageHeader eyebrow={`Delivery · ${rows.length} events`} title="Events" sub="Pipeline → delivery. Click an event to open the detail view.">
        <Button variant="outline" size="sm" asChild>
          <Link href="/calendar"><CalendarDays className="h-3 w-3" /> Calendar view</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/events/new"><Plus className="h-3 w-3" /> New event</Link>
        </Button>
      </PageHeader>

      <FilterBar chips={["Stage: any", "Coordinator: any", "Date: next 90d"]} />

      <div className="px-7 pb-16">
        {rows.length === 0 ? (
          <EmptyState title="No events yet" description="Convert a lead or create an event directly.">
            <Button asChild size="sm"><Link href="/events/new">Create event</Link></Button>
          </EmptyState>
        ) : (
          <table className="w-full bg-surface border border-border rounded-lg overflow-hidden mt-3.5" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {["Event", "Date", "Guests", "Venue", "Coordinator", "Budget", "Stage"].map((h) => (
                  <th key={h} className="text-left px-3 py-[7px] text-[11px] font-medium uppercase tracking-[0.06em] text-text-3 border-b border-t border-border bg-black/[0.015] whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="w-7 border-b border-t border-border bg-black/[0.015]" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ event, client }) => (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-hover transition-colors">
                  <td className="px-3 py-2.5">
                    <Link href={`/events/${event.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">
                      {event.name}
                    </Link>
                    <p className="text-[11.5px] text-text-3 capitalize">{event.type}</p>
                  </td>
                  <td className="px-3 py-2.5 text-[13px] tabular-nums text-text-3 whitespace-nowrap">{fmtDate(event.eventDate)}</td>
                  <td className="px-3 py-2.5 text-[13px] tabular-nums text-right text-text-3">{event.guestCount ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[13px] text-text-3">{event.venue ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[13px] text-text-3">{client?.name ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[13px] tabular-nums text-right">{fmtMoney(event.budget)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={event.stage} /></td>
                  <td className="px-3 py-2.5 text-text-4">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
