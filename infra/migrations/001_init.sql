-- FX Whale Radar — initial schema
-- Runs automatically inside TimescaleDB container on first start.

CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Instruments ---------------------------------------------------

CREATE TABLE IF NOT EXISTS instruments (
    symbol        TEXT PRIMARY KEY,
    description   TEXT NOT NULL,
    proxy_for     TEXT,
    invert_for_spot BOOLEAN DEFAULT FALSE,
    exchange      TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Market ticks (hypertable) -------------------------------------

CREATE TABLE IF NOT EXISTS market_ticks (
    symbol        TEXT NOT NULL,
    ts            TIMESTAMPTZ NOT NULL,
    price         DOUBLE PRECISION NOT NULL,
    bid           DOUBLE PRECISION,
    ask           DOUBLE PRECISION,
    bid_size      DOUBLE PRECISION,
    ask_size      DOUBLE PRECISION,
    volume        DOUBLE PRECISION,
    source        TEXT NOT NULL,
    data_quality  TEXT NOT NULL DEFAULT 'GOOD',
    delay_status  TEXT NOT NULL DEFAULT 'realtime',
    raw_payload_id UUID
);

SELECT create_hypertable('market_ticks', 'ts', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_ticks_symbol_ts ON market_ticks (symbol, ts DESC);

-- ---------- Candles -------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_candles (
    symbol      TEXT NOT NULL,
    interval    TEXT NOT NULL,
    open_time   TIMESTAMPTZ NOT NULL,
    close_time  TIMESTAMPTZ NOT NULL,
    open        DOUBLE PRECISION NOT NULL,
    high        DOUBLE PRECISION NOT NULL,
    low         DOUBLE PRECISION NOT NULL,
    close       DOUBLE PRECISION NOT NULL,
    volume      DOUBLE PRECISION NOT NULL,
    trades      INTEGER,
    vwap        DOUBLE PRECISION,
    PRIMARY KEY (symbol, interval, open_time)
);

SELECT create_hypertable('market_candles', 'open_time', if_not_exists => TRUE);

-- ---------- Order book snapshots ------------------------------------------

CREATE TABLE IF NOT EXISTS order_book_snapshots (
    symbol          TEXT NOT NULL,
    ts              TIMESTAMPTZ NOT NULL,
    bids            JSONB NOT NULL,
    asks            JSONB NOT NULL,
    spread          DOUBLE PRECISION NOT NULL,
    imbalance_ratio DOUBLE PRECISION NOT NULL
);
SELECT create_hypertable('order_book_snapshots', 'ts', if_not_exists => TRUE);

-- ---------- Stats ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS volume_stats (
    symbol         TEXT NOT NULL,
    interval       TEXT NOT NULL,
    ts             TIMESTAMPTZ NOT NULL,
    volume         DOUBLE PRECISION NOT NULL,
    baseline_ewma  DOUBLE PRECISION NOT NULL,
    z_score        DOUBLE PRECISION NOT NULL,
    percentile_rank DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (symbol, interval, ts)
);
SELECT create_hypertable('volume_stats', 'ts', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS spread_stats (
    symbol                  TEXT NOT NULL,
    ts                      TIMESTAMPTZ NOT NULL,
    spread                  DOUBLE PRECISION NOT NULL,
    median_session_spread   DOUBLE PRECISION NOT NULL,
    z_score                 DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (symbol, ts)
);
SELECT create_hypertable('spread_stats', 'ts', if_not_exists => TRUE);

-- ---------- Flow scores & alerts ------------------------------------------

CREATE TABLE IF NOT EXISTS flow_scores (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol      TEXT NOT NULL,
    ts          TIMESTAMPTZ NOT NULL,
    total       DOUBLE PRECISION NOT NULL,
    components  JSONB NOT NULL,
    category    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_flow_scores_symbol_ts ON flow_scores (symbol, ts DESC);

CREATE TABLE IF NOT EXISTS alerts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol       TEXT NOT NULL,
    ts           TIMESTAMPTZ NOT NULL,
    severity     TEXT NOT NULL,
    score        DOUBLE PRECISION NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    data_mode    TEXT NOT NULL,
    dismissed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts (ts DESC);

CREATE TABLE IF NOT EXISTS alert_explanations (
    alert_id              UUID PRIMARY KEY REFERENCES alerts(id) ON DELETE CASCADE,
    primary_reason        TEXT NOT NULL,
    contributing_factors  JSONB NOT NULL,
    data_used             JSONB NOT NULL,
    delayed_data_sources  JSONB NOT NULL,
    unknowns              JSONB NOT NULL
);

-- ---------- Macro / News / Sentiment / COT --------------------------------

CREATE TABLE IF NOT EXISTS macro_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ts          TIMESTAMPTZ NOT NULL,
    currency    TEXT NOT NULL,
    name        TEXT NOT NULL,
    impact      TEXT NOT NULL,
    forecast    TEXT,
    previous    TEXT,
    actual      TEXT,
    source      TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_macro_ts ON macro_events (ts DESC);

CREATE TABLE IF NOT EXISTS news_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ts           TIMESTAMPTZ NOT NULL,
    title        TEXT NOT NULL,
    summary      TEXT,
    url          TEXT,
    source       TEXT NOT NULL,
    currencies   TEXT[] NOT NULL DEFAULT '{}',
    tags         TEXT[] NOT NULL DEFAULT '{}',
    impact_score DOUBLE PRECISION,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_ts ON news_items (ts DESC);

CREATE TABLE IF NOT EXISTS sentiment_snapshots (
    symbol              TEXT NOT NULL,
    ts                  TIMESTAMPTZ NOT NULL,
    source              TEXT NOT NULL,
    long_pct            DOUBLE PRECISION NOT NULL,
    short_pct           DOUBLE PRECISION NOT NULL,
    representativeness  TEXT NOT NULL,
    delay_minutes       INTEGER NOT NULL,
    PRIMARY KEY (symbol, ts, source)
);
SELECT create_hypertable('sentiment_snapshots', 'ts', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS cot_reports (
    symbol               TEXT NOT NULL,
    report_date          DATE NOT NULL,
    commercials_net      DOUBLE PRECISION NOT NULL,
    non_commercials_net  DOUBLE PRECISION NOT NULL,
    leveraged_funds_net  DOUBLE PRECISION,
    asset_managers_net   DOUBLE PRECISION,
    percentile_rank_3y   DOUBLE PRECISION,
    percentile_rank_5y   DOUBLE PRECISION,
    weekly_change        DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (symbol, report_date)
);

-- ---------- Data source health / audit ------------------------------------

CREATE TABLE IF NOT EXISTS data_sources (
    name         TEXT PRIMARY KEY,
    description  TEXT,
    category     TEXT NOT NULL,
    is_enabled   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS source_health (
    source        TEXT NOT NULL,
    ts            TIMESTAMPTZ NOT NULL,
    status        TEXT NOT NULL,
    latency_ms    INTEGER,
    message       TEXT,
    PRIMARY KEY (source, ts)
);

CREATE TABLE IF NOT EXISTS user_alert_configs (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              TEXT NOT NULL,
    instruments          TEXT[] NOT NULL DEFAULT '{}',
    min_score            DOUBLE PRECISION NOT NULL DEFAULT 50,
    min_severity         TEXT NOT NULL DEFAULT 'MEDIUM',
    active_hours_utc     JSONB,
    ignore_rollover      BOOLEAN DEFAULT TRUE,
    channels             TEXT[] NOT NULL DEFAULT '{}',
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    TEXT NOT NULL,
    kind       TEXT NOT NULL, -- telegram | email | discord | slack | webhook
    config     JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS replay_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label       TEXT NOT NULL,
    start_ts    TIMESTAMPTZ NOT NULL,
    end_ts      TIMESTAMPTZ NOT NULL,
    speed       DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    state       TEXT NOT NULL DEFAULT 'ready',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ts         TIMESTAMPTZ DEFAULT NOW(),
    actor      TEXT,
    action     TEXT NOT NULL,
    target     TEXT,
    payload    JSONB
);

-- ---------- Seed: default instruments -------------------------------------

INSERT INTO instruments (symbol, description, proxy_for, invert_for_spot, exchange) VALUES
    ('6E', 'Euro FX futures',        'EURUSD', FALSE, 'CME'),
    ('6B', 'British Pound futures',  'GBPUSD', FALSE, 'CME'),
    ('6J', 'Japanese Yen futures',   'USDJPY', TRUE,  'CME'),
    ('6A', 'Australian Dollar futures','AUDUSD', FALSE, 'CME'),
    ('6C', 'Canadian Dollar futures','USDCAD', TRUE,  'CME'),
    ('6S', 'Swiss Franc futures',    'USDCHF', TRUE,  'CME'),
    ('6N', 'New Zealand Dollar futures','NZDUSD', FALSE, 'CME')
ON CONFLICT (symbol) DO NOTHING;
