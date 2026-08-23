import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=msg=>{console.error('Hot100 adaptive/PWA QA failed:',msg);process.exit(1)};

const index=read('index.html');
const adaptive=read('adaptive-mode-pass.js');
const compat=read('adaptive-compat-pass.js');
const install=read('mobile-install-fix.js');
const drawer=read('mobile-tools-drawer.js');
const theme=read('theme-pass.js');
const wa2=read('wa2-design-pass.js');
const polish=read('wa2-polish-pass.js');
const motion=read('wa2-motion-pass.js');
const ui=read('ui-polish-pass.js');
const catalog=read('product-catalog.js');
const profile=read('product-profile.js');
const policy=read('learning-policy.js');
const shell=read('product-shell.js');
const engineUi=read('engine-ui.js');
const scene=read('wa2-winter-scene.svg');
const sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const icon=read('icon.svg');

for(const [name,src] of [
  ['mobile-install-fix.js',install],['mobile-tools-drawer.js',drawer],['theme-pass.js',theme],['wa2-design-pass.js',wa2],['wa2-polish-pass.js',polish],['wa2-motion-pass.js',motion],['ui-polish-pass.js',ui],
  ['product-catalog.js',catalog],['product-profile.js',profile],['learning-policy.js',policy],['product-shell.js',shell],['engine-ui.js',engineUi],['sw.js',sw]
]){
  try{new vm.Script(src,{filename:name})}catch(err){fail(`${name} syntax error: ${err.message}`)}
}

for(const file of ['adaptive-mode-pass.js','adaptive-compat-pass.js','practice-snapshot-pass.js','utility-pass.js','mobile-install-fix.js','theme-pass.js','wa2-design-pass.js','wa2-polish-pass.js','mobile-tools-drawer.js','wa2-motion-pass.js','ui-polish-pass.js','product-catalog.js','product-profile.js','learning-policy.js','product-shell.js']){
  if(!index.includes(`src="./${file}"`))fail(`${file} must be loaded statically by index.html`);
}
if(index.includes('src="./scaffold-runtime.js"'))fail('card-pruning scaffold runtime must not be loaded');
if(!index.includes('id="mobileToolsBtn"'))fail('index.html must contain the permanent hamburger tools button');
if(index.includes('id="resumeBtn"'))fail('redundant resume button must not exist in the top bar');
if(!index.includes('.topbar .utilityMenu,.topbar #resetBtn,.topbar #mobileInstallBtn{display:none!important}'))fail('index.html must hide legacy desktop data/reset/install controls before JS runs');
if(!index.includes("localStorage.getItem('hot100-wa2-motion-v1')")||!index.includes('dataset.wa2MotionPref'))fail('index.html must restore WA2 motion preference before first paint');
if(!index.includes('html[data-theme="wa2"] body{background:linear-gradient'))fail('WA2 first paint must use a snow-free base background');
if(!index.includes('html[data-theme="wa2"][data-wa2-motion-pref="off"] #wa2FallingSnow'))fail('WA2 off state must be enforced in first-paint CSS');
if(index.includes('Hot100 100 道题全部使用同一套 8 步学习流程'))fail('internal fixed-step product copy must not be shown to users');
if(install.includes("s.src='./mobile-tools-drawer.js'")||install.includes("s.src='./theme-pass.js'"))fail('install helper must not dynamically bootstrap the UI stack');

