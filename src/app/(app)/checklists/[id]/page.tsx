import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { checklistTemplates, checklistTemplateItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { addTemplateItem, deleteTemplateItem } from "@/server/actions/checklists";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function ChecklistTemplatePage({ params }: { params: { id: string } }) {
  const user = await requireRole("admin", "manager");

  const [template] = await db
    .select()
    .from(checklistTemplates)
    .where(and(eq(checklistTemplates.id, params.id), eq(checklistTemplates.orgId, user.orgId)))
    .limit(1);

  if (!template) notFound();

  const items = await db
    .select()
    .from(checklistTemplateItems)
    .where(eq(checklistTemplateItems.templateId, template.id))
    .orderBy(checklistTemplateItems.sortOrder);

  return (
    <>
      <PageHeader
        title={template.name}
        sub={template.description ?? "Checklist template"}
      />

      <div className="px-7 pt-6 pb-16 max-w-2xl flex flex-col gap-6">
        <Link href="/checklists" className="inline-flex items-center gap-1 text-[12px] text-text-3 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to templates
        </Link>

        {/* Add item form */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">Add Item</p>
          <form action={addTemplateItem} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
            <input type="hidden" name="templateId" value={template.id} />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-text-3">Task title *</label>
              <input
                name="title"
                required
                placeholder="e.g. Confirm venue AV setup"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-text-3">Notes (optional)</label>
              <input
                name="description"
                placeholder="Additional details or instructions"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <SubmitButton size="sm" pendingText="Adding…">Add Item</SubmitButton>
            </div>
          </form>
        </section>

        {/* Items list */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Items ({items.length})
          </p>
          {items.length === 0 ? (
            <p className="text-[13px] text-text-3">No items yet — add one above.</p>
          ) : (
            <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-start justify-between px-4 py-3 gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[11.5px] text-text-3 font-mono tabular-nums mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
                    <div>
                      <p className="text-[13px] text-foreground">{item.title}</p>
                      {item.description && <p className="text-[11.5px] text-text-3 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                  <form action={deleteTemplateItem.bind(null, item.id, template.id)}>
                    <SubmitButton variant="outline" size="sm" pendingText="…" className="h-7 px-2 text-red-500 hover:text-red-600 border-border flex-shrink-0">
                      <Trash2 className="h-3 w-3" />
                    </SubmitButton>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
