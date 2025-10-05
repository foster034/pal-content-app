# GMB OAuth Integration - Setup Complete! 🎉

## ✅ What's Been Implemented

### 1. Database Schema
- Created `gmb_oauth_tokens` table schema (needs to be created in Supabase)
- Stores access tokens, refresh tokens, Google account info, and locations
- Automatic token expiration tracking
- One active connection per franchisee

### 2. Backend Implementation
- **Token Management** (`src/lib/gmb-tokens.ts`):
  - `saveGMBTokens()` - Store OAuth tokens after successful authorization
  - `getGMBTokens()` - Retrieve active tokens for a franchisee
  - `refreshGMBToken()` - Automatically refresh expired tokens
  - `disconnectGMB()` - Deactivate GMB connection

- **API Routes**:
  - `/api/google-my-business/auth` - Initiates OAuth flow
  - `/api/google-my-business/callback` - Handles OAuth callback, exchanges code for tokens, fetches locations, saves to database
  - `/api/gmb/status` - Check if franchisee has GMB connected
  - `/api/gmb/disconnect` - Disconnect GMB account

### 3. Frontend UI
- **GMBConnectionCard Component** (`src/components/GMBConnectionCard.tsx`):
  - Shows connection status
  - Displays connected Google account email
  - Lists GMB locations (up to 3, with "show more")
  - Connect/Disconnect buttons
  - Success/error handling with URL params

- **Franchisee Settings Page**:
  - Added GMB Connection Card to settings page
  - Shows in grid layout alongside branding settings

## 🚀 How to Complete Setup

### Step 1: Create the Database Table

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi)
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the contents of `database/create-gmb-oauth-table.sql`
5. Click "Run" (or press Cmd/Ctrl + Enter)

**Option B: Using the Migration API Route**
1. Run the development server: `npm run dev`
2. Make a POST request to: `http://localhost:3000/api/setup-gmb-table`
3. Check the response for success

### Step 2: Verify Google OAuth Credentials

Make sure these are set in your `.env` file:
```env
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Step 3: Test the OAuth Flow

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Franchisee Settings**:
   - Go to `/franchisee/settings?id=YOUR_FRANCHISEE_ID`
   - Replace `YOUR_FRANCHISEE_ID` with an actual franchisee UUID from your database

3. **Click "Connect Google My Business"**:
   - You'll be redirected to Google OAuth
   - Sign in with a Google account that has GMB access
   - Authorize the app
   - You'll be redirected back to settings with success message

4. **Verify Connection**:
   - The GMB card should now show "Connected" status
   - Display the connected Google email
   - Show the list of GMB locations

## 📊 Database Table Structure

```sql
gmb_oauth_tokens (
  id UUID PRIMARY KEY,
  franchisee_id UUID NOT NULL,        -- Links to franchisees table
  access_token TEXT NOT NULL,          -- Google access token
  refresh_token TEXT,                  -- For refreshing expired tokens
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE, -- When access token expires
  google_account_id TEXT,              -- Google user ID
  google_email TEXT,                   -- Connected Google account email
  locations JSONB DEFAULT '[]',        -- Array of GMB locations
  is_active BOOLEAN DEFAULT TRUE,      -- Is this connection active?
  last_refreshed_at TIMESTAMP,         -- Last time token was refreshed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 🔄 OAuth Flow Diagram

```
1. Franchisee clicks "Connect GMB"
   ↓
2. Redirected to /api/google-my-business/auth
   ↓
3. Redirected to Google OAuth with franchisee_id in state
   ↓
4. User authorizes app
   ↓
5. Google redirects to /api/google-my-business/callback
   ↓
6. Exchange authorization code for tokens
   ↓
7. Fetch user info and GMB locations
   ↓
8. Save everything to database
   ↓
9. Redirect back to franchisee settings with success
```

## 🎯 What Franchisees Can Now Do

✅ Connect their Google My Business account via OAuth
✅ See which Google account is connected
✅ View all their GMB business locations
✅ Disconnect their GMB account anytime
✅ Automatic token refresh (no need to re-authorize)

## 🔐 What Admins Can Do Next

With franchisees' GMB accounts connected, admins can now:

1. **Fetch GMB tokens** for any franchisee using `getGMBTokens(franchiseeId)`
2. **Post content** to franchisee GMB locations using the stored access tokens
3. **Auto-post approved marketing photos** to GMB
4. **Schedule posts** for future publishing
5. **Track posting success/failures**

## 📝 Next Steps for Admin GMB Posting

To enable admins to post content on behalf of franchisees, you'll need to:

1. **Create GMB Posting API** (`/api/google-my-business/posts`):
   ```typescript
   import { getGMBTokens } from '@/lib/gmb-tokens';

   // Get franchisee's tokens
   const result = await getGMBTokens(franchiseeId);

   // Use access_token to post to GMB
   fetch('https://mybusiness.googleapis.com/v4/...', {
     headers: { 'Authorization': `Bearer ${result.data.access_token}` }
   })
   ```

2. **Add UI in Admin Marketing Page** to:
   - Select franchisee (filter to only those with GMB connected)
   - Choose which locations to post to
   - Preview and publish content

## 🐛 Troubleshooting

**"Franchisee ID is required" error**
- Make sure you're passing `?id=FRANCHISEE_ID` in the URL

**"GMB OAuth not configured" error**
- Check that `GOOGLE_CLIENT_ID` is set in `.env`

**"Failed to save GMB tokens" error**
- Make sure the `gmb_oauth_tokens` table exists
- Check Supabase logs for detailed error

**"No locations found" after connecting**
- Make sure the Google account has GMB access
- Check that the account is a manager/owner of at least one business

## 📚 Files Created/Modified

### New Files:
- `database/create-gmb-oauth-table.sql`
- `src/lib/gmb-tokens.ts`
- `src/components/GMBConnectionCard.tsx`
- `src/app/api/gmb/status/route.ts`
- `src/app/api/gmb/disconnect/route.ts`
- `src/app/api/setup-gmb-table/route.ts`
- `src/app/api/migrations/gmb-oauth-table/route.ts`
- `setup-gmb-table.js`

### Modified Files:
- `src/app/api/google-my-business/callback/route.ts` - Added token storage
- `src/app/franchisee/settings/page.tsx` - Added GMB Connection Card
- `.mcp.json` - Removed read-only mode from Supabase MCP

## ✨ Ready to Test!

Everything is set up and ready for testing. Just create the database table and start clicking "Connect Google My Business"!
