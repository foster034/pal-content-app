-- Add AI report columns to job_submissions table
-- This enables storing AI-generated job reports and their generation timestamps

ALTER TABLE job_submissions
ADD COLUMN ai_report TEXT,
ADD COLUMN ai_report_generated_at TIMESTAMPTZ;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_submissions_ai_report_generated_at
ON job_submissions(ai_report_generated_at)
WHERE ai_report_generated_at IS NOT NULL;

-- Add comment to document the columns
COMMENT ON COLUMN job_submissions.ai_report IS 'AI-generated comprehensive job report content';
COMMENT ON COLUMN job_submissions.ai_report_generated_at IS 'Timestamp when the AI report was generated';