import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabaseServer = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_KEY ?? '',
  {
    auth: {
      persistSession: false // This is important for server-side usage
    }
  }
)
