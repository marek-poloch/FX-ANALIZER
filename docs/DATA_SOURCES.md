# Data sources

Every data source has three layers: **interface** (TS contract), **mock** (demo), and **live** (paid/licensed). Every record persisted to DB carries a `source`, `data_quality`, `delay_status`, and optional `raw_payload_id` referencing the original response.

## Market data

| Source | Status in demo | Real provider options | Notes |
|---|---|---|---|
| CME FX futures (6E, 6B, 6J, 6A, 6C, 6S, 6N) | MOCK | Databento, Polygon Futures, CQG, Rithmic, CME MDP via vendor | No free retail API |
| OANDA v20 | stub | OANDA live + practice account | REST + streaming |
| Interactive Brokers | stub | IB Gateway / TWS | Requires running local gateway |
| Dukascopy historical ticks | stub | Dukascopy HTTP archive | OK for backtesting |
| Polygon / Twelve Data / Alpha Vantage | fallback stub | Paid API | Spot FX |

## Retail sentiment

| Source | Representativeness | Delay | Status |
|---|---|---|---|
| IG Client Sentiment | IG clients only | 15–30 min | mock |
| OANDA position book | OANDA clients only | real-time | stub |
| Myfxbook | Myfxbook users | 15 min | stub |
| FXSSI | aggregated brokers | 15 min | stub |
| Dukascopy SWFX | Dukascopy clients | 15 min | stub |

**UI always labels sentiment with its scope.** Retail sentiment is never presented as market-wide.

## Macro calendar

| Source | License notes |
|---|---|
| Trading Economics | Paid API for commercial use |
| ForexFactory | Scraping only if compliant with ToS |
| Investing.com | Scraping only if compliant with ToS |
| Central bank websites (ECB, Fed, BoE, BoJ, SNB, RBA, BoC) | Free public data |

## News

| Source | License notes |
|---|---|
| Reuters / Bloomberg / CNBC RSS | Check ToS per outlet |
| Forexlive | Free tier |
| FinancialJuice / Newsquawk | Commercial license required |
| X/Twitter | Official API only |

## COT

Free: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm — weekly publication.

## Important

- Demo mode uses **fully synthetic data**. No scraping, no unauthorized access.
- For live mode the user is responsible for licensing data per provider ToS. See [DATA_LICENSES.md](DATA_LICENSES.md).
