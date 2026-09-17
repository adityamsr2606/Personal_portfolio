import {readContent, noCache, fail} from '@/lib/server';
export const dynamic = 'force-dynamic';
// Retained for older clients; new visitors subscribe directly to Supabase Realtime.
export async function GET() {
  try {
    const {revision} = await readContent();
    return new Response(`data: ${JSON.stringify({revision})}\n\n`, {
      headers:{...noCache,'Content-Type':'text/event-stream'},
    });
  } catch (error) {return fail(error);}
}
