# GMB OAuth Flow - Complete Setup Guide

## 🚀 Overview

The GMB OAuth integration allows franchisees to connect their Google Business Profile accounts, and admins can post approved marketing content directly to their GMB profiles with **ONE CLICK** - fully automated!

---

## ✅ What's Already Set Up

1. **OAuth Credentials**:
   - Google Client ID and Secret are configured in `.env`
   - Redirect URI: `http://localhost:3000/api/google-my-business/callback`

2. **Database Table**:
   - `gmb_oauth_tokens` table stores OAuth tokens securely
   - Includes access_token, refresh_token, and selected_location

3. **API Endpoints**:
   - `/api/google-my-business/auth` - Start OAuth flow
   - `/api/google-my-business/callback` - Handle OAuth callback
   - `/api/google-my-business/posts` - Create GMB posts
   - `/api/gmb/status` - Check connection status
   - `/api/gmb/disconnect` - Disconnect GMB

4. **UI Components**:
   - `GMBConnectionCard` - Franchisee settings component
   - Admin marketing page with 1-click posting

---

## 📋 Setup Steps

### Step 1: Google Cloud Console Setup

1. **Enable APIs** (if you have approval):
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to **APIs & Services > Library**
   - Search and enable:
     - Google My Business API
     - My Business Account Management API
     - My Business Business Information API

2. **Check Quota** (verify approval):
   - Go to **APIs & Services > Quotas**
   - Look for Business Profile API quotas
   - **300 QPM** = Approved ✅
   - **0 QPM** = Not approved yet ❌

3. **OAuth Consent Screen** (already configured):
   - Should show "Testing" status
   - Scope: `https://www.googleapis.com/auth/business.manage`

### Step 2: Franchisee Connects GMB

**Location**: Franchisee > Settings > Google My Business Card

1. Franchisee clicks **"Connect Google My Business"** button
2. Redirected to Google OAuth consent screen
3. Signs in with Google account
4. Grants permissions (select business account if prompted)
5. Redirected back to settings page
6. ✅ Connection saved with OAuth tokens

### Step 3: Select Default Location

1. After connecting, franchisee sees list of their GMB locations
2. Select default location from dropdown
3. Click **"Save Default Location"**
4. ✅ Location saved for automated posting

---

## 🔄 The Complete Flow

### Franchisee Side:
1. **Connect GMB**: `/franchisee/settings` → Connect Google My Business
2. **OAuth Flow**: Google OAuth → Grant permissions
3. **Select Location**: Choose default GMB location
4. **Done!** No further action needed

### Admin Side:
1. **Review Content**: `/admin/marketing` → Approved Content tab
2. **Click GMB Button**: Orange pin icon (📍) on approved photo
3. **Automatic Posting**:
   - Fetches franchisee's OAuth token
   - Gets selected location
   - Posts to GMB API
   - Shows success/error message
4. **Done!** Post is live on franchisee's GMB

---

## 🎯 Key Features

### Automated Posting
- ✅ Admin clicks ONE button
- ✅ Photo + caption automatically posted
- ✅ No manual copy/paste needed
- ✅ Direct API integration

### Security
- ✅ OAuth tokens encrypted in database
- ✅ Row-level security (RLS) policies
- ✅ Auto token refresh before expiration
- ✅ Secure HTTPS in production

### Error Handling
- ✅ "GMB not connected" - Prompts franchisee to connect
- ✅ "No location selected" - Prompts franchisee to select location
- ✅ "Quota exceeded" - Shows API approval status message
- ✅ "Token expired" - Auto-refreshes tokens

---

## 📂 File Structure

### API Routes:
```
/src/app/api/google-my-business/
├── auth/route.ts         - Initiate OAuth flow
├── callback/route.ts     - Handle OAuth callback
├── posts/route.ts        - Create GMB posts (MAIN)
└── locations/route.ts    - Fetch GMB locations

/src/app/api/gmb/
├── status/route.ts       - Check connection status
├── disconnect/route.ts   - Disconnect GMB
└── update-location/route.ts - Save default location
```

