# GMB OAuth Tokens - Add selected_location_name Column

## Issue
The `selected_location_name` column does not exist in the `gmb_oauth_tokens` table, causing a 500 error when trying to update a franchisee's GMB location.

## Error Message
```
Could not find the 'selected_location_name' column of 'gmb_oauth_tokens' in the schema cache
```

## Solution
Run the following SQL in the Supabase SQL Editor:

### Step 1: Open Supabase SQL Editor
https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor/sql

### Step 2: Run this SQL

```sql
-- Add selected_location_name column to gmb_oauth_tokens table
ALTER TABLE gmb_oauth_tokens
ADD COLUMN IF NOT EXISTS selected_location_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN gmb_oauth_tokens.selected_location_name IS 'Default GMB location name for posting (e.g., accounts/123/locations/456)';

-- Test the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gmb_oauth_tokens' AND column_name = 'selected_location_name';
```

### Step 3: Verify
After running the SQL, you should see output confirming the column exists:

| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| selected_location_name | text | YES |

### Step 4: Test the update
```sql
-- Test update for franchisee 4c8b70f3-797b-4384-869e-e1fb3919f615
UPDATE gmb_oauth_tokens
SET selected_location_name = 'accounts/demo123456/locations/demo789012'
WHERE franchisee_id = '4c8b70f3-797b-4384-869e-e1fb3919f615'
AND is_active = true
RETURNING *;
```

### Step 5: Test in the application
1. Go to http://localhost:3000
2. Login with admin@test.ca / 123456
3. Navigate to Franchisee Settings for ID: 4c8b70f3-797b-4384-869e-e1fb3919f615
4. Try saving a GMB location ID
5. Verify the save succeeds (no 500 error)
