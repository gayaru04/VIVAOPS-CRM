"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="flex items-center gap-2 h-9 px-4 rounded-md border border-destructive/40 text-destructive text-[13px] font-medium hover:bg-destructive/5 transition-colors disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
