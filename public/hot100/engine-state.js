const CURRICULUM = window.HOT100_CURRICULUM || [];
const LESSONS = window.HOT100_LESSONS || {};
const KEY = 'hot100-lab-v4';
const CARD_COUNT = 8;
const defaults = {currentProblem:0,deckIndex:0,completedCards:{},solved:{},codes:{},reviewQueue:[],lastPage:'home'};
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
const $=id=>document.getElementById(id);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const dueDate=days=>{const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
const current=()=>CURRICULUM[state.currentProblem];
const doneCards=slug=>state.completedCards[slug]||[];
const solvedCount=()=>Object.keys(state.solved).filter(slug=>CURRICULUM.some(p=>p.slug===slug)).length;
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
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
let pyPromise=null;
async function getPy(){if(!pyPromise){if(typeof loadPyodide!=='function')throw new Error('Python 运行器未加载');pyPromise=loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'})}return pyPromise}
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
