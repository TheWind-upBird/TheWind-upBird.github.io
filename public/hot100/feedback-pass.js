(()=>{
if(window.SOLVESHIFT_RELEASE?.features?.feedback===false)return;
const APP_VERSION=window.SOLVESHIFT_RELEASE?.version||'0.4.0-beta.2',ISSUES_URL='https://github.com/TheWind-upBird/TheWind-upBird.github.io/issues/new';
const sessionErrors=[];
const escHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function recordError(input){
  const item={at:new Date().toISOString(),message:String(input?.message||input?.reason?.message||input?.reason||'未知前端错误').slice(0,180),source:String(input?.filename||'').split('/').pop().slice(0,80),line:Number(input?.lineno)||0};
  if(sessionErrors.at(-1)?.message===item.message)return;sessionErrors.push(item);if(sessionErrors.length>8)sessionErrors.shift()
}
window.addEventListener('error',recordError);window.addEventListener('unhandledrejection',recordError);
function storageFootprint(){try{return Math.round(JSON.stringify(state).length/1024)}catch(e){return-1}}
function diagnosticReport(){
  const analytics=window.HOT100_ANALYTICS?.summary?.()||{},profile=window.HOT100_PRODUCT_PROFILE?.get?.()||{},standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const lines=[
    `SolveShift ${APP_VERSION}`,
    `时间: ${new Date().toISOString()}`,
    `页面: ${location.pathname}`,
    `浏览器: ${navigator.userAgent}`,
    `屏幕: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio||1}`,
    `在线: ${navigator.onLine!==false?'是':'否'} · 安装模式: ${standalone?'是':'否'}`,
    `主题: ${document.documentElement.dataset.theme||'day'} · 课程语言: ${profile.locale||'zh-CN'}`,
    `本地状态大小: ${storageFootprint()} KB`,
    `学习摘要: lesson=${analytics.lessons||0}, run=${analytics.runs||0}, pass=${analytics.passes||0}, review=${analytics.reviews||0}`,
    `Service Worker: ${navigator.serviceWorker?.controller?'已控制页面':'未控制页面'}`
  ];
  if(sessionErrors.length){lines.push('本次会话前端错误:');for(const error of sessionErrors.slice(-4))lines.push(`- ${error.at} ${error.source||'page'}:${error.line||0} ${error.message}`)}else lines.push('本次会话前端错误: 无');
  lines.push('隐私: 此诊断不包含代码、个人笔记、测试输入或本地唯一标识。');return lines.join('\n')
}
function feedbackText(type,severity,description,includeDiagnostics=true){
  const labels={bug:'Bug / 故障',content:'内容问题',suggestion:'产品建议'},severityLabels={blocked:'阻塞任务',major:'严重但可绕过',minor:'轻微问题',idea:'建议'},parts=[`类型: ${labels[type]||labels.bug}`,`影响: ${severityLabels[severity]||severityLabels.major}`,`描述:\n${String(description||'（请补充复现步骤、实际结果和期望结果）').trim()}`];
  if(includeDiagnostics)parts.push(`诊断信息:\n${diagnosticReport()}`);return parts.join('\n\n')
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true}catch(error){
    try{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return ok}catch(e){return false}
  }
}
function feedbackMarkup(){return `<div class="feedbackScrim" data-feedback-close></div><section class="feedbackCard" role="dialog" aria-modal="true" aria-label="问题反馈" tabindex="-1"><div class="feedbackHead"><div><small>BETA FEEDBACK · ${APP_VERSION}</small><h2>告诉我们哪里不顺</h2><p>反馈不会自动发送。你可以复制内容，或主动打开 GitHub Issue。</p></div><button class="round" type="button" data-feedback-close aria-label="关闭">×</button></div><div class="feedbackFieldGrid"><label class="feedbackField"><span>反馈类型</span><select id="feedbackType"><option value="bug">Bug / 故障</option><option value="content">题目或讲解问题</option><option value="suggestion">产品建议</option></select></label><label class="feedbackField"><span>影响程度</span><select id="feedbackSeverity"><option value="blocked">阻塞任务</option><option value="major" selected>严重但可绕过</option><option value="minor">轻微问题</option><option value="idea">建议</option></select></label></div><label class="feedbackField"><span>复现步骤、实际结果、期望结果</span><textarea id="feedbackDescription" maxlength="1200" placeholder="例如：1. 打开第 63 题；2. 点击运行；实际页面一直转圈；期望约 4 秒后自动停止。"></textarea></label><label class="feedbackPrivacy"><input id="feedbackDiagnostics" type="checkbox" checked><span>附带安全诊断：版本、浏览器、屏幕、网络、学习事件数量和本次前端错误。<b>不包含代码、笔记和测试输入。</b></span></label><details class="feedbackPreview"><summary>预览诊断内容</summary><pre id="feedbackDiagnosticPreview"></pre></details><div class="feedbackStatus" id="feedbackStatus" role="status" aria-live="polite"></div><div class="feedbackActions"><button class="secondary" id="copyFeedback" type="button">复制反馈内容</button><button class="primary" id="openIssue" type="button">打开 GitHub Issue</button></div></section>`}
function openFeedback(){
  document.getElementById('feedbackModal')?.remove();const previous=document.activeElement,overlay=document.createElement('div');overlay.id='feedbackModal';overlay.className='feedbackModal';overlay.innerHTML=feedbackMarkup();document.body.appendChild(overlay);document.body.classList.add('productModalOpen');
  const close=()=>{overlay.remove();document.body.classList.remove('productModalOpen');previous?.focus?.()},type=overlay.querySelector('#feedbackType'),severity=overlay.querySelector('#feedbackSeverity'),description=overlay.querySelector('#feedbackDescription'),include=overlay.querySelector('#feedbackDiagnostics'),status=overlay.querySelector('#feedbackStatus'),preview=overlay.querySelector('#feedbackDiagnosticPreview');
  const refresh=()=>{preview.textContent=include.checked?diagnosticReport():'未附带诊断信息。'};refresh();include.addEventListener('change',refresh);overlay.querySelectorAll('[data-feedback-close]').forEach(button=>button.addEventListener('click',close));overlay.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  overlay.querySelector('#copyFeedback').addEventListener('click',async()=>{const ok=await copyText(feedbackText(type.value,severity.value,description.value,include.checked));status.textContent=ok?'已复制。可以直接粘贴给测试负责人。':'复制失败，请展开诊断内容并手动复制。';if(ok)window.HOT100_ANALYTICS?.track('feedback_copy',{type:type.value})});
  overlay.querySelector('#openIssue').addEventListener('click',()=>{const title=`[${severity.value}/${type.value}] SolveShift ${APP_VERSION}`,body=feedbackText(type.value,severity.value,description.value,include.checked),url=`${ISSUES_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;window.open(url,'_blank','noopener,noreferrer');status.textContent='已打开 GitHub。提交前仍可检查和修改内容。'});
  window.HOT100_ANALYTICS?.track('feedback_open',{source:'tools'});overlay.querySelector('.feedbackCard').focus()
}
function mountFeedbackTools(){
  const panel=document.querySelector('.mobileToolsPanel');if(!panel||document.getElementById('openFeedback'))return;const group=document.createElement('section');group.className='mobileToolsGroup feedbackToolsGroup';group.innerHTML=`<div class="mobileToolsLabel">帮助与反馈</div><button class="mobileToolRow" id="openFeedback" type="button"><span class="toolIcon">?</span><span><b>问题反馈</b><small>复制带安全诊断的反馈模板</small></span><em>›</em></button><div class="feedbackVersion"><span>SolveShift Beta</span><code>${APP_VERSION}</code></div>`;
  const danger=panel.querySelector('.dangerGroup');if(danger)danger.insertAdjacentElement('beforebegin',group);else panel.appendChild(group);group.querySelector('#openFeedback').addEventListener('click',()=>{document.getElementById('mobileToolsDrawer')?.classList.remove('open');document.body.classList.remove('toolsOpen');openFeedback()})
}
const style=document.createElement('style');style.textContent=`.feedbackVersion{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:9px 4px 8px;color:var(--muted);font-size:9px}.feedbackVersion code{font-size:9px}.feedbackModal{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:18px}.feedbackScrim{position:absolute;inset:0;background:rgba(9,14,24,.48);backdrop-filter:blur(8px)}.feedbackCard{position:relative;width:min(650px,94vw);max-height:92vh;overflow:auto;background:var(--panel,#fff);border:1px solid var(--line);border-radius:22px;padding:22px;color:var(--text);box-shadow:0 28px 90px rgba(10,20,35,.28)}.feedbackHead{display:flex;justify-content:space-between;gap:16px}.feedbackHead small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.feedbackHead h2{font-size:24px;margin:4px 0}.feedbackHead p{font-size:11px;line-height:1.5;color:var(--muted);margin:0}.feedbackFieldGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.feedbackField{display:grid;gap:6px;margin-top:16px}.feedbackField>span{font-size:11px;font-weight:700}.feedbackField select,.feedbackField textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;background:var(--bg,#f7f8fb);color:var(--text);padding:10px 11px;font:inherit;font-size:12px}.feedbackField textarea{min-height:120px;resize:vertical;line-height:1.55}.feedbackPrivacy{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;margin-top:14px;font-size:10px;line-height:1.55;color:var(--muted)}.feedbackPrivacy input{margin-top:2px}.feedbackPrivacy b{color:var(--text)}.feedbackPreview{margin-top:12px;border:1px solid var(--line);border-radius:12px;padding:9px 11px}.feedbackPreview summary{cursor:pointer;font-size:10px;font-weight:700}.feedbackPreview pre{white-space:pre-wrap;word-break:break-word;font-size:9px;line-height:1.5;color:var(--muted);max-height:190px;overflow:auto}.feedbackStatus{min-height:18px;margin-top:10px;color:var(--good);font-size:10px}.feedbackActions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}@media(max-width:620px){.feedbackCard{padding:18px 14px}.feedbackFieldGrid{grid-template-columns:1fr;gap:0}.feedbackActions{display:grid;grid-template-columns:1fr 1fr}.feedbackActions button{min-width:0;padding-left:8px;padding-right:8px}}`;
document.head.appendChild(style);mountFeedbackTools();window.addEventListener('hot100toolsready',mountFeedbackTools);window.HOT100_FEEDBACK={open:openFeedback,diagnostics:diagnosticReport,recordError,version:APP_VERSION,privacy:'no-code-no-notes-no-input'};
})();
