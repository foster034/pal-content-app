# GMB Location Update - Issue Diagnosis and Fix

## Problem Summary

**Error:** 500 Internal Server Error when saving GMB location ID in franchisee settings

**Root Cause:** The `selected_location_name` column does not exist in the `gmb_oauth_tokens` table

**Error Message:**
```
Could not find the 'selected_location_name' column of 'gmb_oauth_tokens' in the schema cache (PGRST204)
```

## Investigation Results

### 1. Demo Credentials (from .env line 44)
- Email: `admin@test.ca`
- Password: `123456`

### 2. Database Investigation
- **Franchisee ID:** `4c8b70f3-797b-4384-869e-e1fb3919f615`
- **GMB Connection:** EXISTS
  - Email: `brentfoster.popalock@gmail.com`
  - Status: Active
  - Locations: [] (empty - API not approved yet)
  - **Selected Location:** undefined (column doesn't exist!)

### 3. Code Analysis
The API endpoint `/api/gmb/update-location/route.ts` tries to update `selected_location_name`:
```typescript
const { error } = await supabaseAdmin
  .from('gmb_oauth_tokens')
  .update({ selected_location_name })  // ← This column doesn't exist!
  .eq('franchisee_id', franchisee_id)
  .eq('is_active', true);
```

### 4. Schema Analysis
The SQL schema file `/database/create-gmb-oauth-table.sql` includes the column definition:
```sql
selected_location_name TEXT,  -- Line 20
```

**However**, the actual database table was created WITHOUT this column. This means either:
- The table was created from an incomplete schema
- The migration was never run
- The column was accidentally dropped

## The Fix

### REQUIRED: Manual SQL Execution

I've tried multiple programmatic approaches to add the column, but they all failed due to:
- Supabase MCP tools in read-only mode
- No `exec_sql` RPC function available
- Database connection credentials issues
- PostgREST schema cache limitations

**You must run the SQL manually in the Supabase Dashboard:**

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor/sql

2. **Paste and execute this SQL:**
   ```sql
   -- Add selected_location_name column to gmb_oauth_tokens table
   ALTER TABLE gmb_oauth_tokens ADD COLUMN IF NOT EXISTS selected_location_name TEXT;

   -- Add comment for documentation
   COMMENT ON COLUMN gmb_oauth_tokens.selected_location_name IS 'Default GMB location name for posting (e.g., accounts/123/locations/456)';

   -- Verify column was added
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'gmb_oauth_tokens' AND column_name = 'selected_location_name';

   -- Test update for the franchisee
   UPDATE gmb_oauth_tokens
   SET selected_location_name = 'accounts/demo123456/locations/demo789012'
   WHERE franchisee_id = '4c8b70f3-797b-4384-869e-e1fb3919f615'
   AND is_active = true
   RETURNING id, franchisee_id, google_email, selected_location_name;
   ```

3. **Expected Results:**
   - ALTER TABLE: `Success`
   - COMMENT: `Success`
   - SELECT: 1 row showing `selected_location_name | text | YES`
   - UPDATE: 1 row showing the updated record

## Verification Steps

### After Running the SQL:

1. **Verify the column exists:**
   ```bash
   cd "/Users/brentfoster/PAL CONTENT APP"
   node add-selected-location-column.js
   ```
   Expected output: `✅ Column "selected_location_name" already exists!`

2. **Test the update operation:**
   ```bash
   node test-gmb-update.js
   ```
   Expected output: `🎉 All tests passed! GMB location update is working correctly.`

3. **Test in the UI:**
   - Go to http://localhost:3000
   - Login with `admin@test.ca` / `123456`
   - Navigate to: http://localhost:3000/admin (or wherever franchisee settings are)
   - Find franchisee ID `4c8b70f3-797b-4384-869e-e1fb3919f615`
   - Click the "Use Demo Location ID for Testing" button
   - Click "Save Test Location ID"
   - **Expected:** Success message, no 500 error

## Files Created for This Fix

1. `/Users/brentfoster/PAL CONTENT APP/supabase/migrations/20251005105424_add_selected_location_name_to_gmb_oauth_tokens.sql`
   - Migration file for version control

2. `/Users/brentfoster/PAL CONTENT APP/add-column.sql`
   - Standalone SQL file ready to run

3. `/Users/brentfoster/PAL CONTENT APP/test-gmb-update.js`
   - Verification script

4. `/Users/brentfoster/PAL CONTENT APP/add-selected-location-column.js`
   - Column existence checker

5. `/Users/brentfoster/PAL CONTENT APP/GMB_FIX_SUMMARY.md`
   - This summary document

## Why This Happened

The `gmb_oauth_tokens` table was likely created using `setup-gmb-table.js` or the API route `/api/setup-gmb-table/route.ts`, both of which have **incomplete schemas** missing the `selected_location_name` column.

The complete schema in `/database/create-gmb-oauth-table.sql` includes the column, but it was never applied to the database.

## Prevention

To prevent this in the future:
1. Always use the migration files in `/supabase/migrations/`
2. Keep the setup scripts in sync with the complete schema
3. Add schema validation tests
4. Use Supabase CLI for migrations: `supabase db push`

## Next Steps After Fix

Once you've run the SQL and verified it works:
1. ✓ Commit the migration file to git
2. ✓ Update the setup scripts to include the missing column
3. ✓ Test the GMB location save feature end-to-end
4. ✓ Consider adding a database schema validation test
