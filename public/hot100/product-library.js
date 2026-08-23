(()=>{
const Catalog=window.HOT100_PRODUCT_CATALOG,Modes=window.HOT100_STUDY_MODES,Profile=window.HOT100_PRODUCT_PROFILE;
if(!Catalog||!Modes||typeof renderProblems!=='function')return;
const baseRenderProblems=renderProblems;
let activePattern='all',enhancing=false;
function locale(){return Profile?.get?.().locale||'zh-CN'}
function escHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function patternLabel(pattern){return locale()==='en-US'?(pattern.en||pattern.zh):(pattern.zh||pattern.en)}
function statusCounts(problems){
  let mastered=0,started=0,due=0;const today=new Date().toISOString().slice(0,10);
  for(const p of problems){
    if(state?.solved?.[p.slug]?.level==='solo')mastered++;
    if(state?.solved?.[p.slug]||(state?.completedCards?.[p.slug]||[]).length)started++;
    if((state?.reviewQueue||[]).some(r=>r.slug===p.slug&&r.due<=today))due++
  }
  return{mastered,started,due}
}
function modeDock(index,p){
  const selected=Modes.getMode(p),isEn=locale()==='en-US';
  return `<div class="libraryModeDock" aria-label="${isEn?'Open mode':'打开方式'}">${['learn','practice','interview'].map(mode=>`<button type="button" data-library-mode="${mode}" data-library-index="${index}" class="${selected===mode?'active':''}" title="${escHtml(Modes.hint(mode))}">${escHtml(Modes.label(mode))}</button>`).join('')}</div>`
}
function enhanceProblemBank(){
  if(enhancing)return;const list=document.getElementById('problemList');if(!list)return;
  const rows=[...list.querySelectorAll(':scope > [data-problem]')];if(!rows.length){document.getElementById('productLibrarySummary')?.remove();return}
  enhancing=true;
  try{
    const groups=new Map();
    for(const row of rows){
      const index=Number(row.dataset.problem),p=CURRICULUM[index];if(!p)continue;
      const pattern=Catalog.patternFor(p),g=groups.get(pattern.id)||{pattern,items:[],problems:[]};
      g.items.push({row,index,p});g.problems.push(p);groups.set(pattern.id,g)
    }
    const patternOrder=new Map((Catalog.patterns||[]).map((p,i)=>[p.id,i]));
    const ordered=[...groups.values()].sort((a,b)=>(patternOrder.get(a.pattern.id)??999)-(patternOrder.get(b.pattern.id)??999));
    if(activePattern!=='all'&&!groups.has(activePattern))activePattern='all';
    let summary=document.getElementById('productLibrarySummary');
    if(!summary){summary=document.createElement('section');summary.id='productLibrarySummary';summary.className='productLibrarySummary';list.insertAdjacentElement('beforebegin',summary)}
    const track=Catalog.track(Profile?.get?.().activeTrack||'hot100-core'),isEn=locale()==='en-US';
    summary.innerHTML=`<div class="librarySummaryHead"><div><small>${isEn?'CURRENT TRACK':'当前路线'}</small><b>${escHtml(Catalog.localize(track?.title,locale()))}</b></div><span>${rows.length} ${isEn?'problems':'题'} · ${ordered.length} Pattern</span></div><div class="libraryPatternChips"><button type="button" data-library-pattern="all" class="${activePattern==='all'?'active':''}">${isEn?'All':'全部'}</button>${ordered.map(g=>`<button type="button" data-library-pattern="${g.pattern.id}" class="${activePattern===g.pattern.id?'active':''}">${escHtml(patternLabel(g.pattern))}<em>${g.items.length}</em></button>`).join('')}</div>`;
    const frag=document.createDocumentFragment();
    for(const g of ordered){
      const counts=statusCounts(g.problems),pct=Math.round(counts.mastered/Math.max(1,g.problems.length)*100),section=document.createElement('section');
      section.className='libraryPatternGroup';section.dataset.libraryGroup=g.pattern.id;section.hidden=activePattern!=='all'&&activePattern!==g.pattern.id;
      section.innerHTML=`<div class="libraryPatternHead"><div><small>PATTERN</small><h3>${escHtml(patternLabel(g.pattern))}</h3></div><div class="libraryPatternStats"><span>${counts.mastered} / ${g.problems.length} ${isEn?'mastered':'掌握'}</span>${counts.due?`<em>${counts.due} ${isEn?'due':'待复习'}</em>`:''}</div></div><div class="libraryPatternTrack"><i style="width:${pct}%"></i></div><div class="libraryPatternRows"></div>`;
      const holder=section.querySelector('.libraryPatternRows');
      for(const item of g.items){
        const wrap=document.createElement('div');wrap.className='libraryProblemWrap';item.row.classList.add('libraryProblemMain');wrap.appendChild(item.row);
        const dock=document.createElement('div');dock.innerHTML=modeDock(item.index,item.p);wrap.appendChild(dock.firstElementChild);holder.appendChild(wrap)
      }
      frag.appendChild(section)
    }
    list.innerHTML='';list.appendChild(frag);
    summary.querySelectorAll('[data-library-pattern]').forEach(btn=>btn.addEventListener('click',()=>{
      activePattern=btn.dataset.libraryPattern||'all';summary.querySelectorAll('[data-library-pattern]').forEach(x=>x.classList.toggle('active',x===btn));
      list.querySelectorAll('[data-library-group]').forEach(section=>section.hidden=activePattern!=='all'&&section.dataset.libraryGroup!==activePattern)
    }));
    list.querySelectorAll('[data-library-mode]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();Modes.openInMode(Number(btn.dataset.libraryIndex),btn.dataset.libraryMode)}))
  }finally{enhancing=false}
}
renderProblems=function(){baseRenderProblems();enhanceProblemBank()};
const style=document.createElement('style');style.id='productLibraryStyles';style.textContent=`
.productLibrarySummary{margin:12px 0 14px}.librarySummaryHead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:9px}.librarySummaryHead>div{display:grid;gap:2px}.librarySummaryHead small,.libraryPatternHead small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.librarySummaryHead b{font-size:14px}.librarySummaryHead>span{font-size:10px;color:var(--muted)}.libraryPatternChips{display:flex;gap:6px;overflow-x:auto;padding:2px 1px 5px;scrollbar-width:none}.libraryPatternChips::-webkit-scrollbar{display:none}.libraryPatternChips button{flex:0 0 auto;border:1px solid var(--line);background:var(--panel,#fff);color:var(--muted);border-radius:999px;padding:7px 10px;font-size:10px}.libraryPatternChips button.active{border-color:var(--accent);background:var(--accent2);color:var(--text)}.libraryPatternChips em{font-style:normal;opacity:.65;margin-left:4px}.libraryPatternGroup{margin:15px 0 22px}.libraryPatternHead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:0 2px 8px}.libraryPatternHead h3{margin:2px 0 0;font-size:16px}.libraryPatternStats{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--muted)}.libraryPatternStats em{font-style:normal;border:1px solid var(--line);border-radius:999px;padding:3px 6px}.libraryPatternTrack{height:3px;background:var(--line);border-radius:99px;overflow:hidden;margin-bottom:8px}.libraryPatternTrack i{display:block;height:100%;background:var(--accent);border-radius:inherit}.libraryPatternRows{display:grid;gap:7px}.libraryProblemWrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:stretch}.libraryProblemMain{width:100%;margin:0!important}.libraryModeDock{display:flex;align-items:center;gap:4px;border:1px solid var(--line);border-radius:14px;padding:4px;background:var(--panel,#fff)}.libraryModeDock button{border:0;background:transparent;color:var(--muted);font-size:10px;border-radius:9px;padding:7px 8px;white-space:nowrap}.libraryModeDock button.active{background:var(--accent2);color:var(--text)}.libraryModeDock button:hover{color:var(--text)}html[data-theme="wa2"] .libraryModeDock,html[data-theme="wa2"] .libraryPatternChips button{background:rgba(255,255,255,.75)}
@media(max-width:820px){.librarySummaryHead{align-items:flex-start}.libraryProblemWrap{grid-template-columns:1fr}.libraryModeDock{justify-content:stretch}.libraryModeDock button{flex:1}.libraryPatternStats{flex-direction:column;align-items:flex-end;gap:3px}.libraryPatternGroup{margin-bottom:18px}}
`;
document.head.appendChild(style);
if(document.getElementById('page-problems')?.classList.contains('active'))renderProblems();
window.addEventListener('hot100profilechange',()=>{if(document.getElementById('page-problems')?.classList.contains('active'))renderProblems()});
window.addEventListener('hot100modechange',()=>{if(document.getElementById('page-problems')?.classList.contains('active'))renderProblems()});
window.HOT100_PRODUCT_LIBRARY={enhance:enhanceProblemBank,getActivePattern:()=>activePattern,setActivePattern:id=>{activePattern=id||'all';if(document.getElementById('page-problems')?.classList.contains('active'))renderProblems()},principle:'pattern-first-mode-at-entry'};
})();