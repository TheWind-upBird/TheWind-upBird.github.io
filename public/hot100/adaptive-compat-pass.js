(()=>{
function adaptiveState(){
  state.attempts=state.attempts||{};
  const m=state.attempts.__adaptive||(state.attempts.__adaptive={interviews:[],mistakes:{},activeInterview:null,quickSession:null});
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
function isStarted(p){return Boolean(state.solved?.[p.slug])||doneCards(p.slug).length>0}
function dueNow(slug){return (state.reviewQueue||[]).some(r=>r.slug===slug&&r.due<=localDay())}
function ordinaryRuns(slug){const x=state.attempts?.[slug];return x&&Array.isArray(x.runs)?x.runs:[]}
function interviewRuns(slug){return adaptiveState().interviews.filter(x=>x.slug===slug).slice(-5)}
function mistakeCount(slug){const x=adaptiveState().mistakes?.[slug];if(typeof x==='number')return x;if(x&&typeof x==='object')return Object.values(x).reduce((a,b)=>a+(Number(b)||0),0);return 0}
function refinedWeakness(p){
  if(!isStarted(p))return 0;
  let score=0;
  const level=state.solved?.[p.slug]?.level;
  if(!level)score+=2.8;else if(level==='hard')score+=4.3;else if(level==='hint')score+=2.1;else score+=0.35;
  if(dueNow(p.slug))score+=1.45;
  const runs=ordinaryRuns(p.slug).slice(0,6),fails=runs.filter(x=>!x.passed).length;
  if(runs.length)score+=Math.min(2.5,fails*.5+(fails/runs.length));
  const ints=interviewRuns(p.slug);
  for(const x of ints){
    if(!x.passed)score+=1.8;
    else score+=Math.min(1.5,(x.hintsUsed||0)*.35+Math.max(0,(x.runs||1)-1)*.14);
  }
  score+=Math.min(1.6,mistakeCount(p.slug)*.22);
  return Math.min(10,Math.round(score*10)/10);
}
function weakLabel(s){return s>=6?'较弱':s>=3.5?'需复习':s>=1.5?'待巩固':'稳定'}
function weakReasons(p){
  const out=[],level=state.solved?.[p.slug]?.level;
  if(level==='hard')out.push('上次自评困难');else if(level==='hint')out.push('上次需要回看');
  if(dueNow(p.slug))out.push('已到复习日');
  const runs=ordinaryRuns(p.slug).slice(0,6),fails=runs.filter(x=>!x.passed).length;
  if(fails)out.push(`近 ${runs.length} 次运行失败 ${fails} 次`);
  const last=interviewRuns(p.slug).slice(-1)[0];
  if(last&&!last.passed)out.push('最近独立练习未完成');else if(last?.hintsUsed)out.push(`独立练习用了 ${last.hintsUsed} 级提示`);
  const mistakes=mistakeCount(p.slug);if(mistakes)out.push(`学习卡答错 ${mistakes} 次`);
  return out.slice(0,2);
}
function refinedWeakProblems(limit=6){
  return CURRICULUM.map((p,i)=>({p,i,score:refinedWeakness(p)})).filter(x=>isStarted(x.p)&&x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
}
function refinedWeakTopics(){
  const map=new Map();
  for(const p of CURRICULUM.filter(isStarted)){
    const x=map.get(p.topic)||{topic:p.topic,scores:[]};x.scores.push(refinedWeakness(p));map.set(p.topic,x);
  }
  return [...map.values()].map(x=>{
    const top=[...x.scores].sort((a,b)=>b-a).slice(0,3);
    const score=top.length?top.reduce((a,b)=>a+b,0)/top.length:0;
    return {topic:x.topic,score:Math.round(score*10)/10};
  }).sort((a,b)=>b.score-a.score);
}
function launchWeakInterview(){
  const nav=document.querySelector('[data-adaptive-page="interview"]');
  if(nav){nav.click();setTimeout(()=>document.getElementById('weakInterview')?.click(),0)}
}
function repaintWeakness(){
  const weak=refinedWeakProblems(5),topics=refinedWeakTopics().slice(0,4),box=document.getElementById('weaknessPanel');
  if(box){
    box.innerHTML=`<div class="sectionHead weaknessHead"><div><h3>当前薄弱点</h3><p>依据自评、测试失败、学习卡错误、到期复习和独立练习综合计算。</p></div><button class="secondary" id="practiceWeakRefined">挑战最薄弱的一题</button></div><div class="weaknessGrid"><div class="card weaknessCard"><small>知识点</small>${topics.length?topics.map(x=>`<div class="weakRow"><span>${esc(x.topic)}</span><span><b>${weakLabel(x.score)}</b><em>${x.score.toFixed(1)}</em></span></div>`).join(''):'<p class="muted">开始做题后会形成薄弱点画像。</p>'}</div><div class="card weaknessCard"><small>建议优先回顾</small>${weak.length?weak.map(x=>`<button class="weakProblem" data-refined-weak="${x.i}"><span><b>${esc(x.p.title)}</b><small>${esc(weakReasons(x.p).join(' · ')||'继续巩固')}</small></span><span>${weakLabel(x.score)} · ${x.score.toFixed(1)}</span></button>`).join(''):'<p class="muted">目前没有明显薄弱题。</p>'}</div></div>`;
    box.querySelectorAll('[data-refined-weak]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.refinedWeak))));
    document.getElementById('practiceWeakRefined')?.addEventListener('click',launchWeakInterview);
  }
  const mini=document.getElementById('homeWeakness');
  if(mini){
    if(weak.length){const x=weak[0];mini.innerHTML=`<div class="card homeWeakCard"><span><small>当前建议</small><b>先巩固 ${esc(x.p.title)}</b><em>${esc(weakReasons(x.p).join(' · ')||x.p.topic)}</em></span><button class="secondary" id="homeWeakOpenRefined">去看看</button></div>`;document.getElementById('homeWeakOpenRefined')?.addEventListener('click',()=>openProblem(x.i));}
    else mini.innerHTML='';
  }
}

function quickStartFor(p){
  const level=state.solved?.[p.slug]?.level,pos=Math.max(0,Math.min(7,Number(state.positions?.[p.slug]||0));
  if(level==='hard')return 0;if(level==='hint')return 4;if(level==='solo')return 6;return pos;
}
function makeQuickTask(p,type,minutes){
  let start=quickStartFor(p),span=minutes===10?2:3;
  if(type==='继续新题'&&minutes===20)span=4;
  if(start>=8)start=6;
  return {slug:p.slug,type,start,end:Math.min(8,start+span)};
}
function refinedQuickPlan(minutes){
  const max=minutes===10?2:3,queue=[],used=new Set();
  const add=(p,type)=>{if(!p||used.has(p.slug)||queue.length>=max)return;used.add(p.slug);queue.push(makeQuickTask(p,type,minutes))};
  const due=(state.reviewQueue||[]).filter(r=>r.due<=localDay()).map(r=>CURRICULUM.find(p=>p.slug===r.slug)).filter(Boolean).sort((a,b)=>refinedWeakness(b)-refinedWeakness(a));
  for(const p of due.slice(0,minutes===10?1:2))add(p,'到期复习');
  for(const x of refinedWeakProblems(8))add(x.p,'薄弱巩固');
  const cur=current();if(cur&&!state.solved?.[cur.slug])add(cur,'继续新题');
  for(const p of CURRICULUM.filter(isStarted))if(queue.length<max)add(p,'快速回顾');
  return queue;
}
function openRefinedQuickTask(){
  const qs=adaptiveState().quickSession;if(!qs?.queue?.length)return;
  const task=qs.queue[qs.pos],idx=CURRICULUM.findIndex(p=>p.slug===task.slug);if(idx<0)return;
  state.currentProblem=idx;state.reviewing=null;state.deckIndex=Math.max(0,Math.min(7,Number(task.start)||0));persist();showPage('deck');renderCard();
}
function finishRefinedQuick(){
  const m=adaptiveState(),qs=m.quickSession;if(!qs)return;
  m.lastQuickSummary={minutes:qs.minutes,tasks:qs.queue.length,finishedAt:Date.now()};m.quickSession=null;persist();showPage('home');renderHome();
}
function nextRefinedQuickTask(){
  const qs=adaptiveState().quickSession;if(!qs)return;
  qs.pos+=1;if(qs.pos>=qs.queue.length)finishRefinedQuick();else{persist();openRefinedQuickTask()}
}
function startRefinedQuick(minutes){
  const queue=refinedQuickPlan(minutes);if(!queue.length){alert('还没有足够学习记录来生成快速计划。先正常学习一道题即可。');return}
  adaptiveState().quickSession={minutes,queue,pos:0,startedAt:Date.now(),version:2};persist();openRefinedQuickTask();
}
function refineQuickButtons(){
  for(const [id,minutes] of [['quick10',10],['quick20',20]]){
    const old=document.getElementById(id);if(!old||old.dataset.refinedQuick==='1')continue;
    const b=old.cloneNode(true);b.dataset.refinedQuick='1';old.replaceWith(b);b.addEventListener('click',()=>startRefinedQuick(minutes));
  }
  const cont=document.getElementById('quickContinue');if(cont)cont.onclick=openRefinedQuickTask;
}
const compatBaseNextCard=nextCard;
nextCard=function(){
  const qs=adaptiveState().quickSession,task=qs?.queue?.[qs.pos];
  if(task&&current()?.slug===task.slug){
    const end=Math.max(Number(task.start||0)+1,Math.min(8,Number(task.end)||8));
    if(state.deckIndex>=end-1){nextRefinedQuickTask();return}
  }
  compatBaseNextCard();
};

function enhanceInterviewSession(){
  const s=adaptiveState().activeInterview,session=document.querySelector('#interviewArea .interviewSession');if(!s||!session)return;
  const p=CURRICULUM.find(x=>x.slug===s.slug);if(!p)return;
  const prompt=session.querySelector('.interviewPrompt');
  if(prompt&&!session.querySelector('.interviewSignature')){
    const starter=String(p.starter||''),sig=(starter.split('\n').find(x=>/^\s*(def|class)\s+/.test(x))||'').trim();
    if(sig){const d=document.createElement('div');d.className='interviewSignature';d.innerHTML=`<small>代码入口</small><code>${esc(sig)}</code>`;prompt.insertAdjacentElement('afterend',d)}
  }
  const hints=document.getElementById('interviewHints');
  if(hints&&s.hintsUsed>0&&!hints.children.length){
    const intro=window.HOT100_BEGINNER_INTUITION?.[p.slug]||{};
    const texts=[`观察：${intro.observe||intro.question||'先把样例手算一遍。'}`,`数据结构 / 方法：${p.topic}`,'已解锁起始代码。先只补最核心的循环或状态转移。'];
    for(let i=0;i<Math.min(3,s.hintsUsed);i++){const d=document.createElement('div');d.className='interviewHint';d.innerHTML=`<b>提示 ${i+1}</b><span>${esc(texts[i])}</span>`;hints.appendChild(d)}
  }
}
const interviewObserver=new MutationObserver(()=>enhanceInterviewSession());
const interviewRoot=document.getElementById('page-interview');if(interviewRoot)interviewObserver.observe(interviewRoot,{childList:true,subtree:true});

function refinePwaUi(){
  if(!document.querySelector('link[rel="apple-touch-icon"]')){const l=document.createElement('link');l.rel='apple-touch-icon';l.href='./icon.svg';document.head.appendChild(l)}
  const btn=document.getElementById('installHot100');if(!btn)return;
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
  if(standalone){btn.textContent='已安装到桌面';btn.disabled=true}
  navigator.serviceWorker?.ready.then(()=>{const pop=document.querySelector('#hot100DataMenu .utilityPopover');if(pop&&!document.getElementById('offlineReady')){const s=document.createElement('small');s.id='offlineReady';s.className='utilityTip';s.textContent='课程离线缓存已启用；Python 运行器首次使用仍建议联网。';pop.appendChild(s)}}).catch(()=>{});
}

const compatBaseShowPage=showPage;
showPage=function(name){
  const qs=adaptiveState().quickSession,keepDeckIndex=name==='deck'&&qs?state.deckIndex:null;
  const result=compatBaseShowPage(name);
  document.querySelectorAll('[data-adaptive-page]').forEach(b=>b.classList.toggle('active',b.dataset.adaptivePage===name));
  if(keepDeckIndex!==null&&state.deckIndex!==keepDeckIndex){state.deckIndex=keepDeckIndex;persist();renderCard()}
  if(name==='interview')setTimeout(enhanceInterviewSession,0);
  return result;
};
const compatBaseRenderHome=renderHome;
renderHome=function(){compatBaseRenderHome();if(!adaptiveState().quickSession)document.getElementById('quickContinue')?.remove();refineQuickButtons();repaintWeakness()};
const compatBaseRenderKnowledge=renderKnowledge;
renderKnowledge=function(){compatBaseRenderKnowledge();repaintWeakness()};

const style=document.createElement('style');style.textContent=`.weakProblem>span:first-child{display:grid;gap:2px}.weakProblem>span:first-child small{font-size:10px;color:var(--muted);font-weight:400}.interviewSignature{display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:11px;padding:9px 11px;margin:-6px 0 13px;background:#fafbfc}.interviewSignature small{color:var(--muted)}.interviewSignature code{font-size:12px;font-weight:700;overflow:auto}`;document.head.appendChild(style);

refineQuickButtons();repaintWeakness();refinePwaUi();setTimeout(enhanceInterviewSession,0);
})();