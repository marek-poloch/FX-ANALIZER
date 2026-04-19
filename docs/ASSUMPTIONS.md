# Assumptions (v0.1)

Recorded per MASTER.md: "if you don't know, write the assumption and continue".

1. **Backend framework**: NestJS over FastAPI. Rationale: shared TS types with frontend, first-class WebSocket support, and the heavy numeric work is already delegated to the Python quant-engine microservice.
2. **Primary DB**: PostgreSQL 16 + TimescaleDB. Hypertables created on every time-series table in `001_init.sql`.
3. **Messaging**: Redis Streams planned (image provisioned) but not yet wired — the demo path runs fully in-process to keep the first iteration debuggable on a dev laptop.
4. **Demo store**: in-memory `InMemoryStore` for v0.1. Swap to Postgres repositories in v0.2.
5. **Mock CME**: 7 futures contracts (6E, 6B, 6J, 6A, 6C, 6S, 6N) with tick interval 500 ms and a 2 % chance of volume/spread shock per tick.
6. **Warm-up window**: 30 ticks per instrument before flow scores or alerts are emitted.
7. **Alert cooldown**: 15 s per symbol to avoid duplicates.
8. **Alert threshold**: flow score ≥ 31 fires an alert in demo. User can raise in Settings.
9. **Correlation basket**: v0.1 uses a simplified heuristic (`|volumeZ| > 3`) as a stand-in for cross-pair confirmation. A real basket diff (EUR vs DXY, AUD vs commodities, etc.) lands in v0.2.
10. **Sentiment & COT** are seeded with randomized demo values. No real IG/Myfxbook/FXSSI scraping.
11. **News feed** generates a small rotating headline list every 45 s in demo.
12. **Authentication**: disabled in v0.1 (local-only tool). JWT + roles planned for v0.2 per MASTER.md.
13. **Python version**: 3.12. pandas ≥ 2.2, numpy ≥ 1.26.
14. **Node version**: 20 LTS. pnpm 9.
15. **Windows-first**: install guide written for Windows 11 / Docker Desktop (WSL 2). Repository itself is OS-agnostic.
16. **Secrets**: `.env` is gitignored; `.env.example` enumerates every supported variable.
17. **"Not investment advice"** banner is rendered in the web header in every view.
