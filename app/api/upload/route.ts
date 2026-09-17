import {admin,sameOrigin,fail,noCache} from '@/lib/server';
const bucket = 'portfolio-media';
const accepted = ['application/pdf','image/png','image/jpeg','image/webp'];
function fileType(bytes: Uint8Array) {
  if (bytes[0]===37 && bytes[1]===80 && bytes[2]===68 && bytes[3]===70 && bytes[4]===45) return 'application/pdf';
  if ([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)) return 'image/png';
  if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  const text = new TextDecoder();
  if (text.decode(bytes.slice(0,4))==='RIFF' && text.decode(bytes.slice(8,12))==='WEBP') return 'image/webp';
  return null;
}
export async function POST(req: Request) {
  const user = await admin();
  if (!user) return Response.json({error:'Administrator access required'}, {status:403});
  if (!sameOrigin(req)) return Response.json({error:'Invalid origin'}, {status:403});
  try {
    const body = await req.json() as {action?:string;type:string;size:number;name:string;id:string};
    if (body.action==='prepare') {
      if (!accepted.includes(body.type) || !Number.isInteger(body.size) || body.size<1 || body.size>10000000 || typeof body.name!=='string') {
        return Response.json({error:'Choose a PDF, JPEG, PNG, or WebP under 10 MB'}, {status:400});
      }
      const id = crypto.randomUUID();
      const {error} = await user.client.from('portfolio_media').insert({id,name:body.name.slice(0,200),type:body.type,size:body.size,owner:user.userId});
      if (error) throw error;
      const signed = await user.client.storage.from(bucket).createSignedUploadUrl(id);
      if (signed.error) {await user.client.from('portfolio_media').delete().eq('id',id);throw signed.error;}
      return Response.json({id,token:signed.data.token}, {headers:noCache});
    }
    if (body.action!=='complete' || typeof body.id!=='string') return Response.json({error:'Invalid upload request'}, {status:400});
    const {data:info,error} = await user.client.from('portfolio_media').select('*').eq('id',body.id).eq('owner',user.userId).single();
    if (error || !info) return Response.json({error:'Upload not found'}, {status:404});
    const object = await user.client.storage.from(bucket).download(info.id);
    if (object.error) throw object.error;
    const bytes = new Uint8Array(await object.data.arrayBuffer());
    if (bytes.length!==info.size || fileType(bytes)!==info.type) {
      await user.client.storage.from(bucket).remove([info.id]);
      await user.client.from('portfolio_media').delete().eq('id',info.id);
      return Response.json({error:'File contents do not match the selected format'}, {status:400});
    }
    const saved = await user.client.from('portfolio_media').update({ready:true}).eq('id',info.id);
    if (saved.error) throw saved.error;
    return Response.json({url:'/api/media/'+info.id,type:info.type,name:info.name}, {headers:noCache});
  } catch (error) {return fail(error);}
}
