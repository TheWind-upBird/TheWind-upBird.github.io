(()=>{
const curriculum=window.HOT100_CURRICULUM||[];
const PATTERNS=[
  {id:'hash-map',zh:'哈希表',en:'Hash Map',aliases:['哈希表','哈希','集合']},
  {id:'two-pointers',zh:'双指针',en:'Two Pointers',aliases:['双指针']},
  {id:'sliding-window',zh:'滑动窗口',en:'Sliding Window',aliases:['滑动窗口','子串']},
  {id:'prefix-sum',zh:'前缀和',en:'Prefix Sum',aliases:['前缀和']},
  {id:'array',zh:'数组',en:'Array',aliases:['普通数组','数组']},
  {id:'matrix',zh:'矩阵',en:'Matrix',aliases:['矩阵']},
  {id:'linked-list',zh:'链表',en:'Linked List',aliases:['链表']},
  {id:'binary-tree',zh:'二叉树',en:'Binary Tree',aliases:['二叉树','树']},
  {id:'graph',zh:'图',en:'Graph',aliases:['图论','图']},
  {id:'backtracking',zh:'回溯',en:'Backtracking',aliases:['回溯']},
  {id:'binary-search',zh:'二分查找',en:'Binary Search',aliases:['二分查找','二分']},
  {id:'stack',zh:'栈',en:'Stack',aliases:['栈','单调栈']},
  {id:'heap',zh:'堆',en:'Heap / Priority Queue',aliases:['堆']},
  {id:'greedy',zh:'贪心',en:'Greedy',aliases:['贪心算法','贪心']},
  {id:'dynamic-programming',zh:'动态规划',en:'Dynamic Programming',aliases:['动态规划','多维动态规划']},
  {id:'trie',zh:'Trie',en:'Trie',aliases:['Trie','字典树']},
  {id:'interval',zh:'区间',en:'Intervals',aliases:['区间']},
  {id:'bit',zh:'位运算',en:'Bit Manipulation',aliases:['位运算']},
  {id:'technique',zh:'技巧',en:'Techniques',aliases:['技巧']}
];
const byAlias=new Map();
for(const p of PATTERNS)for(const alias of p.aliases)byAlias.set(alias,p);
function patternFor(problem){
  const topic=String(problem?.topic||'').trim();
  if(byAlias.has(topic))return byAlias.get(topic);
  for(const [alias,p] of byAlias.entries())if(topic.includes(alias))return p;
  return {id:'other',zh:topic||'其他',en:problem?.topicEn||'Other',aliases:[]};
}
const ROLE_OVERRIDES={};
function roleFor(problem){return ROLE_OVERRIDES[problem.slug]||'anchor'}
const TRACKS=[{
  id:'hot100-core',
  status:'active',
  title:{'zh-CN':'Hot100 核心路线','en-US':'Hot100 Core'},
  description:{'zh-CN':'当前已完成的 100 道核心算法题。','en-US':'The current 100-problem core interview track.'},
  problemSlugs:curriculum.map(p=>p.slug)
}];
function localize(value,locale='zh-CN'){
  if(value==null)return '';
  if(typeof value==='string')return value;
  return value[locale]||value['zh-CN']||value['en-US']||'';
}
for(const p of curriculum){
  const pattern=patternFor(p);
  p.productMeta={...(p.productMeta||{}),trackId:'hot100-core',patternId:pattern.id,role:roleFor(p),contentVersion:1};
}
window.HOT100_PRODUCT_CATALOG={
  version:1,
  patterns:PATTERNS,
  tracks:TRACKS,
  roles:['anchor','transfer','interview'],
  patternFor,
  roleFor,
  localize,
  track(id='hot100-core'){return TRACKS.find(t=>t.id===id)||TRACKS[0]},
  problemsForTrack(id='hot100-core'){const t=this.track(id);const set=new Set(t?.problemSlugs||[]);return curriculum.filter(p=>set.has(p.slug))},
  problemsForPattern(id){return curriculum.filter(p=>patternFor(p).id===id)}
};
})();