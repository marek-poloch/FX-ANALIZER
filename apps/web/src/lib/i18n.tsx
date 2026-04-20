"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "pl";

const STORAGE_KEY = "fxradar.lang";

/**
 * Flat-key dictionary. Keep parallel structure between `en` and `pl`; the
 * `TranslationKey` type is derived from `en` so the TypeScript compiler
 * flags any missing Polish entry at the call site.
 */
const dict = {
  en: {
    "brand.name": "Whale Radar",
    "brand.full": "FX Whale Radar",
    "nav.overview": "Overview",
    "nav.alerts": "Live Radar",
    "nav.macro": "Macro",
    "nav.news": "News",
    "nav.liquidity": "Liquidity",
    "nav.replay": "Replay",
    "nav.settings": "Settings",
    "header.disclaimer": "Not investment advice · data: demo",
    "footer.note":
      "FX Whale Radar · analytical / monitoring tool only · no trade execution",
    "lang.switcher.label": "Language",
    "lang.en": "English",
    "lang.pl": "Polski",

    "common.loading": "Loading…",
    "common.save": "Save",
    "common.saving": "Saving…",
    "common.saved": "Saved ✓",
    "common.error": "Error",
    "common.hide": "Hide",
    "common.explain": "Explain",
    "common.stop": "stop",
    "common.all": "ALL",

    "overview.title": "Market Overview",
    "overview.subtitle":
      "CME FX futures proxies · demo mode · not investment advice",
    "overview.col.symbol": "Symbol",
    "overview.col.description": "Description",
    "overview.col.proxy": "Proxy",
    "overview.col.price": "Price",
    "overview.col.score": "Flow Score",
    "overview.col.category": "Category",
    "overview.col.source": "Source",

    "alerts.title": "Live Flow Radar",
    "alerts.subtitle":
      'Ranked anomalies with composite flow score ≥ 31. Click "Explain" for detail.',
    "alerts.empty": "No alerts yet — waiting for flow anomalies…",
    "alerts.primaryReason": "Primary reason:",
    "alerts.contributing": "Contributing:",
    "alerts.dataUsed": "Data used:",
    "alerts.delayedSources": "Delayed sources:",
    "alerts.unknowns": "Unknowns:",
    "alerts.mode": "Mode:",
    "alerts.notAdvice": "not investment advice",

    "macro.title": "Macro Calendar",
    "macro.subtitle": "Upcoming high-impact events that alter flow bias.",
    "macro.forecast": "Forecast",
    "macro.previous": "Previous",
    "macro.actual": "Actual",
    "macro.noEvents": "No events.",

    "news.title": "News Feed",
    "news.subtitle": "Headlines tagged by affected currency.",
    "news.empty": "No news yet.",
    "news.tags": "tags:",

    "liquidity.title": "Liquidity / Levels",
    "liquidity.subtitle":
      "Session ranges, VWAP, and liquidity sweep candidates. Demo mode shows the last ~500 ticks.",
    "liquidity.last": "Last",
    "liquidity.sessionHigh": "Session High",
    "liquidity.sessionLow": "Session Low",
    "liquidity.vwap": "VWAP",
    "liquidity.noData": "no data",
    "liquidity.ticks": "ticks",

    "replay.title": "Backtesting / Replay",
    "replay.subtitle":
      "Replay historical sessions and re-run the alert engine against them.",
    "replay.label": "Label",
    "replay.speed": "Speed",
    "replay.start": "Start replay",
    "replay.empty": "No replay sessions yet.",

    "settings.title": "Alert Configuration",
    "settings.subtitle":
      "Configure alert thresholds and notification channels. Demo mode keeps config in memory.",
    "settings.minScore": "Minimum score (0–100)",
    "settings.minSeverity": "Minimum severity",
    "settings.channels": "Notification channels",

    "instrument.price": "Price",
    "instrument.sentiment": "Retail sentiment",
    "instrument.noSentiment": "No sentiment data.",
    "instrument.cot": "CFTC COT (latest)",
    "instrument.noCot": "No COT data.",
    "instrument.reportDate": "Report date",
    "instrument.commercialsNet": "Commercials net",
    "instrument.nonCommercialsNet": "Non-commercials net",
    "instrument.weeklyChange": "Weekly change",
    "instrument.percentile3y": "3Y percentile",
    "instrument.long": "long",
    "instrument.short": "short",
    "instrument.delay": "delay",

    "timeframe.label": "Timeframe",
    "timeframe.instant": "instant",
    "timeframe.1s": "1s",
    "timeframe.5s": "5s",
    "timeframe.10s": "10s",
    "timeframe.15s": "15s",
    "timeframe.30s": "30s",
    "timeframe.1m": "1 min",
    "timeframe.5m": "5 min",
    "timeframe.15m": "15 min",
    "timeframe.30m": "30 min",
    "timeframe.1h": "1h",
    "timeframe.3h": "3h",
    "timeframe.5h": "5h",
    "timeframe.1d": "1d",
    "timeframe.3d": "3d",
    "timeframe.5d": "5d",
    "timeframe.1w": "1w",
    "timeframe.1mo": "1 mo",

    "liquidity.state.elevated": "Elevated liquidity",
    "liquidity.state.depressed": "Depressed liquidity",
    "liquidity.state.normal": "Normal liquidity",
    "liquidity.priceChange": "Price change",
    "liquidity.vsBaseline": "vs baseline",
  },
  pl: {
    "brand.name": "Whale Radar",
    "brand.full": "FX Whale Radar",
    "nav.overview": "Przegląd",
    "nav.alerts": "Radar na żywo",
    "nav.macro": "Makro",
    "nav.news": "Wiadomości",
    "nav.liquidity": "Płynność",
    "nav.replay": "Powtórka",
    "nav.settings": "Ustawienia",
    "header.disclaimer": "Nie stanowi porady inwestycyjnej · dane: demo",
    "footer.note":
      "FX Whale Radar · narzędzie wyłącznie analityczne / monitorujące · bez egzekucji zleceń",
    "lang.switcher.label": "Język",
    "lang.en": "English",
    "lang.pl": "Polski",

    "common.loading": "Ładowanie…",
    "common.save": "Zapisz",
    "common.saving": "Zapisywanie…",
    "common.saved": "Zapisano ✓",
    "common.error": "Błąd",
    "common.hide": "Ukryj",
    "common.explain": "Wyjaśnij",
    "common.stop": "zatrzymaj",
    "common.all": "WSZYSTKIE",

    "overview.title": "Przegląd rynku",
    "overview.subtitle":
      "Proxy futures FX z CME · tryb demo · nie stanowi porady inwestycyjnej",
    "overview.col.symbol": "Symbol",
    "overview.col.description": "Opis",
    "overview.col.proxy": "Proxy",
    "overview.col.price": "Cena",
    "overview.col.score": "Flow Score",
    "overview.col.category": "Kategoria",
    "overview.col.source": "Źródło",

    "alerts.title": "Radar przepływów na żywo",
    "alerts.subtitle":
      'Uszeregowane anomalie z łącznym wynikiem flow ≥ 31. Kliknij „Wyjaśnij" po szczegóły.',
    "alerts.empty": "Brak alertów — oczekiwanie na anomalie przepływu…",
    "alerts.primaryReason": "Główny powód:",
    "alerts.contributing": "Dodatkowe czynniki:",
    "alerts.dataUsed": "Użyte dane:",
    "alerts.delayedSources": "Opóźnione źródła:",
    "alerts.unknowns": "Niewiadome:",
    "alerts.mode": "Tryb:",
    "alerts.notAdvice": "nie stanowi porady inwestycyjnej",

    "macro.title": "Kalendarz makro",
    "macro.subtitle":
      "Nadchodzące wydarzenia o wysokim wpływie, zmieniające nastawienie przepływu.",
    "macro.forecast": "Prognoza",
    "macro.previous": "Poprzednio",
    "macro.actual": "Faktyczne",
    "macro.noEvents": "Brak wydarzeń.",

    "news.title": "Strumień wiadomości",
    "news.subtitle": "Nagłówki otagowane według waluty.",
    "news.empty": "Brak wiadomości.",
    "news.tags": "tagi:",

    "liquidity.title": "Płynność / Poziomy",
    "liquidity.subtitle":
      "Zakresy sesji, VWAP i kandydaci na wymiatanie płynności. Tryb demo pokazuje ostatnie ~500 ticków.",
    "liquidity.last": "Ostatnia",
    "liquidity.sessionHigh": "Szczyt sesji",
    "liquidity.sessionLow": "Dołek sesji",
    "liquidity.vwap": "VWAP",
    "liquidity.noData": "brak danych",
    "liquidity.ticks": "ticków",

    "replay.title": "Backtesting / Powtórka",
    "replay.subtitle":
      "Odtwarzaj sesje historyczne i uruchamiaj silnik alertów na archiwum.",
    "replay.label": "Etykieta",
    "replay.speed": "Prędkość",
    "replay.start": "Uruchom powtórkę",
    "replay.empty": "Brak sesji powtórek.",

    "settings.title": "Konfiguracja alertów",
    "settings.subtitle":
      "Skonfiguruj progi alertów i kanały powiadomień. Tryb demo trzyma konfigurację w pamięci.",
    "settings.minScore": "Minimalny wynik (0–100)",
    "settings.minSeverity": "Minimalna ważność",
    "settings.channels": "Kanały powiadomień",

    "instrument.price": "Cena",
    "instrument.sentiment": "Sentyment detalu",
    "instrument.noSentiment": "Brak danych sentymentu.",
    "instrument.cot": "CFTC COT (najnowsze)",
    "instrument.noCot": "Brak danych COT.",
    "instrument.reportDate": "Data raportu",
    "instrument.commercialsNet": "Commercials netto",
    "instrument.nonCommercialsNet": "Non-commercials netto",
    "instrument.weeklyChange": "Zmiana tygodniowa",
    "instrument.percentile3y": "Percentyl 3L",
    "instrument.long": "long",
    "instrument.short": "short",
    "instrument.delay": "opóźnienie",

    "timeframe.label": "Zakres",
    "timeframe.instant": "natychmiast",
    "timeframe.1s": "1s",
    "timeframe.5s": "5s",
    "timeframe.10s": "10s",
    "timeframe.15s": "15s",
    "timeframe.30s": "30s",
    "timeframe.1m": "1 min",
    "timeframe.5m": "5 min",
    "timeframe.15m": "15 min",
    "timeframe.30m": "30 min",
    "timeframe.1h": "1h",
    "timeframe.3h": "3h",
    "timeframe.5h": "5h",
    "timeframe.1d": "1d",
    "timeframe.3d": "3d",
    "timeframe.5d": "5d",
    "timeframe.1w": "1t",
    "timeframe.1mo": "1 mies",

    "liquidity.state.elevated": "Zwiększona płynność",
    "liquidity.state.depressed": "Zmniejszona płynność",
    "liquidity.state.normal": "Normalna płynność",
    "liquidity.priceChange": "Zmiana ceny",
    "liquidity.vsBaseline": "vs normalna",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["en"];

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "pl" || stored === "en") return stored;
  const nav = window.navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("pl") ? "pl" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with a stable default on SSR ("en"); sync to real pref after mount
  // to avoid hydration mismatch.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const table = dict[lang] ?? dict.en;
      return (table as Record<string, string>)[key] ?? dict.en[key] ?? key;
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useT must be used inside <LanguageProvider>");
  }
  return ctx;
}
