'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import type {ContributionDay} from '@/lib/github';
type Calendar={username:string;days:ContributionDay[];checkedAt:string;source:string};
export default function GitHubActivity({profile}:{profile:string}) {
 const [data,setData]=useState<Calendar|null>(null),[error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();
  const refresh=async()=>{try{const response=await fetch('/api/github',{signal:controller.signal});const result=await response.json() as Calendar & {error?:string};if(!response.ok)throw Error(result.error);setData(result);setError('');}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'GitHub activity is unavailable.');}};
  void refresh();const interval=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},300000);
  return()=>{controller.abort();clearInterval(interval);};
 },[profile]);
 const total=data&&data.days.every(day=>day.count!==null)?data.days.reduce((sum,day)=>sum+(day.count??0),0):null;
 const first=data?new Date(data.days[0].date+'T00:00:00Z').getUTCDay():0;
 return <section className="section github-section"><div className="section-heading"><div><div className="eyebrow">OPEN SOURCE / DAILY PRACTICE</div><h2>Work, <em>in motion.</em></h2></div><a href={profile} className="text-link" target="_blank" rel="noreferrer">View GitHub<ArrowUpRight size={18}/></a></div>
 {data?<><div className="github-caption"><span>{total!==null?total.toLocaleString()+' contributions':'Contribution activity'} · past year</span><span>@{data.username}</span></div><div className="github-scroll" tabIndex={0} role="region" aria-label="Daily GitHub contributions; scroll horizontally to see the full year"><div className="github-grid">{Array.from({length:first},(_,i)=><span key={'spacer'+i}/>)}{data.days.map(day=><a key={day.date} href={data.source+'?tab=overview&from='+day.date+'&to='+day.date} target="_blank" rel="noreferrer" className={'github-day level-'+day.level} aria-label={day.date+': '+(day.count===null?'activity level '+day.level:day.count+' contributions')} title={day.date+': '+(day.count===null?'activity level '+day.level:day.count+' contributions')}/>)}</div></div><div className="github-foot"><span>Checked {new Date(data.checkedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · refreshes every 5 minutes</span><span className="github-legend">Less {[0,1,2,3,4].map(level=><i key={level} className={'github-day level-'+level}/>)} More</span></div>{error&&<p role="status">Showing the last available activity. {error}</p>}</>:<p role="status">{error||'Loading GitHub activity…'}</p>}</section>;
}
