"use client";
import { useFormStatus } from "react-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  pendingText?: string;
}

export function SubmitButton({
  children,
  pendingText,
  className,
  variant,
  size,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {pending && (
        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
      )}
      {pending ? (pendingText ?? children) : children}
    </button>
  );
}
