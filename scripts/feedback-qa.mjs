import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift feedback QA failed:',message);process.exit(1)};
const feedback=read('feedback-pass.js'),analytics=read('analytics-pass.js'),index=read('index.html'),sw=read('sw.js'),pkg=JSON.parse(fs.readFileSync(path.resolve('package.json'),'utf8'));
for(const [file,source] of [['feedback-pass.js',feedback],['analytics-pass.js',analytics],['sw.js',sw]])try{new vm.Script(source,{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}
for(const marker of ["window.SOLVESHIFT_RELEASE?.version",'diagnosticReport','sessionErrors','feedbackText','feedbackSeverity','影响程度','阻塞任务','复现步骤、实际结果、期望结果','navigator.clipboard.writeText','openIssue','ISSUES_URL','问题反馈','不包含代码、笔记和测试输入','window.HOT100_FEEDBACK'])if(!feedback.includes(marker))fail(`feedback-pass.js missing beta-support marker: ${marker}`);
const diagnosticSource=feedback.slice(feedback.indexOf('function diagnosticReport'),feedback.indexOf('function feedbackText'));
for(const forbidden of ['state.codes','state.notes','editor','personalNote','test input'])if(diagnosticSource.includes(forbidden))fail(`diagnostic report must not access private learner content: ${forbidden}`);
for(const event of ['feedback_open','feedback_copy'])if(!analytics.includes(`'${event}'`))fail(`analytics allowlist missing ${event}`);
if(!index.includes('src="./feedback-pass.js"'))fail('index.html must load feedback-pass.js');
if(!sw.includes("CACHE='hot100-shell-v50'")||!sw.includes("'./feedback-pass.js'"))fail('PWA cache must include beta feedback support');
if(pkg.scripts?.['qa:feedback']!=='node scripts/feedback-qa.mjs'||!pkg.scripts?.qa?.includes('qa:feedback'))fail('feedback QA must run in the release gate');

console.log('SolveShift feedback QA passed: versioned feedback, privacy-safe diagnostics, clipboard fallback, GitHub handoff, analytics, and PWA coverage are present.');
