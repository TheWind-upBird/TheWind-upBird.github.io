const KEY = 'hot100-lab-v2';
const defaults = {
  deckIndex: 0,
  completedCards: [],
  solved: 0,
  mastered: 0,
  twoSumStatus: null,
  reviewQueue: [],
  cardAnswers: {}
};

let state = { ...defaults };
try {
  state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  state.completedCards = state.completedCards || [];
  state.reviewQueue = state.reviewQueue || [];
  state.cardAnswers = state.cardAnswers || {};
} catch (e) {}

const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);

function dueDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function save() {
  persist();
  renderHome();
  renderProblems();
  renderKnowledge();
  renderReview();
}

function showPage(name) {
  document.querySelectorAll('.page').forEach((p) => p.classList.toggle('active', p.id === `page-${name}`));
  document.querySelectorAll('[data-page]').forEach((b) => b.classList.toggle('active', b.dataset.page === name));
  if (name === 'deck') renderCard();
  if (name === 'review') renderReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-page]').forEach((b) => b.addEventListener('click', () => showPage(b.dataset.page)));
$('startDeckBtn').addEventListener('click', () => showPage('deck'));
$('resumeBtn').addEventListener('click', () => showPage('deck'));
$('resetBtn').addEventListener('click', () => {
  if (confirm('重置这个设备上的学习进度？')) {
    localStorage.removeItem(KEY);
    state = { ...defaults, completedCards: [], reviewQueue: [], cardAnswers: {} };
    state.deckIndex = 0;
    save();
    showPage('home');
  }
});

function scheduleReview(id, title, days, type) {
  const due = dueDate(days);
  const old = state.reviewQueue.find((x) => x.id === id);
  if (old) {
    old.due = due;
    old.title = title;
    old.type = type;
  } else {
    state.reviewQueue.push({ id, title, due, type });
  }
}

function completeCard(id) {
  if (!state.completedCards.includes(id)) state.completedCards.push(id);
  save();
}

