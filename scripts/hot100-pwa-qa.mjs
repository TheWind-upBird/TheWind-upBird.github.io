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
const sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const icon=read('icon.svg');

for(const [name,src] of [['mobile-install-fix.js',install],['mobile-tools-drawer.js',drawer],['sw.js',sw]]){
  try{new vm.Script(src,{filename:name})}catch(err){fail(`${name} syntax error: ${err.message}`)}
}

for(const file of ['adaptive-mode-pass.js','adaptive-compat-pass.js','practice-snapshot-pass.js','utility-pass.js','mobile-install-fix.js']){
  if(!index.includes(`src="./${file}"`))fail(`${file} is not loaded by index.html`);
}
if(!install.includes("s.src='./mobile-tools-drawer.js'"))fail('mobile-install-fix.js must load mobile-tools-drawer.js');

for(const marker of ['独立练习','weaknessScore','10 分钟','20 分钟','serviceWorker.register']){
  if(!adaptive.includes(marker))fail(`adaptive-mode-pass.js missing marker: ${marker}`);
}
for(const marker of ['refinedWeakness','refinedQuickPlan','task.end','apple-touch-icon']){
  if(!compat.includes(marker))fail(`adaptive-compat-pass.js missing refinement marker: ${marker}`);
}
for(const marker of ['mobileToolsDrawer','导出学习数据','导入学习数据','mobileSnapshotSlot','添加到主屏幕','重置全部进度']){
  if(!drawer.includes(marker))fail(`mobile-tools-drawer.js missing marker: ${marker}`);
}

if(manifest.display!=='standalone')fail('manifest display must be standalone');
if(!manifest.start_url||!manifest.scope)fail('manifest needs start_url and scope');
if(!Array.isArray(manifest.icons)||manifest.icons.length<2)fail('manifest needs regular and maskable icons');
if(!manifest.icons.some(x=>String(x.purpose||'').includes('maskable')))fail('manifest needs a maskable icon');
if(!icon.includes('<svg')||!icon.includes('viewBox="0 0 512 512"'))fail('icon.svg is invalid');

const localScripts=[...index.matchAll(/<script\s+src="\.\/([^"]+\.js)"/g)].map(m=>`./${m[1]}`);
const requiredCache=[...localScripts,'./mobile-tools-drawer.js'];
const missingFromCache=requiredCache.filter(src=>!sw.includes(`'${src}'`)&&!sw.includes(`"${src}"`));
if(missingFromCache.length)fail(`service worker cache is missing: ${missingFromCache.join(', ')}`);
for(const core of ['./index.html','./style.css','./manifest.webmanifest','./icon.svg','./icon-192.svg','./icon-512.svg']){
  if(!sw.includes(core))fail(`service worker cache is missing core asset ${core}`);
}
if(!sw.includes("CACHE='hot100-shell-v5'"))fail('service worker cache version must be v5');

console.log(`Adaptive/PWA QA passed: ${requiredCache.length} local JS assets are covered; mobile tools drawer included.`);
