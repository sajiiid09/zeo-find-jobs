"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag, FlagOff, Lock, Unlock } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import { Button, Card, ErrorNote, Skeleton } from "@/components/ui";
import { JobStatusBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatSalary, relativeTime } from "@/lib/format";

function ModerationView() {
  const { t, locale, tCity, tTrade, tCompany } = useLocale();
  const { data, loading, error: loadError, reload } = useAsync(() => api.adminJobs(), []);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const jobs = data || [];

  async function update(jobId, body, key) {
    setError("");
    setBusyId(`${jobId}:${key}`);
    try {
      await api.updateJob(jobId, body);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("admin.moderation")}
        subtitle={`${jobs.length} ${t("common.results")} · ${t("admin.moderationHint")}`}
      />

      <ErrorNote>{error || loadError}</ErrorNote>

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-start">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-faint">
                    {t("admin.job")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-faint">
                    {t("admin.contractor")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-faint">
                    {t("common.applicants")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-faint">
                    {t("job.overview")}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-faint">
                    {t("admin.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {jobs.map((job) => (
                  <tr key={job.id} className="transition-colors duration-200 hover:bg-canvas">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-semibold text-ink hover:text-brand hover:underline"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {tTrade(job.trade)} · {tCity(job.city)} ·{" "}
                        {formatSalary(job.salary_min, job.salary_max, job.job_type, locale)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{tCompany(job.company)}</td>
                    <td className="px-5 py-3.5 font-semibold text-ink">{job.applicant_count}</td>
                    <td className="px-5 py-3.5">
                      <JobStatusBadge status={job.status} flagged={job.is_flagged} />
                      <p className="mt-1 text-xs text-faint">{relativeTime(job.created_at, locale)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={busyId === `${job.id}:status`}
                          onClick={() =>
                            update(job.id, { status: job.status === "open" ? "closed" : "open" }, "status")
                          }
                        >
                          {job.status === "open" ? (
                            <Lock className="size-4" aria-hidden="true" />
                          ) : (
                            <Unlock className="size-4" aria-hidden="true" />
                          )}
                          {job.status === "open" ? t("job.close") : t("job.reopen")}
                        </Button>
                        <Button
                          variant={job.is_flagged ? "ghost" : "danger"}
                          size="sm"
                          loading={busyId === `${job.id}:flag`}
                          onClick={() => update(job.id, { is_flagged: !job.is_flagged }, "flag")}
                        >
                          {job.is_flagged ? (
                            <FlagOff className="size-4" aria-hidden="true" />
                          ) : (
                            <Flag className="size-4" aria-hidden="true" />
                          )}
                          {job.is_flagged ? t("job.unflag") : t("job.flag")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <RouteGuard roles={["admin"]}>
      <ModerationView />
    </RouteGuard>
  );
}
