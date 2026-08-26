(()=>{
const release=window.SOLVESHIFT_RELEASE||{version:'unknown',channel:'unknown',stage:'unknown',features:{}};
const channelLabel={friends:'朋友内测','public-beta':'公开 Beta',stable:'正式版'}[release.rollout?.currentRing]||'测试通道';
function enabled(name){return release.features?.[name]!==false}
if(typeof getPy==='function'){
  const releaseBaseGetPy=getPy;
  getPy=async function(){if(!enabled('pythonRunner')){const error=new Error('Python 运行功能已由发布开关临时停用。课程、代码和笔记仍保留，请稍后再试。');error.code='RELEASE_KILL_SWITCH';throw error}return releaseBaseGetPy()}
}
function applyFlags(){
  if(!enabled('pythonRunner'))document.querySelectorAll('#run,#runInterview').forEach(button=>{button.disabled=true;button.title='当前版本已临时停用 Python 运行';const output=document.getElementById(button.id==='run'?'output':'interviewOutput');if(output){output.className='runner fail';output.textContent='Python 运行功能暂时停用。学习记录和代码不会丢失。'}});
  if(!enabled('feedback'))document.querySelector('.feedbackToolsGroup')?.setAttribute('hidden','');
  if(!enabled('retention'))document.querySelectorAll('.retentionRecovery,.weeklyReviewPanel').forEach(node=>node.remove())
}
function mountReleaseTools(){
  const panel=document.querySelector('.mobileToolsPanel');if(!panel||document.getElementById('releaseTrustGroup'))return;
  const group=document.createElement('section');group.id='releaseTrustGroup';group.className='mobileToolsGroup releaseTrustGroup';
  group.innerHTML=`<div class="mobileToolsLabel">发布与信任</div><div class="releaseChannelRow"><span class="releaseChannelDot"></span><span><b>${channelLabel}</b><small>${release.version} · 高风险功能可独立停用</small></span><code>${release.stage}</code></div><div class="releaseTrustLinks"><a href="./privacy.html" target="_blank" rel="noopener">隐私说明</a><a href="./terms.html" target="_blank" rel="noopener">使用条款</a><a href="./beta-guide.html" target="_blank" rel="noopener">测试任务</a></div>`;
  const health=document.getElementById('appHealthGroup'),danger=panel.querySelector('.dangerGroup');if(health)health.insertAdjacentElement('beforebegin',group);else if(danger)danger.insertAdjacentElement('beforebegin',group);else panel.appendChild(group)
}
if(typeof renderCard==='function'){const releaseBaseRenderCard=renderCard;renderCard=function(){const value=releaseBaseRenderCard();applyFlags();return value}}
if(typeof renderInterviewPage==='function'){const releaseBaseRenderInterview=renderInterviewPage;renderInterviewPage=function(){const value=releaseBaseRenderInterview();applyFlags();return value}}
if(typeof showPage==='function'){const releaseBaseShowPage=showPage;showPage=function(name){const value=releaseBaseShowPage(name);applyFlags();return value}}
mountReleaseTools();applyFlags();window.addEventListener('hot100toolsready',()=>{mountReleaseTools();applyFlags()});
const style=document.createElement('style');style.textContent=`.releaseChannelRow{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:9px;padding:10px 4px}.releaseChannelRow>span:nth-child(2){display:grid;gap:1px}.releaseChannelRow b{font-size:12px}.releaseChannelRow small{font-size:9px;color:var(--muted)}.releaseChannelRow code{font-size:8px;color:var(--muted)}.releaseChannelDot{width:8px;height:8px;border-radius:50%;background:#b47a17;box-shadow:0 0 0 3px #fff2d8}.releaseTrustLinks{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line)}.releaseTrustLinks a{text-align:center;padding:9px 2px;color:var(--accent);font-size:9px;text-decoration:none}.releaseTrustLinks a+a{border-left:1px solid var(--line)}`;document.head.appendChild(style);
window.SOLVESHIFT_RELEASE_GUARD={enabled,apply:applyFlags,release};
})();
