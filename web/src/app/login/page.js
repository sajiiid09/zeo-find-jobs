"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HardHat, ShieldCheck, UserRound } from "lucide-react";

import { LangToggle } from "@/components/layout/lang-toggle";
import { Button, ErrorNote, Field, Input } from "@/components/ui";
import { useLocale } from "@/i18n/locale-context";
import { useAuth } from "@/lib/auth-context";

const DEMO_ACCOUNTS = [
  { role: "buyer", email: "worker@zeo.sa", icon: HardHat },
  { role: "seller", email: "contractor@zeo.sa", icon: UserRound },
  { role: "admin", email: "admin@zeo.sa", icon: ShieldCheck },
];

const PANEL_STATS = [
  { key: "statWorkers", value: "22" },
  { key: "statJobs", value: "17" },
  { key: "statCities", value: "4" },
];

export default function LoginPage() {
  const { t } = useLocale();
  const { user, ready, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword("zeo1234");
    setError("");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-brand px-10 py-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -end-24 size-[420px] rounded-full bg-gold/25 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid size-14 place-items-center overflow-hidden rounded-xl bg-white">
            <Image src="/logo.jpeg" alt="ZEO Find Work" width={56} height={56} className="size-14 object-cover" />
          </span>
          <span>
            <span className="block text-lg font-bold">{t("brand")}</span>
            <span className="block text-sm text-white/65">{t("tagline")}</span>
          </span>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            {t("login.panelTitle")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t("login.panelBody")}</p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            {PANEL_STATS.map((stat) => (
              <div key={stat.key} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                <p className="text-2xl font-bold text-gold">{stat.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{t(`login.${stat.key}`)}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/45">Riyadh · Jeddah · Madinah · Dammam</p>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="flex items-center gap-2 lg:hidden">
            <Image src="/logo.jpeg" alt="ZEO Find Work" width={40} height={40} className="size-10 rounded-lg object-cover" />
            <span className="text-sm font-bold text-ink">{t("brand")}</span>
          </span>
          <LangToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h2 className="text-2xl font-bold tracking-tight text-ink">{t("login.heading")}</h2>
          <p className="mt-1 text-sm text-muted">{t("login.subheading")}</p>

          <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
            <Field label={t("login.email")} htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="worker@zeo.sa"
              />
            </Field>
            <Field label={t("login.password")} htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="zeo1234"
              />
            </Field>
            <ErrorNote>{error}</ErrorNote>
            <Button type="submit" size="lg" loading={submitting}>
              {submitting ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>

          <div className="mt-9 rounded-xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold text-ink">{t("login.demoTitle")}</p>
            <p className="mt-0.5 text-xs text-muted">{t("login.demoHint")}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map(({ role, email: demoEmail, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(demoEmail)}
                  className="flex min-h-11 cursor-pointer flex-col items-start gap-0.5 rounded-lg border border-line-strong px-3 py-2 text-start transition-colors duration-200 hover:border-brand hover:bg-brand-soft"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Icon className="size-4 text-brand" aria-hidden="true" />
                    {t(`roles.${role}`)}
                  </span>
                  <span className="truncate text-[11px] text-faint">{demoEmail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
