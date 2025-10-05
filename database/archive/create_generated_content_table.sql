-- Create table for storing generated content
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    media_archive_id UUID REFERENCES media_archive(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50), -- 'social_media', 'blog', 'caption', etc.
    platform VARCHAR(50), -- 'facebook', 'instagram', 'twitter', etc.
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'published', 'rejected'
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    metadata JSONB, -- Store additional metadata like hashtags, mentions, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_generated_content_photo_id ON generated_content(photo_id);
CREATE INDEX idx_generated_content_media_archive_id ON generated_content(media_archive_id);
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_generated_content_generated_at ON generated_content(generated_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_content_timestamp
BEFORE UPDATE ON generated_content
FOR EACH ROW
EXECUTE FUNCTION update_generated_content_updated_at();