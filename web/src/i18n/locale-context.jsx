"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import ar from "./ar";
import en from "./en";

const DICTS = { en, ar };
const STORAGE_KEY = "zeo_locale";

const CITY_AR = {
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Madinah: "المدينة المنورة",
  Dammam: "الدمام",
};

const LocaleContext = createContext(null);

function lookup(dict, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), dict);
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    // Restore the stored locale after hydration; localStorage is not available on the server.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "ar" || stored === "en") setLocaleState(stored);
  }, []);

  // Persisting happens in setLocale, not here: an effect would overwrite the stored
  // value with the initial "en" before the restore above lands.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (path) => lookup(DICTS[locale], path) ?? lookup(DICTS.en, path) ?? path,
    [locale],
  );

  const tCity = useCallback(
    (city) => (locale === "ar" ? CITY_AR[city] || city : city),
    [locale],
  );

  const tTrade = useCallback(
    (trade) => (!trade ? "" : locale === "ar" ? trade.name_ar : trade.name_en),
    [locale],
  );

  const tCompany = useCallback(
    (company) => (!company ? "" : locale === "ar" ? company.name_ar : company.name_en),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      isRtl: locale === "ar",
      setLocale,
      toggleLocale: () => setLocale(locale === "en" ? "ar" : "en"),
      t,
      tCity,
      tTrade,
      tCompany,
    }),
    [locale, setLocale, t, tCity, tTrade, tCompany],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
