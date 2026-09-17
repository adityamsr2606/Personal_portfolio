import {createClient} from '@supabase/supabase-js';
import {headers,cookies} from 'next/headers';
import {publicContent, type Content} from './content';
import {publicDatabase, supabaseUrl, supabaseKey} from './supabase';

export const ADMIN_EMAIL = 'adityamohan132@gmail.com';
export async function admin() {
  const requestHeaders = await headers();
  const mediaToken = (await cookies()).get('portfolio-media-session')?.value;
  const authorization = requestHeaders.get('authorization') || (mediaToken ? 'Bearer '+mediaToken : null);
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice(7);
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {headers: {Authorization: authorization}},
    auth: {persistSession: false, autoRefreshToken: false},
  });
  const {data: {user}, error} = await client.auth.getUser(token);
  if (error || !user?.email_confirmed_at || user.email?.toLowerCase() !== ADMIN_EMAIL) return null;
  return {userId: user.id, client, token};
}
export function sameOrigin(req: Request) {
  return req.headers.get('origin') === new URL(req.url).origin;
}
export async function readContent() {
  const {data, error} = await publicDatabase().from('portfolio_public')
    .select('content,revision').eq('id','main').single();
  if (error) throw error;
  return {content: publicContent(data.content as Content), revision: data.revision as number};
}
export function fail(error: unknown) {
  console.error('Portfolio request failed', error instanceof Error ? error.message : 'Storage error');
  return Response.json({error: 'Unable to complete this request. Your changes have not been discarded; please retry.'}, {status:503});
}
export const noCache = {'Cache-Control':'private, no-store, max-age=0'};
