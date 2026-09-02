"use client";

import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

import { ApplicationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { formatSalary, relativeTime } from "@/lib/format";

export function ApplicationRow({ application }) {
  const { t, locale, tCity, tCompany } = useLocale();
  const job = application.job;
  if (!job) return null;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-canvas"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Building2 className="size-3.5 text-faint" aria-hidden="true" />
            {tCompany(job.company)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5 text-faint" aria-hidden="true" />
            {tCity(job.city)}
          </span>
          <span className="hidden sm:inline">
            {formatSalary(job.salary_min, job.salary_max, job.job_type, locale)}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-faint sm:inline">
          {relativeTime(application.created_at, locale)}
        </span>
        <ApplicationBadge status={application.status} />
      </div>
    </Link>
  );
}
