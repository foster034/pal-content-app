-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Franchisees table
CREATE TABLE franchisees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    website TEXT,
    google_review_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technicians table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    image_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    role TEXT DEFAULT 'technician' CHECK (role IN ('technician', 'lead_tech', 'supervisor')),
    franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job submissions table
CREATE TABLE job_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,

    -- Client information
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    client_preferred_contact TEXT DEFAULT 'sms' CHECK (client_preferred_contact IN ('phone', 'email', 'sms')),
    client_consent_contact BOOLEAN DEFAULT FALSE,
    client_consent_share BOOLEAN DEFAULT FALSE,

    -- Service details
    service_category TEXT NOT NULL,
    service_type TEXT NOT NULL,
    service_location TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_duration INTEGER NOT NULL, -- in minutes
    satisfaction_rating INTEGER NOT NULL CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    description TEXT NOT NULL,

    -- Job status and media
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    before_photos TEXT[] DEFAULT '{}',
    after_photos TEXT[] DEFAULT '{}',
    process_photos TEXT[] DEFAULT '{}',

    -- Report tracking
    report_id TEXT,
    report_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job reports table (for tracking sent reports)
CREATE TABLE job_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_submission_id UUID NOT NULL REFERENCES job_submissions(id) ON DELETE CASCADE,
    report_id TEXT NOT NULL UNIQUE,
    shareable_url TEXT NOT NULL,
    sent_to_client BOOLEAN DEFAULT FALSE,
    sent_method TEXT CHECK (sent_method IN ('phone', 'email', 'sms')),
    sent_at TIMESTAMP WITH TIME ZONE,
    custom_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_job_submissions_technician_id ON job_submissions(technician_id);
