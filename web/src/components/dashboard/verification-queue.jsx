"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

import { Avatar, Badge, Button, EmptyState } from "@/components/ui";
import { VerificationBadge } from "@/components/ui/status";
import { useLocale } from "@/i18n/locale-context";
import { formatNumber } from "@/lib/format";

export function VerificationQueue({ workers, onDecide, showStatus = false }) {
  const { t, locale, tCity, tTrade } = useLocale();
  const [busyId, setBusyId] = useState(null);

  async function decide(workerId, action) {
    setBusyId(`${workerId}:${action}`);
    try {
      await onDecide(workerId, action);
    } finally {
      setBusyId(null);
    }
  }

  if (!workers.length) {
    return (
      <EmptyState icon={ShieldCheck} title={t("admin.queueEmpty")} body={t("admin.queueEmptyBody")} />
    );
  }

  return (
    <ul className="divide-y divide-line">
      {workers.map((worker) => (
        <li key={worker.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
          <Avatar name={worker.full_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{worker.full_name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">
              {tTrade(worker.trade)} · {tCity(worker.city)} · {worker.years_experience}{" "}
              {t("common.years")} · {formatNumber(worker.expected_salary_sar, locale)}{" "}
              {locale === "ar" ? "ر.س" : "SAR"}
            </p>
          </div>
          {showStatus ? <VerificationBadge status={worker.verification_status} /> : null}
          <div className="flex items-center gap-2">
            {worker.verification_status !== "verified" ? (
              <Button
                variant="success"
                size="sm"
                loading={busyId === `${worker.id}:approve`}
                onClick={() => decide(worker.id, "approve")}
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {t("admin.approve")}
              </Button>
            ) : null}
            {worker.verification_status !== "rejected" ? (
              <Button
                variant="danger"
                size="sm"
                loading={busyId === `${worker.id}:reject`}
                onClick={() => decide(worker.id, "reject")}
              >
                <XCircle className="size-4" aria-hidden="true" />
                {t("admin.reject")}
              </Button>
            ) : null}
            {showStatus && worker.verification_status !== "pending" ? (
              <Button
                variant="ghost"
                size="sm"
                loading={busyId === `${worker.id}:reset`}
                onClick={() => decide(worker.id, "reset")}
              >
                {t("admin.reset")}
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
