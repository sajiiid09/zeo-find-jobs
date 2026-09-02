"use client";

import { ClipboardList } from "lucide-react";

import { ApplicationRow } from "@/components/dashboard/application-row";
import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/layout/route-guard";
import { Card, EmptyState, ErrorNote, Skeleton } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

function ApplicationsView() {
  const { t } = useLocale();
  const { data, error, loading } = useAsync(() => api.myApplications(), []);
  const list = data || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("nav.applications")} subtitle={`${list.length} ${t("common.results")}`} />
      <ErrorNote>{error}</ErrorNote>
      {loading ? (
        <Skeleton className="h-72" />
      ) : (
        <Card className="overflow-hidden">
          {list.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t("buyer.noApplications")}
              body={t("buyer.noApplicationsBody")}
            />
          ) : (
            <ul className="divide-y divide-line">
              {list.map((application) => (
                <li key={application.id}>
                  <ApplicationRow application={application} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <RouteGuard roles={["buyer"]}>
      <ApplicationsView />
    </RouteGuard>
  );
}
