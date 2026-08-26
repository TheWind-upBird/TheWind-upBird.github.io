const PYODIDE_INDEX='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const safePostMessage=self.postMessage.bind(self);
const MAX_SOURCE_CHARS=140000,MAX_OUTPUT_CHARS=256000;
let runtimePromise=null;

function runtime(){
  if(!runtimePromise){
    runtimePromise=(async()=>{
      importScripts(`${PYODIDE_INDEX}pyodide.js`);
      return loadPyodide({indexURL:PYODIDE_INDEX})
    })()
  }
  return runtimePromise
}

self.addEventListener('message',async event=>{
  const message=event.data||{};
  if(message.type==='init'){
    try{await runtime();safePostMessage({type:'ready'})}
    catch(error){safePostMessage({type:'fatal',message:error?.message||String(error)})}
    return
  }
  if(message.type!=='run')return;
  try{
    const source=String(message.code||'');
    if(source.length>MAX_SOURCE_CHARS){const error=new Error(`代码过长，最多允许 ${MAX_SOURCE_CHARS.toLocaleString()} 个字符。`);error.code='PYTHON_SOURCE_LIMIT';throw error}
    const py=await runtime(),value=String(await py.runPythonAsync(source));
    if(value.length>MAX_OUTPUT_CHARS){const error=new Error(`运行结果过大，最多允许 ${MAX_OUTPUT_CHARS.toLocaleString()} 个字符。请避免返回或打印超大的列表、字符串。`);error.code='PYTHON_OUTPUT_LIMIT';throw error}
    safePostMessage({type:'result',id:message.id,token:message.token,value})
  }catch(error){
    const errorMessage=String(error?.message||error||'Python 运行失败').slice(0,MAX_OUTPUT_CHARS),errorStack=String(error?.stack||'').slice(0,32000);
    safePostMessage({type:'error',id:message.id,token:message.token,code:error?.code||'',message:errorMessage,stack:errorStack})
  }
});
