(()=>{
// Long-term study/product pass. Keep lesson content intact; improve continuity, review and diagnostics.
state.positions = state.positions || {};
state.lastTouched = state.lastTouched || {};
state.attempts = state.attempts || {};
state.reviewing = state.reviewing || null;

function localYmd(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function localDue(days){const d=new Date();d.setDate(d.getDate()+days);return localYmd(d)}
function touch(slug){if(slug)state.lastTouched[slug]=Date.now()}
function dueReviewFor(slug){return state.reviewQueue.find(r=>r.slug===slug&&r.due<=localYmd())||null}
function masteryOf(p){
  const started=doneCards(p.slug).length>0;
  const solved=state.solved[p.slug];
  if(dueReviewFor(p.slug)) return {key:'待复习',label:'待复习',cls:'review'};
  if(!solved) return started?{key:'学习中',label:'学习中',cls:'learning'}:{key:'未开始',label:'未开始',cls:'new'};
  if(solved.level==='solo') return {key:'已掌握',label:'已掌握',cls:'mastered'};
  if(solved.level==='hint') return {key:'基本掌握',label:'基本掌握',cls:'basic'};
  return {key:'需加强',label:'需加强',cls:'weak'};
}
function resumeIndexFor(p){
  const n=Number(state.positions[p.slug]);
  if(Number.isFinite(n)) return Math.max(0,Math.min(CARD_COUNT,n));
  if(state.solved[p.slug]) return CARD_COUNT;
  return 0;
}
function reviewStartIndex(p){
  const level=state.solved[p.slug]?.level;
  if(level==='solo') return 6; // full coding
  if(level==='hint') return 4; // fill -> trace -> full
  return 0;                   // relearn
}

// Local-date review scheduling, avoiding UTC date rollover around midnight in Asia.
scheduleReview=function(p,level){
  const days=level==='solo'?4:level==='hint'?2:1;
  const type=level==='solo'?'完整题回忆':level==='hint'?'代码回忆':'重新学习并做题';
  const old=state.reviewQueue.find(r=>r.slug===p.slug);
  const item={slug:p.slug,due:localDue(days),type};
  if(old) Object.assign(old,item); else state.reviewQueue.push(item);
};

// Per-problem position. Review sessions deliberately do not overwrite the normal resume point.
openProblem=function(index){
  state.reviewing=null;
  state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,index));
  const p=current();
  state.deckIndex=resumeIndexFor(p);
  touch(p?.slug);persist();showPage('deck');
};
window.openHot100Review=function(index){
  state.currentProblem=Math.max(0,Math.min(CURRICULUM.length-1,index));
  const p=current();
  const item=state.reviewQueue.find(r=>r.slug===p.slug)||null;
  state.reviewing={slug:p.slug,type:item?.type||'复习',openedAt:new Date().toISOString()};
  state.deckIndex=reviewStartIndex(p);
  touch(p.slug);persist();showPage('deck');
};
nextProblem=function(){
  state.reviewing=null;
  if(state.currentProblem<CURRICULUM.length-1){
    state.currentProblem+=1;const p=current();state.deckIndex=resumeIndexFor(p);touch(p?.slug);save();renderCard();window.scrollTo({top:0,behavior:'smooth'});
  }else showPage('home');
};
nextCard=function(){
  const p=current();state.deckIndex=state.deckIndex<CARD_COUNT-1?state.deckIndex+1:CARD_COUNT;
  if(!state.reviewing&&p) state.positions[p.slug]=state.deckIndex;
  touch(p?.slug);save();renderCard();window.scrollTo({top:0,behavior:'smooth'});
};
prevCard=function(){
  const p=current();if(state.deckIndex>0)state.deckIndex-=1;
  if(!state.reviewing&&p) state.positions[p.slug]=state.deckIndex;
  touch(p?.slug);save();renderCard();window.scrollTo({top:0,behavior:'smooth'});
};

const productBaseShowPage=showPage;
showPage=function(name){
  if(name==='deck'&&!state.reviewing){const p=current();if(p)state.deckIndex=resumeIndexFor(p)}
  if(name==='deck')touch(current()?.slug);
  return productBaseShowPage(name);
};

// Completion screen behaves differently during a review session.
const productBaseRenderCard=renderCard;
renderCard=function(){
  productBaseRenderCard();
  const p=current();
  if(!p)return;
  if(!state.reviewing&&state.deckIndex<=CARD_COUNT) state.positions[p.slug]=state.deckIndex;
  const head=$('page-deck')?.querySelector('.deckHead');
  head?.querySelector('.reviewBadge')?.remove();
  if(state.reviewing&&head){
    const badge=document.createElement('span');badge.className='reviewBadge';badge.textContent=`复习模式 · ${state.reviewing.type}`;head.appendChild(badge);
  }
  if(state.deckIndex>=CARD_COUNT){
    if(!state.reviewing){
      const again=$('again');again?.addEventListener('click',()=>{state.positions[p.slug]=0;touch(p.slug);persist()});
    }else{
      const next=$('nextProblem');
      if(next){const clone=next.cloneNode(true);next.replaceWith(clone);clone.textContent='返回复习';clone.addEventListener('click',()=>{state.reviewing=null;persist();showPage('review')})}
      const home=$('doneHome');
      if(home){const clone=home.cloneNode(true);home.replaceWith(clone);clone.addEventListener('click',()=>{state.reviewing=null;persist();showPage('home')})}
      const again=$('again');
      if(again){const clone=again.cloneNode(true);again.replaceWith(clone);clone.textContent='再复习一次';clone.addEventListener('click',()=>{state.deckIndex=reviewStartIndex(p);renderCard()})}
    }
  }
};

// Problem bank: search + topic/difficulty + useful study states.
let productFilter='全部', productQuery='', productTopic='全部知识点', productDifficulty='全部难度';
const productBaseRenderHome=renderHome;
renderHome=function(){
  productBaseRenderHome();
  const due=state.reviewQueue.filter(r=>r.due<=localYmd()).length;
  if($('homeReview'))$('homeReview').textContent=due;
  const p=current();if(p&&$('resumeBtn'))$('resumeBtn').textContent=state.reviewing?'继续复习':`继续 · ${p.title}`;
};
renderProblems=function(){
  const holder=$('page-problems')?.querySelector('.filterRow');
  const topics=[...new Set(CURRICULUM.map(p=>p.topic))];
  if(holder){
    holder.innerHTML=`<div class="bankTools"><input id="problemSearch" class="bankSearch" placeholder="搜索题名、英文、LeetCode 编号" value="${esc(productQuery)}"><select id="topicFilter" class="bankSelect"><option>全部知识点</option>${topics.map(t=>`<option ${t===productTopic?'selected':''}>${esc(t)}</option>`).join('')}</select><select id="difficultyFilter" class="bankSelect"><option>全部难度</option>${['Easy','Medium','Hard'].map(x=>`<option ${x===productDifficulty?'selected':''}>${x}</option>`).join('')}</select></div><div class="quickFilters">${['全部','未开始','学习中','待复习','需加强','基本掌握','已掌握','最近'].map(x=>`<button class="filter ${x===productFilter?'active':''}" data-pfilter="${x}">${x}</button>`).join('')}</div>`;
    $('problemSearch')?.addEventListener('input',e=>{productQuery=e.target.value;renderProblems()});
    $('topicFilter')?.addEventListener('change',e=>{productTopic=e.target.value;renderProblems()});
    $('difficultyFilter')?.addEventListener('change',e=>{productDifficulty=e.target.value;renderProblems()});
    document.querySelectorAll('[data-pfilter]').forEach(b=>b.addEventListener('click',()=>{productFilter=b.dataset.pfilter;renderProblems()}));
  }
  const q=productQuery.trim().toLowerCase();
  let rows=CURRICULUM.map((p,i)=>({p,i,status:masteryOf(p),touched:Number(state.lastTouched[p.slug]||0)})).filter(x=>{
    const {p,status,touched}=x;
    if(productTopic!=='全部知识点'&&p.topic!==productTopic)return false;
    if(productDifficulty!=='全部难度'&&p.difficulty!==productDifficulty)return false;
    if(q&&!`${p.number} ${p.title} ${p.titleEn} ${p.slug} ${p.topic}`.toLowerCase().includes(q))return false;
    if(productFilter==='最近')return touched>0;
    if(productFilter!=='全部'&&status.key!==productFilter)return false;
    return true;
  });
  if(productFilter==='最近')rows.sort((a,b)=>b.touched-a.touched);
  $('problemList').innerHTML=rows.length?rows.map(({p,i,status})=>{
    const pos=resumeIndexFor(p),progress=pos>0&&pos<CARD_COUNT?` · 第 ${pos+1}/8 步`:'';
    return `<button class="card problem" data-problem="${i}"><span class="problemNum">${p.number}</span><span><span class="problemTitle">${esc(p.title)}</span><span class="problemMeta">${esc(p.titleEn)} · ${esc(p.topic)} · ${p.difficulty}${progress}</span></span><span class="problemState status-${status.cls}">${status.label}</span></button>`;
  }).join(''):'<div class="card empty"><b>没有符合条件的题目</b><p class="muted">换一个筛选条件或清空搜索词。</p></div>';
  document.querySelectorAll('[data-problem]').forEach(b=>b.addEventListener('click',()=>openProblem(Number(b.dataset.problem))));
};

// Knowledge map shows learning quality, not just whether a question has ever passed once.
renderKnowledge=function(){
  const topics=[...new Set(CURRICULUM.map(p=>p.topic))];
  $('knowledgeGrid').innerHTML=topics.map((topic,i)=>{
    const ps=CURRICULUM.filter(p=>p.topic===topic);
    const mastered=ps.filter(p=>state.solved[p.slug]?.level==='solo').length;
    const basic=ps.filter(p=>state.solved[p.slug]?.level==='hint').length;
    const weak=ps.filter(p=>state.solved[p.slug]?.level==='hard').length;
    const learning=ps.filter(p=>!state.solved[p.slug]&&doneCards(p.slug).length>0).length;
    const due=ps.filter(p=>dueReviewFor(p.slug)).length;
    const pct=Math.round(mastered/ps.length*100);
    return `<div class="card knowledgeCard"><div class="eyebrow">${String(i+1).padStart(2,'0')}</div><h3>${esc(topic)}</h3><p>${ps.map(p=>p.title).join('、')}</p><div class="masterTrack"><div style="width:${pct}%"></div></div><div class="knowledgeStats"><span>已掌握 ${mastered}</span><span>基本 ${basic}</span><span>需加强 ${weak}</span>${learning?`<span>学习中 ${learning}</span>`:''}${due?`<span>待复习 ${due}</span>`:''}</div><div class="knowledgeBottom"><span>真正掌握 ${mastered} / ${ps.length}</span><span>${pct}%</span></div></div>`;
  }).join('');
};

// Real review mode: difficulty of the review matches the student's last completion rating.
renderReview=function(){
  const now=localYmd();
  const due=state.reviewQueue.filter(r=>r.due<=now).sort((a,b)=>a.due.localeCompare(b.due));
  const future=state.reviewQueue.filter(r=>r.due>now).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,8);
  if(!due.length&&!future.length){$('reviewArea').innerHTML='<div class="card empty"><b>还没有复习任务</b><p class="muted">完成完整题并记录完成情况后，这里会自动安排。</p></div>';return}
  const html=r=>{const i=CURRICULUM.findIndex(p=>p.slug===r.slug),p=CURRICULUM[i];if(!p)return'';const level=state.solved[p.slug]?.level;const plan=level==='solo'?'直接完整编程':level==='hint'?'补空 → 执行 → 完整编程':'从直觉重新学习';return `<button class="card reviewItem" data-review="${i}"><span><strong>${esc(p.title)}</strong><div class="problemMeta">${esc(plan)} · ${esc(r.type)}</div></span><span class="due">${r.due<=now?'今天':r.due}</span></button>`};
  $('reviewArea').innerHTML=`${due.length?`<div class="sectionHead"><div><h3>今天要复习 · ${due.length}</h3><p>根据上次完成情况，从不同步骤开始。</p></div></div><div class="reviewList">${due.map(html).join('')}</div>`:''}${future.length?`<div class="sectionHead"><div><h3>之后</h3></div></div><div class="reviewList">${future.map(html).join('')}</div>`:''}`;
  document.querySelectorAll('[data-review]').forEach(b=>b.addEventListener('click',()=>window.openHot100Review(Number(b.dataset.review))));
};

