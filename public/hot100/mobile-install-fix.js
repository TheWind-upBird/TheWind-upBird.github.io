(()=>{
let installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function uaInfo(){const ua=navigator.userAgent.toLowerCase();return{isEdgeAndroid:(ua.includes('edga')||ua.includes('edgios'))&&ua.includes('android'),isAndroid:ua.includes('android'),isIOS:/iphone|ipad|ipod/.test(ua)}}
function showHelp(mode='generic'){
  document.getElementById('installHelpSheet')?.remove();
  const box=document.createElement('div');box.id='installHelpSheet';box.className='installHelpSheet';
  let body='';
  if(mode==='edge')body=`<p><b>Edge Android 通常不会把 PWA 安装成真正的 WebAPK。</b>它多数情况下只能创建桌面快捷方式；部分手机上这一步还会被系统启动器拦截，于是会出现“正在安装”后什么都没有。</p><div class="installSteps"><span><b>想继续用 Edge：</b>点右下角 ≡ → 找“添加到手机 / 添加到主屏幕”。</span><span><b>想安装成真正的独立 App：</b>建议用 Chrome 打开本站，再点“安装应用”。</span></div><p class="muted">Chrome 安装成功后通常会出现在桌面、应用列表和“设置 → 应用”里；Edge 创建的快捷方式通常只在桌面。</p>`;
  else if(mode==='ios')body=`<p>iPhone / iPad 请用 Safari 打开本站，然后点“分享” → “添加到主屏幕”。</p>`;
  else body=`<p>如果浏览器没有直接弹出安装框，请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。</p>`;
  box.innerHTML=`<div class="installHelpCard"><div class="installHelpHead"><b>安装 Hot100 Lab</b><button class="round" id="closeInstallHelp">×</button></div>${body}<button class="primary" id="closeInstallHelp2">知道了</button></div>`;
  document.body.appendChild(box);
  const close=()=>box.remove();document.getElementById('closeInstallHelp')?.addEventListener('click',close);document.getElementById('closeInstallHelp2')?.addEventListener('click',close);box.addEventListener('click',e=>{if(e.target===box)close()});
}
async function install(){
  if(isStandalone())return;
  const info=uaInfo();
  // Edge Android's native install prompt often degrades to a launcher shortcut and may silently fail on some OEM launchers.
  // Avoid presenting it as a guaranteed app install; show the reliable paths instead.
  if(info.isEdgeAndroid){showHelp('edge');return}
  if(info.isIOS){showHelp('ios');return}
  if(installPrompt){installPrompt.prompt();try{await installPrompt.userChoice}catch(e){}installPrompt=null;return}
  showHelp('generic');
}
function mount(){
  if(isStandalone())return;
  const actions=document.querySelector('.topbar>div:last-child');if(!actions||document.getElementById('mobileInstallBtn'))return;
  const btn=document.createElement('button');btn.id='mobileInstallBtn';btn.className='ghost';btn.textContent='安装';btn.addEventListener('click',install);
  const reset=document.getElementById('resetBtn');actions.insertBefore(btn,reset||null);
  const style=document.createElement('style');style.textContent=`#mobileInstallBtn{display:none}.installHelpSheet{position:fixed;inset:0;background:rgba(20,24,35,.38);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:16px}.installHelpCard{width:min(460px,100%);background:#fff;border-radius:20px;padding:18px;border:1px solid var(--line);box-shadow:0 24px 70px rgba(20,24,35,.25)}.installHelpHead{display:flex;justify-content:space-between;align-items:center;gap:12px}.installHelpCard p{font-size:13px;line-height:1.65}.installSteps{display:grid;gap:7px;margin:12px 0}.installSteps span{border:1px solid var(--line);border-radius:11px;padding:10px 11px;font-size:13px;line-height:1.55}.installHelpCard>.primary{width:100%;margin-top:5px}@media(max-width:820px){#mobileInstallBtn{display:inline-flex;align-items:center;justify-content:center}.topbar .utilityMenu{display:none}.topbar>div:last-child{display:flex;align-items:center;gap:6px}}`;
  document.head.appendChild(style);
}
window.addEventListener('appinstalled',()=>document.getElementById('mobileInstallBtn')?.remove());
mount();
})();