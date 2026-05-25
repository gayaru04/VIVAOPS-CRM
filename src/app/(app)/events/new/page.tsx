import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { createEvent } from "@/server/actions/events";
import Link from "next/link";

export default async function NewEventPage() {
  const user = await requireRole("admin", "manager", "coordinator");
  const clientList = await db.select().from(clients).where(eq(clients.orgId, user.orgId));

  return (
    <>
      <PageHeader eyebrow="Events" title="New Event">
        <Button asChild variant="outline" size="sm"><Link href="/events">Cancel</Link></Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={createEvent} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Event Name *" className="col-span-2">
              <Input id="name" name="name" required placeholder="Hartley Wedding" />
            </Field>
            <Field label="Client *" className="col-span-2">
              <SelectInput name="clientId" id="clientId" required>
                <option value="">— Select client —</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Type">
              <SelectInput name="type" id="type">
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="gala">Gala</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Date">
              <Input id="eventDate" name="eventDate" type="date" />
            </Field>
            <Field label="Start Time">
              <Input id="eventTime" name="eventTime" type="time" />
            </Field>
            <Field label="End Time">
              <Input id="endTime" name="endTime" type="time" />
            </Field>
            <Field label="Venue" className="col-span-2">
              <Input id="venue" name="venue" placeholder="The Langham Melbourne" />
            </Field>
            <Field label="Guests">
              <Input id="guestCount" name="guestCount" type="number" placeholder="150" />
            </Field>
            <Field label="Budget (AUD)">
              <Input id="budget" name="budget" placeholder="45000" />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea id="notes" name="notes" rows={3} />
            </Field>
          </div>

          <div className="flex gap-2">
            <SubmitButton>Create Event</SubmitButton>
            <Button asChild variant="outline"><Link href="/events">Cancel</Link></Button>
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
