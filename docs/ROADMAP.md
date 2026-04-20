# Roadmap

## Shipped (v0.1)

- Monorepo skeleton (pnpm workspaces, Docker Compose)
- TimescaleDB schema (ticks, candles, alerts, macro, news, sentiment, COT)
- Mock CME adapter, demo feed
- Streaming quant (RollingStats, EwmaBaseline)
- Batch quant endpoints (z-score, ATR, VWAP, correlation, liquidity sweep, OI)
- Composite flow score + severity + explainability
- WebSocket gateways: `/market`, `/alerts`, `/news`
- 8 dashboard views (overview, radar, macro, news, liquidity, replay, settings, instrument detail)
- Notification service scaffolding (Telegram, Discord, Slack, email, webhook) with mock fallback
- Windows 11 install guide
- Full documentation: architecture, data sources, indicators, alert logic, API keys, risk

## Next (v0.2)

- Replace in-memory store with Postgres-backed repositories in API
- Redis Streams bus between ingest services and alert engine
- Real CME data via a licensed vendor (provider adapter template)
- Historical tick replay over TimescaleDB
- Authentication: JWT, roles (admin/analyst/viewer)
- Dashboard charts using TradingView Lightweight Charts
- Cross-pair correlation matrix view
- Alert backtesting with labelled datasets + FP/TP metrics

## Future

- pgvector-backed news semantic search
- Order book heatmap
- Multi-user collaboration + shared alert rules
- Prometheus exporters + Grafana dashboard pack
- Mobile companion (React Native) — view-only

---

## Phase 2 — Market Image SaaS (brief z 2026-04-20)

> Źródło: [`REQUIREMENTS.md`](./REQUIREMENTS.md), architektura agentów: [`AGENTS.md`](./AGENTS.md).
> FX Whale Radar staje się jednym z rynków wewnątrz większej platformy SaaS z syntetycznym
> obrazem rynku, rekomendacjami jakościowymi i predykcjami audytowymi.

### Epik 1 — Fundament danych wielorynkowy
- Adaptery klas aktywów: **crypto**, **commodities**, **indices**, **ETF** (obok obecnego **forex**).
- Model rynku z atrybutem `geoScope: global | us | pl`.
- Migracja Postgres: tabele `markets`, `market_instruments`, rozszerzenie `instruments` o `asset_class` i `geo_scope`.
- Adaptery on-chain dla whale flows (np. Glassnode / Nansen / Whale Alert).
- Adapter przepływów ETF (iShares, State Street, ARK).
- Adapter commodities flows (COT + Open Interest z CME / ICE).

### Epik 2 — Syntetyczny Obraz Rynku (Agent 1)
- Moduł `market-image` w API:
  - 6 bloków × 3 obrazy geograficzne = 18 sub-scorerów.
  - Bloki: momentum, spójność, reżim, newsy, przepływy kapitału, niepewność.
  - Output: score ∈ [−100, +100] + label + uzasadnienie.
- Hypertable `market_images` (timestamp, geo_scope, block, raw_signals, score).
- Widok frontendu: **trzy karty obrazu rynku** (Global / USA / PL) na głównym dashboardzie.
- Reguła R1.3: Polska nigdy nie nadpisuje USA — enforced na poziomie rekomendacji.

### Epik 3 — Wagi i Profile (Agent 2)
- Moduł `weights-profiles`:
  - CRUD profili użytkownika, blokada edycji poza zakresem `min–max`.
  - Endpoint AI proposal + kolejka oczekujących zmian.
  - Historia (audit log) wszystkich zmian — append-only.
- UI: panel „Wagi i profile" — slidery z widocznymi zakresami, lista propozycji AI + uzasadnienia,
  przycisk „zatwierdź / odrzuć".

### Epik 4 — Predykcje audytowe (Agent 3)
- Moduł `predictions` (Python / quant-engine):
  - 4 zakresy kanoniczne (Short, Intraday, Structural, Regime).
  - Dla każdego: kierunek, tunel min/max, pewność, etykieta 1-zdaniowa.
  - Hypertable `predictions` (symbol, horizon, predicted_at, expires_at, dir, band_low, band_high, confidence).
- UI: widok instrumentu — sekcja „4 zakresy czasowe" (kafelki).

### Epik 5 — Uczenie i Ewaluacja (Agent 4)
- Cron / scheduled job: porównuje predykcje po wygaśnięciu z rzeczywistą ceną.
- Tabela `prediction_evaluations` (prediction_id, hit_direction, hit_band, deviation).
- Tabela `ai_quality_profiles` (symbol, horizon, rolling_accuracy, confidence_adjust, last_updated).
- Automatyczne obniżanie pewności / poszerzanie tunelu w kolejnych predykcjach.
- UI: panel „Skuteczność AI" — opisowa (brak metryk zarobku).

### Epik 6 — Rekomendacje (Agent 5)
- Moduł `recommendations`:
  - Wejście: obraz rynku + aktywny profil wag.
  - Wyjście: `{direction, strength, confidence, rationale[]}`.
  - **Nie** korzysta z predykcji — twardo egzekwowane w kodzie (brak importu z `predictions`).
- UI: dolna sekcja widoku instrumentu — rekomendacja + bullet-point uzasadnienie.

### Epik 7 — Ryzyko i Zgodność (Agent 6)
- Middleware `risk-gate` przed publikacją rekomendacji:
  - blokada gdy niepewność > próg;
  - blokada przy sprzecznym obrazie Global vs USA;
  - blokada przy wykrytej zmianie reżimu.
- Endpoint audytowy: wszystkie veta z uzasadnieniem.

### Epik 8 — Koordynator (Agent 0)
- Orkiestrator `orchestrator` (NestJS) spina pipeline:
  `ingest → Agent 1 → Agent 2 → Agent 5 → Agent 6 → publish`
  i **równolegle**: `Agent 3 → Agent 4`.
- Egzekwuje separację warstw: Agent 5 **nie może** importować z modułu `predictions` — enforced
  lintem (ESLint boundary rules) + code review.
- Centralny log decyzji dla audytu.

### Epik 9 — Transparentność / Audyt
- Endpoint `/audit` — historia obrazu, rekomendacji, predykcji, wag, vet ryzyka.
- Export CSV / JSON dla celów regulacyjnych.
- Onboarding compliance: „nie jesteśmy doradcą inwestycyjnym" — zgodnie z MiFID II / KNF.

### Epik 10 — UX ustrojowy (R9)
- Zakaz przycisków „kup / sprzedaj".
- Kolorystyka tylko informacyjna (brak gradientów emocji).
- Tooltipy / rozwijane uzasadnienia przy **każdej** liczbie.
- Oddzielne sekcje: **Obraz** | **Predykcja** | **Rekomendacja** — wizualnie rozłączne.

### Kolejność wdrożenia (propozycja)
1. Epik 2 (obraz rynku w istniejącym zakresie FX, na początek tylko USA).
2. Epik 3 (wagi + profile).
3. Epik 6 + 7 (rekomendacje + risk gate — zamknięcie ścieżki decyzyjnej dla FX).
4. Epik 1 (rozszerzenie na crypto/commodities/indices/ETF + PL/Global).
5. Epik 4 + 5 (predykcje + uczenie — dopiero gdy mamy obraz i historię).
6. Epik 8 (orkiestrator spina wszystko gdy komponenty istnieją).
7. Epik 9 + 10 (audyt + UX final).