for(const marker of ['独立练习','weaknessScore','10 分钟','20 分钟','serviceWorker.register'])if(!adaptive.includes(marker))fail(`adaptive-mode-pass.js missing marker: ${marker}`);
for(const marker of ['refinedWeakness','refinedQuickPlan','task.end','apple-touch-icon'])if(!compat.includes(marker))fail(`adaptive-compat-pass.js missing refinement marker: ${marker}`);
for(const marker of ['mobileToolsDrawer','导出学习数据','导入学习数据','mobileSnapshotSlot','添加到主屏幕','重置全部进度','工具与设置','hot100toolsready'])if(!drawer.includes(marker))fail(`mobile-tools-drawer.js missing marker: ${marker}`);
if(!drawer.includes('.topbar .utilityMenu,.topbar #resetBtn,.topbar #mobileInstallBtn{display:none!important}'))fail('legacy utility controls must stay behind the shared drawer');
for(const marker of ['白天','黑夜','白色相簿2','hot100-theme-v1','data-hot100-theme','state.attempts.__ui.theme','theme-color'])if(!theme.includes(marker))fail(`theme-pass.js missing marker: ${marker}`);
for(const selector of ['html[data-theme="dark"]','html[data-theme="wa2"]'])if(!theme.includes(selector))fail(`theme-pass.js missing selector: ${selector}`);
for(const marker of ['WHITE ALBUM 2','WINTER STUDY EDITION','wa2AlbumArt','wa2TrackRow','wa2KnowledgeCard','wa2SnowField','prefers-reduced-motion'])if(!wa2.includes(marker))fail(`wa2-design-pass.js missing visual marker: ${marker}`);
if(wa2.includes("#page-home>.title:after{content:'WHITE ALBUM 2 · HOT100'"))fail('obsolete WA2 title pseudo-label must be removed from wa2-design-pass.js at source');
for(const marker of ['wa2StatusStrip','wa2-winter-scene.svg','WINTER LOG','NOW PLAYING','TRACK LIST','wa2CornerRail','--wa2-serif','wa2FallingSnow','wa2VisibleFall','wa2MoonSweep'])if(!polish.includes(marker))fail(`wa2-polish-pass.js missing polish marker: ${marker}`);
for(const marker of ['hot100-wa2-motion-v1','白二动态效果','wa2MotionControl','prefers-reduced-motion','wa2MotionLight','hideAllEffects','data-wa2-motion-pref','currentPref'])if(!motion.includes(marker))fail(`wa2-motion-pass.js missing motion marker: ${marker}`);
for(const marker of ['removeWa2TitleAfterRule','你为什么这么熟练啊','content:none!important'])if(!ui.includes(marker))fail(`ui-polish-pass.js missing UI cleanup marker: ${marker}`);
if(!motion.includes('.animate(['))fail('wa2-motion-pass.js must use Web Animations API for reliable snowfall');
if(!motion.includes('#wa2FallingSnow')||!motion.includes('.wa2SnowField')||!motion.includes('.wa2AlbumArt:after'))fail('WA2 off state must hide falling snow, background snow, and moonlight');
if(!motion.includes("if(v==='off')hideAllEffects()"))fail('WA2 off click must hide effects immediately without storage round-trip');
if(!scene.includes('<svg')||!scene.includes('viewBox="0 0 900 600"'))fail('WA2 winter scene SVG is invalid');

for(const marker of ['hot100-core','patternId','roleFor','anchor','transfer','interview','PILOT_PATTERNS','group-anagrams','trapping-rain-water','minimum-window-substring'])if(!catalog.includes(marker))fail(`product-catalog.js missing product-model marker: ${marker}`);
for(const marker of ['hot100-product-profile-v1','locale','codingLanguage','dailyMinutes','onboardingComplete','zh-CN','en-US'])if(!profile.includes(marker))fail(`product-profile.js missing learner-profile marker: ${marker}`);
for(const marker of ['scaffoldPlan','masteryEvidence','todayPlan','support','guided','light','challenge','keep-all-eight-cards'])if(!policy.includes(marker))fail(`learning-policy.js missing adaptive-support marker: ${marker}`);
if(!policy.includes("const FULL=['intuition','syntax','translate','meaning','fill','trace','full','recall']"))fail('learning policy must preserve the canonical eight-card sequence');
for(const marker of ['cards.length||CARD_COUNT','activeDone','p.slug===\'two-sum\''])if(!engineUi.includes(marker))fail(`engine-ui.js missing variable-card compatibility marker: ${marker}`);
for(const marker of ['productTodayPlan','productOnboarding','学习设置','Build a path that fits you','hot100toolsready','event-driven'])if(!shell.includes(marker))fail(`product-shell.js missing product-shell marker: ${marker}`);
if(shell.includes('MutationObserver'))fail('product-shell.js must remain event-driven; global DOM observers caused severe UI lockups');

if(manifest.display!=='standalone')fail('manifest display must be standalone');
if(!manifest.start_url||!manifest.scope)fail('manifest needs start_url and scope');
if(!Array.isArray(manifest.icons)||manifest.icons.length<2)fail('manifest needs regular and maskable icons');
if(!manifest.icons.some(x=>String(x.purpose||'').includes('maskable')))fail('manifest needs a maskable icon');
if(!icon.includes('<svg')||!icon.includes('viewBox="0 0 512 512"'))fail('icon.svg is invalid');

const localScripts=[...index.matchAll(/<script\s+src="\.\/([^"]+\.js)"/g)].map(m=>`./${m[1]}`);
const requiredCache=[...new Set([...localScripts,'./wa2-winter-scene.svg'])];
const missingFromCache=requiredCache.filter(src=>!sw.includes(`'${src}'`)&&!sw.includes(`"${src}"`));
if(missingFromCache.length)fail(`service worker cache is missing: ${missingFromCache.join(', ')}`);
for(const core of ['./index.html','./style.css','./manifest.webmanifest','./icon.svg','./icon-192.svg','./icon-512.svg'])if(!sw.includes(core))fail(`service worker cache is missing core asset ${core}`);
if(!sw.includes("CACHE='hot100-shell-v21'"))fail('service worker cache version must be v21');
if(!sw.includes('if(sameOrigin)')||!sw.includes('fetch(req).then'))fail('same-origin assets must use network-first refresh behavior');

console.log(`Adaptive/PWA QA passed: ${requiredCache.length} assets covered; all eight teaching cards are preserved, adaptive support remains event-driven, and network-first updates remain enabled.`);