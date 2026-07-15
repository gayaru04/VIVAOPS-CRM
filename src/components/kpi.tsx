import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNumber } from "@/components/motion";
import { Sparkline } from "@/components/charts";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  /** optional 12-point weekly series rendered as a sparkline on the right */
  trend?: number[];
  className?: string;
}

export function KpiCard({ label, value, delta, deltaUp, trend, className }: KpiCardProps) {
  return (
    <div className={cn("bg-surface border border-border rounded-lg p-4 card-lift relative h-full", className)}>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-3">{label}</div>
      <div className="text-[26px] font-semibold tracking-[-0.025em] tabular-nums mt-1.5 text-foreground leading-none"><AnimatedNumber value={value} /></div>
      {trend && trend.length > 1 && (
        <div className="absolute right-3.5 bottom-3.5 opacity-80"><Sparkline points={trend} /></div>
      )}
      {delta && (
        <div className={cn(
          "flex items-center gap-1 text-[11.5px] mt-1",
          deltaUp === true ? "text-st-green" : deltaUp === false ? "text-st-red" : "text-text-3"
        )}>
          {deltaUp === true && <TrendingUp className="h-3 w-3" />}
          {deltaUp === false && <TrendingDown className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </div>
  );
}

export function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[12px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3", className)}>
      {children}
    </h2>
  );
}
