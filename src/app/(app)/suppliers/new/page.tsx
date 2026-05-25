import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { createSupplier } from "@/server/actions/suppliers";
import Link from "next/link";

const CATEGORIES = [
  "venue", "catering", "photography", "videography",
  "flowers", "music", "transport", "styling", "entertainment", "other",
];

export default function NewSupplierPage() {
  return (
    <>
      <PageHeader eyebrow="Suppliers" title="New Supplier">
        <Button asChild variant="outline" size="sm"><Link href="/suppliers">Cancel</Link></Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={createSupplier} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Name *" className="col-span-2">
              <Input id="name" name="name" required />
            </Field>
            <Field label="Category *" className="col-span-2">
              <SelectInput name="category" id="category" required>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Contact Name">
              <Input id="contactName" name="contactName" />
            </Field>
            <Field label="Phone">
              <Input id="phone" name="phone" />
            </Field>
            <Field label="Email" className="col-span-2">
              <Input id="email" name="email" type="email" />
            </Field>
            <Field label="Website" className="col-span-2">
              <Input id="website" name="website" type="url" placeholder="https://" />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea id="notes" name="notes" rows={3} />
            </Field>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isPreferred"
                name="isPreferred"
                value="true"
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <Label htmlFor="isPreferred" className="font-normal cursor-pointer">Mark as preferred supplier</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <SubmitButton>Create Supplier</SubmitButton>
            <Button asChild variant="outline"><Link href="/suppliers">Cancel</Link></Button>
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