const specialDebugHints={
  'two-sum':['检查 seen 里保存的是“值 → 下标”还是相反。','检查你是不是先查 need，再把当前 x 存进 seen；顺序反了会把自己配给自己。'],
  'lru-cache':['先单独验证 _remove 和 _insert_right 的四条指针是否都接回去了。','淘汰时应删 left.next，并同时从 cache 里 del 对应 key。'],
  'implement-trie-prefix-tree':['检查 search 最后是否要求 node.end=True；路径存在只代表前缀存在。','insert 遇到不存在字符时要创建节点，再把 node 移到那个孩子。'],
  'median-of-two-sorted-arrays':['先检查 i+j 是否始终等于 half，再看两个交叉条件 Aleft≤Bright、Bleft≤Aright。','若 Aleft>Bright，A 的切线太靠右；若 Bleft>Aright，A 的切线太靠左。'],
  'find-median-from-data-stream':['先检查两堆大小差是否最多 1，以及 small 的真实最大值是否用 -small[0] 读取。','Python heapq 是最小堆；small 中存的是负数，搬运元素时正负号最容易写反。'],
  'n-queens':['检查冲突集合是否分别是列 c、主对角线 r-c、副对角线 r+c。','递归返回后 board、cols、diag1、diag2 四处状态都必须撤销。'],
  'course-schedule':['先确认 prerequisites=[course,pre] 画的是 pre → course，而不是反过来。','只有 indeg 变成 0 的课程才能入队；最终看 done 是否等于课程总数。'],
  'largest-rectangle-in-histogram':['弹出 mid 后，新的栈顶才是左边第一个更矮的位置；宽度是 i-left-1。','别漏掉末尾哨兵 0，否则最后一段递增柱子不会被结算。'],
  'partition-equal-subset-sum':['一维 0/1 背包必须倒序枚举容量，避免同一个 x 在这一轮被重复使用。','先检查总和是否为奇数；奇数不可能平分。'],
  'longest-valid-parentheses':['stack=[-1] 的 -1 是“最近断点”哨兵；遇到无法匹配的 ) 要把当前下标设为新断点。','成功匹配后长度是 i-stack[-1]，不是简单乘 2。'],
  'edit-distance':['先确认 dp[i][j] 的含义是“word1 前 i 个 → word2 前 j 个”。','末尾不同：删除看上、插入看左、替换看左上，三者取最小再 +1。'],
  'next-permutation':['从右找第一个 nums[i] < nums[i+1]；如果不存在，就反转整个数组。','交换后只反转 i+1 之后的后缀，才能得到“刚好下一个”排列。'],
  'find-the-duplicate-number':['把 nums[i] 当成 next：slow=nums[slow]，fast=nums[nums[fast]]。','第一次相遇不是答案；第二阶段从 nums[0] 重新出发，两边都一步一步走到环入口。']
};
const topicDebugHints={
  '哈希表':['检查 key 和 value 是否存反，以及“查找”和“写入”的先后顺序。'],
  '双指针':['画出两个指针每次移动前后的位置，确认没有漏元素或重复处理。'],
  '滑动窗口':['检查右指针扩张后何时收缩左边界，以及窗口计数是否在移动时同步更新。'],
  '链表':['改 next 之前先保存后继；再检查返回的是新头还是旧头。'],
  '二叉树':['先写清递归函数“返回什么”，再检查空节点的 base case。'],
  '图论':['检查 visited/入度何时更新；通常应在入队或进入节点时立刻标记，避免重复。'],
  '回溯':['每次选择后进入递归，返回时必须把刚才修改的 path/集合/棋盘完整撤销。'],
  '二分查找':['先写清搜索区间是 [l,r] 还是 [l,r)，再逐个检查 mid 是否仍可能是答案。'],
  '栈':['检查栈里存的是值还是下标，以及弹栈时到底确定了谁的答案。'],
  '堆':['Python heapq 是最小堆；检查堆大小、正负号和弹出的究竟是不是应该淘汰的候选。'],
  '贪心':['检查当前局部选择之后，是否仍保留了完成剩余问题的可能性。'],
  '动态规划':['先写一句 dp 状态的人话含义，再检查初始化、遍历顺序和每个转移来源。'],
  '中心扩展':['奇数中心 (i,i) 和偶数中心 (i,i+1) 都要覆盖；扩出界后边界要退一步。'],
  '技巧':['先把题目转换成已经学过的结构，再检查转换关系是否一一对应。']
};
function debugHintFor(p,attempt){
  const list=specialDebugHints[p.slug]||topicDebugHints[p.topic]||[(window.HOT100_HANDCRAFTED||{})[p.slug]?.full?.guide||p.concept];
  return list[Math.min(Math.max(0,attempt-1),list.length-1)];
}
function runtimeErrorHint(msg){
  if(/IndentationError|unexpected indent|expected an indented block/i.test(msg))return '这是缩进问题。先检查冒号 : 后面的代码是否统一缩进 4 个空格。';
  if(/NameError/i.test(msg))return '这是变量名/作用域问题。检查拼写，以及变量是否在使用前已经定义。';
  if(/TypeError/i.test(msg))return '这是数据类型不匹配。检查你把节点、下标、值、列表中的哪一种传给了当前操作。';
  if(/IndexError/i.test(msg))return '这是下标越界。重点检查循环边界、left/right 和 i±1。';
  return '先看报错最后一行，再回到本题“代码补空”和“执行追踪”，定位出错变量第一次偏离预期的位置。';
}

