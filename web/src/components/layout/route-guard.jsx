"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/i18n/locale-context";

export function FullPageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="size-7 animate-spin text-brand" aria-label="Loading" />
    </div>
  );
}

export function RouteGuard({ roles, children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return <FullPageLoader />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-6 text-center">
        <p className="text-sm font-semibold text-bad">{t("errors.forbidden")}</p>
      </div>
    );
  }

  return children;
}
