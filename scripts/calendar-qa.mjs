import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

process.env.TZ='Asia/Shanghai';
const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift calendar QA failed:',message);process.exit(1)};
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(read('calendar-utils.js'),sandbox,{filename:'calendar-utils.js'});
const Calendar=sandbox.window.HOT100_CALENDAR,earlyMorning=new Date('2026-08-24T18:30:00.000Z');
if(Calendar.dayKey(earlyMorning)!=='2026-08-25')fail('early-morning local date regressed to the previous UTC day');
if(Calendar.addDays(1,earlyMorning)!=='2026-08-26')fail('review date must advance by a local calendar day');
for(const file of ['engine-state.js','product-shell.js','product-library.js'])if(!read(file).includes('HOT100_CALENDAR'))fail(`${file} must use the shared local calendar`);
const modes=read('study-modes.js');
for(const marker of ['function enhanceReviewEntries()','data-review-mode','openInMode(index,\'practice\')'])if(!modes.includes(marker))fail(`study-modes.js missing review-loop marker: ${marker}`);
console.log('SolveShift calendar QA passed: Today and Review use the device-local date, and Review entries open in Practice mode.');
