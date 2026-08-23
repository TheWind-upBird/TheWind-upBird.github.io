import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=msg=>{console.error('Hot100 scaffold QA failed:',msg);process.exit(1)};
const ok=(cond,msg)=>{if(!cond)fail(msg)};

const state={completedCards:{},solved:{},attempts:{},reviewQueue:[],currentProblem:0};
const context={window:{},state,console,Date,Math,JSON,Set,Map};
context.doneCards=slug=>state.completedCards[slug]||[];
vm.createContext(context);

for(const file of ['curriculum-1.js','curriculum-2.js','curriculum-3.js','curriculum-4.js','curriculum-5.js','curriculum-6.js']){
  vm.runInContext(read(file),context,{filename:file});
}
vm.runInContext(read('product-catalog.js'),context,{filename:'product-catalog.js'});
vm.runInContext(read('learning-policy.js'),context,{filename:'learning-policy.js'});

const list=context.window.HOT100_CURRICULUM||[];
const catalog=context.window.HOT100_PRODUCT_CATALOG;
const policy=context.window.HOT100_LEARNING_POLICY;
const problem=slug=>list.find(p=>p.slug===slug);
const reset=()=>{state.completedCards={};state.solved={};state.attempts={};state.reviewQueue=[]};
const expose=slug=>{state.completedCards[slug]=['intuition','syntax','translate','meaning']};
const assertEight=(plan,label)=>ok(plan.cards.length===8&&plan.cards.join(',')==='intuition,syntax,translate,meaning,fill,trace,full,recall',`${label} must keep all eight cards`);

ok(list.length===100,`expected 100 curriculum problems, got ${list.length}`);
ok(catalog.roleFor(problem('two-sum'))==='anchor','two-sum must remain the hash-map anchor');
ok(catalog.roleFor(problem('group-anagrams'))==='transfer','group-anagrams must remain a transfer problem');
ok(catalog.roleFor(problem('trapping-rain-water'))==='interview','trapping-rain-water must remain an interview problem');
ok(catalog.roleFor(problem('minimum-window-substring'))==='interview','minimum-window-substring must remain an interview problem');

reset();
let plan=policy.scaffoldPlan(problem('two-sum'));
assertEight(plan,'Two Sum');
ok(plan.stage==='learn'&&plan.support==='full','Two Sum should start with full support');

reset();
plan=policy.scaffoldPlan(problem('group-anagrams'));
assertEight(plan,'Transfer without foundation');
ok(plan.stage==='learn'&&plan.support==='full','Transfer without foundation should keep full support');
expose('two-sum');
plan=policy.scaffoldPlan(problem('group-anagrams'));
assertEight(plan,'First transfer');
ok(plan.stage==='practice'&&plan.support==='guided','First transfer should change support, not remove cards');
expose('group-anagrams');
plan=policy.scaffoldPlan(problem('longest-consecutive-sequence'));
assertEight(plan,'Repeated transfer');
ok(plan.stage==='practice'&&plan.support==='light','Repeated transfer should use lighter support while keeping all cards');

reset();
plan=policy.scaffoldPlan(problem('minimum-window-substring'));
assertEight(plan,'Direct-entry interview');
ok(plan.stage==='learn'&&plan.support==='full','Direct-entry interview should fall back to full support');
expose('longest-substring-without-repeating-characters');
plan=policy.scaffoldPlan(problem('minimum-window-substring'));
assertEight(plan,'Interview with one exposure');
ok(plan.stage==='practice'&&plan.support==='guided','Interview with one exposure should keep guided support');
expose('find-all-anagrams-in-a-string');
plan=policy.scaffoldPlan(problem('minimum-window-substring'));
assertEight(plan,'Interview-ready');
ok(plan.stage==='prove'&&plan.support==='challenge','Interview-ready should become challenge-first without deleting cards');

reset();
state.completedCards['two-sum']=['intuition'];
plan=policy.scaffoldPlan(problem('group-anagrams'));
assertEight(plan,'Shallow click');
ok(plan.stage==='learn'&&plan.support==='full','One clicked card must not count as meaningful pattern exposure');

ok(policy.principle==='keep-all-eight-cards','policy must explicitly preserve all eight cards');
console.log('Hot100 scaffold QA passed: every stage keeps all eight cards; only support level changes from full → guided → light/challenge.');