"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, ClipboardList, Star, UserRound } from "lucide-react";

import { ApplicationRow } from "@/components/dashboard/application-row";
import { JobCard } from "@/components/jobs/job-card";
import { PageHeader } from "@/components/layout/page-header";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorNote,
  Skeleton,
  StatTile,
} from "@/components/ui";
import { VerificationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAsync } from "@/lib/use-async";
import { formatDate, formatNumber } from "@/lib/format";

const VERIFICATION_NOTE = {
  pending: { key: "buyer.verificationPending", tone: "border-gold/30 bg-gold-soft text-gold-dark" },
  verified: { key: "buyer.verificationVerified", tone: "border-ok/20 bg-ok-soft text-ok" },
  rejected: { key: "buyer.verificationRejected", tone: "border-bad/20 bg-bad-soft text-bad" },
};

export function BuyerDashboard() {
  const { t, locale, tCity, tTrade } = useLocale();
  const { user } = useAuth();
  const { data, error, loading } = useAsync(() => api.buyerDashboard(), []);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-16" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-[74px]" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) return <ErrorNote>{error}</ErrorNote>;

  const { profile, stats, applications, recommended_jobs: recommended } = data;
  const note = profile ? VERIFICATION_NOTE[profile.verification_status] : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`${t("buyer.title")}, ${user?.full_name?.split(" ")[0] || ""}`}
        subtitle={t("buyer.subtitle")}
        action={
          <Link href="/jobs">
            <Button size="sm">
              <Briefcase className="size-4" aria-hidden="true" />
              {t("nav.jobs")}
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={ClipboardList} label={t("buyer.statApplications")} value={formatNumber(stats.applications, locale)} />
        <StatTile icon={Star} label={t("buyer.statShortlisted")} value={formatNumber(stats.shortlisted, locale)} tone="gold" />
        <StatTile icon={CheckCircle2} label={t("buyer.statHired")} value={formatNumber(stats.hired, locale)} tone="ok" />
        <StatTile icon={Briefcase} label={t("buyer.statOpenJobs")} value={formatNumber(stats.open_jobs, locale)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr] lg:items-start">
        <Card>
          <CardHeader title={t("buyer.profileCard")} />
          {profile ? (
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <Avatar name={profile.full_name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">{profile.full_name}</p>
                  <p className="truncate text-sm text-muted">{tTrade(profile.trade)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <VerificationBadge status={profile.verification_status} />
                <Badge tone="brand">
                  {profile.years_experience} {t("common.years")} {t("common.experience")}
                </Badge>
                <Badge>{tCity(profile.city)}</Badge>
              </div>

              <dl className="grid gap-2 border-t border-line pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">{t("worker.expected")}</dt>
                  <dd className="font-semibold text-ink">
                    {formatNumber(profile.expected_salary_sar, locale)} {locale === "ar" ? "ر.س" : "SAR"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">{t("worker.availableFrom")}</dt>
                  <dd className="font-semibold text-ink">{formatDate(profile.availability_date, locale)}</dd>
                </div>
              </dl>

              {note ? (
                <p className={`rounded-lg border px-3 py-2 text-xs font-medium ${note.tone}`}>
                  {t(note.key)}
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyState icon={UserRound} title={t("errors.generic")} />
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title={t("buyer.myApplications")}
            action={
              <Link href="/applications" className="text-sm font-semibold text-brand hover:underline">
                {t("common.viewAll")}
              </Link>
            }
          />
          {applications.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t("buyer.noApplications")}
              body={t("buyer.noApplicationsBody")}
            />
          ) : (
            <ul className="divide-y divide-line">
              {applications.slice(0, 6).map((application) => (
                <li key={application.id}>
                  <ApplicationRow application={application} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t("buyer.recommended")}</h2>
          <p className="text-sm text-muted">{t("buyer.recommendedHint")}</p>
        </div>
        {recommended.length === 0 ? (
          <Card>
            <EmptyState icon={Briefcase} title={t("common.noResults")} />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
