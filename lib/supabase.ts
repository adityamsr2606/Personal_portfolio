import {createClient} from '@supabase/supabase-js';

// Publishable project settings are safe to ship. Access is enforced by database RLS.
export const supabaseUrl = 'https://pljzviuovzlzrnpgtppd.supabase.co';
export const supabaseKey = 'sb_publishable_OyIA1fVxCY6-mWggP2ucuQ_WcBheIgd';
export function publicDatabase() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {persistSession: false, autoRefreshToken: false},
  });
}
let browserClient: ReturnType<typeof createClient> | undefined;
export function browserDatabase() {
  if (typeof window === 'undefined') throw new Error('Browser client requires a browser');
  return browserClient ??= createClient(supabaseUrl, supabaseKey);
}
export async function adminFetch(path: string, options: RequestInit = {}) {
  const {data: {session}} = await browserDatabase().auth.getSession();
  const headers = new Headers(options.headers);
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(path, {...options, headers, cache: 'no-store'});
}
