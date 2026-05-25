import { Search, Plus, ArrowUpDown, MoreHorizontal } from "lucide-react";

interface FilterBarProps {
  chips?: string[];
  placeholder?: string;
}

export function FilterBar({ chips = [], placeholder = "Search records…" }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 px-7 py-2.5 border-b border-border bg-background flex-wrap">
      <button className="flex items-center gap-2 text-[12.5px] text-text-3 border border-border rounded-md px-2.5 py-[5px] hover:border-border-strong bg-surface min-w-[240px]">
        <Search className="h-[13px] w-[13px] flex-shrink-0" />
        <span>{placeholder}</span>
      </button>

      {chips.map((chip) => (
        <button
          key={chip}
          className="h-[26px] px-2 text-[12px] font-medium border border-border rounded-[5px] bg-surface text-text-2 hover:bg-hover transition-colors whitespace-nowrap shadow-soft"
        >
          {chip}
        </button>
      ))}

      <button className="h-[26px] px-2 flex items-center gap-1 text-[12px] text-text-3 border border-transparent rounded-[5px] hover:bg-hover hover:text-foreground transition-colors">
        <Plus className="h-3 w-3" /> Add filter
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button className="h-[26px] px-2 flex items-center gap-1.5 text-[12px] font-medium border border-border rounded-[5px] bg-surface text-text-2 hover:bg-hover shadow-soft">
          <ArrowUpDown className="h-3 w-3" /> Sort
        </button>
        <button className="h-[26px] w-[26px] grid place-items-center border border-border rounded-[5px] bg-surface text-text-2 hover:bg-hover shadow-soft">
          <MoreHorizontal className="h-[13px] w-[13px]" />
        </button>
      </div>
    </div>
  );
}
