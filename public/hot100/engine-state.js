const CURRICULUM = window.HOT100_CURRICULUM || [];
const LESSONS = window.HOT100_LESSONS || {};
const KEY = 'hot100-lab-v4';
const CARD_COUNT = 8;
const defaults = {currentProblem:0,deckIndex:0,completedCards:{},solved:{},codes:{},reviewQueue:[],lastPage:'home'};
const MAX_CODE_CHARS=100000,MAX_STATE_CHARS=4*1024*1024;
let state={...defaults};
try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(saved){state={...defaults,...saved,completedCards:saved.completedCards||{},solved:saved.solved||{},codes:saved.codes||{},reviewQueue:saved.reviewQueue||[]};}
  else{
    const v3=JSON.parse(localStorage.getItem('hot100-lab-v3')||'null');
    const v2=JSON.parse(localStorage.getItem('hot100-lab-v2')||'null');
    if(v3){state.currentProblem=Math.min(v3.currentProblem||0,Math.max(0,CURRICULUM.length-1));state.solved=v3.solved||{};state.codes=v3.codes||{};state.reviewQueue=v3.reviewQueue||[];}
    else if(v2){
      if(v2.twoSumStatus)state.solved['two-sum']={level:v2.twoSumStatus,completedAt:new Date().toISOString()};
      if(Array.isArray(v2.completedCards))state.completedCards['two-sum']=v2.completedCards.map(id=>id==='need'?'translate':id==='order'?'meaning':id);
      if(v2.cardAnswers?.twoSumCode)state.codes['two-sum']=v2.cardAnswers.twoSumCode;
      state.reviewQueue=v2.reviewQueue||[];
    }
  }
}catch(e){}
if(!state||typeof state!=='object'||Array.isArray(state))state={...defaults};
for(const key of ['completedCards','solved','codes'])if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))state[key]={};
if(!Array.isArray(state.reviewQueue))state.reviewQueue=[];
state.reviewQueue=state.reviewQueue.filter(item=>item&&typeof item==='object'&&typeof item.slug==='string'&&typeof item.due==='string').slice(0,200);
for(const [slug,code] of Object.entries(state.codes))if(typeof code!=='string')delete state.codes[slug];
state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,Number(state.currentProblem)||0));
state.deckIndex=Math.max(0,Math.min(CARD_COUNT,Number(state.deckIndex)||0));
const $=id=>document.getElementById(id);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>window.HOT100_CALENDAR?.dayKey()||'';
const dueDate=days=>window.HOT100_CALENDAR?.addDays(days)||today();
const current=()=>CURRICULUM[state.currentProblem];
const doneCards=slug=>Array.isArray(state.completedCards[slug])?state.completedCards[slug]:[];
const solvedCount=()=>Object.keys(state.solved).filter(slug=>CURRICULUM.some(p=>p.slug===slug)).length;
let persistTimer=null,lastStorageErrorAt=0;
function reportStorageError(error){
  const now=Date.now(),shouldNotify=now-lastStorageErrorAt>2500;lastStorageErrorAt=now;
  if(!shouldNotify)return;
  try{window.dispatchEvent(new CustomEvent('solveshiftstorageerror',{detail:{message:error?.message||String(error||'学习记录无法保存')}}))}catch(e){}
}
function persist(){
  clearTimeout(persistTimer);persistTimer=null;
  try{
    const payload=JSON.stringify(state);
    if(payload.length>MAX_STATE_CHARS){const error=new Error('学习记录已超过浏览器安全保存上限，请先导出备份并精简较长的代码或笔记。');error.code='STATE_SIZE_LIMIT';throw error}
    localStorage.setItem(KEY,payload);return true
  }catch(error){reportStorageError(error);return false}
}
function persistSoon(delay=280){clearTimeout(persistTimer);persistTimer=setTimeout(()=>persist(),delay)}
if(typeof window!=='undefined')window.addEventListener('pagehide',()=>persist());
function save(){persist();renderHome();renderProblems();renderKnowledge();renderReview();renderSide()}
function completeCard(slug,id){const arr=doneCards(slug);if(!arr.includes(id))arr.push(id);state.completedCards[slug]=arr;save()}
function scheduleReview(p,level){const days=level==='solo'?4:level==='hint'?2:1;const type=level==='solo'?'完整题回忆':level==='hint'?'代码回忆':'重新学习并做题';const old=state.reviewQueue.find(r=>r.slug===p.slug);const item={slug:p.slug,due:dueDate(days),type};if(old)Object.assign(old,item);else state.reviewQueue.push(item)}
function showPage(name){state.lastPage=name;persist();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));if(name==='deck')renderCard();if(name==='problems')renderProblems();if(name==='knowledge')renderKnowledge();if(name==='review')renderReview();window.scrollTo({top:0,behavior:'smooth'})}
function openProblem(index){state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,index));state.deckIndex=0;persist();showPage('deck')}
function nextProblem(){if(state.currentProblem<CURRICULUM.length-1){state.currentProblem+=1;state.deckIndex=0;save();renderCard();window.scrollTo({top:0,behavior:'smooth'})}else showPage('home')}
function nextCard(){state.deckIndex=state.deckIndex<CARD_COUNT-1?state.deckIndex+1:CARD_COUNT;save();renderCard();window.scrollTo({top:0,behavior:'smooth'})}
function prevCard(){if(state.deckIndex>0)state.deckIndex-=1;save();renderCard();window.scrollTo({top:0,behavior:'smooth'})}
function header(cls,label,step){return `<div class="cardType"><span class="typePill ${cls}">${label}</span><span class="muted" style="font-size:12px">${step}</span></div>`}
function footer(label='继续 →'){return `<div class="cardFooter"><small class="muted">完成当前步骤后继续</small><div class="footerActions"><button class="secondary" id="prevCard">← 上一步</button><button class="primary" id="nextCard">${label}</button></div></div>`}
function bindFooter(check){$('prevCard')?.addEventListener('click',prevCard);$('nextCard')?.addEventListener('click',()=>{if(!check||check()){const card=buildCards(current())[state.deckIndex];completeCard(current().slug,card.id);nextCard()}})}
function enablePythonIndent(editor){editor.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd,before=editor.value.slice(0,start),after=editor.value.slice(end),lineStart=before.lastIndexOf('\n')+1,currentLine=before.slice(lineStart),base=(currentLine.match(/^\s*/)||[''])[0],extra=currentLine.trimEnd().endsWith(':')?'    ':'',indent=base+extra;editor.value=`${before}\n${indent}${after}`;const pos=start+1+indent.length;editor.selectionStart=editor.selectionEnd=pos;editor.dispatchEvent(new Event('input',{bubbles:true}));return}if(e.key==='Tab'){e.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;if(e.shiftKey){const ls=editor.value.lastIndexOf('\n',start-1)+1,rm=editor.value.slice(ls,ls+4).match(/^ {1,4}/)?.[0]||'';editor.value=editor.value.slice(0,ls)+editor.value.slice(ls+rm.length);editor.selectionStart=editor.selectionEnd=Math.max(ls,start-rm.length)}else{editor.value=editor.value.slice(0,start)+'    '+editor.value.slice(end);editor.selectionStart=editor.selectionEnd=start+4}editor.dispatchEvent(new Event('input',{bubbles:true}))}})}
const PY_RUN_TIMEOUT_MS=4000,PY_INIT_TIMEOUT_MS=45000,PY_MAX_SOURCE_CHARS=140000;
let pyPromise=null,pyWorker=null,pyInitReject=null,pyRequestId=0;
const pyPending=new Map();
function pythonTimeoutError(){const error=new Error(`代码运行超过 ${PY_RUN_TIMEOUT_MS/1000} 秒，已自动停止。请检查循环结束条件或递归边界后重试；你的代码仍然保留。`);error.code='PYTHON_TIMEOUT';return error}
function isPythonTimeout(error){return error?.code==='PYTHON_TIMEOUT'}
function resetPythonWorker(error=new Error('Python Worker 已重置')){
  const worker=pyWorker,rejectInit=pyInitReject;pyWorker=null;pyPromise=null;pyInitReject=null;
  try{worker?.terminate()}catch(e){}
  if(rejectInit)rejectInit(error);
  for(const pending of pyPending.values()){clearTimeout(pending.timer);pending.reject(error)}
  pyPending.clear()
}
function retirePythonWorker(worker){
  if(worker!==pyWorker)return;
  pyWorker=null;pyPromise=null;pyInitReject=null;
  try{worker.terminate()}catch(e){}
}
function pythonRequestToken(){
  try{return crypto.randomUUID()}catch(e){return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`}
}
function runPythonIsolated(code,timeoutMs=PY_RUN_TIMEOUT_MS){
  if(!pyWorker)return Promise.reject(new Error('Python Worker 未就绪'));
  if(pyPending.size)return Promise.reject(new Error('已有代码正在运行，请等待本次运行结束。'));
  code=String(code||'');
  if(code.length>PY_MAX_SOURCE_CHARS){const error=new Error(`代码过长，最多允许 ${PY_MAX_SOURCE_CHARS.toLocaleString()} 个字符。`);error.code='PYTHON_SOURCE_LIMIT';return Promise.reject(error)}
  const id=++pyRequestId,token=pythonRequestToken();
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>resetPythonWorker(pythonTimeoutError()),timeoutMs);
    pyPending.set(id,{resolve,reject,timer,token});
    try{pyWorker.postMessage({type:'run',id,token,code})}catch(error){resetPythonWorker(error)}
  })
}
async function getPy(){
  if(pyPromise)return pyPromise;
  if(typeof Worker!=='function')throw new Error('当前浏览器不支持独立 Python Worker');
  const worker=new Worker('./python-worker.js');pyWorker=worker;
  pyPromise=new Promise((resolve,reject)=>{
    pyInitReject=reject;
    const initTimer=setTimeout(()=>resetPythonWorker(new Error('Python Worker 初始化超时')),PY_INIT_TIMEOUT_MS);
    worker.addEventListener('message',event=>{
      if(worker!==pyWorker)return;const message=event.data||{};
      if(message.type==='ready'){clearTimeout(initTimer);pyInitReject=null;resolve({runPythonAsync:runPythonIsolated});return}
      if(message.type==='fatal'){clearTimeout(initTimer);resetPythonWorker(new Error(message.message||'Python Worker 初始化失败'));return}
      if(message.type!=='result'&&message.type!=='error')return;
      const pending=pyPending.get(message.id);if(!pending||message.token!==pending.token)return;clearTimeout(pending.timer);pyPending.delete(message.id);
      if(message.type==='result')pending.resolve(message.value);else{const error=new Error(message.message||'Python 运行失败');if(message.code)error.code=message.code;pending.reject(error)}
      retirePythonWorker(worker)
    });
    worker.addEventListener('error',event=>{clearTimeout(initTimer);resetPythonWorker(new Error(event.message||'Python Worker 运行失败'))});
    worker.addEventListener('messageerror',()=>{clearTimeout(initTimer);resetPythonWorker(new Error('Python Worker 返回了无法读取的数据'))});
    worker.postMessage({type:'init'})
  });
  return pyPromise
}
function pythonFailureCopy(error){
  const message=error?.message||String(error||'');
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return '当前设备处于离线状态。课程和代码仍保存在本机；首次运行 Python 测试需要联网加载运行器。';
  if(/Python 运行器未加载|Python Worker|loadPyodide|failed to fetch|networkerror|webassembly|wasm|cdn\.jsdelivr/i.test(message))return 'Python 运行器暂时没有加载成功。请检查网络后重新点击“运行测试”；本次代码不会丢失。';
  return ''
}
const PY_PRELUDE=`import json
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
