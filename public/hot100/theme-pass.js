(()=>{
const KEY='hot100-theme-v1';
const THEMES={
  day:{label:'白天',icon:'☀',themeColor:'#f6f7fb'},
  dark:{label:'黑夜',icon:'☾',themeColor:'#10131a'},
  wa2:{label:'白色相簿2',icon:'❄',themeColor:'#eaf2f9'}
};
function valid(v){return Object.prototype.hasOwnProperty.call(THEMES,v)?v:'day'}
function stateTheme(){
  try{return typeof state!=='undefined'&&state?.attempts?.__ui?.theme||null}catch(e){return null}
}
function saved(){
  try{
    const fromState=stateTheme();if(fromState&&THEMES[fromState])return fromState;
    return valid(localStorage.getItem(KEY)||'day');
  }catch(e){return 'day'}
}
function persistTheme(name){
  try{localStorage.setItem(KEY,name)}catch(e){}
  try{
    if(typeof state!=='undefined'){
      state.attempts=state.attempts||{};
      state.attempts.__ui=state.attempts.__ui||{};
      state.attempts.__ui.theme=name;
      if(typeof persist==='function')persist();
    }
  }catch(e){}
}
function syncControls(name){
  document.querySelectorAll('[data-hot100-theme]').forEach(btn=>{
    const active=btn.dataset.hot100Theme===name;
    btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');
  });
}
function apply(name,{save=true}={}){
  name=valid(name);
  document.documentElement.dataset.theme=name;
  document.documentElement.style.colorScheme=name==='dark'?'dark':'light';
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=THEMES[name].themeColor;
  if(save)persistTheme(name);else{try{localStorage.setItem(KEY,name)}catch(e){}}
  syncControls(name);
  window.dispatchEvent(new CustomEvent('hot100themechange',{detail:{theme:name}}));
  return name;
}
function choicesMarkup(compact=false){
  return `<div class="themeChoices ${compact?'compact':''}" role="group" aria-label="主题">${Object.entries(THEMES).map(([key,x])=>`<button type="button" class="themeChoice" data-hot100-theme="${key}" aria-pressed="false"><span class="themeSwatch ${key}"><i></i></span><span><b>${x.icon} ${x.label}</b>${compact?'':`<small>${key==='day'?'清爽浅色':key==='dark'?'低亮度深色':'冬夜 · 冰蓝 · 雪白'}</small>`}</span></button>`).join('')}</div>`;
}
function bind(root=document){
  root.querySelectorAll?.('[data-hot100-theme]').forEach(btn=>{
    if(btn.dataset.themeBound)return;btn.dataset.themeBound='1';
    btn.addEventListener('click',()=>apply(btn.dataset.hot100Theme));
  });syncControls(valid(document.documentElement.dataset.theme||saved()));
}
function mountDesktop(){
  const pop=document.querySelector('#hot100DataMenu .utilityPopover');if(!pop||document.getElementById('desktopThemePicker'))return;
  const box=document.createElement('div');box.id='desktopThemePicker';box.className='desktopThemePicker';
  box.innerHTML=`<div class="themeSectionTitle"><b>外观</b><small>自动记住当前主题</small></div>${choicesMarkup(true)}`;
  const tip=pop.querySelector('.utilityTip');pop.insertBefore(box,tip||null);bind(box);
}
function mountMobile(){
  const drawer=document.querySelector('.mobileToolsPanel');if(!drawer||document.getElementById('mobileThemeGroup'))return;
  const appGroup=[...drawer.querySelectorAll('.mobileToolsGroup')].find(x=>x.querySelector('#mobileInstall'));
  const group=document.createElement('section');group.id='mobileThemeGroup';group.className='mobileToolsGroup themeToolsGroup';
  group.innerHTML=`<div class="mobileToolsLabel">外观</div>${choicesMarkup(false)}`;
  if(appGroup)drawer.insertBefore(group,appGroup);else drawer.appendChild(group);bind(group);
}
const css=document.createElement('style');
css.id='hot100ThemeStyles';css.textContent=`
.themeSectionTitle{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:10px;margin-top:2px}.themeSectionTitle b{font-size:13px}.themeSectionTitle small{font-size:10px!important}.themeChoices{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:9px 0 5px}.themeChoice{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:9px 7px;display:grid;gap:7px;text-align:left;min-width:0;transition:border-color .18s,box-shadow .18s,transform .18s}.themeChoice:active{transform:scale(.98)}.themeChoice>span:last-child{display:grid;gap:1px}.themeChoice b{font-size:11px;white-space:nowrap}.themeChoice small{font-size:9px;color:var(--muted);line-height:1.3}.themeChoice.active{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 15%,transparent)}.themeSwatch{height:31px;border-radius:8px;display:block;position:relative;overflow:hidden;border:1px solid rgba(120,130,150,.18)}.themeSwatch i{position:absolute;width:19px;height:19px;border-radius:6px;right:5px;bottom:5px;box-shadow:0 3px 9px rgba(20,30,50,.12)}.themeSwatch.day{background:#f4f5f9}.themeSwatch.day i{background:#fff;border:1px solid #e3e6ed}.themeSwatch.dark{background:#10131a}.themeSwatch.dark i{background:#24293a}.themeSwatch.wa2{background:linear-gradient(145deg,#f8fbfe 12%,#deebf6 52%,#c4d8eb)}.themeSwatch.wa2:after{content:'✦';position:absolute;left:7px;top:3px;color:#fff;font-size:13px;text-shadow:0 0 8px #7fa9cd}.themeSwatch.wa2 i{background:linear-gradient(145deg,#7da7cb,#456f98)}.themeChoices.compact .themeChoice{padding:7px}.themeChoices.compact .themeSwatch{height:24px}.themeChoices.compact .themeSwatch i{width:14px;height:14px}.themeChoices.compact .themeChoice b{font-size:10px}
html[data-theme="dark"]{--bg:#0f1218;--panel:#171b23;--text:#edf0f6;--muted:#98a2b2;--line:#2a303b;--accent:#898bff;--accent2:#282947;--good:#68c99b;--goodbg:#173227;--warn:#e3bd66;--warnbg:#322a17;--bad:#f1827b;--badbg:#39201f;--code:#090c11;--codeText:#f3f5f9;--shadow:0 14px 38px rgba(0,0,0,.18)}
html[data-theme="dark"] body{background:var(--bg)}html[data-theme="dark"] .topbar,html[data-theme="dark"] .mobileBar{background:rgba(18,21,29,.92);border-color:var(--line)}html[data-theme="dark"] .sidebar{background:#090b10}html[data-theme="dark"] .card,html[data-theme="dark"] .secondary,html[data-theme="dark"] .ghost,html[data-theme="dark"] .round,html[data-theme="dark"] .choice,html[data-theme="dark"] .token,html[data-theme="dark"] .filter,html[data-theme="dark"] .rate,html[data-theme="dark"] .codeKey,html[data-theme="dark"] .syntaxItem,html[data-theme="dark"] .traceBox,html[data-theme="dark"] .num{background:var(--panel);border-color:var(--line);color:var(--text)}html[data-theme="dark"] .runner{background:#131821;border-color:var(--line);color:#c9d0dc}html[data-theme="dark"] .hero:after{background:radial-gradient(circle,rgba(120,122,255,.13),transparent 69%)}html[data-theme="dark"] .mini{background:#1b2029;border-color:var(--line)}html[data-theme="dark"] .stepNum,html[data-theme="dark"] .problemNum{background:#252b35}html[data-theme="dark"] .masterTrack,html[data-theme="dark"] .deckTrack{background:#252b35}html[data-theme="dark"] .personalNote textarea{background:#10141b;border-color:var(--line);color:var(--text)}html[data-theme="dark"] .utilityPopover,html[data-theme="dark"] .installHelpCard{background:#191e27;border-color:var(--line);color:var(--text)}html[data-theme="dark"] .mobileToolsPanel{background:#11151c;border-color:var(--line)}html[data-theme="dark"] .mobileToolsStats>div,html[data-theme="dark"] .mobileToolsGroup{background:#191e27;border-color:var(--line)}html[data-theme="dark"] .mobileToolRow{color:var(--text);border-color:var(--line)}html[data-theme="dark"] .interviewPrompt{border-color:var(--line);background:#131821}html[data-theme="dark"] .homeWeakCard,html[data-theme="dark"] .weaknessCard{background:var(--panel)}html[data-theme="dark"] .cardFooter{background:linear-gradient(to bottom,rgba(23,27,35,.88),#171b23 24%)}html[data-theme="dark"] .snapshotItem{background:#141923;border-color:#303744;color:#f3f5fb}html[data-theme="dark"] .snapshotItem b{color:#f3f5fb}html[data-theme="dark"] .snapshotItem small{color:#aeb7c8}html[data-theme="dark"] .snapshotItem em{color:#a8a5ff}html[data-theme="dark"] .snapshotItem:hover{background:#1d2330;border-color:#454e60}
html[data-theme="wa2"]{--bg:#edf3f8;--panel:rgba(252,254,255,.94);--text:#172538;--muted:#718397;--line:#d9e5ef;--accent:#5e8db8;--accent2:#e4eff8;--good:#3f806c;--goodbg:#e8f4f0;--warn:#8a6a36;--warnbg:#f7f0e2;--bad:#a8595e;--badbg:#faecee;--code:#101a28;--codeText:#eff6fc;--shadow:0 16px 42px rgba(48,83,116,.08)}
html[data-theme="wa2"] body{background:radial-gradient(circle at 11% 15%,rgba(255,255,255,.78) 0 1px,transparent 1.5px) 0 0/92px 92px,radial-gradient(circle at 79% 31%,rgba(255,255,255,.62) 0 1px,transparent 1.7px) 0 0/137px 137px,linear-gradient(180deg,#eaf2f8 0,#f5f8fb 40%,#edf3f8 100%);background-attachment:fixed}html[data-theme="wa2"] .sidebar{background:linear-gradient(180deg,#14283d 0%,#0c1b2a 62%,#091521 100%);box-shadow:12px 0 36px rgba(36,72,104,.08)}html[data-theme="wa2"] .brand b:after{content:'  ❄';font-size:10px;color:#a9c5dd}html[data-theme="wa2"] .sideBtn.active,html[data-theme="wa2"] .sideBtn:hover{background:rgba(116,160,197,.18);color:#fff}html[data-theme="wa2"] .logo{background:linear-gradient(145deg,#a9c9e2,#557fa7);box-shadow:0 7px 20px rgba(86,130,169,.25)}html[data-theme="wa2"] .topbar{background:rgba(247,251,254,.84);border-bottom-color:#d7e5f0;box-shadow:0 1px 0 rgba(255,255,255,.75);backdrop-filter:blur(20px) saturate(1.12)}html[data-theme="wa2"] .mobileBar{background:rgba(248,251,253,.95);border-top-color:#d8e5ef;box-shadow:0 -8px 28px rgba(45,78,108,.06)}html[data-theme="wa2"] .card{border-color:rgba(205,221,234,.94);box-shadow:0 16px 42px rgba(49,83,114,.07),inset 0 1px rgba(255,255,255,.86)}html[data-theme="wa2"] .hero{background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(238,247,253,.96));border-color:#cfdfec;box-shadow:0 20px 54px rgba(55,92,125,.09)}html[data-theme="wa2"] .hero:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 0 52%,rgba(255,255,255,.7) 62%,transparent 72%);opacity:.58}html[data-theme="wa2"] .hero:after{background:radial-gradient(circle,rgba(100,151,194,.2),transparent 68%)}html[data-theme="wa2"] .primary{background:linear-gradient(135deg,#6d9bc4,#4c789f);box-shadow:0 8px 20px rgba(66,113,155,.18)}html[data-theme="wa2"] .soft{background:#e3eff8;color:#436f99}html[data-theme="wa2"] .tag{background:#e3eef7;color:#4d789f}html[data-theme="wa2"] .typePill.learn{background:#e3eef8;color:#49769f}html[data-theme="wa2"] .typePill.code{background:#e8f3fa;color:#3d749d}html[data-theme="wa2"] .mini{background:rgba(255,255,255,.9);border-color:#d5e3ee;box-shadow:0 12px 28px rgba(50,84,113,.08)}html[data-theme="wa2"] .mini:nth-child(3){border-color:#bcd3e5;background:linear-gradient(145deg,#fff,#edf5fb)}html[data-theme="wa2"] .deckTrack,html[data-theme="wa2"] .sideTrack{background:#dce8f1}html[data-theme="wa2"] .deckTrack>div,html[data-theme="wa2"] .masterTrack>div,html[data-theme="wa2"] .sideTrack>div{background:linear-gradient(90deg,#7aa7cc,#4f7ba3)}html[data-theme="wa2"] .choice,html[data-theme="wa2"] .secondary,html[data-theme="wa2"] .ghost,html[data-theme="wa2"] .round,html[data-theme="wa2"] .filter,html[data-theme="wa2"] .rate,html[data-theme="wa2"] .token,html[data-theme="wa2"] .codeKey{background:rgba(255,255,255,.9);border-color:#d8e5ee;color:var(--text)}html[data-theme="wa2"] .choice:hover,html[data-theme="wa2"] .secondary:hover,html[data-theme="wa2"] .ghost:hover{border-color:#b8d0e2;background:#f8fcff}html[data-theme="wa2"] textarea.editor,html[data-theme="wa2"] .codeBlock{box-shadow:inset 0 0 0 1px rgba(126,165,198,.12),0 10px 26px rgba(34,59,86,.09)}html[data-theme="wa2"] .runner{background:#f5f9fc;border-color:#d6e4ef;color:#566b7f}html[data-theme="wa2"] .utilityPopover,html[data-theme="wa2"] .installHelpCard{background:rgba(252,254,255,.98);border-color:#d5e3ee;box-shadow:0 18px 50px rgba(45,78,108,.14)}html[data-theme="wa2"] .mobileToolsPanel{background:linear-gradient(180deg,#eef5fa,#f8fafc 48%,#edf4f9);border-left-color:#d4e3ee;box-shadow:-18px 0 55px rgba(37,69,99,.16)}html[data-theme="wa2"] .mobileToolsStats>div,html[data-theme="wa2"] .mobileToolsGroup{background:rgba(255,255,255,.84);border-color:#d7e4ee;box-shadow:0 8px 24px rgba(50,83,112,.04)}html[data-theme="wa2"] .toolIcon{background:linear-gradient(145deg,#e6f1f9,#d7e7f3)!important;color:#4f7da5!important}html[data-theme="wa2"] .mobileBtn.active{background:#e3eef7;color:#4d789f}html[data-theme="wa2"] .personalNote textarea{background:rgba(255,255,255,.82);border-color:#d5e3ee}html[data-theme="wa2"] .callout{background:linear-gradient(135deg,#f3f8fc,#e9f3fa);border-color:#d2e3ef}html[data-theme="wa2"] .interviewHint{background:#e7f1f8;color:#365f82}html[data-theme="wa2"] .interviewPrompt{background:rgba(248,252,255,.82);border-color:#d5e4ef}html[data-theme="wa2"] .quickBadge{background:#e3eef7;color:#4d789f}html[data-theme="wa2"] .cardFooter{background:linear-gradient(to bottom,rgba(252,254,255,.78),rgba(252,254,255,.96) 24%)}html[data-theme="wa2"] ::selection{background:#bdd8eb;color:#18314a}
@media(max-width:820px){.themeToolsGroup .themeChoices{margin:6px 0 8px}.themeToolsGroup .themeChoice{padding:8px 6px}.themeToolsGroup .themeChoice b{font-size:10px}.themeToolsGroup .themeChoice small{font-size:8.5px}}
`;
document.head.appendChild(css);
window.HOT100_THEME={set:apply,get:()=>valid(document.documentElement.dataset.theme||saved()),themes:THEMES,mountMobile,mountDesktop};
apply(saved(),{save:false});mountDesktop();mountMobile();
const obs=new MutationObserver(()=>{mountDesktop();mountMobile();bind(document)});obs.observe(document.body,{childList:true,subtree:true});
})();