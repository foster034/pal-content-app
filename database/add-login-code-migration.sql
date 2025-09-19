-- Migration: Add login_code field to technicians table
-- Run this in your Supabase SQL editor

-- Add login_code column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='technicians' AND column_name='login_code'
    ) THEN
        ALTER TABLE technicians ADD COLUMN login_code TEXT;

        -- Generate login codes for existing technicians using a subquery
        UPDATE technicians
        SET login_code = subquery.new_code
        FROM (
            SELECT id, 'TEMP' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 2, '0') as new_code
            FROM technicians
            WHERE login_code IS NULL
        ) AS subquery
        WHERE technicians.id = subquery.id;

        -- Add unique constraint
        ALTER TABLE technicians ADD CONSTRAINT unique_technician_login_code UNIQUE (login_code);

        RAISE NOTICE 'login_code column added successfully';
    ELSE
        RAISE NOTICE 'login_code column already exists';
    END IF;
END $$;