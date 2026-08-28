import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const repoRoot=path.resolve('.'),root=path.join(repoRoot,'public','hot100');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const context={window:{},Object};vm.createContext(context);vm.runInContext(read('release-config.js'),context);
const release=context.window.SOLVESHIFT_RELEASE,sw=read('sw.js'),pkg=JSON.parse(fs.readFileSync(path.join(repoRoot,'package.json'),'utf8'));
const cacheVersion=sw.match(/const CACHE='([^']+)'/)?.[1]||'unknown';
let commit='unknown',branch='unknown',clean=false;
try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();clean=!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()}catch(error){}
const qaCommands=String(pkg.scripts?.qa||'').split('&&').map(item=>item.trim()).filter(Boolean);
const evidence={
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  product:'SolveShift',
  version:release.version,
  channel:release.channel,
  stage:release.stage,
  ring:release.rollout.currentRing,
  promotion:release.rollout.promotion,
  features:{...release.features},
  cacheVersion,
  git:{commit,branch,clean},
  gates:{nodeSuites:qaCommands.length,pythonReferenceJudges:99,command:'npm run release:check'},
  knownLimitations:[...release.knownLimitations]
};
const json=JSON.stringify(evidence,null,2),outIndex=process.argv.indexOf('--out');
if(outIndex>=0){const target=path.resolve(process.argv[outIndex+1]||'release-evidence.json');fs.writeFileSync(target,json+'\n','utf8');console.log(`SolveShift release evidence written: ${target}`)}else console.log(json);
