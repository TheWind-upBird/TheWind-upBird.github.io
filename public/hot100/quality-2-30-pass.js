(()=>{
const ps=window.HOT100_CURRICULUM||[];
const bySlug=Object.fromEntries(ps.map(p=>[p.slug,p]));
const hc=window.HOT100_HANDCRAFTED||{};
const intros=window.HOT100_BEGINNER_INTUITION||{};

function replaceSyntax(slug, code, text){
  const items=hc[slug]?.syntax?.items;
  if(!items)return;
  const i=items.findIndex(x=>x[0]===code);
  if(i>=0)items[i]=[code,text];
  else items.unshift([code,text]);
}

// Early Python details that are easy to gloss over when someone is still learning the language.
replaceSyntax('find-all-anagrams-in-a-string','need = Counter(p)',"Counter 是 Python 的计数器：例如 Counter('aabc') 会得到 a:2、b:1、c:1。这里用它保存 p 需要的每个字符数量。");
replaceSyntax('minimum-window-substring','need = Counter(t)',"Counter 是专门做频次统计的字典。t='AABC' 时，need 会记录 A 需要2个、B/C 各1个。");
replaceSyntax('group-anagrams','groups.setdefault(key, [])',"setdefault(key, []) 的意思是：key 不存在就先放入空列表；已经存在就直接取原来的列表。于是后面可以安全 append。");

// Hard / pointer-heavy early lessons: reduce the jump from understanding to an empty editor.
if(bySlug['trapping-rain-water']) bySlug['trapping-rain-water'].starter=`def trap(height):
    left, right = 0, len(height) - 1
    leftMax = rightMax = 0
    water = 0

    while left < right:
        # 先处理当前更低的一侧；这一侧的水位已经可以确定
        if height[left] < height[right]:
            # 更新 leftMax，再计算 left 这一格能接多少水
            ...
        else:
            # 右侧完全对称：更新 rightMax，再处理 right
            ...

    return water
`;
if(hc['trapping-rain-water']){
  hc['trapping-rain-water'].full.guide='先只写“处理左边”这一半：leftMax=max(leftMax,height[left])，再加 leftMax-height[left]。确认为什么不会出现负数后，再把右边照镜子写出来。最后才处理“哪边先算”的判断。';
  hc['trapping-rain-water'].meaning={q:'为什么先更新 leftMax，再做 water += leftMax-height[left]？',options:['这样 leftMax 至少等于当前柱高；如果当前柱本身刷新了最高墙，这一格接水就是0','因为必须让 leftMax 每轮加1','否则 rightMax 会失效'],answer:0,explain:'当前位置若比历史最高墙还高，它自己就是新的墙，当然不能在自己上方存水；先更新最高墙后再相减，恰好得到0。'};
}

if(bySlug['sliding-window-maximum']) bySlug['sliding-window-maximum'].starter=`from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()   # 存“下标”，并让对应值从大到小
    ans = []

    for i, x in enumerate(nums):
        # 1. 从队尾删掉比 x 小或相等、以后不可能当最大值的候选
        ...
        # 2. 把当前下标加入候选
        ...
        # 3. 若队首已经离开窗口，把它弹出
        ...
        # 4. 窗口形成后，队首就是最大值下标
        ...

    return ans
`;
if(hc['sliding-window-maximum']){
  hc['sliding-window-maximum'].full.guide='不要把 deque 当成“另一个窗口”。它只保存候选下标。用窗口 [1,3,-1] 手推：1 先入队，3 来时 1 被永久淘汰，-1 只能排在 3 后面；这时你再写 while-pop 会自然很多。';
}

if(bySlug['minimum-window-substring']) bySlug['minimum-window-substring'].starter=`from collections import Counter

def minWindow(s, t):
    need = Counter(t)
    window = Counter()
    left = 0
    have = 0
    required = len(need)
    bestLen = float('inf')
    bestStart = 0

    for right, ch in enumerate(s):
        # 右边扩张：加入 ch；若某字符“刚好达到需求”，have + 1
        ...

        # 只有所有字符种类都满足后，左边才开始缩
        while have == required:
            # 先记录当前合法窗口，再移出 s[left]
            # 若移出后某个需要字符“跌破需求”，have - 1
            ...

    return '' if bestLen == float('inf') else s[bestStart:bestStart+bestLen]
`;
if(hc['minimum-window-substring']){
  hc['minimum-window-substring'].syntax.summary='先把 have 理解成“目前有多少种字符已经达到要求”，不是窗口里有多少字符。A 需要2个时，窗口从1个 A 变2个 A 才会让 have+1；变成3个 A 不会再加。';
  hc['minimum-window-substring'].meaning={q:"t='AABC' 时，窗口里 A 从1个增加到2个，have 为什么只在这一刻 +1？",options:['因为 need[A]=2，只有达到需求数量时，字符种类 A 才从“不满足”变成“满足”','因为第二个A下标更大','因为Counter只能统计到2'],answer:0,explain:'have 统计的是满足要求的“字符种类数”。同一种字符再多也只贡献1种；收缩时从2个 A 掉回1个 A，才会 have-1。'};
}

if(bySlug['first-missing-positive']) bySlug['first-missing-positive'].starter=`def firstMissingPositive(nums):
    n = len(nums)
    i = 0

    # 第一阶段：把值 x 尽量放到下标 x-1
    while i < n:
        x = nums[i]
        if 1 <= x <= n and nums[x-1] != x:
            # 交换后先别急着 i += 1；新换来的 nums[i] 还没检查
            ...
        else:
            i += 1

    # 第二阶段：第一个“值 != 下标+1”的位置就是答案
    for i, x in enumerate(nums):
        ...

    return n + 1
`;
if(hc['first-missing-positive']){
  hc['first-missing-positive'].full.guide='先不用代码，拿 [3,4,-1,1] 做“归位游戏”：3 想去下标2，1 想去下标0。只关心 1..n，其它值不需要安置。最后数组哪个位置没有放着 i+1，那个 i+1 就缺失。';
}

// Floyd II used to state the theorem without really showing why it is usable. Keep the proof light but concrete.
if(intros['linked-list-cycle-ii']) Object.assign(intros['linked-list-cycle-ii'],{
  title:'第 141 题只问“有没有环”，现在再问“环从哪里开始”',
  example:'假设链表头到入口要走 3 步；快慢指针第一次在环里某处相遇',
  observe:'第一次相遇点通常不是入口，所以不能直接返回 slow。真正有用的是 Floyd 的距离关系：从头重新出发一个指针，同时让相遇点的 slow 也每次走1步，它们会在入口碰面。',
  question:'第二阶段具体要改什么？',
  answer:'不用再保留一快一慢。令 p=head，slow 留在第一次相遇点；然后 p=p.next、slow=slow.next 同速前进。p is slow 时，这个节点就是入口。'
});
if(bySlug['linked-list-cycle-ii']) bySlug['linked-list-cycle-ii'].starter=`def detectCycle(head):
    slow = fast = head

    # 第一阶段：先像第141题一样，让快慢指针在环内相遇
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            break
    else:
        return None

    # 第二阶段：一个回到 head，一个留在相遇点；都改成一步一步
    p = head
    while p is not slow:
        ...

    return p
`;
if(hc['linked-list-cycle-ii']){
  hc['linked-list-cycle-ii'].meaning={q:'第一阶段 slow 和 fast 相遇后，为什么不能直接 return slow？',options:['第一次相遇只保证“这个点在环里”，并不保证它就是环入口；还要做第二阶段定位','因为 slow 的值可能重复','因为 fast 必须先回到尾部'],answer:0,explain:'例如一个较长的环里，快指针可能在入口之后追上 slow。Floyd 的第二阶段才把“环内相遇点”转换成“入口位置”。'};
  hc['linked-list-cycle-ii'].full.guide='把它当成第141题 + 一个新阶段。先完整写出“检测到相遇”；然后只新增三行思路：p=head、p/slow 同步一步、相遇返回。不要把两个阶段混着写。';
}

if(bySlug['add-two-numbers']) bySlug['add-two-numbers'].starter=`def addTwoNumbers(l1, l2):
    dummy = ListNode(0)
    tail = dummy
    carry = 0

    while l1 or l2 or carry:
        # 某条链表用完时，这一位按 0 处理
        x = l1.val if l1 else 0
        y = l2.val if l2 else 0
        total = x + y + carry

        # total 拆成新的进位 carry 和当前个位 digit
        ...

        # 创建当前结果节点，再推进 l1 / l2
        ...

    return dummy.next
`;
if(hc['add-two-numbers']) hc['add-two-numbers'].full.guide='先把链表忘掉，手算 342+465：每一位都只做 x+y+carry，再把结果拆成“个位”和“进位”。链表只是把这些位从低到高依次送进来。';

if(bySlug['remove-nth-node-from-end-of-list']) bySlug['remove-nth-node-from-end-of-list'].starter=`def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy

    # fast 先走 n 步，制造固定间隔
    for _ in range(n):
        fast = fast.next

    # fast 到最后一个节点时，slow 正好停在“要删除节点的前一个”
    while fast.next:
        ...

    # 删除 slow.next
    ...
    return dummy.next
`;
if(hc['remove-nth-node-from-end-of-list']){
  hc['remove-nth-node-from-end-of-list'].full.guide='关键不是“倒数第 n 个怎么数”，而是让 fast 永远领先 slow n 步。用 1→2→3→4→5，n=2 手推：fast 先走到2；两者一起走到 fast=5 时，slow=3，正好站在要删的4前面。';
}

if(bySlug['swap-nodes-in-pairs']) bySlug['swap-nodes-in-pairs'].starter=`def swapPairs(head):
    dummy = ListNode(0, head)
    prev = dummy

    while prev.next and prev.next.next:
        a = prev.next
        b = a.next

        # 原来：prev -> a -> b -> after
        # 目标：prev -> b -> a -> after
        # 先保存/利用 b.next，把三条关键连接重新接好
        ...

        # 下一轮 prev 应该来到交换后的 a
        ...

    return dummy.next
`;
if(hc['swap-nodes-in-pairs']){
  hc['swap-nodes-in-pairs'].syntax.summary='别背三行赋值，先画四个位置：prev → a → b → after。交换后只需要得到 prev → b → a → after。每一行代码就是在恢复这三条箭头。';
  hc['swap-nodes-in-pairs'].full.guide='只用 1→2→3→4 画第一轮。先写 a=1、b=2，然后按目标图依次连 a→3、b→a、prev→b。第一轮结束后 prev 应移动到 a，也就是现在这一对的尾巴1。';
}
})();