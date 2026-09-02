"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";

import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/i18n/locale-context";
import { LangToggle } from "./lang-toggle";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/talent", key: "talent" },
  { href: "/browse-jobs", key: "jobs" },
];

export function PublicNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.jpeg"
            alt="ZEO Find Work"
            width={40}
            height={40}
            className="size-10 rounded-lg object-cover"
          />
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-tight text-ink">{t("brand")}</span>
            <span className="block text-[11px] leading-tight text-faint">{t("tagline")}</span>
          </span>
        </Link>

        <nav className="ms-4 hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, key }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  active ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                {t(`public.nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LangToggle />
          <Link href={user ? "/dashboard" : "/login"} className="hidden sm:block">
            <Button size="md">
              {user ? (
                <LayoutDashboard className="size-4" aria-hidden="true" />
              ) : (
                <LogIn className="size-4" aria-hidden="true" />
              )}
              {t(user ? "public.nav.dashboard" : "public.nav.signIn")}
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="grid size-11 cursor-pointer place-items-center rounded-lg border border-line-strong text-muted transition-colors duration-200 hover:bg-canvas md:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-surface px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-200 hover:bg-canvas hover:text-ink"
                >
                  {t(`public.nav.${key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg bg-brand px-3 text-sm font-semibold text-white"
              >
                {t(user ? "public.nav.dashboard" : "public.nav.signIn")}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
