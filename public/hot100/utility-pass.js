(()=>{
const MAX_NOTE_CHARS=20000,MAX_IMPORT_BYTES=5*1024*1024;
let storageToastTimer=null;
function showStorageWarning(message){
  let toast=document.getElementById('storageWarning');
  if(!toast){toast=document.createElement('div');toast.id='storageWarning';toast.className='storageWarning';toast.setAttribute('role','alert');toast.innerHTML='<span><b>学习记录暂未保存</b><small></small></span><button type="button">导出备份</button>';document.body.appendChild(toast);toast.querySelector('button').addEventListener('click',downloadBackup)}
  toast.querySelector('small').textContent=message||'浏览器存储空间不足，请先导出备份。';toast.classList.add('show');clearTimeout(storageToastTimer);storageToastTimer=setTimeout(()=>toast.classList.remove('show'),12000)
}
window.addEventListener('solveshiftstorageerror',event=>showStorageWarning(event.detail?.message));
function ensureUtilityState(){
  state.notes=plainUtilityObject(state.notes)?state.notes:{};
  state.positions=plainUtilityObject(state.positions)?state.positions:{};
  state.lastTouched=plainUtilityObject(state.lastTouched)?state.lastTouched:{};
  state.attempts=plainUtilityObject(state.attempts)?state.attempts:{};
  for(const [slug,note] of Object.entries(state.notes))if(!knownUtilitySlug(slug)||typeof note!=='string')delete state.notes[slug];else if(note.length>MAX_NOTE_CHARS)state.notes[slug]=note.slice(0,MAX_NOTE_CHARS);
}
const plainUtilityObject=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const knownUtilitySlug=slug=>CURRICULUM.some(p=>p.slug===slug);
ensureUtilityState();

// Any save, including the existing reset flow, should repair optional product fields first.
const utilityBaseSave=save;
save=function(){ensureUtilityState();return utilityBaseSave()};

const EXPORT_KEYS=['currentProblem','deckIndex','completedCards','solved','codes','reviewQueue','lastPage','positions','lastTouched','attempts','reviewing','notes','productEvents','productRetention'];
const knownSlugs=new Set(CURRICULUM.map(p=>p.slug)),knownCards=new Set(['intuition','syntax','translate','meaning','fill','trace','full','recall']);
const plainObject=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
function boundedString(value,max,label){if(typeof value!=='string')return'';if(value.length>max)throw new Error(`${label}超过允许长度`);return value}
function slugRecord(value,mapper){const out={};if(!plainObject(value))return out;for(const [slug,item] of Object.entries(value)){if(!knownSlugs.has(slug))continue;const mapped=mapper(item,slug);if(mapped!==undefined)out[slug]=mapped}return out}
function safeStateSnapshot(){
  const out={};
  for(const key of EXPORT_KEYS) out[key]=state[key];
  return out;
}
function downloadBackup(){
  try{
    ensureUtilityState();
    const payload={app:'SolveShift',formatVersion:2,exportedAt:new Date().toISOString(),problemCount:CURRICULUM.length,progress:safeStateSnapshot()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a'),d=new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    a.href=url;a.download=`solveshift-progress-${y}${m}${day}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);window.dispatchEvent(new CustomEvent('solveshiftbackup',{detail:{type:'export',at:payload.exportedAt}}))
  }catch(error){alert('导出失败：'+(error?.message||'无法生成备份'))}
}
function normalizeImported(raw){
  if(raw?.formatVersion&&Number(raw.formatVersion)>2)throw new Error('这份备份来自更高版本，请先更新 SolveShift');
  const src=raw&&raw.progress&&typeof raw.progress==='object'?raw.progress:raw;
  if(!plainObject(src))throw new Error('文件里没有可识别的学习进度');
  const next={...state};
  next.completedCards=slugRecord(src.completedCards,item=>Array.isArray(item)?[...new Set(item.filter(id=>knownCards.has(id)))].slice(0,CARD_COUNT):undefined);
  next.solved=slugRecord(src.solved,item=>plainObject(item)&&['solo','hint','hard'].includes(item.level)?{level:item.level,completedAt:boundedString(item.completedAt||'',80,'完成时间')}:undefined);
  next.codes=slugRecord(src.codes,(item,slug)=>typeof item==='string'?boundedString(item,MAX_CODE_CHARS,`${slug} 的代码`):undefined);
  next.notes=slugRecord(src.notes,(item,slug)=>typeof item==='string'?boundedString(item,MAX_NOTE_CHARS,`${slug} 的笔记`):undefined);
  next.reviewQueue=Array.isArray(src.reviewQueue)?src.reviewQueue.filter(plainObject).filter(item=>knownSlugs.has(item.slug)).slice(0,200).map(item=>({slug:item.slug,due:boundedString(item.due||'',20,'复习日期'),type:boundedString(item.type||'',80,'复习类型')})):[];
  next.positions=slugRecord(src.positions,item=>Number.isFinite(Number(item))?Math.max(0,Math.min(CARD_COUNT,Number(item))):undefined);
  next.lastTouched=slugRecord(src.lastTouched,item=>Number.isFinite(Number(item))?Math.max(0,Number(item)):undefined);
  next.attempts={};
  if(plainObject(src.attempts))for(const [slug,item] of Object.entries(src.attempts)){
    if(knownSlugs.has(slug)&&plainObject(item))next.attempts[slug]={
      runs:Array.isArray(item.runs)?item.runs.filter(plainObject).slice(0,20).map(run=>({at:boundedString(run.at||'',80,'运行时间'),passed:Boolean(run.passed),duration:Math.max(0,Math.min(600000,Number(run.duration)||0))})):[],
      versions:Array.isArray(item.versions)?item.versions.filter(plainObject).slice(0,8).map(version=>({at:boundedString(version.at||'',80,'版本时间'),code:boundedString(version.code||'',MAX_CODE_CHARS,'历史代码')})):[]
    };
  }
  const adaptive=plainObject(src.attempts?.__adaptive)?src.attempts.__adaptive:null;
  if(adaptive)next.attempts.__adaptive={interviews:Array.isArray(adaptive.interviews)?adaptive.interviews.filter(plainObject).filter(x=>knownSlugs.has(x.slug)).slice(-120).map(x=>({slug:x.slug,at:boundedString(x.at||'',80,'练习时间'),passed:Boolean(x.passed),hintsUsed:Math.max(0,Math.min(4,Number(x.hintsUsed)||0)),runs:Math.max(0,Math.min(1000,Number(x.runs)||0)),duration:Math.max(0,Number(x.duration)||0),mode:['random','weak'].includes(x.mode)?x.mode:'random'})):[],mistakes:plainObject(adaptive.mistakes)?adaptive.mistakes:{},activeInterview:null,quickSession:null};
  next.productEvents=Array.isArray(src.productEvents)?src.productEvents.filter(plainObject).slice(-600):[];
  next.productRetention=plainObject(src.productRetention)?{version:1,lastOpenDay:boundedString(src.productRetention.lastOpenDay||'',20,'最近打开日期'),openDays:Array.isArray(src.productRetention.openDays)?src.productRetention.openDays.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-45):[],recoveryPending:Boolean(src.productRetention.recoveryPending),returnGap:Math.max(0,Math.min(3650,Number(src.productRetention.returnGap)||0)),returnedFrom:boundedString(src.productRetention.returnedFrom||'',20,'返回日期')}:{};
  next.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,Number(next.currentProblem)||0));
  next.deckIndex=Math.max(0,Math.min(CARD_COUNT,Number(next.deckIndex)||0));
  if('currentProblem'in src)next.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,Number(src.currentProblem)||0));
  if('deckIndex'in src)next.deckIndex=Math.max(0,Math.min(CARD_COUNT,Number(src.deckIndex)||0));
  next.lastPage=['home','deck','problems','knowledge','review','interview'].includes(src.lastPage)?src.lastPage:'home';
  next.reviewing=plainObject(src.reviewing)&&knownSlugs.has(src.reviewing.slug)?{slug:src.reviewing.slug,type:boundedString(src.reviewing.type||'',80,'复习类型'),openedAt:Number(src.reviewing.openedAt)||Date.now()}:null;
  return next;
}
function importBackup(file){
  if(!file)return;
  if(file.size>MAX_IMPORT_BYTES){alert(`导入失败：备份文件不能超过 ${Math.round(MAX_IMPORT_BYTES/1024/1024)} MB`);return}
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(String(reader.result||''));
      const next=normalizeImported(parsed);
      const solved=Object.keys(next.solved||{}).length;
      if(!confirm(`导入这份学习记录？\n\n已记录完成题目：${solved}\n导入后会替换当前设备上的 Hot100 学习进度。`))return;
      const previous=state;state=next;if(!persist()){state=previous;alert('导入失败：浏览器存储空间不足。原来的学习记录仍然保留，请先导出备份。');return}window.dispatchEvent(new CustomEvent('solveshiftbackup',{detail:{type:'import',at:new Date().toISOString()}}));location.reload();
    }catch(err){alert('导入失败：'+(err?.message||'文件格式不正确'))}
  };
  reader.onerror=()=>alert('导入失败：无法读取文件');
  reader.readAsText(file,'utf-8');
}

