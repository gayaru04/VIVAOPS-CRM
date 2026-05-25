import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { createLead } from "@/server/actions/leads";
import Link from "next/link";

export default function NewLeadPage() {
  return (
    <>
      <PageHeader eyebrow="Leads" title="New Lead">
        <Button asChild variant="outline" size="sm"><Link href="/leads">Cancel</Link></Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={createLead} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Name *" className="col-span-2">
              <Input id="name" name="name" required placeholder="Jane Smith" />
            </Field>
            <Field label="Email">
              <Input id="email" name="email" type="email" placeholder="jane@example.com" />
            </Field>
            <Field label="Phone">
              <Input id="phone" name="phone" placeholder="+61 4xx xxx xxx" />
            </Field>
            <Field label="Source">
              <SelectInput name="source" id="source">
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Event Type">
              <SelectInput name="eventType" id="eventType">
                <option value="">— Select —</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="gala">Gala</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Event Date">
              <Input id="eventDate" name="eventDate" type="date" />
            </Field>
            <Field label="Est. Budget (AUD)">
              <Input id="estimatedBudget" name="estimatedBudget" placeholder="15000" />
            </Field>
            <Field label="Guest Count">
              <Input id="guestCount" name="guestCount" type="number" placeholder="120" />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea id="notes" name="notes" rows={3} placeholder="Any additional details…" />
            </Field>
          </div>

          <div className="flex gap-2">
            <SubmitButton>Create Lead</SubmitButton>
            <Button asChild variant="outline"><Link href="/leads">Cancel</Link></Button>
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
