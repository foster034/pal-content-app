-- Add 'archived' value to the status check constraint for franchisee_photos table

-- First, drop the existing check constraint
ALTER TABLE franchisee_photos DROP CONSTRAINT IF EXISTS franchisee_photos_status_check;

-- Add new check constraint with 'archived' included
ALTER TABLE franchisee_photos ADD CONSTRAINT franchisee_photos_status_check
  CHECK (status IN ('pending', 'approved', 'denied', 'flagged', 'archived'));
