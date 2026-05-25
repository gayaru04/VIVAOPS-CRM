import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, suppliers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { createWorkOrder } from "@/server/actions/work-orders";
import Link from "next/link";

export default async function NewWorkOrderPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const user = await requireUser();
  const presetEventId = searchParams.eventId ?? "";
  const [eventList, supplierList] = await Promise.all([
    db.select({ id: events.id, name: events.name }).from(events).where(eq(events.orgId, user.orgId)),
    db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers).where(eq(suppliers.orgId, user.orgId)),
  ]);

  return (
    <>
      <PageHeader eyebrow="Work Orders" title="Issue Work Order">
        <Button asChild variant="outline" size="sm">
          <Link href="/work-orders">Cancel</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={createWorkOrder} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Event *" className="col-span-2">
              <SelectInput id="eventId" name="eventId" required defaultValue={presetEventId}>
                <option value="">Select event…</option>
                {eventList.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Supplier *" className="col-span-2">
              <SelectInput id="supplierId" name="supplierId" required>
                <option value="">Select supplier…</option>
                {supplierList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Amount">
              <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" />
            </Field>
            <Field label="Due date">
              <Input id="dueDate" name="dueDate" type="date" />
            </Field>
            <Field label="Description" className="col-span-2">
              <Textarea id="description" name="description" rows={3} placeholder="Scope of work…" />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea id="notes" name="notes" rows={3} placeholder="Internal notes…" />
            </Field>
          </div>
          <div className="flex gap-2">
            <SubmitButton>Issue Work Order</SubmitButton>
            <Button asChild variant="outline">
              <Link href="/work-orders">Cancel</Link>
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
