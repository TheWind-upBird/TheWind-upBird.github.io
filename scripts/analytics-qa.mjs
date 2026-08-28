import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift analytics QA failed:',message);process.exit(1)};
const analytics=read('analytics-pass.js'),shell=read('product-shell.js'),modes=read('study-modes.js'),interview=read('adaptive-mode-pass.js'),utility=read('utility-pass.js'),index=read('index.html');
for(const [file,source] of [['analytics-pass.js',analytics],['product-shell.js',shell],['study-modes.js',modes],['adaptive-mode-pass.js',interview],['utility-pass.js',utility]])try{new vm.Script(source,{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}
for(const event of ['app_open','onboarding_start','diagnostic_start','diagnostic_complete','onboarding_complete','lesson_start','card_complete','code_run','code_pass','review_start','review_complete','interview_start','interview_pass'])if(!analytics.includes(`'${event}'`)&&!shell.includes(`'${event}'`)&&!modes.includes(`'${event}'`)&&!interview.includes(`'${event}'`))fail(`missing product event: ${event}`);
for(const marker of ['SCHEMA=1','LIMIT=600','safeProps','local-only-no-code','localTestSummary','observePracticeRun','state.reviewing'])if(!analytics.includes(marker))fail(`analytics-pass.js missing privacy/integrity marker: ${marker}`);
if(/\b(code|editorValue|sourceCode)\b/.test(analytics.match(/function safeProps[\s\S]*?return out}/)?.[0]||''))fail('analytics property sanitizer must not allow source code');
if(!utility.includes("'productEvents'")||!utility.includes("app:'SolveShift'")||!utility.includes('formatVersion:2'))fail('SolveShift backup must include local product events with the new format');
if(index.indexOf('src="./analytics-pass.js"')<index.indexOf('src="./engine-state.js"'))fail('analytics must load after state initialization');
console.log('SolveShift analytics QA passed: the versioned local event funnel excludes code content and is included in backups.');
