import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, sub, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-end gap-4 px-7 pt-[22px] pb-[14px] border-b border-border bg-background", className)}>
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3 mb-1">{eyebrow}</p>
        )}
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground leading-none">{title}</h1>
        {sub && <p className="text-[13px] text-text-3 mt-1">{sub}</p>}
      </div>
      {children && (
        <div className="ml-auto flex items-center gap-2 flex-shrink-0 pb-0.5">{children}</div>
      )}
    </div>
  );
}
