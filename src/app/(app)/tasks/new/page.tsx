import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/ui/select-input";
import { createTask } from "@/server/actions/tasks";
import Link from "next/link";

export default async function NewTaskPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const user = await requireUser();
  const eventList = await db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(eq(events.orgId, user.orgId));
  const presetEventId = searchParams.eventId ?? "";

  return (
    <>
      <PageHeader eyebrow="Tasks" title="New Task">
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks">Cancel</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-6">
        <form action={createTask} className="max-w-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Title *" className="col-span-2">
              <Input id="title" name="title" required placeholder="e.g. Confirm venue deposit" />
            </Field>
            <Field label="Priority">
              <SelectInput id="priority" name="priority">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </SelectInput>
            </Field>
            <Field label="Due date">
              <Input id="dueDate" name="dueDate" type="date" />
            </Field>
            <Field label="Linked event" className="col-span-2">
              <SelectInput id="eventId" name="eventId" defaultValue={presetEventId}>
                <option value="">None</option>
                {eventList.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Notes" className="col-span-2">
              <Textarea id="description" name="description" rows={3} />
            </Field>
          </div>
          <div className="flex gap-2">
            <SubmitButton>Create Task</SubmitButton>
            <Button asChild variant="outline">
              <Link href="/tasks">Cancel</Link>
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
