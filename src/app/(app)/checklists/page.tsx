import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { checklistTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";

export default async function ChecklistsPage() {
  const user = await requireUser();
  const templates = await db.select().from(checklistTemplates).where(eq(checklistTemplates.orgId, user.orgId));

  return (
    <>
      <PageHeader title="Checklist Templates" sub="Reusable checklists you can attach to events" />

      <div className="px-7 py-5">
        {templates.length === 0 ? (
          <p className="text-[13px] text-text-3">No templates yet.</p>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
            {templates.map((t) => (
              <div key={t.id} className="px-4 py-3">
                <p className="text-[13px] font-medium text-foreground">{t.name}</p>
                {t.description && <p className="text-[11.5px] text-text-3 mt-0.5">{t.description}</p>}
                {t.eventType && <p className="text-[11.5px] text-text-3 capitalize mt-0.5">{t.eventType}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
