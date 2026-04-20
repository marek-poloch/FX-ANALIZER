"use client";

import Link from "next/link";
import { useT, type Lang } from "@/lib/i18n";

export function AppHeader() {
  const { t } = useT();

  const nav: Array<{ href: string; labelKey: Parameters<typeof t>[0] }> = [
    { href: "/", labelKey: "nav.overview" },
    { href: "/alerts", labelKey: "nav.alerts" },
    { href: "/macro", labelKey: "nav.macro" },
    { href: "/news", labelKey: "nav.news" },
    { href: "/liquidity", labelKey: "nav.liquidity" },
    { href: "/replay", labelKey: "nav.replay" },
    { href: "/settings", labelKey: "nav.settings" },
  ];

  return (
    <header className="border-b border-border bg-panel/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 h-14">
        <Link href="/" className="font-semibold tracking-tight">
          FX <span className="text-accent">{t("brand.name")}</span>
        </Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white">
              {t(n.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher />
          <span className="text-xs text-muted hidden md:inline">
            {t("header.disclaimer")}
          </span>
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  const { t } = useT();
  return (
    <footer className="max-w-7xl mx-auto px-4 py-8 text-xs text-muted">
      {t("footer.note")}
    </footer>
  );
}

function LanguageSwitcher() {
  const { lang, setLang, t } = useT();
  const options: Array<{ code: Lang; flag: string }> = [
    { code: "en", flag: "EN" },
    { code: "pl", flag: "PL" },
  ];
  return (
    <div
      className="flex items-center gap-1 text-xs"
      role="group"
      aria-label={t("lang.switcher.label")}
    >
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => setLang(o.code)}
          aria-pressed={lang === o.code}
          className={
            "px-2 py-1 rounded border transition " +
            (lang === o.code
              ? "bg-accent/20 border-accent text-accent"
              : "border-border text-muted hover:text-white")
          }
          title={t(o.code === "pl" ? "lang.pl" : "lang.en")}
        >
          {o.flag}
        </button>
      ))}
    </div>
  );
}
