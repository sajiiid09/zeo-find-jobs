"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { PageHeader } from "@/components/layout/page-header";
import { Card, EmptyState, ErrorNote, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAsync } from "@/lib/use-async";

const EMPTY = { q: "", trade_id: "", city: "", job_type: "" };

export default function JobsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [filters, setFilters] = useState(EMPTY);

  const meta = useAsync(() => Promise.all([api.trades(), api.meta()]), []);
  const jobs = useAsync(
    () => api.jobs({ ...filters, status: user?.role === "buyer" ? "open" : "all" }),
    [filters.q, filters.trade_id, filters.city, filters.job_type, user?.role],
  );

  const [trades, metaData] = meta.data || [[], null];
  const list = jobs.data || [];

  const subtitle = useMemo(
    () => `${list.length} ${t("common.results")}`,
    [list.length, t],
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("nav.jobs")} subtitle={subtitle} />

      <JobFilters
        trades={trades}
        cities={metaData?.cities || []}
        jobTypes={metaData?.job_types || []}
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
            <JobCard
              key={job.id}
              job={job}
              showStatus={user?.role !== "buyer"}
              showApplicants={user?.role !== "buyer"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
