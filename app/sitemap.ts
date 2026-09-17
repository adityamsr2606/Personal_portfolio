import type {MetadataRoute} from 'next';
import {readContent} from '@/lib/server';
import {visible} from '@/lib/content';
import {SITE_URL,pageNames,pageRecord} from '@/lib/page-metadata';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const {content}=await readContent();return [...Object.keys(pageNames),...visible(content,'projects').map(x=>'/projects/'+x.id),...visible(content,'roles').map(x=>'/profiles/'+x.id)].filter(path=>pageRecord(content,path).available).map(path=>({url:SITE_URL+path}))}
