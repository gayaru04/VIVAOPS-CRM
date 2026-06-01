"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark",  label: "Dark",  icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-text-3">Choose your preferred colour scheme.</p>
      <div className="flex gap-3">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 transition-all text-[12px] font-medium",
              theme === value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface-2 text-text-3 hover:border-border hover:bg-hover hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
