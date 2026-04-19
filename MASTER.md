# MASTER PROMPT — FX WHALE RADAR

Pracuj w Codex jako autonomiczny agent programistyczny. Korzystaj z osobnych etapów pracy, commituj logicznie zmiany, uruchamiaj testy po każdym większym module, pokazuj diff i nie zostawiaj niedziałających importów. Jeżeli repo już istnieje, najpierw przeanalizuj strukturę, potem zaproponuj plan migracji bez niszczenia istniejących plików. Pracuj, wykorzystjąc wiele agentów tak aby nie zkłócali sobie wzajemnie pracy. Zasosuj inteligentną orkiestrację.

# ROLA I CEL

Jesteś autonomicznym zespołem senior developerów, architektów systemowych, quant developerów, DevOps, QA oraz product managerów. Twoim zadaniem jest zaprojektowanie i zbudowanie kompletnej aplikacji produkcyjnej:

**FX Whale Radar / Institutional Flow Monitor**

Aplikacja ma służyć do możliwie szybkiego wykrywania dużych, nietypowych ruchów kapitału na rynku walutowym Forex, z pełną świadomością, że rynek spot FX jest zdecentralizowany i OTC, więc nie istnieje publiczny odpowiednik blockchainowego "whale alert". Program ma śledzić najlepsze dostępne wskaźniki zastępcze: FX futures, wolumen, top of book, order flow, open interest, spread, volatility shock, korelacje między parami, sentyment detaliczny, dane makro, newsy, COT, opcje i alerty anomalii.

Nie buduj bota inwestycyjnego. Nie wykonuj transakcji. Aplikacja ma być narzędziem analityczno-monitorującym, edukacyjnym i ostrzegawczym.

# NAJWAŻNIEJSZE ZAŁOŻENIA

1. Program NIE twierdzi, że widzi prywatne zlecenia banków lub funduszy na rynku spot FX.
2. Program wykrywa "ślady dużego kapitału" przez:
   - CME FX futures,
   - nagły wzrost wolumenu,
   - nietypowe transakcje,
   - zmiany open interest,
   - order book imbalance,
   - liquidity sweeps,
   - spread widening,
   - volatility spikes,
   - cross-pair confirmation,
   - reakcje na dane makro,
   - zmiany sentymentu detalicznego,
   - pozycjonowanie CFTC COT,
   - informacje newsowe.
3. Aplikacja musi być modułowa, odporna na błędy, gotowa do rozwoju i uruchamiana lokalnie przez Docker Compose.
4. Nie używaj fikcyjnych API. Jeśli konkretne API wymaga płatnego dostępu, zbuduj adapter z mockiem i dokumentacją podłączenia prawdziwego źródła.
5. Wszędzie, gdzie dane są opóźnione, oznacz to w UI.
6. Każdy sygnał ma mieć wyjaśnienie: "dlaczego system uznał to za anomalię".
7. Każdy alert ma mieć poziom pewności: LOW / MEDIUM / HIGH.
8. Każdy moduł musi mieć testy.
9. Przygotuj aplikację tak, aby początkujący użytkownik mógł ją uruchomić krok po kroku na Windows 11.

# PROPONOWANY STACK TECHNOLOGICZNY

Zbuduj monorepo:

- Frontend:
  - Next.js 15+ / React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Recharts / Lightweight Charts / TradingView Lightweight Charts
  - WebSocket client do danych live
  - responsywny dashboard desktop-first

- Backend API:
  - NestJS albo FastAPI — wybierz najlepsze rozwiązanie i uzasadnij
  - REST API
  - WebSocket gateway
  - moduł autoryzacji lokalnej
  - role: admin, analyst, viewer

- Data / Quant Worker:
  - Python 3.12+
  - pandas
  - numpy
  - scipy
  - scikit-learn
  - statsmodels
  - opcjonalnie river dla detekcji anomalii online
  - moduł obliczeń z-score, EWMA, rolling volatility, correlation shock, order book imbalance

- Baza danych:
  - PostgreSQL 16+
  - TimescaleDB dla time-series
  - Redis dla kolejek/cache
  - opcjonalnie pgvector dla indeksowania newsów i notatek analitycznych

