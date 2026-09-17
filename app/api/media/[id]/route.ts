import {readContent,admin,fail,noCache} from '@/lib/server';
import {publicDatabase,supabaseUrl} from '@/lib/supabase';
import resumeFiles from '@/lib/resume-files.json';
export const dynamic = 'force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id} = await params;
    const ref = '/api/media/'+id;
    const {content} = await readContent();
    function referenced(value:unknown):boolean {
      if (typeof value==='string') return value===ref;
      if (Array.isArray(value)) return value.some(referenced);
      return !!value && typeof value==='object' && Object.values(value).some(referenced);
    }
    const user = referenced(content) ? null : await admin();
    if (!referenced(content) && !user) return new Response('File no longer available',{status:404,headers:noCache});
    const embedded = (resumeFiles as Record<string,string>)[id];
    if (embedded) return new Response(Uint8Array.from(atob(embedded),c=>c.charCodeAt(0)), {
      headers:{...noCache,'Content-Type':'application/pdf','Content-Disposition':`${new URL(req.url).searchParams.has('download')?'attachment':'inline'}; filename="aditya-${id}.pdf"`,'X-Content-Type-Options':'nosniff','Content-Security-Policy':'sandbox'},
    });
    const client = user?.client ?? publicDatabase();
    const {data:info,error} = await client.from('portfolio_media').select('id,type,ready').eq('id',id).eq('ready',true).single();
    if (error || !info) return new Response('Not found',{status:404,headers:noCache});
    // Stream from Storage: uploaded files can exceed Vercel's buffered response limit.
    const {data:signed,error:signError} = await client.storage.from('portfolio-media').createSignedUrl(id,30,{download:new URL(req.url).searchParams.has('download')});
    if (signError || !signed) return new Response('Not found',{status:404,headers:noCache});
    const response=await fetch(new URL(signed.signedUrl,supabaseUrl),{cache:'no-store'});
    if(!response.ok)return new Response('File unavailable',{status:404,headers:noCache});
    return new Response(response.body,{headers:{...noCache,'Content-Type':info.type,'X-Content-Type-Options':'nosniff','Content-Security-Policy':'sandbox','Content-Disposition':`${new URL(req.url).searchParams.has('download')?'attachment':'inline'}; filename="aditya-${id}.${info.type==='application/pdf'?'pdf':info.type.split('/')[1]}"`}});
  } catch (error) {return fail(error);}
}
