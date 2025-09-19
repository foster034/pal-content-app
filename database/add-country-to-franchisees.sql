-- Add country field to franchisees table
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Update existing franchisees with default country
UPDATE franchisees
SET country = 'United States'
WHERE country IS NULL;