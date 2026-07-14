"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { createRunSheetItem } from "@/server/actions/run-sheet";
import { fmtTime } from "@/lib/utils";

type Item = { time: string; title: string; description: string | null };

export function AiRunsheetButton({ eventId, existingCount }: { eventId: string; existingCount: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "inserting">("idle");
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/generate-runsheet`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setItems(data.items);
      setStatus("preview");
    } catch (e) {
      setError(String(e));
      setStatus("idle");
    }
  }

  async function insertAll() {
    setStatus("inserting");
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const fd = new FormData();
      fd.set("eventId", eventId);
      fd.set("time", item.time);
      fd.set("title", item.title);
      fd.set("description", item.description ?? "");
      fd.set("sortOrder", String(existingCount + i));
      await createRunSheetItem(fd);
    }
    setItems([]);
    setStatus("idle");
  }

  if (status === "preview") {
    return (
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
          <p className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-generated run sheet ({items.length} items)
          </p>
          <div className="flex gap-2">
            <button onClick={() => setStatus("idle")} className="h-7 px-3 rounded border border-border text-[12px] text-text-3 hover:bg-hover transition-colors">
              Discard
            </button>
            <button onClick={insertAll} className="h-7 px-3 rounded bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors">
              Add all to run sheet
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[70px_1fr] gap-3 px-4 py-2.5 text-[13px]">
              <span className="font-mono text-[12px] text-text-3 tabular-nums pt-0.5">{fmtTime(item.time)}</span>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                {item.description && <p className="text-[11.5px] text-text-3 mt-0.5">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={generate}
        disabled={status === "loading" || status === "inserting"}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-[12px] font-medium text-foreground hover:bg-hover disabled:opacity-50 transition-colors self-start"
      >
        {status === "loading" ? (
          <><span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" /> Generating…</>
        ) : (
          <><Sparkles className="h-3.5 w-3.5 text-primary" /> Generate with AI</>
        )}
      </button>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
    </div>
  );
}
