import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/server/actions/clients";
import Link from "next/link";

export default function NewClientPage() {
  return (
    <>
      <PageHeader eyebrow="Clients" title="New Client">
        <Button asChild variant="outline" size="sm"><Link href="/clients">Cancel</Link></Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={createClient} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Full Name *" className="col-span-2">
              <Input id="name" name="name" required />
            </Field>
            <Field label="Email">
              <Input id="email" name="email" type="email" />
            </Field>
            <Field label="Phone">
              <Input id="phone" name="phone" />
            </Field>
            <Field label="Company" className="col-span-2">
              <Input id="company" name="company" />
            </Field>
            <Field label="Address" className="col-span-2">
              <Input id="address" name="address" />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea id="notes" name="notes" rows={4} />
            </Field>
          </div>

          <div className="flex gap-2">
            <SubmitButton>Create Client</SubmitButton>
            <Button asChild variant="outline"><Link href="/clients">Cancel</Link></Button>
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
