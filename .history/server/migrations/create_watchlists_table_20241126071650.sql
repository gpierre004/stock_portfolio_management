CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    date_added DATE NOT NULL,
    reason TEXT,
    ticker VARCHAR(100),
    userid INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekHigh52" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentBelow52WeekHigh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgClose" DOUBLE PRECISION NOT NULL DEFAULT 0,
    sector VARCHAR(100) NOT NULL DEFAULT '',
    "priceWhenAdded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceChange" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    interested BOOLEAN,
    metrics JSONB,
    industry VARCHAR(255)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_watchlists_userid ON watchlists(userid);
CREATE INDEX IF NOT EXISTS idx_watchlists_dateadded ON watchlists(date_added);
CREATE INDEX IF NOT EXISTS idx_watchlists_ticker ON watchlists(ticker);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_date ON watchlists(userid, date_added);
