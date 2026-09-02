"use client";

import { Loader2 } from "lucide-react";

const BUTTON_VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-dark disabled:bg-brand/50",
  gold: "bg-gold text-white hover:bg-gold-dark disabled:bg-gold/50",
  outline: "border border-line-strong bg-surface text-ink hover:bg-canvas disabled:opacity-50",
  ghost: "text-muted hover:bg-canvas hover:text-ink disabled:opacity-50",
  danger: "border border-bad/30 bg-bad-soft text-bad hover:bg-bad hover:text-white disabled:opacity-50",
  success: "border border-ok/30 bg-ok-soft text-ok hover:bg-ok hover:text-white disabled:opacity-50",
};

const BUTTON_SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-canvas text-muted border-line",
  brand: "bg-brand-soft text-brand border-brand/20",
  gold: "bg-gold-soft text-gold-dark border-gold/30",
  ok: "bg-ok-soft text-ok border-ok/20",
  bad: "bg-bad-soft text-bad border-bad/20",
};

export function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-faint">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-bad">{error}</p> : null}
    </div>
  );
}

const CONTROL =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-faint transition-colors duration-200 hover:border-brand/40 focus:border-brand focus:outline-none";

export function Input({ className = "", ...props }) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function Textarea({ className = "", rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${CONTROL} h-auto py-2.5 leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`${CONTROL} cursor-pointer pe-8 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function StatTile({ icon: Icon, label, value, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-soft text-brand",
    gold: "bg-gold-soft text-gold-dark",
    ok: "bg-ok-soft text-ok",
    bad: "bg-bad-soft text-bad",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
      {Icon ? (
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-faint">{label}</p>
        <p className="text-xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {Icon ? (
        <span className="grid size-12 place-items-center rounded-full bg-canvas text-faint">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {body ? <p className="max-w-sm text-sm text-muted">{body}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-line/70 ${className}`} />;
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-bad/20 bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
      {children}
    </p>
  );
}

export function SuccessNote({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-ok/20 bg-ok-soft px-3 py-2 text-sm font-medium text-ok">
      {children}
    </p>
  );
}

export function Avatar({ name = "", size = "md", tone = "brand" }) {
  const sizes = { sm: "size-9 text-xs", md: "size-11 text-sm", lg: "size-14 text-base" };
  const tones = { brand: "bg-brand text-white", gold: "bg-gold text-white" };
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${sizes[size]} ${tones[tone]}`}
      aria-hidden="true"
    >
      {letters}
    </span>
  );
}
