(()=>{
function hashSeed(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shuffled(arr,seedText){const a=[...arr];let x=hashSeed(seedText)||1;for(let i=a.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}

// 1) 选择题不要把正确答案固定在第一个位置；data-* 仍保留原始下标，因此判题逻辑不变。
renderHandChoice=function(prefix,q){
  const slug=(typeof current==='function'&&current())?.slug||'';
  const items=q.options.map((o,i)=>({o,i}));
  const order=shuffled(items,`${slug}:${prefix}:${q.q}`);
  return `<div class="choiceGrid">${order.map(x=>`<button class="choice" data-${prefix}="${x.i}">${esc(x.o)}</button>`).join('')}</div>`;
};

// 2) 补空按“代码中的实际出现顺序”判定，并只挖掉每个 target 的一次出现；token 也打乱。
handcraftedFill=function(p,cfg){
  const targets=[...(cfg.fill.targets||[])];
  const used=new Set();
  const expected=[];
  const lines=p.pattern.split('\n');
  const html=lines.map(line=>{
    const trim=line.trim();
    const indent=(line.match(/^\s*/)||[''])[0].replace(/ /g,'&nbsp;');
    let targetIndex=-1;
    for(let i=0;i<targets.length;i++){
      if(!used.has(i)&&targets[i]===trim){targetIndex=i;break}
    }
    if(targetIndex>=0){
      used.add(targetIndex);
      const slot=expected.length;
      expected.push(targets[targetIndex]);
      return `${indent}<span class="blank" data-b="${slot}">______</span>`;
    }
    return `${indent}${esc(trim)}`;
  }).join('<br>');
  const missing=targets.filter((_,i)=>!used.has(i));
  if(missing.length) console.warn('[Hot100 QA] fill targets not found in pattern:',p.slug,missing);
  const distractors=(cfg.fill.distractors||[]).filter(x=>!expected.includes(x));
  const tokens=shuffled([...expected,...distractors],`${p.slug}:fill`).slice(0,Math.max(5,expected.length+2));
  return {html,expected,tokens};
};

// 3) 长答案先讲关键句，再按需展开；完整题给分层提示，避免只剩一个 pass 时突然跳太远。
const qualityBaseBuildCards=buildCards;
buildCards=function(p){
  const cards=qualityBaseBuildCards(p);
  const cfg=(window.HOT100_HANDCRAFTED||{})[p.slug];
  if(!cfg||p.slug==='two-sum') return cards;

  const syntax=cards.find(c=>c.id==='syntax');
  if(syntax&&p.pattern.split('\n').length>14){
    const oldRender=syntax.render;
    syntax.render=()=>{
      const html=oldRender();
      const full=`<div class="codeBlock">${esc(p.pattern)}</div>`;
      const folded=`<details class="qaDetails"><summary>这题代码较长，先看下面逐句解释；需要时再展开完整结构</summary>${full}</details>`;
      return html.replace(full,folded);
    };
  }

  const full=cards.find(c=>c.id==='full');
  if(full){
    const oldRender=full.render;
    full.render=()=>{
      let html=oldRender();
      const hints=`<details class="qaDetails qaHints"><summary>卡住了？按层查看提示</summary>
        <div class="qaHint"><b>提示 1 · 思路</b><p>${esc(cfg.full.guide||p.concept)}</p></div>
        <div class="qaHint"><b>提示 2 · 代码结构</b><p>${esc(cfg.syntax?.summary||p.concept)}</p></div>
        <details class="qaDetails qaReference"><summary>提示 3 · 查看参考代码结构</summary><div class="codeBlock">${esc(p.pattern)}</div></details>
      </details>`;
      html=html.replace('<div class="editorToolbar">',hints+'<div class="editorToolbar">');
      return html;
    };
  }
  return cards;
};

// 4) 运行时内容体检：不打断学习，但把遗漏暴露出来，后续编辑时可直接定位。
const curriculum=window.HOT100_CURRICULUM||[];
const handcrafted=window.HOT100_HANDCRAFTED||{};
const intros=window.HOT100_BEGINNER_INTUITION||{};
const lessons=window.HOT100_LESSONS||{};
const seen=new Set(),duplicates=[],missingHandcrafted=[],missingIntro=[],missingTrace=[],missingFillTargets=[];
for(const p of curriculum){
  if(seen.has(p.slug)) duplicates.push(p.slug); else seen.add(p.slug);
  if(p.slug!=='two-sum'&&!handcrafted[p.slug]) missingHandcrafted.push(p.slug);
  if(p.slug!=='two-sum'&&!intros[p.slug]) missingIntro.push(p.slug);
  if(p.slug!=='two-sum'&&(!lessons[p.slug]||!(lessons[p.slug].trace||[]).length)) missingTrace.push(p.slug);
  const cfg=handcrafted[p.slug];
  if(cfg?.fill?.targets){
    const lines=new Set(String(p.pattern||'').split('\n').map(x=>x.trim()));
    for(const t of cfg.fill.targets) if(!lines.has(t)) missingFillTargets.push(`${p.slug}: ${t}`);
  }
}
window.HOT100_QUALITY_AUDIT={
  total:curriculum.length,
  duplicateSlugs:duplicates,
  missingHandcrafted,
  missingIntro,
  missingTrace,
  missingFillTargets,
  passOnlyStarters:curriculum.filter(p=>/\n\s*pass\s*$/.test(p.starter||'')).map(p=>p.slug)
};
if(curriculum.length!==100||duplicates.length||missingHandcrafted.length||missingIntro.length||missingTrace.length||missingFillTargets.length){
  console.warn('[Hot100 QA] content audit',window.HOT100_QUALITY_AUDIT);
}

const style=document.createElement('style');
style.textContent=`
.qaDetails{margin:12px 0;border:1px solid var(--line);border-radius:12px;background:#fafbfe;overflow:hidden}
.qaDetails>summary{cursor:pointer;padding:12px 14px;font-size:13px;font-weight:650;color:var(--text)}
.qaDetails>.codeBlock{margin:0 12px 12px}
.qaHints{margin:12px 0 14px}.qaHint{padding:0 14px 12px}.qaHint b{font-size:12px}.qaHint p{margin:5px 0 0;color:var(--muted);font-size:13px;line-height:1.65}
.qaReference{margin:0 12px 12px;background:#fff}
`;
document.head.appendChild(style);
})();