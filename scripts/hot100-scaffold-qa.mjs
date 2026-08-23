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
const ids=plan=>plan.cards.join(',');
const reset=()=>{state.completedCards={};state.solved={};state.attempts={};state.reviewQueue=[]};
const expose=slug=>{state.completedCards[slug]=['intuition','syntax','translate','meaning']};

ok(list.length===100,`expected 100 curriculum problems, got ${list.length}`);
ok(catalog.roleFor(problem('two-sum'))==='anchor','two-sum must remain the hash-map anchor');
ok(catalog.roleFor(problem('group-anagrams'))==='transfer','group-anagrams must be a transfer problem');
ok(catalog.roleFor(problem('trapping-rain-water'))==='interview','trapping-rain-water must be an interview problem');
ok(catalog.roleFor(problem('minimum-window-substring'))==='interview','minimum-window-substring must be an interview problem');

reset();
let plan=policy.scaffoldPlan(problem('two-sum'));
ok(plan.stage==='learn'&&plan.cards.length===8,`Two Sum must stay full: ${plan.stage} / ${ids(plan)}`);

reset();
plan=policy.scaffoldPlan(problem('group-anagrams'));
ok(plan.stage==='learn'&&plan.cards.length===8,'Transfer problem without foundation must fall back to full teaching');
expose('two-sum');
plan=policy.scaffoldPlan(problem('group-anagrams'));
ok(plan.stage==='practice'&&plan.cards.length===4,`First hash-map transfer should be 4 cards, got ${plan.cards.length}`);
expose('group-anagrams');
plan=policy.scaffoldPlan(problem('longest-consecutive-sequence'));
ok(plan.stage==='prove'&&plan.cards.length===2,`Repeated hash-map transfer should be 2 cards, got ${plan.cards.length}`);

reset();
plan=policy.scaffoldPlan(problem('minimum-window-substring'));
ok(plan.stage==='learn'&&plan.cards.length===8,'Direct-entry interview problem must not start in prove mode');
expose('longest-substring-without-repeating-characters');
plan=policy.scaffoldPlan(problem('minimum-window-substring'));
ok(plan.stage==='practice'&&plan.cards.length===4,'Interview problem with one meaningful exposure should keep light support');
expose('find-all-anagrams-in-a-string');
plan=policy.scaffoldPlan(problem('minimum-window-substring'));
ok(plan.stage==='prove'&&plan.cards.length===2,'Interview problem should enter prove mode after enough foundation');

reset();
state.completedCards['two-sum']=['intuition'];
plan=policy.scaffoldPlan(problem('group-anagrams'));
ok(plan.stage==='learn'&&plan.cards.length===8,'One clicked card must not count as meaningful pattern exposure');

console.log('Hot100 scaffold QA passed: pilot patterns fade 8 → 4 → 2, direct-entry interview fallback is safe, and shallow clicks do not reduce teaching.');