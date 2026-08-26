(()=>{
if(window.SOLVESHIFT_RELEASE?.features?.retention===false)return;
const RETENTION_VERSION=1,MAX_OPEN_DAYS=45;
const Profile=window.HOT100_PRODUCT_PROFILE,Policy=window.HOT100_LEARNING_POLICY,Shell=window.HOT100_PRODUCT_SHELL,Catalog=window.HOT100_PRODUCT_CATALOG;
if(!Profile||!Policy||!Shell)return;
const escHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function shiftDay(day,delta){const d=new Date(`${day}T12:00:00`);d.setDate(d.getDate()+delta);return localDay(d)}
function dayDistance(older,newer){const a=new Date(`${older}T12:00:00`),b=new Date(`${newer}T12:00:00`);return Number.isFinite(a.getTime())&&Number.isFinite(b.getTime())?Math.max(0,Math.round((b-a)/86400000)):0}
function retentionState(){
  const raw=state.productRetention,meta=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  meta.version=RETENTION_VERSION;meta.openDays=Array.isArray(meta.openDays)?meta.openDays.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-MAX_OPEN_DAYS):[];
  state.productRetention=meta;return meta
}
const today=localDay(),meta=retentionState(),previousDay=meta.lastOpenDay&&meta.lastOpenDay!==today?meta.lastOpenDay:'';
if(previousDay){const gap=dayDistance(previousDay,today);if(gap>=3&&!meta.recoveryPending){meta.recoveryPending=true;meta.returnGap=gap;meta.returnedFrom=previousDay}}
if(!meta.openDays.includes(today))meta.openDays.push(today);meta.openDays=meta.openDays.slice(-MAX_OPEN_DAYS);meta.lastOpenDay=today;persist();
function eventsSince(day){return (Array.isArray(state.productEvents)?state.productEvents:[]).filter(event=>typeof event?.day==='string'&&event.day>=day)}
function started(){return Object.keys(state.solved||{}).length>0||Object.keys(state.completedCards||{}).length>0||Object.keys(state.codes||{}).length>0}
function patternSummary(){
  if(!Catalog)return{strong:null,weak:Policy.weakPatterns?.(1)?.[0]?.pattern||null};
  const groups=new Map();
  for(const p of CURRICULUM){const evidence=Policy.masteryEvidence?.(p);if(!evidence||evidence.score<=0)continue;const pattern=Catalog.patternFor(p),group=groups.get(pattern.id)||{pattern,total:0,count:0};group.total+=evidence.score;group.count+=1;groups.set(pattern.id,group)}
  const ranked=[...groups.values()].map(group=>({...group,score:group.total/group.count})).sort((a,b)=>b.score-a.score);
  return{strong:ranked[0]?.pattern||null,weak:Policy.weakPatterns?.(1)?.[0]?.pattern||null}
}
function weeklySummary(){
  const from=shiftDay(today,-6),events=eventsSince(from),patterns=patternSummary(),openDays=new Set(meta.openDays.filter(day=>day>=from));
  for(const event of events)if(event.day)openDays.add(event.day);
  const count=name=>events.filter(event=>event.name===name).length;
  const completed=Object.values(state.solved||{}).filter(item=>item?.completedAt&&localDay(new Date(item.completedAt))>=from).length;
  return{from,to:today,activeDays:openDays.size,lessons:count('lesson_start'),runs:count('code_run'),passes:count('code_pass'),reviews:count('review_complete'),interviews:count('interview_pass'),completed,strong:patterns.strong,weak:patterns.weak}
}
function patternLabel(pattern){const locale=Profile.get().locale;return locale==='en-US'?pattern?.en||pattern?.zh:pattern?.zh||pattern?.en}
function firstRecoveryTask(){return Policy.todayPlan(10)?.tasks?.[0]||null}
function dismissRecovery(){meta.recoveryPending=false;meta.recoveryDismissedAt=new Date().toISOString();persist();renderRetention()}
function startRecovery(){
  const task=firstRecoveryTask();meta.recoveryPending=false;meta.recoveryStartedAt=new Date().toISOString();persist();window.HOT100_ANALYTICS?.track('recovery_start',{slug:task?.slug||'',type:task?.type||''});
  if(task)Shell.openTask(task);else renderRetention()
}
function reportMarkup(summary){
  const isEn=Profile.get().locale==='en-US',strong=patternLabel(summary.strong),weak=patternLabel(summary.weak);
  return `<div class="weeklyReportScrim" data-weekly-close></div><section class="weeklyReportCard" role="dialog" aria-modal="true" aria-label="${isEn?'Weekly review':'本周回顾'}" tabindex="-1"><div class="weeklyReportHead"><div><small>${isEn?'LAST 7 DAYS':'最近 7 天'}</small><h2>${isEn?'Your week in SolveShift':'你的 SolveShift 本周回顾'}</h2><p>${summary.from} → ${summary.to}</p></div><button class="round" type="button" data-weekly-close aria-label="${isEn?'Close':'关闭'}">×</button></div><div class="weeklyReportStats"><div><b>${summary.activeDays}</b><small>${isEn?'active days':'学习天数'}</small></div><div><b>${summary.completed}</b><small>${isEn?'problems written':'本周写出'}</small></div><div><b>${summary.passes}</b><small>${isEn?'test passes':'测试通过'}</small></div><div><b>${summary.reviews}</b><small>${isEn?'reviews':'完成复习'}</small></div></div><div class="weeklyReportEvidence"><div><small>${isEn?'STRONGEST PATTERN':'当前最稳知识点'}</small><b>${escHtml(strong||(isEn?'Keep learning to reveal it':'继续学习后生成'))}</b></div><div><small>${isEn?'NEXT FOCUS':'下周优先巩固'}</small><b>${escHtml(weak||(isEn?'Continue today’s route':'继续今日路线'))}</b></div></div><p class="weeklyReportNote">${isEn?'This report is generated on this device from learning evidence. It does not upload your code or notes.':'报告只根据本机学习证据生成，不上传代码和笔记，也不会因为中断学习惩罚你。'}</p><div class="weeklyReportActions"><button class="secondary" type="button" data-weekly-close>${isEn?'Close':'稍后再看'}</button><button class="primary" id="weeklyContinue" type="button">${isEn?'Continue today’s route':'继续今日路线'}</button></div></section>`
}
function openWeeklyReport(){
  document.getElementById('weeklyReport')?.remove();const overlay=document.createElement('div');overlay.id='weeklyReport';overlay.className='weeklyReport';overlay.innerHTML=reportMarkup(weeklySummary());document.body.appendChild(overlay);document.body.classList.add('productModalOpen');
  const close=()=>{overlay.remove();document.body.classList.remove('productModalOpen')};overlay.querySelectorAll('[data-weekly-close]').forEach(button=>button.addEventListener('click',close));overlay.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  overlay.querySelector('#weeklyContinue')?.addEventListener('click',()=>{close();const task=Policy.todayPlan(Profile.get().dailyMinutes||20)?.tasks?.[0];if(task)Shell.openTask(task)});window.HOT100_ANALYTICS?.track('weekly_report_open',{source:'home'});overlay.querySelector('.weeklyReportCard')?.focus()
}
function renderRetention(){
  const home=document.getElementById('page-home');if(!home)return;document.getElementById('retentionPanel')?.remove();if(!started())return;
  const summary=weeklySummary(),returning=Boolean(meta.recoveryPending&&Number(meta.returnGap)>=3),box=document.createElement('section');box.id='retentionPanel';box.className=`retentionPanel card${returning?' returning':''}`;
  if(returning){const task=firstRecoveryTask();box.innerHTML=`<div class="retentionCopy"><small>WELCOME BACK · 欢迎回来</small><h3>先用 8 分钟找回手感</h3><p>你离开了 ${Number(meta.returnGap)} 天。没有断签惩罚，先从${task?.title?`「${escHtml(task.title)}」`:'一个小任务'}继续。</p></div><div class="retentionActions"><button class="secondary" id="dismissRecovery" type="button">今天稍后</button><button class="primary" id="startRecovery" type="button">开始恢复学习</button></div>`;
    const todayPlan=document.getElementById('productTodayPlan');if(todayPlan)todayPlan.insertAdjacentElement('beforebegin',box);else home.querySelector('.hero')?.insertAdjacentElement('beforebegin',box);
    box.querySelector('#dismissRecovery')?.addEventListener('click',dismissRecovery);box.querySelector('#startRecovery')?.addEventListener('click',startRecovery);return
  }
  box.innerHTML=`<div class="retentionCopy"><small>WEEKLY · 最近 7 天</small><h3>${summary.activeDays?`学习 ${summary.activeDays} 天，测试通过 ${summary.passes} 次`:'从今天开始积累学习证据'}</h3><p>${summary.weak?`下一步优先巩固 ${escHtml(patternLabel(summary.weak))}。`:'继续完成今日路线，周报会逐渐形成。'}</p></div><button class="secondary" id="openWeeklyReport" type="button">查看本周回顾</button>`;
  const summaries=home.querySelector('.summaryGrid');if(summaries)summaries.insertAdjacentElement('afterend',box);else home.appendChild(box);box.querySelector('#openWeeklyReport')?.addEventListener('click',openWeeklyReport)
}
const baseRenderHome=typeof renderHome==='function'?renderHome:null;if(baseRenderHome){renderHome=function(){const result=baseRenderHome();renderRetention();return result}}
const baseShowPage=typeof showPage==='function'?showPage:null;if(baseShowPage){showPage=function(name,...args){const result=baseShowPage.call(this,name,...args);if(name==='home')requestAnimationFrame(renderRetention);return result}}
const style=document.createElement('style');style.textContent=`.retentionPanel{margin:14px 0;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:14px;box-shadow:none}.retentionCopy{display:grid;gap:3px}.retentionCopy small,.weeklyReportHead small,.weeklyReportEvidence small{font-size:9px;letter-spacing:.12em;color:var(--muted)}.retentionCopy h3{font-size:15px;margin:0}.retentionCopy p{font-size:11px;line-height:1.5;color:var(--muted);margin:0}.retentionPanel.returning{border-color:#d8c67f;background:linear-gradient(135deg,#fff9e6,#fff)}.retentionActions{display:flex;gap:7px;flex:0 0 auto}.weeklyReport{position:fixed;inset:0;z-index:950;display:grid;place-items:center;padding:18px}.weeklyReportScrim{position:absolute;inset:0;background:rgba(9,14,24,.48);backdrop-filter:blur(8px)}.weeklyReportCard{position:relative;width:min(620px,94vw);max-height:90vh;overflow:auto;background:var(--panel,#fff);border:1px solid var(--line);border-radius:22px;padding:22px;color:var(--text);box-shadow:0 28px 90px rgba(10,20,35,.28)}.weeklyReportHead{display:flex;justify-content:space-between;gap:16px}.weeklyReportHead h2{margin:4px 0;font-size:24px}.weeklyReportHead p{margin:0;color:var(--muted);font-size:10px}.weeklyReportStats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:20px 0}.weeklyReportStats>div,.weeklyReportEvidence>div{border:1px solid var(--line);border-radius:13px;padding:12px;background:var(--bg,#f7f8fb)}.weeklyReportStats b{display:block;font-size:22px}.weeklyReportStats small{font-size:10px;color:var(--muted)}.weeklyReportEvidence{display:grid;grid-template-columns:1fr 1fr;gap:8px}.weeklyReportEvidence b{display:block;margin-top:5px;font-size:13px}.weeklyReportNote{font-size:10px;line-height:1.6;color:var(--muted);margin:14px 1px}.weeklyReportActions{display:flex;justify-content:flex-end;gap:8px}html[data-theme="dark"] .retentionPanel.returning{background:linear-gradient(135deg,rgba(111,87,22,.3),var(--panel))}@media(max-width:620px){.retentionPanel{align-items:stretch;flex-direction:column}.retentionActions{display:grid;grid-template-columns:1fr 1fr}.weeklyReportCard{padding:18px 14px}.weeklyReportStats{grid-template-columns:1fr 1fr}.weeklyReportEvidence{grid-template-columns:1fr}.weeklyReportActions{display:grid;grid-template-columns:1fr 1fr}}`;
document.head.appendChild(style);renderRetention();window.HOT100_RETENTION={summary:weeklySummary,render:renderRetention,openWeeklyReport,startRecovery,dayDistance,version:RETENTION_VERSION};
})();
