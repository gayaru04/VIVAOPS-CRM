"use client";

import { useState, useTransition } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { createClientQuick } from "./actions";

interface Client { id: string; name: string }

interface ClientSelectorProps {
  clients: Client[];
  value: string;
  onChange: (id: string) => void;
}

export function ClientSelector({ clients, value, onChange }: ClientSelectorProps) {
  const [list, setList] = useState<Client[]>(clients);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate() {
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    startTransition(async () => {
      try {
        const newClient = await createClientQuick({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
        setList((prev) => [...prev, newClient]);
        onChange(newClient.id);
        setShowModal(false);
        setName(""); setEmail(""); setPhone("");
      } catch (err) {
        setError(String(err));
      }
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-[13px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— Select client —</option>
          {list.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-surface text-[12px] font-medium text-foreground hover:bg-hover transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" /> New
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />

          {/* Dialog */}
          <div className="relative bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">New client</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-text-3 hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-text-3">Name *</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="James & Olivia Hartley"
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-text-3">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="james@example.com"
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-text-3">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 4xx xxx xxx"
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-[13px] text-foreground placeholder:text-text-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              {error && <p className="text-[12px] text-destructive">{error}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 px-3 rounded-md border border-border text-[12px] font-medium text-foreground hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isPending}
                className="h-8 px-4 rounded-md bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                {isPending ? "Creating…" : "Create client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
