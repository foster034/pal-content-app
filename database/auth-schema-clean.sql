-- Clear existing demo data
DELETE FROM job_reports;
DELETE FROM job_submissions;
DELETE FROM technicians;
DELETE FROM franchisees;

-- Create user profiles table to extend Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'tech' CHECK (role IN ('admin', 'franchisee', 'tech')),
    franchisee_id UUID REFERENCES franchisees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update franchisees table to work with auth
ALTER TABLE franchisees DROP CONSTRAINT IF EXISTS franchisees_email_key;
ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update technicians table to work with auth
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Franchisees can view own data" ON franchisees;
DROP POLICY IF EXISTS "Franchisees can update own data" ON franchisees;
DROP POLICY IF EXISTS "Technicians can view franchisee technicians" ON technicians;
DROP POLICY IF EXISTS "Franchisees can manage their technicians" ON technicians;
DROP POLICY IF EXISTS "Technicians can view own profile" ON technicians;
DROP POLICY IF EXISTS "View job submissions" ON job_submissions;
DROP POLICY IF EXISTS "Create job submissions" ON job_submissions;
DROP POLICY IF EXISTS "Update job submissions" ON job_submissions;
DROP POLICY IF EXISTS "View job reports" ON job_reports;
DROP POLICY IF EXISTS "Manage job reports" ON job_reports;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Updated RLS policies for franchisees (now linked to auth users)
CREATE POLICY "Franchisees can view own data" ON franchisees
    FOR SELECT USING (
        auth.uid() = owner_id OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Franchisees can update own data" ON franchisees
    FOR UPDATE USING (auth.uid() = owner_id);

-- Updated RLS policies for technicians
CREATE POLICY "Technicians can view own profile" ON technicians
    FOR SELECT USING (
        auth.uid() = user_id OR
        franchisee_id IN (
            SELECT id FROM franchisees WHERE owner_id = auth.uid()
        ) OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Franchisees and admins can manage technicians" ON technicians
    FOR ALL USING (
        franchisee_id IN (
            SELECT id FROM franchisees WHERE owner_id = auth.uid()
        ) OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Updated RLS policies for job submissions
CREATE POLICY "View job submissions" ON job_submissions
    FOR SELECT USING (
        -- Technicians can see their own submissions
        technician_id IN (
            SELECT id FROM technicians WHERE user_id = auth.uid()
        ) OR
        -- Franchisees can see their franchise's submissions
        franchisee_id IN (
            SELECT id FROM franchisees WHERE owner_id = auth.uid()
        ) OR
        -- Admins can see all
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Create job submissions" ON job_submissions
    FOR INSERT WITH CHECK (
        -- Only technicians can create submissions for themselves
        technician_id IN (
            SELECT id FROM technicians WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Update job submissions" ON job_submissions
    FOR UPDATE USING (
        -- Franchisees can update their franchise's submissions
        franchisee_id IN (
            SELECT id FROM franchisees WHERE owner_id = auth.uid()
        ) OR
        -- Admins can update all
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Updated RLS policies for job reports
CREATE POLICY "View job reports" ON job_reports
    FOR SELECT USING (
        job_submission_id IN (
            SELECT id FROM job_submissions WHERE
            franchisee_id IN (
                SELECT id FROM franchisees WHERE owner_id = auth.uid()
            ) OR
            technician_id IN (
                SELECT id FROM technicians WHERE user_id = auth.uid()
            )
        ) OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Manage job reports" ON job_reports
    FOR ALL USING (
        job_submission_id IN (
            SELECT id FROM job_submissions WHERE
            franchisee_id IN (
                SELECT id FROM franchisees WHERE owner_id = auth.uid()
            )
        ) OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'tech')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_franchisee_id ON profiles(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_franchisees_owner_id ON franchisees(owner_id);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON technicians(user_id);

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access franchisee data
CREATE OR REPLACE FUNCTION public.can_access_franchisee(franchisee_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM franchisees
    WHERE id = franchisee_id
    AND (
      owner_id = auth.uid() OR
      auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;