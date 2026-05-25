import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { updateSupplier } from "@/server/actions/suppliers";
import Link from "next/link";

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [supplier] = await db.select().from(suppliers)
    .where(and(eq(suppliers.id, params.id), eq(suppliers.orgId, user.orgId))).limit(1);
  if (!supplier) notFound();

  const action = updateSupplier.bind(null, supplier.id);

  return (
    <>
      <PageHeader eyebrow="Suppliers" title="Edit Supplier">
        <Button asChild variant="outline" size="sm">
          <Link href={`/suppliers/${supplier.id}`}>Cancel</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={action} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Name *" className="col-span-2">
              <Input name="name" required defaultValue={supplier.name} />
            </Field>
            <Field label="Category *">
              <SelectInput name="category" required defaultValue={supplier.category ?? ""}>
                <option value="venue">Venue</option>
                <option value="catering">Catering</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="flowers">Flowers</option>
                <option value="music">Music</option>
                <option value="transport">Transport</option>
                <option value="styling">Styling</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Preferred">
              <SelectInput name="isPreferred" defaultValue={supplier.isPreferred ? "true" : "false"}>
                <option value="false">No</option>
                <option value="true">Yes — Preferred</option>
              </SelectInput>
            </Field>
            <Field label="Contact Name" className="col-span-2">
              <Input name="contactName" defaultValue={supplier.contactName ?? ""} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={supplier.email ?? ""} />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={supplier.phone ?? ""} />
            </Field>
            <Field label="Website" className="col-span-2">
              <Input name="website" type="url" defaultValue={supplier.website ?? ""} placeholder="https://" />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea name="notes" rows={3} defaultValue={supplier.notes ?? ""} />
            </Field>
          </div>
          <div className="flex gap-2">
            <SubmitButton>Save Changes</SubmitButton>
            <Button asChild variant="outline">
              <Link href={`/suppliers/${supplier.id}`}>Cancel</Link>
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
