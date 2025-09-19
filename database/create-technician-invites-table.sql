-- Create technician_invites table to track invitation history
CREATE TABLE IF NOT EXISTS technician_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
    franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    login_code VARCHAR(10),
    email_sent BOOLEAN DEFAULT FALSE,
    magic_link_sent BOOLEAN DEFAULT FALSE,
    setup_url TEXT,
    setup_completed_at TIMESTAMPTZ,
    first_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_technician_invites_technician_id ON technician_invites(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_invites_franchisee_id ON technician_invites(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_technician_invites_invited_at ON technician_invites(invited_at);

-- Add RLS (Row Level Security)
ALTER TABLE technician_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Franchisees can view their technician invites" ON technician_invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'franchisee' AND profiles.franchisee_id = technician_invites.franchisee_id)
        )
    );

CREATE POLICY "Admins can view all technician invites" ON technician_invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Franchisees can insert invites for their technicians" ON technician_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'franchisee' AND profiles.franchisee_id = technician_invites.franchisee_id)
        )
    );

CREATE POLICY "Admins can insert all technician invites" ON technician_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );