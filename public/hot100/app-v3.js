const CURRICULUM = window.HOT100_CURRICULUM || [];
const KEY = 'hot100-lab-v3';
const DAY_SIZE = 3;
const DAY_NAMES = [
  '哈希表入门','双指针基础','双指针与滑动窗口','前缀和与窗口','数组基础',
  '数组进阶','矩阵','链表基础','环与合并','链表操作'
];
const defaults = {
  currentProblem: 0,
  currentStep: 0,
  solved: {},
  codes: {},
  reviewQueue: [],
  lastPage: 'home'
};
let state = {...defaults};
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved) state = {...defaults, ...saved, solved: saved.solved || {}, codes: saved.codes || {}, reviewQueue: saved.reviewQueue || []};
  else {
    const old = JSON.parse(localStorage.getItem('hot100-lab-v2') || 'null');
    if (old?.twoSumStatus) {
      state.solved['two-sum'] = {level: old.twoSumStatus, completedAt: new Date().toISOString()};
      state.currentProblem = 1;
    }
  }
} catch(e) {}

const $ = id => document.getElementById(id);
const todayISO = () => new Date().toISOString().slice(0,10);
function persist(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function save(){ persist(); renderAll(); }
function solvedCount(){ return Object.keys(state.solved).length; }
function currentDayIndex(){ return Math.min(9, Math.floor(Math.min(state.currentProblem,29) / DAY_SIZE)); }
function problemDay(i){ return Math.floor(i / DAY_SIZE); }
function dueDate(days){ const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function difficultyClass(d){ return d==='Easy'?'easy':d==='Medium'?'medium':'hard'; }

function showPage(name){
  state.lastPage=name; persist();
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));
  document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  if(name==='learn') renderLearning();
  if(name==='problems') renderProblems();
  if(name==='review') renderReview();
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));

function openProblem(index, step=0){
  state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,index));
  state.currentStep=step;
  save();
  showPage('learn');
}

function nextProblem(){
  if(state.currentProblem < CURRICULUM.length-1){
    state.currentProblem += 1;
    state.currentStep = 0;
    save(); renderLearning(); window.scrollTo({top:0,behavior:'smooth'});
  } else showPage('home');
}

function renderAll(){ renderHome(); renderProblems(); renderRoadmap(); renderReview(); renderSide(); }

function renderSide(){
  const n=solvedCount();
  $('sideSolved').textContent=`${n} / ${CURRICULUM.length}`;
  $('sideProgress').style.width=`${n/CURRICULUM.length*100}%`;
  const day=currentDayIndex();
  $('sideDay').textContent=`Day ${day+1} · ${DAY_NAMES[day]}`;
}

