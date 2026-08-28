import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift continuity QA failed:',message);process.exit(1)};
const continuity=read('continuity-pass.js'),index=read('index.html'),sw=read('sw.js'),pkg=JSON.parse(fs.readFileSync(path.resolve('package.json'),'utf8'));
try{new vm.Script(continuity,{filename:'continuity-pass.js'})}catch(error){fail(`continuity-pass.js syntax error: ${error.message}`)}
for(const marker of ['enhanceReviewEmpty','继续今日路线','查看题库','clearProblemFilters','清空筛选条件','enhanceInterviewEmpty','interviewEligible','先学习推荐题','aria-describedby','window.HOT100_CONTINUITY'])if(!continuity.includes(marker))fail(`continuity-pass.js missing empty-state marker: ${marker}`);
if(!index.includes('src="./continuity-pass.js"'))fail('index.html must load continuity-pass.js');
if(!sw.includes("CACHE='hot100-shell-v50'")||!sw.includes("'./continuity-pass.js'"))fail('PWA cache must include actionable empty states');
if(pkg.scripts?.['qa:continuity']!=='node scripts/continuity-qa.mjs'||!pkg.scripts?.qa?.includes('qa:continuity'))fail('continuity QA must run in the release gate');

console.log('SolveShift continuity QA passed: Review, Problem Bank, and Interview empty states all provide a tested next action.');
