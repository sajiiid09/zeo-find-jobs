"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BrickWall,
  Briefcase,
  ClipboardCheck,
  Droplets,
  Flame,
  Hammer,
  HardHat,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { WorkerCard } from "@/components/workers/worker-card";
import { Button, Card, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { publicApi } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { formatNumber } from "@/lib/format";

const TRADE_ICONS = {
  electrician: Zap,
  plumber: Droplets,
  "steel-fixer": BrickWall,
  mason: BrickWall,
  carpenter: Hammer,
  welder: Flame,
  "heavy-equipment-operator": Truck,
  "site-supervisor": ClipboardCheck,
};

const HOW = [
  { key: "worker", icon: HardHat },
  { key: "contractor", icon: UserRound },
  { key: "admin", icon: ShieldCheck },
];

export default function LandingPage() {
  const { t, locale, tTrade } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const stats = useAsync(() => publicApi.stats(), []);
  const trades = useAsync(() => publicApi.trades(), []);
  const workers = useAsync(() => publicApi.workers({ limit: 6 }), []);
  const jobs = useAsync(() => publicApi.jobs({ limit: 6 }), []);


  function onSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/browse-jobs?q=${encodeURIComponent(trimmed)}` : "/browse-jobs");
  }

  const statTiles = stats.data
    ? [
        { key: "workers", value: stats.data.workers, icon: Users },
        { key: "verified", value: stats.data.verified_workers, icon: BadgeCheck },
        { key: "jobs", value: stats.data.open_jobs, icon: Briefcase },
        { key: "contractors", value: stats.data.contractors, icon: UserRound },
      ]
    : [];

  return (
    <>
      <section className="relative overflow-hidden bg-brand text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -end-32 size-[460px] rounded-full bg-gold/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {t("public.hero.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            {t("public.hero.subtitle")}
          </p>

          <form
            onSubmit={onSearch}
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              {t("public.hero.searchPlaceholder")}
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute inset-y-0 start-3 my-auto size-5 text-faint"
                aria-hidden="true"
              />
              <input
                id="hero-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("public.hero.searchPlaceholder")}
                className="h-12 w-full rounded-lg border-0 bg-transparent ps-11 pe-3 text-sm text-ink placeholder:text-faint focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg" className="sm:w-auto">
              {t("public.hero.searchCta")}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <span>{t("public.hero.popular")}:</span>
            {(trades.data || []).slice(0, 4).map((trade) => (
              <Link
                key={trade.id}
                href={`/browse-jobs?trade_id=${trade.id}`}
                className="rounded-full border border-white/25 px-3 py-1 text-xs font-medium transition-colors duration-200 hover:bg-white/15"
              >
                {tTrade(trade)}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/talent">
              <Button variant="gold" size="lg">
                <Users className="size-4" aria-hidden="true" />
                {t("public.hero.browseTalent")}
              </Button>
            </Link>
            <Link href="/browse-jobs">
              <Button
                size="lg"
                className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Briefcase className="size-4" aria-hidden="true" />
                {t("public.hero.browseJobs")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {stats.loading
            ? [0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-16" />)
            : statTiles.map(({ key, value, icon: Icon }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-ink">{formatNumber(value, locale)}</p>
                    <p className="truncate text-xs text-muted">{t(`public.stats.${key}`)}</p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">{t("public.trades.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("public.trades.subtitle")}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trades.loading
            ? [0, 1, 2, 3, 4, 5, 6, 7].map((key) => <Skeleton key={key} className="h-24" />)
            : (trades.data || []).map((trade) => {
                const Icon = TRADE_ICONS[trade.slug] || HardHat;
                return (
                <Link
                  key={trade.id}
                  href={`/browse-jobs?trade_id=${trade.id}`}
                  className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-brand/50"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-gold-soft text-gold-dark">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-ink group-hover:text-brand">
                    {tTrade(trade)}
                  </span>
                  <span className="text-xs text-muted">
                    {formatNumber(trade.open_jobs, locale)} {t("public.trades.openJobs")} ·{" "}
                    {formatNumber(trade.workers, locale)} {t("public.trades.workers")}
                  </span>
                </Link>
                );
              })}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {t("public.featuredWorkers.title")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("public.featuredWorkers.subtitle")}</p>
          </div>
          <Link
            href="/talent"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            {t("common.viewAll")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.loading
            ? [0, 1, 2, 3, 4, 5].map((key) => <Skeleton key={key} className="h-48" />)
            : (workers.data || []).map((worker) => (
                <WorkerCard key={worker.id} worker={worker} href={`/talent/${worker.id}`} />
              ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {t("public.featuredJobs.title")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("public.featuredJobs.subtitle")}</p>
          </div>
          <Link
            href="/browse-jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            {t("common.viewAll")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.loading
            ? [0, 1, 2, 3, 4, 5].map((key) => <Skeleton key={key} className="h-52" />)
            : (jobs.data || []).map((job) => (
                <JobCard key={job.id} job={job} href={`/browse-jobs/${job.id}`} />
              ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">{t("public.how.title")}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {HOW.map(({ key, icon: Icon }) => (
            <Card key={key} className="p-5">
              <span className="grid size-11 place-items-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink">
                {t(`public.how.${key}Title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {t(`public.how.${key}Body`)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 rounded-xl bg-brand px-6 py-10 text-white sm:px-10">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight">{t("public.cta.title")}</h2>
          <p className="max-w-xl text-sm text-white/75">{t("public.cta.body")}</p>
          <Link href="/login">
            <Button variant="gold" size="lg">
              {t("public.cta.button")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