function renderHome(){
  const count=solvedCount();
  const idx=Math.min(state.currentProblem,CURRICULUM.length-1);
  const p=CURRICULUM[idx];
  const day=problemDay(idx);
  const dayStart=day*DAY_SIZE;
  const dayEnd=Math.min(dayStart+DAY_SIZE,CURRICULUM.length);
  const daySolved=CURRICULUM.slice(dayStart,dayEnd).filter(x=>state.solved[x.slug]).length;
  $('homeDay').textContent=`DAY ${day+1} · ${DAY_NAMES[day]}`;
  $('homeTitle').innerHTML=count>=CURRICULUM.length?'前 30 道题已完成。':`继续第 ${idx+1} / ${CURRICULUM.length} 题：<br>${escapeHtml(p.title)}`;
  $('homeSubtitle').textContent=count>=CURRICULUM.length?'可以从题库回顾任意题，复习队列会继续按完成情况安排。':`${p.topic} · ${p.difficulty}。先理解思路和 Python 写法，再在本站完成代码。`;
  $('homeContinue').textContent=count>=CURRICULUM.length?'查看题库':(state.currentStep>0?'继续当前题 →':'开始当前题 →');
  $('homeContinue').onclick=()=>count>=CURRICULUM.length?showPage('problems'):showPage('learn');
  $('homeProgress').textContent=`${count} / ${CURRICULUM.length}`;
  $('homeDayProgress').textContent=`${daySolved} / ${dayEnd-dayStart}`;
  $('homeReview').textContent=state.reviewQueue.filter(r=>r.due<=todayISO()).length;
  $('homeBar').style.width=`${count/CURRICULUM.length*100}%`;
  $('dayList').innerHTML=CURRICULUM.slice(dayStart,dayEnd).map((x,j)=>{
    const i=dayStart+j, done=Boolean(state.solved[x.slug]), current=i===idx;
    return `<button class="dayProblem ${done?'done':''} ${current?'current':''}" data-open="${i}">
      <span class="numBadge">${done?'✓':i+1}</span><span><b>${x.title}</b><small>${x.topic} · ${x.difficulty}</small></span><span class="dayState">${done?'已完成':current?'当前':''}</span>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.open),0)));

  const completedThisDay=daySolved===dayEnd-dayStart;
  $('nextDayBox').style.display=completedThisDay && day<9 ? 'block':'none';
  if(completedThisDay && day<9){
    $('nextDayText').textContent=`Day ${day+1} 已完成。Day ${day+2}「${DAY_NAMES[day+1]}」已解锁，可以立即继续。`;
    $('nextDayBtn').onclick=()=>openProblem((day+1)*DAY_SIZE,0);
  }
}

function renderRoadmap(){
  const count=solvedCount();
  $('roadmapGrid').innerHTML=DAY_NAMES.map((name,day)=>{
    const start=day*3,end=start+3;
    const items=CURRICULUM.slice(start,end);
    const done=items.filter(p=>state.solved[p.slug]).length;
    const unlocked=day===0 || CURRICULUM.slice(0,start).every(p=>state.solved[p.slug]);
    return `<div class="roadCard ${unlocked?'':'locked'}">
      <div class="roadTop"><span>DAY ${day+1}</span><span>${done}/3</span></div>
      <h3>${name}</h3>
      <div class="roadProblems">${items.map((p,i)=>`<button data-road-open="${start+i}" ${unlocked?'':'disabled'}><span>${state.solved[p.slug]?'✓':p.number}</span>${p.title}</button>`).join('')}</div>
    </div>`;
  }).join('');
  document.querySelectorAll('[data-road-open]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.roadOpen),0)));
  $('roadmapCount').textContent=`${count} / 30`;
}

function renderProblems(){
  const q=($('searchInput')?.value||'').trim().toLowerCase();
  const topic=$('topicFilter')?.value||'全部';
  const rows=CURRICULUM.map((p,i)=>({p,i})).filter(({p})=>{
    const matchQ=!q || p.title.toLowerCase().includes(q)||p.titleEn.toLowerCase().includes(q)||String(p.number).includes(q);
    const matchT=topic==='全部'||p.topic===topic;
    return matchQ&&matchT;
  });
  $('problemList').innerHTML=rows.map(({p,i})=>{
    const done=state.solved[p.slug];
    return `<button class="problemRow" data-problem="${i}">
      <span class="problemNo">${p.number}</span>
      <span class="problemMain"><b>${p.title}</b><small>${p.titleEn}</small></span>
      <span class="topicTag">${p.topic}</span>
      <span class="diff ${difficultyClass(p.difficulty)}">${p.difficulty}</span>
      <span class="problemState ${done?'done':''}">${done?'已完成':'学习'}</span>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-problem]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.problem),0)));
}
$('searchInput')?.addEventListener('input',renderProblems);
$('topicFilter')?.addEventListener('change',renderProblems);

