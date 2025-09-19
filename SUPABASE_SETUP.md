# 🚀 Supabase Setup Guide for PAL Content App

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Already installed ✅
3. **Git**: Already installed ✅

## 🎯 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `pal-content-app`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
5. Click **"Create new project"**
6. Wait for setup to complete (~2 minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep this secret!)

### 3. Configure Environment Variables

1. Create `.env.local` file in your project root:
```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Other configurations...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste into the SQL editor
4. Click **"Run"** to execute the schema

This will create:
- ✅ **franchisees** table
- ✅ **technicians** table
- ✅ **job_submissions** table
- ✅ **job_reports** table
- ✅ **Row Level Security** policies
- ✅ **Sample data** for testing

### 5. Verify Database Setup

1. Go to **Table Editor** in Supabase
2. You should see 4 tables with sample data:
   - `franchisees` (2 records)
   - `technicians` (3 records)
   - `job_submissions` (3 records)
   - `job_reports` (empty, will populate when reports are generated)

### 6. Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/franchisee/marketing` (Job Pics & Approvals)
3. You should see the sample job submissions loaded from Supabase
4. Try approving a job to test report generation

## 🔒 Security Features

### Row Level Security (RLS)
Your database is secured with RLS policies that ensure:
- **Franchisees** can only see their own data
- **Technicians** can only access their franchisee's data
- **Cross-tenant data isolation** is enforced at the database level

### Multi-Tenant Architecture
Each franchisee operates in their own data silo:
```sql
-- Example: Franchisees can only see their own job submissions
CREATE POLICY "View job submissions" ON job_submissions
FOR SELECT USING (
  franchisee_id IN (
    SELECT id FROM franchisees WHERE auth.uid()::text = id::text
  )
);
```

## 📊 API Endpoints Now Available

### Job Submissions
- **GET** `/api/job-submissions` - Fetch all job submissions
- **POST** `/api/job-submissions` - Create new job submission

### Job Reports
- **POST** `/api/job-reports/generate` - Generate job report
- **POST** `/api/job-reports/send` - Send report to client

### Query Parameters
```typescript
// Get pending jobs for specific franchisee
GET /api/job-submissions?franchiseeId=550e8400-e29b-41d4-a716-446655440001&status=pending

// Get all approved jobs
GET /api/job-submissions?status=approved
```

## 🎨 Real-time Features

Supabase provides real-time subscriptions out of the box:

```typescript
// Example: Listen for job status changes
supabase
  .channel('job_submissions')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'job_submissions'
    },
    (payload) => {
      console.log('Job status changed:', payload)
      // Update UI in real-time
    }
  )
  .subscribe()
```

## 🚀 Next Steps

### 1. Authentication Setup
Add Supabase Auth for user login:
```bash
# Enable auth providers in Supabase dashboard
# Update RLS policies to use auth.uid()
```

### 2. File Storage
Store job photos in Supabase Storage:
```typescript
// Upload photos to Supabase bucket
const { data, error } = await supabase.storage
  .from('job-photos')
  .upload('before/photo.jpg', file)
```

### 3. Edge Functions
Deploy serverless functions for:
- Email notifications
- SMS sending
- Report generation
- Webhook handling

### 4. Production Deployment
1. Set production environment variables in Vercel
2. Update CORS settings in Supabase
3. Configure custom domain
4. Set up monitoring and alerts

## 🛠️ Troubleshooting

### Common Issues

**"relation does not exist" error**
- ✅ Make sure you ran the schema.sql file
- ✅ Check table names match exactly

**"Row Level Security" errors**
- ✅ Ensure RLS policies are created
- ✅ Verify user has proper permissions

**API connection errors**
- ✅ Check environment variables are correct
- ✅ Verify Supabase project is running
- ✅ Check network connectivity

### Getting Help

1. **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
2. **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Discord**: [discord.supabase.com](https://discord.supabase.com)

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Sample data visible in tables
- [ ] Job submissions loading in frontend
- [ ] API endpoints responding
- [ ] RLS policies working
- [ ] Real-time updates functioning

**🎉 Your PAL Content App is now powered by Supabase!**