function mountDataMenu(){
  const actions=document.querySelector('.topbar>div:last-child');
  if(!actions||document.getElementById('hot100DataMenu'))return;
  const wrap=document.createElement('details');
  wrap.id='hot100DataMenu';wrap.className='utilityMenu';
  wrap.innerHTML=`<summary class="ghost">数据</summary><div class="utilityPopover"><b>学习记录</b><small>进度、代码、复习安排和个人笔记都保存在当前浏览器。</small><button class="secondary" id="exportProgress">导出备份</button><button class="secondary" id="importProgress">导入备份</button><input id="importProgressFile" type="file" accept="application/json,.json" hidden><small class="utilityTip">换电脑或清理浏览器数据前，建议先导出一次。</small></div>`;
  const reset=$('resetBtn');
  if(reset)actions.insertBefore(wrap,reset);else actions.appendChild(wrap);
  $('exportProgress')?.addEventListener('click',e=>{e.preventDefault();downloadBackup();wrap.open=false});
  $('importProgress')?.addEventListener('click',e=>{e.preventDefault();$('importProgressFile')?.click()});
  $('importProgressFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];importBackup(f);e.target.value=''});
  document.addEventListener('click',e=>{if(wrap.open&&!wrap.contains(e.target))wrap.open=false});
}

function mountNote(p){
  const card=$('studyCard');
  if(!card||!p||card.querySelector('.personalNote'))return;
  ensureUtilityState();
  const details=document.createElement('details');
  details.className='personalNote';
  const existing=typeof state.notes[p.slug]==='string'?state.notes[p.slug]:'';
  details.innerHTML=`<summary><span>我的笔记</span><small>${existing.trim()?'已记录':'可记下易错点或一句话总结'}</small></summary><div class="personalNoteBody"><textarea id="personalNoteText" placeholder="例如：这题我总忘记先查再存；0/1 背包容量要倒序。">${esc(existing)}</textarea><div class="noteMeta"><span id="noteSaved">自动保存到当前浏览器</span><span>${p.title}</span></div></div>`;
  card.appendChild(details);
  const ta=$('personalNoteText'),saved=$('noteSaved');if(ta)ta.maxLength=MAX_NOTE_CHARS;
  ta?.addEventListener('input',()=>{
    state.notes[p.slug]=ta.value;persistSoon();
    if(saved){saved.textContent='正在保存…';clearTimeout(ta._saveTimer);ta._saveTimer=setTimeout(()=>{saved.textContent=persist()?'已保存':'未保存 · 请导出备份'},320)}
  });
}

const utilityBaseRenderCard=renderCard;
renderCard=function(){
  utilityBaseRenderCard();
  mountNote(current());
};

function insertEditorText(ed,text){
  const start=ed.selectionStart,end=ed.selectionEnd;
  const selected=ed.value.slice(start,end);
  let insert=text;
  if(text==='()')insert=`(${selected})`;
  else if(text==='[]')insert=`[${selected}]`;
  else if(text==='{}')insert=`{${selected}}`;
  const before=ed.value.slice(0,start),after=ed.value.slice(end);
  ed.value=before+insert+after;
  let pos=start+insert.length;
  if(!selected&&(text==='()'||text==='[]'||text==='{}'))pos=start+1;
  ed.selectionStart=ed.selectionEnd=pos;
  ed.dispatchEvent(new Event('input',{bubbles:true}));ed.focus();
}
function mountEditorUtilities(){
  const ed=$('editor'),run=$('run');
  if(!ed||!run)return;
  ed.setAttribute('aria-label',`${current()?.title||'当前题目'} Python 代码编辑器`);run.setAttribute('aria-describedby','output');
  const output=$('output');if(output){output.setAttribute('role','status');output.setAttribute('aria-live','polite')}
  const livePyStatus=$('pyStatus');if(livePyStatus)livePyStatus.setAttribute('aria-live','polite');
  const toolbar=ed.previousElementSibling?.classList.contains('editorToolbar')?ed.previousElementSibling:null;
  const status=toolbar?.querySelector('small');
  if(status&&!status.dataset.shortcut){status.dataset.shortcut='1';status.textContent+=' · Ctrl/⌘ + Enter 运行'}
  ed.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){
      e.preventDefault();run.click();
    }
  });
  if(ed.parentElement?.querySelector('.mobileCodeKeys'))return;
  const bar=document.createElement('div');bar.className='mobileCodeKeys';
  const keys=[['()'],['[]'],[':'],[','],['='],['+'],['-'],['*'],['/'],['缩进','    ']];
  bar.innerHTML=keys.map(([label,value=label])=>`<button type="button" class="codeKey" data-code-key="${esc(value)}">${esc(label)}</button>`).join('');
  ed.insertAdjacentElement('afterend',bar);
  bar.querySelectorAll('[data-code-key]').forEach(b=>b.addEventListener('click',()=>insertEditorText(ed,b.dataset.codeKey||'')));
}

