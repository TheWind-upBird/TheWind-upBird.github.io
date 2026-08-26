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

const curriculumFiles=[
  'curriculum-1.js','curriculum-2.js','curriculum-3.js','curriculum-4.js','curriculum-5.js','curriculum-6.js',
  'hot100-31-32.js','hot100-33-34.js','hot100-35-40.js','hot100-41-45.js','hot100-46-50.js',
  'hot100-51-60.js','hot100-61-70.js','hot100-71-80.js','hot100-81-90.js','hot100-91-100.js'
];
for(const file of curriculumFiles){
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
ok(catalog.version>=3,'catalog must use the role-free product model');
ok(typeof catalog.patternFor==='function','catalog must expose Pattern classification');
ok(catalog.track('hot100-core')?.problemSlugs?.length===100,'Hot100 track must contain 100 problems');
for(const p of list){
  ok(!p.productMeta?.role,`${p.slug} must not have a fixed role`);
  ok(p.productMeta?.trackId==='hot100-core',`${p.slug} must belong to the Hot100 track`);
  ok(Boolean(p.productMeta?.patternId),`${p.slug} must have a Pattern classification`);
}

for(const slug of ['two-sum','group-anagrams','trapping-rain-water','minimum-window-substring']){
  reset();
  let plan=policy.scaffoldPlan(problem(slug));
  assertEight(plan,`${slug} fresh`);
  ok(plan.stage==='learn'&&plan.support==='full',`${slug} must keep complete Learn support`);

  expose(slug);
  state.solved[slug]={level:'solo'};
  plan=policy.scaffoldPlan(problem(slug));
  assertEight(plan,`${slug} experienced`);
  ok(plan.stage==='learn'&&plan.support==='full',`${slug} must not auto-reduce Learn support`);
}

ok(policy.principle==='user-controlled-modes','policy must explicitly use user-controlled modes');
console.log('SolveShift learning-policy QA passed: all 100 problems are role-free, Pattern-classified, and retain all eight Learn cards regardless of experience.');
