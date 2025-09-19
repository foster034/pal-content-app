const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTables() {
  console.log('🚀 Creating franchisee photo management tables...');

  try {
    // Create franchisee_photos table
    const { error: photosError } = await supabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS franchisee_photos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          job_submission_id UUID REFERENCES job_submissions(id) ON DELETE CASCADE,
          franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE,
          technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
          photo_url TEXT NOT NULL,
          photo_type VARCHAR(20) CHECK (photo_type IN ('before', 'after', 'process')) NOT NULL,
          service_category VARCHAR(50),
          service_type VARCHAR(100),
          service_location TEXT,
          service_date DATE,
          job_description TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'flagged')),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          reviewed_by UUID REFERENCES profiles(id),
          review_notes TEXT,
          tech_notified BOOLEAN DEFAULT FALSE,
          notification_sent_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (photosError) {
      console.log('❌ Error creating franchisee_photos:', photosError);
    } else {
      console.log('✅ franchisee_photos table created');
    }

    // Create notifications table
    const { error: notifError } = await supabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          user_type VARCHAR(20) CHECK (user_type IN ('tech', 'franchisee', 'admin')),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(30) CHECK (type IN ('photo_submitted', 'photo_approved', 'photo_denied', 'photo_flagged', 'system')),
          related_id UUID,
          related_type VARCHAR(50),
          read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (notifError) {
      console.log('❌ Error creating notifications:', notifError);
    } else {
      console.log('✅ notifications table created');
    }

    // Create franchisee notification settings
    const { error: settingsError } = await supabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS franchisee_notification_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE UNIQUE,
          email_on_photo_submission BOOLEAN DEFAULT TRUE,
          email_on_tech_activity BOOLEAN DEFAULT TRUE,
          email_daily_summary BOOLEAN DEFAULT FALSE,
          notify_photo_submission BOOLEAN DEFAULT TRUE,
          notify_urgent_items BOOLEAN DEFAULT TRUE,
          quiet_hours_start TIME,
          quiet_hours_end TIME,
          weekend_notifications BOOLEAN DEFAULT TRUE,
          notification_email VARCHAR(255),
          phone_notifications BOOLEAN DEFAULT FALSE,
          notification_phone VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (settingsError) {
      console.log('❌ Error creating notification settings:', settingsError);
    } else {
      console.log('✅ franchisee_notification_settings table created');
    }

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

createTables();