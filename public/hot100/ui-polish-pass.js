(()=>{
function activeProblem(){
  try{return typeof current==='function'?current():CURRICULUM?.[state?.currentProblem||0]||null}catch(e){return null}
}
function removeWa2TitleAfterRule(){
  const source=document.getElementById('wa2DesignStyles');
  if(source){
    const rule="html[data-theme=\"wa2\"] #page-home>.title:after{content:'WHITE ALBUM 2 · HOT100';display:block;margin-top:10px;font-size:9px;letter-spacing:.22em;font-weight:650;color:#86a1b8}\n";
    if(source.textContent.includes(rule))source.textContent=source.textContent.replace(rule,'');
  }
}
let hideTimer=0,removeTimer=0;
function showMasteryToast(){
  clearTimeout(hideTimer);clearTimeout(removeTimer);
  document.getElementById('hot100MasteryToast')?.remove();
  const toast=document.createElement('div');
  toast.id='hot100MasteryToast';toast.className='masteryToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
  toast.innerHTML='<small>已掌握</small><b>你为什么这么熟练啊</b>';
  document.body.appendChild(toast);
  requestAnimationFrame(()=>requestAnimationFrame(()=>toast.classList.add('show')));
  hideTimer=setTimeout(()=>{
    toast.classList.remove('show');
    removeTimer=setTimeout(()=>toast.remove(),320);
  },2400);
}
function bindMasteryButtons(root=document){
  root.querySelectorAll?.('[data-rate]').forEach(btn=>{
    if(btn.dataset.masteryToastBound)return;
    btn.dataset.masteryToastBound='1';
    btn.addEventListener('click',()=>{
      const p=activeProblem(),slug=p?.slug||'';
      btn.dataset.masteryToastSlug=slug;
      btn.dataset.masteryToastBefore=slug?(state?.solved?.[slug]?.level||''):'';
    },true);
    btn.addEventListener('click',()=>{
      const slug=btn.dataset.masteryToastSlug||activeProblem()?.slug||'';
      const before=btn.dataset.masteryToastBefore||'';
      setTimeout(()=>{
        const after=slug?state?.solved?.[slug]?.level:null;
        if(btn.dataset.rate==='solo'&&before!=='solo'&&after==='solo')showMasteryToast();
      },0);
    });
  });
}
const style=document.createElement('style');style.id='hot100UiPolishStyles';style.textContent=`
html[data-theme="wa2"] #page-home>.title:after{content:none!important;display:none!important;height:0!important;margin:0!important;padding:0!important}
.masteryToast{position:fixed;z-index:1000;left:50%;top:max(72px,calc(env(safe-area-inset-top) + 58px));transform:translate(-50%,-14px) scale(.97);opacity:0;pointer-events:none;display:grid;gap:3px;min-width:230px;max-width:min(88vw,360px);padding:13px 18px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.94);color:var(--text);box-shadow:0 18px 55px rgba(30,42,60,.18);backdrop-filter:blur(18px) saturate(1.12);transition:opacity .24s ease,transform .28s cubic-bezier(.2,.75,.25,1)}
.masteryToast.show{opacity:1;transform:translate(-50%,0) scale(1)}.masteryToast small{font-size:9px;letter-spacing:.14em;color:var(--muted)}.masteryToast b{font-size:15px;line-height:1.35;font-weight:700}
html[data-theme="dark"] .masteryToast{background:rgba(25,30,39,.95);border-color:#3a4352;box-shadow:0 20px 60px rgba(0,0,0,.4)}
html[data-theme="wa2"] .masteryToast{background:linear-gradient(135deg,rgba(252,254,255,.97),rgba(229,241,249,.96));border-color:#c8dce9;color:#24435e;box-shadow:0 20px 60px rgba(45,79,109,.2)}html[data-theme="wa2"] .masteryToast small{color:#7192ad}
@media(max-width:620px){.masteryToast{top:max(62px,calc(env(safe-area-inset-top) + 52px));min-width:0;width:min(84vw,320px);padding:12px 15px}.masteryToast b{font-size:14px}}
`;
document.head.appendChild(style);
removeWa2TitleAfterRule();
bindMasteryButtons();
const observer=new MutationObserver(()=>{removeWa2TitleAfterRule();bindMasteryButtons()});observer.observe(document.body,{childList:true,subtree:true});
window.HOT100_MASTERY_TOAST=showMasteryToast;
})();