CREATE INDEX idx_job_submissions_franchisee_id ON job_submissions(franchisee_id);
CREATE INDEX idx_job_submissions_status ON job_submissions(status);
CREATE INDEX idx_job_submissions_created_at ON job_submissions(created_at DESC);
CREATE INDEX idx_technicians_franchisee_id ON technicians(franchisee_id);
CREATE INDEX idx_job_reports_job_submission_id ON job_reports(job_submission_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_franchisees_updated_at BEFORE UPDATE ON franchisees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_submissions_updated_at BEFORE UPDATE ON job_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE franchisees ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;

-- Policies for franchisees (can only see their own data)
CREATE POLICY "Franchisees can view own data" ON franchisees
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Franchisees can update own data" ON franchisees
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies for technicians (can only see their franchisee's data)
CREATE POLICY "Technicians can view franchisee technicians" ON technicians
    FOR SELECT USING (
        franchisee_id IN (
            SELECT id FROM franchisees WHERE auth.uid()::text = id::text
        )
    );

CREATE POLICY "Franchisees can manage their technicians" ON technicians
    FOR ALL USING (
        franchisee_id IN (
            SELECT id FROM franchisees WHERE auth.uid()::text = id::text
        )
    );

-- Policies for job submissions
CREATE POLICY "View job submissions" ON job_submissions
    FOR SELECT USING (
        franchisee_id IN (
            SELECT id FROM franchisees WHERE auth.uid()::text = id::text
        ) OR
        technician_id IN (
            SELECT id FROM technicians WHERE auth.uid()::text = id::text
        )
    );

CREATE POLICY "Create job submissions" ON job_submissions
    FOR INSERT WITH CHECK (
        technician_id IN (
            SELECT id FROM technicians WHERE auth.uid()::text = id::text
        )
    );

CREATE POLICY "Update job submissions" ON job_submissions
    FOR UPDATE USING (
        franchisee_id IN (
            SELECT id FROM franchisees WHERE auth.uid()::text = id::text
        ) OR
        technician_id IN (
            SELECT id FROM technicians WHERE auth.uid()::text = id::text
        )
    );

-- Policies for job reports
CREATE POLICY "View job reports" ON job_reports
    FOR SELECT USING (
        job_submission_id IN (
            SELECT id FROM job_submissions WHERE
            franchisee_id IN (
                SELECT id FROM franchisees WHERE auth.uid()::text = id::text
            )
        )
    );

CREATE POLICY "Manage job reports" ON job_reports
    FOR ALL USING (
        job_submission_id IN (
            SELECT id FROM job_submissions WHERE
            franchisee_id IN (
                SELECT id FROM franchisees WHERE auth.uid()::text = id::text
            )
        )
    );

-- Insert sample data
INSERT INTO franchisees (id, business_name, phone, email, website, google_review_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Pop-A-Lock Barrie', '+1 (705) 555-0123', 'barrie@popalock.com', 'https://barrie.popalock.com', 'https://g.page/popalock-barrie/review'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Pop-A-Lock Orillia', '+1 (705) 555-0156', 'orillia@popalock.com', 'https://orillia.popalock.com', 'https://g.page/popalock-orillia/review');

INSERT INTO technicians (id, name, email, phone, image_url, rating, franchisee_id) VALUES
    ('660f9500-f39c-52e5-b827-557766551001', 'Alex Rodriguez', 'alex@popalock.com', '+1 (705) 555-0124', 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg', 4.8, '550e8400-e29b-41d4-a716-446655440001'),
    ('660f9500-f39c-52e5-b827-557766551002', 'Sarah Wilson', 'sarah@popalock.com', '+1 (705) 555-0125', 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg', 4.9, '550e8400-e29b-41d4-a716-446655440001'),
    ('660f9500-f39c-52e5-b827-557766551003', 'Mike Thompson', 'mike@popalock.com', '+1 (705) 555-0126', 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_kk8v2m.jpg', 4.7, '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO job_submissions (
    technician_id, franchisee_id, client_name, client_phone, client_email,
    client_preferred_contact, client_consent_contact, client_consent_share,
    service_category, service_type, service_location, service_date,
    service_duration, satisfaction_rating, description, status,
    before_photos, after_photos, process_photos
) VALUES
    (
        '660f9500-f39c-52e5-b827-557766551001',
        '550e8400-e29b-41d4-a716-446655440001',
        'John Smith', '+1 (705) 555-0123', 'john.smith@email.com',
        'sms', true, true,
        'Automotive', 'Car Key Replacement', '123 Main St, Barrie, ON L4M 1A1', '2025-09-13',
        45, 5, 'Successfully cut and programmed new key fob for 2018 Ford F-150. Verified all functions including remote start, door locks, and trunk access. Customer very satisfied with prompt service.',
        'pending',
        ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
        ARRAY['https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop'],
        ARRAY['https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=300&h=200&fit=crop']
    ),
    (
        '660f9500-f39c-52e5-b827-557766551002',
        '550e8400-e29b-41d4-a716-446655440001',
        'Emily Davis', '+1 (705) 555-0156', 'emily.davis@email.com',
        'email', true, false,
        'Residential', 'Lock Rekey Service', '456 Oak Avenue, Barrie, ON L4M 2B2', '2025-09-11',
        30, 5, 'Rekeyed front and back door locks for new homeowner. Provided 4 new keys and tested all locks for proper operation.',
        'pending',
        ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
        ARRAY['https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop'],
        ARRAY['https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=200&fit=crop']
    ),
    (
        '660f9500-f39c-52e5-b827-557766551003',
        '550e8400-e29b-41d4-a716-446655440002',
        'Robert Wilson', '+1 (705) 555-0127', 'robert.wilson@email.com',
        'phone', true, true,
        'Commercial', 'Master Key System Install', '789 Business Blvd, Barrie, ON L4M 3C3', '2025-09-10',
        120, 4, 'Installed comprehensive master key system for office building. Set up 15 individual locks with master key access for management.',
        'approved',
        ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
        ARRAY['https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=300&fit=crop'],
        ARRAY['https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=200&fit=crop']
    );