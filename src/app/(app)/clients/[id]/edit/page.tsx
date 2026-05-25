import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateClient } from "@/server/actions/clients";
import Link from "next/link";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [client] = await db.select().from(clients)
    .where(and(eq(clients.id, params.id), eq(clients.orgId, user.orgId))).limit(1);
  if (!client) notFound();

  const action = updateClient.bind(null, client.id);

  return (
    <>
      <PageHeader eyebrow="Clients" title="Edit Client">
        <Button asChild variant="outline" size="sm">
          <Link href={`/clients/${client.id}`}>Cancel</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={action} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Full Name *" className="col-span-2">
              <Input name="name" required defaultValue={client.name} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={client.email ?? ""} />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={client.phone ?? ""} />
            </Field>
            <Field label="Company" className="col-span-2">
              <Input name="company" defaultValue={client.company ?? ""} />
            </Field>
            <Field label="Address" className="col-span-2">
              <Input name="address" defaultValue={client.address ?? ""} />
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea name="notes" rows={4} defaultValue={client.notes ?? ""} />
            </Field>
          </div>
          <div className="flex gap-2">
            <SubmitButton>Save Changes</SubmitButton>
            <Button asChild variant="outline">
              <Link href={`/clients/${client.id}`}>Cancel</Link>
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
