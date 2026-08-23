(()=>{
const SLOT='__studyModes';
const MODES={
  learn:{zh:'学习',en:'Learn',hintZh:'完整教学，按当前学习流程一步步做',hintEn:'Use the full guided lesson'},
  practice:{zh:'刷题',en:'Practice',hintZh:'直接进入完整编程，卡住可随时切回学习',hintEn:'Jump to full coding; return to Learn anytime'},
  interview:{zh:'面试',en:'Interview',hintZh:'空白编辑器、隐藏知识点，按需解锁提示',hintEn:'Blank editor, hidden topic, progressive hints'}
};
function store(){
  state.attempts=state.attempts||{};
  const x=state.attempts[SLOT]||(state.attempts[SLOT]={});
  x.bySlug=x.bySlug||{};x.learnPositions=x.learnPositions||{};
  return x;
}
function locale(){return window.HOT100_PRODUCT_PROFILE?.get?.().locale||'zh-CN'}
function currentProblemSafe(){try{return typeof current==='function'?current():null}catch(e){return null}}
function modeFor(p=currentProblemSafe()){if(!p)return'learn';const v=store().bySlug[p.slug];return MODES[v]?v:'learn'}
function saveMode(p,mode){if(!p||!MODES[mode])return;store().bySlug[p.slug]=mode;try{persist()}catch(e){}}
function rememberLearnPosition(p){if(!p)return;const n=Number(state.deckIndex);if(Number.isFinite(n))store().learnPositions[p.slug]=Math.max(0,Math.min(CARD_COUNT,n))}
function fullCardIndex(p){try{const cards=buildCards(p)||[],i=cards.findIndex(c=>c.id==='full');return i>=0?i:Math.max(0,CARD_COUNT-2)}catch(e){return Math.max(0,CARD_COUNT-2)}}
function showDeckAt(index){
  showPage('deck');
  state.deckIndex=Math.max(0,Math.min(CARD_COUNT,index));
  try{persist()}catch(e){}
  try{renderCard()}catch(e){}
}
function enterLearn(p){
  const saved=Number(store().learnPositions[p.slug]);
  const fallback=Number(state.positions?.[p.slug]);
  const index=Number.isFinite(saved)?saved:(Number.isFinite(fallback)?Math.min(fallback,CARD_COUNT-1):0);
  showDeckAt(index);
}
function enterPractice(p){showDeckAt(fullCardIndex(p))}
function adaptiveMeta(){
  state.attempts=state.attempts||{};
  const m=state.attempts.__adaptive||(state.attempts.__adaptive={});
  m.interviews=Array.isArray(m.interviews)?m.interviews:[];m.mistakes=m.mistakes||{};
  return m;
}
function enterInterview(p){
  const m=adaptiveMeta(),idx=CURRICULUM.findIndex(x=>x.slug===p.slug);
  if(!m.activeInterview||m.activeInterview.slug!==p.slug){
    m.activeInterview={slug:p.slug,index:idx>=0?idx:state.currentProblem,mode:'specific',startedAt:Date.now(),hintsUsed:0,runs:0,passed:false,recorded:false,code:''};
    try{persist()}catch(e){}
  }
  const trigger=document.querySelector('[data-adaptive-page="interview"]');
  if(trigger){trigger.click();return}
  alert(locale()==='en-US'?'Interview mode is not ready yet.':'面试模式暂时无法打开，请稍后重试。');
  saveMode(p,'learn');enterLearn(p)
}
function setMode(mode){
  const p=currentProblemSafe();if(!p||!MODES[mode])return;
  const old=modeFor(p);
  if(old==='learn'&&document.getElementById('page-deck')?.classList.contains('active'))rememberLearnPosition(p);
  saveMode(p,mode);
  if(mode==='learn')enterLearn(p);else if(mode==='practice')enterPractice(p);else enterInterview(p);
  syncBars();syncTodayMode();
  window.dispatchEvent(new CustomEvent('hot100modechange',{detail:{slug:p.slug,mode}}));
}
function label(mode){const m=MODES[mode]||MODES.learn;return locale()==='en-US'?m.en:m.zh}
function hint(mode){const m=MODES[mode]||MODES.learn;return locale()==='en-US'?m.hintEn:m.hintZh}
function barMarkup(id){
  const p=currentProblemSafe(),mode=modeFor(p),isEn=locale()==='en-US';
  return `<div class="studyModeBar" id="${id}"><div class="studyModeTop"><span><small>${isEn?'MODE':'当前模式'}</small><b>${label(mode)}</b></span><div class="studyModeButtons">${Object.keys(MODES).map(k=>`<button type="button" data-study-mode="${k}" class="${mode===k?'active':''}">${label(k)}</button>`).join('')}</div></div><p>${hint(mode)}</p></div>`
}
function bindBar(bar){bar?.querySelectorAll('[data-study-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.studyMode)))}
function mountDeckBar(){
  const page=document.getElementById('page-deck');if(!page)return;
  let bar=document.getElementById('studyModeBarDeck');
  const head=page.querySelector('.deckHead');
  if(!bar&&head){head.insertAdjacentHTML('afterend',barMarkup('studyModeBarDeck'));bar=document.getElementById('studyModeBarDeck')}
  if(bar){bar.outerHTML=barMarkup('studyModeBarDeck');bindBar(document.getElementById('studyModeBarDeck'))}
}
function mountInterviewBar(){
  const page=document.getElementById('page-interview'),area=document.getElementById('interviewArea');if(!page||!area)return;
  let bar=document.getElementById('studyModeBarInterview');
  if(!bar){area.insertAdjacentHTML('beforebegin',barMarkup('studyModeBarInterview'));bar=document.getElementById('studyModeBarInterview')}
  if(bar){bar.outerHTML=barMarkup('studyModeBarInterview');bindBar(document.getElementById('studyModeBarInterview'))}
}
function syncBars(){mountDeckBar();mountInterviewBar()}
function syncTodayMode(){
  const box=document.getElementById('productTodayPlan');if(!box)return;
  const isEn=locale()==='en-US',mode=modeFor(currentProblemSafe());
  const spans=[...box.querySelectorAll('.productContext span')];
  let chip=spans.find(x=>/^(阶段|Stage|模式|Mode)\s*·/.test(x.textContent.trim()));
  if(!chip&&box.querySelector('.productContext')){chip=document.createElement('span');box.querySelector('.productContext').appendChild(chip)}
  if(chip)chip.textContent=`${isEn?'Mode':'模式'} · ${label(mode)}`;
}
function applyStoredMode(){
  const p=currentProblemSafe();if(!p)return;const mode=modeFor(p);
  if(mode==='practice')enterPractice(p);else if(mode==='interview')enterInterview(p);else syncBars()
}
const baseOpenProblem=typeof openProblem==='function'?openProblem:null;
if(baseOpenProblem){openProblem=function(index){baseOpenProblem(index);setTimeout(()=>applyStoredMode(),0)}}
const baseNextProblem=typeof nextProblem==='function'?nextProblem:null;
if(baseNextProblem){nextProblem=function(){baseNextProblem();setTimeout(()=>applyStoredMode(),0)}}
const baseShowPage=typeof showPage==='function'?showPage:null;
if(baseShowPage){showPage=function(name,...args){const r=baseShowPage.call(this,name,...args);requestAnimationFrame(()=>{syncBars();if(name==='home')syncTodayMode()});return r}}
const style=document.createElement('style');style.id='studyModeStyles';style.textContent=`
.studyModeBar{margin:10px 0 12px;padding:11px 13px;border:1px solid var(--line);border-radius:14px;background:var(--panel,#fff)}.studyModeTop{display:flex;align-items:center;justify-content:space-between;gap:12px}.studyModeTop>span{display:grid;gap:1px}.studyModeTop small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.studyModeTop b{font-size:13px}.studyModeButtons{display:flex;gap:5px;padding:3px;border:1px solid var(--line);border-radius:11px;background:var(--bg,#f6f7fb)}.studyModeButtons button{border:0;background:transparent;color:var(--muted);border-radius:8px;padding:7px 10px;font-size:11px;font-weight:650}.studyModeButtons button.active{background:var(--panel,#fff);color:var(--text);box-shadow:0 1px 5px rgba(20,30,45,.09)}.studyModeBar p{margin:7px 0 0;font-size:10px;color:var(--muted);line-height:1.45}html[data-theme="wa2"] .studyModeBar{background:rgba(255,255,255,.74)}html[data-theme="dark"] .studyModeButtons{background:#10141d}@media(max-width:820px){.studyModeTop{align-items:flex-start;flex-direction:column}.studyModeButtons{width:100%;display:grid;grid-template-columns:repeat(3,1fr)}.studyModeButtons button{padding:8px 5px}.studyModeBar{margin:8px 0 10px}}
`;
document.head.appendChild(style);
syncBars();syncTodayMode();setTimeout(syncBars,120);
window.addEventListener('hot100profilechange',()=>{syncBars();syncTodayMode()});
window.HOT100_STUDY_MODES={modes:MODES,getMode:modeFor,setMode,sync:()=>{syncBars();syncTodayMode()},principle:'user-controlled-per-problem'};
})();