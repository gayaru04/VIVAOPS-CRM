"use client";
import { useState, useTransition, useRef } from "react";
import { createQuote } from "@/server/actions/quotes";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type LineItem = { id: number; description: string; qty: string; rate: string };

let nextId = 1;
const blankItem = (): LineItem => ({ id: nextId++, description: "", qty: "1", rate: "" });

export function QuoteForm({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<LineItem[]>([blankItem()]);
  const [taxPct, setTaxPct] = useState("10");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const updateItem = (id: number, field: keyof Omit<LineItem, "id">, value: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  const tax = subtotal * (Number(taxPct) / 100);
  const total = subtotal + tax;

  const fmt = (n: number) => n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("eventId", eventId);
    fd.set("subtotal", subtotal.toString());
    fd.set("tax", tax.toString());
    fd.set("total", total.toString());
    fd.set("lineItems", JSON.stringify(items.map((i) => ({
      description: i.description,
      qty: Number(i.qty) || 1,
      rate: Number(i.rate) || 0,
      amount: (Number(i.qty) || 1) * (Number(i.rate) || 0),
    }))));
    startTransition(async () => {
      try {
        await createQuote(fd);
        toast.success("Quote saved");
        setItems([blankItem()]);
        setTaxPct("10");
        formRef.current?.reset();
      } catch (err) {
        toast.error(String(err));
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Line items — horizontally scrollable on narrow screens rather than clipped */}
      <div className="overflow-x-auto">
      <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 px-4 py-2 border-b border-border bg-surface-2 min-w-[480px]">
        {["Description", "Qty", "Rate", "Amount", ""].map((h) => (
          <span key={h} className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.06em]">{h}</span>
        ))}
      </div>

      {/* Line items */}
      <div className="divide-y divide-border">
        {items.map((item) => {
          const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
          return (
            <div key={item.id} className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 px-4 py-2 items-center min-w-[480px]">
              <input
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                placeholder="Description"
                required
                className="h-8 rounded border border-border bg-background px-2 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="number"
                min="0"
                step="any"
                value={item.qty}
                onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                className="h-8 rounded border border-border bg-background px-2 text-[13px] text-foreground text-right focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="number"
                min="0"
                step="any"
                value={item.rate}
                onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                placeholder="0.00"
                required
                className="h-8 rounded border border-border bg-background px-2 text-[13px] text-foreground text-right focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-[13px] text-foreground text-right tabular-nums">${fmt(amount)}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                className="flex items-center justify-center h-7 w-7 rounded text-text-3 hover:text-red-500 hover:bg-hover disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      </div>

      {/* Add line */}
      <div className="px-4 py-2 border-t border-border border-dashed">
        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-[12px] text-text-3 hover:text-foreground transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add line item
        </button>
      </div>

      {/* Totals + tax */}
      <div className="border-t border-border px-4 py-3 flex flex-col gap-1.5 items-end bg-surface-2">
        <div className="flex items-center gap-6 text-[13px]">
          <span className="text-text-3">Subtotal</span>
          <span className="tabular-nums w-24 text-right">${fmt(subtotal)}</span>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-text-3">GST</span>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={taxPct}
            onChange={(e) => setTaxPct(e.target.value)}
            className="h-7 w-14 rounded border border-border bg-background px-2 text-[13px] text-right focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-text-3 text-[12px]">%</span>
          <span className="tabular-nums w-24 text-right">${fmt(tax)}</span>
        </div>
        <div className="flex items-center gap-6 text-[14px] font-semibold border-t border-border pt-1.5 mt-0.5">
          <span>Total</span>
          <span className="tabular-nums w-24 text-right">${fmt(total)}</span>
        </div>
      </div>

      {/* Notes + submit */}
      <div className="border-t border-border px-4 py-3 flex items-start justify-between gap-4">
        <input
          name="notes"
          placeholder="Notes (optional)"
          className="h-8 flex-1 rounded border border-border bg-background px-2 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input name="validUntil" type="date" className="h-8 rounded border border-border bg-background px-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors flex-shrink-0"
        >
          {isPending ? "Saving…" : "Save Quote"}
        </button>
      </div>
    </form>
  );
}
