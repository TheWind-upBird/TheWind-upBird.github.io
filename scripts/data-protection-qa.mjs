import fs from 'node:fs';
const read=file=>fs.readFileSync(new URL(`../public/hot100/${file}`,import.meta.url),'utf8');
const pass=read('data-protection-pass.js'),utility=read('utility-pass.js'),html=read('index.html'),sw=read('sw.js');
const checks=[
  ['data protection metadata is bounded and separate from learning state',pass.includes("const KEY='solveshift-data-protection-v1'")&&pass.includes('progressSignature()')],
  ['successful export emits protection evidence',utility.includes("type:'export'")&&utility.includes("payload.exportedAt")],
  ['successful import emits protection evidence before reload',utility.includes("type:'import'")&&utility.indexOf("type:'import'")<utility.indexOf('location.reload()',utility.indexOf("type:'import'")-300)],
  ['status distinguishes no backup, changed progress, and current backup',pass.includes('尚未做外部备份')&&pass.includes('上次备份后有新进度')&&pass.includes('外部备份是最新的')],
  ['desktop and tools drawer both expose backup health',pass.includes("dataProtection='desktop'")&&pass.includes("dataProtection='mobile'")],
  ['opening either data surface refreshes status after new progress',pass.includes("mobileToolsBtn")&&pass.includes("#hot100DataMenu>summary")&&pass.includes("setTimeout(render,0)")],
  ['backup action uses existing validated export path',pass.includes("getElementById('exportProgress')?.click()")],
  ['new pass is loaded and cached',html.includes('data-protection-pass.js')&&sw.includes('data-protection-pass.js')&&sw.includes("hot100-shell-v50")]
];
const failed=checks.filter(([,ok])=>!ok);if(failed.length){for(const [name]of failed)console.error(`FAIL: ${name}`);process.exit(1)}
console.log('SolveShift data-protection QA passed: external-backup freshness, export/import evidence, recovery status, and PWA coverage are present.');