### Components:
```
/src/components/
└── GMBConnectionCard.tsx  - Franchisee GMB settings card
```

### Libraries:
```
/src/lib/
└── gmb-tokens.ts         - Token management utilities
```

---

## 🔧 Environment Variables

Required in `.env`:
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 🧪 Testing the Flow

### Test OAuth Connection:
1. Go to `http://localhost:3000/franchisee/settings?id=<franchisee_id>`
2. Click "Connect Google My Business"
3. Sign in with Google (must be test user or approved account)
4. Verify connection shows "Connected" status
5. Select a location and save

### Test Posting:
1. Go to `http://localhost:3000/admin/marketing`
2. Find an approved photo
3. Click the orange GMB pin button (📍)
4. Check browser console for API response
5. Verify post appears on GMB (if approved)

---

## ❗ Common Issues

### Issue: "GMB account not connected"
**Solution**: Franchisee needs to connect GMB in settings

### Issue: "No default location selected"
**Solution**: Franchisee needs to select location in settings

### Issue: "Quota exceeded or API not approved"
**Solution**:
- Check quota in Google Cloud Console
- If 0 QPM, you need Google approval (2-14 days)
- See GOOGLE_SETUP.md for approval process

### Issue: "Invalid redirect URI"
**Solution**:
- Verify redirect URI in Google Cloud Console matches:
  `http://localhost:3000/api/google-my-business/callback`
- For production, add: `https://yourdomain.com/api/google-my-business/callback`

---

## 🚀 Production Checklist

Before deploying:

- [ ] ✅ Google API access approved (quota = 300 QPM)
- [ ] ✅ All 8 Business Profile APIs enabled
- [ ] ✅ OAuth consent screen published (or test users added)
- [ ] ✅ Production redirect URI added to OAuth credentials
- [ ] ✅ Environment variables set in production (Vercel/hosting)
- [ ] ✅ Database RLS policies configured
- [ ] ✅ Test with real franchisee GMB accounts
- [ ] ✅ Monitor error logs for failed posts

---

## 📊 Database Schema

### `gmb_oauth_tokens` Table:
```sql
CREATE TABLE gmb_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  google_email TEXT,
  selected_location_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎬 Next Steps

1. **Request API Approval** (if not approved):
   - Submit form: https://support.google.com/business/contact/api_default
   - Wait 2-14 days for approval
   - Check quota daily

2. **Add Test Users** (for development):
   - Go to OAuth consent screen
   - Add test user emails
   - Test OAuth flow

3. **Test Posting** (once approved):
   - Connect franchisee GMB
   - Select location
   - Click GMB button on approved content
   - Verify post appears on GMB

4. **Go Live** (when ready):
   - Publish OAuth consent screen
   - Add production redirect URI
   - Deploy to production
   - Monitor posting success rate

---

## 📚 Additional Resources

- **Setup Guide**: See `GOOGLE_SETUP.md` for detailed Google Cloud setup
- **OAuth Guide**: https://developers.google.com/my-business/content/oauth-overview
- **API Reference**: https://developers.google.com/my-business/reference/rest
- **Support**: https://support.google.com/business

---

## ✨ Benefits Over Manager Access

| Feature | Manager Access | OAuth Integration |
|---------|---------------|-------------------|
| **Setup Complexity** | Simple | Medium |
| **Posting Process** | Manual (admin opens GMB, pastes content) | **Automated (1-click)** |
| **Speed** | Slow (5+ steps) | **Instant** |
| **Scalability** | Poor (manual for each) | **Excellent** |
| **Analytics** | None | Can track via API |
| **Scheduling** | Manual | **Can be automated** |

**Recommendation**: OAuth is worth the setup for automation and scalability! 🚀
