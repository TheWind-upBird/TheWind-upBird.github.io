import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot=path.resolve('.'),root=path.join(repoRoot,'public','hot100');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const readRepo=file=>fs.readFileSync(path.join(repoRoot,file),'utf8');
const fail=message=>{console.error('SolveShift release-readiness QA failed:',message);process.exitCode=1};
const index=read('index.html'),configSource=read('release-config.js'),guard=read('release-guard-pass.js'),feedback=read('feedback-pass.js'),retention=read('retention-pass.js'),sw=read('sw.js'),privacy=read('privacy.html'),terms=read('terms.html'),guide=read('beta-guide.html'),security=read('SECURITY.md'),workflow=`${readRepo('.github/workflows/hot100-qa.yml')}\n${readRepo('.github/workflows/deploy.yml')}`,issueTemplate=readRepo('.github/ISSUE_TEMPLATE/beta-bug.yml'),evidence=readRepo('scripts/release-evidence.mjs'),pkg=JSON.parse(readRepo('package.json'));

for(const [file,source] of [['release-config.js',configSource],['release-guard-pass.js',guard],['theme-bootstrap.js',read('theme-bootstrap.js')]])try{new vm.Script(source,{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}
const context={window:{},Object};vm.createContext(context);vm.runInContext(configSource,context);const release=context.window.SOLVESHIFT_RELEASE;
if(!release||release.schemaVersion!==1||!/^0\.4\.0-beta\.\d+$/.test(release.version))fail('release config must provide a versioned schema and beta version');
for(const flag of ['pythonRunner','feedback','retention'])if(typeof release?.features?.[flag]!=='boolean')fail(`release flag ${flag} must be an explicit boolean`);
if(release?.rollout?.promotion!=='manual-go-no-go'||release?.rollout?.currentRing!=='friends')fail('release config must remain on the gated friends ring until manual promotion');

const csp=index.match(/Content-Security-Policy" content="([^"]+)/)?.[1]||'';
for(const directive of ["default-src 'self'","script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net","connect-src 'self' https://cdn.jsdelivr.net","worker-src 'self' blob:","object-src 'none'","base-uri 'self'"])if(!csp.includes(directive))fail(`index CSP missing: ${directive}`);
if(csp.includes("'unsafe-eval'"))fail('index CSP must not allow general unsafe-eval');
if(/<script(?![^>]*\bsrc=)[^>]*>/i.test(index))fail('index must not contain inline scripts under the release CSP');
for(const asset of ['theme-bootstrap.js','release-config.js','release-guard-pass.js','privacy.html','terms.html','beta-guide.html'])if(!index.includes(asset))fail(`index missing release asset/link: ${asset}`);
for(const marker of ['name="description"','name="application-name"','name="color-scheme"','property="og:title"','property="og:description"','property="og:url"','rel="canonical"','https://thewind-upbird.github.io/hot100/'])if(!index.includes(marker))fail(`index missing publish metadata: ${marker}`);
for(const marker of ['RELEASE_KILL_SWITCH','pythonRunner','feedback','retention','发布与信任','隐私说明','使用条款'])if(!guard.includes(marker))fail(`release guard missing marker: ${marker}`);
if(!feedback.includes('features?.feedback===false')||!retention.includes('features?.retention===false'))fail('feedback and retention modules must stop before mounting when their release flags are off');
function guardHarness(pythonRunner){
  const runButton={id:'run',disabled:false,title:''},output={className:'',textContent:''},style={textContent:''};
  const harness={
    window:{SOLVESHIFT_RELEASE:{version:'test',stage:'test',features:{pythonRunner,feedback:true,retention:true},rollout:{currentRing:'friends'}},addEventListener(){},SOLVESHIFT_RELEASE_GUARD:null},
    document:{body:{},head:{appendChild(){}},querySelector(){return null},querySelectorAll(selector){return selector==='#run,#runInterview'?[runButton]:[]},getElementById(id){return id==='output'?output:null},createElement(){return style}},
    getPy:async()=>({runtime:'base'}),setTimeout,console
  };
  vm.createContext(harness);vm.runInContext(guard,harness);return{harness,runButton,output}
}
const disabled=guardHarness(false);let disabledError=null;try{await disabled.harness.getPy()}catch(error){disabledError=error}
if(disabledError?.code!=='RELEASE_KILL_SWITCH'||!disabled.runButton.disabled||!disabled.output.textContent.includes('暂时停用'))fail('Python kill switch must block the runtime and explain the preserved-data state in UI');
const enabledGuard=guardHarness(true);if((await enabledGuard.harness.getPy())?.runtime!=='base'||enabledGuard.runButton.disabled)fail('enabled Python flag must preserve the normal runtime path');

for(const marker of ['哪些数据','数据保存在哪里','第三方','导出、删除和撤回','数据最小化','没有 SolveShift 云端数据库'])if(!privacy.includes(marker))fail(`privacy disclosure missing: ${marker}`);
for(const marker of ['Beta 状态','用户责任','暂停与回滚','条款变更'])if(!terms.includes(marker))fail(`terms missing: ${marker}`);
for(const marker of ['朋友内测任务','第一次使用','故障恢复','数据保护','立即停止并报告','完成标准'])if(!guide.includes(marker))fail(`beta test guide missing: ${marker}`);
for(const [name,source] of [['privacy.html',privacy],['terms.html',terms],['beta-guide.html',guide]])if(!source.includes('rel="icon"')||!source.includes('./icon.svg'))fail(`${name} must declare the existing product icon and avoid a favicon 404`);
for(const marker of ['Report a vulnerability','独立 Web Worker','内容安全策略','不属于漏洞'])if(!security.includes(marker))fail(`security policy missing: ${marker}`);

for(const asset of ['theme-bootstrap.js','release-config.js','release-guard-pass.js','privacy.html','terms.html','beta-guide.html','legal.css','SECURITY.md'])if(!sw.includes(`'./${asset}'`))fail(`service worker missing release asset: ${asset}`);
if(!sw.includes("CACHE='hot100-shell-v50'"))fail('service worker cache version must be v50');
if(pkg.scripts?.['qa:release']!=='node scripts/release-readiness-qa.mjs'||!pkg.scripts?.qa?.includes('qa:release'))fail('release-readiness QA must run in the normal gate');
if(pkg.scripts?.['release:check']!=="npm run qa && python scripts/python-content-qa.py")fail('release:check must combine product QA and executable Python judges');
if(pkg.scripts?.['release:evidence']!=='node scripts/release-evidence.mjs'||!evidence.includes('pythonReferenceJudges:99')||!evidence.includes('cacheVersion'))fail('release evidence generator must capture commit, cache, gates and limitations');
for(const marker of ['影响程度','最小复现步骤','实际结果','期望结果','隐私确认'])if(!issueTemplate.includes(marker))fail(`beta issue template missing: ${marker}`);
for(const marker of ['npm run release:check','npm run release:evidence','actions/upload-artifact@v4','retention-days: 30'])if(!workflow.includes(marker))fail(`CI release evidence flow missing: ${marker}`);

if(process.exitCode)process.exit(process.exitCode);
console.log(`SolveShift release-readiness QA passed: ${release.version}, friends ring, explicit kill switches, CSP, privacy, terms, security policy, offline legal assets, and one-command release gate are present.`);
