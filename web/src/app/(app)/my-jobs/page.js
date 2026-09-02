"use client";

import Link from "next/link";
import { Briefcase, PlusCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import { Button, Card, EmptyState, ErrorNote, Skeleton } from "@/components/ui";
import { JobStatusBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatSalary, relativeTime } from "@/lib/format";

function MyJobsView() {
  const { t, locale, tCity, tTrade } = useLocale();
  const { data, error, loading } = useAsync(() => api.sellerDashboard(), []);
  const jobs = data?.jobs || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("nav.myJobs")}
        subtitle={`${jobs.length} ${t("common.results")}`}
        action={
          <Link href="/post-job">
            <Button size="sm">
              <PlusCircle className="size-4" aria-hidden="true" />
              {t("seller.postJob")}
            </Button>
          </Link>
        }
      />
      <ErrorNote>{error}</ErrorNote>

      {loading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card className="overflow-hidden">
          {jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title={t("seller.noJobs")} body={t("seller.noJobsBody")} />
          ) : (
            <ul className="divide-y divide-line">
              {jobs.map(({ job, applicant_count: applicants, shortlisted_count: short, hired_count: hired }) => (
                <li key={job.id}>
                  <Link
                    href={`/my-jobs/${job.id}`}
                    className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-canvas"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {tTrade(job.trade)} · {tCity(job.city)} · {t(`jobType.${job.job_type}`)} ·{" "}
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
      )}
    </div>
  );
}

export default function MyJobsPage() {
  return (
    <RouteGuard roles={["seller"]}>
      <MyJobsView />
    </RouteGuard>
  );
}
