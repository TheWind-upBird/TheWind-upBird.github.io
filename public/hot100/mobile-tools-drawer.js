(()=>{
function trigger(id){const el=document.getElementById(id);if(!el)return false;el.click();return true}
function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function progressSummary(){
  const solved=Object.keys(state.solved||{}).filter(slug=>CURRICULUM.some(p=>p.slug===slug)).length;
  const now=new Date(),y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0'),d=String(now.getDate()).padStart(2,'0'),today=`${y}-${m}-${d}`;
  const due=(state.reviewQueue||[]).filter(r=>r.due<=today).length;
  return {solved,due};
}
let previousFocus=null;
function closeDrawer(restoreFocus=true){
  const drawer=document.getElementById('mobileToolsDrawer'),menuBtn=document.getElementById('mobileToolsBtn');
  if(!drawer)return;
  const wasOpen=drawer.classList.contains('open');
  drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');drawer.setAttribute('inert','');
  menuBtn?.setAttribute('aria-expanded','false');document.body.classList.remove('toolsOpen');
  if(wasOpen&&restoreFocus)requestAnimationFrame(()=>previousFocus?.focus?.());
}
function openDrawer(){
  const drawer=document.getElementById('mobileToolsDrawer');if(!drawer)return;
  const s=progressSummary();
  const solved=document.getElementById('mobileToolSolved'),due=document.getElementById('mobileToolDue');
  if(solved)solved.textContent=`${s.solved} / ${CURRICULUM.length}`;
  if(due)due.textContent=String(s.due);
  const appGroup=document.getElementById('mobileInstall')?.closest('.mobileToolsGroup');if(appGroup)appGroup.hidden=isStandalone();
  previousFocus=document.activeElement;drawer.removeAttribute('inert');drawer.setAttribute('aria-hidden','false');
  drawer.classList.add('open');document.getElementById('mobileToolsBtn')?.setAttribute('aria-expanded','true');document.body.classList.add('toolsOpen');
  requestAnimationFrame(()=>drawer.querySelector('button[data-tools-close]')?.focus());
}
function moveSnapshotSection(){
  const slot=document.getElementById('mobileSnapshotSlot'),section=document.getElementById('snapshotSection');
  if(!slot||!section||slot.contains(section))return;slot.appendChild(section);
}
function mount(){
  if(document.getElementById('mobileToolsDrawer'))return;
  const actions=document.querySelector('.topbar>div:last-child');if(!actions)return;
  let menuBtn=document.getElementById('mobileToolsBtn');
  if(!menuBtn){
    menuBtn=document.createElement('button');menuBtn.id='mobileToolsBtn';menuBtn.className='ghost mobileToolsBtn';menuBtn.type='button';
    menuBtn.innerHTML='<span></span><span></span><span></span>';actions.appendChild(menuBtn);
  }
  menuBtn.setAttribute('aria-label','打开工具菜单');menuBtn.setAttribute('aria-controls','mobileToolsDrawer');menuBtn.setAttribute('aria-expanded','false');menuBtn.title='工具与设置';

  const drawer=document.createElement('div');drawer.id='mobileToolsDrawer';drawer.className='mobileToolsDrawer';drawer.setAttribute('aria-hidden','true');drawer.setAttribute('inert','');
  drawer.innerHTML=`<div class="mobileToolsScrim" data-tools-close></div><aside class="mobileToolsPanel" role="dialog" aria-modal="true" aria-labelledby="mobileToolsTitle" tabindex="-1">
    <div class="mobileToolsHead"><div><small>SOLVESHIFT</small><h2 id="mobileToolsTitle">工具与设置</h2></div><button class="round" type="button" data-tools-close aria-label="关闭">×</button></div>
    <div class="mobileToolsStats"><div><small>已完成</small><b id="mobileToolSolved">0 / 100</b></div><div><small>待复习</small><b id="mobileToolDue">0</b></div></div>
    <section class="mobileToolsGroup"><div class="mobileToolsLabel">学习数据</div>
      <button class="mobileToolRow" id="mobileExport" type="button"><span class="toolIcon">⇩</span><span><b>导出学习数据</b><small>备份进度、代码、笔记和复习记录</small></span><em>›</em></button>
      <button class="mobileToolRow" id="mobileImport" type="button"><span class="toolIcon">⇧</span><span><b>导入学习数据</b><small>从 JSON 备份恢复到当前设备</small></span><em>›</em></button>
    </section>
    <section class="mobileToolsGroup"><div class="mobileToolsLabel">进度保护</div><div id="mobileSnapshotSlot"></div></section>
    <section class="mobileToolsGroup"><div class="mobileToolsLabel">应用</div><button class="mobileToolRow" id="mobileInstall" type="button"><span class="toolIcon">＋</span><span><b>添加到主屏幕</b><small>安装 SolveShift，像 App 一样打开</small></span><em>›</em></button></section>
    <section class="mobileToolsGroup dangerGroup"><button class="mobileToolRow danger" id="mobileReset" type="button"><span class="toolIcon">↻</span><span><b>重置全部进度</b><small>操作前会自动创建进度快照</small></span><em>›</em></button></section>
  </aside>`;
  document.body.appendChild(drawer);

  if(!menuBtn.dataset.toolsBound){menuBtn.dataset.toolsBound='1';menuBtn.addEventListener('click',()=>{moveSnapshotSection();openDrawer()})}
  drawer.querySelectorAll('[data-tools-close]').forEach(x=>x.addEventListener('click',()=>closeDrawer()));
  document.getElementById('mobileExport')?.addEventListener('click',()=>{closeDrawer(false);trigger('exportProgress')});
  document.getElementById('mobileImport')?.addEventListener('click',()=>{closeDrawer(false);trigger('importProgress')});
  document.getElementById('mobileInstall')?.addEventListener('click',()=>{closeDrawer(false);if(window.HOT100_INSTALL?.open)window.HOT100_INSTALL.open();else trigger('mobileInstallBtn')});
  document.getElementById('mobileReset')?.addEventListener('click',()=>{closeDrawer(false);trigger('resetBtn')});
  document.addEventListener('keydown',e=>{
    if(!drawer.classList.contains('open'))return;
    if(e.key==='Escape'){e.preventDefault();closeDrawer();return}
    if(e.key!=='Tab')return;
    const focusable=[...drawer.querySelectorAll('button:not([disabled]):not([hidden]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.closest('[hidden]'));
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });

  const style=document.createElement('style');style.id='hot100ToolsStyles';style.textContent=`
  .topbar .utilityMenu,.topbar #resetBtn,.topbar #mobileInstallBtn{display:none!important}
  .mobileToolsBtn{display:inline-flex!important;width:42px;height:42px;min-width:42px;padding:0;border-radius:12px;align-items:center;justify-content:center;flex-direction:column;gap:4px}
  .mobileToolsBtn span{display:block;width:17px;height:2px;border-radius:99px;background:currentColor;transition:transform .18s ease,opacity .18s ease}
  body.toolsOpen .mobileToolsBtn span:nth-child(1){transform:translateY(6px) rotate(45deg)}body.toolsOpen .mobileToolsBtn span:nth-child(2){opacity:0}body.toolsOpen .mobileToolsBtn span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
  .mobileToolsDrawer{display:block;position:fixed;inset:0;z-index:300;pointer-events:none}.mobileToolsScrim{position:absolute;inset:0;background:rgba(15,18,28,.36);opacity:0;transition:opacity .2s ease}
  .mobileToolsPanel{position:absolute;right:0;top:0;bottom:0;width:min(390px,92vw);background:var(--bg,#f7f8fb);border-left:1px solid var(--line);transform:translateX(102%);transition:transform .24s ease;overflow-y:auto;padding:22px 16px 28px;box-shadow:-16px 0 50px rgba(25,29,45,.16)}
  .mobileToolsDrawer.open{pointer-events:auto}.mobileToolsDrawer.open .mobileToolsScrim{opacity:1}.mobileToolsDrawer.open .mobileToolsPanel{transform:translateX(0)}body.toolsOpen{overflow:hidden}
  .mobileToolsHead{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 14px}.mobileToolsHead small{font-size:10px;letter-spacing:.1em;color:var(--muted)}.mobileToolsHead h2{font-size:24px;margin:1px 0 0}.mobileToolsStats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px}.mobileToolsStats>div{background:var(--panel,#fff);border:1px solid var(--line);border-radius:14px;padding:12px 13px}.mobileToolsStats small{display:block;color:var(--muted);font-size:11px}.mobileToolsStats b{font-size:18px}
  .mobileToolsGroup{background:var(--panel,#fff);border:1px solid var(--line);border-radius:16px;padding:5px 11px;margin-bottom:11px}.mobileToolsLabel{font-size:10px;color:var(--muted);letter-spacing:.06em;padding:8px 4px 5px}.mobileToolRow{width:100%;display:grid;grid-template-columns:35px 1fr 14px;gap:9px;align-items:center;border:0;border-top:1px solid var(--line);background:transparent;padding:12px 3px;text-align:left;color:var(--text)}.mobileToolsLabel+.mobileToolRow{border-top:0}.mobileToolRow .toolIcon{width:31px;height:31px;border-radius:10px;background:var(--accent2);color:var(--accent);display:grid;place-items:center;font-size:17px;font-weight:700}.mobileToolRow>span:nth-child(2){display:grid;gap:2px}.mobileToolRow b{font-size:13px}.mobileToolRow small{color:var(--muted);font-size:10px;line-height:1.4}.mobileToolRow em{font-style:normal;color:#a0a5b0;font-size:20px}.mobileToolRow.danger{color:var(--bad)}.mobileToolRow.danger .toolIcon{background:var(--badbg);color:var(--bad)}.dangerGroup{margin-top:18px}
  #mobileSnapshotSlot .snapshotSection{border:0;margin:0;padding:0 3px 6px}#mobileSnapshotSlot .snapshotHead{padding:4px 0 7px}#mobileSnapshotSlot .snapshotHead>span b{font-size:13px}#mobileSnapshotSlot .snapshotHead>span small{font-size:10px;color:var(--muted)}#mobileSnapshotSlot .snapshotHead .secondary{padding:7px 9px;font-size:11px;border-radius:9px}#mobileSnapshotSlot .snapshotItem{box-shadow:none}#mobileSnapshotSlot .snapshotList{max-height:220px;overflow:auto}
  @media(max-width:820px){.topbar{padding:0 14px}.topbar>div:first-child{min-width:0;display:flex;align-items:center}.topbar>div:first-child>b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.topbar .tag{display:none}.topbar>div:last-child{display:flex;align-items:center;gap:6px;flex:0 0 auto}.mobileToolsPanel{width:min(88vw,390px);padding:calc(18px + env(safe-area-inset-top)) 14px calc(24px + env(safe-area-inset-bottom))}}
  `;document.head.appendChild(style);
  window.dispatchEvent(new CustomEvent('hot100toolsready'));
}
mount();window.HOT100_MOBILE_TOOLS={open:openDrawer,close:closeDrawer};
})();