function next() {
  if (state.deckIndex < cards.length - 1) {
    state.deckIndex += 1;
  } else {
    state.deckIndex = cards.length;
  }
  save();
  renderCard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prev() {
  if (state.deckIndex > 0) state.deckIndex -= 1;
  save();
  renderCard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function header(cls, label) {
  return `<div class="cardType"><span class="typePill ${cls}">${label}</span><span class="muted" style="font-size:12px">${cards[state.deckIndex]?.step || ''}</span></div>`;
}

function footer(label = '继续 →') {
  return `<div class="cardFooter"><small class="muted">完成当前步骤后继续</small><div class="footerActions"><button class="secondary" id="prevCard">← 上一步</button><button class="primary" id="nextCard">${label}</button></div></div>`;
}

function bindFooter(check) {
  const p = $('prevCard');
  if (p) p.addEventListener('click', prev);
  const n = $('nextCard');
  if (n) {
    n.addEventListener('click', () => {
      if (!check || check()) {
        completeCard(cards[state.deckIndex].id);
        next();
      }
    });
  }
}

function enablePythonIndent(editor) {
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const before = editor.value.slice(0, start);
      const after = editor.value.slice(end);
      const lineStart = before.lastIndexOf('\n') + 1;
      const currentLine = before.slice(lineStart);
      const baseIndent = (currentLine.match(/^\s*/) || [''])[0];
      const extraIndent = currentLine.trimEnd().endsWith(':') ? '    ' : '';
      const indent = baseIndent + extraIndent;
      editor.value = `${before}\n${indent}${after}`;
      const pos = start + 1 + indent.length;
      editor.selectionStart = editor.selectionEnd = pos;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      if (e.shiftKey) {
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const removable = editor.value.slice(lineStart, Math.min(lineStart + 4, editor.value.length)).match(/^ {1,4}/)?.[0] || '';
        if (removable) {
          editor.value = editor.value.slice(0, lineStart) + editor.value.slice(lineStart + removable.length);
          const pos = Math.max(lineStart, start - removable.length);
          editor.selectionStart = editor.selectionEnd = pos;
        }
      } else {
        editor.value = editor.value.slice(0, start) + '    ' + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
      }
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

let pyPromise = null;
async function py() {
  if (!pyPromise) {
    if (typeof loadPyodide !== 'function') throw new Error('Python 运行器未加载');
    pyPromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
  }
  return pyPromise;
}

const cards = [
  {
    id: 'intuition',
    step: '建立直觉',
    render() {
      return `${header('learn', '知识')}<div class="cardBody"><h2>为什么要有哈希表？</h2><div class="bigPrompt">[2, 7, 11, 15] 中，哪两个数加起来等于 9？</div><div class="numberRow"><span class="num">2</span><span class="num">7</span><span class="num">11</span><span class="num">15</span></div><p>看到 <b>2</b> 时，下一步是先算还缺多少：</p><div class="callout"><b>9 - 2 = 7</b><br><span class="muted">于是问题变成：7 之前出现过吗？</span></div><p class="muted">哈希表适合快速查询“某个值以前是否出现过”。</p></div>${footer()}`;
    },
    bind() { bindFooter(); }
  },
  {
    id: 'syntax',
    step: 'Python 语法',
    render() {
      return `${header('code', 'Python')}<div class="cardBody"><h2>先看这道题会用到的 Python</h2><div class="codeBlock">seen = {}\nseen[2] = 0\n\nfor i, x in enumerate(nums):\n    if 7 in seen:\n        print(seen[7])</div><div class="syntaxGrid"><div class="syntaxItem"><code>seen = {}</code><small>创建空字典</small></div><div class="syntaxItem"><code>seen[2] = 0</code><small>记录：数字 2 的下标是 0</small></div><div class="syntaxItem"><code>7 in seen</code><small>判断 7 是否已经记录</small></div><div class="syntaxItem"><code>seen[7]</code><small>取出数字 7 对应的下标</small></div><div class="syntaxItem"><code>enumerate(nums)</code><small>同时得到下标 i 和当前值 x</small></div><div class="syntaxItem"><code>for i, x in ...</code><small>例如遍历到 7 时：i = 1，x = 7</small></div></div><div class="callout"><b>Two Sum 返回的是下标，不是数字本身。</b><br><span class="muted">所以 [0, 1] 表示答案在 nums[0] 和 nums[1]，也就是数字 2 和 7。</span></div></div>${footer()}`;
    },
    bind() { bindFooter(); }
  },
  {
    id: 'need',
    step: '思路 → 代码',
    render() {
      return `${header('practice', '练习')}<div class="cardBody"><h2>把“还差多少”写成代码</h2><div class="bigPrompt">当前数字是 <b>x</b>，目标是 <b>target</b>。另一个数应该怎么写？</div><div class="choiceGrid"><button class="choice" data-a="0">need = x - target</button><button class="choice" data-a="1">need = target - x</button><button class="choice" data-a="0">need = target + x</button><button class="choice" data-a="0">need = x</button></div><div class="feedback" id="fb"></div><div class="callout" id="exp" style="display:none"><b>解析</b><br><span class="muted">如果 x = 2，target = 9，那么 need = 9 - 2 = 7。</span></div></div>${footer('答对后继续 →')}`;
    },
    bind() {
      let ok = false;
      document.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
        document.querySelectorAll('[data-a]').forEach((x) => x.classList.remove('correct', 'wrong'));
        ok = b.dataset.a === '1';
        b.classList.add(ok ? 'correct' : 'wrong');
        $('fb').className = `feedback ${ok ? 'good' : 'bad'}`;
        $('fb').textContent = ok ? '正确。' : '“还差多少”应该用目标减当前值。';
        $('exp').style.display = ok ? 'block' : 'none';
      }));
      bindFooter(() => {
        if (!ok) {
          $('fb').className = 'feedback bad';
          $('fb').textContent = '先选对再继续。';
        }
        return ok;
      });
    }
  },
  {
    id: 'order',
    step: '代码顺序',
    render() {
      return `${header('practice', '练习')}<div class="cardBody"><h2>为什么要先查，再存？</h2><div class="bigPrompt">遍历到 x 时，哪个顺序正确？</div><div class="choiceGrid"><button class="choice" data-o="1"><b>① 查 need</b><br><span class="muted">② 存 seen[x]</span></button><button class="choice" data-o="0"><b>① 存 seen[x]</b><br><span class="muted">② 查 need</span></button></div><div class="feedback" id="ofb"></div><div class="callout" id="oexp" style="display:none"><b>解析</b><br><span class="muted">例如 target = 6，当前 x = 3。如果先存 3，再查 3，就可能把同一个元素用两次。</span></div></div>${footer('答对后继续 →')}`;
    },
    bind() {
      let ok = false;
      document.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => {
        document.querySelectorAll('[data-o]').forEach((x) => x.classList.remove('correct', 'wrong'));
        ok = b.dataset.o === '1';
        b.classList.add(ok ? 'correct' : 'wrong');
        $('ofb').className = `feedback ${ok ? 'good' : 'bad'}`;
        $('ofb').textContent = ok ? '正确。' : '这样可能错误使用同一个元素两次。';
        $('oexp').style.display = ok ? 'block' : 'none';
      }));
      bindFooter(() => ok);
    }
  },
  {
    id: 'fill',
    step: '代码补空',
    render() {
      return `${header('code', '代码补空')}<div class="cardBody"><h2>把 Two Sum 的骨架补出来</h2><p class="muted">先补 3 个关键位置。</p><div class="fillLine">seen = {}<br>for i, x in enumerate(nums):<br>&nbsp;&nbsp;&nbsp;&nbsp;need = <span class="blank" data-b="0">______</span><br>&nbsp;&nbsp;&nbsp;&nbsp;if <span class="blank" data-b="1">______</span> in seen:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return [seen[need], i]<br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="blank" data-b="2">______</span> = i</div><div class="tokenBank"><button class="token" data-t="target - x">target - x</button><button class="token" data-t="need">need</button><button class="token" data-t="seen[x]">seen[x]</button><button class="token" data-t="x - target">x - target</button><button class="token" data-t="seen[need]">seen[need]</button></div><button class="secondary" id="clear">清空</button><div class="feedback" id="ffb"></div><div class="callout" id="fillExplain" style="display:none;margin-top:12px"><b>解析</b><br><span class="muted"><code>target - x</code> 算出还缺的数；<code>need in seen</code> 检查它是否出现过；<code>seen[x] = i</code> 把当前数字和下标记录下来。<br><br><code>return [seen[need], i]</code> 返回两个数字的下标。以 [2, 7, 11, 15] 为例：seen[2] = 0，遍历到 7 时 i = 1，所以返回 [0, 1]。</span></div></div>${footer('检查答案')}`;
    },
    bind() {
      let vals = [];
      let explained = false;
      const expected = ['target - x', 'need', 'seen[x]'];
      const draw = () => document.querySelectorAll('[data-b]').forEach((e, i) => { e.textContent = vals[i] || '______'; });
      document.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
        if (explained) return;
        if (vals.length < 3) {
          vals.push(b.dataset.t);
          draw();
        }
      }));
      $('clear').addEventListener('click', () => {
        vals = [];
        explained = false;
        draw();
        $('ffb').textContent = '';
        $('fillExplain').style.display = 'none';
        $('nextCard').textContent = '检查答案';
      });
      bindFooter(() => {
        if (explained) return true;
        const ok = JSON.stringify(vals) === JSON.stringify(expected);
        $('ffb').className = `feedback ${ok ? 'good' : 'bad'}`;
        if (!ok) {
          $('ffb').textContent = '还不对。依次想：缺谁、查谁、最后存谁。';
          return false;
        }
        $('ffb').textContent = '答案正确。先看下面的解析。';
        $('fillExplain').style.display = 'block';
        $('nextCard').textContent = '继续 →';
        explained = true;
        return false;
      });
    }
  },
  {
    id: 'trace',
    step: '执行过程',
    render() {
      return `${header('practice', '执行过程')}<div class="cardBody"><h2>看代码每一步怎么运行</h2><div class="bigPrompt">nums = [2, 7, 11, 15]，target = 9</div><div class="traceGrid"><div class="traceBox"><small>当前 i / x</small><strong id="tx">—</strong></div><div class="traceBox"><small>need</small><strong id="tn">—</strong></div><div class="traceBox"><small>seen：数字 → 下标</small><strong id="ts" style="font-size:14px">空</strong></div></div><div class="callout" id="tm">点击“运行一步”。</div><div style="display:flex;gap:8px"><button class="soft" id="traceNext">运行一步 ▶</button><button class="secondary" id="traceReset">重来</button></div><div class="codeBlock">seen = {}\nfor i, x in enumerate(nums):\n    need = target - x\n    if need in seen:\n        return [seen[need], i]\n    seen[x] = i</div><div class="callout" style="margin-top:12px"><b>先记住 i 和 x 的区别</b><br><span class="muted"><code>i</code> 是位置，<code>x</code> 是这个位置上的数字。题目要求返回位置，所以最终返回的是两个下标。</span></div></div>${footer()}`;
    },
    bind() {
      let step = 0;
      let seen = {};
      const a = [2, 7, 11, 15];
      function draw() {
        if (!step) {
          $('tx').textContent = '—';
          $('tn').textContent = '—';
          $('ts').textContent = '空';
          $('tm').textContent = '点击“运行一步”。';
          return;
        }
        const i = step - 1;
        const x = a[i];
        const need = 9 - x;
        $('tx').textContent = `${i} / ${x}`;
        $('tn').textContent = need;
        if (need in seen) {
          $('tm').innerHTML = `当前是 <b>i = ${i}, x = ${x}</b>。need = ${need} 已经在 seen 中。<br><br><b>seen[${need}] = ${seen[need]}</b>，表示数字 ${need} 的下标是 ${seen[need]}；当前数字 ${x} 的下标是 i = ${i}。<br>因此返回 <b>[${seen[need]}, ${i}]</b>。`;
        } else {
          seen[x] = i;
          $('tm').innerHTML = `当前是 <b>i = ${i}, x = ${x}</b>。need = ${need} 还没有出现。<br>执行 <b>seen[${x}] = ${i}</b>，记录“数字 ${x} 在下标 ${i}”。`;
        }
        $('ts').textContent = Object.keys(seen).length ? JSON.stringify(seen) : '空';
      }
      $('traceNext').addEventListener('click', () => {
        if (step < a.length) {
          step += 1;
          draw();
        }
      });
      $('traceReset').addEventListener('click', () => {
        step = 0;
        seen = {};
        draw();
      });
      draw();
      bindFooter();
    }
  },
  {
    id: 'full',
    step: '完整题',
    render() {
      return `${header('practice', '完整题')}<div class="cardBody"><h2>在这里完成 Two Sum</h2><div class="callout"><b>需要的步骤</b><br><span class="muted">建字典 → 遍历 → 算 need → 查询 → 返回 → 记录当前值。</span></div><div class="editorToolbar"><b>Python</b><small id="pyStatus">首次运行会加载 Python</small></div><textarea class="editor" id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px"><button class="primary" id="run">▶ 运行 4 组测试</button><button class="secondary" id="skeleton">还原骨架</button></div><div class="runner" id="output">写完后运行测试。</div><div id="rateArea" style="display:none"><div class="sectionHead" style="margin-top:18px"><div><h3>完成情况</h3><p>选择最接近的一项，用于安排复习。</p></div></div><div class="resultButtons"><button class="rate" data-rate="solo"><strong>独立写出</strong><small>基本没回看</small></button><button class="rate" data-rate="hint"><strong>回看后写出</strong><small>思路懂，代码还不熟</small></button><button class="rate" data-rate="hard"><strong>比较困难</strong><small>需要尽快复习</small></button></div></div></div>${footer('通过测试并记录后继续 →')}`;
    },
    bind() {
      const ed = $('editor');
      const out = $('output');
      let passed = false;
      let rated = Boolean(state.twoSumStatus);
      const starter = 'def twoSum(nums, target):\n    seen = {}\n    # 从这里继续写\n';
      const skeleton = 'def twoSum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        # 如果 need 已出现：返回两个下标\n        # 否则：记录当前 x 的下标\n';
      ed.value = state.cardAnswers.twoSumCode || starter;
      enablePythonIndent(ed);
      ed.addEventListener('input', () => {
        state.cardAnswers.twoSumCode = ed.value;
        persist();
      });
      $('skeleton').addEventListener('click', () => {
        ed.value = skeleton;
        state.cardAnswers.twoSumCode = ed.value;
        persist();
        ed.focus();
        ed.selectionStart = ed.selectionEnd = ed.value.length;
      });
      $('run').addEventListener('click', async () => {
        out.className = 'runner';
        out.textContent = '正在运行...';
        $('pyStatus').textContent = 'Python 初始化中';
        try {
          const p = await py();
          $('pyStatus').textContent = 'Python 已就绪';
          const testCode = `${ed.value}\nimport json\n_tests=[([2,7,11,15],9,{0,1}),([3,2,4],6,{1,2}),([3,3],6,{0,1}),([-1,-2,-3,-4,-5],-8,{2,4})]\n_results=[]\nfor nums,target,expected in _tests:\n    try:\n        ans=twoSum(nums,target)\n        ok=isinstance(ans,(list,tuple)) and len(ans)==2 and set(ans)==expected\n        _results.append({'ok':ok,'got':repr(ans)})\n    except Exception as e:\n        _results.append({'ok':False,'got':type(e).__name__+': '+str(e)})\njson.dumps(_results, ensure_ascii=False)`;
          const raw = await p.runPythonAsync(testCode);
          const results = JSON.parse(raw);
          const count = results.filter((r) => r.ok).length;
          passed = count === results.length;
          out.className = `runner ${passed ? 'pass' : 'fail'}`;
          out.innerHTML = `<b>${count} / ${results.length} 组测试通过</b><br>${results.map((r, i) => `测试 ${i + 1}：${r.ok ? '通过' : `未通过（${r.got}）`}`).join('<br>')}`;
          $('rateArea').style.display = passed ? 'block' : 'none';
        } catch (err) {
          passed = false;
          out.className = 'runner fail';
          out.textContent = `运行失败：${err.message || err}`;
        }
      });
      document.querySelectorAll('[data-rate]').forEach((b) => b.addEventListener('click', () => {
        document.querySelectorAll('[data-rate]').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        const r = b.dataset.rate;
        rated = true;
        if (!state.twoSumStatus) state.solved += 1;
        state.twoSumStatus = r;
        if (r === 'solo') scheduleReview('two-sum', 'Two Sum', 4, '完整题');
        if (r === 'hint') scheduleReview('two-sum', 'Two Sum', 1, '代码回忆');
        if (r === 'hard') scheduleReview('two-sum', 'Two Sum', 1, '完整题');
        save();
      }));
      bindFooter(() => {
        if (!passed) {
          out.className = 'runner fail';
          out.textContent = '先通过测试，再继续。';
          return false;
        }
        if (!rated) {
          out.className = 'runner fail';
          out.textContent = '请选择完成情况，再继续。';
          return false;
        }
        return true;
      });
    }
  },
  {
    id: 'recall',
    step: '回顾',
    render() {
      return `${header('learn', '回顾')}<div class="cardBody"><h2>最后确认：什么时候考虑哈希表？</h2><p class="muted">选择两项。</p><div class="choiceGrid"><button class="choice recallChoice" data-r="1">需要快速判断某个值以前是否出现过</button><button class="choice recallChoice" data-r="1">需要记录 key 到 value 的映射或计数</button><button class="choice recallChoice" data-r="0">数组里出现了数字</button><button class="choice recallChoice" data-r="0">数组已经有序</button></div><div class="feedback" id="rfb"></div><div class="callout" id="rexp" style="display:none"><b>解析</b><br><span class="muted">哈希表的核心优势是快速查询和映射。题目是否有数字、数组是否有序，都不足以单独说明应该用哈希表。</span></div></div>${footer('检查答案')}`;
    },
    bind() {
      const selected = new Set();
      let explained = false;
      document.querySelectorAll('.recallChoice').forEach((b) => b.addEventListener('click', () => {
        if (explained) return;
        if (selected.has(b)) {
          selected.delete(b);
          b.classList.remove('selected');
        } else {
          selected.add(b);
          b.classList.add('selected');
        }
      }));
      bindFooter(() => {
        if (explained) {
          state.mastered = Math.max(state.mastered, 1);
          save();
          return true;
        }
        const arr = [...selected];
        const ok = arr.length === 2 && arr.every((b) => b.dataset.r === '1');
        $('rfb').className = `feedback ${ok ? 'good' : 'bad'}`;
        if (!ok) {
          $('rfb').textContent = '还不对。重点看“快速查询以前是否出现过”和“建立映射”。';
          return false;
        }
        $('rfb').textContent = '答案正确。先看解析。';
        $('rexp').style.display = 'block';
        $('nextCard').textContent = '完成今天的学习 →';
        explained = true;
        return false;
      });
    }
  }
];

