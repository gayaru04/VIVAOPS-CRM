import { cn } from "@/lib/utils";

/* Dot colours — dot only, never fill backgrounds (per design spec) */
const dotMap: Record<string, string> = {
  // Lead
  new:         "bg-st-slate",
  contacted:   "bg-st-amber",
  qualified:   "bg-st-blue",
  unqualified: "bg-st-slate",
  converted:   "bg-st-green",
  // Event stages
  inquiry:     "bg-st-slate",
  proposal:    "bg-st-violet",
  contract:    "bg-st-amber",
  planning:    "bg-st-blue",
  confirmed:   "bg-st-green",
  completed:   "bg-st-green",
  cancelled:   "bg-st-red",
  // Tasks
  todo:        "bg-st-slate",
  in_progress: "bg-st-blue",
  done:        "bg-st-green",
  // Quotes
  draft:       "bg-st-slate",
  sent:        "bg-st-violet",
  accepted:    "bg-st-green",
  rejected:    "bg-st-red",
  expired:     "bg-st-slate",
  // Work orders
  pending:     "bg-st-amber",
  declined:    "bg-st-red",
  // Checklist
  na:          "bg-st-slate",
};

const labelMap: Record<string, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified",
  unqualified: "Unqualified", converted: "Converted",
  inquiry: "Inquiry", proposal: "Proposal", contract: "Contract",
  planning: "Planning", confirmed: "Confirmed", completed: "Completed",
  cancelled: "Cancelled", todo: "To Do", in_progress: "In Progress",
  done: "Done", draft: "Draft", sent: "Sent", accepted: "Accepted",
  rejected: "Rejected", expired: "Expired", pending: "Pending",
  declined: "Declined", na: "N/A",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const dot = dotMap[status] ?? "bg-st-slate";
  const label = labelMap[status] ?? status;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-[7px] py-[1px] text-[11.5px] font-medium text-text-2 whitespace-nowrap",
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dot)} />
      {label}
    </span>
  );
}
