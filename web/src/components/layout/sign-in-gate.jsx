"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button, Card, CardHeader } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";

/** Card standing in for an action that needs an account. `next` returns the visitor here after login. */
export function SignInGate({ title, body, button, next }) {
  const { t } = useLocale();
  const href = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <Card>
      <CardHeader title={title} />
      <div className="flex flex-col items-start gap-3 p-5">
        <span className="grid size-11 place-items-center rounded-lg bg-canvas text-faint">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-muted">{body}</p>
        <Link href={href}>
          <Button size="md">{button}</Button>
        </Link>
        <p className="text-xs text-faint">{t("public.gate.maskedNote")}</p>
      </div>
    </Card>
  );
}