function renderCard() {
  $('cardTotal').textContent = cards.length;
  if (state.deckIndex >= cards.length) {
    $('cardIndex').textContent = cards.length;
    $('deckFill').style.width = '100%';
    $('studyCard').innerHTML = `<div class="cardBody"><h2>今天的学习完成</h2><p class="muted">你已经完成哈希表基础、Python 写法、代码补空、执行过程和 Two Sum 完整题。</p><div class="callout"><b>回顾一句话</b><br><span class="muted">需要快速查询“以前是否出现过”或建立 key → value 映射时，可以考虑哈希表。</span></div><div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap"><button class="primary" id="doneHome">返回首页</button><button class="secondary" id="again">从头回顾</button></div></div>`;
    $('doneHome').addEventListener('click', () => showPage('home'));
    $('again').addEventListener('click', () => { state.deckIndex = 0; save(); renderCard(); });
    return;
  }

  const card = cards[state.deckIndex];
  $('cardIndex').textContent = state.deckIndex + 1;
  $('deckFill').style.width = `${((state.deckIndex + 1) / cards.length) * 100}%`;
  $('studyCard').innerHTML = card.render();
  card.bind();
}

function renderHome() {
  const done = state.completedCards.filter((id) => cards.some((c) => c.id === id)).length;
  $('todayDone').textContent = `${done} / ${cards.length}`;
  $('homeSolved').textContent = state.solved;
  $('homeReview').textContent = state.reviewQueue.filter((x) => x.due <= today()).length;
  $('sideSolved').textContent = `${state.solved} / 100`;
  $('sideProgress').style.width = `${state.solved}%`;

  const labels = [
    ['建立哈希表直觉', '理解为什么需要快速查询'],
    ['学习 Python 写法', 'dict、enumerate、下标 i 和当前值 x'],
    ['把思路写成代码', 'need、查询顺序和代码补空'],
    ['追踪代码执行', '看 i、x、need、seen 如何变化'],
    ['完成 Two Sum', '在本站运行测试'],
    ['回顾', '确认什么时候考虑哈希表']
  ];
  const thresholds = [1, 2, 5, 6, 7, 8];
  $('todaySteps').innerHTML = labels.map((x, i) => `<div class="card stepRow"><span class="stepNo">${done >= thresholds[i] ? '✓' : i + 1}</span><span><b>${x[0]}</b><small>${x[1]}</small></span><span class="muted">${done >= thresholds[i] ? '已完成' : ''}</span></div>`).join('');
}

