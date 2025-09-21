-- Create marketing_content table for managing and scheduling AI-generated posts
CREATE TABLE IF NOT EXISTS marketing_content (
  id SERIAL PRIMARY KEY,
  generated_content_id INTEGER REFERENCES generated_content(id) ON DELETE SET NULL,
  media_archive_id INTEGER REFERENCES media_archive(id) ON DELETE CASCADE,

  -- Content Details
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[], -- Array of hashtags
  mentions TEXT[], -- Array of mentions

  -- Platform & Scheduling
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', etc.
  post_type VARCHAR(50) DEFAULT 'image_post', -- 'image_post', 'story', 'reel', 'carousel', etc.
  scheduled_date TIMESTAMP WITH TIME ZONE,

  -- Status Management
  status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed', 'cancelled'
  approval_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'

  -- Assignment & Workflow
  assigned_to UUID, -- User ID of marketer assigned to this content
  created_by UUID, -- User ID who created this marketing content
  approved_by UUID, -- User ID who approved this content

  -- Engagement & Performance
  published_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT, -- URL of the published post
  engagement_metrics JSONB DEFAULT '{}', -- Store likes, comments, shares, etc.

  -- Additional Metadata
  campaign_name VARCHAR(255), -- Campaign this content belongs to
  target_audience TEXT, -- Description of target audience
  call_to_action VARCHAR(500), -- Specific CTA for this post
  notes TEXT, -- Internal notes for marketers

  -- Media Attachments
  additional_images TEXT[], -- Additional images beyond the main one
  video_url TEXT, -- Video attachment if applicable

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  CONSTRAINT valid_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  CONSTRAINT scheduled_date_future CHECK (scheduled_date IS NULL OR scheduled_date > created_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_content_generated_content_id ON marketing_content(generated_content_id);
CREATE INDEX IF NOT EXISTS idx_marketing_content_media_archive_id ON marketing_content(media_archive_id);
CREATE INDEX IF NOT EXISTS idx_marketing_content_platform ON marketing_content(platform);
CREATE INDEX IF NOT EXISTS idx_marketing_content_status ON marketing_content(status);
CREATE INDEX IF NOT EXISTS idx_marketing_content_approval_status ON marketing_content(approval_status);
CREATE INDEX IF NOT EXISTS idx_marketing_content_scheduled_date ON marketing_content(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_marketing_content_assigned_to ON marketing_content(assigned_to);
CREATE INDEX IF NOT EXISTS idx_marketing_content_campaign_name ON marketing_content(campaign_name);
CREATE INDEX IF NOT EXISTS idx_marketing_content_created_at ON marketing_content(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketing_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketing_content_timestamp
BEFORE UPDATE ON marketing_content
FOR EACH ROW
EXECUTE FUNCTION update_marketing_content_updated_at();

-- Enable Row Level Security
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Allow service role full access" ON marketing_content
  USING (true)
  WITH CHECK (true);

-- Optional: Create policies for different user roles
-- CREATE POLICY "Marketers can manage their assigned content" ON marketing_content
--   FOR ALL
--   USING (
--     assigned_to = auth.uid() OR
--     created_by = auth.uid() OR
--     auth.jwt() ->> 'role' = 'admin'
--   );

-- Add comments for documentation
COMMENT ON TABLE marketing_content IS 'Marketing content management and scheduling table for AI-generated posts';
COMMENT ON COLUMN marketing_content.generated_content_id IS 'Reference to the original AI-generated content';
COMMENT ON COLUMN marketing_content.title IS 'Title/headline for the marketing post';
COMMENT ON COLUMN marketing_content.platform IS 'Target social media platform';
COMMENT ON COLUMN marketing_content.post_type IS 'Type of post (image, story, reel, etc.)';
COMMENT ON COLUMN marketing_content.status IS 'Publishing status of the content';
COMMENT ON COLUMN marketing_content.approval_status IS 'Approval workflow status';
COMMENT ON COLUMN marketing_content.scheduled_date IS 'When the post should be published';
COMMENT ON COLUMN marketing_content.engagement_metrics IS 'Post performance data (likes, shares, etc.)';
COMMENT ON COLUMN marketing_content.campaign_name IS 'Marketing campaign this content belongs to';