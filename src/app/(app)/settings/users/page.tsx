import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInput } from "@/components/ui/select-input";
import { fmtDate } from "@/lib/utils";
import { inviteUser, updateUserRole } from "@/server/actions/users";

export default async function UsersPage() {
  const user = await requireRole("admin");
  const allUsers = await db.select().from(users).where(eq(users.orgId, user.orgId));

  return (
    <>
      <PageHeader title="Users" sub="Manage team members and roles" />

      <div className="px-7 py-6 flex flex-col gap-8 max-w-2xl">
        {/* Invite form */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">Invite Member</h2>
          <form action={inviteUser} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Full name *</Label>
                <Input name="name" required placeholder="Jane Smith" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Email *</Label>
                <Input name="email" type="email" required placeholder="jane@company.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <SelectInput name="role">
                  <option value="coordinator">Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </SelectInput>
              </div>
            </div>
            <div>
              <SubmitButton size="sm" pendingText="Sending…">Send Invite</SubmitButton>
            </div>
          </form>
        </section>

        {/* Team list */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-3">
            Team · {allUsers.length}
          </h2>
          <div className="bg-surface border border-border rounded-lg overflow-hidden divide-y divide-border">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{u.name}</p>
                  <p className="text-[11.5px] text-text-3">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={u.role} />
                  <span className="text-[11.5px] text-text-4 tabular-nums">{fmtDate(u.createdAt.toISOString())}</span>
                  {u.id !== user.id && (
                    <form action={updateUserRole.bind(null, u.id, u.role === "admin" ? "coordinator" : "admin")}>
                      <SubmitButton className="h-7 px-2.5 text-[12px] font-medium rounded-md border border-border text-text-3 hover:bg-hover hover:text-foreground">
                        {u.role === "admin" ? "Remove admin" : "Make admin"}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
