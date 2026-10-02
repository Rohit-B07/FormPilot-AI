import { createClient } from '@supabase/supabase-js';
import config from './index.js';

/**
 * Admin client — bypasses RLS. Use ONLY in server-side controllers/services.
 * Never expose the service role key to the frontend.
 */
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Create a per-request Supabase client scoped to the authenticated user.
 * This client respects RLS policies.
 */
export function createUserClient(accessToken) {
  return createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
