# Google Business Profile API Setup (2025 Updated Guide)

⚠️ **Important:** Google Business Profile APIs (formerly Google My Business) require special access approval and are not publicly available.

## Prerequisites (Complete These FIRST)

Before requesting API access, you must have:

1. **Google Account** - Standard Google account
2. **Active Business Profile** - Must manage a verified and active Google Business Profile for 60+ days
   - Can be your own office/headquarters OR a client's managed profile
   - Must have a website listed on the profile
   - Profile should be fully complete and up-to-date
3. **Business Website** - Valid, live business website tied to your business domain
4. **Business Email** - Use a business email address (not @gmail.com) that is listed as owner/manager on the GBP

## Step 1: Request API Access (REQUIRED FIRST STEP)

**You must complete this step before any API setup will work:**

### Request Process:

1. **Create Google Cloud Project First:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Note your **Project Number** from the Project info card on the dashboard

2. **Submit Access Request:**
   - Go to [GBP API Contact Form](https://support.google.com/business/contact/api_default)
   - Select **"Application for Basic API Access"** from dropdown
   - Provide all requested information:
     - Google Account email (must be owner/manager on your Business Profile)
     - Project Number (from step 1)
     - Business description and use case
     - Valid business website URL

3. **Wait for Approval:**
   - Requests are reviewed within **14 days** (typically 2-5 days)
   - A follow-up email will be sent after review
   - You'll receive approval notification via email

### How to Check Approval Status:

1. Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/dashboard)
2. Navigate to **APIs & Services > Dashboard > Quotas**
3. Look for Business Profile API quotas:
   - **0 QPM (Queries Per Minute)** = Not approved yet ❌
   - **300 QPM** = Project is approved ✅

**Without approval, the APIs won't be visible or functional in Google Cloud Console!**

## Step 2: Enable Business Profile APIs (After Approval)

⚠️ **IMPORTANT:** Only complete this step AFTER receiving approval email from Google!

Once approved, you must enable **all 8 Business Profile APIs** individually:

