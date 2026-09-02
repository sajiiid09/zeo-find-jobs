"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Banknote, CalendarClock, Mail, MapPin, Phone } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import { Avatar, Badge, Card, CardHeader, ErrorNote, Skeleton } from "@/components/ui";
import { VerificationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatDate, formatNumber } from "@/lib/format";

function WorkerDetail() {
  const { id } = useParams();
  const { t, locale, isRtl, tCity, tTrade } = useLocale();
  const { data: worker, error, loading } = useAsync(() => api.worker(id), [id]);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  if (loading) return <Skeleton className="h-96" />;
  if (error || !worker) return <ErrorNote>{error || t("errors.generic")}</ErrorNote>;

  const facts = [
    { icon: MapPin, label: t("job.city"), value: tCity(worker.city) },
    {
      icon: Banknote,
      label: t("worker.expected"),
      value: `${formatNumber(worker.expected_salary_sar, locale)} ${locale === "ar" ? "ر.س" : "SAR"}`,
    },
    {
      icon: CalendarClock,
      label: t("worker.availableFrom"),
      value: formatDate(worker.availability_date, locale),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/workers"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand"
      >
        <BackIcon className="size-4" aria-hidden="true" />
        {t("worker.title")}
      </Link>

      <PageHeader title={t("worker.profile")} subtitle={worker.headline} />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={worker.full_name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold text-ink">{worker.full_name}</h2>
                <p className="truncate text-sm text-muted">{tTrade(worker.trade)}</p>
              </div>
              <VerificationBadge status={worker.verification_status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge tone="brand">
                {worker.years_experience} {t("common.years")} {t("common.experience")}
              </Badge>
              <Badge tone="gold">{tTrade(worker.trade)}</Badge>
            </div>
          </Card>

          <Card>
            <CardHeader title={t("worker.about")} />
            <p className="p-5 text-sm leading-relaxed text-muted">{worker.bio}</p>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title={t("job.overview")} />
            <dl className="grid gap-4 p-5">
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
            <CardHeader title={t("worker.contact")} />
            <div className="flex flex-col gap-3 p-5 text-sm">
              <p className="flex items-center gap-2 text-muted">
                <Mail className="size-4 shrink-0 text-faint" aria-hidden="true" />
                <span className="truncate">{worker.email}</span>
              </p>
              <p className="flex items-center gap-2 text-muted" dir="ltr">
                <Phone className="size-4 shrink-0 text-faint" aria-hidden="true" />
                {worker.phone || "—"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function WorkerDetailPage() {
  return (
    <RouteGuard roles={["seller", "admin"]}>
      <WorkerDetail />
    </RouteGuard>
  );
}
