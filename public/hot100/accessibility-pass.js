(()=>{
function visibleFocusable(root){
  return [...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(element=>!element.hidden&&!element.closest('[hidden],[inert]')&&element.getClientRects().length)
}
function activateModal(overlay,{onEscape,initialFocus}={}){
  if(!overlay)return null;
  const previousFocus=document.activeElement;
  const background=[...document.body.children].filter(element=>element!==overlay&&!['SCRIPT','STYLE','LINK'].includes(element.tagName)).map(element=>({element,inert:element.hasAttribute('inert'),ariaHidden:element.getAttribute('aria-hidden')}));
  for(const item of background){item.element.setAttribute('inert','');item.element.setAttribute('aria-hidden','true')}
  let active=true;
  const focusInitial=()=>{
    if(!active||!overlay.isConnected)return;
    const target=typeof initialFocus==='string'?overlay.querySelector(initialFocus):initialFocus;
    (target||overlay.querySelector('[role="dialog"]')||visibleFocusable(overlay)[0])?.focus?.()
  };
  const keydown=event=>{
    if(event.key==='Escape'){event.preventDefault();onEscape?.();return}
    if(event.key!=='Tab')return;
    const focusable=visibleFocusable(overlay);
    if(!focusable.length){event.preventDefault();overlay.querySelector('[role="dialog"]')?.focus?.();return}
    const first=focusable[0],last=focusable.at(-1);
    if(!focusable.includes(document.activeElement)){event.preventDefault();(event.shiftKey?last:first).focus();return}
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  overlay.addEventListener('keydown',keydown);requestAnimationFrame(focusInitial);
  return {focus:focusInitial,release(restoreFocus=true){
    if(!active)return;active=false;overlay.removeEventListener('keydown',keydown);
    for(const item of background){if(!item.inert)item.element.removeAttribute('inert');if(item.ariaHidden===null)item.element.removeAttribute('aria-hidden');else item.element.setAttribute('aria-hidden',item.ariaHidden)}
    if(restoreFocus)requestAnimationFrame(()=>previousFocus?.isConnected&&previousFocus.focus?.())
  }}
}
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
applyAccessibility();applyProblemIdentity();window.HOT100_ACCESSIBILITY={apply:applyAccessibility,identity:applyProblemIdentity,activateModal,principle:'keyboard-focus-modal-containment-and-live-regions'};
})();