function renderReview(){
  const due=state.reviewQueue.filter(r=>r.due<=todayISO());
  const future=state.reviewQueue.filter(r=>r.due>todayISO()).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,8);
  if(!due.length && !future.length){
    $('reviewArea').innerHTML='<div class="emptyCard"><b>还没有复习任务</b><p>完成题目并选择完成情况后，系统会自动安排。</p></div>';
    return;
  }
  $('reviewArea').innerHTML=`${due.length?`<h3>今天</h3><div class="reviewList">${due.map(reviewHTML).join('')}</div>`:''}
    ${future.length?`<h3 class="futureTitle">之后</h3><div class="reviewList">${future.map(reviewHTML).join('')}</div>`:''}`;
  document.querySelectorAll('[data-review-open]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.reviewOpen),3)));
}
function reviewHTML(r){
  const i=CURRICULUM.findIndex(p=>p.slug===r.slug); const p=CURRICULUM[i];
  return `<button class="reviewRow" data-review-open="${i}"><span><b>${p?.title||r.slug}</b><small>${r.type}</small></span><span>${r.due<=todayISO()?'今天':r.due}</span></button>`;
}

function stepLabel(i){ return ['思路','代码','检查','完整题','完成'][i] || ''; }
function renderLearning(){
  const p=CURRICULUM[state.currentProblem]; if(!p)return;
  $('learnIndex').textContent=`第 ${state.currentProblem+1} / ${CURRICULUM.length} 题`;
  $('learnTitle').textContent=p.title;
  $('learnMeta').innerHTML=`<span>${p.number}</span><span>${p.topic}</span><span class="diff ${difficultyClass(p.difficulty)}">${p.difficulty}</span>`;
  $('learnSteps').innerHTML=[0,1,2,3,4].map(i=>`<button class="learnStep ${i===state.currentStep?'active':''} ${i<state.currentStep?'past':''}" data-step="${i}"><span>${i+1}</span>${stepLabel(i)}</button>`).join('');
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{state.currentStep=Number(b.dataset.step);persist();renderLearning()}));
  const renderers=[renderConcept,renderCodeLesson,renderQuiz,renderEditor,renderComplete];
  $('learningCard').innerHTML=renderers[state.currentStep](p);
  bindLearningStep(p);
}

function navFooter(prev=true,nextLabel='继续 →'){
  return `<div class="learnFooter"><button class="secondary" id="learnPrev" ${!prev?'disabled':''}>← 上一步</button><button class="primary" id="learnNext">${nextLabel}</button></div>`;
}
function renderConcept(p){
  return `<div class="sectionLabel">思路</div><h2>${p.title}</h2><p class="lead">${p.concept}</p>
    <div class="conceptBox"><b>这一题先记住</b><p>${p.pattern.split('\n')[0]}</p></div>
    ${navFooter(state.currentStep>0,'看代码 →')}`;
}
function renderCodeLesson(p){
  return `<div class="sectionLabel">Python 写法</div><h2>把思路翻译成代码</h2>
    <pre class="codeLesson"><code>${escapeHtml(p.pattern)}</code></pre>
    <div class="noteGrid">${p.notes.map(n=>`<div class="note"><code>${escapeHtml(n[0])}</code><p>${n[1]}</p></div>`).join('')}</div>
    ${navFooter(true,'检查理解 →')}`;
}
function renderQuiz(p){
  return `<div class="sectionLabel">检查</div><h2>${p.quiz.q}</h2><div class="quizList">${p.quiz.options.map((o,i)=>`<button class="quizOpt" data-answer="${i}">${o}</button>`).join('')}</div>
    <div id="quizExplain" class="answerExplain" style="display:none"></div>${navFooter(true,'答对后继续 →')}`;
}
function renderEditor(p){
  const saved=state.codes[p.slug] ?? p.starter;
  return `<div class="sectionLabel">完整题</div><div class="editorHead"><div><h2>在本站完成 ${p.title}</h2><p>先自己写；需要时可以回到“代码”步骤查看结构。</p></div><span>Python</span></div>
    <textarea id="codeEditor" class="editor" spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off">${escapeHtml(saved)}</textarea>
    <div class="editorActions"><button class="primary" id="runCode">▶ 运行测试</button><button class="secondary" id="resetCode">还原起始代码</button></div>
    <div id="runOutput" class="runOutput">写完后运行测试。</div>
    ${navFooter(true,'通过测试后继续 →')}`;
}
function renderComplete(p){
  const done=state.solved[p.slug];
  return `<div class="sectionLabel">完成</div><h2>${done?'这题已经完成':'记录这次完成情况'}</h2>
    <p class="lead">选择最接近的一项。系统会据此安排复习。</p>
    <div class="ratingGrid">
      <button class="rating ${done?.level==='solo'?'selected':''}" data-rate="solo"><b>独立完成</b><span>思路和代码基本独立写出</span></button>
      <button class="rating ${done?.level==='hint'?'selected':''}" data-rate="hint"><b>回看后完成</b><span>理解思路，但代码还不熟</span></button>
      <button class="rating ${done?.level==='hard'?'selected':''}" data-rate="hard"><b>比较困难</b><span>需要尽快再做一次</span></button>
    </div>
    <div id="completeMsg" class="answerExplain" style="${done?'':'display:none'}">${done?'已记录，可以继续下一题。':''}</div>
    <div class="learnFooter"><button class="secondary" id="learnPrev">← 上一步</button><button class="primary" id="nextProblemBtn" ${done?'':'disabled'}>${state.currentProblem===CURRICULUM.length-1?'完成前 30 题':'下一题 →'}</button></div>`;
}

