-- Update existing analyses with correct score and violations count from their reports
-- This fixes the discrepancy between the analysis history and detailed results

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
