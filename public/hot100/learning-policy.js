(()=>{
const FULL=['intuition','syntax','translate','meaning','fill','trace','full','recall'];
function curriculum(){return window.HOT100_CURRICULUM||[]}
function patternOf(p){return window.HOT100_PRODUCT_CATALOG?.patternFor(p)||{id:p?.topic||'other',zh:p?.topic||'其他',en:p?.topicEn||'Other'}}
function patternId(p){return patternOf(p).id}
function cardsDone(slug){try{return typeof doneCards==='function'?doneCards(slug):(state?.completedCards?.[slug]||[])}catch(e){return []}}
function solvedLevel(slug){try{return state?.solved?.[slug]?.level||null}catch(e){return null}}
function attemptsFor(slug){try{return state?.attempts?.[slug]?.runs||[]}catch(e){return []}}
function interviewHistory(slug){try{return (state?.attempts?.__adaptive?.interviews||[]).filter(x=>x.slug===slug)}catch(e){return []}}
function hasStarted(p){return cardsDone(p.slug).length>0||Boolean(solvedLevel(p.slug))}
function scaffoldPlan(){return{stage:'learn',support:'full',cards:FULL,reason:'user-controlled-modes'}}
function masteryEvidence(p){
  const done=new Set(cardsDone(p.slug));
  const runs=attemptsFor(p.slug),interviews=interviewHistory(p.slug);
  const solve=solvedLevel(p.slug)==='solo'||runs.some(x=>x.passed===true);
  const understand=done.has('meaning')||done.has('trace')||done.size>=4;
  const reproduce=done.has('fill')||done.size>=6;
  const transfer=interviews.some(x=>x.passed&&Number(x.hintsUsed||0)===0);
  const solvedAt=state?.solved?.[p.slug]?.completedAt?new Date(state.solved[p.slug].completedAt).getTime():0;
  const ageDays=solvedAt?Math.floor((Date.now()-solvedAt)/86400000):0;
  const retain=solve&&ageDays>=1&&interviews.some(x=>x.passed);
  const score=[understand,reproduce,solve,retain,transfer].filter(Boolean).length;
  const level=solve&&(retain||transfer)?'mastered':solve||score>=3?'basic':'learning';
  return{understand,reproduce,solve,retain,transfer,score,level};
}
function localDay(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function isDue(slug,day=localDay()){try{return (state.reviewQueue||[]).some(r=>r.slug===slug&&r.due<=day)}catch(e){return false}}
function problemWeakness(p){
  if(!hasStarted(p))return 0;
  const level=solvedLevel(p.slug);let score=0;
  if(!level)score+=3.2;else if(level==='hard')score+=4.8;else if(level==='hint')score+=2.4;else score+=0.45;
  if(isDue(p.slug))score+=1.7;
  const runs=attemptsFor(p.slug).slice(-8),fails=runs.filter(x=>x.passed===false).length;
  if(runs.length)score+=Math.min(2.5,fails*.42+(fails/runs.length)*1.2);
  const ints=interviewHistory(p.slug).slice(-4);
  for(const r of ints)score+=r.passed?Math.min(1.5,Number(r.hintsUsed||0)*.35):1.9;
  try{score+=Math.min(1.6,Number(state?.attempts?.__adaptive?.mistakes?.[p.slug]||0)*.25)}catch(e){}
  return Math.round(Math.min(10,score)*10)/10;
}
function weakPatterns(limit=4){
  const groups=new Map();
  for(const p of curriculum()){
    if(!hasStarted(p))continue;
    const pattern=patternOf(p),score=problemWeakness(p),g=groups.get(pattern.id)||{pattern,score:0,n:0,problems:[]};
    g.score+=score;g.n+=1;g.problems.push({p,score});groups.set(pattern.id,g)
  }
  return [...groups.values()].map(g=>({...g,score:Math.round(g.score/Math.max(1,g.n)*10)/10,problems:g.problems.sort((a,b)=>b.score-a.score)})).sort((a,b)=>b.score-a.score).slice(0,limit)
}
function nextProgressProblem(){
  const list=curriculum();if(!list.length)return null;
  let i=0;try{i=Math.max(0,Math.min(list.length-1,Number(state.currentProblem)||0))}catch(e){}
  const here=list[i];
  if(here&&!state?.solved?.[here.slug])return{p:here,index:i};
  for(let step=1;step<list.length;step++){
    const j=(i+step)%list.length,p=list[j];if(!state?.solved?.[p.slug])return{p,index:j}
  }
  return{p:here,index:i}
}
function todayPlan(minutes=20){
  const list=curriculum(),day=localDay(),tasks=[],seen=new Set();
  const add=(task)=>{if(!task||seen.has(task.slug))return false;seen.add(task.slug);tasks.push(task);return true};
  try{
    const due=(state.reviewQueue||[]).filter(x=>x.due<=day).sort((a,b)=>a.due.localeCompare(b.due));
    for(const r of due.slice(0,2)){
      const index=list.findIndex(x=>x.slug===r.slug),p=list[index];if(p)add({type:'review',slug:p.slug,index,minutes:6,title:p.title,patternId:patternId(p),reason:'due-review'})
    }
  }catch(e){}
  const progress=nextProgressProblem();
  if(progress)add({type:hasStarted(progress.p)?'continue':'learn',slug:progress.p.slug,index:progress.index,minutes:8,title:progress.p.title,patternId:patternId(progress.p),reason:hasStarted(progress.p)?'continue-progress':'next-problem'});
  const weak=weakPatterns(3).find(g=>g.problems.some(x=>!seen.has(x.p.slug)&&x.score>0));
  if(weak){
    const hit=weak.problems.find(x=>!seen.has(x.p.slug)&&x.score>0),index=hit?list.indexOf(hit.p):-1;
    if(hit&&index>=0)add({type:'weak',slug:hit.p.slug,index,minutes:6,title:hit.p.title,patternId:weak.pattern.id,patternName:weak.pattern.zh,patternNameEn:weak.pattern.en,reason:'weak-pattern',weakness:hit.score})
  }
  if(tasks.length<2){
    const first=list.findIndex(p=>!seen.has(p.slug)&&!state?.solved?.[p.slug]);if(first>=0){const p=list[first];add({type:'learn',slug:p.slug,index:first,minutes:8,title:p.title,patternId:patternId(p),reason:'next-problem'})}
  }
  const cap=minutes<=10?1:minutes<=20?2:3;let selected=tasks.slice(0,cap),total=selected.reduce((s,x)=>s+x.minutes,0);
  if(total>minutes&&selected.length){
    const scale=minutes/total;selected=selected.map((x,i)=>({...x,minutes:Math.max(i===selected.length-1?5:4,Math.round(x.minutes*scale))}));total=selected.reduce((s,x)=>s+x.minutes,0)
  }
  return{minutes,total,tasks:selected,weakPatterns:weakPatterns(3)}
}
window.HOT100_LEARNING_POLICY={scaffoldPlan,masteryEvidence,todayPlan,patternId,problemWeakness,weakPatterns,hasStarted,cards:{full:FULL},principle:'user-controlled-modes'};
})();