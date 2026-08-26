(()=>{
const Policy=window.HOT100_LEARNING_POLICY,Shell=window.HOT100_PRODUCT_SHELL;
if(!Policy||!Shell)return;
function nextTask(){return Policy.todayPlan(window.HOT100_PRODUCT_PROFILE?.get?.().dailyMinutes||20)?.tasks?.[0]||null}
function openNextTask(){const task=nextTask();if(task)Shell.openTask(task);else showPage('problems')}
function enhanceReviewEmpty(){
  const area=document.getElementById('reviewArea'),empty=area?.querySelector('.empty');if(!empty||empty.querySelector('.emptyActions'))return;
  const actions=document.createElement('div');actions.className='emptyActions';actions.innerHTML='<button class="secondary" id="browseFromEmpty" type="button">查看题库</button><button class="primary" id="continueFromEmpty" type="button">继续今日路线</button>';empty.appendChild(actions);
  actions.querySelector('#browseFromEmpty').addEventListener('click',()=>showPage('problems'));actions.querySelector('#continueFromEmpty').addEventListener('click',openNextTask)
}
function clearProblemFilters(){
  const search=document.getElementById('problemSearch');if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}))}
  const topic=document.getElementById('topicFilter');if(topic){topic.value='全部知识点';topic.dispatchEvent(new Event('change',{bubbles:true}))}
  const difficulty=document.getElementById('difficultyFilter');if(difficulty){difficulty.value='全部难度';difficulty.dispatchEvent(new Event('change',{bubbles:true}))}
  document.querySelector('[data-pfilter="全部"]')?.click()
}
function enhanceProblemEmpty(){
  const empty=document.querySelector('#problemList>.empty');if(!empty||empty.querySelector('#clearProblemFilters'))return;
  const button=document.createElement('button');button.id='clearProblemFilters';button.type='button';button.className='secondary';button.textContent='清空筛选条件';button.addEventListener('click',clearProblemFilters);empty.appendChild(button)
}
function enhanceInterviewEmpty(){
  const area=document.getElementById('interviewArea');if(!area||area.querySelector('.interviewSession')||document.getElementById('interviewEmptyGuide'))return;
  let eligible=0;try{eligible=typeof interviewEligible==='function'?interviewEligible().length:0}catch(e){}
  if(eligible>0)return;
  for(const id of ['randomInterview','weakInterview']){const button=document.getElementById(id);if(button){button.disabled=true;button.setAttribute('aria-describedby','interviewEmptyGuide')}}
  const guide=document.createElement('div');guide.id='interviewEmptyGuide';guide.className='card interviewEmptyGuide';guide.innerHTML='<span><b>先建立一道题的学习证据</b><small>完成几张学习卡后，随机面试会从你真正学过的题里抽取。</small></span><button class="primary" id="learnBeforeInterview" type="button">先学习推荐题</button>';area.querySelector('.interviewLaunch')?.insertAdjacentElement('afterend',guide);guide.querySelector('button').addEventListener('click',openNextTask)
}
const baseReview=typeof renderReview==='function'?renderReview:null;if(baseReview){renderReview=function(){const result=baseReview();enhanceReviewEmpty();return result}}
const baseProblems=typeof renderProblems==='function'?renderProblems:null;if(baseProblems){renderProblems=function(){const result=baseProblems();enhanceProblemEmpty();return result}}
const baseInterview=typeof renderInterviewPage==='function'?renderInterviewPage:null;if(baseInterview){renderInterviewPage=function(){const result=baseInterview();enhanceInterviewEmpty();return result}}
const baseShowPage=typeof showPage==='function'?showPage:null;if(baseShowPage){showPage=function(name,...args){const result=baseShowPage.call(this,name,...args);requestAnimationFrame(()=>{if(name==='review')enhanceReviewEmpty();if(name==='problems')enhanceProblemEmpty();if(name==='interview')enhanceInterviewEmpty()});return result}}
const style=document.createElement('style');style.textContent=`.emptyActions{display:flex;justify-content:center;gap:8px;margin-top:14px}.empty #clearProblemFilters{margin-top:13px}.interviewEmptyGuide{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:12px;padding:14px 16px}.interviewEmptyGuide span{display:grid;gap:3px}.interviewEmptyGuide b{font-size:13px}.interviewEmptyGuide small{font-size:10px;line-height:1.5;color:var(--muted)}.interviewLaunch button:disabled{opacity:.46;cursor:not-allowed}@media(max-width:620px){.emptyActions{display:grid;grid-template-columns:1fr}.interviewEmptyGuide{align-items:stretch;flex-direction:column}}`;
document.head.appendChild(style);enhanceReviewEmpty();enhanceProblemEmpty();enhanceInterviewEmpty();window.HOT100_CONTINUITY={enhanceReviewEmpty,enhanceProblemEmpty,enhanceInterviewEmpty,clearProblemFilters,openNextTask};
})();
