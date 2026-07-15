"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteLead } from "@/server/actions/leads";

export function DeleteLeadButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteLead(leadId);
        toast.success(`Deleted lead ${leadName}`);
        router.push("/leads");
      } catch (err) {
        toast.error(String(err));
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[13px] font-medium text-text-3 hover:text-red-500 hover:bg-hover transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-60 border border-border bg-surface rounded-lg shadow-pop p-3 flex flex-col gap-2.5">
            <p className="text-[12.5px] text-foreground">
              Delete lead <span className="font-medium">{leadName}</span>? This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-7 px-2.5 text-[12px] text-text-3 hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="h-7 px-2.5 text-[12px] font-medium rounded text-white bg-destructive hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
