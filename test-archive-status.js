import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test query to see what status values exist
const { data, error } = await supabase
  .from('franchisee_photos')
  .select('status')
  .limit(10);

console.log('Status values:', data?.map(d => d.status));
console.log('Error:', error);
