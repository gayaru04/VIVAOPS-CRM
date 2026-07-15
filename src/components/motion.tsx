"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, animate } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise on mount. Wrap any block of server-rendered content. */
export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Parent/child pair for staggered entrances (KPI rows, card grids). */
export function Stagger({
  children,
  className,
  interval = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  interval?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: interval } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts a display value up from zero on mount, preserving any
 * non-numeric prefix/suffix and decimal places ("$13.20", "12%", 47).
 */
export function AnimatedNumber({ value }: { value: string | number }) {
  const reduced = useReducedMotion();
  const str = String(value);
  const match = str.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;

  useEffect(() => {
    if (!match || reduced || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, target, {
      duration: 0.9,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = v.toLocaleString("en-AU", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      },
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Non-numeric values, reduced motion, or finished animation: exact original string
  if (!match || reduced || done) return <>{str}</>;

  return (
    <>
      {prefix}
      <span ref={ref}>{(0).toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
      {suffix}
    </>
  );
}
