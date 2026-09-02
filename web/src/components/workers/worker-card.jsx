"use client";

import Link from "next/link";
import { Banknote, CalendarClock, MapPin } from "lucide-react";

import { Avatar, Badge } from "@/components/ui";
import { VerificationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { formatDate, formatNumber } from "@/lib/format";

export function WorkerCard({ worker, href = `/workers/${worker.id}` }) {
  const { t, locale, tCity, tTrade } = useLocale();

  return (
    <Link
      href={href}
      className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-brand/50"
    >
      <div className="flex items-start gap-3">
        <Avatar name={worker.full_name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink group-hover:text-brand">
            {worker.full_name}
          </h3>
          <p className="truncate text-sm text-muted">{tTrade(worker.trade)}</p>
        </div>
        <VerificationBadge status={worker.verification_status} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="brand">
          {worker.years_experience} {t("common.years")} {t("common.experience")}
        </Badge>
        <Badge>
          <MapPin className="size-3.5" aria-hidden="true" />
          {tCity(worker.city)}
        </Badge>
      </div>

      <dl className="grid gap-1.5 border-t border-line pt-3 text-sm text-muted sm:grid-cols-2">
        <div className="flex items-center gap-1.5">
          <Banknote className="size-4 shrink-0 text-faint" aria-hidden="true" />
          <dd className="font-medium text-ink">
            {formatNumber(worker.expected_salary_sar, locale)} {locale === "ar" ? "ر.س" : "SAR"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock className="size-4 shrink-0 text-faint" aria-hidden="true" />
          <dd>
            {t("common.available")} {formatDate(worker.availability_date, locale)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
