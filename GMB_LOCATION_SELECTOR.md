# GMB Location Selector - Complete! 🎯

## Problem Solved
When a franchisee connects their Google My Business account with **multiple locations** (e.g., 2+ businesses under the same email), we now allow them to **select which location** admins should post to by default.

## ✅ What's Been Added

### 1. Database Schema Update
Added `selected_location_name` field to `gmb_oauth_tokens` table:
```sql
-- Default location for posting (franchisee can select from available locations)
selected_location_name TEXT,
```

### 2. Enhanced Location Data Storage
**Updated OAuth Callback** (`/api/google-my-business/callback`):
- Fetches all GMB locations from Google API
- Formats location data with:
  - `name` - Resource identifier (e.g., "accounts/123/locations/456")
  - `title` - Business name
  - `address` - Formatted full address
  - `placeId` - Google Place ID
- Stores all locations in JSONB array

### 3. Location Selector UI
**GMBConnectionCard Component** now shows:
- **Dropdown selector** with all available locations
- Each option shows: Business Name - Full Address
- **"Save Default Location"** button (only appears when selection changes)
- **Current default indicator** showing which location is active
- **Save state management** with loading indicators

### 4. New API Endpoint
**POST /api/gmb/update-location**:
- Updates `selected_location_name` for a franchisee
- Validates franchisee_id and location_name
- Returns success/error response

### 5. Updated Status Endpoint
**GET /api/gmb/status** now returns:
```json
{
  "success": true,
  "status": {
    "connected": true,
    "email": "franchisee@example.com",
    "locations": [
      {
        "name": "accounts/123/locations/456",
        "title": "Pop-A-Lock of Toronto",
        "address": "123 Main St, Toronto, ON M5V 2T6"
      },
      {
        "name": "accounts/123/locations/789",
        "title": "Pop-A-Lock of Mississauga",
        "address": "456 Queen St, Mississauga, ON L5B 1N2"
      }
    ],
    "selectedLocation": "accounts/123/locations/456",
    "lastConnected": "2025-10-05T09:00:00Z"
  }
}
```

## 🎬 User Flow

### When Franchisee Connects GMB:

1. **Click "Connect Google My Business"**
   - Redirected to Google OAuth
   - Authorizes the app

2. **OAuth Callback Processes**:
   - Exchanges code for tokens
   - Fetches user's GMB accounts
   - Fetches all locations for each account
   - Formats and stores location data
   - Saves everything to database
   - Redirects back to settings

3. **Location Selector Appears**:
   - Shows dropdown with all locations
   - Format: "Business Name - Full Address"
   - Franchisee selects their preferred location
   - Clicks "Save Default Location"

4. **Default Location Saved**:
   - Green checkmark shows current default
   - Admins can now use this location for posting

## 📊 Example Scenarios

### Scenario 1: Single Location
```
Connected Locations (1 available)
┌────────────────────────────────────────┐
│ Pop-A-Lock of Toronto - 123 Main St   │
└────────────────────────────────────────┘
[💾 Save Default Location]

✓ Current default: Pop-A-Lock of Toronto
```

### Scenario 2: Multiple Locations
```
Connected Locations (3 available)
┌────────────────────────────────────────┐
│ -- Select a location --                │
│ Pop-A-Lock of Toronto - 123 Main St   │
│ Pop-A-Lock of Mississauga - 456 Queen │
│ Pop-A-Lock of Brampton - 789 King St  │
└────────────────────────────────────────┘
[💾 Save Default Location]

✓ Current default: Pop-A-Lock of Toronto
```

## 🔧 For Admins: How to Use Selected Location

When posting content on behalf of a franchisee:

```typescript
import { getGMBTokens } from '@/lib/gmb-tokens';

// Get franchisee's GMB connection
const result = await getGMBTokens(franchiseeId);

if (result.success && result.data) {
  const accessToken = result.data.access_token;
  const selectedLocation = result.data.selected_location_name;

  // Post to their selected location
  await fetch(`https://mybusiness.googleapis.com/v4/${selectedLocation}/localPosts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: 'Your marketing content here',
      media: [{ mediaFormat: 'PHOTO', sourceUrl: photoUrl }]
    })
  });
}
```

## 🎯 Benefits

✅ **Multi-location Support** - Franchisees with multiple businesses can choose
✅ **Clear User Control** - Franchisee decides where content goes
✅ **Admin Confidence** - Admins know exactly which location to post to
✅ **No Ambiguity** - Single source of truth for default posting location
✅ **Easy to Change** - Franchisee can update selection anytime

## 📝 Updated Database Table Structure

```sql
gmb_oauth_tokens (
  id UUID PRIMARY KEY,
  franchisee_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  google_account_id TEXT,
  google_email TEXT,
  locations JSONB DEFAULT '[]',           -- All available locations
  selected_location_name TEXT,             -- 🆕 Default location for posting
  is_active BOOLEAN DEFAULT TRUE,
  last_refreshed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 🚀 Testing the Flow

1. **Connect GMB account with multiple locations**
2. **See dropdown populate** with all businesses
3. **Select preferred location** from dropdown
4. **Click "Save Default Location"**
5. **See green checkmark** confirming the selection
6. **Admins can now post** to that specific location

## 🔮 Future Enhancements

Possible additions for later:
- **Multi-select** to post to multiple locations at once
- **Location groups** for franchisees with many locations
- **Per-post location override** in admin posting UI
- **Location posting history** to track which locations get most content
- **Location performance metrics** to optimize posting strategy

---

**Everything is ready to test!** Just create the database table and the location selector will appear automatically when franchisees connect their GMB account. 🎉
