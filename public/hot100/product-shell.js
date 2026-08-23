(()=>{
const Profile=window.HOT100_PRODUCT_PROFILE,Policy=window.HOT100_LEARNING_POLICY,Catalog=window.HOT100_PRODUCT_CATALOG;
if(!Profile||!Policy||!Catalog)return;
const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function locale(){return Profile.get().locale||'zh-CN'}
function stageLabel(stage){const zh={learn:'学会',practice:'迁移',prove:'独立验证'},en={learn:'Learn',practice:'Practice',prove:'Prove'};return locale()==='en-US'?en[stage]||stage:zh[stage]||stage}
function typeLabel(type){const zh={learn:'新学',practice:'巩固',review:'复习',prove:'独立'},en={learn:'Learn',practice:'Practice',review:'Review',prove:'Prove'};return locale()==='en-US'?en[type]||type:zh[type]||type}
function currentProblemSafe(){try{return typeof current==='function'?current():(window.HOT100_CURRICULUM||[])[state?.currentProblem||0]}catch(e){return null}}
function renderToday(){
  const home=document.getElementById('page-home');if(!home)return;
  let box=document.getElementById('productTodayPlan');
  if(!box){box=document.createElement('section');box.id='productTodayPlan';box.className='productTodayPlan card';const hero=home.querySelector('.hero');hero?.insertAdjacentElement('beforebegin',box)}
  const profile=Profile.get(),plan=Policy.todayPlan(profile.dailyMinutes||20),p=currentProblemSafe(),policy=p?Policy.scaffoldPlan(p):null,pattern=p?Catalog.patternFor(p):null;
  const isEn=profile.locale==='en-US';
  const tasks=plan.tasks.map((x,i)=>`<button class="productTask" data-product-task="${x.index}"><span><small>${String(i+1).padStart(2,'0')} · ${typeLabel(x.type)}</small><b>${escHtml(x.title)}</b></span><em>${x.minutes} ${isEn?'min':'分钟'} ›</em></button>`).join('');
  box.innerHTML=`<div class="productTodayHead"><div><small>${isEn?'TODAY · PERSONAL PATH':'TODAY · 今日路线'}</small><h3>${isEn?`${profile.dailyMinutes} minutes, keep moving.`:`${profile.dailyMinutes} 分钟，继续往前。`}</h3></div><button class="secondary productSettingsBtn" type="button">${isEn?'Settings':'学习设置'}</button></div><div class="productContext"><span>${isEn?'Track':'路线'} · ${escHtml(Catalog.localize(Catalog.track(profile.activeTrack)?.title,profile.locale))}</span>${pattern?`<span>${isEn?'Pattern':'当前模式'} · ${escHtml(isEn?pattern.en:pattern.zh)}</span>`:''}${policy?`<span>${isEn?'Stage':'阶段'} · ${stageLabel(policy.stage)}</span>`:''}</div><div class="productTasks">${tasks}</div>`;
  box.querySelector('.productSettingsBtn')?.addEventListener('click',()=>openOnboarding(false));
  box.querySelectorAll('[data-product-task]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.productTask);if(Number.isFinite(i))openProblem(i)}));
}
function option(value,label,current,name,disabled=false){return `<button type="button" class="onboardOption ${current===value?'selected':''}" data-profile-field="${name}" data-profile-value="${value}" ${disabled?'disabled':''}>${escHtml(label)}</button>`}
function openOnboarding(firstRun=false){
  document.getElementById('productOnboarding')?.remove();
  const p=Profile.get(),isEn=p.locale==='en-US',t=k=>Profile.t(k,p.locale);
  const overlay=document.createElement('div');overlay.id='productOnboarding';overlay.className='productOnboarding';
  overlay.innerHTML=`<div class="productOnboardingScrim"></div><section class="productOnboardingCard" role="dialog" aria-modal="true" aria-label="${escHtml(t('settings'))}"><div class="onboardTop"><div><small>${firstRun?(isEn?'WELCOME':'欢迎'):isEn?'LEARNING PROFILE':'学习档案'}</small><h2>${isEn?'Build a path that fits you.':'先让路线适合你。'}</h2><p>${isEn?'Choose your goal and available time. The teaching support will fade as you get stronger.':'选择目标和每天能投入的时间。随着你变熟练，系统会逐渐减少提示。'}</p></div><button class="round onboardClose" type="button" aria-label="Close">×</button></div>
    <div class="onboardField"><b>${t('goal')}</b><div class="onboardOptions">${option('internship',t('goalInternship'),p.goal,'goal')}${option('campus',t('goalCampus'),p.goal,'goal')}${option('switch',t('goalSwitch'),p.goal,'goal')}${option('general',t('goalGeneral'),p.goal,'goal')}</div></div>
    <div class="onboardField"><b>${t('level')}</b><div class="onboardOptions vertical">${option('beginner',t('levelBeginner'),p.level,'level')}${option('developing',t('levelDeveloping'),p.level,'level')}${option('interview',t('levelInterview'),p.level,'level')}</div></div>
    <div class="onboardField"><b>${t('daily')}</b><div class="onboardOptions">${[10,20,30,60].map(x=>option(String(x),t('minute'+x),String(p.dailyMinutes),'dailyMinutes')).join('')}</div></div>
    <div class="onboardGrid"><div class="onboardField"><b>${t('language')}</b><div class="onboardOptions">${option('zh-CN',t('zh'),p.locale,'locale')}${option('en-US',t('en'),p.locale,'locale')}</div></div><div class="onboardField"><b>${t('coding')}</b><div class="onboardOptions">${option('python',t('python'),p.codingLanguage,'codingLanguage')}${option('cpp',t('cpp'),p.codingLanguage,'codingLanguage',true)}${option('java',t('java'),p.codingLanguage,'codingLanguage',true)}</div></div></div>
    <div class="onboardActions"><button class="secondary onboardCancel" type="button">${firstRun?t('later'):(isEn?'Cancel':'取消')}</button><button class="primary onboardSave" type="button">${firstRun?t('start'):t('save')}</button></div></section>`;
  document.body.appendChild(overlay);document.body.classList.add('productModalOpen');
  const draft={...p};
  function select(btn){const field=btn.dataset.profileField;let value=btn.dataset.profileValue;if(field==='dailyMinutes')value=Number(value);draft[field]=value;overlay.querySelectorAll(`[data-profile-field="${field}"]`).forEach(x=>x.classList.toggle('selected',x===btn));if(field==='locale'){Profile.update({locale:value});overlay.remove();document.body.classList.remove('productModalOpen');openOnboarding(firstRun)}}
  overlay.querySelectorAll('[data-profile-field]:not([disabled])').forEach(btn=>btn.addEventListener('click',()=>select(btn)));
  const close=()=>{overlay.remove();document.body.classList.remove('productModalOpen')};
  overlay.querySelector('.onboardClose')?.addEventListener('click',close);overlay.querySelector('.onboardCancel')?.addEventListener('click',close);overlay.querySelector('.productOnboardingScrim')?.addEventListener('click',()=>{if(!firstRun)close()});
  overlay.querySelector('.onboardSave')?.addEventListener('click',()=>{Profile.update({...draft,onboardingComplete:true});close();applyProductCopy();renderToday()});
}
function mountSettingsInDrawer(){
  const panel=document.querySelector('.mobileToolsPanel');if(!panel||document.getElementById('productLearningSettings'))return;
  const group=document.createElement('section');group.className='mobileToolsGroup productSettingsGroup';group.innerHTML=`<div class="mobileToolsLabel">${locale()==='en-US'?'Learning':'学习'}</div><button class="mobileToolRow" id="productLearningSettings" type="button"><span class="toolIcon">◎</span><span><b>${locale()==='en-US'?'Learning settings':'学习设置'}</b><small>${locale()==='en-US'?'Goal, daily time, course and coding language':'目标、每天时间、课程语言与编程语言'}</small></span><em>›</em></button>`;
  panel.querySelector('.mobileToolsStats')?.insertAdjacentElement('afterend',group);
  group.querySelector('button')?.addEventListener('click',()=>{document.getElementById('mobileToolsDrawer')?.classList.remove('open');document.body.classList.remove('toolsOpen');openOnboarding(false)});
}
function applyProductCopy(){
  const isEn=locale()==='en-US';
  const problemSub=document.querySelector('#page-problems>.subtitle');if(problemSub)problemSub.textContent=isEn?'Practice by pattern. Guidance fades as you improve.':'按知识模式练习；随着熟练度提高，提示会逐渐减少。';
  const homeP=document.querySelector('#page-home>.sectionHead p');if(homeP)homeP.textContent=isEn?'Finish the current step and keep moving.':'完成当前步骤后继续。';
}
const style=document.createElement('style');style.id='productFrameworkStyles';style.textContent=`
.productTodayPlan{padding:16px 17px;margin:14px 0 16px;box-shadow:none}.productTodayHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.productTodayHead small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.productTodayHead h3{margin:3px 0 0;font-size:17px}.productTodayHead .secondary{padding:8px 10px;font-size:11px}.productContext{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0}.productContext span{border:1px solid var(--line);border-radius:999px;padding:5px 8px;font-size:10px;color:var(--muted);background:var(--panel,#fff)}.productTasks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.productTask{border:1px solid var(--line);border-radius:12px;background:var(--panel,#fff);color:var(--text);padding:10px 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left}.productTask span{display:grid;gap:2px;min-width:0}.productTask small{font-size:9px;color:var(--muted);letter-spacing:.05em}.productTask b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.productTask em{font-style:normal;color:var(--muted);font-size:10px;white-space:nowrap}.productTask:hover{border-color:var(--accent);transform:translateY(-1px)}
.productOnboarding{position:fixed;inset:0;z-index:900;display:grid;place-items:center;padding:20px}.productOnboardingScrim{position:absolute;inset:0;background:rgba(9,14,24,.48);backdrop-filter:blur(8px)}.productOnboardingCard{position:relative;width:min(720px,94vw);max-height:min(820px,92vh);overflow:auto;background:var(--panel,#fff);color:var(--text);border:1px solid var(--line);border-radius:22px;padding:24px;box-shadow:0 28px 90px rgba(10,20,35,.28)}.onboardTop{display:flex;justify-content:space-between;gap:20px}.onboardTop small{font-size:9px;letter-spacing:.14em;color:var(--muted)}.onboardTop h2{font-size:28px;margin:4px 0 7px}.onboardTop p{color:var(--muted);font-size:12px;line-height:1.6;margin:0;max-width:520px}.onboardField{margin-top:20px}.onboardField>b{display:block;font-size:12px;margin-bottom:8px}.onboardOptions{display:flex;gap:7px;flex-wrap:wrap}.onboardOptions.vertical{display:grid;grid-template-columns:repeat(3,1fr)}.onboardOption{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:transparent;color:var(--text);font-size:12px;text-align:left}.onboardOption.selected{border-color:var(--accent);background:var(--accent2);box-shadow:0 0 0 1px var(--accent)}.onboardOption:disabled{opacity:.42}.onboardGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.onboardActions{display:flex;justify-content:flex-end;gap:8px;margin-top:24px;padding-top:16px;border-top:1px solid var(--line)}body.productModalOpen{overflow:hidden}
html[data-theme="dark"] .productOnboardingScrim{background:rgba(0,0,0,.62)}html[data-theme="wa2"] .productTodayPlan{background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(232,243,251,.78))!important}html[data-theme="wa2"] .productTodayHead small{color:#7392aa}html[data-theme="wa2"] .productTask{background:rgba(255,255,255,.72)}
@media(max-width:820px){.productTasks{grid-template-columns:1fr}.productTodayPlan{margin-top:12px}.productTodayHead h3{font-size:15px}.productOnboarding{padding:10px}.productOnboardingCard{padding:18px 15px;border-radius:18px}.onboardTop h2{font-size:23px}.onboardGrid{grid-template-columns:1fr;gap:0}.onboardOptions.vertical{grid-template-columns:1fr}.onboardOption{flex:1 1 calc(50% - 7px)}}
`;
document.head.appendChild(style);
applyProductCopy();renderToday();mountSettingsInDrawer();
window.addEventListener('hot100toolsready',mountSettingsInDrawer);window.addEventListener('hot100profilechange',()=>{applyProductCopy();renderToday();mountSettingsInDrawer()});
let refreshQueued=false;
const observer=new MutationObserver(mutations=>{
  mountSettingsInDrawer();
  const outsideProduct=mutations.some(m=>{const el=m.target?.nodeType===1?m.target:m.target?.parentElement;return !el?.closest?.('#productTodayPlan,#productOnboarding,#mobileToolsDrawer')});
  if(outsideProduct&&!refreshQueued){refreshQueued=true;requestAnimationFrame(()=>{refreshQueued=false;renderToday()})}
});observer.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>{if(!Profile.get().onboardingComplete)openOnboarding(true)},350);
window.HOT100_PRODUCT_SHELL={renderToday,openOnboarding,mountSettingsInDrawer};
})();