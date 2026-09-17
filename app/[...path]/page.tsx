import Portfolio from '../portfolio';
import {readContent} from '@/lib/server';
import {portfolioMetadata,pageRecord} from '@/lib/page-metadata';
import {initialContent, publicContent} from '@/lib/content';
import {notFound} from 'next/navigation';

export const dynamic='force-dynamic';

async function routeContent(){
  try{return await readContent()}
  catch(error){
    console.error('Falling back to bundled portfolio content', error);
    return {content:publicContent(initialContent), revision:0};
  }
}

export async function generateMetadata({params}:{params:Promise<{path:string[]}>}){
  const {path}=await params;
  const row=await routeContent();
  return portfolioMetadata(row.content,'/'+path.join('/'));
}

export default async function Page({params}:{params:Promise<{path:string[]}>}){
  const {path}=await params;
  const row=await routeContent();
  const route='/'+path.join('/');
  if(!pageRecord(row.content,route).available)notFound();
  return <Portfolio initial={row.content} initialRevision={row.revision} path={route}/>;
}
