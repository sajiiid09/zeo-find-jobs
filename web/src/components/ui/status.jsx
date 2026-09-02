"use client";

import { BadgeCheck, Clock, Flag, ShieldX } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { Badge } from "./index";

const VERIFICATION_TONE = { verified: "ok", pending: "gold", rejected: "bad" };
const VERIFICATION_ICON = { verified: BadgeCheck, pending: Clock, rejected: ShieldX };
const APPLICATION_TONE = {
  applied: "neutral",
  shortlisted: "brand",
  hired: "ok",
  rejected: "bad",
};

export function VerificationBadge({ status }) {
  const { t } = useLocale();
  const Icon = VERIFICATION_ICON[status];
  return (
    <Badge tone={VERIFICATION_TONE[status]}>
      <Icon className="size-3.5" aria-hidden="true" />
      {t(`status.${status}`)}
    </Badge>
  );
}

export function ApplicationBadge({ status }) {
  const { t } = useLocale();
  return <Badge tone={APPLICATION_TONE[status]}>{t(`status.${status}`)}</Badge>;
}

export function JobStatusBadge({ status, flagged }) {
  const { t } = useLocale();
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge tone={status === "open" ? "ok" : "neutral"}>{t(`status.${status}`)}</Badge>
      {flagged ? (
        <Badge tone="bad">
          <Flag className="size-3.5" aria-hidden="true" />
          {t("job.flagged")}
        </Badge>
      ) : null}
    </span>
  );
}
