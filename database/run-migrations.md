# Database Migration Instructions

## Issue Detected
The application is experiencing JSON parsing errors because the database schema is missing required columns. Specifically, the `country` column is missing from the `franchisees` table.

## Required Migrations

### 1. Add Country Column to Franchisees Table

In your Supabase SQL Editor, run:

```sql
-- Add country field to franchisees table
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';

-- Update existing franchisees with default country
UPDATE franchisees
SET country = 'United States'
WHERE country IS NULL;
```

### 2. Additional Schema Updates (if needed)

Also run these additional schema updates:

```sql
-- Add missing columns that might be expected by the frontend
ALTER TABLE franchisees
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS territory TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS owners JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "newTechSubmissions": {"email": true, "sms": false, "app": true},
  "mediaArchival": {"email": true, "sms": false, "app": false},
  "systemUpdates": {"email": true, "sms": false, "app": true},
  "marketingReports": {"email": true, "sms": false, "app": false},
  "emergencyAlerts": {"email": true, "sms": true, "app": true},
  "weeklyDigest": {"email": true, "sms": false, "app": false}
}'::jsonb;

-- Add missing columns to technicians table
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'franchisee', 'tech')),
  franchisee_id UUID REFERENCES franchisees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add missing API endpoints schemas
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('franchisee', 'tech')),
  franchisee_id UUID REFERENCES franchisees(id),
  tech_id UUID REFERENCES technicians(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## How to Run These Migrations

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migrations**
   - Copy and paste the SQL code above
   - Click "Run" to execute

3. **Verify the Changes**
   - Go to Table Editor
   - Check that the `franchisees` table now has the `country` column
   - Verify other new columns are present

## After Running Migrations

1. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Test the Application**
   - Navigate to `/admin/franchisees`
   - Verify that the table loads without errors
   - Test creating/editing franchisees

## Troubleshooting

If you still see errors after running migrations:

1. **Check the browser console** for specific error messages
2. **Check the server logs** in your terminal
3. **Verify all environment variables** are correctly set in `.env.local`
4. **Clear browser cache** and refresh the page

The application should work properly after these migrations are applied.