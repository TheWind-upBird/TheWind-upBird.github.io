(()=>{
const Profile=window.HOT100_PRODUCT_PROFILE,Policy=window.HOT100_LEARNING_POLICY,Catalog=window.HOT100_PRODUCT_CATALOG;
if(!Profile||!Policy||!Catalog)return;
const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lastTodaySignature='';
function locale(){return Profile.get().locale||'zh-CN'}
function typeLabel(type){const zh={learn:'新学',continue:'继续',practice:'巩固',review:'复习',weak:'薄弱点',prove:'独立'},en={learn:'Learn',continue:'Continue',practice:'Practice',review:'Review',weak:'Weak spot',prove:'Prove'};return locale()==='en-US'?en[type]||type:zh[type]||type}
function currentProblemSafe(){try{return typeof current==='function'?current():(window.HOT100_CURRICULUM||[])[state?.currentProblem||0]}catch(e){return null}}
function todaySignature(profile,p){
  try{
    const slug=p?.slug||'',done=(state?.completedCards?.[slug]||[]).length,level=state?.solved?.[slug]?.level||'',due=(state?.reviewQueue||[]).filter(r=>r.due<=new Date().toISOString().slice(0,10)).length;
    return [profile.locale,profile.goal,profile.level,profile.dailyMinutes,profile.activeTrack,state?.currentProblem||0,slug,done,level,due].join('|');
  }catch(e){return String(Date.now())}
}
function renderToday(force=false){
  const home=document.getElementById('page-home');if(!home)return;
  const profile=Profile.get(),p=currentProblemSafe(),signature=todaySignature(profile,p);
  let box=document.getElementById('productTodayPlan');
  if(!force&&box&&signature===lastTodaySignature)return;
  if(!box){box=document.createElement('section');box.id='productTodayPlan';box.className='productTodayPlan card';const hero=home.querySelector('.hero');hero?.insertAdjacentElement('beforebegin',box)}
  const plan=Policy.todayPlan(profile.dailyMinutes||20),pattern=p?Catalog.patternFor(p):null,isEn=profile.locale==='en-US';
  const tasks=plan.tasks.map((x,i)=>`<button class="productTask" data-product-task="${x.index}"><span><small>${String(i+1).padStart(2,'0')} · ${typeLabel(x.type)}</small><b>${escHtml(x.title)}</b></span><em>${x.minutes} ${isEn?'min':'分钟'} ›</em></button>`).join('');
  box.innerHTML=`<div class="productTodayHead"><div><small>${isEn?'TODAY · PERSONAL PATH':'TODAY · 今日路线'}</small><h3>${isEn?`${profile.dailyMinutes} minutes, keep moving.`:`${profile.dailyMinutes} 分钟，继续往前。`}</h3></div><button class="secondary productSettingsBtn" type="button">${isEn?'Settings':'学习设置'}</button></div><div class="productContext"><span>${isEn?'Track':'路线'} · ${escHtml(Catalog.localize(Catalog.track(profile.activeTrack)?.title,profile.locale))}</span>${pattern?`<span>${isEn?'Pattern':'知识点'} · ${escHtml(isEn?pattern.en:pattern.zh)}</span>`:''}</div><div class="productTasks">${tasks}</div>`;
  box.querySelector('.productSettingsBtn')?.addEventListener('click',()=>openOnboarding(false));
  box.querySelectorAll('[data-product-task]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.productTask);if(Number.isFinite(i)&&typeof openProblem==='function')openProblem(i)}));
  lastTodaySignature=signature;
}
function option(value,label,current,name,disabled=false){return `<button type="button" class="onboardOption ${current===value?'selected':''}" data-profile-field="${name}" data-profile-value="${value}" ${disabled?'disabled':''}>${escHtml(label)}</button>`}
function onboardingMarkup(draft,firstRun){
  const isEn=draft.locale==='en-US',t=k=>Profile.t(k,draft.locale);
  return `<div class="productOnboardingScrim"></div><section class="productOnboardingCard" role="dialog" aria-modal="true" aria-label="${escHtml(t('settings'))}"><div class="onboardTop"><div><small>${firstRun?(isEn?'WELCOME':'欢迎'):isEn?'LEARNING PROFILE':'学习档案'}</small><h2>${isEn?'Build a path that fits you.':'先让路线适合你。'}</h2><p>${isEn?'Choose your goal and available time. While solving, switch freely between Learn, Practice, and Interview.':'选择目标和每天能投入的时间。做题时可以随时切换学习、刷题和面试模式。'}</p></div><button class="round onboardClose" type="button" aria-label="Close">×</button></div>
  <div class="onboardField"><b>${t('goal')}</b><div class="onboardOptions">${option('internship',t('goalInternship'),draft.goal,'goal')}${option('campus',t('goalCampus'),draft.goal,'goal')}${option('switch',t('goalSwitch'),draft.goal,'goal')}${option('general',t('goalGeneral'),draft.goal,'goal')}</div></div>
  <div class="onboardField"><b>${t('level')}</b><div class="onboardOptions vertical">${option('beginner',t('levelBeginner'),draft.level,'level')}${option('developing',t('levelDeveloping'),draft.level,'level')}${option('interview',t('levelInterview'),draft.level,'level')}</div></div>
  <div class="onboardField"><b>${t('daily')}</b><div class="onboardOptions">${[10,20,30,60].map(x=>option(String(x),t('minute'+x),String(draft.dailyMinutes),'dailyMinutes')).join('')}</div></div>
  <div class="onboardGrid"><div class="onboardField"><b>${t('language')}</b><div class="onboardOptions">${option('zh-CN',t('zh'),draft.locale,'locale')}${option('en-US',isEn?'English':'English（课程翻译中）',draft.locale,'locale',draft.locale!=='en-US')}</div></div><div class="onboardField"><b>${t('coding')}</b><div class="onboardOptions">${option('python',t('python'),draft.codingLanguage,'codingLanguage')}${option('cpp',t('cpp'),draft.codingLanguage,'codingLanguage',true)}${option('java',t('java'),draft.codingLanguage,'codingLanguage',true)}</div></div></div>
  <div class="onboardActions"><button class="secondary onboardCancel" type="button">${firstRun?t('later'):(isEn?'Cancel':'取消')}</button><button class="primary onboardSave" type="button">${firstRun?t('start'):t('save')}</button></div></section>`;
}
function openOnboarding(firstRun=false){
  document.getElementById('productOnboarding')?.remove();
  const overlay=document.createElement('div');overlay.id='productOnboarding';overlay.className='productOnboarding';document.body.appendChild(overlay);document.body.classList.add('productModalOpen');
  const draft={...Profile.get()};
  const close=()=>{overlay.remove();document.body.classList.remove('productModalOpen')};
  function paint(){
    overlay.innerHTML=onboardingMarkup(draft,firstRun);
    overlay.querySelectorAll('[data-profile-field]:not([disabled])').forEach(btn=>btn.addEventListener('click',()=>{const field=btn.dataset.profileField;let value=btn.dataset.profileValue;if(field==='dailyMinutes')value=Number(value);draft[field]=value;paint()}));
    overlay.querySelector('.onboardClose')?.addEventListener('click',()=>{if(firstRun)Profile.update({onboardingComplete:true});close()});
    overlay.querySelector('.onboardCancel')?.addEventListener('click',()=>{if(firstRun)Profile.update({onboardingComplete:true});close()});
    overlay.querySelector('.productOnboardingScrim')?.addEventListener('click',()=>{if(!firstRun)close()});
    overlay.querySelector('.onboardSave')?.addEventListener('click',()=>{Profile.update({...draft,onboardingComplete:true});close()});
  }
  paint();
}
function mountSettingsInDrawer(){
  const panel=document.querySelector('.mobileToolsPanel');if(!panel||document.getElementById('productLearningSettings'))return;
  const group=document.createElement('section');group.className='mobileToolsGroup productSettingsGroup';group.innerHTML=`<div class="mobileToolsLabel">${locale()==='en-US'?'Learning':'学习'}</div><button class="mobileToolRow" id="productLearningSettings" type="button"><span class="toolIcon">◎</span><span><b>${locale()==='en-US'?'Learning settings':'学习设置'}</b><small>${locale()==='en-US'?'Goal, daily time, course and coding language':'目标、每天时间、课程语言与编程语言'}</small></span><em>›</em></button>`;
  panel.querySelector('.mobileToolsStats')?.insertAdjacentElement('afterend',group);
  group.querySelector('button')?.addEventListener('click',()=>{document.getElementById('mobileToolsDrawer')?.classList.remove('open');document.body.classList.remove('toolsOpen');openOnboarding(false)});
}
function refreshSettingsInDrawer(){const old=document.querySelector('.productSettingsGroup');if(old)old.remove();mountSettingsInDrawer()}
function applyProductCopy(){
  const isEn=locale()==='en-US';
  const problemSub=document.querySelector('#page-problems>.subtitle');if(problemSub)problemSub.textContent=isEn?'Browse by Pattern and choose Learn, Practice, or Interview for any problem.':'按知识点组织题目；每道题都可以选择学习、刷题或面试模式。';
  const homeP=document.querySelector('#page-home>.sectionHead p');if(homeP)homeP.textContent=isEn?'Finish the current step and keep moving.':'完成当前步骤后继续。';
}
function hookPageEvents(){
  if(typeof window.showPage!=='function'||window.showPage.__productEventDriven)return;
  const original=window.showPage;
  function wrapped(name,...args){const result=original.call(this,name,...args);if(name==='home')requestAnimationFrame(()=>renderToday(true));return result}
  wrapped.__productEventDriven=true;window.showPage=wrapped;
}
const style=document.createElement('style');style.id='productFrameworkStyles';style.textContent=`
.productTodayPlan{padding:16px 17px;margin:14px 0 16px;box-shadow:none}.productTodayHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.productTodayHead small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.productTodayHead h3{margin:3px 0 0;font-size:17px}.productTodayHead .secondary{padding:8px 10px;font-size:11px}.productContext{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0}.productContext span{border:1px solid var(--line);border-radius:999px;padding:5px 8px;font-size:10px;color:var(--muted);background:var(--panel,#fff)}.productTasks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.productTask{border:1px solid var(--line);border-radius:12px;background:var(--panel,#fff);color:var(--text);padding:10px 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left}.productTask span{display:grid;gap:2px;min-width:0}.productTask small{font-size:9px;color:var(--muted);letter-spacing:.05em}.productTask b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.productTask em{font-style:normal;color:var(--muted);font-size:10px;white-space:nowrap}.productTask:hover{border-color:var(--accent);transform:translateY(-1px)}
.productOnboarding{position:fixed;inset:0;z-index:900;display:grid;place-items:center;padding:20px}.productOnboardingScrim{position:absolute;inset:0;background:rgba(9,14,24,.48);backdrop-filter:blur(8px)}.productOnboardingCard{position:relative;width:min(720px,94vw);max-height:min(820px,92vh);overflow:auto;background:var(--panel,#fff);color:var(--text);border:1px solid var(--line);border-radius:22px;padding:24px;box-shadow:0 28px 90px rgba(10,20,35,.28)}.onboardTop{display:flex;justify-content:space-between;gap:20px}.onboardTop small{font-size:9px;letter-spacing:.14em;color:var(--muted)}.onboardTop h2{font-size:28px;margin:4px 0 7px}.onboardTop p{color:var(--muted);font-size:12px;line-height:1.6;margin:0;max-width:520px}.onboardField{margin-top:20px}.onboardField>b{display:block;font-size:12px;margin-bottom:8px}.onboardOptions{display:flex;gap:7px;flex-wrap:wrap}.onboardOptions.vertical{display:grid;grid-template-columns:repeat(3,1fr)}.onboardOption{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:transparent;color:var(--text);font-size:12px;text-align:left}.onboardOption.selected{border-color:var(--accent);background:var(--accent2);box-shadow:0 0 0 1px var(--accent)}.onboardOption:disabled{opacity:.42}.onboardGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.onboardActions{display:flex;justify-content:flex-end;gap:8px;margin-top:24px;padding-top:16px;border-top:1px solid var(--line)}body.productModalOpen{overflow:hidden}
html[data-theme="dark"] .productOnboardingScrim{background:rgba(0,0,0,.62)}html[data-theme="wa2"] .productTodayPlan{background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(232,243,251,.78))!important}html[data-theme="wa2"] .productTodayHead small{color:#7392aa}html[data-theme="wa2"] .productTask{background:rgba(255,255,255,.72)}
@media(max-width:820px){.productTasks{grid-template-columns:1fr}.productTodayPlan{margin-top:12px}.productTodayHead h3{font-size:15px}.productOnboarding{padding:10px}.productOnboardingCard{padding:18px 15px;border-radius:18px}.onboardTop h2{font-size:23px}.onboardGrid{grid-template-columns:1fr;gap:0}.onboardOptions.vertical{grid-template-columns:1fr}.onboardOption{flex:1 1 calc(50% - 7px)}}
`;
document.head.appendChild(style);
hookPageEvents();applyProductCopy();renderToday(true);mountSettingsInDrawer();
window.addEventListener('hot100toolsready',mountSettingsInDrawer);
window.addEventListener('hot100profilechange',()=>{lastTodaySignature='';applyProductCopy();refreshSettingsInDrawer();renderToday(true)});
setTimeout(()=>{if(!Profile.get().onboardingComplete)openOnboarding(true)},450);
window.HOT100_PRODUCT_SHELL={renderToday,openOnboarding,mountSettingsInDrawer,mode:'event-driven'};
})();