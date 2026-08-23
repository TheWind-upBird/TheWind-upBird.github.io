(()=>{
const FULL=['intuition','syntax','translate','meaning','fill','trace','full','recall'];
const GUIDED=['intuition','translate','fill','trace','full','recall'];
const LIGHT=['translate','trace','full','recall'];
const PROVE=['full','recall'];
function curriculum(){return window.HOT100_CURRICULUM||[]}
function patternId(p){return window.HOT100_PRODUCT_CATALOG?.patternFor(p)?.id||p?.topic||'other'}
function cardsDone(slug){try{return typeof doneCards==='function'?doneCards(slug):(state?.completedCards?.[slug]||[])}catch(e){return []}}
function solvedLevel(slug){try{return state?.solved?.[slug]?.level||null}catch(e){return null}}
function attemptsFor(slug){try{return state?.attempts?.[slug]?.runs||[]}catch(e){return []}}
function interviewHistory(slug){try{return (state?.attempts?.__adaptive?.interviews||[]).filter(x=>x.slug===slug)}catch(e){return []}}
function hasMeaningfulExposure(p){return Boolean(solvedLevel(p.slug))||cardsDone(p.slug).length>=4}
function learnedInPattern(p){const id=patternId(p);return curriculum().filter(x=>x.slug!==p.slug&&patternId(x)===id&&hasMeaningfulExposure(x)).length}
function scaffoldPlan(p){
  const role=p?.productMeta?.role||'anchor';
  const exposure=learnedInPattern(p);
  if(role==='interview'){
    if(exposure===0)return{stage:'learn',cards:FULL,exposure,reason:'interview-without-foundation'};
    if(exposure===1)return{stage:'practice',cards:LIGHT,exposure,reason:'interview-with-light-support'};
    return{stage:'prove',cards:PROVE,exposure,reason:'interview-ready'};
  }
  if(role==='transfer'){
    if(exposure===0)return{stage:'learn',cards:FULL,exposure,reason:'transfer-without-anchor'};
    if(exposure===1)return{stage:'practice',cards:LIGHT,exposure,reason:'first-transfer'};
    return{stage:'prove',cards:PROVE,exposure,reason:'repeated-transfer'};
  }
  if(exposure===0)return{stage:'learn',cards:FULL,exposure,reason:'first-pattern-exposure'};
  if(exposure===1)return{stage:'practice',cards:GUIDED,exposure,reason:'second-pattern-exposure'};
  if(exposure<=3)return{stage:'practice',cards:LIGHT,exposure,reason:'fading-scaffold'};
  return{stage:'prove',cards:PROVE,exposure,reason:'established-pattern'};
}
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
function todayPlan(minutes=20){
  const list=curriculum();const day=localDay();const tasks=[];const seen=new Set();
  try{
    for(const r of (state.reviewQueue||[]).filter(x=>x.due<=day).slice(0,2)){
      const p=list.find(x=>x.slug===r.slug);if(p&&!seen.has(p.slug)){tasks.push({type:'review',slug:p.slug,index:list.indexOf(p),minutes:6,title:p.title});seen.add(p.slug)}
    }
  }catch(e){}
  try{
    if(typeof weakProblems==='function'){
      const w=weakProblems(3).find(x=>!seen.has(x.p.slug));
      if(w){tasks.push({type:'practice',slug:w.p.slug,index:w.i,minutes:7,title:w.p.title});seen.add(w.p.slug)}
    }
  }catch(e){}
  let currentIndex=0;try{currentIndex=Math.max(0,Math.min(list.length-1,state.currentProblem||0))}catch(e){}
  const current=list[currentIndex];
  if(current&&!seen.has(current.slug)){
    const locked=window.HOT100_SCAFFOLD_RUNTIME?.currentPlan?.(current),policy=locked||scaffoldPlan(current);
    tasks.push({type:policy.stage==='prove'?'prove':policy.stage==='practice'?'practice':'learn',slug:current.slug,index:currentIndex,minutes:Math.max(7,minutes-tasks.reduce((s,x)=>s+x.minutes,0)),title:current.title,stage:policy.stage});seen.add(current.slug)
  }
  if(!tasks.length&&list[0])tasks.push({type:'learn',slug:list[0].slug,index:0,minutes,title:list[0].title,stage:'learn'});
  let total=tasks.reduce((s,x)=>s+x.minutes,0);
  if(total>minutes&&tasks.length){const scale=minutes/total;tasks.forEach((x,i)=>x.minutes=Math.max(i===tasks.length-1?5:4,Math.round(x.minutes*scale)));total=tasks.reduce((s,x)=>s+x.minutes,0)}
  return{minutes,total,tasks:tasks.slice(0,minutes<=10?1:minutes<=20?2:3)};
}
window.HOT100_LEARNING_POLICY={scaffoldPlan,masteryEvidence,todayPlan,patternId,learnedInPattern,hasMeaningfulExposure,cards:{full:FULL,guided:GUIDED,light:LIGHT,prove:PROVE}};
})();