import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { updateEvent } from "@/server/actions/events";
import Link from "next/link";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const user = await requireRole("admin", "manager", "coordinator");
  const [row] = await db
    .select({ event: events })
    .from(events)
    .where(and(eq(events.id, params.id), eq(events.orgId, user.orgId)))
    .limit(1);
  if (!row) notFound();

  const { event } = row;
  const clientList = await db.select({ id: clients.id, name: clients.name })
    .from(clients).where(eq(clients.orgId, user.orgId));

  const action = updateEvent.bind(null, event.id);

  return (
    <>
      <PageHeader eyebrow="Events" title="Edit Event">
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${event.id}`}>Cancel</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={action} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Event Name *" className="col-span-2">
              <Input name="name" required defaultValue={event.name} />
            </Field>
            <Field label="Client *" className="col-span-2">
              <SelectInput name="clientId" required defaultValue={event.clientId}>
                <option value="">— Select client —</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Type">
              <SelectInput name="type" defaultValue={event.type ?? "wedding"}>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="gala">Gala</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Date">
              <Input name="eventDate" type="date" defaultValue={event.eventDate ?? ""} />
            </Field>
            <Field label="Start Time">
              <Input name="eventTime" type="time" defaultValue={event.eventTime ?? ""} />
            </Field>
            <Field label="End Time">
              <Input name="endTime" type="time" defaultValue={event.endTime ?? ""} />
            </Field>
            <Field label="Venue" className="col-span-2">
              <Input name="venue" defaultValue={event.venue ?? ""} />
            </Field>
            <Field label="Venue Address" className="col-span-2">
              <Input name="venueAddress" defaultValue={event.venueAddress ?? ""} />
            </Field>
            <Field label="Guests">
              <Input name="guestCount" type="number" defaultValue={event.guestCount?.toString() ?? ""} />
            </Field>
            <Field label="Budget (AUD)">
              <Input name="budget" defaultValue={event.budget ?? ""} />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea name="notes" rows={4} defaultValue={event.notes ?? ""} />
            </Field>
          </div>
          <div className="flex gap-2">
            <SubmitButton>Save Changes</SubmitButton>
            <Button asChild variant="outline">
              <Link href={`/events/${event.id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