function renderProblems() {
  const status = state.twoSumStatus ? '已完成' : state.completedCards.some((x) => ['intuition', 'syntax', 'need', 'order', 'fill', 'trace'].includes(x)) ? '学习中' : '未开始';
  $('problemList').innerHTML = `
    <div class="card problemRow"><div><b>1. Two Sum</b><small>哈希表 · Easy</small></div><span class="status">${status}</span></div>
    <div class="card problemRow"><div><b>49. Group Anagrams</b><small>哈希表 · Medium</small></div><span class="status muted">后续加入</span></div>
    <div class="card problemRow"><div><b>128. Longest Consecutive Sequence</b><small>哈希表 · Medium</small></div><span class="status muted">后续加入</span></div>`;
}

function renderKnowledge() {
  const syntax = state.completedCards.includes('syntax');
  const code = state.completedCards.includes('full');
  const mastered = state.mastered > 0;
  $('knowledgeGrid').innerHTML = `
    <div class="card knowledge"><small>01</small><h3>哈希表</h3><p class="muted">快速查询、映射、计数</p><div class="levelList"><span class="${state.completedCards.includes('intuition') ? 'done' : ''}">理解用途</span><span class="${syntax ? 'done' : ''}">能读 Python</span><span class="${code ? 'done' : ''}">能写 Two Sum</span><span class="${mastered ? 'done' : ''}">完成回顾</span></div></div>
    <div class="card knowledge locked"><small>02</small><h3>双指针</h3><p class="muted">下一章</p></div>
    <div class="card knowledge locked"><small>03</small><h3>滑动窗口</h3><p class="muted">后续章节</p></div>`;
}

function renderReview() {
  const due = state.reviewQueue.filter((x) => x.due <= today());
  if (!due.length) {
    $('reviewArea').innerHTML = `<div class="card empty"><b>今天没有到期的复习</b><p class="muted">完成题目后，系统会根据完成情况安排复习时间。</p></div>`;
    return;
  }
  $('reviewArea').innerHTML = `<div class="reviewList">${due.map((r) => `<div class="card reviewRow"><div><b>${r.title}</b><small>${r.type}</small></div><span>今天</span></div>`).join('')}</div>`;
}

renderHome();
renderProblems();
renderKnowledge();
renderReview();