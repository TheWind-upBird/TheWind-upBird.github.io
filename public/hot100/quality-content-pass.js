(()=>{
const ps=window.HOT100_CURRICULUM||[];
const bySlug=Object.fromEntries(ps.map(p=>[p.slug,p]));
const hc=window.HOT100_HANDCRAFTED||{};
const intros=window.HOT100_BEGINNER_INTUITION||{};

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

// 抽象 Hard 题再做一次“小白视角”改写：先给能手算的例子，再引入正式术语。
if(intros['median-of-two-sorted-arrays']) Object.assign(intros['median-of-two-sorted-arrays'],{
  title:'先真的合并一次，再想怎样“不合并也能找到中间”',
  example:'A = [1, 3]，B = [2] → 合并后 [1, 2, 3]，中位数是 2',
  observe:'最笨但最容易懂的方法，是把两个有序数组合并，再拿中间位置。Hard 的地方只在于：题目希望我们利用“两个数组本来就有序”，不要真的把所有元素都合并。',
  question:'如果不合并，怎样确认“左边恰好放了一半元素，而且左边所有数都不大于右边所有数”？',
  answer:'在 A、B 中各切一刀。两刀左边的元素总数固定为一半；然后只检查切口旁边四个数：A左、A右、B左、B右。只要 A左≤B右 且 B左≤A右，这两刀就切对了，中位数就在这四个边界里。'
});
if(hc['median-of-two-sorted-arrays']){
  hc['median-of-two-sorted-arrays'].syntax.summary='不要先记四个边界变量。先画两排有序数字和两条切线：i 决定 A 左边拿几个，j=half-i 自动决定 B 左边拿几个；二分只是在移动 A 的切线。';
  hc['median-of-two-sorted-arrays'].meaning={
    q:'为什么只检查切口旁边的 Aleft、Aright、Bleft、Bright，就能判断整个左右两半是否有序？',
    options:['因为 A、B 各自本来就有序：每边内部无需再检查，只要排除两个“跨数组越界”关系即可','因为中位数只和4个数有关，其他数可以乱序','因为二分查找只能比较4个数'],
    answer:0,
    explain:'A 自己左边≤自己右边、B 也一样，这是输入有序直接保证的。真正可能破坏“左半≤右半”的只有 Aleft>Bright 或 Bleft>Aright，所以检查这两个交叉条件就够。'
  };
  hc['median-of-two-sorted-arrays'].full.guide='先允许自己用 O(m+n) 合并法确认答案，再画两排数组做“切一半”的练习。真正写二分时只盯三件事：左侧总数固定、两个交叉条件、切线太左/太右时怎么移动。';
  bySlug['median-of-two-sorted-arrays'].starter=`def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A          # 始终在更短的 A 上二分

    m, n = len(A), len(B)
    half = (m + n + 1) // 2
    left, right = 0, m

    while left <= right:
        i = (left + right) // 2
        j = half - i
        # 1. 算出 Aleft / Aright / Bleft / Bright
        # 2. 判断两条切线是否满足交叉条件
        # 3. 不满足时移动 A 的切线
        ...
`;
}

if(intros['find-median-from-data-stream']) Object.assign(intros['find-median-from-data-stream'],{
  title:'先把排好序的数据从中间劈成左右两半',
  example:'[1, 2, 7, 10, 12] → 左半 [1,2,7]｜右半 [10,12]，中位数是 7',
  observe:'如果元素个数是奇数，中位数就是“较大那一半最靠近中间的数”；如果是偶数，例如 [1,2｜7,10]，中位数就是 2 和 7 的平均值。',
  question:'数据不断进来时，怎样不用每次都把全部数字重新排序？',
  answer:'只维护中间附近最重要的两个边界：左半最大的数、右半最小的数。左半用最大堆，右半用最小堆；再保证两边数量尽量一样，中位数就永远在两个堆顶。'
});
if(hc['find-median-from-data-stream']){
  hc['find-median-from-data-stream'].syntax.summary='把 small 想成“较小的一半”，large 想成“较大的一半”。Python 只有最小堆，所以 small 把数字取负：small[0] 虽然是最小的负数，取反后正好是左半最大值。';
  hc['find-median-from-data-stream'].full.guide='先别写堆。拿 1、2、7、10 画成左右两盒，明确你只需要“左盒最大”和“右盒最小”。再把左盒换成负数最大堆模拟，最后处理两边数量平衡。';
}

if(intros['edit-distance']) Object.assign(intros['edit-distance'],{
  title:'先只研究“最后一个字符怎么处理”',
  example:"把 'horse' 变成 'ros'",
  observe:"别试图一次规划完整过程。看两个前缀的最后字符：如果一样，这一位不用花新操作；如果不一样，最后一步只可能是删除、插入或替换。",
  question:'二维表里的“上、左、左上”为什么刚好对应三种操作？',
  answer:'dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符。删除 word1 最后字符后看 dp[i-1][j]；为了补上 word2 最后字符，先看 dp[i][j-1]；替换两个末尾则先看 dp[i-1][j-1]。三者再 +1。'
});
if(hc['edit-distance']){
  hc['edit-distance'].syntax.summary='每个格子都先翻译成人话：“前 i 个字符 → 前 j 个字符最少几步？”末尾相同看左上；末尾不同就把删除、插入、替换三个最后动作分别映射到上、左、左上。';
  hc['edit-distance'].full.guide="先画一个很小的例子 'ab' → 'ac'，把 dp[i][0]=i、dp[0][j]=j 的含义说清，再进入双循环。不要先背 min(上,左,左上)+1。";
}

if(intros['find-the-duplicate-number']) Object.assign(intros['find-the-duplicate-number'],{
  title:'先把数组真的画成“下标指向下标”',
  example:'nums = [1,3,4,2,2]：0 → 1 → 3 → 2 → 4 → 2 → 4 → …',
  observe:'规则是“站在下标 i，就跳到下标 nums[i]”。从 0 出发会进入 2 ↔ 4 的环；重复数字是 2，而 2 恰好就是进入这个环的入口。',
  question:'为什么数组里出现重复值，会变成“链表出现环入口”？',
  answer:'不同下标如果都存着同一个重复值，就会有两条箭头指向同一个下标。由于值范围只有 1..n、位置却有 n+1 个，从 0 不断跳一定会进入循环；那个第一次被汇合进入的节点就是重复数。于是可以直接复用“环形链表 II”的 Floyd 快慢指针。'
});
if(hc['find-the-duplicate-number']){
  hc['find-the-duplicate-number'].syntax.summary='把 nums[i] 当成链表里的 node.next。于是 slow=nums[slow] 是走一步，fast=nums[nums[fast]] 是走两步；第一次相遇只说明进入了环，第二阶段才定位环入口，也就是重复数。';
  hc['find-the-duplicate-number'].meaning={
    q:'在 nums=[1,3,4,2,2] 中，为什么“重复数 2”不是随便一个环内节点，而正好对应环入口？',
    options:['因为两个不同下标都指向下标2，路径第一次发生汇合的位置就是2；从这里往后进入同一循环','因为2是数组里最小的重复值','因为快指针第一次一定在2相遇'],
    answer:0,
    explain:'重复值意味着“多个位置的 next 都等于同一个下标”。这个汇合点就是从前缀路径进入循环的位置。快慢指针第一次相遇的位置不一定是2，Floyd 第二阶段才会回到入口2。'
  };
  hc['find-the-duplicate-number'].full.guide='先在纸上把 [1,3,4,2,2] 画成 0→1→3→2→4→2，再完全照搬环形链表 II 的两阶段逻辑。只有“next”从 node.next 换成 nums[index]。';
  bySlug['find-the-duplicate-number'].starter=`def findDuplicate(nums):
    slow = fast = nums[0]

    # 第一阶段：一个走一步，一个走两步，先在环里相遇
    while True:
        ...

    # 第二阶段：一个从起点重新出发，两者都一步一步走
    finder = nums[0]
    while finder != slow:
        ...

    return finder
`;
}

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
  if(code.includes('lambda ')) add('lambda','临时的小函数，常用作 sort/sorted 的 key，告诉 Python“按什么排序”。');
  if(code.includes('nonlocal ')) add('nonlocal','让内层函数可以修改外层函数里的变量，而不是新建一个同名局部变量。');
  if(code.includes('divmod(')) add('divmod(a, b)','一次返回 (a // b, a % b)，也就是商和余数。');
  if(code.includes("float('inf')")) add("float('inf')",'Python 的正无穷；做 min 比较时常拿它表示“目前还没有可行答案”。');
  if(code.includes('[:]')||/\[[^\]\n]*:[^\]\n]*\]/.test(code)) add('切片 a[l:r]','取下标 l 到 r-1；右端 r 不包含。a[:] 常用来复制一层列表。');
  if(/(?:=|return\s+|\()\s*\[[^\]\n]+\bfor\b[^\]\n]+\]/.test(code)) add('列表推导式','例如 [f(x) for x in xs]：把循环生成结果直接组成新列表。');
  if(/\b[a-zA-Z_]\w*\s*,\s*[a-zA-Z_]\w*\s*=/.test(code)) add('a, b = ...','多变量解包：右边产生几个值，按位置一次赋给左边几个变量。');
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