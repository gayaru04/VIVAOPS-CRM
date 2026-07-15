"use client";
import { motion, useReducedMotion } from "motion/react";

/**
 * Remounts on every route change: fades page content up on navigation,
 * and paints an ambient top glow that scrolls slower than the content
 * (--scroll-y is set on <main> by AppShell) for a subtle parallax depth.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative isolate"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div aria-hidden className="parallax-glow" />
      {children}
    </motion.div>
  );
}
