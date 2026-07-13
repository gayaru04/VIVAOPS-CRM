"use client";
import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { inviteUser } from "@/server/actions/users";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInput } from "@/components/ui/select-input";

export function InviteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await inviteUser(fd);
        toast.success("Invite sent");
        formRef.current?.reset();
        router.refresh();
      } catch (err) {
        toast.error(String(err instanceof Error ? err.message : err));
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Full name *</Label>
          <Input name="name" required placeholder="Jane Smith" disabled={isPending} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Email *</Label>
          <Input name="email" type="email" required placeholder="jane@company.com" disabled={isPending} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Role</Label>
          <SelectInput name="role" disabled={isPending}>
            <option value="coordinator">Coordinator</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </SelectInput>
        </div>
      </div>
      <div>
        <SubmitButton size="sm" pendingText="Sending…" disabled={isPending}>Send Invite</SubmitButton>
      </div>
    </form>
  );
}
