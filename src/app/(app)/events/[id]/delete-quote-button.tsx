"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteQuote } from "@/server/actions/quotes";

export function DeleteQuoteButton({ quoteId, eventId, quoteNumber }: { quoteId: string; eventId: string; quoteNumber: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const resetRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-cancel the confirm state after a few seconds so it doesn't linger
  useEffect(() => {
    if (confirming) {
      resetRef.current = setTimeout(() => setConfirming(false), 4000);
      return () => clearTimeout(resetRef.current);
    }
  }, [confirming]);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteQuote(quoteId, eventId);
        toast.success(`Deleted quote ${quoteNumber}`);
      } catch (err) {
        toast.error(String(err));
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="h-6 px-2 text-[11px] font-medium rounded text-white bg-destructive hover:bg-destructive/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Deleting…" : "Confirm delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="h-6 px-2 text-[11px] text-text-3 hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center justify-center h-6 w-6 rounded text-text-3 hover:text-red-500 hover:bg-hover transition-colors"
      aria-label={`Delete quote ${quoteNumber}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
