import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('public/hot100'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{console.error('SolveShift runner QA failed:',message);process.exit(1)};
for(const file of ['engine-state.js','python-worker.js','product-pass.js','practice-snapshot-pass.js','adaptive-mode-pass.js']){
  try{new vm.Script(read(file),{filename:file})}catch(error){fail(`${file} syntax error: ${error.message}`)}
}
const engine=read('engine-state.js'),worker=read('python-worker.js'),product=read('product-pass.js'),practice=read('practice-snapshot-pass.js'),interview=read('adaptive-mode-pass.js'),index=read('index.html'),sw=read('sw.js');
for(const marker of ['PY_RUN_TIMEOUT_MS=4000','PY_MAX_SOURCE_CHARS=140000','new Worker(\'./python-worker.js\')','resetPythonWorker(pythonTimeoutError())','worker?.terminate()','pyPending.clear()','pythonRequestToken','message.token!==pending.token','retirePythonWorker(worker)','messageerror','function isPythonTimeout(error)','function pythonFailureCopy(error)','navigator.onLine===false','你的代码仍然保留'])if(!engine.includes(marker))fail(`engine-state.js missing isolated runner marker: ${marker}`);
for(const marker of ['importScripts','loadPyodide','py.runPythonAsync','safePostMessage','MAX_OUTPUT_CHARS=256000','token:message.token','PYTHON_OUTPUT_LIMIT','type:\'result\'','type:\'error\''])if(!worker.includes(marker))fail(`python-worker.js missing worker-runtime marker: ${marker}`);
if(index.includes('pyodide/v0.26.4/full/pyodide.js'))fail('Pyodide must not execute on the page main thread');
if(!sw.includes("'./python-worker.js'"))fail('service worker must cache the Python Worker shell');
if(product.includes('state.attempts[p.slug]=(state.attempts[p.slug]||0)+1'))fail('product-pass.js must not coerce the structured attempt bucket into a number');
for(const marker of ['Array.isArray(bucket.runs)?bucket.runs.length','attemptNo','run.disabled=true','finally{run.disabled=false}','timeout=isPythonTimeout(err)','Python 已重置','运行超时，已自动停止','运行器未就绪'])if(!product.includes(marker))fail(`product-pass.js missing run-integrity marker: ${marker}`);
for(const marker of ['const bucket={runs:[],versions:[]}','b.runs.unshift','b.runs=b.runs.slice(0,20)'])if(!practice.includes(marker))fail(`practice-snapshot-pass.js missing structured history marker: ${marker}`);
if(!practice.includes("if(document.getElementById('editor'))mountPracticeEditor(current())"))fail('restored full-code cards must mount practice history without requiring a card switch');
for(const marker of ['runButton?.disabled','timeout=isPythonTimeout(err)','运行超时，已自动停止','finally{if(runButton)runButton.disabled=false}'])if(!interview.includes(marker))fail(`Interview runner missing isolation marker: ${marker}`);

let workerCount=0;
class FakeWorker{
  constructor(){this.id=++workerCount;this.listeners={message:[],error:[],messageerror:[]};this.terminated=false}
  addEventListener(type,handler){this.listeners[type]?.push(handler)}
  emit(type,payload){for(const handler of this.listeners[type]||[])handler(payload)}
  postMessage(message){
    if(message.type==='init'){queueMicrotask(()=>this.emit('message',{data:{type:'ready'}}));return}
    if(message.type==='run'&&this.id>1){queueMicrotask(()=>this.emit('message',{data:{type:'result',id:message.id,token:'spoofed',value:'forged'}}));queueMicrotask(()=>this.emit('message',{data:{type:'result',id:message.id,token:message.token,value:'[]'}}))}
  }
  terminate(){this.terminated=true}
}
const context={window:{HOT100_CURRICULUM:[],HOT100_LESSONS:{},HOT100_CALENDAR:{dayKey:()=>'',addDays:()=>''},addEventListener:()=>{},dispatchEvent:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},navigator:{onLine:true},Worker:FakeWorker,setTimeout,clearTimeout,queueMicrotask,console};
vm.createContext(context);
new vm.Script(`${engine}\nthis.__runner={getPy,isPythonTimeout};`,{filename:'engine-state-runner-test.js'}).runInContext(context);
const first=await context.__runner.getPy();let timeoutError=null;
try{await first.runPythonAsync('while True: pass',20)}catch(error){timeoutError=error}
if(!timeoutError||!context.__runner.isPythonTimeout(timeoutError))fail('a non-responsive Python Worker must reject with PYTHON_TIMEOUT');
const second=await context.__runner.getPy();let sourceError=null;
try{await second.runPythonAsync('x'.repeat(140001),100)}catch(error){sourceError=error}
if(sourceError?.code!=='PYTHON_SOURCE_LIMIT')fail('oversized source must be rejected before it reaches the Worker');
const retry=await second.runPythonAsync('1+1',100);
if(retry!=='[]'||workerCount!==2)fail('the runner must create a fresh Worker and succeed after timeout termination');
const third=await context.__runner.getPy(),fresh=await third.runPythonAsync('2+2',100);
if(fresh!=='[]'||workerCount!==3)fail('a successful run must retire its Worker so Python globals cannot contaminate the next run');

console.log('SolveShift runner QA passed: timeouts recover, oversized source and forged messages are rejected, and every completed run gets a fresh Python Worker.');
