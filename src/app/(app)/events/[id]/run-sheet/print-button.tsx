"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-[12.5px] text-text-3 underline underline-offset-4 hover:text-foreground transition-colors"
    >
      Print / Save as PDF
    </button>
  );
}