const utilityBaseBindEditor=bindEditorCard;
bindEditorCard=function(p){
  utilityBaseBindEditor(p);
  mountEditorUtilities();
};

const utilityBaseShowPage=showPage;
showPage=function(name){ensureUtilityState();return utilityBaseShowPage(name)};

const style=document.createElement('style');
style.textContent=`
.utilityMenu{position:relative;display:inline-block}.utilityMenu>summary{list-style:none;cursor:pointer}.utilityMenu>summary::-webkit-details-marker{display:none}.utilityPopover{position:absolute;right:0;top:calc(100% + 8px);width:min(300px,82vw);padding:14px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 40px rgba(30,35,50,.14);z-index:40;display:grid;gap:9px}.utilityPopover>b{font-size:14px}.utilityPopover small{font-size:12px;line-height:1.5;color:var(--muted)}.utilityTip{border-top:1px solid var(--line);padding-top:8px}.personalNote{border-top:1px solid var(--line);margin:0 18px 18px}.personalNote>summary{cursor:pointer;padding:14px 0;display:flex;align-items:center;justify-content:space-between;gap:10px;list-style:none}.personalNote>summary::-webkit-details-marker{display:none}.personalNote>summary span{font-weight:700;font-size:13px}.personalNote>summary small{color:var(--muted);font-size:11px}.personalNoteBody{padding-bottom:4px}.personalNote textarea{width:100%;min-height:94px;box-sizing:border-box;resize:vertical;border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:13px;line-height:1.6;background:#fff;color:var(--text)}.noteMeta{display:flex;justify-content:space-between;gap:10px;margin-top:6px;color:var(--muted);font-size:11px}.mobileCodeKeys{display:flex;gap:6px;overflow-x:auto;padding:8px 0 1px;scrollbar-width:none}.mobileCodeKeys::-webkit-scrollbar{display:none}.codeKey{flex:0 0 auto;min-width:38px;height:34px;border:1px solid var(--line);border-radius:9px;background:#fff;font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text);padding:0 10px}.storageWarning{position:fixed;right:18px;bottom:18px;z-index:1200;max-width:min(440px,calc(100vw - 28px));display:flex;align-items:center;gap:12px;padding:13px 14px;border:1px solid #e3b6ad;border-radius:14px;background:#fff5f2;color:#7d2d20;box-shadow:0 16px 45px rgba(60,20,10,.18);opacity:0;transform:translateY(12px);pointer-events:none;transition:.18s}.storageWarning.show{opacity:1;transform:none;pointer-events:auto}.storageWarning span{display:grid;gap:2px}.storageWarning small{font-size:11px;line-height:1.45}.storageWarning button{border:1px solid currentColor;border-radius:9px;background:transparent;color:inherit;padding:7px 9px;white-space:nowrap}@media(min-width:821px){.mobileCodeKeys{display:none}}@media(max-width:620px){.topbar>div:last-child{display:flex;align-items:center;gap:5px}.utilityMenu>summary{padding-left:9px;padding-right:9px}.personalNote{margin-left:14px;margin-right:14px}.personalNote>summary{align-items:flex-start;flex-direction:column;gap:3px}.noteMeta{flex-direction:column;gap:2px}.storageWarning{right:14px;bottom:76px;left:14px}}
`;
document.head.appendChild(style);

mountDataMenu();
ensureUtilityState();mountNote(current());mountEditorUtilities();persist();
})();