- Komunikacja:
  - Redis Streams albo NATS
  - WebSocket dla frontend live updates

- DevOps:
  - Docker Compose
  - .env.example
  - migracje DB
  - seed data
  - healthchecki
  - logowanie strukturalne
  - Prometheus + Grafana jako opcjonalny moduł monitoringu

- Testy:
  - unit tests
  - integration tests
  - e2e smoke tests
  - frontend component tests
  - test danych mockowych
  - test alert engine

# STRUKTURA REPOZYTORIUM

```
fx-whale-radar/
  apps/
    web/
    api/
  services/
    ingest-cme/
    ingest-news/
    ingest-sentiment/
    quant-engine/
    alert-engine/
    notification-service/
  packages/
    shared-types/
    config/
    logger/
    market-math/
  infra/
    docker/
    grafana/
    prometheus/
    migrations/
  docs/
    ARCHITECTURE.md
    DATA_SOURCES.md
    INDICATORS.md
    ALERT_LOGIC.md
    INSTALL_WINDOWS.md
    RISK_DISCLOSURE.md
    API_KEYS.md
    ROADMAP.md
    ASSUMPTIONS.md
  tests/
  docker-compose.yml
  .env.example
  README.md
```

# ŹRÓDŁA DANYCH DO UWZGLĘDNIENIA

Zbuduj warstwę adapterów danych. Każdy adapter ma mieć:
- interfejs,
- implementację mock,
- miejsce na implementację produkcyjną,
- obsługę błędów,
- retry,
- rate limit,
- zapis raw payload do bazy,
- normalizację do wspólnego modelu danych.

## 1. CME FX Futures

Obsługiwane instrumenty:
- 6E — Euro FX futures, proxy EUR/USD
- 6B — British Pound futures, proxy GBP/USD
- 6J — Japanese Yen futures, proxy USD/JPY odwrotnie interpretowany
- 6A — Australian Dollar futures, proxy AUD/USD
- 6C — Canadian Dollar futures, proxy USD/CAD odwrotnie interpretowany
- 6S — Swiss Franc futures, proxy USD/CHF odwrotnie interpretowany
- 6N — New Zealand Dollar futures, proxy NZD/USD
- M6E / micro contracts, jeśli dostępne

Zbierane dane:
- trades, price, bid, ask, top of book, spread, volume, tick volume, open interest,
- daily statistics, session high/low, settlement, contract expiry, roll calendar.

## 2. Broker / FX CFD — adaptery opcjonalne

- OANDA v20
- Interactive Brokers Gateway/TWS
- Dukascopy historical tick data
- Twelve Data / Polygon / Alpha Vantage jako fallback

Nie zakładaj, że użytkownik ma klucze. Wszystkie źródła mają działać w trybie mock/demo.

## 3. Sentyment detaliczny

- IG Client Sentiment
- OANDA order book / position book
- Myfxbook sentiment
- FXSSI
- Dukascopy SWFX sentiment

Dla każdego źródła dodaj w UI: opóźnienie, zakres reprezentatywności, ostrzeżenie o niepełności danych.

## 4. CFTC COT

- Commercials, Non-commercials, leveraged funds, asset managers, dealers
- net positioning, weekly change, percentile rank 3Y/5Y, extreme positioning signal

COT nie jest sygnałem intraday. Oznacz jako filtr średnio- i długoterminowy.

## 5. Dane makro

Kalendarz: CPI, PPI, NFP, unemployment, CB decisions (FOMC/ECB/BoE/BoJ/SNB/RBA/BoC), PMI, retail sales, GDP, bond yields.

Adaptery: Trading Economics, ForexFactory (jeśli zgodne z TOS), oficjalne API banków centralnych.

Funkcje: oznaczenie high-impact events, actual vs forecast, korelacja z alertami rynkowymi w oknie ±30 min.

## 6. News / Squawk

- RSS Reuters / CNBC / Bloomberg (jeśli legalnie dostępne)
- Forexlive, FinancialJuice / Newsquawk (mock)
- klasyfikacja newsów po walucie
- tagi: USD/EUR/GBP/JPY/CHF/CAD/AUD/NZD, risk-on/off, inflation, rates, intervention
- embedding / semantic search
- powiązanie newsów z ruchami ceny

