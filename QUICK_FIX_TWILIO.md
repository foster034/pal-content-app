# Quick Fix for Twilio HTTP 403 Error

## TL;DR

Your Twilio credentials have invisible whitespace. The code is now fixed to trim it, but you need to re-save your credentials.

## 3-Step Fix (5 minutes)

### Step 1: Check the Problem
Visit: `http://localhost:3000/api/twilio/debug`

Look for:
```json
{
  "recommendations": [
    {
      "severity": "CRITICAL",
      "issue": "Auth token has leading or trailing whitespace"
    }
  ]
}
```

### Step 2: Re-Save Credentials

1. Go to: `http://localhost:3000/admin/settings`
2. Click: **SMS** tab
3. Copy from Twilio Console:
   - **Account SID** (starts with AC, 34 chars)
   - **Auth Token** (32 chars, click "Show" first)
4. Paste into the fields (use Ctrl+A, Ctrl+V)
5. Make sure:
   - ✅ Enable SMS Notifications = **ON**
   - ✅ Test Mode = **OFF**
6. Click: **Save SMS Settings**

### Step 3: Test

1. Enter test phone number: `+1XXXXXXXXXX`
2. Click: **Test SMS**
3. Look for success message

## Check Server Logs

You should see:
```
🔍 TWILIO DEBUG INFO:
  Account SID length: 34
  Account SID starts with AC: true
  Auth Token length: 32
  Has whitespace in SID: false     ← Should be FALSE
  Has whitespace in Token: false   ← Should be FALSE

📱 SMS SENT SUCCESSFULLY
```

## Still Getting 403?

1. Make sure you're copying from **Twilio Console** (not email, not docs)
2. Click the copy icon in Twilio Console (don't select and copy)
3. Use **live credentials** (not test credentials)
4. Verify your Twilio account has money
5. Check that your "From" number is active in Twilio

## Need More Help?

See full instructions: `TWILIO_FIX_INSTRUCTIONS.md`

---

**What Changed:** Code now automatically trims whitespace from credentials when saving and loading.

**Why This Fixes It:** Twilio rejects credentials with spaces/tabs/newlines → HTTP 403
