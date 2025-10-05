#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     GMB OAuth Tokens - Manual Migration Required                   ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "The 'selected_location_name' column is missing from the gmb_oauth_tokens table."
echo "This is causing the 500 error when saving GMB location IDs."
echo ""
echo "📋 Please follow these steps:"
echo ""
echo "1. Open the Supabase SQL Editor (opening in browser now...):"
echo "   https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor/sql"
echo ""
echo "2. Paste and run the following SQL (already copied to clipboard):"
echo ""
cat add-column.sql
echo ""
echo "3. After running the SQL, verify it worked by running:"
echo "   node add-selected-location-column.js"
echo ""
echo "4. Then test the fix by running:"
echo "   node test-gmb-update.js"
echo ""

# Open browser
open "https://supabase.com/dashboard/project/hagfscurfkqfsjkczjyi/editor/sql"

# Copy SQL to clipboard
cat add-column.sql | pbcopy

echo "✅ SQL copied to clipboard and browser opened!"
echo ""