# WSKAŹNIKI I SYGNAŁY

## A. Volume Shock Detector
- z-score wolumenu: LOW>2, MEDIUM>3, HIGH>4 lub >99 percentyla

## B. Price Impulse Detector
- return 1m/5m/15m, ATR, realized volatility, odchylenie od VWAP

## C. Liquidity Sweep Detector
- wybicie high/low + szybki powrót + spread + wolumen
- sygnały: possible stop run, liquidity grab, false breakout

## D. Order Book Imbalance
- bid/ask size, imbalance ratio, spread widening, stale quote detection

## E. Spread Shock
- z-score spreadu względem mediany sesji

## F. Cross-Pair Confirmation
- USD index proxy, EUR/GBP/JPY basket, CHF/AUD/NZD proxy

## G. Correlation Break Detector
- EUR/USD vs DXY, USD/JPY vs US10Y, AUD/USD vs commodities, USD/CAD vs oil

## H. Open Interest Shift
- price↑+OI↑=new longs, price↓+OI↑=new shorts, price↑+OI↓=short covering, price↓+OI↓=long liquidation

## I. COT Extreme Positioning
- net positioning, 3Y/5Y percentile, weekly change, price/positioning divergence

## J. Retail Sentiment Contrarian Signal
- % long/short, skrajność, crowd crowded long/short, potential squeeze zone

## K. Macro Event Shock
- actual vs forecast, reakcja 1m/5m/15m/1h, macro-confirmed vs counterintuitive move

## L. Composite Institutional Flow Score (0–100)

| Składnik | Max |
|---|---|
| Volume shock | 20 |
| Price impulse | 15 |
| Spread shock | 10 |
| Order book imbalance | 15 |
| Liquidity sweep | 10 |
| Cross-pair confirmation | 10 |
| Macro/news confirmation | 10 |
| Sentiment contradiction | 5 |
| COT context | 5 |

Kategorie: 0-30 noise, 31-50 watch, 51-70 significant, 71-85 probable institutional, 86-100 major event.

Każdy wynik musi mieć explainability: co podbiło wynik, jakie dane użyte, co opóźnione, czego system nie wie.

# DASHBOARD UI

1. **Market Overview** — tabela: instrument, price, 1m/5m change, volume z-score, spread z-score, flow score, alert status
2. **Live Flow Radar** — lista alertów live z poziomem ważności, score, opisem, przyciskiem "explain"
3. **Instrument Detail** — wykres, wolumen, VWAP, spread, OB imbalance, correlated pairs, news, COT, sentiment
4. **Liquidity / Levels View** — PDH/PDL, session high/low, Asian/London/NY range, VWAP, volume clusters
5. **Macro Calendar** — dzisiaj/jutro, high impact, affected currencies, actual vs forecast, alert po publikacji
6. **News Feed** — newsy po walucie, filtrowanie, impact score, korelacja z ceną
7. **Alert Configuration** — instrumenty, progi z-score/score, godziny aktywności, kanały powiadomień
8. **Backtesting / Replay** — odtwarzanie dnia historycznego, generowanie alertów, FP/TP metrics

# POWIADOMIENIA

Format alertu zewnętrznego:
```
[FX Whale Radar]
Instrument: 6E / EUR/USD proxy
Severity: HIGH
Score: 82/100
Reason: volume z-score 4.2, price impulse 3.1 ATR, spread widening, USD basket confirmation
Time: 2026-04-19 14:31:00 UTC
Data delay: real-time / delayed / mock
Not investment advice.
```

Kanały: e-mail SMTP, Telegram Bot, Discord Webhook, Slack Webhook, SMS (Twilio/ClickSend opcjonalnie), webhook n8n.

# API BACKEND

```
GET  /health
GET  /api/instruments
GET  /api/market/overview
GET  /api/market/:symbol/latest
GET  /api/market/:symbol/candles
GET  /api/alerts
GET  /api/alerts/:id
POST /api/alerts/config
GET  /api/macro/calendar
GET  /api/news
GET  /api/sentiment/:symbol
GET  /api/cot/:symbol
GET  /api/replay/sessions
POST /api/replay/start
POST /api/replay/stop

WebSocket:
ws://.../market
ws://.../alerts
ws://.../news
```

