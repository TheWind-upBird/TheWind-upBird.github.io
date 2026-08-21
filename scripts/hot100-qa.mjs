import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve('public/hot100');
const dataFiles = [
  'curriculum-1.js','curriculum-2.js','curriculum-3.js','curriculum-4.js','curriculum-5.js','curriculum-6.js',
  'handcrafted-patterns.js','lesson-overrides.js','beginner-intuition.js',
  'handcrafted-2-10.js','handcrafted-11-20.js','handcrafted-21-30.js',
  'hot100-31-32.js','hot100-33-34.js','hot100-35-40.js','hot100-41-45.js','hot100-46-50.js',
  'hot100-51-60.js','hot100-61-70.js','hot100-71-80.js','hot100-81-90.js','hot100-91-100.js',
  'quality-2-30-pass.js','python-extra.js'
];
const runtimeFiles = [
  'engine-state.js','engine-cards.js','editor-runtime.js','handcrafted-cards.js',
  'quality-pass.js','quality-content-pass.js','two-sum-cards.js','engine-ui.js','product-pass.js','utility-pass.js'
];

// Every JS file must parse. Runtime files depend on DOM globals, so do not execute them here.
for (const file of [...dataFiles, ...runtimeFiles]) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  try { new vm.Script(src, { filename: file }); }
  catch (err) { console.error(`JS syntax error in ${file}:`, err); process.exit(1); }
}

// Execute pure data/mutation files inside an isolated window object.
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const file of dataFiles) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(`(()=>{\n${src}\n})()`, sandbox, { filename: file });
}

const w = sandbox.window;
const ps = w.HOT100_CURRICULUM || [];
const lessons = w.HOT100_LESSONS || {};
const intros = w.HOT100_BEGINNER_INTUITION || {};
const handcrafted = w.HOT100_HANDCRAFTED || {};
const errors = [];
const warnings = [];
const fail = msg => errors.push(msg);
const warn = msg => warnings.push(msg);
const nonEmpty = x => typeof x === 'string' && x.trim().length > 0;

if (ps.length !== 100) fail(`curriculum length = ${ps.length}, expected 100`);
const seen = new Set();
for (const p of ps) {
  if (seen.has(p.slug)) fail(`duplicate slug: ${p.slug}`);
  seen.add(p.slug);
}

const badPhrases = [
  '先不要背完整答案',
  '这几个空对应整题最关键的控制流程',
  '这几个空对应整题最关键',
  '只是为了让代码更短',
];

