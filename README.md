# FX Whale Radar

**Institutional Flow Monitor for FX markets.**

Monitoring and analytical tool that detects unusual capital flows on FX markets via best-available proxies: CME FX futures, volume shocks, order flow, open interest, spread widening, volatility spikes, cross-pair correlations, retail sentiment, macro events, news, and COT reports.

> **Not investment advice.** This tool is for analytical, educational, and monitoring purposes only. It does not execute trades and does not claim visibility into private bank/fund order flow on spot FX.

## Quick start (demo mode — no API keys needed)

```bash
git clone https://github.com/marek-poloch/FX-ANALIZER.git
cd FX-ANALIZER
cp .env.example .env
docker compose --profile demo up --build
```

Then open:
- Dashboard: http://localhost:3000
- API: http://localhost:4000/health
- Quant engine: http://localhost:5000/health

## Repo layout

```
apps/
  web/            Next.js 15 dashboard
  api/            NestJS REST + WebSocket gateway
services/
  quant-engine/   Python FastAPI — z-score, EWMA, ATR, VWAP, correlations
  ingest-cme/     CME FX futures adapter (mock + live stubs)
  ingest-news/    News adapter (RSS + paid provider stubs)
  ingest-sentiment/  Retail sentiment adapter
  alert-engine/   Composite flow score + severity + dedup
  notification-service/  Telegram / email / webhook
packages/
  shared-types/   TypeScript types shared between apps
  config/         Env validation
  logger/         Structured logging
  market-math/    TS utilities
infra/
  migrations/     SQL migrations (TimescaleDB)
  docker/         Dockerfiles
  grafana/        Dashboards
  prometheus/     Scrape config
docs/             ARCHITECTURE, DATA_SOURCES, INDICATORS, ALERT_LOGIC, INSTALL_WINDOWS, ...
```

## Modes

Set in `.env`:

| `DATA_MODE` | Description |
|-------------|-------------|
| `mock`      | Fully synthetic deterministic data (for tests) |
| `demo`      | Realistic simulated stream, no API keys needed |
| `live`      | Requires provider API keys — see [docs/API_KEYS.md](docs/API_KEYS.md) |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Windows 11 install guide](docs/INSTALL_WINDOWS.md)
- [Data sources & licenses](docs/DATA_SOURCES.md)
- [Indicators](docs/INDICATORS.md)
- [Alert logic](docs/ALERT_LOGIC.md)
- [API keys setup](docs/API_KEYS.md)
- [Risk disclosure](docs/RISK_DISCLOSURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- **[MASTER.md](MASTER.md)** — full project spec

## License

Private project. All external data sources require legal access per their own terms of service.
