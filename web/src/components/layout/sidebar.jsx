"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  FileCheck2,
  HardHat,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/i18n/locale-context";

const NAV = {
  buyer: [
    { section: "sectionMain", items: [
      { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
      { href: "/jobs", key: "jobs", icon: Briefcase },
      { href: "/applications", key: "applications", icon: ClipboardList },
    ] },
  ],
  seller: [
    { section: "sectionMain", items: [
      { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
      { href: "/jobs", key: "jobs", icon: Briefcase },
      { href: "/workers", key: "workers", icon: Users },
    ] },
    { section: "sectionManage", items: [
      { href: "/my-jobs", key: "myJobs", icon: HardHat },
      { href: "/post-job", key: "postJob", icon: PlusCircle },
    ] },
  ],
  admin: [
    { section: "sectionMain", items: [
      { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
      { href: "/jobs", key: "jobs", icon: Briefcase },
      { href: "/workers", key: "workers", icon: Users },
    ] },
    { section: "sectionAdmin", items: [
      { href: "/admin/verifications", key: "verifications", icon: FileCheck2 },
      { href: "/admin/jobs", key: "moderation", icon: ShieldCheck },
    ] },
  ],
};

export function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, isRtl } = useLocale();
  const groups = NAV[user?.role] ?? [];
  const hidden = isRtl ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-[264px] flex-col bg-brand text-white transition-transform duration-200 ${
          open ? "translate-x-0" : `${hidden} lg:translate-x-0`
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
            <Image src="/logo.jpeg" alt="ZEO Find Work" width={44} height={44} className="size-11 object-cover" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{t("brand")}</span>
            <span className="block text-[11px] leading-tight text-white/60">{t("tagline")}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ms-auto grid size-9 cursor-pointer place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.section} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                {t(`nav.${group.section}`)}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map(({ href, key, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
                          active
                            ? "bg-white text-brand"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                        <span className="truncate">{t(`nav.${key}`)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-[18px]" aria-hidden="true" />
            {t("nav.signOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
