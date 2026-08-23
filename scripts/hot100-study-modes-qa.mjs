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
const index=read('index.html');
const sw=read('sw.js');
for(const [name,src] of [['product-catalog.js',catalog],['learning-policy.js',policy],['study-modes.js',modes]]){
  try{new vm.Script(src,{filename:name})}catch(err){fail(`${name} syntax error: ${err.message}`)}
}

ok(!catalog.includes('ROLE_OVERRIDES'),'problems must not be assigned fixed Anchor/Transfer/Interview roles');
ok(!catalog.includes("roles:['anchor','transfer','interview']"),'catalog must not expose fixed problem roles');
ok(policy.includes("principle:'user-controlled-modes'"),'learning policy must be user-controlled');
ok(policy.includes("const FULL=['intuition','syntax','translate','meaning','fill','trace','full','recall']"),'all eight teaching cards must remain canonical');
ok(!policy.includes("cards:PROVE")&&!policy.includes("cards:LIGHT")&&!policy.includes("cards:GUIDED"),'learning policy must not prune cards');
for(const marker of ["learn:{zh:'学习'","practice:{zh:'刷题'","interview:{zh:'面试'","bySlug","learnPositions","fullCardIndex","activeInterview","user-controlled-per-problem"])ok(modes.includes(marker),`study-modes.js missing marker: ${marker}`);
ok(!modes.includes('MutationObserver'),'study modes must remain event-driven');
ok(index.includes('src="./study-modes.js"'),'study-modes.js must load statically');
ok(index.indexOf('src="./study-modes.js"')>index.indexOf('src="./product-shell.js"'),'study-modes.js must load after product shell');
ok(sw.includes("CACHE='hot100-shell-v22'"),'service worker cache version must be v22');
ok(sw.includes("'./study-modes.js'"),'service worker must cache study-modes.js');

console.log('Hot100 study modes QA passed: problems have no fixed roles, all eight teaching cards remain available, and Learn/Practice/Interview are user-controlled per problem.');