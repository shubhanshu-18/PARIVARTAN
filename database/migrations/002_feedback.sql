CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  user_type TEXT NOT NULL,
  category TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  recommendation TEXT,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_category_idx ON feedback (category);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback (status);
