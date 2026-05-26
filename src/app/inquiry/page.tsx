"use client";
import { useState } from "react";

const EVENT_TYPES = ["wedding", "corporate", "birthday", "conference", "gala", "other"];

export default function InquiryPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v) body[k] = v; });

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[20px] font-semibold text-foreground mb-2">Enquiry received!</h2>
          <p className="text-[14px] text-text-3">Thanks for reaching out. Our team will be in touch within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="mb-6 text-center">
          <h1 className="text-[24px] font-semibold text-foreground">Event Enquiry</h1>
          <p className="text-[14px] text-text-3 mt-1">Tell us about your event and we'll get back to you shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-3">Full name *</label>
              <input name="name" required placeholder="Jane Smith"
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-3">Email</label>
              <input name="email" type="email" placeholder="jane@example.com"
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-3">Phone</label>
              <input name="phone" type="tel" placeholder="+61 400 000 000"
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-3">Event type</label>
              <select name="eventType" className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select…</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-3">Event date</label>
              <input name="eventDate" type="date"
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-3">Guest count</label>
              <input name="guestCount" type="number" min="1" placeholder="100"
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-3">Estimated budget (AUD)</label>
            <input name="estimatedBudget" type="number" min="0" placeholder="15000"
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-3">Tell us more</label>
            <textarea name="notes" rows={3} placeholder="Venue preferences, special requirements, anything else we should know…"
              className="rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>

          {status === "error" && <p className="text-[13px] text-red-500">{errorMsg}</p>}

          <button type="submit" disabled={status === "loading"}
            className="h-10 rounded-md bg-primary text-primary-foreground text-[14px] font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {status === "loading" ? "Submitting…" : "Submit Enquiry"}
          </button>
        </form>

        <p className="text-center text-[12px] text-text-3 mt-4">
          Powered by <span className="font-medium text-foreground">VivaOPS</span>
        </p>
      </div>
    </div>
  );
}
