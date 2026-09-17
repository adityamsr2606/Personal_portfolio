import type {Metadata,Viewport} from 'next';
import './globals.css';
import './fixes.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export const metadata:Metadata={title:'Aditya Mohan Srivastava — Data, Intelligence & Engineering',description:'Explore Aditya’s work in data science, data engineering, machine learning, and analytics. Projects, experience, and role-specific résumés.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem("ams-theme");if(t)document.documentElement.dataset.theme=t;const m=localStorage.getItem("ams-motion");if(m)document.documentElement.dataset.motion=m}catch{}`}}/></head><body>{children}</body></html>}