let stepPassed = false;
function bindLearningStep(p){
  stepPassed=false;
  const prev=$('learnPrev'); if(prev) prev.addEventListener('click',()=>{if(state.currentStep>0){state.currentStep--;persist();renderLearning()}});
  if(state.currentStep===0 || state.currentStep===1){
    $('learnNext')?.addEventListener('click',()=>{state.currentStep++;persist();renderLearning()});
  }
  if(state.currentStep===2){
    let correct=false;
    document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
      const ans=Number(b.dataset.answer); correct=ans===p.quiz.answer;
      document.querySelectorAll('[data-answer]').forEach(x=>x.classList.remove('correct','wrong'));
      b.classList.add(correct?'correct':'wrong');
      const ex=$('quizExplain'); ex.style.display='block'; ex.className=`answerExplain ${correct?'ok':'bad'}`;
      ex.innerHTML=correct?`<b>正确</b><p>${p.quiz.explain}</p>`:`<b>再想一下</b><p>${p.quiz.explain}</p>`;
    }));
    $('learnNext').addEventListener('click',()=>{
      if(!correct){const ex=$('quizExplain');ex.style.display='block';ex.className='answerExplain bad';ex.innerHTML='<b>先选出正确答案再继续。</b>';return;}
      state.currentStep=3;persist();renderLearning();
    });
  }
  if(state.currentStep===3) bindEditor(p);
  if(state.currentStep===4) bindComplete(p);
}

function enableIndent(ed){
  ed.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault(); const s=ed.selectionStart,en=ed.selectionEnd,before=ed.value.slice(0,s),after=ed.value.slice(en);
      const line=before.slice(before.lastIndexOf('\n')+1); const base=(line.match(/^\s*/)||[''])[0]; const extra=line.trimEnd().endsWith(':')?'    ':''; const ins='\n'+base+extra;
      ed.value=before+ins+after; ed.selectionStart=ed.selectionEnd=s+ins.length; ed.dispatchEvent(new Event('input',{bubbles:true}));
    } else if(e.key==='Tab'){
      e.preventDefault(); const s=ed.selectionStart,en=ed.selectionEnd; ed.value=ed.value.slice(0,s)+'    '+ed.value.slice(en); ed.selectionStart=ed.selectionEnd=s+4; ed.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });
}

