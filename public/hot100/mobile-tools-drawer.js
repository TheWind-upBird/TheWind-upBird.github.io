(()=>{
function isMobile(){return window.matchMedia('(max-width:820px)').matches}
function trigger(id){const el=document.getElementById(id);if(el)el.click()}
function progressSummary(){
  const solved=Object.keys(state.solved||{}).filter(slug=>CURRICULUM.some(p=>p.slug===slug)).length;
  const due=(state.reviewQueue||[]).filter(r=>r.due<=new Date().toLocaleDateString('en-CA')).length;
  return {solved,due};
}
function closeDrawer(){document.getElementById('mobileToolsDrawer')?.classList.remove('open');document.body.classList.remove('toolsOpen')}
function openDrawer(){
  const drawer=document.getElementById('mobileToolsDrawer');if(!drawer)return;
  const s=progressSummary();
  const solved=document.getElementById('mobileToolSolved'),due=document.getElementById('mobileToolDue');
  if(solved)solved.textContent=`${s.solved} / ${CURRICULUM.length}`;
  if(due)due.textContent=String(s.due);
  drawer.classList.add('open');document.body.classList.add('toolsOpen');
}
function moveSnapshotSection(){
  const slot=document.getElementById('mobileSnapshotSlot'),section=document.getElementById('snapshotSection');
  if(!slot||!section||slot.contains(section))return;
  slot.appendChild(section);
}
function mount(){
  if(document.getElementById('mobileToolsDrawer'))return;
  const actions=document.querySelector('.topbar>div:last-child');if(!actions)return;

  const menuBtn=document.createElement('button');
  menuBtn.id='mobileToolsBtn';menuBtn.className='ghost mobileToolsBtn';menuBtn.type='button';menuBtn.setAttribute('aria-label','打开工具菜单');
  menuBtn.innerHTML='<span></span><span></span><span></span>';
  actions.appendChild(menuBtn);

  const drawer=document.createElement('div');drawer.id='mobileToolsDrawer';drawer.className='mobileToolsDrawer';
  drawer.innerHTML=`
    <div class="mobileToolsScrim" data-tools-close></div>
    <aside class="mobileToolsPanel" aria-label="Hot100 工具">
      <div class="mobileToolsHead">
        <div><small>HOT100 LAB</small><h2>工具</h2></div>
        <button class="round" type="button" data-tools-close aria-label="关闭">×</button>
      </div>
      <div class="mobileToolsStats">
        <div><small>已完成</small><b id="mobileToolSolved">0 / 100</b></div>
        <div><small>待复习</small><b id="mobileToolDue">0</b></div>
      </div>
      <section class="mobileToolsGroup">
        <div class="mobileToolsLabel">学习数据</div>
        <button class="mobileToolRow" id="mobileExport" type="button"><span class="toolIcon">⇩</span><span><b>导出学习数据</b><small>备份进度、代码、笔记和复习记录</small></span><em>›</em></button>
        <button class="mobileToolRow" id="mobileImport" type="button"><span class="toolIcon">⇧</span><span><b>导入学习数据</b><small>从 JSON 备份恢复到当前设备</small></span><em>›</em></button>
      </section>
      <section class="mobileToolsGroup">
        <div class="mobileToolsLabel">进度保护</div>
        <div id="mobileSnapshotSlot"></div>
      </section>
      <section class="mobileToolsGroup">
        <div class="mobileToolsLabel">应用</div>
        <button class="mobileToolRow" id="mobileInstall" type="button"><span class="toolIcon">＋</span><span><b>添加到主屏幕</b><small>安装 Hot100 Lab，像 App 一样打开</small></span><em>›</em></button>
      </section>
      <section class="mobileToolsGroup dangerGroup">
        <button class="mobileToolRow danger" id="mobileReset" type="button"><span class="toolIcon">↻</span><span><b>重置全部进度</b><small>操作前会自动创建进度快照</small></span><em>›</em></button>
      </section>
    </aside>`;
  document.body.appendChild(drawer);

  menuBtn.addEventListener('click',()=>{moveSnapshotSection();openDrawer()});
  drawer.querySelectorAll('[data-tools-close]').forEach(x=>x.addEventListener('click',closeDrawer));
  document.getElementById('mobileExport')?.addEventListener('click',()=>{closeDrawer();trigger('exportProgress')});
  document.getElementById('mobileImport')?.addEventListener('click',()=>{closeDrawer();trigger('importProgress')});
  document.getElementById('mobileInstall')?.addEventListener('click',()=>{closeDrawer();trigger('mobileInstallBtn')||trigger('installHot100')});
  document.getElementById('mobileReset')?.addEventListener('click',()=>{closeDrawer();trigger('resetBtn')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  window.addEventListener('resize',()=>{if(!isMobile())closeDrawer()});

  const style=document.createElement('style');style.textContent=`
  .mobileToolsBtn,.mobileToolsDrawer{display:none}
  @media(max-width:820px){
    .topbar{padding:0 14px}.topbar>div:first-child{min-width:0;display:flex;align-items:center}.topbar>div:first-child>b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.topbar .tag{display:none}
    .topbar #resetBtn,.topbar #mobileInstallBtn{display:none!important}
    .mobileToolsBtn{display:inline-flex!important;width:42px;height:42px;padding:0;border-radius:12px;align-items:center;justify-content:center;flex-direction:column;gap:4px}
    .mobileToolsBtn span{display:block;width:17px;height:2px;border-radius:99px;background:currentColor}
    .mobileToolsDrawer{display:block;position:fixed;inset:0;z-index:300;pointer-events:none}
    .mobileToolsScrim{position:absolute;inset:0;background:rgba(15,18,28,.36);opacity:0;transition:opacity .2s ease}
    .mobileToolsPanel{position:absolute;right:0;top:0;bottom:0;width:min(88vw,390px);background:#f7f8fb;border-left:1px solid var(--line);transform:translateX(102%);transition:transform .24s ease;overflow-y:auto;padding:calc(18px + env(safe-area-inset-top)) 14px calc(24px + env(safe-area-inset-bottom));box-shadow:-16px 0 50px rgba(25,29,45,.16)}
    .mobileToolsDrawer.open{pointer-events:auto}.mobileToolsDrawer.open .mobileToolsScrim{opacity:1}.mobileToolsDrawer.open .mobileToolsPanel{transform:translateX(0)}body.toolsOpen{overflow:hidden}
    .mobileToolsHead{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 14px}.mobileToolsHead small{font-size:10px;letter-spacing:.1em;color:var(--muted)}.mobileToolsHead h2{font-size:24px;margin:1px 0 0}.mobileToolsStats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px}.mobileToolsStats>div{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 13px}.mobileToolsStats small{display:block;color:var(--muted);font-size:11px}.mobileToolsStats b{font-size:18px}
    .mobileToolsGroup{background:#fff;border:1px solid var(--line);border-radius:16px;padding:5px 11px;margin-bottom:11px}.mobileToolsLabel{font-size:10px;color:var(--muted);letter-spacing:.06em;padding:8px 4px 5px}.mobileToolRow{width:100%;display:grid;grid-template-columns:35px 1fr 14px;gap:9px;align-items:center;border:0;border-top:1px solid var(--line);background:transparent;padding:12px 3px;text-align:left;color:var(--text)}.mobileToolsLabel+.mobileToolRow{border-top:0}.mobileToolRow .toolIcon{width:31px;height:31px;border-radius:10px;background:var(--accent2);color:var(--accent);display:grid;place-items:center;font-size:17px;font-weight:700}.mobileToolRow>span:nth-child(2){display:grid;gap:2px}.mobileToolRow b{font-size:13px}.mobileToolRow small{color:var(--muted);font-size:10px;line-height:1.4}.mobileToolRow em{font-style:normal;color:#a0a5b0;font-size:20px}.mobileToolRow.danger{color:var(--bad)}.mobileToolRow.danger .toolIcon{background:var(--badbg);color:var(--bad)}.dangerGroup{margin-top:18px}
    #mobileSnapshotSlot .snapshotSection{border:0;margin:0;padding:0 3px 6px}#mobileSnapshotSlot .snapshotHead{padding:4px 0 7px}#mobileSnapshotSlot .snapshotHead>span b{font-size:13px}#mobileSnapshotSlot .snapshotHead>span small{font-size:10px;color:var(--muted)}#mobileSnapshotSlot .snapshotHead .secondary{padding:7px 9px;font-size:11px;border-radius:9px}#mobileSnapshotSlot .snapshotItem{box-shadow:none}#mobileSnapshotSlot .snapshotList{max-height:220px;overflow:auto}
  }
  `;document.head.appendChild(style);
}
mount();
})();