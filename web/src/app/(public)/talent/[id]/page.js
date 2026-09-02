"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Banknote, CalendarClock, MapPin } from "lucide-react";

import { SignInGate } from "@/components/layout/sign-in-gate";
import { Avatar, Badge, Card, CardHeader, ErrorNote, Skeleton } from "@/components/ui";
import { VerificationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { publicApi } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatDate, formatNumber } from "@/lib/format";

export default function PublicWorkerPage() {
  const { id } = useParams();
  const { t, locale, isRtl, tCity, tTrade } = useLocale();
  const { data: worker, error, loading } = useAsync(() => publicApi.worker(id), [id]);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorNote>{error || t("errors.generic")}</ErrorNote>
      </div>
    );
  }

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
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/talent"
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand"
      >
        <BackIcon className="size-4" aria-hidden="true" />
        {t("public.talent.title")}
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={worker.full_name} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold text-ink">{worker.full_name}</h1>
                <p className="truncate text-sm text-muted">{tTrade(worker.trade)}</p>
              </div>
              <VerificationBadge status={worker.verification_status} />
            </div>
            <p className="mt-3 text-sm text-muted">{worker.headline}</p>
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

          <SignInGate
            title={t("public.gate.contactTitle")}
            body={t("public.gate.contactBody")}
            button={t("public.gate.contactButton")}
            next={`/workers/${worker.id}`}
          />
        </div>
      </div>
    </div>
  );
}
