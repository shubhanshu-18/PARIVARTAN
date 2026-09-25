CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_key TEXT NOT NULL,
  scale TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  state TEXT,
  district TEXT,
  established INTEGER,
  monthly_revenue NUMERIC,
  employees INTEGER,
  rating NUMERIC
);

CREATE TABLE IF NOT EXISTS districts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  population INTEGER,
  rural_percent NUMERIC,
  literacy_rate NUMERIC,
  avg_household_income NUMERIC,
  top_crops JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (name, state)
);

CREATE TABLE IF NOT EXISTS market_benchmarks (
  category_key TEXT PRIMARY KEY,
  demand_index NUMERIC NOT NULL,
  saturation NUMERIC NOT NULL,
  avg_ticket_size NUMERIC,
  growth_rate NUMERIC,
  margin_percent NUMERIC
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  opportunity_score NUMERIC,
  feasibility_score NUMERIC,
  project_cost NUMERIC,
  business_category TEXT,
  target_scheme TEXT,
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS businesses_location_idx
  ON businesses (lat, lng);
CREATE INDEX IF NOT EXISTS assessments_created_at_idx
  ON assessments (created_at DESC);

CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL, category TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  address TEXT, village TEXT, district TEXT, state TEXT,
  lat DOUBLE PRECISION NOT NULL, lng DOUBLE PRECISION NOT NULL,
  phone TEXT, website TEXT, delivery_available BOOLEAN,
  source TEXT NOT NULL, verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS suppliers_location_idx ON suppliers (lat, lng);
CREATE INDEX IF NOT EXISTS suppliers_category_idx ON suppliers (category);

CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT,
  user_type TEXT NOT NULL, category TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5), message TEXT NOT NULL,
  recommendation TEXT, consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_category_idx ON feedback (category);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback (status);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_login TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
