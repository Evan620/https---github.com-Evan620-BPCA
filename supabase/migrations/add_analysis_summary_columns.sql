-- Add score and violations columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS violations INTEGER;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(score);
CREATE INDEX IF NOT EXISTS idx_analyses_violations ON analyses(violations);
