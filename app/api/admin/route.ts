import {normalizeContent, publicContent} from '@/lib/content';
import {admin,sameOrigin,fail,noCache} from '@/lib/server';
import {contentSchema} from '@/lib/validation';
import {cookies} from 'next/headers';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await admin();
  if (!user) return Response.json({error:'Administrator access required'}, {status:403});
  try {
    const [state, history] = await Promise.all([
      user.client.from('portfolio_state').select('*').eq('id','main').single(),
      user.client.from('portfolio_history').select('id,revision,created_at').order('id',{ascending:false}).limit(20),
    ]);
    if (state.error) throw state.error;
    if (history.error) throw history.error;
    const row = state.data;
    // Scoped cookie lets image/PDF previews authenticate without putting tokens in URLs.
    (await cookies()).set('portfolio-media-session',user.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/media',maxAge:300});
    return Response.json({content:normalizeContent(row.data), draft:row.draft?normalizeContent(row.draft):null,
      revision:row.revision, history:history.data}, {headers:noCache});
  } catch (error) {return fail(error);}
}
export async function POST(req: Request) {
  const user = await admin();
  if (!user) return Response.json({error:'Administrator access required'}, {status:403});
  if (!sameOrigin(req)) return Response.json({error:'Invalid origin'}, {status:403});
  try {
    const raw = await req.text();
    if (raw.length > 1500000) return Response.json({error:'Content too large'}, {status:413});
    let body;
    try {body = JSON.parse(raw);} catch {return Response.json({error:'Invalid JSON'}, {status:400});}
    if (!Number.isInteger(body.revision)) return Response.json({error:'Revision is required'}, {status:400});
    if (body.action === 'restore') {
      const {data,error} = await user.client.from('portfolio_history').select('data').eq('id',body.historyId).single();
      if (error || !data) return Response.json({error:'Version not found'}, {status:404});
      body.content = normalizeContent(data.data);
      body.action = 'draft';
    }
    if (!['draft','publish'].includes(body.action)) return Response.json({error:'Unknown action'}, {status:400});
    const parsed = contentSchema.safeParse(body.content);
    if (!parsed.success) return Response.json({error:parsed.error.issues.map(x=>x.path.join('.')+': '+x.message).join('; ')}, {status:400});
    // A database transaction locks the revision and publishes history + public content atomically.
    const {data:revision,error} = await user.client.rpc('save_portfolio', {
      expected_revision:body.revision, new_data:parsed.data, public_data:publicContent(parsed.data),
      save_action:body.action, editor_id:user.userId,
    });
    if (error?.code === '40001') return Response.json({error:'Content changed in another session. Reload before saving.'}, {status:409});
    if (error) throw error;
    return Response.json({revision,content:parsed.data}, {headers:noCache});
  } catch (error) {return fail(error);}
}

export async function DELETE(req:Request){
  if(!sameOrigin(req))return Response.json({error:'Invalid origin'},{status:403});
  (await cookies()).set('portfolio-media-session','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/media',maxAge:0});
  return Response.json({ok:true},{headers:noCache});
}
