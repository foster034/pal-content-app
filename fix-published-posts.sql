-- Fix published posts that are missing franchisee_id
-- This updates all published posts to include the franchisee_id from their associated media archive

UPDATE published_posts pp
SET franchisee_id = ma.franchisee_id
FROM media_archive ma
WHERE pp.media_archive_id = ma.id
  AND pp.franchisee_id IS NULL;