# MODELE DANYCH

Tabele: `instruments`, `market_ticks`, `market_candles`, `order_book_snapshots`, `volume_stats`, `spread_stats`, `flow_scores`, `alerts`, `alert_explanations`, `macro_events`, `news_items`, `sentiment_snapshots`, `cot_reports`, `data_sources`, `source_health`, `user_alert_configs`, `notification_channels`, `replay_sessions`, `audit_logs`.

Każda tabela: `created_at`, `updated_at`, `source`, `data_quality`, `delay_status`, `raw_payload_id`.

# DETEKCJA JAKOŚCI DANYCH

Stany: **GOOD** / **DEGRADED** / **DELAYED** / **MOCK** / **OFFLINE**

Wykrywane problemy: brak danych, outlier cenowy, duplicate ticks, stale quote, source disconnected, clock drift, suspicious zero volume.

# BEZPIECZEŃSTWO I ZGODNOŚĆ

1. Nie zapisuj kluczy API w kodzie — tylko `.env.example`.
2. Walidacja env przy starcie.
3. Rate limiting, audit log.
4. Disclaimer: narzędzie nie jest poradą inwestycyjną.
5. `DATA_LICENSES.md` — użytkownik musi mieć legalny dostęp do płatnych feedów.
6. Nie obchodź paywalli, nie scrapuj wbrew regulaminom.

# TRYB DEMO

```bash
pnpm demo
# lub
docker compose --profile demo up
```

Generuje realistyczne dane tick/candle, symuluje volume shock, macro event, spread widening, OB imbalance, przykładowe alerty.

# ZMIENNE ŚRODOWISKOWE

```env
DATA_MODE=mock|demo|live
CME_API_KEY=
CME_API_SECRET=
OANDA_TOKEN=
TRADING_ECONOMICS_KEY=
NEWS_PROVIDER_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
N8N_WEBHOOK_URL=
```

# KOLEJNOŚĆ IMPLEMENTACJI

| Etap | Zakres |
|---|---|
| 1 | Skeleton monorepo, Docker Compose, Postgres, Redis, apps/web, apps/api, quant-engine, shared-types |
| 2 | Modele danych, migracje, seed demo data |
| 3 | Market Data Ingestion — adaptery, MockCmeAdapter, NormalizedTick, zapis do DB |
| 4 | Quant Engine — z-score, EWMA, ATR, VWAP, spread z-score, correlation shock, liquidity sweep, OI |
| 5 | Alert Engine — flow score, severity, explainability, dedup, cooldown, WebSocket push |
| 6 | Frontend Dashboard — wszystkie 8 widoków |
| 7 | Notifications — Telegram, e-mail, webhook |
| 8 | Backtesting / Replay |
| 9 | QA — unit/integration/e2e/lint/typecheck/build/docker test |
| 10 | Dokumentacja kompletna |

# KRYTERIA AKCEPTACJI

- [ ] `docker compose up` uruchamia całość
- [ ] Frontend: http://localhost:3000
- [ ] Backend: http://localhost:4000
- [ ] Dashboard działa bez kluczy API (tryb demo)
- [ ] Alerty pojawiają się live
- [ ] Kliknięcie alertu pokazuje wyjaśnienie
- [ ] Konfiguracja progów alertów działa
- [ ] Testowy alert Telegram/e-mail/webhook działa
- [ ] Kompletna dokumentacja
- [ ] Testy przechodzą
- [ ] Build przechodzi
- [ ] Brak sekretów w repo
- [ ] Statusy danych: live/demo/mock/delayed widoczne w UI
- [ ] Disclaimer "not investment advice" widoczny

# INSTRUKCJA DLA AGENTA

Pracuj autonomicznie. Nie zadawaj pytań, jeśli możesz przyjąć rozsądne założenia — zapisz je w `docs/ASSUMPTIONS.md`.

Format odpowiedzi:
1. Przyjęte założenia
2. Architektura docelowa
3. Struktura repo
4. Plan implementacji
5. Ryzyka techniczne
6. Pliki (ścieżka + pełna zawartość)
7. Instrukcja: uruchomienie / testowanie / demo vs live / co zamockowane
