"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, HardHat, PlusCircle, Star, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { WorkerCard } from "@/components/workers/worker-card";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorNote,
  Skeleton,
  StatTile,
} from "@/components/ui";
import { JobStatusBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatNumber, formatSalary, relativeTime } from "@/lib/format";

export function SellerDashboard() {
  const { t, locale, tCity, tTrade } = useLocale();
  const { data, error, loading } = useAsync(() => api.sellerDashboard(), []);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-16" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-[74px]" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) return <ErrorNote>{error}</ErrorNote>;

  const { company, stats, jobs, shortlisted_workers: shortlisted } = data;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={company ? (locale === "ar" ? company.name_ar : company.name_en) : t("seller.title")}
        subtitle={t("seller.subtitle")}
        action={
          <Link href="/post-job">
            <Button size="sm">
              <PlusCircle className="size-4" aria-hidden="true" />
              {t("seller.postJob")}
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile icon={Briefcase} label={t("seller.statJobs")} value={formatNumber(stats.jobs, locale)} />
        <StatTile icon={HardHat} label={t("seller.statOpen")} value={formatNumber(stats.open_jobs, locale)} tone="ok" />
        <StatTile icon={Users} label={t("seller.statApplicants")} value={formatNumber(stats.applicants, locale)} />
        <StatTile icon={Star} label={t("seller.statShortlisted")} value={formatNumber(stats.shortlisted, locale)} tone="gold" />
        <StatTile icon={CheckCircle2} label={t("seller.statHired")} value={formatNumber(stats.hired, locale)} tone="ok" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title={t("seller.myJobs")}
          action={
            <Link href="/my-jobs" className="text-sm font-semibold text-brand hover:underline">
              {t("common.viewAll")}
            </Link>
          }
        />
        {jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title={t("seller.noJobs")} body={t("seller.noJobsBody")} />
        ) : (
          <ul className="divide-y divide-line">
            {jobs.slice(0, 6).map(({ job, applicant_count: applicants, shortlisted_count: short, hired_count: hired }) => (
              <li key={job.id}>
                <Link
                  href={`/my-jobs/${job.id}`}
                  className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-canvas"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {tTrade(job.trade)} · {tCity(job.city)} ·{" "}
                      {formatSalary(job.salary_min, job.salary_max, job.job_type, locale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-brand-soft px-2 py-1 font-semibold text-brand">
                      {applicants} {t("common.applicants")}
                    </span>
                    <span className="rounded-md bg-gold-soft px-2 py-1 font-semibold text-gold-dark">
                      {short} {t("status.shortlisted")}
                    </span>
                    <span className="rounded-md bg-ok-soft px-2 py-1 font-semibold text-ok">
                      {hired} {t("status.hired")}
                    </span>
                    <JobStatusBadge status={job.status} flagged={job.is_flagged} />
                    <span className="hidden text-faint sm:inline">
                      {relativeTime(job.created_at, locale)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t("seller.shortlist")}</h2>
          <p className="text-sm text-muted">{t("seller.shortlistHint")}</p>
        </div>
        {shortlisted.length === 0 ? (
          <Card>
            <EmptyState icon={Users} title={t("common.noResults")} body={t("seller.noApplicantsBody")} />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shortlisted.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
