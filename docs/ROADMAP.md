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
