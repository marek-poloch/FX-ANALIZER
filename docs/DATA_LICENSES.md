# Data licenses

Before switching `DATA_MODE=live`, ensure you have legal access to each provider you intend to use. This tool does not ship with, scrape, or redistribute any paid data. It's your responsibility as operator to comply with each source's terms of service.

| Provider | License required | Notes |
|---|---|---|
| CME market data | Yes (via licensed vendor) | Databento, Polygon Futures, CQG, Rithmic, etc. |
| OANDA v20 | Free with OANDA account | Practice account works for testing |
| Interactive Brokers | Free with IB account | Subscription per market |
| Dukascopy | Free historical; paid real-time | |
| Polygon.io | Paid | FX plan |
| Twelve Data | Free tier + paid | |
| Trading Economics | Paid | Commercial calendar |
| ForexFactory / Investing.com | Scraping only if ToS allows | Prefer official APIs |
| Reuters / Bloomberg / CNBC RSS | Check each RSS ToS | Usually allowed for personal use |
| FinancialJuice / Newsquawk | Paid subscription | Commercial license |
| CFTC COT | Public | https://www.cftc.gov |
| IG Client Sentiment / Myfxbook / FXSSI / Dukascopy SWFX | Varies | Prefer official embeds/APIs |

Scraping without permission is **out of scope** for this project and not supported by any built-in adapter.
