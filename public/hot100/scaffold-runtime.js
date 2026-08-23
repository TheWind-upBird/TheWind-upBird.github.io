(()=>{
const Catalog=window.HOT100_PRODUCT_CATALOG,Policy=window.HOT100_LEARNING_POLICY;
if(!Catalog||!Policy||typeof buildCards!=='function')return;
const SLOT='__scaffoldPlans',VERSION=1,PILOT=new Set(Catalog.pilotPatterns||[]);
const baseBuildCards=buildCards;
function store(){state.attempts=state.attempts||{};return state.attempts[SLOT]||(state.attempts[SLOT]={})}
function rawCards(p){try{return baseBuildCards(p)||[]}catch(e){return []}}
function hasLegacyProgress(p){try{return (doneCards(p.slug)||[]).length>0||Boolean(state.solved?.[p.slug])}catch(e){return false}}
function resolvePlan(p,cards){
  const allIds=cards.map(c=>c.id),plans=store(),saved=plans[p.slug];
  if(saved?.version===VERSION&&Array.isArray(saved.cards)&&saved.cards.length){
    const valid=saved.cards.filter(id=>allIds.includes(id));if(valid.length)return{...saved,cards:valid};
  }
  const pattern=Catalog.patternFor(p),pilot=PILOT.has(pattern.id);
  let chosen=allIds,stage='learn',reason='full-default';
  if(p.slug!=='two-sum'&&pilot&&!hasLegacyProgress(p)){
    const policy=Policy.scaffoldPlan(p);chosen=policy.cards.filter(id=>allIds.includes(id));stage=policy.stage;reason=policy.reason;
  }else if(p.slug==='two-sum'){reason='two-sum-canonical'}
  else if(hasLegacyProgress(p)){reason='legacy-progress-preserved'}
  if(!chosen.length)chosen=allIds;
  const plan={version:VERSION,cards:chosen,stage,reason,role:p.productMeta?.role||'anchor',patternId:pattern.id,lockedAt:new Date().toISOString()};
  plans[p.slug]=plan;try{persist()}catch(e){}return plan;
}
buildCards=function(p){
  const cards=rawCards(p);if(!p||!cards.length)return cards;
  const plan=resolvePlan(p,cards),allowed=new Set(plan.cards),filtered=cards.filter(c=>allowed.has(c.id));
  return filtered.length?filtered:cards;
};
function cardsFor(p=current()){try{return buildCards(p)||[]}catch(e){return []}}
function countFor(p=current()){return Math.max(1,cardsFor(p).length||CARD_COUNT)}
function touch(p){if(!p)return;state.lastTouched=state.lastTouched||{};state.lastTouched[p.slug]=Date.now()}
function resumeFor(p){
  const total=countFor(p),n=Number(state.positions?.[p.slug]);
  if(Number.isFinite(n))return Math.max(0,Math.min(total,n));
  if(state.solved?.[p.slug])return total;
  return 0;
}
function indexForCard(p,ids,fallback=0){const cards=cardsFor(p);for(const id of ids){const i=cards.findIndex(c=>c.id===id);if(i>=0)return i}return Math.max(0,Math.min(cards.length-1,fallback))}
openProblem=function(index){
  state.positions=state.positions||{};state.reviewing=null;state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,index));const p=current();state.deckIndex=resumeFor(p);touch(p);persist();showPage('deck')
};
nextProblem=function(){
  state.positions=state.positions||{};state.reviewing=null;
  if(state.currentProblem<CURRICULUM.length-1){state.currentProblem+=1;const p=current();state.deckIndex=resumeFor(p);touch(p);save();renderCard();window.scrollTo({top:0,behavior:'smooth'})}else showPage('home')
};
nextCard=function(){
  state.positions=state.positions||{};const p=current(),total=countFor(p);state.deckIndex=state.deckIndex<total-1?state.deckIndex+1:total;if(!state.reviewing&&p)state.positions[p.slug]=state.deckIndex;touch(p);save();renderCard();window.scrollTo({top:0,behavior:'smooth'})
};
prevCard=function(){
  state.positions=state.positions||{};const p=current();if(state.deckIndex>0)state.deckIndex-=1;if(!state.reviewing&&p)state.positions[p.slug]=state.deckIndex;touch(p);save();renderCard();window.scrollTo({top:0,behavior:'smooth'})
};
showPage=function(name){
  state.positions=state.positions||{};
  if(name==='deck'&&!state.reviewing){const p=current();if(p)state.deckIndex=resumeFor(p)}
  if(name==='deck')touch(current());state.lastPage=name;persist();
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));
  document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  if(name==='deck')renderCard();if(name==='problems')renderProblems();if(name==='knowledge')renderKnowledge();if(name==='review')renderReview();
  window.scrollTo({top:0,behavior:'smooth'})
};
window.openHot100Review=function(index){
  state.positions=state.positions||{};state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,index));const p=current(),item=state.reviewQueue.find(r=>r.slug===p.slug)||null,level=state.solved[p.slug]?.level;
  state.reviewing={slug:p.slug,type:item?.type||'复习',openedAt:new Date().toISOString()};
  state.deckIndex=level==='solo'?indexForCard(p,['full'],0):level==='hint'?indexForCard(p,['fill','trace','full'],0):0;
  touch(p);persist();showPage('deck')
};
const previousRenderCard=renderCard;
renderCard=function(){
  const p=current();if(!p)return;const total=countFor(p);if(state.deckIndex>total)state.deckIndex=total;previousRenderCard();
  if(!state.reviewing){state.positions=state.positions||{};state.positions[p.slug]=Math.min(state.deckIndex,total)}
  if(state.deckIndex<total)return;
  if(!state.reviewing){$('again')?.addEventListener('click',()=>{state.positions[p.slug]=0;touch(p);persist()});return}
  const next=$('nextProblem');if(next){const clone=next.cloneNode(true);next.replaceWith(clone);clone.textContent='返回复习';clone.addEventListener('click',()=>{state.reviewing=null;persist();showPage('review')})}
  const home=$('doneHome');if(home){const clone=home.cloneNode(true);home.replaceWith(clone);clone.addEventListener('click',()=>{state.reviewing=null;persist();showPage('home')})}
  const again=$('again');if(again){const clone=again.cloneNode(true);again.replaceWith(clone);clone.textContent='再复习一次';clone.addEventListener('click',()=>{const level=state.solved[p.slug]?.level;state.deckIndex=level==='solo'?indexForCard(p,['full'],0):level==='hint'?indexForCard(p,['fill','trace','full'],0):0;renderCard()})}
};
const previousRenderProblems=renderProblems;
renderProblems=function(){
  previousRenderProblems();
  document.querySelectorAll('[data-problem]').forEach(row=>{
    const i=Number(row.dataset.problem),p=CURRICULUM[i],meta=row.querySelector('.problemMeta');if(!p||!meta)return;
    meta.textContent=meta.textContent.replace(/ · 第 \d+\/8 步/g,'');
    const total=countFor(p),pos=resumeFor(p);if(pos>0&&pos<total)meta.textContent+=` · 进度 ${Math.round(pos/total*100)}%`;
  })
};
function currentPlan(p=current()){const cards=rawCards(p);return p?resolvePlan(p,cards):null}
window.HOT100_SCAFFOLD_RUNTIME={version:VERSION,mode:'pilot',pilotPatterns:[...PILOT],cardsFor,countFor,resumeFor,currentPlan,resetPlan(slug){const plans=store();if(slug)delete plans[slug];else state.attempts[SLOT]={};persist()}};
try{renderHome();if(document.getElementById('page-deck')?.classList.contains('active'))renderCard();if(document.getElementById('page-problems')?.classList.contains('active'))renderProblems()}catch(e){console.error('Scaffold runtime refresh failed',e)}
})();