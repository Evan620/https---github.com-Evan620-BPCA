-- Step 1: Add score and violations columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS violations INTEGER;

-- Step 2: Update existing analyses with correct score and violations count from their reports
UPDATE analyses
SET 
    score = (reports.json_report->'overall_assessment'->>'compliance_score')::numeric,
    violations = (
        COALESCE(jsonb_array_length(reports.json_report->'violations'), 0) + 
        COALESCE(jsonb_array_length(reports.json_report->'warnings'), 0)
    )
FROM reports
WHERE analyses.id = reports.analysis_id
  AND analyses.status = 'completed'
  AND reports.json_report IS NOT NULL;

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(score);
CREATE INDEX IF NOT EXISTS idx_analyses_violations ON analyses(violations);
