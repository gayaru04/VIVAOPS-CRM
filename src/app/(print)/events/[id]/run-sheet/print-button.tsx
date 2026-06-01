"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        fontSize: 13, fontWeight: 500, padding: "6px 14px",
        border: "1px solid #6d4ed8", borderRadius: 6,
        color: "#fff", background: "#6d4ed8", cursor: "pointer",
      }}
    >
      Print
    </button>
  );
}