// Editor feedback: show the failing case/output and a problem-specific next debugging step.
bindEditorCard=function(p){
  const ed=$('editor'),out=$('output');let passed=Boolean(state.solved[p.slug]),rated=Boolean(state.solved[p.slug]);
  ed.value=state.codes[p.slug]??p.starter;enablePythonIndent(ed);
  ed.addEventListener('input',()=>{state.codes[p.slug]=ed.value;touch(p.slug);persist()});
  $('skeleton').addEventListener('click',()=>{ed.value=p.starter;state.codes[p.slug]=p.starter;persist();ed.focus();ed.selectionStart=ed.selectionEnd=ed.value.length});
  $('run').addEventListener('click',async()=>{
    out.className='runner';out.textContent='正在运行测试...';$('pyStatus').textContent='Python 初始化中';
    state.attempts[p.slug]=(state.attempts[p.slug]||0)+1;touch(p.slug);persist();
    try{
      const py=await getPy();$('pyStatus').textContent='Python 已就绪';
      const extra=window.HOT100_PY_EXTRA||'';const code=PY_PRELUDE+'\n'+extra+'\n'+ed.value+'\n'+p.judge+'\njson.dumps(_results, ensure_ascii=False)';
      const raw=await py.runPythonAsync(code),results=JSON.parse(raw),count=results.filter(r=>r.ok).length;passed=results.length>0&&count===results.length;
      out.className=`runner ${passed?'pass':'fail'}`;
      const lines=results.map((r,i)=>`<div class="testLine ${r.ok?'ok':'bad'}"><b>测试 ${i+1} · ${r.ok?'通过':'未通过'}</b>${r.ok?'':`<small>用例：${esc(r.case)}</small><small>你的结果：${esc(r.got)}</small>`}</div>`).join('');
      const hint=passed?'':`<div class="debugAssist"><b>先检查这里</b><p>${esc(debugHintFor(p,state.attempts[p.slug]))}</p></div>`;
      out.innerHTML=`<b>${count} / ${results.length} 组测试通过</b>${lines}${hint}`;
      $('rateArea').style.display=passed?'block':'none';
    }catch(err){
      passed=false;out.className='runner fail';const msg=err.message||String(err);out.innerHTML=`<b>运行失败</b><p class="errorText">${esc(msg)}</p><div class="debugAssist"><b>先检查这里</b><p>${esc(runtimeErrorHint(msg))}</p></div>`;
    }
  });
  if(rated){$('rateArea').style.display='block';document.querySelector(`[data-rate="${state.solved[p.slug].level}"]`)?.classList.add('selected')}
  document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>{if(!passed)return;document.querySelectorAll('[data-rate]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');rated=true;const level=b.dataset.rate;state.solved[p.slug]={level,completedAt:new Date().toISOString()};scheduleReview(p,level);save()}));
  bindFooter(()=>{if(!passed){out.className='runner fail';out.textContent='先通过测试，再继续。';return false}if(!rated){out.className='runner fail';out.textContent='请选择完成情况，再继续。';return false}return true});
};

