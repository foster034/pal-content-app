-- Simple bucket creation without RLS policies (which require owner permissions)
-- Just create the buckets - security will be handled by service role in API

-- Create job-photos bucket for tech submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create customer-photos bucket for customer submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-photos', 'customer-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create job-reports bucket for generated PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-reports', 'job-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Verify buckets were created
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('job-photos', 'customer-photos', 'job-reports');