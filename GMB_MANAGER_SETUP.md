# Google My Business - Manager Access Setup

## Overview

Instead of using OAuth, franchisees will add the PAL Content App admin as a **Manager** to their Google Business Profile. This gives the admin direct access to post content on their behalf.

---

## For Franchisees: How to Add Admin as Manager

### Step 1: Access Your Google Business Profile

1. Go to **https://business.google.com**
2. Sign in with your Google account
3. Select your business from the list

### Step 2: Navigate to Users Section

1. In the left sidebar, click **"Users"** or **"People"**
2. Or go directly to: https://business.google.com/dashboard/u/0/users

### Step 3: Add the Admin as Manager

1. Click **"Add users"** or the **"+"** button
2. Enter the admin email address: **`[YOUR_ADMIN_EMAIL]`**
3. Select role: **"Manager"**
   - ✅ Managers can: Create posts, respond to reviews, edit business info
   - ❌ Only Owners can: Transfer ownership, delete business
4. Click **"Invite"** or **"Send"**

### Step 4: Admin Accepts Invitation

The admin will receive an email invitation and must:
1. Click the invitation link in the email
2. Accept the manager role
3. You're done! The admin can now post to your GMB

---

## For Admins: How to Post to Franchisee GMB

### Step 1: Approve Content in Admin Dashboard

1. Go to **Admin > Marketing**
2. Review submitted photos from technicians
3. Approve the ones you want to post

### Step 2: Use the GMB Helper Modal (NEW!)

1. Click the **orange GMB pin button (📍)** on any approved photo
2. **A modal opens** with everything you need:
   - 📸 **Image Preview** - See what you're posting
   - 📥 **Download Link** - Click to download the image
   - 📋 **Copy Text Button** - One click to copy post text
   - 📝 **Step-by-step Instructions** - Clear guide
   - 🔗 **Open GMB Button** - Direct link to GMB

### Step 3: Post in 5 Easy Steps

1. **Download** the image (click download link in modal)
2. **Copy** the post text (click "Copy Text" button)
3. **Click** "Open GMB" button
4. **Upload** the image and **paste** the text in GMB
5. **Publish** the post

**That's it!** The entire process takes less than 30 seconds.

---

## Benefits of Manager Access vs OAuth

✅ **Simpler Setup** - No OAuth flow, no API approval needed
✅ **Immediate Access** - Works as soon as franchisee adds you
✅ **Easy Workflow** - Helper modal with one-click copy and download
✅ **Fast Posting** - Complete a post in under 30 seconds
✅ **No Token Expiration** - Access doesn't expire unless franchisee removes you
✅ **No API Quotas** - No Google API rate limits to worry about
✅ **Visual Preview** - See exactly what you're posting before you post it

---

## Troubleshooting

**Q: I don't see the franchisee's business in my GMB dashboard**
A: Ask the franchisee to check:
- They sent the invitation to the correct admin email
- The invitation was accepted (check spam folder)
- They selected "Manager" role (not "Site manager" or other)

**Q: Can I post on behalf of franchisees automatically?**
A: With manager access, posting is semi-automated - the helper modal prepares everything (image download, text copy) but you still paste in GMB. For fully automated posting, you need OAuth API approval.

**Q: The "Copy Text" button doesn't work**
A: Make sure you're using HTTPS (production) or localhost. Some browsers block clipboard access on non-secure connections. You can also manually select and copy the text from the modal.

**Q: What if a franchisee has multiple locations?**
A: You'll see all their locations in GMB. Select the correct one when posting.

**Q: Can franchisees revoke my access?**
A: Yes, they can remove you as a manager anytime from the Users section in their GMB dashboard.

---

## Admin Email to Provide to Franchisees

**Subject:** Add PAL Content App Admin to Your Google Business Profile

**Body:**

> Hi [Franchisee Name],
>
> To enable automated marketing content posting to your Google Business Profile, please add our admin account as a Manager:
>
> **Steps:**
> 1. Go to https://business.google.com
> 2. Click "Users" in the left sidebar
> 3. Click "Add users"
> 4. Enter email: **[YOUR_ADMIN_EMAIL]**
> 5. Select role: **Manager**
> 6. Click "Invite"
>
> Once added, we can post approved marketing photos to your GMB on your behalf!
>
> Let me know if you need help.
>
> Thanks!

---

## Next Steps

1. ✅ Update `[YOUR_ADMIN_EMAIL]` with actual admin email in this document
2. ✅ Send invitation instructions to all franchisees
3. ✅ Accept all manager invitations as they come in
4. ✅ Test posting to at least one franchisee's GMB
5. ✅ Document which franchisees have added you as manager

**Note:** You can track manager access status by logging into https://business.google.com and checking which businesses appear in your dashboard.
