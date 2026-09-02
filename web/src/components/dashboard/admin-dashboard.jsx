"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Flag,
  HardHat,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { PageHeader } from "@/components/layout/page-header";
import { VerificationQueue } from "@/components/dashboard/verification-queue";
import { Card, CardHeader, ErrorNote, Skeleton, StatTile } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatNumber } from "@/lib/format";

const STATUS_BAR = {
  applied: "bg-faint",
  shortlisted: "bg-brand",
  hired: "bg-ok",
  rejected: "bg-bad",
};

export function AdminDashboard() {
  const { t, locale } = useLocale();
  const { data, error, loading, reload } = useAsync(() => api.adminDashboard(), []);
  const [queueError, setQueueError] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-16" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
            <Skeleton key={key} className="h-[74px]" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) return <ErrorNote>{error}</ErrorNote>;

  const {
    stats,
    pending_workers: pending,
    recent_jobs: recentJobs,
    trade_breakdown: breakdown,
    applications_by_status: byStatus,
  } = data;

  const maxTrade = Math.max(1, ...breakdown.map((row) => Math.max(row.jobs, row.workers)));
  const totalApplications = Object.values(byStatus).reduce((sum, value) => sum + value, 0) || 1;

  async function decide(workerId, action) {
    setQueueError("");
    try {
      await api.setVerification(workerId, action);
      reload();
    } catch (err) {
      setQueueError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("admin.title")} subtitle={t("admin.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Users} label={t("admin.statUsers")} value={formatNumber(stats.users, locale)} />
        <StatTile icon={HardHat} label={t("admin.statWorkers")} value={formatNumber(stats.workers, locale)} />
        <StatTile icon={UserRound} label={t("admin.statContractors")} value={formatNumber(stats.contractors, locale)} />
        <StatTile icon={Briefcase} label={t("admin.statJobs")} value={formatNumber(stats.jobs, locale)} />
        <StatTile icon={CheckCircle2} label={t("admin.statOpenJobs")} value={formatNumber(stats.open_jobs, locale)} tone="ok" />
        <StatTile icon={ClipboardList} label={t("admin.statApplications")} value={formatNumber(stats.applications, locale)} />
        <StatTile icon={ShieldCheck} label={t("admin.statPending")} value={formatNumber(stats.pending_verifications, locale)} tone="gold" />
        <StatTile icon={Flag} label={t("admin.statFlagged")} value={formatNumber(stats.flagged_jobs, locale)} tone="bad" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Card className="overflow-hidden">
          <CardHeader
            title={t("admin.queue")}
            subtitle={t("admin.queueHint")}
            action={
              <Link href="/admin/verifications" className="text-sm font-semibold text-brand hover:underline">
                {t("common.viewAll")}
              </Link>
            }
          />
          {queueError ? (
            <div className="px-5 pt-4">
              <ErrorNote>{queueError}</ErrorNote>
            </div>
          ) : null}
          <VerificationQueue workers={pending.slice(0, 5)} onDecide={decide} />
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title={t("admin.applicationsByStatus")} />
            <div className="flex flex-col gap-3 p-5">
              {Object.entries(byStatus).map(([status, value]) => (
                <div key={status} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{t(`status.${status}`)}</span>
                    <span className="font-semibold text-ink">{formatNumber(value, locale)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR[status]}`}
                      style={{ width: `${Math.round((value / totalApplications) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title={t("admin.breakdown")} />
            <div className="flex flex-col gap-3 p-5">
              {breakdown.map((row) => (
                <div key={row.trade} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted">{locale === "ar" ? row.trade_ar : row.trade}</span>
                    <span className="text-xs font-semibold text-ink">
                      {row.jobs} {t("admin.statJobs")} · {row.workers} {t("admin.statWorkers")}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div
                      className="h-2 rounded-full bg-brand"
                      style={{ width: `${(row.jobs / maxTrade) * 50}%`, minWidth: row.jobs ? "4px" : 0 }}
                    />
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${(row.workers / maxTrade) * 50}%`, minWidth: row.workers ? "4px" : 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">{t("admin.recentJobs")}</h2>
          <Link href="/admin/jobs" className="text-sm font-semibold text-brand hover:underline">
            {t("admin.moderation")}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} showStatus showApplicants />
          ))}
        </div>
      </section>
    </div>
  );
}