ps.forEach((p, idx) => {
  const pos = idx + 1;
  for (const key of ['slug','title','titleEn','difficulty','topic','concept','pattern','starter','judge']) {
    if (!nonEmpty(p[key])) fail(`#${pos} ${p.slug || '(no slug)'} missing ${key}`);
  }
  if (!p.quiz || !Array.isArray(p.quiz.options) || p.quiz.options.length < 3) fail(`#${pos} ${p.slug} invalid quiz`);
  if (p.quiz) {
    if (!Number.isInteger(p.quiz.answer) || p.quiz.answer < 0 || p.quiz.answer >= p.quiz.options.length) fail(`#${pos} ${p.slug} invalid quiz answer`);
    if (new Set(p.quiz.options).size !== p.quiz.options.length) fail(`#${pos} ${p.slug} duplicate quiz options`);
    if (!nonEmpty(p.quiz.explain) || p.quiz.explain.trim().length < 8) warn(`#${pos} ${p.slug} quiz explanation is short`);
  }

  if (idx > 0) {
    const cfg = handcrafted[p.slug];
    const intro = intros[p.slug];
    const lesson = lessons[p.slug];
    if (!cfg) { fail(`#${pos} ${p.slug} missing handcrafted teaching`); return; }
    if (!intro) fail(`#${pos} ${p.slug} missing beginner intro`);
    else {
      for (const k of ['title','example','observe','question','answer']) if (!nonEmpty(intro[k])) fail(`#${pos} ${p.slug} intro missing ${k}`);
      if ((intro.observe?.length || 0) < 18) warn(`#${pos} ${p.slug} intro observation may be too thin`);
      if ((intro.answer?.length || 0) < 18) warn(`#${pos} ${p.slug} intro answer may be too thin`);
    }
    if (!lesson || !Array.isArray(lesson.trace) || lesson.trace.length < 3) fail(`#${pos} ${p.slug} trace has fewer than 3 steps`);
    else for (const [i,s] of lesson.trace.entries()) if (!nonEmpty(s.message) || s.message.length < 8) warn(`#${pos} ${p.slug} trace step ${i+1} explanation is short`);
    if (!cfg.syntax || !Array.isArray(cfg.syntax.items) || cfg.syntax.items.length < 3) fail(`#${pos} ${p.slug} syntax teaching too thin`);
    if (!cfg.syntax?.summary || cfg.syntax.summary.length < 12) warn(`#${pos} ${p.slug} syntax summary is short`);
    if (!cfg.meaning || !Array.isArray(cfg.meaning.options) || cfg.meaning.options.length < 3) fail(`#${pos} ${p.slug} invalid meaning check`);
    if (!cfg.recall || !Array.isArray(cfg.recall.options) || cfg.recall.options.length < 3) fail(`#${pos} ${p.slug} invalid recall check`);
    if (!cfg.fill || !Array.isArray(cfg.fill.targets) || cfg.fill.targets.length < 2) fail(`#${pos} ${p.slug} fill exercise too thin`);
    if (!cfg.fill?.explain || cfg.fill.explain.length < 12) warn(`#${pos} ${p.slug} fill explanation is short`);
    if (!cfg.full || !nonEmpty(cfg.full.guide)) fail(`#${pos} ${p.slug} missing full-problem guide`);

    const patternLines = String(p.pattern).split('\n').map(x => x.trim());
    if (cfg.fill?.targets) {
      for (const t of cfg.fill.targets) if (!patternLines.includes(t)) fail(`#${pos} ${p.slug} fill target not found in pattern: ${t}`);
    }
    for (const q of [cfg.meaning, cfg.recall].filter(Boolean)) {
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) fail(`#${pos} ${p.slug} invalid handcrafted answer index`);
      if (new Set(q.options).size !== q.options.length) fail(`#${pos} ${p.slug} duplicate handcrafted options`);
      if (!nonEmpty(q.explain) || q.explain.trim().length < 8) warn(`#${pos} ${p.slug} handcrafted explanation is short`);
    }

    const fullText = JSON.stringify({p,cfg,intro,lesson});
    for (const phrase of badPhrases) if (fullText.includes(phrase)) fail(`#${pos} ${p.slug} contains filler phrase: ${phrase}`);
  }
});

// Two Sum remains its special, heavily iterated lesson. Every other problem is judge-tested here.
const tested = ps.slice(1);
if (tested.length !== 99) fail(`judge-tested curriculum count = ${tested.length}, expected 99`);
for (const p of tested) {
  if (!/^(def |class |from |import )/m.test(p.pattern)) fail(`${p.slug} pattern does not look executable`);
  if (!String(p.judge).includes('check(')) fail(`${p.slug} judge has no check()`);
}

const earlyHard = [
  'trapping-rain-water','sliding-window-maximum','minimum-window-substring','first-missing-positive',
  'linked-list-cycle-ii','add-two-numbers','remove-nth-node-from-end-of-list','swap-nodes-in-pairs'
];
for (const slug of earlyHard) {
  const p = ps.find(x=>x.slug===slug);
  if (!p) fail(`missing early quality target: ${slug}`);
  else if (/\n\s*pass\s*$/.test(p.starter||'')) fail(`${slug} still has pass-only starter after 2-30 quality pass`);
}

const exportData = {
  pythonExtra: w.HOT100_PY_EXTRA || '',
  problems: tested.map(p => ({slug:p.slug,title:p.title,pattern:p.pattern,judge:p.judge}))
};
fs.writeFileSync('/tmp/hot100-qa.json', JSON.stringify(exportData));

console.log(`Hot100 structural QA: ${ps.length} problems; Python judge set: ${tested.length} problems (2-100).`);
if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const x of warnings) console.log(`  - ${x}`);
}
if (errors.length) {
  console.error(`Errors (${errors.length}):`);
  for (const x of errors) console.error(`  - ${x}`);
  process.exit(1);
}
console.log('Structural/content QA passed.');