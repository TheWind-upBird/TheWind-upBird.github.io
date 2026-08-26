(()=>{
const ADAPTIVE_KEY='__adaptive';
function adaptiveMeta(){
  state.attempts=state.attempts||{};
  const m=state.attempts[ADAPTIVE_KEY]||(state.attempts[ADAPTIVE_KEY]={});
  m.interviews=Array.isArray(m.interviews)?m.interviews:[];
  m.mistakes=m.mistakes||{};
  if(!('activeInterview' in m))m.activeInterview=null;
  if(!('quickSession' in m))m.quickSession=null;
  return m;
}
function localDay(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function isDue(slug){return (state.reviewQueue||[]).some(r=>r.slug===slug&&r.due<=localDay())}
function normalRuns(slug){const x=state.attempts?.[slug];return x&&Array.isArray(x.runs)?x.runs:[]}
function interviewRuns(slug){return adaptiveMeta().interviews.filter(x=>x.slug===slug).slice(-5)}
function started(p){return Boolean(state.solved?.[p.slug])||doneCards(p.slug).length>0}
function weaknessScore(p){
  if(!started(p))return 0;
  let s=0;
  const level=state.solved?.[p.slug]?.level;
  if(!level)s+=3.2;else if(level==='hard')s+=4.4;else if(level==='hint')s+=2.2;else s+=0.45;
  if(isDue(p.slug))s+=1.5;
  const runs=normalRuns(p.slug).slice(0,10),fails=runs.filter(x=>!x.passed).length;
  if(runs.length)s+=Math.min(2.6,fails*.45+(fails/Math.max(1,runs.length))*1.2);
  const ints=interviewRuns(p.slug);
  for(const r of ints){s+=r.passed?Math.min(2,r.hintsUsed*.45+Math.max(0,r.runs-1)*.18):2.5;}
  s+=Math.min(2,Number(adaptiveMeta().mistakes[p.slug]||0)*.28);
  return Math.min(10,Math.round(s*10)/10);
}
function weaknessLabel(score){return score>=6?'较弱':score>=3.5?'需复习':score>=1.5?'待巩固':'稳定'}
function weakProblems(limit=6){return CURRICULUM.filter(started).map((p,i)=>({p,i,score:weaknessScore(p)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
function weakTopics(){
  const map=new Map();
  for(const p of CURRICULUM.filter(started)){
    const x=map.get(p.topic)||{topic:p.topic,total:0,n:0,weak:[]};x.total+=weaknessScore(p);x.n++;x.weak.push(p);map.set(p.topic,x);
  }
  return [...map.values()].map(x=>({...x,score:Math.round(x.total/x.n*10)/10})).sort((a,b)=>b.score-a.score);
}
function recordMistake(slug){if(!slug)return;const m=adaptiveMeta();m.mistakes[slug]=Number(m.mistakes[slug]||0)+1;persist();}

// Learn from actual wrong clicks without changing the existing card renderers.
document.addEventListener('click',e=>{
  const t=e.target.closest?.('.choice');if(!t)return;
  setTimeout(()=>{if(t.classList.contains('wrong'))recordMistake(current()?.slug)},0);
});
document.addEventListener('click',e=>{
  if(e.target?.id!=='nextCard'||state.deckIndex!==4)return;
  setTimeout(()=>{if(document.getElementById('ffb')?.classList.contains('bad'))recordMistake(current()?.slug)},0);
});

function mountInterviewPage(){
  const main=document.querySelector('main.content');if(!main||document.getElementById('page-interview'))return;
  const page=document.createElement('section');page.className='page';page.id='page-interview';
  page.innerHTML=`<div class="eyebrow">INDEPENDENT PRACTICE</div><h1 class="title">独立练习</h1><p class="subtitle">隐藏算法标签和教学卡，先靠自己把已经学过的题写出来。</p><div id="interviewArea"></div>`;
  main.appendChild(page);
  const side=document.querySelector('.sideNav');
  if(side&&!side.querySelector('[data-adaptive-page="interview"]')){
    const b=document.createElement('button');b.className='sideBtn';b.dataset.adaptivePage='interview';b.textContent='独立练习';b.addEventListener('click',()=>{showPage('interview');renderInterviewPage()});side.insertBefore(b,side.lastElementChild);
  }
  const mobile=document.querySelector('.mobileBar');
  if(mobile&&!mobile.querySelector('[data-adaptive-page="interview"]')){
    const b=document.createElement('button');b.className='mobileBtn';b.dataset.adaptivePage='interview';b.textContent='独立';b.addEventListener('click',()=>{showPage('interview');renderInterviewPage()});mobile.appendChild(b);
  }
}
function interviewEligible(){const xs=CURRICULUM.map((p,i)=>({p,i})).filter(({p})=>state.solved?.[p.slug]||doneCards(p.slug).length>=4);return xs.length?xs:CURRICULUM.map((p,i)=>({p,i})).filter(({p})=>doneCards(p.slug).length>0)}
function chooseInterview(mode='random'){
  const xs=interviewEligible();if(!xs.length){alert('先完成一些学习卡，再来做独立练习。');return null}
  if(mode==='weak')return [...xs].sort((a,b)=>weaknessScore(b.p)-weaknessScore(a.p))[0];
  return xs[Math.floor(Math.random()*xs.length)];
}
function startInterview(mode='random'){
  const chosen=chooseInterview(mode);if(!chosen)return;
  const m=adaptiveMeta();m.activeInterview={slug:chosen.p.slug,index:chosen.i,mode,startedAt:Date.now(),hintsUsed:0,runs:0,passed:false,recorded:false,code:''};persist();showPage('interview');renderInterviewPage();
  window.HOT100_ANALYTICS?.track('interview_start',{slug:chosen.p.slug,mode});
}
function finishInterview(abandoned=false){
  const m=adaptiveMeta(),s=m.activeInterview;if(!s)return;
  if(!s.recorded){
    m.interviews.push({slug:s.slug,at:new Date().toISOString(),passed:Boolean(s.passed)&&!abandoned,hintsUsed:s.hintsUsed||0,runs:s.runs||0,duration:Math.max(0,Date.now()-s.startedAt),mode:s.mode||'random'});
    m.interviews=m.interviews.slice(-120);s.recorded=true;
  }
  m.activeInterview=null;persist();renderInterviewPage();renderWeaknessPanels();
}
function revealInterviewHint(s,p){
  const intro=window.HOT100_BEGINNER_INTUITION?.[p.slug]||{};
  s.hintsUsed=Math.min(4,(s.hintsUsed||0)+1);persist();
  const box=document.getElementById('interviewHints');if(!box)return;
  const hint=s.hintsUsed===1?`观察：${intro.observe||intro.question||'先把样例手算一遍，找出重复发生的动作。'}`:
    s.hintsUsed===2?`数据结构 / 方法：${p.topic}`:
    s.hintsUsed===3?'已解锁起始代码。先只补最核心的循环或状态转移。':'回到课程，从这道题的教学步骤重新过一遍。';
  const div=document.createElement('div');div.className='interviewHint';div.innerHTML=`<b>提示 ${s.hintsUsed}</b><span>${esc(hint)}</span>`;box.appendChild(div);
  if(s.hintsUsed===3){const ed=document.getElementById('interviewEditor');if(ed&&!ed.value.trim()){ed.value=p.starter||'';s.code=ed.value;persist();}}
  if(s.hintsUsed>=4){const idx=CURRICULUM.findIndex(x=>x.slug===p.slug);finishInterview(true);openProblem(idx)}
  const btn=document.getElementById('interviewHintBtn');if(btn)btn.textContent=s.hintsUsed>=3?'回到课程':'再给一点提示';
}
async function runInterview(s,p){
  const ed=document.getElementById('interviewEditor'),out=document.getElementById('interviewOutput');if(!ed||!out)return;
  const runButton=document.getElementById('runInterview');if(runButton?.disabled)return;if(runButton)runButton.disabled=true;
  s.code=ed.value;s.runs=(s.runs||0)+1;persist();out.className='runner';out.textContent='正在运行测试...';
  const startedAt=performance.now();
  try{
    const py=await getPy(),extra=window.HOT100_PY_EXTRA||'',code=PY_PRELUDE+'\n'+extra+'\n'+ed.value+'\n'+p.judge+'\njson.dumps(_results, ensure_ascii=False)';
    const raw=await py.runPythonAsync(code),results=JSON.parse(raw),count=results.filter(r=>r.ok).length,passed=results.length>0&&count===results.length;
    s.passed=passed;persist();out.className=`runner ${passed?'pass':'fail'}`;
    out.innerHTML=`<b>${count} / ${results.length} 组测试通过 · ${((performance.now()-startedAt)/1000).toFixed(2)}s</b><br>${results.map((r,i)=>`测试 ${i+1}：${r.ok?'通过':`未通过 · ${esc(r.case)} · 得到 ${esc(r.got)}`}`).join('<br>')}`;
    if(passed){window.HOT100_ANALYTICS?.track('interview_pass',{slug:p.slug,mode:s.mode||'random',passed:true});const done=document.getElementById('interviewDone');if(done)done.style.display='inline-flex';const h=document.getElementById('interviewHintBtn');if(h)h.style.display='none';}
  }catch(err){s.passed=false;persist();out.className='runner fail';const timeout=isPythonTimeout(err),infrastructure=timeout?'':pythonFailureCopy(err);out.textContent=timeout?'运行超时，已自动停止。请检查循环结束条件或递归边界；代码仍然保留。':infrastructure||('运行失败：'+(err?.message||err))}finally{if(runButton)runButton.disabled=false}
}
function renderInterviewPage(){
  const area=document.getElementById('interviewArea');if(!area)return;const m=adaptiveMeta(),s=m.activeInterview;
  if(!s){
    const hist=m.interviews.slice(-5).reverse(),eligible=interviewEligible().length;
    area.innerHTML=`<div class="interviewLaunch"><div class="card interviewMode"><span class="tag">随机</span><h3>随机抽一道已学题</h3><p>不显示知识点，直接从空白编辑器开始。</p><button class="primary" id="randomInterview">开始独立做题</button></div><div class="card interviewMode"><span class="tag">薄弱点</span><h3>从薄弱题里抽</h3><p>优先抽测试失败多、评价较困难或面试提示使用较多的题。</p><button class="secondary" id="weakInterview">挑战薄弱题</button></div></div><div class="sectionHead"><div><h3>最近独立练习</h3><p>已学题 ${eligible} 道可参与抽题。</p></div></div><div class="interviewHistory">${hist.length?hist.map(x=>{const p=CURRICULUM.find(y=>y.slug===x.slug);return `<div class="card interviewHistoryRow"><span><b>${esc(p?.title||x.slug)}</b><small>${x.passed?'独立测试通过':'未完成'} · 提示 ${x.hintsUsed} · 运行 ${x.runs}</small></span><strong>${x.passed&&x.hintsUsed===0?'独立完成':x.passed?'借助提示':'继续加强'}</strong></div>`}).join(''):'<div class="card empty"><b>还没有独立练习记录</b><p class="muted">学过几题后，从这里随机抽一道。</p></div>'}</div>`;
    document.getElementById('randomInterview')?.addEventListener('click',()=>startInterview('random'));document.getElementById('weakInterview')?.addEventListener('click',()=>startInterview('weak'));return;
  }
  const p=CURRICULUM[s.index]||CURRICULUM.find(x=>x.slug===s.slug);if(!p){m.activeInterview=null;persist();renderInterviewPage();return}
  const intro=window.HOT100_BEGINNER_INTUITION?.[p.slug]||{};
  area.innerHTML=`<div class="card interviewSession"><div class="interviewSessionHead"><span><small>题目 ${p.number} · ${p.difficulty}</small><h2>${esc(p.title)} <em>${esc(p.titleEn)}</em></h2></span><button class="secondary" id="quitInterview">结束本次</button></div><div class="interviewPrompt"><b>样例 / 题意线索</b><p>${esc(intro.example||p.title)}</p><small>算法分类已隐藏。先回忆题意和解法，卡住再逐级解锁提示。</small></div><div id="interviewHints" class="interviewHints"></div><div class="editorToolbar"><b>Python</b><small>独立模式 · Ctrl/⌘ + Enter 运行</small></div><textarea class="editor" id="interviewEditor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off">${esc(s.code||'')}</textarea><div class="interviewActions"><button class="primary" id="runInterview">▶ 运行测试</button><button class="secondary" id="interviewHintBtn">${s.hintsUsed>=3?'回到课程':'给一点提示'}</button><button class="secondary" id="interviewDone" style="display:${s.passed?'inline-flex':'none'}">完成并返回</button></div><div class="runner" id="interviewOutput">不看教学卡，先自己写。</div><div class="interviewMeta">已用提示 ${s.hintsUsed||0} / 4 · 已运行 ${s.runs||0} 次</div></div>`;
  const ed=document.getElementById('interviewEditor');ed.maxLength=MAX_CODE_CHARS;enablePythonIndent(ed);ed.addEventListener('input',()=>{s.code=ed.value;persistSoon()});ed.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();document.getElementById('runInterview')?.click()}});
  document.getElementById('runInterview')?.addEventListener('click',()=>runInterview(s,p));document.getElementById('interviewHintBtn')?.addEventListener('click',()=>revealInterviewHint(s,p));document.getElementById('interviewDone')?.addEventListener('click',()=>finishInterview(false));document.getElementById('quitInterview')?.addEventListener('click',()=>{if(confirm('结束这次独立练习？本次会记为未完成。'))finishInterview(true)});
}

function renderWeaknessPanels(){
  const weak=weakProblems(5),topics=weakTopics().slice(0,4);
  const knowledge=document.getElementById('page-knowledge');if(knowledge){
    let box=document.getElementById('weaknessPanel');if(!box){box=document.createElement('div');box.id='weaknessPanel';knowledge.querySelector('.knowledgeGrid')?.insertAdjacentElement('beforebegin',box)}
    box.innerHTML=`<div class="sectionHead weaknessHead"><div><h3>当前薄弱点</h3><p>综合完成评价、代码失败、到期复习和独立练习表现。</p></div><button class="secondary" id="practiceWeak">挑战最薄弱的一题</button></div><div class="weaknessGrid"><div class="card weaknessCard"><small>知识点</small>${topics.length?topics.map(x=>`<div class="weakRow"><span>${esc(x.topic)}</span><span><b>${weaknessLabel(x.score)}</b><em>${x.score.toFixed(1)}</em></span></div>`).join(''):'<p class="muted">开始做题后会形成薄弱点画像。</p>'}</div><div class="card weaknessCard"><small>建议优先回顾</small>${weak.length?weak.map(x=>`<button class="weakProblem" data-weak-problem="${x.i}"><span>${esc(x.p.title)}</span><span>${weaknessLabel(x.score)} · ${x.score.toFixed(1)}</span></button>`).join(''):'<p class="muted">目前没有明显薄弱题。</p>'}</div></div>`;
    box.querySelectorAll('[data-weak-problem]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.weakProblem))));document.getElementById('practiceWeak')?.addEventListener('click',()=>startInterview('weak'));
  }
  const home=document.getElementById('page-home');if(home){
    let mini=document.getElementById('homeWeakness');if(!mini){mini=document.createElement('div');mini.id='homeWeakness';home.querySelector('.summaryGrid')?.insertAdjacentElement('afterend',mini)}
    if(weak.length){mini.innerHTML=`<div class="card homeWeakCard"><span><small>当前建议</small><b>先巩固 ${esc(weak[0].p.title)}</b><em>${esc(weak[0].p.topic)} · ${weaknessLabel(weak[0].score)}</em></span><button class="secondary" id="homeWeakOpen">去看看</button></div>`;document.getElementById('homeWeakOpen')?.addEventListener('click',()=>openProblem(weak[0].i));}else mini.innerHTML='';
  }
}

function reviewStartLocal(p){const level=state.solved?.[p.slug]?.level;return level==='solo'?6:level==='hint'?4:level==='hard'?0:Math.min(4,Number(state.positions?.[p.slug]||0))}
function buildQuickPlan(minutes){
  const max=minutes===10?2:3,used=new Set(),queue=[];
  const add=(p,type,start)=>{if(!p||used.has(p.slug)||queue.length>=max)return;used.add(p.slug);queue.push({slug:p.slug,type,start:Math.max(0,Math.min(CARD_COUNT-1,start))})};
  const due=(state.reviewQueue||[]).filter(r=>r.due<=localDay()).map(r=>CURRICULUM.find(p=>p.slug===r.slug)).filter(Boolean).sort((a,b)=>weaknessScore(b)-weaknessScore(a));
  for(const p of due.slice(0,minutes===10?1:2))add(p,'到期复习',reviewStartLocal(p));
  for(const x of weakProblems(8))add(x.p,'薄弱巩固',Math.max(4,reviewStartLocal(x.p)));
  const cur=current();if(cur&&!state.solved?.[cur.slug])add(cur,'继续新题',Number(state.positions?.[cur.slug]||0));
  for(const p of CURRICULUM)if(queue.length<max&&started(p))add(p,'快速回顾',6);
  return queue.slice(0,max);
}
function openQuickTask(){
  const qs=adaptiveMeta().quickSession;if(!qs||!qs.queue?.length)return;
  const task=qs.queue[qs.pos],idx=CURRICULUM.findIndex(p=>p.slug===task.slug);if(idx<0)return;
  state.currentProblem=idx;state.reviewing=null;state.deckIndex=task.start||0;persist();showPage('deck');renderCard();
}
function startQuick(minutes){
  const q=buildQuickPlan(minutes);if(!q.length){alert('还没有足够学习记录来生成快速计划。先正常学习一道题即可。');return}
  adaptiveMeta().quickSession={minutes,queue:q,pos:0,startedAt:Date.now()};persist();openQuickTask();
}
function finishQuick(){
  const m=adaptiveMeta(),qs=m.quickSession;if(!qs)return;m.lastQuickSummary={minutes:qs.minutes,tasks:qs.queue.length,finishedAt:Date.now()};m.quickSession=null;persist();showPage('home');renderHome();
}
function nextQuickTask(){const qs=adaptiveMeta().quickSession;if(!qs)return;qs.pos+=1;if(qs.pos>=qs.queue.length)finishQuick();else{persist();openQuickTask()}}
function mountQuickHome(){
  const hero=document.querySelector('#page-home .heroActions');if(hero&&!document.getElementById('quick10')){
    const box=document.createElement('div');box.className='quickButtons';box.innerHTML=`<button class="secondary" id="quick10">10 分钟</button><button class="secondary" id="quick20">20 分钟</button>`;hero.appendChild(box);document.getElementById('quick10').addEventListener('click',()=>startQuick(10));document.getElementById('quick20').addEventListener('click',()=>startQuick(20));
  }
  const qs=adaptiveMeta().quickSession;if(hero&&qs){let cont=document.getElementById('quickContinue');if(!cont){cont=document.createElement('button');cont.id='quickContinue';cont.className='soft';hero.appendChild(cont)}cont.textContent=`继续 ${qs.minutes} 分钟计划 · ${qs.pos+1}/${qs.queue.length}`;cont.onclick=openQuickTask;}
}

const adaptiveBaseRenderCard=renderCard;
renderCard=function(){
  adaptiveBaseRenderCard();
  const qs=adaptiveMeta().quickSession,head=document.querySelector('#page-deck .deckHead');head?.querySelector('.quickBadge')?.remove();
  if(qs&&head){const b=document.createElement('span');b.className='quickBadge';b.textContent=`快速 ${qs.minutes} 分钟 · ${qs.pos+1}/${qs.queue.length}`;b.title='点击退出快速学习';b.addEventListener('click',()=>{if(confirm('退出这次快速学习计划？')){adaptiveMeta().quickSession=null;persist();showPage('home')}});head.appendChild(b);}
  if(qs&&state.deckIndex>=CARD_COUNT){const next=document.getElementById('nextProblem');if(next){const clone=next.cloneNode(true);next.replaceWith(clone);clone.textContent=qs.pos+1<qs.queue.length?'下一个任务 →':'完成快速学习';clone.addEventListener('click',nextQuickTask)}}
};
const adaptiveBaseRenderHome=renderHome;
renderHome=function(){adaptiveBaseRenderHome();mountQuickHome();renderWeaknessPanels()};
const adaptiveBaseRenderKnowledge=renderKnowledge;
renderKnowledge=function(){adaptiveBaseRenderKnowledge();renderWeaknessPanels()};

// PWA: manifest can be attached dynamically, while the service worker caches same-origin course assets after first use.
function mountPwa(){
  if(!document.querySelector('link[rel="manifest"]')){const l=document.createElement('link');l.rel='manifest';l.href='./manifest.webmanifest';document.head.appendChild(l)}
  if(!document.querySelector('link[rel="icon"]')){const l=document.createElement('link');l.rel='icon';l.type='image/svg+xml';l.href='./icon.svg';document.head.appendChild(l)}
  for(const [name,content] of [['apple-mobile-web-app-capable','yes'],['apple-mobile-web-app-status-bar-style','default'],['apple-mobile-web-app-title','Hot100 Lab']]){if(!document.querySelector(`meta[name="${name}"]`)){const m=document.createElement('meta');m.name=name;m.content=content;document.head.appendChild(m)}}
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}),{once:true});
  const pop=document.querySelector('#hot100DataMenu .utilityPopover');if(!pop||document.getElementById('installHot100'))return;
  const btn=document.createElement('button');btn.className='secondary';btn.id='installHot100';btn.textContent='安装到桌面';pop.insertBefore(btn,pop.querySelector('.utilityTip'));
  let deferred=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;btn.textContent='安装 Hot100 Lab'});
  btn.addEventListener('click',async e=>{e.preventDefault();if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;return}const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);if(ios)alert('iPhone / iPad：请用 Safari 打开本站，点“分享” → “添加到主屏幕”。');else alert('如果浏览器没有直接弹出安装框，请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。')});
}

