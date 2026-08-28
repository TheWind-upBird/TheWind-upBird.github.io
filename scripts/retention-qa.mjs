import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift retention QA failed:',message);process.exit(1)};
const retention=read('retention-pass.js'),analytics=read('analytics-pass.js'),utility=read('utility-pass.js'),index=read('index.html'),sw=read('sw.js'),pkg=JSON.parse(fs.readFileSync(path.resolve('package.json'),'utf8'));
for(const [file,source] of [['retention-pass.js',retention],['analytics-pass.js',analytics],['utility-pass.js',utility],['sw.js',sw]])try{new vm.Script(source,{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}
for(const marker of ['recoveryPending','returnGap','dayDistance','weeklySummary','activeDays','firstRecoveryTask','开始恢复学习','查看本周回顾','不上传代码和笔记','window.HOT100_RETENTION'])if(!retention.includes(marker))fail(`retention-pass.js missing product marker: ${marker}`);
for(const event of ['recovery_start','weekly_report_open'])if(!analytics.includes(`'${event}'`))fail(`analytics allowlist missing ${event}`);
if(!utility.includes("'productRetention'")||!utility.includes('openDays')||!utility.includes('recoveryPending'))fail('backup import/export must preserve bounded retention state');
if(!index.includes('src="./retention-pass.js"'))fail('index.html must load retention-pass.js');
if(!sw.includes("CACHE='hot100-shell-v50'")||!sw.includes("'./retention-pass.js'"))fail('PWA cache must include the retention release');
if(pkg.scripts?.['qa:retention']!=='node scripts/retention-qa.mjs'||!pkg.scripts?.qa?.includes('qa:retention'))fail('retention QA must run in the release gate');

console.log('SolveShift retention QA passed: return recovery, weekly evidence, privacy copy, bounded backup state, and PWA release coverage are present.');
