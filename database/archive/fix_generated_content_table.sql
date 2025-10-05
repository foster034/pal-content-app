-- Fix generated_content table to support media_archive_id as integer
-- and make photo_id nullable

-- Step 1: Make photo_id nullable (remove NOT NULL constraint)
ALTER TABLE generated_content
ALTER COLUMN photo_id DROP NOT NULL;

-- Step 2: Drop the existing media_archive_id column (UUID type)
ALTER TABLE generated_content
DROP COLUMN IF EXISTS media_archive_id;

-- Step 3: Add media_archive_id as BIGINT to match media_archive.id type
ALTER TABLE generated_content
ADD COLUMN media_archive_id BIGINT REFERENCES media_archive(id) ON DELETE SET NULL;

-- Step 4: Recreate the index
DROP INDEX IF EXISTS idx_generated_content_media_archive_id;
CREATE INDEX idx_generated_content_media_archive_id ON generated_content(media_archive_id);

-- Step 5: Add constraint to ensure at least one ID is provided
ALTER TABLE generated_content
ADD CONSTRAINT check_has_source_id CHECK (
    photo_id IS NOT NULL OR media_archive_id IS NOT NULL
);
