import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads, comms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { fmtDate, fmtMoney } from "@/lib/utils";
import { convertLeadToEvent } from "@/server/actions/leads";
import { createComm } from "@/server/actions/comms";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import Link from "next/link";
export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [lead] = await db.select().from(leads)
    .where(and(eq(leads.id, params.id), eq(leads.orgId, user.orgId))).limit(1);
  if (!lead) notFound();

  const leadComms = await db.select().from(comms)
    .where(eq(comms.leadId, lead.id)).orderBy(comms.sentAt);

  const fields: [string, string | null | undefined][] = [
    ["Email",        lead.email],
    ["Phone",        lead.phone],
    ["Event type",   lead.eventType],
    ["Event date",   fmtDate(lead.eventDate)],
    ["Est. budget",  fmtMoney(lead.estimatedBudget)],
    ["Guest count",  lead.guestCount?.toString()],
    ["Source",       lead.source?.replace(/_/g, " ")],
  ];

  return (
    <>
      <PageHeader eyebrow="Leads" title={lead.name}>
        <Button asChild variant="outline" size="sm">
          <Link href={`/leads/${lead.id}/edit`}>Edit</Link>
        </Button>
        {lead.status !== "converted" && (
          <form action={convertLeadToEvent.bind(null, lead.id)}>
            <SubmitButton size="sm" pendingText="Converting…">Convert to Event</SubmitButton>
          </form>
        )}
      </PageHeader>

      <div className="px-7 py-6 flex flex-col gap-6 max-w-2xl">
        {/* Status row */}
        <div className="flex items-center gap-3">
          <StatusBadge status={lead.status} />
          <span className="text-[12.5px] text-text-3 capitalize">{lead.source?.replace(/_/g, " ")}</span>
          <span className="text-[12.5px] text-text-3">{fmtDate(lead.createdAt.toISOString())}</span>
        </div>

        {/* Field grid */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {fields.filter(([, v]) => v).map(([label, value], i) => (
            <div key={label} className={`grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-border" : ""}`}>
              <span className="text-text-3">{label}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
          {lead.notes && (
            <div className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[13px] border-t border-border">
              <span className="text-text-3">Notes</span>
              <span className="text-foreground whitespace-pre-wrap">{lead.notes}</span>
            </div>
          )}
        </div>

        {/* Comms */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">Communications</h2>

          <form action={createComm} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3 mb-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="direction" value="outbound" />
            <div className="flex gap-3">
              <SelectInput name="type" className="w-40 flex-shrink-0">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="note">Note</option>
                <option value="meeting">Meeting</option>
              </SelectInput>
              <input
                name="subject"
                placeholder="Subject (optional)"
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Textarea name="body" required placeholder="Log what was communicated…" rows={3} />
            <div>
              <SubmitButton size="sm">Log Comm</SubmitButton>
            </div>
          </form>

          {leadComms.length === 0 ? (
            <p className="text-[13px] text-text-3">No comms logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leadComms.map((c) => (
                <div key={c.id} className="bg-surface border border-border rounded-lg p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[12.5px] font-medium capitalize text-foreground">{c.type}</span>
                    <span className="text-[11.5px] text-text-3 ml-auto tabular-nums">{fmtDate(c.sentAt.toISOString())}</span>
                  </div>
                  <p className="text-[13px] text-text-2">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