const style=document.createElement('style');
style.textContent=`
.bankTools{display:grid;grid-template-columns:minmax(220px,1fr) 180px 140px;gap:8px;width:100%}.bankSearch,.bankSelect{border:1px solid var(--line);background:#fff;border-radius:11px;padding:10px 12px;font:inherit;color:var(--text);min-height:40px}.quickFilters{display:flex;gap:7px;overflow-x:auto;padding:2px 0 1px;width:100%;scrollbar-width:none}.quickFilters::-webkit-scrollbar{display:none}.filterRow{display:flex!important;flex-direction:column;align-items:stretch!important;gap:9px!important}.problemState{border-radius:999px;padding:5px 9px}.status-review{background:#fff4d8;color:#8a5a00}.status-weak{background:var(--badbg);color:var(--bad)}.status-basic{background:#eef3ff;color:#3f5da8}.status-mastered{background:var(--goodbg);color:var(--good)}.status-learning{background:#f3f0ff;color:#6652a3}.knowledgeStats{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.knowledgeStats span{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 7px;color:var(--muted)}.reviewBadge{font-size:11px;border:1px solid #e6d59c;background:#fff8df;border-radius:999px;padding:5px 8px;margin-left:auto;white-space:nowrap}.testLine{margin-top:9px;padding-top:9px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:3px}.testLine small{font-size:12px;line-height:1.45}.debugAssist{margin-top:12px;padding:11px 12px;border:1px solid #e7d89f;background:#fff9e8;border-radius:10px;color:var(--text)}.debugAssist b{font-size:12px}.debugAssist p,.errorText{margin:5px 0 0;font-size:12px;line-height:1.6}.errorText{white-space:pre-wrap}.due{white-space:nowrap}
@media(max-width:720px){.bankTools{grid-template-columns:1fr 1fr}.bankSearch{grid-column:1/-1}.reviewBadge{display:none}}
`;
document.head.appendChild(style);

// Refresh once with the upgraded renderers. This also persists newly introduced state fields.
persist();
renderHome();renderProblems();renderKnowledge();renderReview();renderSide();
if(state.lastPage==='deck')renderCard();
})();