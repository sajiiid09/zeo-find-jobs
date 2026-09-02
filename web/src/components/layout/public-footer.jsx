"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale } from "@/i18n/locale-context";

export function PublicFooter() {
  const { t } = useLocale();

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.jpeg"
              alt="ZEO Find Work"
              width={40}
              height={40}
              className="size-10 rounded-lg object-cover"
            />
            <span className="text-sm font-bold text-ink">{t("brand")}</span>
          </div>
          <p className="mt-3 text-sm text-muted">{t("public.footer.tagline")}</p>
          <p className="mt-1 text-xs text-faint">{t("public.footer.cities")}</p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Link href="/talent" className="text-muted transition-colors duration-200 hover:text-brand">
            {t("public.nav.talent")}
          </Link>
          <Link href="/browse-jobs" className="text-muted transition-colors duration-200 hover:text-brand">
            {t("public.nav.jobs")}
          </Link>
          <Link href="/login" className="text-muted transition-colors duration-200 hover:text-brand">
            {t("public.nav.signIn")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-faint sm:px-6 lg:px-8">
        {t("public.footer.demoNote")}
      </div>
    </footer>
  );
}
