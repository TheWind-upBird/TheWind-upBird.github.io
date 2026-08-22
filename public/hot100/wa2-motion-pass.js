(()=>{
const KEY='hot100-wa2-motion-v1';
const root=document.documentElement;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
let animations=[];
function pref(){try{const v=localStorage.getItem(KEY);return ['auto','on','off'].includes(v)?v:'auto'}catch(e){return'auto'}}
function shouldRun(){const p=pref();return p==='on'||(p==='auto'&&!reduce.matches)}
function stopAll(){animations.forEach(a=>{try{a.cancel()}catch(e){}});animations=[]}
function snowLayer(){return document.getElementById('wa2FallingSnow')}
function snowField(){return document.querySelector('#wa2VisualLayer .wa2SnowField')}
function moonlight(){return document.querySelector('.wa2MotionLight')}
function show(el){if(el)el.style.removeProperty('display')}
function hide(el){if(el)el.style.setProperty('display','none','important')}
function hideAllEffects(){
  stopAll();
  hide(snowLayer());hide(snowField());hide(moonlight());
  document.querySelectorAll('#wa2FallingSnow .wa2Flake').forEach(f=>{f.style.animation='none';f.style.opacity='0'});
  root.dataset.wa2Motion='off';sync();
}
function staticWinter(){
  stopAll();show(snowLayer());show(snowField());hide(moonlight());
  const field=snowField();if(field){field.style.animation='none';field.style.transform='none'}
  document.querySelectorAll('#wa2FallingSnow .wa2Flake').forEach((f,i)=>{
    f.style.animation='none';f.style.opacity=String(.28+(i%5)*.055);
    f.style.transform=`translate3d(${((i*23)%46)-23}px,${8+(i*31)%82}vh,0) rotate(${(i*47)%180}deg)`;
  });
  root.dataset.wa2Motion='static';sync();
}
function ensureMoonlight(){
  const art=document.querySelector('.wa2AlbumArt');if(!art)return null;
  let light=art.querySelector('.wa2MotionLight');
  if(!light){light=document.createElement('div');light.className='wa2MotionLight';art.appendChild(light)}
  return light;
}
function play(){
  stopAll();
  if(root.dataset.theme!=='wa2'){hide(snowLayer());hide(snowField());hide(moonlight());root.dataset.wa2Motion='inactive';return}
  const p=pref();
  if(p==='off'){hideAllEffects();return}
  if(p==='auto'&&reduce.matches){staticWinter();return}

  root.dataset.wa2Motion='on';show(snowLayer());show(snowField());
  const flakes=[...document.querySelectorAll('#wa2FallingSnow .wa2Flake')];
  flakes.forEach((f,i)=>{
    f.style.animation='none';
    const size=9+(i%7)*1.35,opacity=.34+(i%6)*.06,drift=((i*29)%90)-45,dur=7200+(i%9)*930,phase=(i*1731)%dur;
    f.style.setProperty('--size',`${size}px`);f.style.opacity=String(opacity);f.style.transform='translate3d(0,-18vh,0)';
    animations.push(f.animate([
      {transform:'translate3d(0,-18vh,0) rotate(0deg)'},
      {transform:`translate3d(${drift*.42}px,48vh,0) rotate(${90+(i%5)*18}deg)`,offset:.52},
      {transform:`translate3d(${drift}px,114vh,0) rotate(${220+(i%6)*24}deg)`}
    ],{duration:dur,delay:-phase,iterations:Infinity,easing:'linear'}));
  });
  const field=snowField();
  if(field){field.style.animation='none';animations.push(field.animate([{transform:'translate3d(0,0,0)'},{transform:'translate3d(-24px,74px,0)'}],{duration:19000,iterations:Infinity,easing:'linear'}))}
  const light=ensureMoonlight();show(light);
  if(light)animations.push(light.animate([
    {transform:'translateX(-115%) rotate(7deg)',opacity:.05},{transform:'translateX(8%) rotate(7deg)',opacity:.28,offset:.55},{transform:'translateX(118%) rotate(7deg)',opacity:.04}
  ],{duration:9000,delay:-2300,iterations:Infinity,easing:'ease-in-out'}));
  sync();
}
function setPref(v){try{localStorage.setItem(KEY,v)}catch(e){}play()}
function sync(){
  const p=pref();document.querySelectorAll('[data-wa2-motion]').forEach(b=>{const on=b.dataset.wa2Motion===p;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  const status=document.getElementById('wa2MotionSystem');if(status)status.textContent=reduce.matches?'系统当前：减少动画':'系统当前：允许动画';
}
function mount(){
  const themeGroup=document.getElementById('mobileThemeGroup');if(!themeGroup||document.getElementById('wa2MotionControl'))return;
  const box=document.createElement('div');box.id='wa2MotionControl';box.className='wa2MotionControl';
  box.innerHTML=`<div class="wa2MotionHead"><span><b>白二动态效果</b><small id="wa2MotionSystem"></small></span><em>雪花 · 月光</em></div><div class="wa2MotionChoices"><button type="button" data-wa2-motion="auto">跟随系统</button><button type="button" data-wa2-motion="on">开启</button><button type="button" data-wa2-motion="off">关闭</button></div>`;
  themeGroup.appendChild(box);box.querySelectorAll('[data-wa2-motion]').forEach(b=>b.addEventListener('click',()=>setPref(b.dataset.wa2Motion)));sync();
}
const css=document.createElement('style');css.textContent=`
.wa2MotionControl{border-top:1px solid var(--line);margin:9px 2px 3px;padding-top:10px}.wa2MotionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.wa2MotionHead>span{display:grid;gap:2px}.wa2MotionHead b{font-size:11px}.wa2MotionHead small{font-size:8.5px;color:var(--muted)}.wa2MotionHead em{font-style:normal;font-size:8px;color:var(--muted);letter-spacing:.06em}.wa2MotionChoices{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}.wa2MotionChoices button{border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:9px;padding:7px 4px;font-size:9px}.wa2MotionChoices button.active{border-color:var(--accent);background:var(--accent2);color:var(--accent);font-weight:700}
html[data-theme="wa2"] #wa2FallingSnow{z-index:60!important}.wa2MotionLight{position:absolute;z-index:4;top:-25%;bottom:-25%;left:-45%;width:42%;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(233,247,255,.1) 25%,rgba(255,255,255,.34) 50%,rgba(217,239,255,.13) 72%,transparent);filter:blur(2px);mix-blend-mode:screen}
html[data-theme="wa2"][data-wa2-motion="off"] #wa2FallingSnow,html[data-theme="wa2"][data-wa2-motion="off"] #wa2VisualLayer .wa2SnowField,html[data-theme="wa2"][data-wa2-motion="off"] .wa2MotionLight,html[data-theme="wa2"][data-wa2-motion="off"] .wa2AlbumArt:after{display:none!important}
html[data-theme="wa2"][data-wa2-motion="off"] body{background:linear-gradient(180deg,#eaf2f8 0,#f5f8fb 40%,#edf3f8 100%)!important;background-attachment:fixed!important}
html[data-theme="wa2"][data-wa2-motion="static"] .wa2MotionLight{display:none!important}
`;
document.head.appendChild(css);
window.addEventListener('hot100toolsready',mount);window.addEventListener('hot100themechange',()=>setTimeout(play,0));
reduce.addEventListener?.('change',()=>{if(pref()==='auto')play();sync()});
const mo=new MutationObserver(()=>{mount();if(root.dataset.theme==='wa2'&&document.getElementById('wa2FallingSnow')&&animations.length===0&&shouldRun())play()});mo.observe(document.body,{childList:true,subtree:true});
mount();setTimeout(play,0);
})();