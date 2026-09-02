"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button, Card, Field, Input, Select } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";

export function JobFilters({ trades, cities, jobTypes, value, onChange, onClear }) {
  const { t, tCity, tTrade } = useLocale();

  function set(key, next) {
    onChange({ ...value, [key]: next });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2 pb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="size-4 text-brand" aria-hidden="true" />
          {t("common.filters")}
        </p>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="size-3.5" aria-hidden="true" />
          {t("common.clear")}
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <Field label={t("common.search")} htmlFor="job-search">
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-faint"
              aria-hidden="true"
            />
            <Input
              id="job-search"
              value={value.q}
              onChange={(event) => set("q", event.target.value)}
              placeholder={t("common.searchJobs")}
              className="ps-9"
            />
          </div>
        </Field>

        <Field label={t("job.trade")} htmlFor="job-trade">
          <Select id="job-trade" value={value.trade_id} onChange={(event) => set("trade_id", event.target.value)}>
            <option value="">{t("common.allTrades")}</option>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {tTrade(trade)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("job.city")} htmlFor="job-city">
          <Select id="job-city" value={value.city} onChange={(event) => set("city", event.target.value)}>
            <option value="">{t("common.allCities")}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {tCity(city)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("job.type")} htmlFor="job-type">
          <Select id="job-type" value={value.job_type} onChange={(event) => set("job_type", event.target.value)}>
            <option value="">{t("common.allTypes")}</option>
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {t(`jobType.${type}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Card>
  );
}
