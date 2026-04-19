# Risk disclosure

**FX Whale Radar is an analytical, monitoring, and educational tool. It is not investment advice, it is not a recommendation to buy or sell any instrument, and it does not execute trades.**

## What this tool can and cannot do

### Can
- Detect volume, spread, price impulse, and order book anomalies on CME FX futures and correlated instruments (when real data is connected).
- Highlight macro and news events that shape flow bias.
- Correlate moves across currencies and baskets.
- Surface explainable signals with severity and confidence hints.

### Cannot
- See private bank, hedge fund, or central bank spot FX orders. Spot FX is decentralized and OTC.
- Guarantee that an alert reflects institutional activity. Alerts are **hypotheses** based on public-ish proxies.
- Replace broker risk controls, position sizing, or a trading plan.
- Predict price. Every alert describes the *past few seconds or minutes* of market microstructure.

## Data limitations

- Demo mode uses fully synthetic data. Signals in demo mode have no predictive value.
- Even in live mode, many feeds are **delayed** (CFTC COT weekly, IG Client Sentiment 15+ min, news RSS seconds to minutes). The UI flags delay per source.
- Retail sentiment is broker-scoped, not market-wide.

## Your responsibility

By running this tool you accept that:
- All trading decisions are yours alone.
- You have legal access to any paid data source you connect.
- You comply with your local regulator's rules on trading and data handling.

## No warranty

Software provided as-is, without warranty of any kind. Use at your own risk.
