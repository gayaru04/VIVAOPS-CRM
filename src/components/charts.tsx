"use client";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Shared tooltip: one fixed div per chart, written via textContent ───── */

function useTooltip() {
  const ref = useRef<HTMLDivElement>(null);

  function show(e: React.PointerEvent, lines: string[]) {
    const el = ref.current;
    if (!el) return;
    el.replaceChildren(
      ...lines.map((line, i) => {
        const p = document.createElement("p");
        p.textContent = line; // labels are untrusted data — never innerHTML
        p.className = i === 0 ? "font-semibold text-foreground" : "text-text-3";
        return p;
      })
    );
    el.style.opacity = "1";
    move(e);
  }
  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const pad = 14;
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = e.clientX + pad, y = e.clientY - h - 10;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y < 8) y = e.clientY + pad;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }
  function hide() {
    if (ref.current) ref.current.style.opacity = "0";
  }

  const node = (
    <div
      ref={ref}
      aria-hidden
      className="fixed left-0 top-0 z-50 pointer-events-none opacity-0 transition-opacity duration-100 bg-surface border border-border-strong rounded-md shadow-pop px-2.5 py-1.5 text-[12px] leading-[1.5] whitespace-nowrap"
    />
  );
  return { node, show, move, hide };
}

/* ── Legend chip row ────────────────────────────────────────────────────── */

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map(({ label, color }) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-[11.5px] text-text-3">
          <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ── Horizontal bars ────────────────────────────────────────────────────── */

export interface BarRow {
  label: string;
  /** ordered segments; single-element array for plain bars */
  parts: { value: number; color: string; name?: string }[];
  /** value label at the bar tip (text token, never series color) */
  display: string;
  /** extra tooltip lines under the bold first line */
  detail?: string[];
}

export function HBarChart({ rows, max }: { rows: BarRow[]; max?: number }) {
  const reduced = useReducedMotion();
  const tip = useTooltip();
  const top = max ?? Math.max(...rows.map((r) => r.parts.reduce((s, p) => s + p.value, 0)), 1);

  return (
    <div className="flex flex-col">
      {tip.node}
      {rows.map((row, ri) => {
        const total = row.parts.reduce((s, p) => s + p.value, 0);
        return (
          <div
            key={row.label}
            className="group grid grid-cols-[110px_1fr_auto] items-center gap-3 py-[7px] cursor-default"
            onPointerEnter={(e) => tip.show(e, [`${row.label} — ${row.display}`, ...(row.detail ?? [])])}
            onPointerMove={tip.move}
            onPointerLeave={tip.hide}
          >
            <span className="text-[12.5px] text-text-2 truncate">{row.label}</span>
            {/* track */}
            <div className="relative h-[18px] rounded-r-[4px] overflow-hidden bg-surface-3/60">
              <div className="absolute inset-y-0 left-0 flex w-full">
                {row.parts.map((p, pi) => (
                  <motion.div
                    key={pi}
                    className="h-full group-hover:brightness-110 transition-[filter]"
                    style={{
                      background: p.color,
                      // 2px surface gap between touching segments; 4px rounded data-end
                      marginLeft: p.value > 0 && row.parts.slice(0, pi).some((q) => q.value > 0) ? 2 : 0,
                      borderRadius: pi === row.parts.length - 1 || row.parts.slice(pi + 1).every((q) => q.value === 0) ? "0 4px 4px 0" : 0,
                    }}
                    initial={reduced ? false : { width: 0 }}
                    animate={{ width: `${(p.value / top) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + ri * 0.06, ease: EASE }}
                  />
                ))}
              </div>
            </div>
            <span className="text-[12px] font-medium tabular-nums text-foreground text-right min-w-[52px]">
              {row.display}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Area trend (weekly series) ─────────────────────────────────────────── */

export interface TrendPoint {
  label: string;
  value: number;
}

const W = 640, H = 170, PAD_L = 30, PAD_R = 16, PAD_T = 14, PAD_B = 26;

export function TrendArea({ points, series }: { points: TrendPoint[]; series: string }) {
  const reduced = useReducedMotion();
  const tip = useTooltip();
  const crossRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  const maxV = Math.max(...points.map((p) => p.value), 1);
  const yMax = Math.max(Math.ceil(maxV / 2) * 2, 2); // clean even ceiling
  const x = (i: number) => PAD_L + (i / Math.max(points.length - 1, 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - v / yMax) * (H - PAD_T - PAD_B);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const last = points[points.length - 1];

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD_L) / (W - PAD_L - PAD_R)) * (points.length - 1));
    const ci = Math.max(0, Math.min(points.length - 1, i));
    const p = points[ci];
    if (crossRef.current) {
      crossRef.current.setAttribute("x1", String(x(ci)));
      crossRef.current.setAttribute("x2", String(x(ci)));
      crossRef.current.style.opacity = "1";
    }
    if (dotRef.current) {
      dotRef.current.setAttribute("cx", String(x(ci)));
      dotRef.current.setAttribute("cy", String(y(p.value)));
      dotRef.current.style.opacity = "1";
    }
    tip.show(e, [`${p.value} ${series}`, `Week of ${p.label}`]);
  }
  function onLeave() {
    if (crossRef.current) crossRef.current.style.opacity = "0";
    if (dotRef.current) dotRef.current.style.opacity = "0";
    tip.hide();
  }

  const ticks = [0, yMax / 2, yMax];

  return (
    <div>
      {tip.node}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block touch-none"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        role="img"
        aria-label={`${series} per week`}
      >
        {/* hairline grid + clean ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_L} y1={y(t)} x2={W - PAD_R} y2={y(t)} stroke="hsl(var(--viz-grid))" strokeWidth="1" />
            <text x={PAD_L - 7} y={y(t) + 3.5} textAnchor="end" className="fill-text-4" fontSize="10.5">
              {t}
            </text>
          </g>
        ))}
        {/* sparse x labels: first, middle, last */}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-text-4" fontSize="10.5">
            {points[i]?.label}
          </text>
        ))}
        {/* area wash at 10%, 2px line, round joins */}
        <motion.path
          d={area}
          fill="var(--viz-line)"
          opacity="0.1"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--viz-line)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        />
        {/* end dot: ≥8px mark with 2px surface ring + end label */}
        <circle cx={x(points.length - 1)} cy={y(last.value)} r="4.5" fill="var(--viz-line)" stroke="hsl(var(--surface))" strokeWidth="2" />
        <text x={x(points.length - 1) - 8} y={y(last.value) - 9} textAnchor="end" className="fill-text-2" fontSize="11" fontWeight="600">
          {last.value}
        </text>
        {/* crosshair + hover dot (hidden until pointermove) */}
        <line ref={crossRef} y1={PAD_T} y2={H - PAD_B} stroke="hsl(var(--border-strong))" strokeWidth="1" style={{ opacity: 0 }} />
        <circle ref={dotRef} r="4.5" fill="var(--viz-line)" stroke="hsl(var(--surface))" strokeWidth="2" style={{ opacity: 0 }} />
      </svg>
    </div>
  );
}

/* ── Sparkline for stat tiles ───────────────────────────────────────────── */

export function Sparkline({ points }: { points: number[] }) {
  const w = 96, h = 26, max = Math.max(...points, 1);
  const px = (i: number) => (i / Math.max(points.length - 1, 1)) * (w - 6) + 3;
  const py = (v: number) => 3 + (1 - v / max) * (h - 6);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className="block">
      <path d={d} fill="none" stroke="hsl(var(--text-4))" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px(points.length - 1)} cy={py(points[points.length - 1])} r="3" fill="var(--viz-line)" stroke="hsl(var(--surface))" strokeWidth="1.5" />
    </svg>
  );
}
