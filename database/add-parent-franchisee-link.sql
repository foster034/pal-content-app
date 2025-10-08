-- Add parent_franchisee_id to link franchisees together
-- This allows multi-location owners to have separate franchisee accounts that are grouped

-- Add parent_franchisee_id column (nullable, self-referencing foreign key)
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS parent_franchisee_id UUID REFERENCES franchisees(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_franchisees_parent_id ON franchisees(parent_franchisee_id);

-- Add a helpful comment
COMMENT ON COLUMN franchisees.parent_franchisee_id IS 'Links this franchisee to a parent franchisee account for multi-location owners. Each franchisee has their own login but can be grouped together.';

-- Remove the owners JSONB column if it exists (it's being replaced with proper relationships)
-- Uncomment if you want to remove it:
-- ALTER TABLE franchisees DROP COLUMN IF EXISTS owners;

SELECT 'Parent franchisee linking added successfully!' AS result;
