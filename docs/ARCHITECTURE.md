# Architecture

## High-level

```
┌──────────┐    REST / WS    ┌──────────┐    HTTP    ┌────────────────┐
│  Web UI  │ ◀─────────────▶ │   API    │ ◀────────▶ │ Quant Engine   │
│ Next.js  │                 │ NestJS   │            │ Python / FastAPI│
└──────────┘                 └────┬─────┘            └────────────────┘
                                  │
                        ┌─────────┴───────────┐
                        │                     │
                 ┌──────▼──────┐      ┌───────▼───────┐
                 │ PostgreSQL  │      │    Redis      │
                 │+TimescaleDB │      │ Streams/Cache │
                 └─────────────┘      └───────────────┘
```

## Layers

1. **Ingestion adapters** (`apps/api/src/adapters`, `services/ingest-*`) — normalize every data source to canonical `MarketTick`, `NewsItem`, `MacroEvent`, `SentimentSnapshot`, `CotReport`. Each adapter has: `mock`, stub for live, rate limit, retry, raw payload persistence.
2. **Quant engine** (`services/quant-engine`) — heavy offline / batch indicators (pandas/numpy): ATR, VWAP, correlation shock, liquidity sweep, OI interpretation. Exposed via REST so any service can call it.
3. **Streaming quant** (`apps/api/src/quant`) — lightweight online stats for the live feed: z-score, EWMA, rolling percentile. Runs in-process for minimum latency.
4. **Alert engine** (`apps/api/src/demo/demo-feed.service.ts` + future Redis consumer) — consumes ticks, computes composite flow score, applies cooldown/dedup, emits `Alert` with explanation.
5. **Notification service** (`services/notification-service`) — fans alerts out to Telegram, Discord, Slack, email, n8n webhook. Mock-friendly: falls back to stdout when no creds are set.
6. **Web UI** (`apps/web`) — Next.js 15 App Router. Server components for static data, client components with `swr` + `socket.io-client` for live WebSocket streams.
7. **Persistence** — PostgreSQL 16 with TimescaleDB extension; hypertables on every time-series table. `infra/migrations/001_init.sql` bootstraps schema on first container start.

## Data flow (demo mode)

1. `MockCmeAdapter` emits synthetic ticks at 2 Hz per instrument.
2. `DemoFeedService` subscribes, updates streaming stats (`RollingStats`, `EwmaBaseline`).
3. For every tick past warm-up, a `FlowScore` is computed and broadcast on `/market`.
4. Score ≥ 31 → `Alert` with explainability, broadcast on `/alerts`.
5. UI receives live ticks + alerts; user clicks "Explain" to see contributing factors.

## Swapping demo → live

- Set `DATA_MODE=live`.
- Supply provider keys in `.env` (see [API_KEYS.md](API_KEYS.md)).
- Replace `MockCmeAdapter` bootstrapping in `DemoFeedService` with the real `CmeAdapter` (or partner integration).
- Every adapter returns the same `MarketTick` → zero changes required downstream.

## Why NestJS for API (not FastAPI)

Chose NestJS because:
- Monorepo stays on one language for UI-adjacent code; shared TS types (`@fxradar/shared-types`) are used natively.
- First-class WebSocket support via `@nestjs/websockets` + `socket.io`.
- Heavy numeric computation is offloaded to the Python quant-engine service, so FastAPI's numpy affinity is not lost.

## Ports

| Service | Port |
|---------|------|
| web | 3000 |
| api | 4000 |
| quant-engine | 5000 |
| notification-service | 5100 |
| postgres | 5432 |
| redis | 6379 |
| grafana (monitoring profile) | 3001 |
| prometheus | 9090 |
