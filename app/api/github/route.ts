import {readContent} from '@/lib/server';
import {parseContributions,type ContributionDay} from '@/lib/github';
export const dynamic='force-dynamic';
export async function GET() {
 try {
  const {content}=await readContent();
  const profile=new URL(content.profile.github);
  const username=profile.hostname==='github.com'?profile.pathname.split('/').filter(Boolean)[0]:'';
  if(!/^[a-zA-Z0-9-]{1,39}$/.test(username))return Response.json({error:'A GitHub profile has not been configured.'},{status:404});
  let days:ContributionDay[]=[];
  if(process.env.GITHUB_TOKEN){
   const response=await fetch('https://api.github.com/graphql',{method:'POST',headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}',variables:{login:username}}),next:{revalidate:300},signal:AbortSignal.timeout(10000)});
   if(response.ok){const data=await response.json() as {data?:{user?:{contributionsCollection?:{contributionCalendar?:{weeks?:{contributionDays:{date:string;contributionCount:number;contributionLevel:string}[]}[]}}}}};const levels=['NONE','FIRST_QUARTILE','SECOND_QUARTILE','THIRD_QUARTILE','FOURTH_QUARTILE'];days=(data.data?.user?.contributionsCollection?.contributionCalendar?.weeks??[]).flatMap((week:{contributionDays:{date:string;contributionCount:number;contributionLevel:string}[]})=>week.contributionDays.map(day=>({date:day.date,count:day.contributionCount,level:Math.max(0,levels.indexOf(day.contributionLevel))})));}
  }
  if(!days.length){
   const response=await fetch('https://github.com/users/'+encodeURIComponent(username)+'/contributions',{headers:{Accept:'text/html','User-Agent':'AdityaPortfolio'},next:{revalidate:300},signal:AbortSignal.timeout(10000)});
   if(response.ok)days=parseContributions(await response.text());
  }
  if(days.length<300)throw Error('Calendar unavailable');
  return Response.json({username,days,checkedAt:new Date().toISOString(),source:'https://github.com/'+username,refreshSeconds:300},{headers:{'Cache-Control':'public, max-age=60, s-maxage=300'}});
 }catch{return Response.json({error:'GitHub activity is temporarily unavailable. View the latest activity on GitHub.'},{status:503});}
}
