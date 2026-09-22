-- Supplier Discovery additive migration. Apply through the existing DATABASE_URL.
CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  address TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  delivery_available BOOLEAN,
  source TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS suppliers_location_idx ON suppliers (lat, lng);
CREATE INDEX IF NOT EXISTS suppliers_category_idx ON suppliers (category);
