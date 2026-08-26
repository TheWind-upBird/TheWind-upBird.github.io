(()=>{
function applyAccessibility(){
  const practiceEditor=document.getElementById('editor'),practiceOutput=document.getElementById('output'),practiceRun=document.getElementById('run');
  if(practiceEditor)practiceEditor.setAttribute('aria-label',`${typeof current==='function'?current()?.title||'当前题目':'当前题目'} Python 代码编辑器`);
  if(practiceOutput){practiceOutput.setAttribute('role','status');practiceOutput.setAttribute('aria-live','polite')}if(practiceRun)practiceRun.setAttribute('aria-describedby','output');
  const session=document.querySelector('.interviewSession'),editor=document.getElementById('interviewEditor'),output=document.getElementById('interviewOutput'),run=document.getElementById('runInterview'),hints=document.getElementById('interviewHints');
  if(editor){const title=session?.querySelector('h2')?.childNodes?.[0]?.textContent?.trim()||'当前题目';editor.setAttribute('aria-label',`${title} Python 面试代码编辑器`)}
  if(output){output.setAttribute('role','status');output.setAttribute('aria-live','polite')}
  if(run)run.setAttribute('aria-describedby','interviewOutput');if(hints)hints.setAttribute('aria-live','polite')
}
function applyProblemIdentity(){
  const p=typeof current==='function'?current():null;if(!p)return;
  const route=`路线第 ${state.currentProblem+1} / ${CURRICULUM.length} 题`,leetcode=`LeetCode ${p.number}`;
  const homeEye=document.querySelector('#page-home>.eyebrow'),deckEye=document.querySelector('#page-deck .deckHead .eyebrow'),tag=document.querySelector('#page-home .hero .tag');
  if(homeEye)homeEye.textContent=`${route} · ${leetcode} · ${p.topic}`;
  if(deckEye)deckEye.textContent=`${route} · ${leetcode} · ${p.topic}`;
  if(tag)tag.textContent=`${route} · ${leetcode}`
}
const baseCard=typeof renderCard==='function'?renderCard:null;if(baseCard){renderCard=function(){const result=baseCard();applyProblemIdentity();return result}}
const baseHome=typeof renderHome==='function'?renderHome:null;if(baseHome){renderHome=function(){const result=baseHome();applyProblemIdentity();return result}}
const baseInterview=typeof renderInterviewPage==='function'?renderInterviewPage:null;if(baseInterview){renderInterviewPage=function(){const result=baseInterview();applyAccessibility();return result}}
const basePage=typeof showPage==='function'?showPage:null;if(basePage){showPage=function(name,...args){const result=basePage.call(this,name,...args);requestAnimationFrame(()=>{applyAccessibility();applyProblemIdentity()});return result}}
applyAccessibility();applyProblemIdentity();window.HOT100_ACCESSIBILITY={apply:applyAccessibility,identity:applyProblemIdentity,principle:'keyboard-and-live-regions'};
})();
