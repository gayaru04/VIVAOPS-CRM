"use client";
import { useState } from "react";

export function NpsSurveyForm({ token }: { token: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/survey/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-[20px] font-semibold text-foreground mb-2">Thank you!</h2>
        <p className="text-[14px] text-text-3">Your feedback means a lot. We look forward to working with you again.</p>
      </div>
    );
  }

  const labels: Record<number, string> = { 1: "Very poor", 2: "Poor", 3: "Below average", 4: "Average", 5: "Okay", 6: "Good", 7: "Very good", 8: "Great", 9: "Excellent", 10: "Outstanding!" };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-6">
      <div>
        <p className="text-[13px] font-semibold text-foreground mb-3">
          How would you rate your overall experience? *
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              className={`w-11 h-11 rounded-lg border text-[15px] font-semibold transition-colors ${
                score === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-hover"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {score && <p className="text-[12px] text-text-3 mt-2">{labels[score]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-foreground">
          Any comments or suggestions? <span className="font-normal text-text-3">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What went well? What could we improve?"
          className="rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-text-4 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {status === "error" && <p className="text-[13px] text-red-500">Something went wrong. Please try again.</p>}

      <button
        type="submit"
        disabled={score === null || status === "loading"}
        className="h-10 rounded-md bg-primary text-primary-foreground text-[14px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Submitting…" : "Submit Feedback"}
      </button>

      <p className="text-center text-[12px] text-text-3">Powered by <span className="font-medium text-foreground">VivaOPS</span></p>
    </form>
  );
}
