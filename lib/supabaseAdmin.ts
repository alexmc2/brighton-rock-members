// lib/supabaseAdmin.ts

import { createClient } from '@supabase/supabase-js';

// Make sure to set these environment variables in your .env file
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default supabaseAdmin;