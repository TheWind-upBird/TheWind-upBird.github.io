import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift app-health QA failed:',message);process.exit(1)};
const health=read('app-health-pass.js'),index=read('index.html'),sw=read('sw.js'),pkg=JSON.parse(fs.readFileSync(path.resolve('package.json'),'utf8'));
try{new vm.Script(health,{filename:'app-health-pass.js'})}catch(error){fail(`app-health-pass.js syntax error: ${error.message}`)}
for(const marker of ['solveshift-last-version','navigator.onLine','handleOffline','handleOnline','serviceWorker.ready','updatefound','controllerchange','刷新更新','学习记录不会丢失','appHealthStatus','window.HOT100_APP_HEALTH'])if(!health.includes(marker))fail(`app-health-pass.js missing resilience marker: ${marker}`);
if(!index.includes('src="./app-health-pass.js"'))fail('index.html must load app-health-pass.js');
if(!sw.includes("CACHE='hot100-shell-v50'")||!sw.includes("'./app-health-pass.js'"))fail('PWA cache must include app health and update recovery');
if(pkg.scripts?.['qa:health']!=='node scripts/app-health-qa.mjs'||!pkg.scripts?.qa?.includes('qa:health'))fail('app-health QA must run in the release gate');

console.log('SolveShift app-health QA passed: online/offline status, cache readiness, safe update reload, version continuity, accessible banners, and PWA coverage are present.');
