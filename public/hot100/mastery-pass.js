(()=>{
const Policy=window.HOT100_LEARNING_POLICY;
const HOUR=3600000,RETAIN_GAP=20*HOUR;
let masteryFilter='全部';
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function done(slug){try{return typeof doneCards==='function'?doneCards(slug):(state.completedCards?.[slug]||[])}catch(e){return[]}}
function runs(slug){const x=state.attempts?.[slug];return x&&Array.isArray(x.runs)?x.runs:[]}
function interviews(slug){return (state.attempts?.__adaptive?.interviews||[]).filter(x=>x.slug===slug)}
function ts(x){const t=new Date(x||0).getTime();return Number.isFinite(t)?t:0}
function evidence(p){
  const cards=new Set(done(p.slug)),normal=runs(p.slug),ints=interviews(p.slug),solved=state.solved?.[p.slug]||null;
  const passEvents=[...normal.filter(x=>x.passed).map(x=>({at:ts(x.at),kind:'run'})),...ints.filter(x=>x.passed).map(x=>({at:ts(x.at),kind:'interview',hints:Number(x.hintsUsed||0)}))].filter(x=>x.at>0).sort((a,b)=>a.at-b.at);
  const fallbackAt=ts(solved?.completedAt),firstPassAt=passEvents[0]?.at||fallbackAt||0;
  const started=cards.size>0||normal.length>0||Boolean(solved);
  const understand=cards.has('meaning')||cards.has('trace')||cards.size>=4;
  const solve=passEvents.length>0||Boolean(solved);
  const independentInterview=ints.some(x=>x.passed&&Number(x.hintsUsed||0)===0);
  const delayedPass=Boolean(firstPassAt)&&passEvents.some(x=>x.at-firstPassAt>=RETAIN_GAP);
  const retain=solve&&delayedPass;
  const due=solve&&(state.reviewQueue||[]).some(r=>r.slug===p.slug&&r.due<=today());
  const hard=solved?.level==='hard';
  let key='未开始',label='未开始',cls='new';
  if(started&&!solve){key='学习中';label='学习中';cls='learning'}
  if(solve){key='已写出';label='已写出';cls='basic'}
  if(hard&&solve){key='需加强';label='需加强';cls='weak'}
  if(retain){key='已掌握';label='已掌握';cls='mastered'}
  if(due&&!retain){key='待复习';label='待复习';cls='review'}
  return{started,understand,solve,retain,independentInterview,delayedPass,firstPassAt,key,label,cls,level:key};
}
function stateFor(p){return evidence(p)}
function masteryCounts(ps){
  const xs=ps.map(stateFor);return{
    mastered:xs.filter(x=>x.key==='已掌握').length,
    written:xs.filter(x=>x.key==='已写出').length,
    learning:xs.filter(x=>x.key==='学习中').length,
    weak:xs.filter(x=>x.key==='需加强').length,
    review:xs.filter(x=>x.key==='待复习').length
  }
}
function decorateRows(){
  document.querySelectorAll('#problemList [data-problem]').forEach(row=>{
    const p=CURRICULUM[Number(row.dataset.problem)];if(!p)return;const m=stateFor(p),status=row.querySelector('.problemState');
    if(status){status.textContent=m.label;status.className=`problemState status-${m.cls}`;status.title=m.key==='已掌握'?'已在间隔后再次通过':'掌握度根据实际完成与复习表现更新'}
    row.dataset.mastery=m.key;
  });
}
function applyMasteryFilter(){
  const list=document.getElementById('problemList');if(!list)return;
  list.querySelectorAll('[data-problem]').forEach(row=>{
    const p=CURRICULUM[Number(row.dataset.problem)],wrap=row.closest('.libraryProblemWrap')||row;if(!p)return;const m=stateFor(p);
    const recent=Number(state.lastTouched?.[p.slug]||0)>0;
    const show=masteryFilter==='全部'||(masteryFilter==='最近'?recent:m.key===masteryFilter);
    wrap.classList.toggle('masteryFilteredOut',!show)
  });
  list.querySelectorAll('.libraryPatternGroup').forEach(group=>{
    const any=[...group.querySelectorAll('.libraryProblemWrap')].some(x=>!x.classList.contains('masteryFilteredOut'));
    group.classList.toggle('masteryGroupFilteredOut',!any)
  })
}
function replaceFilterHandlers(){
  const quick=document.querySelector('#page-problems .quickFilters');if(!quick)return;
  [...quick.querySelectorAll('[data-pfilter]')].forEach(old=>{
    const raw=old.dataset.pfilter||old.textContent.trim(),label=raw==='基本掌握'?'已写出':raw;
    const b=old.cloneNode(true);b.textContent=label;b.dataset.pfilter=label;b.classList.toggle('active',label===masteryFilter);old.replaceWith(b);
    b.addEventListener('click',()=>{masteryFilter=label;quick.querySelectorAll('[data-pfilter]').forEach(x=>x.classList.toggle('active',x===b));applyMasteryFilter()})
  })
}
function decorateProblemBank(){decorateRows();replaceFilterHandlers();applyMasteryFilter()}
const baseProblems=typeof renderProblems==='function'?renderProblems:null;
if(baseProblems){renderProblems=function(){baseProblems();decorateProblemBank()}}
function decorateKnowledge(){
  const cards=[...document.querySelectorAll('#knowledgeGrid .knowledgeCard')],topics=[...new Set(CURRICULUM.map(p=>p.topic))];
  cards.forEach((card,i)=>{
    const topic=topics[i];if(!topic)return;const ps=CURRICULUM.filter(p=>p.topic===topic),c=masteryCounts(ps),pct=Math.round(c.mastered/Math.max(1,ps.length)*100);
    const track=card.querySelector('.masterTrack>div');if(track)track.style.width=`${pct}%`;
    const stats=card.querySelector('.knowledgeStats');if(stats)stats.innerHTML=`<span>已掌握 ${c.mastered}</span><span>已写出 ${c.written}</span>${c.learning?`<span>学习中 ${c.learning}</span>`:''}${c.weak?`<span>需加强 ${c.weak}</span>`:''}${c.review?`<span>待复习 ${c.review}</span>`:''}`;
    const bottom=card.querySelector('.knowledgeBottom');if(bottom)bottom.innerHTML=`<span>真正掌握 ${c.mastered} / ${ps.length}</span><span>${pct}%</span>`
  })
}
const baseKnowledge=typeof renderKnowledge==='function'?renderKnowledge:null;
if(baseKnowledge){renderKnowledge=function(){baseKnowledge();decorateKnowledge()}}
function completionCopy(m){
  if(m.key==='已掌握')return['已掌握','你已经隔一段时间再次通过，本题进入已掌握。'];
  if(m.key==='待复习')return['待复习','这题已经写出来了；下一次复习再次通过后，掌握度会继续升级。'];
  if(m.key==='需加强')return['已写出，但还不稳','本次已经通过；系统会更快安排复习。'];
  if(m.solve)return['已写出','先记为“会做”。等下一次间隔复习再次通过后，再升级为“已掌握”。'];
  return['学习中','继续完成本题并通过完整测试。']
}
function decorateCompletion(){
  const p=typeof current==='function'?current():null,card=document.getElementById('studyCard');if(!p||!card||state.deckIndex<CARD_COUNT)return;
  const completion=card.querySelector('.completion');if(!completion||completion.querySelector('.masteryReceipt'))return;const m=stateFor(p),copy=completionCopy(m),box=document.createElement('div');box.className=`masteryReceipt mastery-${m.cls}`;
  box.innerHTML=`<div><small>掌握度</small><b>${copy[0]}</b></div><p>${copy[1]}</p>`;
  const callout=completion.querySelector('.callout');callout?.insertAdjacentElement('afterend',box)
}
const baseRenderCard=typeof renderCard==='function'?renderCard:null;
if(baseRenderCard){renderCard=function(){const r=baseRenderCard();decorateCompletion();return r}}
const baseShowPage=typeof showPage==='function'?showPage:null;
if(baseShowPage){showPage=function(name,...args){const r=baseShowPage.call(this,name,...args);requestAnimationFrame(()=>{if(name==='problems')decorateProblemBank();if(name==='knowledge')decorateKnowledge();if(name==='deck')decorateCompletion()});return r}}
const style=document.createElement('style');style.id='masteryStyles';style.textContent=`
.masteryFilteredOut,.masteryGroupFilteredOut{display:none!important}.masteryReceipt{margin:14px auto 0;max-width:560px;border:1px solid var(--line);border-radius:14px;padding:12px 14px;text-align:left;background:var(--panel,#fff)}.masteryReceipt>div{display:flex;align-items:center;justify-content:space-between;gap:12px}.masteryReceipt small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.masteryReceipt b{font-size:13px}.masteryReceipt p{margin:6px 0 0;color:var(--muted);font-size:11px;line-height:1.55}.mastery-mastered{border-color:#b8e0ca}.mastery-review{border-color:#d6c7a0}html[data-theme="wa2"] .masteryReceipt{background:rgba(255,255,255,.68)}
`;
document.head.appendChild(style);
if(document.getElementById('page-problems')?.classList.contains('active'))decorateProblemBank();
if(document.getElementById('page-knowledge')?.classList.contains('active'))decorateKnowledge();
window.addEventListener('hot100modechange',()=>requestAnimationFrame(()=>{decorateProblemBank();decorateKnowledge()}));
window.HOT100_MASTERY={evidence:stateFor,counts:masteryCounts,retentionGapHours:RETAIN_GAP/HOUR,principle:'evidence-not-self-rating'};
})();