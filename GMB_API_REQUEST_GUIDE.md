# 🚀 How to Request Google Business Profile API Access

## ⚠️ Requirements BEFORE You Request

You need:
1. **A verified Google Business Profile** that's been active for **60+ days**
2. **A website** listed on that business profile
3. **Owner or Manager access** to that Google Business Profile

## 📝 Step-by-Step Request Process

### Step 1: Get Your Google Cloud Project Number

1. Go to: https://console.cloud.google.com
2. Select your project (the one with your OAuth credentials)
3. Look at the **Project info** card on the dashboard
4. **Copy the Project Number** (looks like: `829673976858`)

### Step 2: Fill Out the Request Form

1. Go to: https://support.google.com/business/contact/api_default
2. Fill out the form with:

**What they ask for:**
- **Your name**: Your full name
- **Email**: The email that's listed as owner/manager on the Google Business Profile
- **Google Cloud Project Number**: Paste the number from Step 1 (example: `829673976858`)
- **Business name**: The name of your business (Pop-A-Lock)
- **Website URL**: Your business website (popalock.com)
- **Use case description**: Explain what you'll do with the API

**What to write for "Use case":**
```
We are building a marketing content management platform for Pop-A-Lock franchisees.
The app will allow franchisees to:
1. Connect their Google Business Profile via OAuth
2. Receive approved marketing content from corporate
3. Automatically post that content to their GMB profile with one click

This saves franchisees time and ensures consistent brand messaging across all locations.
```

### Step 3: Submit and Wait

1. Click **Submit**
2. You'll receive a confirmation email
3. Google will review (typically **2-14 days**)
4. You'll get an approval email when ready

### Step 4: Check If You're Approved

**Go to Google Cloud Console > APIs & Services > Quotas**

Look for: "Requests per minute" for Business Profile API
- **0 QPM** = ❌ Not approved yet
- **300 QPM** = ✅ Approved!

---

## 🤔 Common Questions

**Q: What if I don't have a business profile for 60+ days?**
A: You need to wait until your profile meets the 60-day requirement. In the meantime, use the manager-based approach (GMB_MANAGER_SETUP.md).

**Q: Can I expedite the approval?**
A: No, there's no way to speed up Google's review process.

**Q: What if I get denied?**
A: Review the requirements and resubmit. Make sure your profile is complete and your use case is clearly explained.

**Q: Do I need API access for EVERY franchisee's GMB?**
A: No! You only need API access for YOUR Google Cloud project. Once approved, your app can post to ANY franchisee's GMB after they connect via OAuth.

---

## ✅ After Approval

Once you get the approval email:

1. Check that quota is now 300 QPM (not 0)
2. Test OAuth connection in `/franchisee/settings`
3. Test posting in `/admin/marketing`
4. All GMB features will work automatically!

---

## 🚨 If You Can't Wait

Use the **Manager-Based Approach** while waiting for approval:
- See: `GMB_MANAGER_SETUP.md`
- Franchisees add you as manager
- You post manually (not automated)
- Works immediately, no approval needed
- Switch to OAuth once approved
