"use client";

import { useState } from "react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";

import { WorkerCard } from "@/components/workers/worker-card";
import { Button, Card, EmptyState, ErrorNote, Field, Select, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { publicApi } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

const EMPTY = { trade_id: "", city: "", min_experience: "" };
const CITIES = ["Riyadh", "Jeddah", "Madinah", "Dammam"];
const EXPERIENCE_STEPS = [2, 5, 10, 15];

export default function PublicTalentPage() {
  const { t, tCity, tTrade } = useLocale();
  const [filters, setFilters] = useState(EMPTY);

  const trades = useAsync(() => publicApi.trades(), []);
  const workers = useAsync(
    () => publicApi.workers(filters),
    [filters.trade_id, filters.city, filters.min_experience],
  );
  const list = workers.data || [];

  function set(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{t("public.talent.title")}</h1>
        <p className="mt-1 text-sm text-muted">
          {list.length} {t("common.results")} · {t("public.talent.subtitle")}
        </p>
      </div>

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

        <div className="grid gap-3 lg:grid-cols-3">
          <Field label={t("worker.trade")} htmlFor="talent-trade">
            <Select id="talent-trade" value={filters.trade_id} onChange={(e) => set("trade_id", e.target.value)}>
              <option value="">{t("common.allTrades")}</option>
              {(trades.data || []).map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {tTrade(trade)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("job.city")} htmlFor="talent-city">
            <Select id="talent-city" value={filters.city} onChange={(e) => set("city", e.target.value)}>
              <option value="">{t("common.allCities")}</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {tCity(city)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("worker.minExperience")} htmlFor="talent-experience">
            <Select
              id="talent-experience"
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
            <WorkerCard key={worker.id} worker={worker} href={`/talent/${worker.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
