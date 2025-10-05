-- Add new content-focused fields to job_submissions table
ALTER TABLE job_submissions
ADD COLUMN customer_concern TEXT,
ADD COLUMN customer_reaction TEXT,
ADD COLUMN special_challenges TEXT;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN job_submissions.customer_concern IS 'What issue was the customer experiencing? Helps frame the story for marketing content.';
COMMENT ON COLUMN job_submissions.customer_reaction IS 'How did the customer react to the service? Builds credibility through customer satisfaction.';
COMMENT ON COLUMN job_submissions.special_challenges IS 'Any unique difficulties or interesting aspects of this job? Adds storytelling value to marketing content.';
