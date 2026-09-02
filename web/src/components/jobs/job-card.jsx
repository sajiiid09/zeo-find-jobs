"use client";

import Link from "next/link";
import { Banknote, Building2, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui";
import { JobStatusBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { formatSalary, relativeTime } from "@/lib/format";

export function JobCard({ job, showApplicants = false, showStatus = false }) {
  const { t, locale, tCity, tTrade, tCompany } = useLocale();

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-brand/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink group-hover:text-brand">
            {job.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted">
            <Building2 className="size-4 shrink-0 text-faint" aria-hidden="true" />
            {tCompany(job.company)}
          </p>
        </div>
        {job.has_applied ? <Badge tone="brand">{t("job.applied")}</Badge> : null}
        {showStatus ? <JobStatusBadge status={job.status} flagged={job.is_flagged} /> : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="gold">{tTrade(job.trade)}</Badge>
        <Badge>{t(`jobType.${job.job_type}`)}</Badge>
      </div>

      <dl className="grid gap-1.5 text-sm text-muted sm:grid-cols-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0 text-faint" aria-hidden="true" />
          <dd>{tCity(job.city)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Banknote className="size-4 shrink-0 text-faint" aria-hidden="true" />
          <dd className="font-medium text-ink">
            {formatSalary(job.salary_min, job.salary_max, job.job_type, locale)}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-faint">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden="true" />
          {t("common.posted")} {relativeTime(job.created_at, locale)}
        </span>
        {showApplicants ? (
          <span className="flex items-center gap-1.5 font-semibold text-brand">
            <Users className="size-3.5" aria-hidden="true" />
            {job.applicant_count} {t("common.applicants")}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
