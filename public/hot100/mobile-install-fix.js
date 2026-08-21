(()=>{
let installPrompt=null,installedFired=false;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function uaInfo(){const ua=navigator.userAgent.toLowerCase();return{isEdgeAndroid:(ua.includes('edga')||ua.includes('edgios'))&&ua.includes('android'),isAndroid:ua.includes('android'),isIOS:/iphone|ipad|ipod/.test(ua),isHuawei:/huawei|honor|emui|harmony/.test(ua)}}
function showHelp(mode='generic'){
  document.getElementById('installHelpSheet')?.remove();
  const box=document.createElement('div');box.id='installHelpSheet';box.className='installHelpSheet';
  let body='';
  if(mode==='edge')body=`<p>Edge Android 在部分手机上会把“安装”退化成桌面快捷方式；如果系统禁止浏览器创建桌面快捷方式，就会出现“正在安装”后什么都没有。</p><div class="installSteps"><span><b>Edge：</b>右下角 ≡ → “添加到手机 / 添加到主屏幕”。</span><span><b>如果点完仍没图标：</b>到系统设置里允许 Edge“创建桌面快捷方式”，并确认桌面没有开启“锁定布局”。</span><span><b>也可以用 Chrome：</b>但 Chrome 同样需要这项系统权限。</span></div>`;
  else if(mode==='ios')body=`<p>iPhone / iPad 请用 Safari 打开本站，然后点“分享” → “添加到主屏幕”。</p>`;
  else if(mode==='blocked')body=`<p><b>浏览器已经接受了安装请求，但系统没有创建图标。</b>这通常不是网页问题，而是手机启动器/权限拦截。</p><div class="installSteps"><span>设置 → 应用 → Chrome（或 Edge）→ 权限 / 其他权限 → 开启<b>“创建桌面快捷方式”</b>。</span><span>桌面双指捏合 → 桌面设置 → 关闭<b>“锁定布局”</b>。</span><span>然后彻底关闭浏览器，再重新打开 Hot100 重试。</span></div>`;
  else body=`<p>如果浏览器没有直接弹出安装框，请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。</p><p class="muted">如果点击 Add/安装 后没有任何图标，请检查浏览器的“创建桌面快捷方式”权限，以及桌面是否锁定布局。</p>`;
  box.innerHTML=`<div class="installHelpCard"><div class="installHelpHead"><b>添加 Hot100 到桌面</b><button class="round" id="closeInstallHelp">×</button></div>${body}<button class="primary" id="closeInstallHelp2">知道了</button></div>`;
  document.body.appendChild(box);
  const close=()=>box.remove();document.getElementById('closeInstallHelp')?.addEventListener('click',close);document.getElementById('closeInstallHelp2')?.addEventListener('click',close);box.addEventListener('click',e=>{if(e.target===box)close()});
}
async function install(){
  if(isStandalone())return;
  const info=uaInfo();
  if(info.isEdgeAndroid){showHelp('edge');return}
  if(info.isIOS){showHelp('ios');return}
  if(installPrompt){
    installedFired=false;
    installPrompt.prompt();
    let result=null;try{result=await installPrompt.userChoice}catch(e){}
    installPrompt=null;
    if(result?.outcome==='accepted')setTimeout(()=>{if(!installedFired&&!isStandalone())showHelp('blocked')},12000);
    return
  }
  showHelp('generic');
}
function mount(){
  if(isStandalone())return;
  const actions=document.querySelector('.topbar>div:last-child');if(!actions||document.getElementById('mobileInstallBtn'))return;
  const btn=document.createElement('button');btn.id='mobileInstallBtn';btn.className='ghost';btn.type='button';btn.innerHTML='<span aria-hidden="true">⇩</span>';btn.title='添加到桌面';btn.setAttribute('aria-label','添加 Hot100 到桌面');btn.addEventListener('click',install);
  const reset=document.getElementById('resetBtn');actions.insertBefore(btn,reset||null);
  const style=document.createElement('style');style.textContent=`#mobileInstallBtn{display:none}.installHelpSheet{position:fixed;inset:0;background:rgba(20,24,35,.38);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:16px}.installHelpCard{width:min(460px,100%);background:#fff;border-radius:20px;padding:18px;border:1px solid var(--line);box-shadow:0 24px 70px rgba(20,24,35,.25)}.installHelpHead{display:flex;justify-content:space-between;align-items:center;gap:12px}.installHelpCard p{font-size:13px;line-height:1.65}.installSteps{display:grid;gap:7px;margin:12px 0}.installSteps span{border:1px solid var(--line);border-radius:11px;padding:10px 11px;font-size:13px;line-height:1.55}.installHelpCard>.primary{width:100%;margin-top:5px}@media(max-width:820px){#mobileInstallBtn{display:inline-grid;place-items:center;width:42px;height:42px;min-width:42px;padding:0;border-radius:12px;font-size:20px;line-height:1}.topbar .utilityMenu{display:none}.topbar>div:last-child{display:flex;align-items:center;gap:6px;flex:0 0 auto}.topbar>div:first-child{min-width:0;white-space:nowrap}.topbar>div:first-child>b{font-size:14px}.topbar .tag{font-size:11px;padding:3px 6px}}`;
  document.head.appendChild(style);
}
window.addEventListener('appinstalled',()=>{installedFired=true;document.getElementById('mobileInstallBtn')?.remove()});
mount();
})();
