"use client";

import { useState } from "react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import { WorkerCard } from "@/components/workers/worker-card";
import { Button, Card, EmptyState, ErrorNote, Field, Select, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

const EMPTY = { trade_id: "", city: "", verification: "", min_experience: "" };
const EXPERIENCE_STEPS = [2, 5, 10, 15];

function WorkersView() {
  const { t, tCity, tTrade } = useLocale();
  const [filters, setFilters] = useState(EMPTY);

  const meta = useAsync(() => Promise.all([api.trades(), api.meta()]), []);
  const workers = useAsync(
    () => api.workers(filters),
    [filters.trade_id, filters.city, filters.verification, filters.min_experience],
  );

  const [trades, metaData] = meta.data || [[], null];
  const list = workers.data || [];

  function set(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("worker.title")}
        subtitle={`${list.length} ${t("common.results")} · ${t("worker.subtitle")}`}
      />

      <Card className="p-4">
        <div className="flex items-center justify-between gap-2 pb-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <SlidersHorizontal className="size-4 text-brand" aria-hidden="true" />
            {t("common.filters")}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)}>
            <X className="size-3.5" aria-hidden="true" />
            {t("common.clear")}
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <Field label={t("worker.trade")} htmlFor="worker-trade">
            <Select id="worker-trade" value={filters.trade_id} onChange={(e) => set("trade_id", e.target.value)}>
              <option value="">{t("common.allTrades")}</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {tTrade(trade)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("job.city")} htmlFor="worker-city">
            <Select id="worker-city" value={filters.city} onChange={(e) => set("city", e.target.value)}>
              <option value="">{t("common.allCities")}</option>
              {(metaData?.cities || []).map((city) => (
                <option key={city} value={city}>
                  {tCity(city)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("worker.verification")} htmlFor="worker-verification">
            <Select
              id="worker-verification"
              value={filters.verification}
              onChange={(e) => set("verification", e.target.value)}
            >
              <option value="">{t("common.allStatuses")}</option>
              {(metaData?.verification_statuses || []).map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("worker.minExperience")} htmlFor="worker-experience">
            <Select
              id="worker-experience"
              value={filters.min_experience}
              onChange={(e) => set("min_experience", e.target.value)}
            >
              <option value="">{t("worker.anyExperience")}</option>
              {EXPERIENCE_STEPS.map((years) => (
                <option key={years} value={years}>
                  {years}+ {t("common.years")}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <ErrorNote>{workers.error}</ErrorNote>

      {workers.loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} className="h-48" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title={t("common.noResults")} body={t("common.noResultsBody")} />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkersPage() {
  return (
    <RouteGuard roles={["seller", "admin"]}>
      <WorkersView />
    </RouteGuard>
  );
}
