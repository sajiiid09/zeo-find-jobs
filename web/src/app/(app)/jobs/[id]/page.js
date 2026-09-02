"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorNote,
  Field,
  Skeleton,
  SuccessNote,
  Textarea,
} from "@/components/ui";
import { JobStatusBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAsync } from "@/lib/use-async";
import { formatDate, formatSalary } from "@/lib/format";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;
  const { t, locale, isRtl, tCity, tTrade, tCompany } = useLocale();
  const { user } = useAuth();

  const { data: job, error, loading, reload } = useAsync(() => api.job(jobId), [jobId]);

  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  async function onApply(event) {
    event.preventDefault();
    setApplyError("");
    setSubmitting(true);
    try {
      await api.apply(Number(jobId), note);
      setApplied(true);
      reload();
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus() {
    setBusy(true);
    try {
      await api.updateJob(jobId, { status: job.status === "open" ? "closed" : "open" });
      reload();
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !job) return <ErrorNote>{error || t("errors.generic")}</ErrorNote>;

  const isOwner = user?.role === "seller" && user?.id === job.seller_id;
  const canApply = user?.role === "buyer" && job.status === "open" && !job.has_applied && !applied;

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
    <div className="flex flex-col gap-5">
      <Link
        href="/jobs"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand"
      >
        <BackIcon className="size-4" aria-hidden="true" />
        {t("nav.jobs")}
      </Link>

      <PageHeader
        title={job.title}
        subtitle={`${tCompany(job.company)} · ${tCity(job.city)}`}
        action={<JobStatusBadge status={job.status} flagged={job.is_flagged} />}
      />

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

          {user?.role === "buyer" ? (
            <Card>
              <CardHeader title={t("job.apply")} />
              <div className="p-5">
                {job.has_applied || applied ? (
                  <SuccessNote>
                    {applied ? t("job.applySuccess") : t("job.alreadyApplied")}
                  </SuccessNote>
                ) : job.status !== "open" ? (
                  <Badge tone="neutral">{t("job.closed")}</Badge>
                ) : (
                  <form onSubmit={onApply} className="flex flex-col gap-3">
                    <Field label={t("job.applyNote")} htmlFor="apply-note">
                      <Textarea
                        id="apply-note"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder={t("job.applyNotePlaceholder")}
                      />
                    </Field>
                    <ErrorNote>{applyError}</ErrorNote>
                    <Button type="submit" size="lg" loading={submitting} disabled={!canApply}>
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      {submitting ? t("job.applying") : t("job.apply")}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          ) : null}

          {user?.role === "seller" || user?.role === "admin" ? (
            <Card>
              <CardHeader title={t("seller.applicants")} />
              <div className="flex flex-col gap-3 p-5">
                <p className="text-sm text-muted">
                  {job.applicant_count} {t("common.applicants")}
                </p>
                <ErrorNote>{applyError}</ErrorNote>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/my-jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Users className="size-4" aria-hidden="true" />
                      {t("job.viewApplicants")}
                    </Button>
                  </Link>
                  {isOwner || user?.role === "admin" ? (
                    <Button variant="outline" size="sm" loading={busy} onClick={toggleStatus}>
                      {job.status === "open" ? t("job.close") : t("job.reopen")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
