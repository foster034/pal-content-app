-- Create table for storing Google My Business OAuth tokens
CREATE TABLE IF NOT EXISTS gmb_oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,

    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Google account info
    google_account_id TEXT,
    google_email TEXT,

    -- GMB locations associated with this account
    locations JSONB DEFAULT '[]'::jsonb,

    -- Default location for posting (franchisee can select from available locations)
    selected_location_name TEXT,

    -- Connection status
    is_active BOOLEAN DEFAULT TRUE,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one active connection per franchisee
    CONSTRAINT unique_active_franchisee
        EXCLUDE (franchisee_id WITH =)
        WHERE (is_active = true)
);

-- Create index for quick lookups
CREATE INDEX idx_gmb_oauth_franchisee_id ON gmb_oauth_tokens(franchisee_id);
CREATE INDEX idx_gmb_oauth_active ON gmb_oauth_tokens(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_gmb_oauth_tokens_updated_at
    BEFORE UPDATE ON gmb_oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE gmb_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Franchisees can only see their own tokens
CREATE POLICY "Franchisees can view own GMB tokens"
    ON gmb_oauth_tokens FOR SELECT
    USING (franchisee_id = auth.uid()::uuid);

-- Admins can view all tokens
CREATE POLICY "Admins can view all GMB tokens"
    ON gmb_oauth_tokens FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can insert/update/delete
CREATE POLICY "Only system can modify GMB tokens"
    ON gmb_oauth_tokens FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMENT ON TABLE gmb_oauth_tokens IS 'Stores Google My Business OAuth tokens for franchisees to enable automatic posting';
COMMENT ON COLUMN gmb_oauth_tokens.expires_at IS 'When the access_token expires (typically 1 hour from creation)';
COMMENT ON COLUMN gmb_oauth_tokens.locations IS 'JSON array of GMB locations associated with this account';
