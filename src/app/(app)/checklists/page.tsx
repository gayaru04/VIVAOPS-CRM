import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { checklistTemplates, checklistTemplateItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTemplate, deleteTemplate } from "@/server/actions/checklists";
import Link from "next/link";
import { Plus, ChevronRight, Trash2 } from "lucide-react";

export default async function ChecklistsPage() {
  const user = await requireRole("admin", "manager");

  const templates = await db
    .select()
    .from(checklistTemplates)
    .where(eq(checklistTemplates.orgId, user.orgId))
    .orderBy(checklistTemplates.createdAt);

  const templateIds = templates.map((t) => t.id);
  const allItems = templateIds.length > 0
    ? await db.select().from(checklistTemplateItems).orderBy(checklistTemplateItems.sortOrder)
    : [];

  const itemsByTemplate = allItems.reduce<Record<string, typeof allItems>>((acc, item) => {
    if (!acc[item.templateId]) acc[item.templateId] = [];
    acc[item.templateId].push(item);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Checklist Templates" sub="Reusable task lists you can apply to any event" />

      <div className="px-7 pt-6 pb-16 max-w-3xl flex flex-col gap-8">

        {/* Create form */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">New Template</p>
          <form action={createTemplate} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-text-3">Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. Corporate Dinner Setup"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-text-3">Description (optional)</label>
              <input
                name="description"
                placeholder="Short description of when to use this template"
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <SubmitButton size="sm" pendingText="Creating…">
                <Plus className="h-3.5 w-3.5" /> Create Template
              </SubmitButton>
            </div>
          </form>
        </section>

        {/* Template list */}
        {templates.length === 0 ? (
          <p className="text-[13px] text-text-3">No templates yet — create one above.</p>
        ) : (
          <section className="flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3">Your Templates</p>
            {templates.map((t) => {
              const items = itemsByTemplate[t.id] ?? [];
              return (
                <div key={t.id} className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                      {t.description && <p className="text-[11.5px] text-text-3 mt-0.5">{t.description}</p>}
                      <p className="text-[11.5px] text-text-3 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/checklists/${t.id}`}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded border border-border bg-surface text-[12px] text-foreground hover:bg-hover transition-colors"
                      >
                        Edit items <ChevronRight className="h-3 w-3" />
                      </Link>
                      <form action={deleteTemplate.bind(null, t.id)}>
                        <SubmitButton variant="outline" size="sm" pendingText="…" className="h-7 px-2 text-red-500 hover:text-red-600 border-border">
                          <Trash2 className="h-3 w-3" />
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div key={item.id} className="px-4 py-2.5 flex items-start gap-2">
                          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-text-3 flex-shrink-0" />
                          <div>
                            <p className="text-[13px] text-foreground">{item.title}</p>
                            {item.description && <p className="text-[11.5px] text-text-3">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}
