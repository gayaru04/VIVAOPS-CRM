"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/server/actions/account";
import { SubmitButton } from "@/components/ui/submit-button";

export default function SetPasswordPage() {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<"checking" | "ready" | "invalid">("checking");

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? "ready" : "invalid");
    });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updatePassword(fd);
        toast.success("Password set — welcome to VivaOps");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error(String(err));
      }
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to VivaOps</h1>
          <p className="text-sm text-muted-foreground mt-1">Set a password to finish setting up your account.</p>
        </div>

        {status === "checking" && (
          <p className="text-sm text-muted-foreground">Verifying your invite link…</p>
        )}

        {status === "invalid" && (
          <p className="text-sm text-st-red">
            This invite link is invalid or has expired. Ask an admin to send you a new invite.
          </p>
        )}

        {status === "ready" && (
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-foreground">New password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-foreground">Confirm password</label>
              <input
                name="confirm"
                type="password"
                required
                placeholder="Repeat password"
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <SubmitButton className="w-full" pendingText="Setting password…" disabled={isPending}>
              Set password &amp; continue
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
