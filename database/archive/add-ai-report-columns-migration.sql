-- AI Report Columns Migration
-- Run this SQL in your Supabase SQL Editor to add the missing AI report functionality

-- Add AI report columns to job_submissions table
ALTER TABLE job_submissions
ADD COLUMN IF NOT EXISTS ai_report TEXT,
ADD COLUMN IF NOT EXISTS ai_report_generated_at TIMESTAMPTZ;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_submissions_ai_report_generated_at
ON job_submissions(ai_report_generated_at)
WHERE ai_report_generated_at IS NOT NULL;

-- Create index on ai_report for text search if needed
CREATE INDEX IF NOT EXISTS idx_job_submissions_ai_report_text
ON job_submissions USING gin(to_tsvector('english', ai_report))
WHERE ai_report IS NOT NULL;

-- Add comment to document the columns
COMMENT ON COLUMN job_submissions.ai_report IS 'Generated AI report content for the job submission';
COMMENT ON COLUMN job_submissions.ai_report_generated_at IS 'Timestamp when the AI report was generated';

-- Verify the migration was successful
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'job_submissions'
AND column_name IN ('ai_report', 'ai_report_generated_at')
ORDER BY column_name;