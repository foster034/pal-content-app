-- Add AI report columns to job_submissions table
-- This enables storing the AI-generated job report summaries

-- Add ai_report column to store the full AI-generated report
ALTER TABLE job_submissions
ADD COLUMN IF NOT EXISTS ai_report TEXT;

-- Add timestamp column to track when the AI report was generated
ALTER TABLE job_submissions
ADD COLUMN IF NOT EXISTS ai_report_generated_at TIMESTAMP WITH TIME ZONE;

-- Add index on ai_report_generated_at for faster queries
CREATE INDEX IF NOT EXISTS idx_job_submissions_ai_report_generated_at
ON job_submissions(ai_report_generated_at);

-- Update any existing job submissions to mark them for AI report generation
-- (Optional - uncomment if you want to retroactively generate reports)
-- UPDATE job_submissions
-- SET ai_report = NULL,
--     ai_report_generated_at = NULL
-- WHERE ai_report IS NULL;

-- View the updated table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'job_submissions'
    AND column_name IN ('ai_report', 'ai_report_generated_at')
ORDER BY
    ordinal_position;