const style=document.createElement('style');
style.textContent=`
.interviewLaunch{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:22px}.interviewMode{padding:20px;box-shadow:none}.interviewMode h3{margin:10px 0 5px}.interviewMode p{color:var(--muted);font-size:13px;min-height:42px}.interviewHistory{display:grid;gap:8px}.interviewHistoryRow{padding:13px 15px;box-shadow:none;display:flex;justify-content:space-between;gap:14px;align-items:center}.interviewHistoryRow span{display:grid}.interviewHistoryRow small{color:var(--muted);font-size:11px}.interviewHistoryRow strong{font-size:11px;color:var(--muted)}.interviewSession{margin-top:20px;padding:23px;box-shadow:none}.interviewSessionHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.interviewSessionHead small{color:var(--muted)}.interviewSessionHead h2{margin:2px 0;font-size:23px}.interviewSessionHead em{font-style:normal;color:var(--muted);font-size:14px;font-weight:500}.interviewPrompt{border:1px solid var(--line);border-radius:13px;padding:13px 14px;margin:15px 0}.interviewPrompt p{margin:4px 0;font-weight:650}.interviewPrompt small{color:var(--muted)}.interviewHints{display:grid;gap:7px}.interviewHint{background:var(--accent2);border-radius:11px;padding:9px 11px;display:grid;gap:2px;font-size:12px}.interviewHint span{color:#4d4db7}.interviewActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.interviewMeta{font-size:11px;color:var(--muted);margin-top:8px}.weaknessGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.weaknessCard{padding:16px;box-shadow:none}.weaknessCard>small{color:var(--muted);display:block;margin-bottom:8px}.weakRow,.weakProblem{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border:0;border-bottom:1px solid var(--line);background:transparent;text-align:left}.weakRow:last-child,.weakProblem:last-child{border-bottom:0}.weakRow>span:last-child{display:flex;gap:7px;align-items:center}.weakRow b,.weakProblem>span:last-child{font-size:11px;color:var(--muted);font-weight:600}.weakRow em{font-style:normal;font-size:10px;color:var(--muted)}.homeWeakCard{margin-top:11px;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:none}.homeWeakCard>span{display:grid}.homeWeakCard small,.homeWeakCard em{font-size:11px;color:var(--muted);font-style:normal}.quickButtons{display:flex;gap:6px}.quickButtons .secondary{padding:8px 11px}.quickBadge{margin-left:auto;font-size:11px;background:var(--accent2);color:var(--accent);border-radius:999px;padding:5px 8px;cursor:pointer}.mobileBar:has([data-adaptive-page="interview"]){grid-template-columns:repeat(5,1fr)}@media(max-width:720px){.interviewLaunch,.weaknessGrid{grid-template-columns:1fr}.interviewSession{padding:17px}.interviewSessionHead{align-items:flex-start}.interviewActions button{flex:1}.homeWeakCard{align-items:flex-start}.quickButtons{width:100%}.quickButtons button{flex:1}}
`;
document.head.appendChild(style);

adaptiveMeta();mountInterviewPage();mountPwa();mountQuickHome();renderWeaknessPanels();
if(state.lastPage==='interview'){showPage('interview');renderInterviewPage()}
})();
