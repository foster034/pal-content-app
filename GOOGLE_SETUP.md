# Google Business Profile API Setup (2025 Updated Guide)

⚠️ **Important:** Google My Business API has been renamed to "Google Business Profile API" and requires special access approval.

## Step 1: Request API Access (REQUIRED FIRST STEP)

**You must complete this step before any API setup will work:**

1. Go to [Google Business Profile API Access Request Form](https://docs.google.com/forms/d/e/1FAIpQLSfJn9uI3KIpzGS_slj5jb8dxLZPaOhNH3P_Y6qHUFMsNmONtg/viewform)
2. Select **"Application for Basic API Access"** from dropdown
3. Provide your:
   - Google Account email (must be owner/manager of business)
   - Project Number (from Google Cloud Console)
   - Business description and use case
4. Wait for approval email (can take several days)

**Without approval, the APIs won't be visible in Google Cloud Console!**

## Step 2: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Note your **Project Number** from the dashboard (needed for access request)

## Step 3: Enable Business Profile APIs (After Approval)

Once approved, enable all **8 required APIs**:

1. Go to **APIs & Services > Library**
2. Search and enable each API individually:
   - **My Business Account Management API**
   - **My Business Business Information API** 
   - **My Business Lodging API**
   - **My Business Notifications API**
   - **My Business Place Actions API**
   - **My Business Posts API**
   - **My Business Q&A API**
   - **My Business Verifications API**

## Step 4: Configure OAuth Consent Screen

**You should see "Google Auth Platform not configured yet" - this is normal!**

1. **Go to APIs & Services > OAuth consent screen** (you're already here!)
2. **Click the blue "Get started" button**
3. **Choose User Type:**
   - Select **"External"** (allows any Google user)
   - Click **"Create"**

4. **Fill OAuth App Information (Page 1):**
   - **App name:** "PAL Content App" (or your business name)
   - **User support email:** Select your email from dropdown
   - **App logo:** (Optional) Upload your business logo
   - **App domain:** (Optional) Leave blank for now
   - **Developer contact information:** Enter your email
   - Click **"Save and Continue"**

5. **Add Scopes (Page 2):**
   - Click **"Add or Remove Scopes"**
   - In the manual entry box, paste: `https://www.googleapis.com/auth/business.manage`
   - Click **"Add to Table"**
   - Click **"Update"**
   - Click **"Save and Continue"**

6. **Test Users (Page 3):**
   - Click **"Add Users"**
   - Add your email and any test emails
   - Click **"Save and Continue"**

7. **Summary (Page 4):**
   - Review everything
   - Click **"Back to Dashboard"**

**✅ You should now see "Testing" status - this is perfect for development!**

## Step 5: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/google-my-business/callback
   https://yourdomain.com/api/google-my-business/callback
   ```
5. Save and copy your **Client ID** and **Client Secret**

## Step 6: Update Environment Variables

Add these to your `.env` file:

```env
# Google Business Profile API OAuth (2025)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 7: Test OAuth 2.0 Playground (Optional)

Before testing in your app, verify access:

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click gear icon → Settings:
   - ✅ Use your own OAuth credentials
   - Enter your Client ID and Client Secret
3. In Step 1, paste scope: `https://www.googleapis.com/auth/business.manage`
4. Click "Authorize APIs" and complete OAuth flow
5. In Step 2, test URL: `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`

## Step 8: Test Your Integration

1. Start your development server: `npm run dev`
2. Navigate to `/franchisee/marketing`
3. Click "Connect Google My Business"
4. Complete the OAuth flow
5. You should see your business locations listed

## 🚨 Common Issues & Solutions

**Issue: APIs not visible in Console**
- ✅ Solution: Complete Step 1 access request first

**Issue: "Error 403 - PERMISSION_DENIED"**
- ✅ Solution: Ensure Business Profile is enabled in Google Workspace settings

**Issue: "Invalid redirect URI"**
- ✅ Solution: Exact match required including `http://` vs `https://`

**Issue: "Access blocked"**
- ✅ Solution: Publish OAuth consent screen or add test users

## Important 2025 Requirements

- ⚠️ **API Access Approval Required** - Cannot skip this step
- ⚠️ **All 8 APIs Must Be Enabled** - Not just one
- ⚠️ **Business Owner Email Required** - For access request
- ⚠️ **OAuth Consent Screen Must Be Configured** - Required for external users

## Rate Limits & Policies

- **Rate Limit:** 100 requests/day per location
- **Content Policy:** Follow Google Business Profile guidelines
- **Token Storage:** Encrypt access tokens in database
- **Refresh Tokens:** Implement automatic refresh logic

## Production Deployment Checklist

- [ ] ✅ API access approved by Google
- [ ] ✅ All 8 APIs enabled in Console  
- [ ] ✅ OAuth consent screen published
- [ ] ✅ Production redirect URIs added
- [ ] ✅ Environment variables set
- [ ] ✅ Database token storage implemented
- [ ] ✅ Token refresh logic added
- [ ] ✅ Error logging configured
- [ ] ✅ Content policies reviewed

## API Endpoints Created

- `GET /api/google-my-business/auth` - Initiate OAuth flow
- `GET /api/google-my-business/callback` - Handle OAuth callback  
- `GET /api/google-my-business/locations` - Get franchisee locations
- `POST /api/google-my-business/posts` - Create business posts

## What Franchisees Can Do

Once set up, each franchisee can:

1. **Connect** their Google Business Profile via OAuth
2. **View** all their business locations  
3. **Auto-post** approved marketing photos
4. **Track** posting success/failures
5. **Manage** multiple locations from one dashboard

**Next:** Complete the access request form and wait for Google's approval!