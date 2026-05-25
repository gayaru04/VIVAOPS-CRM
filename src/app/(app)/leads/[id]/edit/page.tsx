import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { updateLead } from "@/server/actions/leads";
import Link from "next/link";

export default async function EditLeadPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [lead] = await db.select().from(leads)
    .where(and(eq(leads.id, params.id), eq(leads.orgId, user.orgId))).limit(1);
  if (!lead) notFound();

  const action = updateLead.bind(null, lead.id);

  return (
    <>
      <PageHeader eyebrow="Leads" title="Edit Lead">
        <Button asChild variant="outline" size="sm">
          <Link href={`/leads/${lead.id}`}>Cancel</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={action} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Name *" className="col-span-2">
              <Input name="name" required defaultValue={lead.name} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={lead.email ?? ""} />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={lead.phone ?? ""} />
            </Field>
            <Field label="Source">
              <SelectInput name="source" defaultValue={lead.source ?? "website"}>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput name="status" defaultValue={lead.status ?? "new"}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
              </SelectInput>
            </Field>
            <Field label="Event Type">
              <SelectInput name="eventType" defaultValue={lead.eventType ?? ""}>
                <option value="">— None —</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="gala">Gala</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Event Date">
              <Input name="eventDate" type="date" defaultValue={lead.eventDate ?? ""} />
            </Field>
            <Field label="Est. Budget (AUD)">
              <Input name="estimatedBudget" defaultValue={lead.estimatedBudget ?? ""} />
            </Field>
            <Field label="Guest Count">
              <Input name="guestCount" type="number" defaultValue={lead.guestCount?.toString() ?? ""} />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea name="notes" rows={3} defaultValue={lead.notes ?? ""} />
            </Field>
          </div>
          <div className="flex gap-2">
            <SubmitButton>Save Changes</SubmitButton>
            <Button asChild variant="outline">
              <Link href={`/leads/${lead.id}`}>Cancel</Link>
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
