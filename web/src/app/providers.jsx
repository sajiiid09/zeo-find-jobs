"use client";

import { LocaleProvider } from "@/i18n/locale-context";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }) {
  return (
    <LocaleProvider>
      <AuthProvider>{children}</AuthProvider>
    </LocaleProvider>
  );
}
