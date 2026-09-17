import {portfolioMetadata} from '@/lib/page-metadata';
import Portfolio from './portfolio';
import {readContent} from '@/lib/server';
export const dynamic='force-dynamic';
export async function generateMetadata(){try{return portfolioMetadata((await readContent()).content,'/')}catch{return {title:'Portfolio',robots:{index:false,follow:false}}}}
export default async function Home(){try{const row=await readContent();return <Portfolio initial={row.content} initialRevision={row.revision} path="/"/>}catch{return <main className="unavailable"><h1>The archive is temporarily unavailable.</h1><p>Please try again shortly.</p><a href="/">Reload</a></main>}}
