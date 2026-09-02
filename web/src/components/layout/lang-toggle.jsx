"use client";

import { Languages } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";

export function LangToggle({ variant = "light" }) {
  const { locale, toggleLocale } = useLocale();
  const styles =
    variant === "light"
      ? "border-line-strong bg-surface text-ink hover:bg-canvas"
      : "border-white/25 bg-white/10 text-white hover:bg-white/20";
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={locale === "en" ? "Switch to Arabic" : "التحويل إلى الإنجليزية"}
      className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors duration-200 ${styles}`}
    >
      <Languages className="size-4" aria-hidden="true" />
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
