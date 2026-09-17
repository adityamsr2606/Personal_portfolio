import type {MetadataRoute} from 'next';
import {SITE_URL} from '@/lib/page-metadata';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/','/signin-with-chatgpt','/signout-with-chatgpt','/callback']},sitemap:SITE_URL+'/sitemap.xml'}}
