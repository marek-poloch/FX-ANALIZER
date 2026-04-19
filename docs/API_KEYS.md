# API keys setup

Demo mode needs none. Live mode pulls from `.env`. Never commit secrets.

## Market data

| Variable | Provider | Notes |
|---|---|---|
| `CME_API_KEY` / `CME_API_SECRET` | Vendor license (Databento/Polygon Futures/CQG/Rithmic) | Retail CME direct access not available |
| `OANDA_TOKEN` / `OANDA_ACCOUNT_ID` | OANDA practice or live | https://developer.oanda.com |
| `POLYGON_API_KEY` | polygon.io | Spot FX tier |
| `TWELVE_DATA_KEY` | twelvedata.com | Fallback quotes |

## News & macro

| Variable | Provider |
|---|---|
| `TRADING_ECONOMICS_KEY` | tradingeconomics.com |
| `NEWS_PROVIDER_KEY` | e.g. Newsquawk / FinancialJuice |

## Notifications

| Variable | Use |
|---|---|
| `TELEGRAM_BOT_TOKEN` | `@BotFather` bot token |
| `TELEGRAM_CHAT_ID` | Your chat id (get via `@userinfobot`) |
| `DISCORD_WEBHOOK_URL` | Server → Integrations → Webhooks |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | SMTP relay |
| `N8N_WEBHOOK_URL` | Any HTTP endpoint (n8n / Zapier / Make) |

## Sanity checklist

- [ ] `.env` is gitignored (it is).
- [ ] `.env.example` is up to date.
- [ ] Secrets rotated at least every 90 days for any exposed key.
- [ ] Never paste production keys into issues or commit messages.
