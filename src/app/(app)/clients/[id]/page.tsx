import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clients, events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [client] = await db.select().from(clients)
    .where(and(eq(clients.id, params.id), eq(clients.orgId, user.orgId))).limit(1);
  if (!client) notFound();

  const clientEvents = await db.select().from(events).where(eq(events.clientId, client.id));

  const fields: [string, string | null | undefined][] = [
    ["Email",   client.email],
    ["Phone",   client.phone],
    ["Company", client.company],
    ["Address", client.address],
  ];

  return (
    <>
      <PageHeader eyebrow="Clients" title={client.name}>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clients/${client.id}/edit`}>Edit</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6 flex flex-col gap-6 max-w-2xl">
        {/* Fields */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {fields.filter(([, v]) => v).map(([label, value], i) => (
            <div key={label} className={`grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
              <span className="text-text-3">{label}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
          {client.notes && (
            <div className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[13px] border-t border-border">
              <span className="text-text-3">Notes</span>
              <span className="text-foreground whitespace-pre-wrap">{client.notes}</span>
            </div>
          )}
        </div>

        {/* Events */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Events · {clientEvents.length}
          </h2>
          {clientEvents.length === 0 ? (
            <p className="text-[13px] text-text-3">No events yet.</p>
          ) : (
            <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
              {clientEvents.map((ev) => (
                <Link key={ev.id} href={`/events/${ev.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{ev.name}</p>
                    <p className="text-[11.5px] text-text-3">{fmtDate(ev.eventDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ev.stage} />
                    <ChevronRight className="h-4 w-4 text-text-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
