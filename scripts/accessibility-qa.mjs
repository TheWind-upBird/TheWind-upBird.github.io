import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift accessibility QA failed:',message);process.exit(1)};
const index=read('index.html'),style=read('style.css'),utility=read('utility-pass.js'),accessibility=read('accessibility-pass.js'),shell=read('product-shell.js'),drawer=read('mobile-tools-drawer.js'),retention=read('retention-pass.js'),feedback=read('feedback-pass.js');
for(const [file,source] of [['utility-pass.js',utility],['accessibility-pass.js',accessibility],['product-shell.js',shell],['mobile-tools-drawer.js',drawer],['retention-pass.js',retention],['feedback-pass.js',feedback]])try{new vm.Script(source,{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}
for(const marker of ['lang="zh-CN"','aria-label="主要导航"','aria-label="重置学习进度"','aria-label="返回今天"'])if(!index.includes(marker))fail(`index.html missing accessibility marker: ${marker}`);
if(!style.includes(':focus-visible'))fail('keyboard focus must remain visibly indicated');
for(const marker of ["setAttribute('aria-label'","setAttribute('role','status')","setAttribute('aria-live','polite')","setAttribute('aria-describedby','output')"])if(!utility.includes(marker))fail(`practice editor missing accessibility marker: ${marker}`);
for(const marker of ['interviewEditor','interviewOutput',"setAttribute('role','status')","setAttribute('aria-describedby','interviewOutput')",'keyboard-focus-modal-containment-and-live-regions'])if(!accessibility.includes(marker))fail(`Interview UI missing accessibility marker: ${marker}`);
for(const marker of ['activateModal','visibleFocusable',"setAttribute('inert','')","event.key!=='Tab'",'previousFocus?.isConnected'])if(!accessibility.includes(marker))fail(`shared modal accessibility missing marker: ${marker}`);
for(const marker of ["isEn?'Close':'关闭'",'aria-labelledby="productOnboardingTitle"','tabindex="-1"','activateModal?.','focusSelector'])if(!shell.includes(marker))fail(`onboarding dialog missing accessibility marker: ${marker}`);
for(const [name,source] of [['weekly report',retention],['feedback',feedback]])for(const marker of ['activateModal?.','modalAccess?.release?.()','previous'])if(!source.includes(marker))fail(`${name} dialog missing shared modal behavior: ${marker}`);
for(const marker of ['aria-modal="true"','aria-labelledby="mobileToolsTitle"',"setAttribute('inert','')","removeAttribute('inert')","e.key!=='Tab'","previousFocus?.focus?.()",'aria-expanded','HOT100_MOBILE_TOOLS'])if(!drawer.includes(marker))fail(`tools dialog missing accessibility marker: ${marker}`);
if(index.indexOf('src="./accessibility-pass.js"')<index.indexOf('src="./mastery-pass.js"'))fail('accessibility pass must load after dynamic product layers');
console.log('SolveShift accessibility QA passed: keyboard focus, icon labels, live results, editor names, modal focus containment, and dialog dismissal are covered.');
