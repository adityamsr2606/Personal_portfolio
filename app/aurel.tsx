'use client';
import {useState,useEffect,useRef} from 'react';
import {ArrowUpRight,Send,BookOpen} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
type Reply={answer:string;mode:string;revision:number;sources:{id:string;title:string;url:string}[]};
export default function Aurel({revision}:{revision:number}) {
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [reply,setReply]=useState<Reply|null>(null),[asked,setAsked]=useState('');
 const request=useRef<AbortController|null>(null);
 useEffect(()=>{setReply(null);setAsked('');request.current?.abort();setBusy(false);},[revision]);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function ask(text=question){
  if(!text.trim()||busy)return;
  const controller=new AbortController();request.current=controller;
  setBusy(true);setError('');setAsked(text);setQuestion('');
  try{const response=await fetch('/api/aurel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text}),signal:controller.signal});const data=await response.json() as Reply & {error?:string};if(!response.ok)throw Error(data.error);setReply(data);}
  catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Please try again.');}
  finally{if(!controller.signal.aborted)setBusy(false);}
 }
 return <><button className="aurel-launch" onClick={()=>setOpen(true)} aria-label="Ask AUREL about Aditya"><span className="aurel-seal">A</span><span>Ask AUREL</span></button>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="aurel-dialog"><div className="eyebrow">A GUIDE TO THE ARCHIVE</div><DialogTitle className="aurel-title">AUREL.</DialogTitle><DialogDescription>Explore Aditya’s work, experience, and skills through his published portfolio.</DialogDescription>
 <div className="aurel-reading" aria-live="polite" aria-busy={busy}>
 {!asked&&<><p>Where would you like to begin?</p><div className="aurel-prompts">{['Tell me about Consumer360','What internship experience does Aditya have?','Which machine learning projects has he built?'].map(text=><button key={text} onClick={()=>void ask(text)}>{text}<ArrowUpRight size={16}/></button>)}</div></>}
 {asked&&<p className="aurel-question">{asked}</p>}{busy&&<p role="status">Reading the archive…</p>}
 {reply&&!busy&&<><span className="eyebrow">{reply.mode==='ai'?'AI answer · check the sources':'From the published archive'}</span><p className="aurel-answer">{reply.answer}</p><div className="aurel-sources">{reply.sources.map(source=><a key={source.id} href={source.url}><BookOpen size={14}/>{source.title}<ArrowUpRight size={14}/></a>)}</div></>}
 {error&&<p role="alert">{error}</p>}</div>
 <form className="aurel-form" onSubmit={e=>{e.preventDefault();void ask();}}><label className="sr-only" htmlFor="aurel-question">Your question</label><input id="aurel-question" maxLength={600} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about Aditya’s work…"/><button disabled={busy||!question.trim()} aria-label="Send question"><Send size={18}/></button></form>
 <p className="aurel-note">Answers use published content. Private drafts are excluded.</p></DialogContent></Dialog></>;
}
