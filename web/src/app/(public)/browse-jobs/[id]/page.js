"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  MapPin,
  Users,
} from "lucide-react";

import { SignInGate } from "@/components/layout/sign-in-gate";
import { Card, CardHeader, ErrorNote, Skeleton } from "@/components/ui";
import { JobStatusBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { publicApi } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatDate, formatSalary } from "@/lib/format";

export default function PublicJobPage() {
  const { id } = useParams();
  const { t, locale, isRtl, tCity, tTrade, tCompany } = useLocale();
  const { data: job, error, loading } = useAsync(() => publicApi.job(id), [id]);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorNote>{error || t("errors.generic")}</ErrorNote>
      </div>
    );
  }

  const facts = [
    { icon: Briefcase, label: t("job.trade"), value: tTrade(job.trade) },
    { icon: MapPin, label: t("job.city"), value: tCity(job.city) },
    { icon: CalendarClock, label: t("job.type"), value: t(`jobType.${job.job_type}`) },
    {
      icon: Banknote,
      label: t("job.salary"),
      value: formatSalary(job.salary_min, job.salary_max, job.job_type, locale),
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/browse-jobs"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand"
      >
        <BackIcon className="size-4" aria-hidden="true" />
        {t("public.jobs.title")}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{job.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {tCompany(job.company)} · {tCity(job.city)}
          </p>
        </div>
        <JobStatusBadge status={job.status} flagged={job.is_flagged} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title={t("job.overview")} />
            <dl className="grid gap-4 p-5 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-faint">{label}</dt>
                    <dd className="text-sm font-semibold text-ink">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title={t("job.description")} />
            <div className="p-5 text-sm leading-relaxed text-muted">{job.description}</div>
          </Card>

          <Card>
            <CardHeader title={t("job.requirements")} />
            <div className="p-5 text-sm leading-relaxed text-muted">{job.requirements}</div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title={t("job.postedBy")} />
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-gold-soft text-gold-dark">
                  <Building2 className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{tCompany(job.company)}</p>
                  <p className="truncate text-xs text-faint">{tCity(job.company.city)}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted">{job.company.description}</p>
              <div className="flex items-center gap-2 border-t border-line pt-3 text-xs text-faint">
                <Users className="size-3.5" aria-hidden="true" />
                {job.applicant_count} {t("common.applicants")} · {t("common.posted")}{" "}
                {formatDate(job.created_at, locale)}
              </div>
            </div>
          </Card>

          <SignInGate
            title={t("public.gate.applyTitle")}
            body={t("public.gate.applyBody")}
            button={t("public.gate.applyButton")}
            next={`/jobs/${job.id}`}
          />
        </div>
      </div>
    </div>
  );
}