1. Go to [Google API Library](https://console.cloud.google.com/apis/library)
2. Search and enable each API one by one:
   - **Google My Business API** (main API)
   - **My Business Account Management API** (manage accounts/locations)
   - **My Business Business Information API** (location details)
   - **My Business Lodging API** (hotel/lodging specific)
   - **My Business Notifications API** (notifications)
   - **My Business Place Actions API** (place actions)
   - **My Business Q&A API** (questions & answers)
   - **My Business Verifications API** (location verifications)

### If APIs Are Not Visible:

If you can't find these APIs in the library, it means:
- ❌ You haven't been approved for API access yet (complete Step 1 first)
- ❌ Your project doesn't have the necessary permissions
- ❌ You're not signed in with the approved Google Account

### For Google Workspace Users:

If using a Google Workspace account, you must also:
1. Go to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to **Apps > Additional Google services**
3. Find **"Google Business Profile"** and ensure it's **turned ON** for your organization

## Step 3: Configure OAuth Consent Screen

The OAuth consent screen is what your franchisees will see when they authorize your app to access their Google Business Profile.

### Setup Steps:

1. **Navigate to OAuth Consent Screen:**
   - Go to [APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
   - If you see "Google Auth Platform not configured yet" - this is normal!

2. **Choose User Type:**
   - Select **"External"** (allows any Google user to connect)
   - Click **"Create"**

3. **App Information (Page 1):**
   - **App name:** "PAL Content App" (or your business name - franchisees will see this)
   - **User support email:** Select your email from dropdown
   - **App logo:** (Optional but recommended) Upload your business logo
   - **Application home page:** (Optional) Your business website
   - **Application privacy policy link:** (Required for publishing)
   - **Application terms of service link:** (Required for publishing)
   - **Developer contact information:** Enter your email
   - Click **"Save and Continue"**

4. **Scopes (Page 2) - CRITICAL:**
   - Click **"Add or Remove Scopes"**
   - In the **"Manually add scopes"** text box, paste:
     ```
     https://www.googleapis.com/auth/business.manage
     ```
   - Click **"Add to Table"**
   - Verify the scope appears in the table
   - Click **"Update"** then **"Save and Continue"**

   ⚠️ **This scope grants full access to Business Profile data - required for posting!**

5. **Test Users (Page 3):**
   - Click **"Add Users"**
   - Add your email address
   - Add any franchisee test accounts
   - Click **"Save and Continue"**

   📝 **Note:** While in "Testing" status, only these emails can connect GMB accounts.

6. **Summary (Page 4):**
   - Review all settings
   - Click **"Back to Dashboard"**

**✅ Status should show "Testing" - perfect for development!**

### Publishing Your App (Optional - For Production):

To allow ANY franchisee to connect (not just test users):
1. Complete the OAuth consent screen with all required fields
2. Click **"Publish App"** on the OAuth consent screen
3. Submit for Google verification (may take several days)

## Step 4: Create OAuth 2.0 Credentials

Now create the actual OAuth credentials your app will use:

1. **Navigate to Credentials:**
   - Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)

2. **Create OAuth Client ID:**
   - Click **"Create Credentials"** > **"OAuth client ID"**
   - Application type: **"Web application"**
   - Name: "PAL Content App Web Client" (or any name)

3. **Add Authorized Redirect URIs:**
   - Click **"Add URI"** under "Authorized redirect URIs"
   - Add these exact URLs:
     ```
     http://localhost:3000/api/google-my-business/callback
     https://yourdomain.com/api/google-my-business/callback
     ```
   - For testing OAuth Playground, also add:
     ```
     https://developers.google.com/oauthplayground
     ```

4. **Create and Save:**
   - Click **"Create"**
   - **IMPORTANT:** Copy your **Client ID** and **Client Secret** immediately
   - Store them securely - you'll need them for .env file

## Step 5: Update Environment Variables

Add these to your `.env` file:

```env
# Google Business Profile API OAuth (2025)
GOOGLE_CLIENT_ID=your_client_id_from_step_4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_4
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace:
- `your_client_id_from_step_4` with the Client ID you copied
- `your_client_secret_from_step_4` with the Client Secret you copied
- Update `NEXT_PUBLIC_BASE_URL` to your production domain when deploying

⚠️ **NEVER commit your .env file to git!** (It should be in .gitignore)

## Step 6: Test OAuth 2.0 Playground (Optional but Recommended)

Before testing in your app, verify your setup is working correctly:

### Using OAuth Playground:

1. **Open Playground:**
   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

2. **Configure Your Credentials:**
   - Click the **gear icon ⚙️** in top-right corner
   - Check **"Use your own OAuth credentials"**
   - Enter your **OAuth Client ID** (from Step 4)
   - Enter your **OAuth Client Secret** (from Step 4)
   - Click **"Close"**

3. **Authorize Access (Step 1):**
   - In the left panel, find **"Step 1 Select & authorize APIs"**
   - In the text box, paste this scope:
     ```
     https://www.googleapis.com/auth/business.manage
     ```
   - Click **"Authorize APIs"**
   - Sign in with your Google account (must be a test user or owner/manager)
   - Allow all permissions

4. **Exchange Code for Token (Step 2):**
   - Click **"Exchange authorization code for tokens"**
   - You should see access_token and refresh_token

5. **Test API Call (Step 3):**
   - Click **"List possible operations"**
   - Or manually enter this URL:
     ```
     https://mybusinessaccountmanagement.googleapis.com/v1/accounts
     ```
   - Click **"Send the request"**
   - **Expected Response:** JSON list of your Business Profile accounts
   - **If Error 403:** Your project isn't approved yet or APIs aren't enabled

### What Success Looks Like:

```json
{
  "accounts": [
    {
      "name": "accounts/123456789",
      "accountName": "Your Business Name",
      "type": "PERSONAL",
      "role": "OWNER"
    }
  ]
}
```

## Step 7: Test Your Integration in App

Now test the actual OAuth flow in your application:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Settings:**
   - Log in as a franchisee
   - Go to `/franchisee/settings` page
   - Scroll to "Google My Business" section

3. **Connect GMB Account:**
   - Click **"Connect Google My Business"** button
   - You'll be redirected to Google's OAuth consent screen
   - Sign in with your Google account (must be a test user)
   - Click **"Allow"** to grant permissions

4. **Verify Connection:**
   - You should be redirected back to settings page
   - GMB card should show "Connected" status
   - Your Google email should be displayed
   - If you have business locations, they'll appear in the dropdown

5. **Select Default Location:**
   - Choose your default posting location from dropdown
   - Click **"Save Default Location"**

### Expected Behavior:

✅ **Success:** Connection saved, locations loaded, default location set
❌ **Quota Error:** Connection saved but 0 locations (API not approved yet)

## 🚨 Common Issues & Solutions

### Issue: "APIs not visible in Console"
**Symptoms:** Can't find Business Profile APIs in API Library
**Solution:**
- You haven't been approved yet - complete Step 1 first
- Wait for approval email (2-14 days)
- Check quotas to confirm approval status

### Issue: "Error 403 - PERMISSION_DENIED"
**Symptoms:** API calls return 403 Forbidden
**Solutions:**
- Ensure all 8 APIs are enabled in Console
- Verify your project was approved (check quotas = 300 QPM)
- For Google Workspace: Enable "Google Business Profile" service in Admin Console
- Verify you're using the approved Google Account

### Issue: "Invalid redirect URI"
**Symptoms:** OAuth callback fails with redirect URI mismatch
**Solution:**
- Redirect URIs must **exactly match** in Console and code
- Include `http://` vs `https://` correctly
- No trailing slashes unless code has them
- For localhost: `http://localhost:3000/api/google-my-business/callback`
- For production: `https://yourdomain.com/api/google-my-business/callback`

### Issue: "Access blocked: This app's request is invalid"
**Symptoms:** Can't complete OAuth flow, blocked by Google
**Solutions:**
- Add your email to Test Users in OAuth consent screen
- OR publish your OAuth consent screen (for production)
- Verify scope is exactly: `https://www.googleapis.com/auth/business.manage`

### Issue: "Quota exceeded for quota metric 'Requests'"
**Symptoms:** OAuth works but location fetching fails
**Solution:**
- Your project quota is still 0 QPM (not approved)
- Connection will save but with 0 locations
- Wait for Google approval, then locations will load automatically

### Issue: "Token expired" or "Invalid credentials"
**Symptoms:** Existing connection stops working
**Solution:**
- Implemented token refresh logic handles this automatically
- If it persists, disconnect and reconnect GMB account

## Important 2025 Requirements Checklist

Before your integration will work, you MUST have:

- ✅ **API Access Approval** - Cannot skip, typically takes 2-14 days
- ✅ **All 8 APIs Enabled** - Each one individually in API Library
- ✅ **Active Business Profile** - Verified for 60+ days with website
- ✅ **Business Email Used** - Listed as owner/manager on GBP
- ✅ **OAuth Consent Configured** - With correct scope and test users
- ✅ **OAuth Credentials Created** - Web application type with redirect URIs
- ✅ **Environment Variables Set** - Client ID and Secret in .env

## Rate Limits & API Quotas (2025)

After approval, your project will have these limits:

- **Default Quota:** 300 QPM (Queries Per Minute)
- **Daily Limit:** ~43,200 requests per day (if used continuously)
- **Per Location:** No specific per-location limit (managed at project level)
- **Quota Increases:** Can be requested via the GBP API contact form

### Best Practices:

- **Cache location data** - Don't fetch locations on every page load
- **Batch operations** - Group API calls when possible
- **Handle 429 errors** - Implement exponential backoff retry logic
- **Monitor usage** - Check quota consumption in Google Cloud Console

## Google Business Profile Content Policies

All posts must comply with Google's policies:

- ✅ **Accurate information** - No misleading claims
- ✅ **Relevant content** - Related to your business
- ✅ **Professional images** - High quality, well-lit photos
- ❌ **No prohibited content** - Illegal, adult, violent, or spam content
- ❌ **No excessive promotions** - Balance promotional and informational content

**Full policies:** https://support.google.com/business/answer/3038177

## Security & Token Management

Your implementation includes:

✅ **Secure Token Storage:**
- Access tokens stored encrypted in Supabase
- Row-level security (RLS) policies enforced
- Only franchisee can access their own tokens

✅ **Automatic Token Refresh:**
- Tokens automatically refresh before expiration
- Refresh logic in `src/lib/gmb-tokens.ts:refreshGMBToken()`
- Handles expired tokens gracefully

✅ **OAuth Security:**
- State parameter prevents CSRF attacks
- Secure HTTPS-only in production
- Environment variables never exposed to client

## Production Deployment Checklist

Before going live, ensure you've completed:

- [ ] ✅ **API access approved by Google** (check quota = 300 QPM)
- [ ] ✅ **All 8 APIs enabled** in Google Cloud Console
- [ ] ✅ **OAuth consent screen published** (or test users added)
- [ ] ✅ **Production redirect URI added** (`https://yourdomain.com/api/google-my-business/callback`)
- [ ] ✅ **Environment variables set** in production (Vercel/hosting platform)
- [ ] ✅ **Database table created** (`gmb_oauth_tokens` with RLS policies)
- [ ] ✅ **Token refresh logic tested** (wait for token to expire and verify refresh)
- [ ] ✅ **Error logging configured** (monitor OAuth failures)
- [ ] ✅ **Content policies reviewed** with marketing team
- [ ] ✅ **Rate limiting implemented** (handle 429 quota exceeded errors)

## API Endpoints in Your App

These endpoints have been implemented:

### OAuth Flow:
- **`GET /api/google-my-business/auth`** - Initiates OAuth flow, redirects to Google
- **`GET /api/google-my-business/callback`** - Handles OAuth callback, saves tokens

### GMB Management:
- **`GET /api/gmb/status`** - Check connection status and get locations
- **`POST /api/gmb/disconnect`** - Disconnect GMB account
- **`POST /api/gmb/update-location`** - Save default posting location

### Future Endpoints (To Be Implemented):
- **`POST /api/gmb/posts`** - Create business posts
- **`GET /api/gmb/insights`** - Get posting analytics

## What Franchisees Can Do

Once the OAuth integration is set up, each franchisee can:

1. ✅ **Connect** their Google Business Profile via secure OAuth 2.0 flow
2. ✅ **View** all their business locations in one dashboard
3. ✅ **Select** a default posting location (for multi-location businesses)
4. ✅ **Disconnect** their account at any time
5. 🔜 **Auto-post** approved marketing content to their GMB locations (admin feature)
6. 🔜 **Track** posting success/failures and engagement metrics
7. 🔜 **Manage** multiple locations from centralized settings

## Next Steps

### For Development:

1. **Complete Step 1:** Submit the [GBP API access request form](https://support.google.com/business/contact/api_default)
2. **Wait for approval:** Check quotas daily - 300 QPM = approved
3. **Enable all 8 APIs** once approved
4. **Test OAuth flow** in development with test users
5. **Verify location fetching** works once quota is granted

### For Production:

1. **Publish OAuth consent screen** (or keep test users for internal use)
2. **Add production redirect URI** to OAuth credentials
3. **Set environment variables** in Vercel/hosting platform
4. **Test with real franchisee accounts** before launch
5. **Implement posting functionality** (`/api/gmb/posts` endpoint)
6. **Add analytics dashboard** to track GMB posting success

---

## Additional Resources

- **Official Docs:** https://developers.google.com/my-business/content
- **OAuth Guide:** https://developers.google.com/my-business/content/oauth-overview
- **API Reference:** https://developers.google.com/my-business/reference/rest
- **Support:** https://support.google.com/business
- **OAuth Playground:** https://developers.google.com/oauthplayground

**Questions or Issues?** Check the Common Issues section above or consult Google's official documentation.