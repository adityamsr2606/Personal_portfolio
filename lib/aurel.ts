import {categories,visible,type Content} from './content';
export type Source = {id:string;title:string;url:string;text:string};
export function archiveSources(content:Content):Source[] {
  const hidden=new Set(content.settings.hidden.split(',').map(s=>s.trim()));
  const sources:Source[]=[
    {id:'profile',title:'About Aditya',url:'/about',text:[content.profile.name,content.profile.about,content.profile.introduction,content.profile.educationSummary].join('\n')},
    {id:'contact',title:'Contact',url:'/contact',text:[content.profile.email,content.profile.location,content.profile.github,content.profile.linkedin].join('\n')},
  ];
  for(const category of categories) {
    if(hidden.has(category))continue;
    for(const item of visible(content,category))sources.push({
      id:category+':'+item.id,title:item.title,
      url:category==='projects'?'/projects/'+item.id:category==='roles'?'/profiles/'+item.id:category==='education'?'/about':'/'+category,
      text:[item.title,item.subtitle,item.description,item.details,item.tags].filter(Boolean).join('\n'),
    });
  }
  return sources.filter(s=>!(s.id==='profile'&&hidden.has('about'))&&!(s.id==='contact'&&hidden.has('contact')));
}
const stop=new Set('what which where who how is are a an the does do tell me about his he aditya portfolio please can you have has of and to for in'.split(' '));
export function findSources(question:string,sources:Source[]):Source[] {
  let query=question.toLowerCase();
  const expansions:Record<string,string>={internship:'experience intern',education:'b.tech university academy',contact:'email linkedin location',skills:'python sql toolkit',projects:'project approach',certifications:'certificate',achievements:'recognition contributors',resume:'résumé',yourself:'profile about',background:'profile education experience'};
  for(const [term,extra] of Object.entries(expansions))if(query.includes(term))query+=' '+extra;
  const terms=[...new Set(query.match(/[\p{L}\p{N}+#.]+/gu)??[])].filter(t=>t.length>1&&!stop.has(t));
  if(!terms.length)return sources.filter(s=>s.id==='profile');
  return sources.map(source=>({source,score:terms.reduce((n,term)=>n+(source.title.toLowerCase().includes(term)?5:0)+(source.text.toLowerCase().includes(term)?1:0)+(source.id.includes(term)?2:0),0)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4).map(x=>x.source);
}
export function archiveAnswer(sources:Source[]) {
  if(!sources.length)return 'I could not find that information in Aditya’s published portfolio. You can ask about his projects, experience, education, or skills, or contact him directly.';
  return sources.slice(0,3).map(s=>s.title+'\n'+s.text.slice(0,1100)).join('\n\n');
}
