import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=msg=>{console.error('Hot100 study modes QA failed:',msg);process.exit(1)};
const ok=(cond,msg)=>{if(!cond)fail(msg)};

const catalog=read('product-catalog.js');
const policy=read('learning-policy.js');
const modes=read('study-modes.js');
const library=read('product-library.js');
const index=read('index.html');
const sw=read('sw.js');
for(const [name,src] of [['product-catalog.js',catalog],['learning-policy.js',policy],['study-modes.js',modes],['product-library.js',library]]){
  try{new vm.Script(src,{filename:name})}catch(err){fail(`${name} syntax error: ${err.message}`)}
}

ok(!catalog.includes('ROLE_OVERRIDES'),'problems must not be assigned fixed Anchor/Transfer/Interview roles');
ok(!catalog.includes("roles:['anchor','transfer','interview']"),'catalog must not expose fixed problem roles');
ok(policy.includes("principle:'user-controlled-modes'"),'learning policy must be user-controlled');
ok(policy.includes("const FULL=['intuition','syntax','translate','meaning','fill','trace','full','recall']"),'all eight teaching cards must remain canonical');
ok(!policy.includes("cards:PROVE")&&!policy.includes("cards:LIGHT")&&!policy.includes("cards:GUIDED"),'learning policy must not prune cards');
for(const marker of ['problemWeakness','weakPatterns','due-review','continue-progress','weak-pattern'])ok(policy.includes(marker),`learning-policy.js missing Today recommendation marker: ${marker}`);
for(const marker of ["learn:{zh:'学习'","practice:{zh:'刷题'","interview:{zh:'面试'","bySlug","learnPositions","fullCardIndex","openInMode","activeInterview","user-controlled-per-problem"])ok(modes.includes(marker),`study-modes.js missing marker: ${marker}`);
for(const marker of ['productLibrarySummary','libraryPatternGroup','libraryPatternChips','libraryModeDock','todayTaskWrap','pattern-first-mode-at-entry'])ok(library.includes(marker),`product-library.js missing marker: ${marker}`);
ok(!modes.includes('MutationObserver')&&!library.includes('MutationObserver'),'mode and library layers must remain event-driven');
ok(index.includes('src="./study-modes.js"'),'study-modes.js must load statically');
ok(index.includes('src="./product-library.js"'),'product-library.js must load statically');
ok(index.indexOf('src="./study-modes.js"')>index.indexOf('src="./product-shell.js"'),'study-modes.js must load after product shell');
ok(index.indexOf('src="./product-library.js"')>index.indexOf('src="./study-modes.js"'),'product-library.js must load after study modes');
ok(!index.includes('随着熟练度提高，提示会逐渐减少'),'static UI must not promise automatic prompt fading');
ok(sw.includes("CACHE='hot100-shell-v23'"),'service worker cache version must be v23');
ok(sw.includes("'./study-modes.js'")&&sw.includes("'./product-library.js'"),'service worker must cache study modes and pattern library');

console.log('Hot100 study modes QA passed: problems are grouped by Pattern, every entry can choose Learn/Practice/Interview, Today mixes review/progress/weakness, and all eight teaching cards remain available.');