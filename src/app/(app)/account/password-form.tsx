"use client";
import { useTransition, useRef } from "react";
import { updatePassword } from "@/server/actions/account";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "sonner";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await updatePassword(fd);
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Password updated successfully");
        formRef.current?.reset();
      } catch {
        toast.error("Couldn't update the password — please try again.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-text-3">New password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Min 6 characters"
          className="flex h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-text-3">Confirm new password</label>
        <input
          name="confirm"
          type="password"
          required
          placeholder="Repeat password"
          className="flex h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <SubmitButton size="sm" pendingText="Updating…" disabled={isPending}>Update password</SubmitButton>
      </div>
    </form>
  );
}
