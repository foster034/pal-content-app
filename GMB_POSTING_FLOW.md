# GMB Posting Flow - Complete Guide

## Overview

This document explains the complete flow for posting content to Google My Business (GMB) using the PAL Content App with manager-based access.

---

## 🔧 Setup Steps

### 1. Admin Configuration
**Location**: Admin > Settings > General Tab

1. Set the **GMB Manager Email** (e.g., `Foster_034@hotmail.com`)
2. Click **Save Settings**
3. Copy the email template provided to send to franchisees

### 2. Franchisee Grants Manager Access
**Franchisees must:**

1. Go to [https://business.google.com](https://business.google.com)
2. Click **"Users"** in the left sidebar
3. Click **"Add users"**
4. Enter the admin email: `Foster_034@hotmail.com`
5. Select role: **Manager**
6. Click **"Invite"**

### 3. Admin Accepts Invitation
1. Check email for GMB manager invitation
2. Click the invitation link
3. Accept the manager role
4. ✅ You now have access to post to that franchisee's GMB!

### 4. Franchisee Configures GMB Location ID
**Location**: Franchisee > Settings > GMB Location Settings Card

**Important**: This step enables **direct posting** to their GMB without needing to select from dropdown!

1. Go to [https://business.google.com](https://business.google.com)
2. Select their business
3. Look at the browser URL
4. Copy the number after `/l/`
   - Example: `business.google.com/posts/l/12345678901234567890`
   - The Location ID is: `12345678901234567890`
5. Paste the Location ID in the **GMB Location ID** field
6. Click **Save Location ID**

---

## 📝 Admin Posting Flow

### Option A: Franchisee HAS Configured Location ID (Recommended)

When you click the orange GMB pin button (📍) on an approved photo:

1. **System automatically**:
   - Fetches the franchisee's GMB Location ID from database
   - Opens directly to `https://business.google.com/posts/l/{location_id}`
   - Copies photo URL + caption to clipboard

2. **Alert shows**:
   ```
   ✅ Opening [Franchisee Name]'s GMB Posts!

   📝 Instructions:
   1. Click "Create post" button
   2. Paste photo URL (already copied!):
      https://...photo-url...
   3. Add caption: [job description]
   4. Click "Publish"

   💡 Photo URL and caption copied to clipboard!
   ```

3. **You simply**:
   - Click "Create post" in GMB
   - Paste content (Ctrl+V / Cmd+V)
   - Click "Publish"

**This is the fastest method!** ⚡

### Option B: Franchisee Has NOT Configured Location ID (Fallback)

When you click the orange GMB pin button (📍):

1. **System**:
   - Opens general GMB posts page: `https://business.google.com/posts`
   - Copies photo URL + caption to clipboard

2. **Alert shows**:
   ```
   ✅ Opening Google My Business Posts!

   ⚠️ [Franchisee Name] hasn't configured their GMB Location ID yet.

   📝 Instructions:
   1. Select "[Franchisee Name]" from the business dropdown
   2. Click "Create post" button
   3. Paste photo URL (already copied!):
      https://...photo-url...
   4. Add caption: [job description]
   5. Click "Publish"

   💡 Photo URL and caption copied to clipboard!

   📌 Ask [Franchisee Name] to add their GMB Location ID in Settings for direct posting.
   ```

3. **You must**:
   - Select franchisee from dropdown (extra step)
   - Click "Create post"
   - Paste content
   - Click "Publish"

---

## 🗂️ Database Schema

### `franchisees` Table
```sql
ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;
```

**To add this column manually in Supabase:**
1. Go to Supabase Dashboard > SQL Editor
2. Run:
   ```sql
   ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;
   COMMENT ON COLUMN franchisees.gmb_location_id IS 'Google My Business location ID for direct posting';
   ```

### `app_settings` Table
Stores admin GMB manager email:
```
key: 'gmb_manager_email'
value: 'Foster_034@hotmail.com'
```

---

## 📂 Files Created/Modified

### New Files:
- `/src/app/api/admin-settings/route.ts` - Admin settings API
- `/src/app/api/franchisee-gmb/route.ts` - Franchisee GMB location API
- `/src/components/GMBLocationCard.tsx` - GMB Location ID card component
- `/database/add-gmb-location-id.sql` - Migration to add column
- `/add-gmb-location-column.js` - Script to run migration

### Modified Files:
- `/src/app/admin/settings/page.tsx` - Added GMB Manager Email setting
- `/src/app/franchisee/settings/page.tsx` - Added GMBLocationCard
- `/src/app/admin/marketing/page.tsx` - Updated `postToGMB()` function

---

## 🔄 Complete Workflow Example

### Scenario: Admin wants to post a locksmith job photo

1. **Technician submits job photo** → Shows in Admin > Marketing (Approved Content tab)
2. **Admin reviews and approves** → Photo remains in Approved Content
3. **Admin clicks orange GMB pin button (📍)** on the photo
4. **System checks**: Does franchisee have `gmb_location_id` saved?
   - **YES** → Opens `https://business.google.com/posts/l/{location_id}` (Direct!)
   - **NO** → Opens `https://business.google.com/posts` (Must select business)
5. **Admin in GMB**:
   - Click "Create post"
   - Paste content (already in clipboard)
   - Click "Publish"
6. **Done!** 🎉 Post is live on franchisee's GMB

---

## ✅ Benefits

1. **No OAuth complexity** - No API approval, tokens, or quotas
2. **Direct posting** - Open directly to franchisee's GMB posts page (if configured)
3. **Auto clipboard** - Photo URL and caption automatically copied
4. **Centralized management** - Manage all franchisees from one admin account
5. **No expiration** - Access doesn't expire unless franchisee removes manager
6. **Simple setup** - Just add email as manager, done!

---

## ❓ Troubleshooting

**Q: GMB button opens general posts page instead of franchisee's page**
A: Franchisee hasn't configured their GMB Location ID. Ask them to:
   1. Go to Franchisee > Settings
   2. Find GMB Location Settings card
   3. Follow instructions to add Location ID

**Q: Don't see franchisee in GMB business dropdown**
A:
   - Ensure franchisee added you as Manager (not other role)
   - Check your email for invitation and accept it
   - Refresh GMB page

**Q: GMB Location ID not saving**
A:
   - Run the database migration: `ALTER TABLE franchisees ADD COLUMN IF NOT EXISTS gmb_location_id TEXT;`
   - Check Supabase dashboard > Table Editor > franchisees > verify column exists

**Q: Alert says "Error opening GMB"**
A:
   - Check browser console for errors
   - Verify `/api/franchisee-gmb` endpoint is working
   - Check franchisee ID is valid

---

## 🚀 Next Steps

1. ✅ Run database migration to add `gmb_location_id` column
2. ✅ Set admin GMB manager email in Admin > Settings > General
3. ✅ Send email template to all franchisees requesting manager access
4. ✅ Accept all manager invitations as they arrive
5. ✅ Ask franchisees to configure their GMB Location ID in Settings
6. ✅ Test posting to at least one franchisee's GMB

---

## 📊 Tracking Setup Progress

Keep a spreadsheet of:
- Franchisee Name
- Manager Access Granted? (Y/N)
- GMB Location ID Configured? (Y/N)
- Test Post Successful? (Y/N)

This helps track which franchisees are fully set up for direct posting!
