import type {Metadata} from 'next';
import {type Content,visible} from './content';
export const SITE_URL=process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'https://aditya-portfolio-theta-smoky.vercel.app');
export const pageNames:Record<string,string>={'/':'Portfolio','/projects':'Projects','/about':'About','/experience':'Experience','/skills':'Skills','/achievements':'Achievements','/certificates':'Certificates','/resumes':'Résumés','/contact':'Contact'};
export function pageRecord(content:Content,path:string){
 const hidden=new Set(content.settings.hidden.split(',').map((s:string)=>s.trim()).filter(Boolean));
 const parts=path.split('/').filter(Boolean);
 const record=parts.length===2&&['projects','profiles'].includes(parts[0])?visible(content,parts[0]==='profiles'?'roles':'projects').find(x=>x.id===parts[1]):undefined;
 const available=!!(pageNames[path]||record)&&!hidden.has(parts[0])&&!(parts[0]==='profiles'&&hidden.has('projects'));
 const title=available?(path==='/'?`${content.profile.name} — Data, Intelligence & Engineering`:`${record?.title||pageNames[path]} — ${content.profile.name}`):`Page unavailable — ${content.profile.name}`;
 const description=(available?(record?.description||(path==='/about'?content.profile.about:content.profile.introduction)):'This page is unavailable. Explore the other sections of the portfolio.').replace(/\s+/g,' ').slice(0,180);
 return{available,title,description};
}
export function portfolioMetadata(content:Content,path:string):Metadata{
 const {available,title,description}=pageRecord(content,path);
 return{title,description,alternates:{canonical:SITE_URL+path},robots:{index:available,follow:available},openGraph:{type:'website',locale:'en_IN',siteName:content.profile.name,title,description,url:SITE_URL+path},twitter:{card:'summary',title,description}};
}
