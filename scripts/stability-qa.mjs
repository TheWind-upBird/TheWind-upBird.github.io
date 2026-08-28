import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift stability QA failed:',message);process.exit(1)};
const sources={engine:read('engine-state.js'),worker:read('python-worker.js'),utility:read('utility-pass.js'),practice:read('practice-snapshot-pass.js'),interview:read('adaptive-mode-pass.js'),sw:read('sw.js'),accessibility:read('accessibility-pass.js'),index:read('index.html')};
for(const [name,source] of Object.entries(sources))if(name!=='index')try{new vm.Script(source,{filename:`${name}.js`})}catch(error){fail(`${name} syntax error: ${error.message}`)}

for(const marker of ['MAX_STATE_CHARS=4*1024*1024','function persistSoon','solveshiftstorageerror','return false','pagehide'])if(!sources.engine.includes(marker))fail(`safe persistence missing marker: ${marker}`);
for(const marker of ['MAX_IMPORT_BYTES=5*1024*1024','file.size>MAX_IMPORT_BYTES','plainObject','boundedString','const previous=state','state=previous','MAX_NOTE_CHARS','未保存 · 请导出备份'])if(!sources.utility.includes(marker))fail(`backup/storage guard missing marker: ${marker}`);
for(const marker of ['SNAP_LIMIT=3','VERSION_CHAR_BUDGET=250000','n*m>750000','reportStorageError(finalError)'])if(!sources.practice.includes(marker))fail(`history/diff guard missing marker: ${marker}`);
if(!sources.interview.includes('passed=results.length>0&&count===results.length'))fail('Interview must reject an empty test result set');
for(const marker of ['cache.addAll(SHELL)',"req.mode==='navigate'",'Response.error()'])if(!sources.sw.includes(marker))fail(`service worker safety missing marker: ${marker}`);
if(sources.sw.includes('Promise.allSettled'))fail('critical shell installation must fail atomically');
if(sources.sw.includes("hit||caches.match('./index.html')"))fail('non-navigation assets must never fall back to HTML');
for(const marker of ['applyProblemIdentity','路线第','LeetCode'])if(!sources.accessibility.includes(marker)&&!sources.index.includes(marker))fail(`problem identity missing marker: ${marker}`);

console.log('SolveShift stability QA passed: storage/import limits, empty-result judging, bounded histories/diffs, atomic offline caching, and route/LeetCode identity are covered.');
