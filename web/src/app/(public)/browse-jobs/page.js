"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SearchX } from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Card, EmptyState, ErrorNote, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { publicApi } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

const EMPTY = { q: "", trade_id: "", city: "", job_type: "" };
const CITIES = ["Riyadh", "Jeddah", "Madinah", "Dammam"];
const JOB_TYPES = ["full_time", "contract", "daily", "project"];

function PublicJobsView() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    ...EMPTY,
    q: searchParams.get("q") || "",
    trade_id: searchParams.get("trade_id") || "",
  });

  // Landing-page search and trade tiles arrive as query params.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({
      ...prev,
      q: searchParams.get("q") || "",
      trade_id: searchParams.get("trade_id") || "",
    }));
  }, [searchParams]);

  const trades = useAsync(() => publicApi.trades(), []);
  const jobs = useAsync(
    () => publicApi.jobs(filters),
    [filters.q, filters.trade_id, filters.city, filters.job_type],
  );
  const list = jobs.data || [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{t("public.jobs.title")}</h1>
        <p className="mt-1 text-sm text-muted">
          {list.length} {t("common.results")} · {t("public.jobs.subtitle")}
        </p>
      </div>

      <JobFilters
        trades={trades.data || []}
        cities={CITIES}
        jobTypes={JOB_TYPES}
        value={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY)}
      />

      <ErrorNote>{jobs.error}</ErrorNote>

      {jobs.loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} className="h-52" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title={t("common.noResults")} body={t("common.noResultsBody")} />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((job) => (
            <JobCard key={job.id} job={job} href={`/browse-jobs/${job.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicJobsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-96" /></div>}>
      <PublicJobsView />
    </Suspense>
  );
}
