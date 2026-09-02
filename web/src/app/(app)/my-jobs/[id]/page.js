"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Star, Users, XCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorNote,
  Skeleton,
} from "@/components/ui";
import { ApplicationBadge, JobStatusBadge, VerificationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatNumber, formatSalary, relativeTime } from "@/lib/format";

const ACTIONS = [
  { status: "shortlisted", labelKey: "seller.shortlistAction", icon: Star, variant: "outline" },
  { status: "hired", labelKey: "seller.hireAction", icon: CheckCircle2, variant: "success" },
  { status: "rejected", labelKey: "seller.rejectAction", icon: XCircle, variant: "danger" },
  { status: "applied", labelKey: "seller.resetAction", icon: RotateCcw, variant: "ghost" },
];

function ApplicantsView() {
  const { id } = useParams();
  const { t, locale, isRtl, tCity, tTrade } = useLocale();
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const job = useAsync(() => api.job(id), [id]);
  const applications = useAsync(() => api.jobApplications(id), [id]);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  async function setStatus(applicationId, status) {
    setActionError("");
    setBusyId(`${applicationId}:${status}`);
    try {
      await api.updateApplication(applicationId, status);
      applications.reload();
      job.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleJobStatus() {
    setActionError("");
    setStatusBusy(true);
    try {
      await api.updateJob(id, { status: job.data.status === "open" ? "closed" : "open" });
      job.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setStatusBusy(false);
    }
  }

  if (job.loading) return <Skeleton className="h-96" />;
  if (job.error || !job.data) return <ErrorNote>{job.error || t("errors.generic")}</ErrorNote>;

  const list = applications.data || [];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/my-jobs"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand"
      >
        <BackIcon className="size-4" aria-hidden="true" />
        {t("nav.myJobs")}
      </Link>

      <PageHeader
        title={job.data.title}
        subtitle={`${tTrade(job.data.trade)} · ${tCity(job.data.city)} · ${formatSalary(
          job.data.salary_min,
          job.data.salary_max,
          job.data.job_type,
          locale,
        )}`}
        action={
          <div className="flex items-center gap-2">
            <JobStatusBadge status={job.data.status} flagged={job.data.is_flagged} />
            <Button variant="outline" size="sm" loading={statusBusy} onClick={toggleJobStatus}>
              {job.data.status === "open" ? t("job.close") : t("job.reopen")}
            </Button>
          </div>
        }
      />

      <ErrorNote>{actionError}</ErrorNote>

      <Card className="overflow-hidden">
        <CardHeader
          title={t("seller.applicants")}
          subtitle={`${list.length} ${t("common.applicants")}`}
        />
        {applications.loading ? (
          <div className="p-5">
            <Skeleton className="h-40" />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={Users} title={t("seller.noApplicants")} body={t("seller.noApplicantsBody")} />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((application) => {
              const worker = application.worker;
              return (
                <li key={application.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar name={worker?.full_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {worker ? (
                          <Link
                            href={`/workers/${worker.id}`}
                            className="truncate text-sm font-semibold text-ink hover:text-brand hover:underline"
                          >
                            {worker.full_name}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-ink">—</span>
                        )}
                        {worker ? <VerificationBadge status={worker.verification_status} /> : null}
                        <ApplicationBadge status={application.status} />
                      </div>
                      {worker ? (
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {tTrade(worker.trade)} · {tCity(worker.city)} · {worker.years_experience}{" "}
                          {t("common.years")} · {formatNumber(worker.expected_salary_sar, locale)}{" "}
                          {locale === "ar" ? "ر.س" : "SAR"}
                        </p>
                      ) : null}
                    </div>
                    <Badge>{relativeTime(application.created_at, locale)}</Badge>
                  </div>

                  {application.note ? (
                    <p className="rounded-lg bg-canvas px-3 py-2 text-sm leading-relaxed text-muted">
                      {application.note}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.filter((action) => action.status !== application.status).map(
                      ({ status, labelKey, icon: Icon, variant }) => (
                        <Button
                          key={status}
                          variant={variant}
                          size="sm"
                          loading={busyId === `${application.id}:${status}`}
                          onClick={() => setStatus(application.id, status)}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          {t(labelKey)}
                        </Button>
                      ),
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function JobApplicantsPage() {
  return (
    <RouteGuard roles={["seller", "admin"]}>
      <ApplicantsView />
    </RouteGuard>
  );
}
