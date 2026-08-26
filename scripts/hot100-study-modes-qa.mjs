import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=msg=>{console.error('SolveShift study modes QA failed:',msg);process.exit(1)};
const ok=(cond,msg)=>{if(!cond)fail(msg)};

const catalog=read('product-catalog.js');
const policy=read('learning-policy.js');
const modes=read('study-modes.js');
const library=read('product-library.js');
const shell=read('product-shell.js');
const mastery=read('mastery-pass.js');
const index=read('index.html');
const sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
for(const [name,src] of [['product-catalog.js',catalog],['learning-policy.js',policy],['product-shell.js',shell],['study-modes.js',modes],['product-library.js',library],['mastery-pass.js',mastery]]){
  try{new vm.Script(src,{filename:name})}catch(err){fail(`${name} syntax error: ${err.message}`)}
}

ok(!catalog.includes('ROLE_OVERRIDES'),'problems must not be assigned fixed Anchor/Transfer/Interview roles');
ok(!catalog.includes("roles:['anchor','transfer','interview']"),'catalog must not expose fixed problem roles');
ok(policy.includes("principle:'user-controlled-modes'"),'learning policy must be user-controlled');
ok(policy.includes("const FULL=['intuition','syntax','translate','meaning','fill','trace','full','recall']"),'all eight teaching cards must remain canonical');
ok(!policy.includes("cards:PROVE")&&!policy.includes("cards:LIGHT")&&!policy.includes("cards:GUIDED"),'learning policy must not prune cards');
for(const marker of ['problemWeakness','weakPatterns','due-review','continue-progress','weak-pattern'])ok(policy.includes(marker),`learning-policy.js missing Today recommendation marker: ${marker}`);
for(const marker of ["learn:{zh:'学习'","practice:{zh:'刷题'","interview:{zh:'面试'","bySlug","learnPositions","fullCardIndex","openInMode","openLearnAt","activeInterview","user-controlled-per-problem"])ok(modes.includes(marker),`study-modes.js missing marker: ${marker}`);
for(const marker of ['productLibrarySummary','libraryPatternGroup','libraryPatternChips','libraryModeDock','todayTaskWrap','todayTaskReason','taskReason','pattern-first-mode-at-entry'])ok(library.includes(marker),`product-library.js missing marker: ${marker}`);
for(const marker of ["function taskMode(type)","type==='review'||type==='weak'||type==='practice'",'recommendedTaskMode','data-product-mode','Modes?.openInMode','function startFirstTask()','startRecommendedEntry(result.band)','taskMode,recommendedTaskMode,openTask,startFirstTask,mode'])ok(shell.includes(marker),`product-shell.js missing mode-aware Today marker: ${marker}`);
ok(!shell.includes('if(firstRun)Profile.update({onboardingComplete:true});close()'),'dismissing first-run onboarding must not falsely mark it complete');
ok(library.includes('button.dataset.productMode')&&library.includes('Modes.label(recommendedMode)'),'Today task must display its recommended entry mode');
for(const marker of ['RETAIN_GAP','已写出','已掌握','delayedPass','masteryReceipt','evidence-not-self-rating'])ok(mastery.includes(marker),`mastery-pass.js missing marker: ${marker}`);
ok(!modes.includes('MutationObserver')&&!library.includes('MutationObserver')&&!mastery.includes('MutationObserver'),'mode, library and mastery layers must remain event-driven');
ok(index.includes('src="./study-modes.js"'),'study-modes.js must load statically');
ok(index.includes('src="./product-library.js"'),'product-library.js must load statically');
ok(index.includes('src="./mastery-pass.js"'),'mastery-pass.js must load statically');
ok(index.includes('src="./wa2-art-fix.js"'),'explicit WA2 winter artwork loader must load statically');
ok(index.indexOf('src="./study-modes.js"')>index.indexOf('src="./product-shell.js"'),'study-modes.js must load after product shell');
ok(index.indexOf('src="./product-library.js"')>index.indexOf('src="./study-modes.js"'),'product-library.js must load after study modes');
ok(index.indexOf('src="./mastery-pass.js"')>index.indexOf('src="./product-library.js"'),'mastery-pass.js must load after product library');
ok(!index.includes('随着熟练度提高，提示会逐渐减少'),'static UI must not promise automatic prompt fading');
ok(index.includes('<title>SolveShift</title>')&&index.includes('<b>SolveShift</b>'),'visible app brand must be SolveShift');
ok(!index.includes('Hot100 Learning Lab')&&!index.includes('<b>Hot100 Lab</b>'),'legacy Hot100 app branding must not remain in visible shell');
ok(manifest.name==='SolveShift'&&manifest.short_name==='SolveShift','PWA manifest must use SolveShift brand');
ok(sw.includes("CACHE='hot100-shell-v45'"),'service worker cache version must be v45');
ok(sw.includes("'./study-modes.js'")&&sw.includes("'./product-library.js'")&&sw.includes("'./mastery-pass.js'")&&sw.includes("'./wa2-art-fix.js'"),'service worker must cache study modes, pattern library, mastery and WA2 artwork loader');

console.log('SolveShift study modes QA passed: user-controlled modes preserve all eight cards, mastery requires evidence beyond self-rating, and the product layers remain event-driven.');
