import {readContent,fail,noCache} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await readContent(),{headers:noCache})}catch(e){return fail(e)}}
