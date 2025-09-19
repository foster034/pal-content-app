const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  console.log('🚀 Creating franchisee photo management tables...');

  try {
    // Create franchisee_photos table using direct SQL execution
    console.log('Creating franchisee_photos table...');
    const { error: photosError } = await supabase
      .from('_sql')
      .select('*')
      .limit(0);

    if (photosError) {
      console.log('⚠️ Could not execute SQL directly through API. Please run the SQL manually in Supabase dashboard:');
      console.log('\n--- Copy and paste this into Supabase SQL Editor ---\n');

      const sql = `
-- Create franchisee_photos table to track tech photo submissions
CREATE TABLE IF NOT EXISTS franchisee_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_submission_id UUID REFERENCES job_submissions(id) ON DELETE CASCADE,
    franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,

    -- Photo metadata
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(20) CHECK (photo_type IN ('before', 'after', 'process')) NOT NULL,

    -- Job details (denormalized for easier querying)
    service_category VARCHAR(50),
    service_type VARCHAR(100),
    service_location TEXT,
    service_date DATE,
    job_description TEXT,

    -- Approval workflow
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'flagged')),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,

    -- Notification tracking
    tech_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchisee_photos_franchisee_id ON franchisee_photos(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_franchisee_photos_technician_id ON franchisee_photos(technician_id);
CREATE INDEX IF NOT EXISTS idx_franchisee_photos_status ON franchisee_photos(status);
CREATE INDEX IF NOT EXISTS idx_franchisee_photos_created_at ON franchisee_photos(created_at);
CREATE INDEX IF NOT EXISTS idx_franchisee_photos_job_submission_id ON franchisee_photos(job_submission_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_type VARCHAR(20) CHECK (user_type IN ('tech', 'franchisee', 'admin')),

    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) CHECK (type IN ('photo_submitted', 'photo_approved', 'photo_denied', 'photo_flagged', 'system')),

    -- Related data
    related_id UUID, -- Can reference job_submissions, franchisee_photos, etc.
    related_type VARCHAR(50),

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create franchisee notification settings table
CREATE TABLE IF NOT EXISTS franchisee_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE UNIQUE,

    -- Email notifications
    email_on_photo_submission BOOLEAN DEFAULT TRUE,
    email_on_tech_activity BOOLEAN DEFAULT TRUE,
    email_daily_summary BOOLEAN DEFAULT FALSE,

    -- In-app notifications
    notify_photo_submission BOOLEAN DEFAULT TRUE,
    notify_urgent_items BOOLEAN DEFAULT TRUE,

    -- Notification timing
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    weekend_notifications BOOLEAN DEFAULT TRUE,

    -- Contact preferences
    notification_email VARCHAR(255),
    phone_notifications BOOLEAN DEFAULT FALSE,
    notification_phone VARCHAR(20),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_franchisee_photos_updated_at BEFORE UPDATE ON franchisee_photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchisee_notification_settings_updated_at BEFORE UPDATE ON franchisee_notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

      console.log(sql);
      console.log('\n--- End of SQL ---\n');
      console.log('After running the SQL in Supabase, the tables will be ready and the job submission API will start working properly.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

createTables();