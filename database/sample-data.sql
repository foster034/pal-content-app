-- Insert sample franchisees
INSERT INTO franchisees (id, business_name, phone, email, website, google_review_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Pop-A-Lock Barrie', '+1 (705) 555-0123', 'barrie@popalock.com', 'https://barrie.popalock.com', 'https://g.page/popalock-barrie/review'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Pop-A-Lock Orillia', '+1 (705) 555-0156', 'orillia@popalock.com', 'https://orillia.popalock.com', 'https://g.page/popalock-orillia/review');

-- Insert sample technicians
INSERT INTO technicians (id, name, email, phone, image_url, rating, franchisee_id) VALUES
    ('660f9500-f39c-52e5-b827-557766551001', 'Alex Rodriguez', 'alex@popalock.com', '+1 (705) 555-0124', 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg', 4.8, '550e8400-e29b-41d4-a716-446655440001'),
    ('660f9500-f39c-52e5-b827-557766551002', 'Sarah Wilson', 'sarah@popalock.com', '+1 (705) 555-0125', 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg', 4.9, '550e8400-e29b-41d4-a716-446655440001'),
    ('660f9500-f39c-52e5-b827-557766551003', 'Mike Thompson', 'mike@popalock.com', '+1 (705) 555-0126', 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_kk8v2m.jpg', 4.7, '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample job submissions
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