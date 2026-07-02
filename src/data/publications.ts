// Publications data.
// NOTE on the two papers under review: both venues use double-blind review,
// so by default they are listed WITHOUT naming the venue. If you are
// comfortable naming it (many people do — preprints are usually allowed,
// but "actively advertising" during review can be a gray area), just edit
// the `venue` field below.

export type Pub = {
  title: string;
  authors: string; // your name will be auto-bolded in the UI
  venue: string;
  year: string;
  status: 'accepted' | 'review';
  oral?: boolean;
  award?: string;
  desc: string;
  descZh?: string;
  links: { label: string; href: string }[];
};

export const publications: Pub[] = [
  {
    title: 'AnalogAgent: Self-Improving Multi-Agent LLM for Analog Design',
    authors: 'First Author*, Jiageng Wang, et al.', // TODO: fill real author list
    venue: 'KDD 2026',
    year: '2026',
    status: 'accepted',
    oral: true,
    desc: 'A training-free multi-agent LLM framework (Code Generator, Design Optimizer, Knowledge Curator) coordinated through a self-evolving memory that turns tool-execution feedback into reusable prompts. I led small-LLM adaptation on Qwen3 (1.7B–14B) for on-premises deployment, lifting Pass@1 by up to +48.8 points without fine-tuning.',
    descZh:
      '免训练多智能体 LLM 框架,通过自进化记忆模块将工具执行反馈转化为可复用提示。我负责 Qwen3 小模型(1.7B–14B)的本地化适配,在不微调的情况下将 Pass@1 最高提升 48.8 个百分点。',
    links: [],
  },
  {
    title: 'SizingAgent: Physics-Grounded LLM Reasoning for Analog Sizing',
    authors: 'Jiageng Wang, et al.',
    venue: '', // double-blind: venue intentionally not named; the status badge already says "under review"
    year: '2026',
    status: 'review',
    desc: 'First-author work: a training-free agent framework for analog transistor sizing, where every proposed action is verified against a precomputed sensitivity matrix before any simulator call. Comes with a 28-task benchmark verified to be unsolvable by random search. Details available on request.',
    descZh:
      '一作工作:面向模拟电路尺寸设计的免训练 Agent 框架,所有动作在调用仿真器前经灵敏度矩阵校验;附带 28 任务基准测试。论文审稿中,细节可联系索取。',
    links: [],
  },
  {
    title: 'CABAgent: Layout-Aware LLM Agent for Analog Benchmark Generation',
    authors: 'First Author*, Jiageng Wang*, et al.', // TODO: fill real first author's name
    venue: '',
    year: '2026',
    status: 'review',
    award: 'IEEE SSCS Code-a-Chip Winner @ VLSI 2026',
    desc: 'Co-first-author work extending the agent framework to layout-aware automation: a self-evolving loop that generates SKY130-compatible netlists and expands each seed into full benchmark packages with automatic layout and post-layout evaluation. The open-source notebook won the IEEE SSCS Code-a-Chip award at VLSI 2026 (one of three winning teams).',
    descZh:
      '共同一作:将 Agent 框架扩展至版图感知自动化,自动生成 SKY130 兼容网表并扩展为完整基准测试包。开源 notebook 获 VLSI 2026 IEEE SSCS Code-a-Chip 奖(三支获奖队伍之一)。',
    links: [],
  },
];
