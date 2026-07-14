"use client";
import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: Option[];
}

interface FilterBarProps {
  filters?: FilterConfig[];
  sortOptions?: Option[];
  defaultSort?: string;
  searchPlaceholder?: string;
}

export function FilterBar({ filters = [], sortOptions = [], defaultSort, searchPlaceholder = "Search records…" }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Keep the input in sync if the URL changes from elsewhere (back/forward nav)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "any") params.delete(key);
    else params.set(key, value);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("q", value), 300);
  }

  const hasActiveFilters = Boolean(searchParams.get("q")) || filters.some((f) => searchParams.get(f.key));

  function clearAll() {
    setQuery("");
    router.push(pathname);
  }

  return (
    <div className="flex items-center gap-2 px-7 py-2.5 border-b border-border bg-background flex-wrap">
      <div className="flex items-center gap-2 text-[12.5px] text-text-3 border border-border rounded-md px-2.5 py-[5px] bg-surface min-w-[240px] focus-within:border-border-strong">
        <Search className="h-[13px] w-[13px] flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-text-3"
        />
      </div>

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={searchParams.get(filter.key) ?? "any"}
          onChange={(e) => updateParam(filter.key, e.target.value)}
          className="h-[26px] px-2 text-[12px] font-medium border border-border rounded-[5px] bg-surface text-text-2 hover:bg-hover transition-colors whitespace-nowrap shadow-soft cursor-pointer"
        >
          <option value="any">{filter.label}: Any</option>
          {filter.options.map((o) => (
            <option key={o.value} value={o.value}>{filter.label}: {o.label}</option>
          ))}
        </select>
      ))}

      {hasActiveFilters && (
        <button onClick={clearAll} className="h-[26px] px-2 flex items-center gap-1 text-[12px] text-text-3 border border-transparent rounded-[5px] hover:bg-hover hover:text-foreground transition-colors">
          <X className="h-3 w-3" /> Clear
        </button>
      )}

      {sortOptions.length > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <select
            value={searchParams.get("sort") ?? defaultSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="h-[26px] px-2 text-[12px] font-medium border border-border rounded-[5px] bg-surface text-text-2 hover:bg-hover shadow-soft cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
