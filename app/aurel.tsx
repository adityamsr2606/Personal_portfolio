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
 return <><button className="aurel-launch" onClick={()=>setOpen(true)} aria-label="Ask AUREL"><span className="aurel-seal">A</span><span>Ask AUREL</span></button>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="aurel-dialog"><div className="eyebrow">INTELLIGENT PORTFOLIO ASSISTANT</div><DialogTitle className="aurel-title">AUREL.</DialogTitle><DialogDescription>Ask about Aditya’s portfolio or ask a general question. Portfolio answers stay grounded in published content.</DialogDescription>
 <div className="aurel-reading" aria-live="polite" aria-busy={busy}>
 {!asked&&<><p>What would you like to know?</p><div className="aurel-prompts">{['Tell me about Consumer360','Which machine learning projects has Aditya built?','Explain what a data engineer does','Give me a Python interview question'].map(text=><button key={text} onClick={()=>void ask(text)}>{text}<ArrowUpRight size={16}/></button>)}</div></>}
 {asked&&<p className="aurel-question">{asked}</p>}{busy&&<p role="status">Thinking…</p>}
 {reply&&!busy&&<><span className="eyebrow">{reply.mode==='ai-portfolio'?'AI answer · grounded in portfolio':reply.mode==='ai-general'?'AI answer · general knowledge':'From the published archive'}</span><p className="aurel-answer">{reply.answer}</p>{reply.sources.length>0&&<div className="aurel-sources">{reply.sources.map(source=><a key={source.id} href={source.url}><BookOpen size={14}/>{source.title}<ArrowUpRight size={14}/></a>)}</div>}</>}
 {error&&<p role="alert">{error}</p>}</div>
 <form className="aurel-form" onSubmit={e=>{e.preventDefault();void ask();}}><label className="sr-only" htmlFor="aurel-question">Your question</label><input id="aurel-question" maxLength={600} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask AUREL anything…"/><button disabled={busy||!question.trim()} aria-label="Send question"><Send size={18}/></button></form>
 <p className="aurel-note">Portfolio facts come from published content. General answers use AI knowledge and may not reflect live information.</p></DialogContent></Dialog></>;
}
