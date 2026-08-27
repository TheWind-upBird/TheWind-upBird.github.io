const handcraftedBaseBuilder = buildCards;

function handcraftedFill(p, cfg){
  const targets = cfg.fill.targets || [];
  const lines = p.pattern.split('\n');
  const slots = new Map(targets.map((t,i)=>[t,i]));
  const found = new Set();
  const html = lines.map(line=>{
    const trim=line.trim();
    const indent=(line.match(/^\s*/)||[''])[0].replace(/ /g,'&nbsp;');
    if(slots.has(trim)){
      found.add(trim);
      return `${indent}<span class="blank" data-b="${slots.get(trim)}">______</span>`;
    }
    return `${indent}${esc(trim)}`;
  }).join('<br>');
  const missing=targets.filter(t=>!found.has(t));
  const extra=missing.length?`<br><span class="muted">本题还需要补：${missing.map(esc).join('；')}</span>`:'';
  return {html:html+extra, expected:targets, tokens:[...targets,...(cfg.fill.distractors||[])].slice(0,Math.max(5,targets.length+2))};
}

function renderHandChoice(prefix, q){
  return `<div class="choiceGrid">${q.options.map((o,i)=>`<button class="choice" data-${prefix}="${i}">${esc(o)}</button>`).join('')}</div>`;
}

function bindHandChoice(prefix, q, fbId, expId){
  let ok=false;
  document.querySelectorAll(`[data-${prefix}]`).forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll(`[data-${prefix}]`).forEach(x=>x.classList.remove('correct','wrong'));
    ok=Number(b.dataset[prefix])===q.answer;
    b.classList.add(ok?'correct':'wrong');
    $(fbId).className=`feedback ${ok?'good':'bad'}`;
    $(fbId).textContent=ok?'正确。先看下面的解析。':'还不对。再回到上面的具体例子想一次。';
    $(expId).style.display=ok?'block':'none';
  }));
  return ()=>ok;
}

