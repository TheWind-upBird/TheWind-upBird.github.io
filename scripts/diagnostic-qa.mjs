import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift diagnostic QA failed:',message);process.exit(1)};
const shell=read('product-shell.js'),profile=read('product-profile.js'),modes=read('study-modes.js'),analytics=read('analytics-pass.js');
for(const [file,source] of [['product-shell.js',shell],['product-profile.js',profile],['study-modes.js',modes],['analytics-pass.js',analytics]])try{new vm.Script(source,{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}

const questionsSource=shell.slice(shell.indexOf('const DIAGNOSTIC='),shell.indexOf('function locale'));
const policySource=shell.slice(shell.indexOf('function diagnosticBand'),shell.indexOf('function diagnosticQuestionMarkup'));
if(!questionsSource.startsWith('const DIAGNOSTIC=')||!policySource.startsWith('function diagnosticBand'))fail('could not isolate diagnostic policy');
const context={};
vm.createContext(context);
new vm.Script(`${questionsSource}\n${policySource}\nglobalThis.questions=DIAGNOSTIC;globalThis.classify=diagnosticBand;globalThis.selfBand=selfReportedBand;`).runInContext(context);
if(context.questions.length!==3)fail('diagnostic must remain a short three-question check');
const correct=Object.fromEntries(context.questions.map(question=>[question.id,question.correct]));
const implementation={...correct,code:'reverse'};
const foundation={...correct,strategy:'nested'};
if(context.classify(correct).band!=='practice-ready'||context.classify(correct).score!==3)fail('all-correct result must recommend Practice');
if(context.classify(implementation).band!=='implementation')fail('correct strategy with a code gap must recommend code scaffolding');
if(context.classify(foundation).band!=='foundation')fail('a strategy gap must recommend the intuition foundation');
if(context.selfBand('beginner')!=='foundation'||context.selfBand('developing')!=='implementation'||context.selfBand('interview')!=='practice-ready')fail('skipped diagnostic must map all self-rating levels');

for(const marker of ['diagnosticVersion','diagnosticBand','diagnosticScore','diagnosticSkipped','diagnosticCompletedAt'])if(!profile.includes(marker))fail(`profile missing diagnostic field: ${marker}`);
for(const marker of ['openLearnAt','cardIndexById'])if(!modes.includes(marker))fail(`study modes missing starting-point support: ${marker}`);
if(!shell.includes("Modes.openLearnAt(task.index,'fill')"))fail('implementation band must enter the code-completion card');
if(!shell.includes("profile.diagnosticBand==='practice-ready'?'practice'"))fail('practice-ready diagnostic must personalize new Today tasks');
for(const marker of ["'diagnostic_start'","'diagnostic_complete'",'band','score','skipped'])if(!analytics.includes(marker))fail(`analytics missing privacy-safe diagnostic marker: ${marker}`);
for(const marker of ['diagnosticSkip','diagnosticRetry','diagnosticEnter','aria-pressed','不会只靠这一次诊断'])if(!shell.includes(marker))fail(`onboarding missing diagnostic UX marker: ${marker}`);
if(!shell.includes("[result.band][isEn?'en':'zh']"))fail('diagnostic result copy must select the active locale');
if(!shell.includes("document.readyState!=='complete'")||!shell.includes("document.addEventListener('DOMContentLoaded',mountFirstRun,{once:true})")||shell.includes('openOnboarding(true)},450'))fail('first-run onboarding must wait through deferred product layers without an arbitrary delayed page flash');

console.log('SolveShift diagnostic QA passed: the short, skippable check maps strategy and implementation evidence to an explainable starting point.');
