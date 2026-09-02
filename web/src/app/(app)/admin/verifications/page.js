"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import { VerificationQueue } from "@/components/dashboard/verification-queue";
import { Button, Card, ErrorNote, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

const TABS = ["pending", "verified", "rejected", "all"];

function VerificationsView() {
  const { t } = useLocale();
  const [tab, setTab] = useState("pending");
  const [error, setError] = useState("");
  const { data, loading, error: loadError, reload } = useAsync(() => api.verifications(tab), [tab]);
  const workers = data || [];

  async function decide(workerId, action) {
    setError("");
    try {
      await api.setVerification(workerId, action);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("admin.queue")}
        subtitle={`${workers.length} ${t("common.results")} · ${t("admin.queueHint")}`}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "primary" : "outline"}
            onClick={() => setTab(key)}
          >
            {key === "all" ? t("common.all") : t(`status.${key}`)}
          </Button>
        ))}
      </div>

      <ErrorNote>{error || loadError}</ErrorNote>

      {loading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card className="overflow-hidden">
          <VerificationQueue workers={workers} onDecide={decide} showStatus />
        </Card>
      )}
    </div>
  );
}

export default function VerificationsPage() {
  return (
    <RouteGuard roles={["admin"]}>
      <VerificationsView />
    </RouteGuard>
  );
}
