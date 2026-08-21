(()=>{
const ps=window.HOT100_CURRICULUM||[];
const bySlug=Object.fromEntries(ps.map(p=>[p.slug,p]));
const hc=window.HOT100_HANDCRAFTED||{};

// 对结构型难题给真正能接着写的起始骨架，减少从“看懂”突然跳到空白编辑器的落差。
if(bySlug['lru-cache']) bySlug['lru-cache'].starter=`class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.left = Node()      # 最久未使用端的哨兵
        self.right = Node()     # 最近使用端的哨兵
        # 先把两个哨兵互相连接

    def _remove(self, node):
        # 把 node 从双向链表中摘掉
        ...

    def _insert_right(self, node):
        # 把 node 插到 right 前面，表示“最近使用”
        ...

    def get(self, key):
        # 未命中返回 -1；命中后记得把节点移到最近使用端
        ...

    def put(self, key, value):
        # 更新/插入后，若超过 capacity，要淘汰 left.next
        ...
`;

if(bySlug['implement-trie-prefix-tree']) bySlug['implement-trie-prefix-tree'].starter=`class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        # 逐字符向下走；没有孩子就创建
        ...

    def search(self, word):
        # 走完整条路径后，还要检查 end
        ...

    def startsWith(self, prefix):
        # 前缀只要求路径存在，不要求 end
        ...
`;

if(bySlug['find-median-from-data-stream']) bySlug['find-median-from-data-stream'].starter=`import heapq

class MedianFinder:
    def __init__(self):
        self.small = []   # 左半边：存负数来模拟最大堆
        self.large = []   # 右半边：普通最小堆

    def addNum(self, num):
        # 先放入合适的一边，再把两边大小调到只差 0 或 1
        ...

    def findMedian(self):
        # 奇数个看较大那边堆顶；偶数个取两个堆顶平均
        ...
`;

if(bySlug['n-queens']) bySlug['n-queens'].starter=`def solveNQueens(n):
    ans = []
    board = [['.'] * n for _ in range(n)]
    cols, diag1, diag2 = set(), set(), set()

    def backtrack(r):
        # r == n 时，说明每一行都已经成功放好皇后
        # 否则枚举这一行的列：检查冲突 → 放置 → 递归 → 撤销
        ...

    backtrack(0)
    return ans
`;

// 修正一处“解释代码”与真实代码写法不完全一致的细节。
const minPath=hc['minimum-path-sum'];
if(minPath?.syntax?.items){
  minPath.syntax.items=minPath.syntax.items.map(x=>x[0]==='dp=[inf]*n'?['dp=[float(\'inf\')]*n','一开始把未知代价设为正无穷；float(\'inf\') 是 Python 里的正无穷。']:x);
}

function pythonGlossary(code){
  const out=[];
  const add=(term,text)=>{if(!out.some(x=>x[0]===term))out.push([term,text])};
  if(code.includes('enumerate(')) add('enumerate(...)','遍历时同时得到“下标、值”，常写成 for i, x in enumerate(nums)。');
  if(code.includes('deque')) add('deque / popleft()','双端队列；popleft() 从最左侧弹出，BFS 用它可以 O(1) 出队。');
  if(code.includes('heapq')) add('heapq','Python 自带最小堆；heappush 放入，heappop 弹出当前最小值。用负数可以模拟最大堆。');
  if(code.includes('.get(')) add('dict.get(key, default)','字典里有 key 就取值；没有就返回 default，不会直接报 KeyError。');
  if(code.includes('set()')||code.includes('.add(')||code.includes('.remove(')) add('set','集合只保存不重复元素，in 查询很快；add 加入，remove 删除。');
  if(code.includes('lambda ')) add('lambda','临时的小函数，常用作 sort/sorted 的 key，告诉 Python “按什么排序”。');
  if(code.includes('nonlocal ')) add('nonlocal','让内层函数可以修改外层函数里的变量，而不是新建一个同名局部变量。');
  if(code.includes('divmod(')) add('divmod(a, b)','一次返回 (a // b, a % b)，也就是商和余数。');
  if(code.includes("float('inf')")) add("float('inf')",'Python 的正无穷；做 min 比较时常拿它表示“目前还没有可行答案”。');
  if(code.includes('[:]')||/\[[^\]\n]*:[^\]\n]*\]/.test(code)) add('切片 a[l:r]','取下标 l 到 r-1；右端 r 不包含。a[:] 常用来复制一层列表。');
  if(code.includes(' for ')&&code.includes('[')&&code.includes(']')) add('列表推导式','例如 [f(x) for x in xs]：把循环生成结果直接组成新列表。');
  if(/\b[a-zA-Z_]\w*\s*,\s*[a-zA-Z_]\w*\s*=/.test(code)) add('a, b = ...','元组/多变量解包：右边产生几个值，按位置一次赋给左边几个变量。');
  if(code.includes('//')) add('//','整数除法，结果向下取整；二分里的 (left+right)//2 用它得到整数下标。');
  if(code.includes('%')) add('%','取余数；常用于奇偶、循环位置和逐位运算。');
  if(code.includes('^')) add('^','按位异或：相同位抵消，满足 x^x=0、x^0=x。');
  if(code.includes(' is ')||code.includes(' is not ')) add('is / is not','比较两个变量是否指向“同一个对象”；链表节点身份判断时比 == 更准确。');
  return out.slice(0,4);
}

const languageBaseBuildCards=buildCards;
buildCards=function(p){
  const cards=languageBaseBuildCards(p);
  if(p.slug==='two-sum') return cards;
  const syntax=cards.find(c=>c.id==='syntax');
  const glossary=pythonGlossary(String(p.pattern||''));
  if(syntax&&glossary.length){
    const oldRender=syntax.render;
    syntax.render=()=>{
      let html=oldRender();
      const box=`<div class="qaGlossary"><b>这题新出现的 Python 写法</b>${glossary.map(x=>`<div><code>${esc(x[0])}</code><span>${esc(x[1])}</span></div>`).join('')}</div>`;
      const anchor='<div class="callout"><b>把这些代码连起来</b>';
      if(html.includes(anchor)) html=html.replace(anchor,box+anchor);
      else html=html.replace('</div>'+footer(),box+'</div>'+footer());
      return html;
    };
  }
  return cards;
};

const style=document.createElement('style');
style.textContent=`.qaGlossary{margin:14px 0;padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:#fff}.qaGlossary>b{display:block;font-size:13px;margin-bottom:8px}.qaGlossary>div{display:grid;grid-template-columns:minmax(110px,auto) 1fr;gap:10px;padding:7px 0;border-top:1px solid var(--line)}.qaGlossary code{font-size:12px}.qaGlossary span{font-size:12px;line-height:1.55;color:var(--muted)}@media(max-width:620px){.qaGlossary>div{grid-template-columns:1fr}.qaGlossary span{margin-top:-4px}}`;
document.head.appendChild(style);
})();