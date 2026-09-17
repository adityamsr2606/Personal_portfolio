import {portfolioMetadata} from '@/lib/page-metadata';
import Portfolio from './portfolio';
import {readContent} from '@/lib/server';
import {initialContent, publicContent} from '@/lib/content';

export const dynamic='force-dynamic';

async function homeContent(){
  try{return await readContent()}
  catch(error){
    console.error('Falling back to bundled portfolio content', error);
    return {content:publicContent(initialContent), revision:0};
  }
}

export async function generateMetadata(){
  const row=await homeContent();
  return portfolioMetadata(row.content,'/');
}

export default async function Home(){
  const row=await homeContent();
  return <Portfolio initial={row.content} initialRevision={row.revision} path="/"/>;
}
