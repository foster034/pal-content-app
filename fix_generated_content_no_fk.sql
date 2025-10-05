-- Remove foreign key constraint on media_archive_id
-- since we're storing the ID for reference but don't need strict referential integrity

ALTER TABLE generated_content
DROP CONSTRAINT IF EXISTS generated_content_media_archive_id_fkey;

-- The media_archive_id will still be stored as BIGINT but without foreign key constraint
-- This allows flexibility since the media archive data structure may vary
