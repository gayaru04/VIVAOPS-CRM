"use client";
import { useTransition, useState } from "react";
import { updateProfile } from "@/server/actions/account";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "sonner";

export function ProfileForm({ name, email, role }: { name: string; email: string; role: string }) {
  const [currentName, setCurrentName] = useState(name);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateProfile(fd);
        toast.success("Profile updated");
      } catch (err) {
        toast.error(String(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(252 60% 55%), hsl(312 70% 60%))" }}
        >
          {currentName.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">{currentName}</p>
          <p className="text-[12px] text-text-3 capitalize">{role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[11px] font-medium text-text-3">Display name</label>
          <input
            name="name"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[11px] font-medium text-text-3">Email</label>
          <input
            value={email}
            disabled
            className="flex h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-[13px] text-text-3 cursor-not-allowed opacity-60"
          />
        </div>
      </div>

      <div>
        <SubmitButton size="sm" pendingText="Saving…" disabled={isPending}>Save changes</SubmitButton>
      </div>
    </form>
  );
}
