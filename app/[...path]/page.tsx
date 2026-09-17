import Portfolio from '../portfolio';
import {readContent} from '@/lib/server';
import {portfolioMetadata,pageRecord} from '@/lib/page-metadata';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{path:string[]}>}){const {path}=await params;try{return portfolioMetadata((await readContent()).content,'/'+path.join('/'))}catch{return {title:'Portfolio',robots:{index:false,follow:false}}}}
export default async function Page({params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;let row;
 try{row=await readContent()}catch{return <main className="unavailable"><h1>The archive is temporarily unavailable.</h1><a href="/">Try again</a></main>}
 const route='/'+path.join('/');if(!pageRecord(row.content,route).available)notFound();
 return <Portfolio initial={row.content} initialRevision={row.revision} path={route}/>;
}
