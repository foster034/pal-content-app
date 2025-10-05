-- Create table for scheduled posts
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    media_archive_id BIGINT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    post_type VARCHAR(50),
    scheduled_date TIMESTAMP NOT NULL,
    scheduled_time TIME,
    hashtags TEXT[],
    mentions TEXT[],
    franchisee_id UUID,
    created_by UUID,
    status VARCHAR(20) DEFAULT 'scheduled',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for published posts
CREATE TABLE IF NOT EXISTS published_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,
    generated_content_id UUID REFERENCES generated_content(id) ON DELETE SET NULL,
    media_archive_id BIGINT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    post_type VARCHAR(50),
    published_at TIMESTAMP NOT NULL,
    platform_post_id VARCHAR(255),
    platform_url TEXT,
    hashtags TEXT[],
    mentions TEXT[],
    franchisee_id UUID,
    published_by UUID,
    engagement_metrics JSONB,
    status VARCHAR(20) DEFAULT 'published',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes (drop first if they exist to avoid conflicts)
DROP INDEX IF EXISTS idx_scheduled_posts_date;
DROP INDEX IF EXISTS idx_scheduled_posts_platform;
DROP INDEX IF EXISTS idx_scheduled_posts_status;
DROP INDEX IF EXISTS idx_scheduled_posts_franchisee;
DROP INDEX IF EXISTS idx_published_posts_date;
DROP INDEX IF EXISTS idx_published_posts_platform;
DROP INDEX IF EXISTS idx_published_posts_franchisee;
DROP INDEX IF EXISTS idx_published_posts_scheduled;

CREATE INDEX idx_scheduled_posts_date ON scheduled_posts(scheduled_date);
CREATE INDEX idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_franchisee ON scheduled_posts(franchisee_id);

CREATE INDEX idx_published_posts_date ON published_posts(published_at);
CREATE INDEX idx_published_posts_platform ON published_posts(platform);
CREATE INDEX idx_published_posts_franchisee ON published_posts(franchisee_id);
CREATE INDEX idx_published_posts_scheduled ON published_posts(scheduled_post_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at ON scheduled_posts;
DROP TRIGGER IF EXISTS update_published_posts_updated_at ON published_posts;

CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_published_posts_updated_at BEFORE UPDATE ON published_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
