"use client";

import { Menu } from "lucide-react";

import { Avatar } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/i18n/locale-context";
import { LangToggle } from "./lang-toggle";

export function Topbar({ onOpenNav }) {
  const { user } = useAuth();
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid size-11 cursor-pointer place-items-center rounded-lg border border-line-strong text-muted transition-colors duration-200 hover:bg-canvas lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="ms-auto flex items-center gap-3">
        <LangToggle />
        <div className="flex items-center gap-3 rounded-lg border border-line px-2.5 py-1.5">
          <Avatar name={user?.full_name} size="sm" />
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold text-ink">{user?.full_name}</span>
            <span className="block truncate text-xs text-faint">{t(`roles.${user?.role}`)}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
