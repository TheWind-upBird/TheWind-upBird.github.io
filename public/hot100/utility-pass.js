(()=>{
function ensureUtilityState(){
  state.notes=state.notes||{};
  state.positions=state.positions||{};
  state.lastTouched=state.lastTouched||{};
  state.attempts=state.attempts||{};
}
ensureUtilityState();

// Any save, including the existing reset flow, should repair optional product fields first.
const utilityBaseSave=save;
save=function(){ensureUtilityState();return utilityBaseSave()};

const EXPORT_KEYS=['currentProblem','deckIndex','completedCards','solved','codes','reviewQueue','lastPage','positions','lastTouched','attempts','reviewing','notes'];
function safeStateSnapshot(){
  const out={};
  for(const key of EXPORT_KEYS) out[key]=state[key];
  return out;
}
function downloadBackup(){
  ensureUtilityState();
  const payload={
    app:'Hot100 Learning Lab',
    formatVersion:1,
    exportedAt:new Date().toISOString(),
    problemCount:CURRICULUM.length,
    progress:safeStateSnapshot()
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const d=new Date();
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  a.href=url;a.download=`hot100-progress-${y}${m}${day}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function normalizeImported(raw){
  const src=raw&&raw.progress&&typeof raw.progress==='object'?raw.progress:raw;
  if(!src||typeof src!=='object') throw new Error('文件里没有可识别的学习进度');
  const next={...state};
  for(const key of EXPORT_KEYS){if(key in src)next[key]=src[key]}
  next.completedCards=next.completedCards||{};
  next.solved=next.solved||{};
  next.codes=next.codes||{};
  next.reviewQueue=Array.isArray(next.reviewQueue)?next.reviewQueue:[];
  next.positions=next.positions||{};
  next.lastTouched=next.lastTouched||{};
  next.attempts=next.attempts||{};
  next.notes=next.notes||{};
  next.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,Number(next.currentProblem)||0));
  next.deckIndex=Math.max(0,Math.min(CARD_COUNT,Number(next.deckIndex)||0));
  return next;
}
function importBackup(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(String(reader.result||''));
      const next=normalizeImported(parsed);
      const solved=Object.keys(next.solved||{}).length;
      if(!confirm(`导入这份学习记录？\n\n已记录完成题目：${solved}\n导入后会替换当前设备上的 Hot100 学习进度。`))return;
      state=next;persist();location.reload();
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
  const existing=state.notes[p.slug]||'';
  details.innerHTML=`<summary><span>我的笔记</span><small>${existing.trim()?'已记录':'可记下易错点或一句话总结'}</small></summary><div class="personalNoteBody"><textarea id="personalNoteText" placeholder="例如：这题我总忘记先查再存；0/1 背包容量要倒序。">${esc(existing)}</textarea><div class="noteMeta"><span id="noteSaved">自动保存到当前浏览器</span><span>${p.title}</span></div></div>`;
  card.appendChild(details);
  const ta=$('personalNoteText'),saved=$('noteSaved');
  ta?.addEventListener('input',()=>{
    state.notes[p.slug]=ta.value;persist();
    if(saved){saved.textContent='已保存';clearTimeout(ta._saveTimer);ta._saveTimer=setTimeout(()=>saved.textContent='自动保存到当前浏览器',900)}
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
.utilityMenu{position:relative;display:inline-block}.utilityMenu>summary{list-style:none;cursor:pointer}.utilityMenu>summary::-webkit-details-marker{display:none}.utilityPopover{position:absolute;right:0;top:calc(100% + 8px);width:min(300px,82vw);padding:14px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 40px rgba(30,35,50,.14);z-index:40;display:grid;gap:9px}.utilityPopover>b{font-size:14px}.utilityPopover small{font-size:12px;line-height:1.5;color:var(--muted)}.utilityTip{border-top:1px solid var(--line);padding-top:8px}.personalNote{border-top:1px solid var(--line);margin:0 18px 18px}.personalNote>summary{cursor:pointer;padding:14px 0;display:flex;align-items:center;justify-content:space-between;gap:10px;list-style:none}.personalNote>summary::-webkit-details-marker{display:none}.personalNote>summary span{font-weight:700;font-size:13px}.personalNote>summary small{color:var(--muted);font-size:11px}.personalNoteBody{padding-bottom:4px}.personalNote textarea{width:100%;min-height:94px;box-sizing:border-box;resize:vertical;border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:13px;line-height:1.6;background:#fff;color:var(--text)}.noteMeta{display:flex;justify-content:space-between;gap:10px;margin-top:6px;color:var(--muted);font-size:11px}.mobileCodeKeys{display:flex;gap:6px;overflow-x:auto;padding:8px 0 1px;scrollbar-width:none}.mobileCodeKeys::-webkit-scrollbar{display:none}.codeKey{flex:0 0 auto;min-width:38px;height:34px;border:1px solid var(--line);border-radius:9px;background:#fff;font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text);padding:0 10px}@media(min-width:821px){.mobileCodeKeys{display:none}}@media(max-width:620px){.topbar>div:last-child{display:flex;align-items:center;gap:5px}.utilityMenu>summary{padding-left:9px;padding-right:9px}.personalNote{margin-left:14px;margin-right:14px}.personalNote>summary{align-items:flex-start;flex-direction:column;gap:3px}.noteMeta{flex-direction:column;gap:2px}}
`;
document.head.appendChild(style);

mountDataMenu();
ensureUtilityState();persist();
})();