import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";
import { updateTaskStatus } from "@/server/actions/tasks";
import { SubmitButton } from "@/components/ui/submit-button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TasksPage() {
  const user = await requireUser();
  const rows = await db.select().from(tasks).where(eq(tasks.orgId, user.orgId)).orderBy(desc(tasks.createdAt));

  const open = rows.filter((t) => t.status === "todo" || t.status === "in_progress");
  const done = rows.filter((t) => t.status === "done" || t.status === "cancelled");

  return (
    <>
      <PageHeader title="Tasks" sub={`${open.length} open`}>
        <Button asChild size="sm">
          <Link href="/tasks/new"><Plus className="h-3.5 w-3.5" />New Task</Link>
        </Button>
      </PageHeader>

      <div className="px-7 py-5 flex flex-col gap-5">
        {rows.length === 0 ? (
          <p className="text-[13px] text-text-3">No tasks yet. Create one to get started.</p>
        ) : (
          <>
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
                Open · {open.length}
              </h2>
              <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
                {open.length === 0 && (
                  <p className="text-[13px] text-text-3 px-4 py-3">All caught up.</p>
                )}
                {open.map((task) => (
                  <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-[11.5px] text-text-3 tabular-nums">Due {fmtDate(task.dueDate)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.priority} />
                      <StatusBadge status={task.status} />
                      <form action={updateTaskStatus.bind(null, task.id, "done")}>
                        <SubmitButton className="h-7 px-2.5 text-[12px] font-medium rounded-md border border-border text-text-3 hover:bg-hover hover:text-foreground">
                          Done
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {done.length > 0 && (
              <section>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
                  Completed · {done.length}
                </h2>
                <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border opacity-60">
                  {done.map((task) => (
                    <div key={task.id} className="flex items-center justify-between px-4 py-3">
                      <p className="text-[13px] line-through text-text-3">{task.title}</p>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
