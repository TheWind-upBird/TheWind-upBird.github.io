(()=>{
let installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function showHelp(){
  const old=document.getElementById('installHelpSheet');old?.remove();
  const box=document.createElement('div');box.id='installHelpSheet';box.className='installHelpSheet';
  const ua=navigator.userAgent.toLowerCase(),isEdge=ua.includes('edga')||ua.includes('edgios'),isAndroid=ua.includes('android');
  box.innerHTML=`<div class="installHelpCard"><div class="installHelpHead"><b>安装 Hot100 Lab</b><button class="round" id="closeInstallHelp">×</button></div>${isEdge&&isAndroid?`<p>你现在用的是 Edge Android。点浏览器右下角的 <b>≡</b> 菜单，找下面任一项：</p><div class="installSteps"><span>添加到手机</span><span>添加到主屏幕</span><span>安装应用</span></div><p class="muted">不同 Edge 版本名字会有差异。安装后会在桌面出现 Hot100 Lab 图标。</p>`:`<p>如果浏览器没有直接弹出安装框，请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。</p>`}<button class="primary" id="closeInstallHelp2">知道了</button></div>`;
  document.body.appendChild(box);
  const close=()=>box.remove();document.getElementById('closeInstallHelp')?.addEventListener('click',close);document.getElementById('closeInstallHelp2')?.addEventListener('click',close);box.addEventListener('click',e=>{if(e.target===box)close()});
}
async function install(){
  if(isStandalone())return;
  if(installPrompt){
    installPrompt.prompt();
    try{await installPrompt.userChoice}catch(e){}
    installPrompt=null;return;
  }
  showHelp();
}
function mount(){
  if(isStandalone())return;
  const actions=document.querySelector('.topbar>div:last-child');if(!actions||document.getElementById('mobileInstallBtn'))return;
  const btn=document.createElement('button');btn.id='mobileInstallBtn';btn.className='ghost';btn.textContent='安装';btn.addEventListener('click',install);
  const reset=document.getElementById('resetBtn');actions.insertBefore(btn,reset||null);
  const style=document.createElement('style');style.textContent=`#mobileInstallBtn{display:none}.installHelpSheet{position:fixed;inset:0;background:rgba(20,24,35,.38);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:16px}.installHelpCard{width:min(460px,100%);background:#fff;border-radius:20px;padding:18px;border:1px solid var(--line);box-shadow:0 24px 70px rgba(20,24,35,.25)}.installHelpHead{display:flex;justify-content:space-between;align-items:center;gap:12px}.installHelpCard p{font-size:13px;line-height:1.65}.installSteps{display:grid;gap:7px;margin:12px 0}.installSteps span{border:1px solid var(--line);border-radius:11px;padding:9px 11px;font-size:13px}.installHelpCard>.primary{width:100%;margin-top:5px}@media(max-width:820px){#mobileInstallBtn{display:inline-flex;align-items:center;justify-content:center}.topbar .utilityMenu{display:none}.topbar>div:last-child{display:flex;align-items:center;gap:6px}}`;
  document.head.appendChild(style);
}
window.addEventListener('appinstalled',()=>document.getElementById('mobileInstallBtn')?.remove());
mount();
})();