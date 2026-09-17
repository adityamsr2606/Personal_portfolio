export type ContributionDay={date:string;count:number|null;level:number};
// Parse only GitHub's public calendar attributes; no remote markup reaches the browser.
export function parseContributions(html:string):ContributionDay[] {
 const tips=new Map<string,number>();
 for(const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)){
  const id=/for="([^"]+)"/.exec(match[1])?.[1];
  const text=match[2].replace(/<[^>]*>/g,'').trim();
  const count=/^(No|[\d,]+) contributions?\b/i.exec(text)?.[1];
  if(id&&count)tips.set(id,count.toLowerCase()==='no'?0:Number(count.replaceAll(',','')));
 }
 const days:ContributionDay[]=[];
 for(const match of html.matchAll(/<(?:td|rect)\b[^>]*data-date="\d{4}-\d{2}-\d{2}"[^>]*>/g)){
  const tag=match[0],date=/data-date="([^"]+)"/.exec(tag)?.[1];
  const level=Number(/data-level="([0-4])"/.exec(tag)?.[1]);
  const id=/\bid="([^"]+)"/.exec(tag)?.[1];
  const direct=/data-count="(\d+)"/.exec(tag)?.[1];
  if(date&&Number.isInteger(level))days.push({date,level,count:direct?Number(direct):id&&tips.has(id)?tips.get(id)!:level===0?0:null});
 }
 return [...new Map(days.map(d=>[d.date,d])).values()].sort((a,b)=>a.date.localeCompare(b.date));
}
