(()=>{
const SNAP_KEY='hot100-lab-snapshots-v1';
const SNAP_LIMIT=5;

function ensurePracticeState(){
  state.attempts=state.attempts||{};
  state.notes=state.notes||{};
  state.positions=state.positions||{};
  state.lastTouched=state.lastTouched||{};
}
function localYmd(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function snapshotProgress(){
  ensurePracticeState();
  return {
    currentProblem:state.currentProblem,deckIndex:state.deckIndex,
    completedCards:state.completedCards||{},solved:state.solved||{},codes:state.codes||{},
    reviewQueue:state.reviewQueue||[],lastPage:state.lastPage||'home',positions:state.positions||{},
    lastTouched:state.lastTouched||{},reviewing:state.reviewing||null,notes:state.notes||{}
  };
}
function loadSnapshots(){
  try{const x=JSON.parse(localStorage.getItem(SNAP_KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}
}
function writeSnapshots(items){
  try{localStorage.setItem(SNAP_KEY,JSON.stringify(items.slice(0,SNAP_LIMIT)))}catch(e){
    // If storage is tight, retain fewer snapshots rather than risking the live learning state.
    try{localStorage.setItem(SNAP_KEY,JSON.stringify(items.slice(0,2)))}catch(_e){}
  }
}
function meaningfulProgress(){
  return Object.keys(state.solved||{}).length>0||Object.keys(state.completedCards||{}).length>0||Object.keys(state.codes||{}).length>0||Object.keys(state.notes||{}).length>0;
}
function createSnapshot(reason='手动快照',force=false){
  if(!force&&!meaningfulProgress())return null;
  const items=loadSnapshots();
  const solved=Object.keys(state.solved||{}).length;
  const snap={id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,createdAt:new Date().toISOString(),day:localYmd(),reason,solved,currentProblem:Number(state.currentProblem||0),progress:snapshotProgress()};
  const signature=JSON.stringify([solved,state.currentProblem,state.deckIndex,Object.keys(state.completedCards||{}).length,Object.keys(state.codes||{}).length]);
  if(!force&&items[0]?.signature===signature&&items[0]?.day===snap.day)return items[0];
  snap.signature=signature;items.unshift(snap);writeSnapshots(items);renderSnapshotList();return snap;
}
function normalizeSnapshotProgress(p){
  const next={...state,...p};
  next.completedCards=next.completedCards||{};next.solved=next.solved||{};next.codes=next.codes||{};
  next.reviewQueue=Array.isArray(next.reviewQueue)?next.reviewQueue:[];next.positions=next.positions||{};
  next.lastTouched=next.lastTouched||{};next.attempts=state.attempts||{};next.notes=next.notes||{};
  next.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,Number(next.currentProblem)||0));
  next.deckIndex=Math.max(0,Math.min(CARD_COUNT,Number(next.deckIndex)||0));
  return next;
}
function restoreSnapshot(id){
  const snap=loadSnapshots().find(x=>x.id===id);if(!snap)return;
  if(!confirm(`恢复这份进度快照？\n\n${formatSnapshotTime(snap.createdAt)} · ${snap.reason}\n已完成 ${snap.solved||0} 题\n\n当前进度会先自动保存一份“恢复前”快照。`))return;
  createSnapshot('恢复快照前',true);
  state=normalizeSnapshotProgress(snap.progress||{});persist();location.reload();
}
function formatSnapshotTime(iso){
  try{return new Date(iso).toLocaleString([], {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return iso||''}
}
function renderSnapshotList(){
  const box=document.getElementById('snapshotList');if(!box)return;
  const items=loadSnapshots();
  box.innerHTML=items.length?items.map(s=>`<button class="snapshotItem" data-snapshot="${esc(s.id)}"><span><b>${esc(s.reason||'快照')}</b><small>${esc(formatSnapshotTime(s.createdAt))} · ${Number(s.solved||0)} 题完成</small></span><em>恢复</em></button>`).join(''):'<small class="snapshotEmpty">还没有快照。开始学习后会每天自动保存。</small>';
  box.querySelectorAll('[data-snapshot]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();restoreSnapshot(b.dataset.snapshot)}));
}
function mountSnapshotMenu(){
  const pop=document.querySelector('#hot100DataMenu .utilityPopover');if(!pop||document.getElementById('snapshotSection'))return;
  const sec=document.createElement('div');sec.id='snapshotSection';sec.className='snapshotSection';
  sec.innerHTML=`<div class="snapshotHead"><span><b>进度快照</b><small>自动保留最近 ${SNAP_LIMIT} 份</small></span><button class="secondary" id="makeSnapshot">立即保存</button></div><div id="snapshotList" class="snapshotList"></div>`;
  pop.appendChild(sec);
  document.getElementById('makeSnapshot')?.addEventListener('click',e=>{e.preventDefault();createSnapshot('手动快照',true)});
  renderSnapshotList();
}

function attemptBucket(slug){
  ensurePracticeState();
  const raw=state.attempts[slug];
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
    raw.runs=Array.isArray(raw.runs)?raw.runs:[];raw.versions=Array.isArray(raw.versions)?raw.versions:[];return raw;
  }
  const bucket={runs:[],versions:[]};state.attempts[slug]=bucket;return bucket;
}
function saveRunVersion(p,code){
  const b=attemptBucket(p.slug),last=b.versions[0];
  if(last?.code===code)return;
  b.versions.unshift({at:new Date().toISOString(),code});b.versions=b.versions.slice(0,8);persist();
}
function recordRun(p,passed,duration){
  const b=attemptBucket(p.slug);
  b.runs.unshift({at:new Date().toISOString(),passed:Boolean(passed),duration:Math.round(duration)});
  b.runs=b.runs.slice(0,20);persist();renderPracticeStats(p);
}
function renderPracticeStats(p){
  const box=document.getElementById('practiceStats');if(!box)return;
  const b=attemptBucket(p.slug),runs=b.runs,total=runs.length,pass=runs.filter(x=>x.passed).length,last=runs[0];
  box.innerHTML=`<span>运行 ${total} 次</span>${total?`<span>通过 ${pass} 次</span>`:''}${last?`<span>上次 ${(last.duration/1000).toFixed(2)}s</span>`:''}`;
  const history=document.getElementById('runHistoryList');
  if(history)history.innerHTML=runs.length?runs.slice(0,5).map((r,i)=>`<div><span>${r.passed?'✓ 通过':'× 未通过'} · ${(r.duration/1000).toFixed(2)}s</span><small>${esc(formatSnapshotTime(r.at))}${i===0?' · 最近一次':''}</small></div>`).join(''):'<small>还没有运行记录。</small>';
}
function restorePreviousCode(p,ed){
  const versions=attemptBucket(p.slug).versions;if(!versions.length){alert('还没有可恢复的运行版本。');return}
  const current=ed.value;
  const target=versions.find(v=>v.code!==current)||versions[0];
  if(!confirm(`恢复 ${formatSnapshotTime(target.at)} 保存的代码？\n当前编辑器内容会被替换。`))return;
  ed.value=target.code;state.codes[p.slug]=target.code;persist();ed.dispatchEvent(new Event('input',{bubbles:true}));ed.focus();
}
function makeReferenceCode(p){
  const pattern=String(p.pattern||'').trim();
  if(/^(?:def |class )/m.test(pattern)&&/^(?:def |class )/.test(pattern))return pattern;
  if(/^import |^from /.test(pattern)&&/^((?:import|from) .+\n)+(?:class |def )/m.test(pattern))return pattern;
  const starter=String(p.starter||'');
  const def=(starter.split('\n').find(x=>/^\s*def\s+/.test(x))||'').trim();
  if(!def)return pattern;
  const lines=pattern.split('\n');
  const imports=[];while(lines.length&&/^(from |import )/.test(lines[0].trim()))imports.push(lines.shift().trim());
  const body=lines.map(x=>'    '+x).join('\n');
  return `${imports.length?imports.join('\n')+'\n\n':''}${def}\n${body}`;
}
function diffLines(a,b){
  const A=a.replace(/\r/g,'').split('\n'),B=b.replace(/\r/g,'').split('\n'),n=A.length,m=B.length;
  const dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=A[i]===B[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  const out=[];let i=0,j=0;
  while(i<n&&j<m){if(A[i]===B[j]){out.push(['same',A[i]]);i++;j++}else if(dp[i+1][j]>=dp[i][j+1]){out.push(['del',A[i++]]);}else out.push(['add',B[j++]]);}
  while(i<n)out.push(['del',A[i++]]);while(j<m)out.push(['add',B[j++]]);return out;
}
function openReferenceDiff(p,ed){
  const dialog=document.getElementById('referenceDiff');if(!dialog)return;
  const ref=makeReferenceCode(p),diff=diffLines(ed.value,ref);
  dialog.querySelector('.diffTitle b').textContent=`${p.title} · 代码对比`;
  dialog.querySelector('.diffBody').innerHTML=diff.map(([kind,line])=>`<div class="diffLine ${kind}"><span>${kind==='add'?'+':kind==='del'?'−':' '}</span><code>${esc(line)||' '}</code></div>`).join('');
  dialog.classList.add('open');
}
function ensureDiffDialog(){
  if(document.getElementById('referenceDiff'))return;
  const div=document.createElement('div');div.id='referenceDiff';div.className='diffModal';
  div.innerHTML=`<div class="diffPanel"><div class="diffTitle"><b>代码对比</b><button class="round" id="closeDiff">×</button></div><p class="muted">− 是你的代码里参考实现没有的行；+ 是参考实现中的行。写法不同但逻辑正确并不代表需要改成一模一样。</p><div class="diffBody"></div></div>`;
  document.body.appendChild(div);document.getElementById('closeDiff')?.addEventListener('click',()=>div.classList.remove('open'));div.addEventListener('click',e=>{if(e.target===div)div.classList.remove('open')});
}
function mountPracticeEditor(p){
  const ed=document.getElementById('editor'),run=document.getElementById('run');if(!ed||!run||document.getElementById('practiceTools'))return;
  ensurePracticeState();ensureDiffDialog();
  const tools=document.createElement('div');tools.id='practiceTools';tools.className='practiceTools';
  tools.innerHTML=`<div id="practiceStats" class="practiceStats"></div><div class="practiceActions"><button class="secondary" id="restoreRunCode">恢复上次运行版本</button><button class="secondary" id="compareReference" style="display:${state.solved[p.slug]?'inline-flex':'none'}">对比参考实现</button><details class="runHistory"><summary>运行历史</summary><div id="runHistoryList"></div></details></div>`;
  const out=document.getElementById('output');out?.insertAdjacentElement('beforebegin',tools);renderPracticeStats(p);
  document.getElementById('restoreRunCode')?.addEventListener('click',()=>restorePreviousCode(p,ed));
  document.getElementById('compareReference')?.addEventListener('click',()=>openReferenceDiff(p,ed));

  let startedAt=0,pending=false;
  const observer=new MutationObserver(()=>{
    if(!pending)return;
    const out=document.getElementById('output');if(!out)return;
    const final=out.classList.contains('pass')||out.classList.contains('fail');if(!final)return;
    pending=false;const passed=out.classList.contains('pass');recordRun(p,passed,performance.now()-startedAt);
    if(passed){const btn=document.getElementById('compareReference');if(btn)btn.style.display='inline-flex'}
  });
  if(out)observer.observe(out,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  run.addEventListener('click',()=>{saveRunVersion(p,ed.value);startedAt=performance.now();pending=true;});

  // A few extra mobile keys that reduce keyboard switching while keeping the row horizontally scrollable.
  const keybar=ed.parentElement?.querySelector('.mobileCodeKeys');
  if(keybar){for(const key of ['{}','==','!=','<','>',"''"]){if(keybar.querySelector(`[data-extra-key="${CSS.escape(key)}"]`))continue;const b=document.createElement('button');b.type='button';b.className='codeKey';b.dataset.extraKey=key;b.textContent=key;b.addEventListener('click',()=>{
      const start=ed.selectionStart,end=ed.selectionEnd,selected=ed.value.slice(start,end);let text=key,pos;
      if(key==='{}'){text=`{${selected}}`;pos=selected?start+text.length:start+1}else if(key==="''"){text=`'${selected}'`;pos=selected?start+text.length:start+1}else{pos=start+text.length}
      ed.value=ed.value.slice(0,start)+text+ed.value.slice(end);ed.selectionStart=ed.selectionEnd=pos;ed.dispatchEvent(new Event('input',{bubbles:true}));ed.focus();
    });keybar.appendChild(b)}}
}

const practiceBaseBindEditor=bindEditorCard;
bindEditorCard=function(p){practiceBaseBindEditor(p);mountPracticeEditor(p)};

// Snapshot meaningful completions without taking one on every keystroke.
const practiceBaseScheduleReview=scheduleReview;
scheduleReview=function(p,level){practiceBaseScheduleReview(p,level);const items=loadSnapshots(),last=items[0];const solved=Object.keys(state.solved||{}).length;if(!last||last.solved!==solved)createSnapshot(`完成 · ${p.title}`)};

function autoDailySnapshot(){
  if(!meaningfulProgress())return;
  const today=localYmd(),items=loadSnapshots();if(items.some(x=>x.day===today&&x.reason==='每日自动快照'))return;
  createSnapshot('每日自动快照');
}

mountSnapshotMenu();
autoDailySnapshot();
document.getElementById('resetBtn')?.addEventListener('click',()=>createSnapshot('重置前',true),true);
document.getElementById('importProgress')?.addEventListener('click',()=>createSnapshot('导入前',true),true);

const style=document.createElement('style');
style.textContent=`
.snapshotSection{border-top:1px solid var(--line);padding-top:10px;margin-top:2px}.snapshotHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.snapshotHead>span{display:grid;gap:2px}.snapshotHead small{font-size:11px}.snapshotList{display:grid;gap:5px;margin-top:8px}.snapshotItem{border:1px solid var(--line);border-radius:10px;background:#fff;padding:8px 9px;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:8px;color:var(--text)}.snapshotItem span{display:grid;gap:2px}.snapshotItem b{font-size:12px}.snapshotItem small{font-size:10px;color:var(--muted)}.snapshotItem em{font-size:11px;font-style:normal;color:var(--accent)}.snapshotEmpty{display:block;padding:7px 0;color:var(--muted)}
.practiceTools{margin:10px 0 0;border:1px solid var(--line);border-radius:12px;padding:10px 11px;background:#fff}.practiceStats{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-bottom:8px}.practiceActions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.runHistory{position:relative}.runHistory summary{cursor:pointer;font-size:12px;color:var(--muted);padding:7px 4px}.runHistory[open] #runHistoryList{display:grid}.runHistory #runHistoryList{position:absolute;z-index:20;right:0;top:100%;min-width:230px;background:#fff;border:1px solid var(--line);border-radius:11px;padding:8px;box-shadow:0 12px 30px rgba(30,35,50,.12);gap:5px}.runHistory #runHistoryList>div{display:flex;justify-content:space-between;gap:12px;padding:6px;border-bottom:1px solid var(--line);font-size:11px}.runHistory #runHistoryList>div:last-child{border-bottom:0}.runHistory #runHistoryList small{color:var(--muted)}
.diffModal{position:fixed;inset:0;background:rgba(20,24,35,.35);display:none;align-items:center;justify-content:center;padding:18px;z-index:100}.diffModal.open{display:flex}.diffPanel{width:min(860px,96vw);max-height:86vh;background:#fff;border-radius:16px;border:1px solid var(--line);box-shadow:0 24px 80px rgba(20,24,35,.22);padding:16px;display:flex;flex-direction:column}.diffTitle{display:flex;align-items:center;justify-content:space-between;gap:12px}.diffPanel>p{font-size:12px;line-height:1.55;margin:7px 0 10px}.diffBody{overflow:auto;border:1px solid var(--line);border-radius:11px;background:#fafafa;padding:7px 0}.diffLine{display:grid;grid-template-columns:24px 1fr;gap:4px;padding:2px 9px;font-size:12px;line-height:1.55}.diffLine>span{text-align:center;color:var(--muted)}.diffLine code{white-space:pre-wrap;word-break:break-word}.diffLine.add{background:#eef9f2}.diffLine.del{background:#fff1f0}.diffLine.same{opacity:.72}@media(max-width:620px){.practiceActions>.secondary{flex:1 1 auto}.runHistory{width:100%}.runHistory #runHistoryList{position:static;margin-top:4px;box-shadow:none}.diffPanel{padding:12px}.diffLine{font-size:11px}}
`;
document.head.appendChild(style);
})();