function buildHandcraftedCards(p,cfg){
  const record=window.SOLVESHIFT_CONTENT?.get(p.slug);
  const intro=record?.teaching.intro||(window.HOT100_BEGINNER_INTUITION||{})[p.slug]||{};
  const lesson=record?.teaching.lesson||lessonFor(p);
  const fill=handcraftedFill(p,cfg);
  return [
    {
      id:'intuition',step:'建立直觉',
      render(){return `${header('learn','知识','建立直觉')}<div class="cardBody">
        <h2>${esc(intro.title||`${p.title}：先从例子开始`)}</h2>
        <div class="bigPrompt">${esc(intro.example||lesson.example||p.title)}</div>
        <p>${esc(intro.observe||p.concept)}</p>
        <div class="callout"><b>先想这个问题</b><br><span class="muted">${esc(intro.question||'这一步到底在解决什么重复工作？')}</span></div>
        <div class="callout" style="margin-top:12px"><b>为什么这样做</b><br><span class="muted">${esc(intro.answer||p.concept)}</span></div>
      </div>${footer()}`},
      bind(){bindFooter()}
    },
    {
      id:'syntax',step:'Python 语法',
      render(){return `${header('code','Python','Python 语法')}<div class="cardBody">
        <h2>先把这道题会用到的代码逐句看懂</h2>
        <div class="codeBlock">${esc(p.pattern)}</div>
        <div class="syntaxGrid">${cfg.syntax.items.map(x=>`<div class="syntaxItem"><code>${esc(x[0])}</code><small>${esc(x[1])}</small></div>`).join('')}</div>
        <div class="callout"><b>把这些代码连起来</b><br><span class="muted">${esc(cfg.syntax.summary)}</span></div>
      </div>${footer()}`},
      bind(){bindFooter()}
    },
    {
      id:'translate',step:'思路 → 代码',
      render(){return `${header('practice','练习','思路 → 代码')}<div class="cardBody">
        <h2>${esc(p.quiz.q)}</h2>${renderHandChoice('q',p.quiz)}
        <div class="feedback" id="qfb"></div>
        <div class="callout" id="qexp" style="display:none"><b>解析</b><br><span class="muted">${esc(p.quiz.explain)}</span></div>
      </div>${footer('答对后继续 →')}`},
      bind(){const check=bindHandChoice('q',p.quiz,'qfb','qexp');bindFooter(()=>{if(!check()){$('qfb').className='feedback bad';$('qfb').textContent='先选对并看完解析，再继续。';return false}return true})}
    },
    {
      id:'meaning',step:'代码理解',
      render(){const q=cfg.meaning;return `${header('practice','练习','代码理解')}<div class="cardBody">
        <h2>${esc(q.q)}</h2>${renderHandChoice('m',q)}
        <div class="feedback" id="mfb"></div>
        <div class="callout" id="mexp" style="display:none"><b>解析</b><br><span class="muted">${esc(q.explain)}</span></div>
      </div>${footer('答对后继续 →')}`},
      bind(){const q=cfg.meaning,check=bindHandChoice('m',q,'mfb','mexp');bindFooter(()=>{if(!check()){$('mfb').className='feedback bad';$('mfb').textContent='先选对并看完解析，再继续。';return false}return true})}
    },
    {
      id:'fill',step:'代码补空',
      render(){return `${header('code','代码补空','代码补空')}<div class="cardBody">
        <h2>把 ${esc(p.title)} 的关键代码补出来</h2><p class="muted">只补最关键的几行，重点是知道每一行为什么出现在这里。</p>
        <div class="fillLine">${fill.html}</div>
        <div class="tokenBank">${fill.tokens.map(t=>`<button class="token" data-token="${esc(t)}">${esc(t)}</button>`).join('')}</div>
        <button class="secondary" id="clearFill">清空</button>
        <div class="feedback" id="ffb"></div>
        <div class="callout" id="fillExp" style="display:none;margin-top:12px"><b>解析</b><br><span class="muted">${esc(cfg.fill.explain)}</span></div>
      </div>${footer('检查答案')}`},
      bind(){let vals=[],explained=false;const draw=()=>document.querySelectorAll('[data-b]').forEach((e,i)=>e.textContent=vals[i]||'______');
        document.querySelectorAll('[data-token]').forEach(b=>b.addEventListener('click',()=>{if(!explained&&vals.length<fill.expected.length){vals.push(b.dataset.token);draw()}}));
        $('clearFill').addEventListener('click',()=>{vals=[];explained=false;draw();$('ffb').textContent='';$('fillExp').style.display='none';$('nextCard').textContent='检查答案'});
        bindFooter(()=>{if(explained)return true;const ok=JSON.stringify(vals)===JSON.stringify(fill.expected);$('ffb').className=`feedback ${ok?'good':'bad'}`;if(!ok){$('ffb').textContent='还不对。不要按选项长度猜，按代码真正执行的顺序来补。';return false}$('ffb').textContent='答案正确。先看下面逐步解析。';$('fillExp').style.display='block';$('nextCard').textContent='继续 →';explained=true;return false})
      }
    },
    {
      id:'trace',step:'执行过程',
      render(){const l=lesson.traceLabels||['当前','状态','结果'];return `${header('practice','执行过程','执行追踪')}<div class="cardBody">
        <h2>用具体输入看 ${esc(p.title)} 一步一步怎么跑</h2>
        <div class="bigPrompt">${esc(lesson.example||intro.example||p.title)}</div>
        <div class="traceGrid"><div class="traceBox"><small>${esc(l[0])}</small><strong id="ta">—</strong></div><div class="traceBox"><small>${esc(l[1])}</small><strong id="tb">—</strong></div><div class="traceBox"><small>${esc(l[2])}</small><strong id="tc" style="font-size:14px">—</strong></div></div>
        <div class="callout" id="tm">点击“运行一步”。</div>
        <div style="display:flex;gap:8px"><button class="soft" id="traceNext">运行一步 ▶</button><button class="secondary" id="traceReset">重来</button></div>
        <div class="codeBlock">${esc(p.pattern)}</div>
      </div>${footer()}`},
      bind(){let i=-1,returned=false;const steps=lesson.trace||[];function draw(){if(i<0){$('ta').textContent='—';$('tb').textContent='—';$('tc').textContent='—';$('tm').textContent='点击“运行一步”。';$('traceNext').disabled=false;$('traceNext').textContent='运行一步 ▶';return}const s=steps[i];$('ta').textContent=s.a??'—';$('tb').textContent=s.b??'—';$('tc').textContent=s.c??'—';$('tm').textContent=s.message||'';returned=Boolean(s.returned);if(returned){$('traceNext').disabled=true;$('traceNext').textContent='函数已返回'}else if(i===steps.length-1){$('traceNext').disabled=true;$('traceNext').textContent='执行结束'}}$('traceNext').addEventListener('click',()=>{if(!returned&&i<steps.length-1){i++;draw()}});$('traceReset').addEventListener('click',()=>{i=-1;returned=false;draw()});draw();bindFooter()}
    },
    {
      id:'full',step:'完整实战',
      render(){return `${header('practice','完整题','完整实战')}<div class="cardBody">
        <h2>现在就在这里完成 ${esc(p.title)}</h2>
        <div class="callout"><b>写之前再确认一次</b><br><span class="muted">${esc(cfg.full.guide)}</span></div>
        <div class="editorToolbar"><b>Python</b><small id="pyStatus">首次运行会加载 Python</small></div>
        <textarea class="editor" id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px"><button class="primary" id="run">▶ 运行测试</button><button class="secondary" id="skeleton">还原起始代码</button></div>
        <div class="runner" id="output">写完后运行测试。</div>
        <div id="rateArea" style="display:none"><div class="sectionHead" style="margin-top:18px"><div><h3>完成情况</h3><p>用于安排复习频率。</p></div></div><div class="resultButtons"><button class="rate" data-rate="solo"><strong>独立写出</strong><small>基本没回看</small></button><button class="rate" data-rate="hint"><strong>回看后写出</strong><small>思路懂，代码还不熟</small></button><button class="rate" data-rate="hard"><strong>比较困难</strong><small>需要尽快复习</small></button></div></div>
      </div>${footer('通过测试并记录后继续 →')}`},
      bind(){bindEditorCard(p)}
    },
    {
      id:'recall',step:'回顾',
      render(){const q=cfg.recall;return `${header('learn','回顾','主动回忆')}<div class="cardBody">
        <h2>${esc(q.q)}</h2>${renderHandChoice('r',q)}
        <div class="feedback" id="rfb"></div>
        <div class="callout" id="rexp" style="display:none"><b>解析</b><br><span class="muted">${esc(q.explain)}</span></div>
      </div>${footer('检查答案')}`},
      bind(){const q=cfg.recall;let ok=false,explained=false;document.querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click',()=>{if(explained)return;document.querySelectorAll('[data-r]').forEach(x=>x.classList.remove('correct','wrong'));ok=Number(b.dataset.r)===q.answer;b.classList.add(ok?'correct':'wrong');$('rfb').className=`feedback ${ok?'good':'bad'}`;$('rfb').textContent=ok?'正确。先看解析。':'还不对。回想这道题从第一张卡到代码里反复出现的核心动作。'}));bindFooter(()=>{if(explained)return true;if(!ok){$('rfb').className='feedback bad';$('rfb').textContent='先选对再继续。';return false}$('rexp').style.display='block';$('nextCard').textContent='完成本题 →';explained=true;return false})}
    }
  ];
}

buildCards=function(p){
  const cfg=window.SOLVESHIFT_CONTENT?.get(p.slug)?.teaching.cards||(window.HOT100_HANDCRAFTED||{})[p.slug];
  return cfg?buildHandcraftedCards(p,cfg):handcraftedBaseBuilder(p);
};
