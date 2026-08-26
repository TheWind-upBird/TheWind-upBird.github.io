(()=>{
const KEY='solveshift-data-protection-v1';
function readMeta(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'?value:{}}catch(e){return{}}}
function progressSignature(){
  const solved=Object.keys(state.solved||{}).length;
  const cards=Object.values(state.completedCards||{}).reduce((sum,list)=>sum+(Array.isArray(list)?list.length:0),0);
  const codeChars=Object.values(state.codes||{}).reduce((sum,code)=>sum+(typeof code==='string'?code.length:0),0);
  const notes=Object.values(state.notes||{}).reduce((sum,note)=>sum+(typeof note==='string'?note.length:0),0);
  return`${solved}:${cards}:${codeChars}:${notes}:${(state.reviewQueue||[]).length}`;
}
function formatTime(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))return'';return new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(date)}
function status(){
  const meta=readMeta(),signature=progressSignature(),started=signature!=='0:0:0:0:0';
  if(!started)return{tone:'quiet',title:'还没有需要备份的进度',detail:'开始学习后，可随时导出到本地文件。',action:false};
  if(!meta.lastExportAt&&!meta.lastImportAt)return{tone:'warn',title:'尚未做外部备份',detail:'当前记录只在这个浏览器里，清理数据可能丢失。',action:true};
  if(meta.signature!==signature)return{tone:'warn',title:'上次备份后有新进度',detail:`最近外部备份：${formatTime(meta.lastExportAt||meta.lastImportAt)}`,action:true};
  const restored=meta.lastImportAt&&(!meta.lastExportAt||meta.lastImportAt>=meta.lastExportAt);
  return{tone:'safe',title:restored?'已从备份恢复':'外部备份是最新的',detail:`记录时间：${formatTime(restored?meta.lastImportAt:meta.lastExportAt)}`,action:false};
}
function render(){
  const copy=status();document.querySelectorAll('[data-data-protection]').forEach(box=>{box.dataset.tone=copy.tone;box.innerHTML=`<span class="dataProtectionDot"></span><span><b>${copy.title}</b><small>${copy.detail}</small></span>${copy.action?'<button type="button" data-backup-now>立即备份</button>':''}`;box.querySelector('[data-backup-now]')?.addEventListener('click',()=>document.getElementById('exportProgress')?.click())})
}
function mount(){
  const pop=document.querySelector('#hot100DataMenu .utilityPopover');if(pop&&!pop.querySelector('[data-data-protection]')){const box=document.createElement('div');box.className='dataProtectionStatus';box.dataset.dataProtection='desktop';pop.querySelector('.utilityTip')?.insertAdjacentElement('beforebegin',box)}
  const group=document.getElementById('mobileExport')?.closest('.mobileToolsGroup');if(group&&!group.querySelector('[data-data-protection]')){const box=document.createElement('div');box.className='dataProtectionStatus mobileDataProtection';box.dataset.dataProtection='mobile';group.appendChild(box)}
  const tools=document.getElementById('mobileToolsBtn');if(tools&&!tools.dataset.dataProtectionBound){tools.dataset.dataProtectionBound='1';tools.addEventListener('click',()=>setTimeout(render,0))}
  const dataSummary=document.querySelector('#hot100DataMenu>summary');if(dataSummary&&!dataSummary.dataset.dataProtectionBound){dataSummary.dataset.dataProtectionBound='1';dataSummary.addEventListener('click',()=>setTimeout(render,0))}
  render();
}
window.addEventListener('solveshiftbackup',event=>{try{const previous=readMeta(),type=event.detail?.type,at=event.detail?.at||new Date().toISOString();const next={...previous,signature:progressSignature()};if(type==='import')next.lastImportAt=at;else next.lastExportAt=at;localStorage.setItem(KEY,JSON.stringify(next))}catch(e){}mount();render()});
window.addEventListener('hot100toolsready',mount);
const style=document.createElement('style');style.textContent=`.dataProtectionStatus{display:grid;grid-template-columns:10px minmax(0,1fr) auto;align-items:center;gap:8px;padding:9px 1px;border-top:1px solid var(--line)}.dataProtectionStatus>span:nth-child(2){display:grid;gap:2px}.dataProtectionStatus b{font-size:11px}.dataProtectionStatus small{font-size:9px!important;line-height:1.4;color:var(--muted)}.dataProtectionDot{width:8px;height:8px;border-radius:50%;background:#aeb3bd}.dataProtectionStatus[data-tone="warn"] .dataProtectionDot{background:#b47a17;box-shadow:0 0 0 3px #fff2d8}.dataProtectionStatus[data-tone="safe"] .dataProtectionDot{background:var(--good);box-shadow:0 0 0 3px var(--goodbg)}.dataProtectionStatus button{border:1px solid var(--line);border-radius:8px;background:transparent;color:var(--accent);padding:6px 7px;font-size:9px}.mobileDataProtection{margin:2px 3px 5px;padding-top:10px}`;document.head.appendChild(style);mount();window.HOT100_DATA_PROTECTION={status,refresh:render,key:KEY};
})();
