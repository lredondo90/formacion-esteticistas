import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

/**
 * Public browser client.
 * All authorization must be enforced by Supabase Auth + RLS.
 * Never use a secret/service-role key in this module.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'sb_publishable_placeholder',
)