let pyPromise=null;
async function getPy(){
  if(!pyPromise){ if(typeof loadPyodide!=='function') throw new Error('Python 运行器未加载'); pyPromise=loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'}); }
  return pyPromise;
}
const PY_PRELUDE = `
import json
_results=[]
def check(ok, case, got=None):
    _results.append({'ok': bool(ok), 'case': case, 'got': repr(got)})
class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next
    def __repr__(self): return f'ListNode({self.val})'
def build_list(vals):
    dummy=ListNode(); cur=dummy
    for v in vals:
        cur.next=ListNode(v); cur=cur.next
    return dummy.next
def list_values(head, limit=200):
    out=[]; seen=set()
    while head and len(out)<limit:
        if id(head) in seen: break
        seen.add(id(head)); out.append(head.val); head=head.next
    return out
def node_at(head, idx):
    for _ in range(idx):
        if head is None: return None
        head=head.next
    return head
def build_cycle(vals, pos):
    head=build_list(vals)
    if not head or pos < 0: return head
    entry=node_at(head,pos); tail=head
    while tail.next: tail=tail.next
    tail.next=entry
    return head
`;

function bindEditor(p){
  const ed=$('codeEditor'), out=$('runOutput'); let passed=Boolean(state.solved[p.slug]);
  enableIndent(ed);
  ed.addEventListener('input',()=>{state.codes[p.slug]=ed.value;persist();});
  $('resetCode').addEventListener('click',()=>{ed.value=p.starter; state.codes[p.slug]=p.starter;persist();ed.focus();ed.selectionStart=ed.selectionEnd=ed.value.length;});
  $('runCode').addEventListener('click',async()=>{
    out.className='runOutput'; out.textContent='正在运行测试...';
    try{
      const py=await getPy();
      const code=PY_PRELUDE+'\n'+ed.value+'\n'+p.judge+'\njson.dumps(_results, ensure_ascii=False)';
      const raw=await py.runPythonAsync(code); const results=JSON.parse(raw); const okCount=results.filter(r=>r.ok).length; passed=okCount===results.length;
      out.className=`runOutput ${passed?'pass':'fail'}`;
      out.innerHTML=`<b>${okCount} / ${results.length} 组测试通过</b><br>${results.map((r,i)=>`测试 ${i+1}：${r.ok?'通过':`未通过 · ${escapeHtml(r.case)} · 得到 ${escapeHtml(r.got)}`}`).join('<br>')}`;
    }catch(err){passed=false;out.className='runOutput fail';out.textContent='运行失败：'+(err.message||err);}
  });
  $('learnNext').addEventListener('click',()=>{
    if(!passed){out.className='runOutput fail';out.textContent='先通过测试，再继续。';return;}
    state.currentStep=4;persist();renderLearning();
  });
}

function scheduleReview(p,level){
  const days=level==='solo'?4:level==='hint'?2:1; const type=level==='solo'?'完整题回忆':level==='hint'?'代码回忆':'重新学习并做题';
  const old=state.reviewQueue.find(r=>r.slug===p.slug); const item={slug:p.slug,due:dueDate(days),type};
  if(old) Object.assign(old,item); else state.reviewQueue.push(item);
}
function bindComplete(p){
  const btn=$('nextProblemBtn');
  document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-rate]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');
    const level=b.dataset.rate; const first=!state.solved[p.slug];
    state.solved[p.slug]={level,completedAt:new Date().toISOString()}; scheduleReview(p,level);
    if(first && state.currentProblem===Math.max(0,solvedCount()-1)) state.currentProblem=Math.min(CURRICULUM.length-1,state.currentProblem);
    save();
    $('completeMsg').style.display='block'; $('completeMsg').className='answerExplain ok'; $('completeMsg').innerHTML=`<b>已记录</b><p>${level==='solo'?'4 天后复习。':level==='hint'?'2 天后复习代码。':'明天重新学习并做题。'}</p>`;
    btn.disabled=false;
  }));
  btn?.addEventListener('click',()=>{
    if(!state.solved[p.slug])return;
    if(state.currentProblem===CURRICULUM.length-1){showPage('home');return;}
    nextProblem();
  });
}

$('nextDayBtn')?.addEventListener('click',()=>{});
$('resetAll')?.addEventListener('click',()=>{
  if(confirm('清除这个浏览器中的全部学习记录？')){localStorage.removeItem(KEY);state={...defaults,solved:{},codes:{},reviewQueue:[]};save();showPage('home');}
});

renderAll();
showPage(state.lastPage && document.getElementById('page-'+state.lastPage) ? state.lastPage : 'home');
