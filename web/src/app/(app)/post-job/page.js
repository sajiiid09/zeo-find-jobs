"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import {
  Button,
  Card,
  ErrorNote,
  Field,
  Input,
  Select,
  SuccessNote,
  Textarea,
} from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

const INITIAL = {
  title: "",
  description: "",
  requirements: "",
  trade_id: "",
  city: "",
  job_type: "full_time",
  salary_min: "",
  salary_max: "",
};

function PostJobForm() {
  const { t, tCity, tTrade } = useLocale();
  const router = useRouter();
  const meta = useAsync(() => Promise.all([api.trades(), api.meta()]), []);
  const [trades, metaData] = meta.data || [[], null];

  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const job = await api.createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim(),
        trade_id: Number(form.trade_id),
        city: form.city,
        job_type: form.job_type,
        salary_min: Number(form.salary_min || 0),
        salary_max: Number(form.salary_max || 0),
      });
      setSuccess(t("seller.published"));
      setForm(INITIAL);
      router.push(`/my-jobs/${job.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("seller.postJob")} subtitle={t("seller.postJobSubtitle")} />

      <Card className="p-5">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label={t("seller.jobTitle")} htmlFor="title">
            <Input
              id="title"
              required
              minLength={3}
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="Site Electrician - Residential Towers"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("job.trade")} htmlFor="trade">
              <Select id="trade" required value={form.trade_id} onChange={(e) => set("trade_id", e.target.value)}>
                <option value="" disabled>
                  {t("common.selectTrade")}
                </option>
                {trades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {tTrade(trade)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t("job.city")} htmlFor="city">
              <Select id="city" required value={form.city} onChange={(e) => set("city", e.target.value)}>
                <option value="" disabled>
                  {t("common.selectCity")}
                </option>
                {(metaData?.cities || []).map((city) => (
                  <option key={city} value={city}>
                    {tCity(city)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t("job.type")} htmlFor="type">
              <Select id="type" value={form.job_type} onChange={(e) => set("job_type", e.target.value)}>
                {(metaData?.job_types || []).map((type) => (
                  <option key={type} value={type}>
                    {t(`jobType.${type}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("seller.salaryMin")} htmlFor="salary-min">
              <Input
                id="salary-min"
                type="number"
                min="0"
                required
                value={form.salary_min}
                onChange={(event) => set("salary_min", event.target.value)}
                placeholder="5000"
              />
            </Field>
            <Field label={t("seller.salaryMax")} htmlFor="salary-max">
              <Input
                id="salary-max"
                type="number"
                min="0"
                required
                value={form.salary_max}
                onChange={(event) => set("salary_max", event.target.value)}
                placeholder="7500"
              />
            </Field>
          </div>

          <Field label={t("seller.jobDescription")} htmlFor="description">
            <Textarea
              id="description"
              required
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </Field>

          <Field label={t("seller.jobRequirements")} htmlFor="requirements">
            <Textarea
              id="requirements"
              rows={3}
              value={form.requirements}
              onChange={(event) => set("requirements", event.target.value)}
            />
          </Field>

          <ErrorNote>{error}</ErrorNote>
          <SuccessNote>{success}</SuccessNote>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="lg" loading={submitting}>
              <PlusCircle className="size-4" aria-hidden="true" />
              {submitting ? t("seller.publishing") : t("seller.publish")}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => setForm(INITIAL)}>
              {t("common.reset")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <RouteGuard roles={["seller"]}>
      <PostJobForm />
    </RouteGuard>
  );
}
