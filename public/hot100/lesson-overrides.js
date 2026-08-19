window.HOT100_LESSONS={
"two-sum":{example:"nums = [2, 7, 11, 15]，target = 9",traceLabels:["当前 i / x","need","seen：数字 → 下标"],trace:[
{a:"0 / 2",b:"7",c:"{}",message:"need = 7 还没出现，所以记录 seen[2] = 0。"},
{a:"1 / 7",b:"2",c:"{2: 0}",message:"need = 2 已经出现，seen[2] = 0；当前 i = 1，所以返回 [0, 1]。",returned:true}]},
"group-anagrams":{example:'strs = ["eat", "tea", "tan", "ate"]',traceLabels:["当前字符串 s","排序后的 key","groups"],trace:[
{a:"eat",b:"aet",c:'{aet:[eat]}',message:'eat 排序后是 aet，先建立 aet 这一组。'},
{a:"tea",b:"aet",c:'{aet:[eat,tea]}',message:'tea 的 key 也是 aet，因此加入同一组。'},
{a:"tan",b:"ant",c:'{aet:[eat,tea], ant:[tan]}',message:'tan 的 key 是 ant，建立新分组。'},
{a:"ate",b:"aet",c:'{aet:[eat,tea,ate], ant:[tan]}',message:'ate 再次得到 aet，所以与 eat、tea 分到一起。'}]},
"longest-consecutive-sequence":{example:"nums = [100, 4, 200, 1, 3, 2]",traceLabels:["当前起点 x","向右走到 y","best"],trace:[
{a:"100",b:"101",c:"1",message:"99 不在集合里，所以 100 是一段序列的起点；向右只能走 1 个数。"},
{a:"4",b:"—",c:"1",message:"3 在集合里，4 不是起点，直接跳过，避免重复扫描。"},
{a:"1",b:"5",c:"4",message:"0 不存在，1 是起点；1→2→3→4 连续，长度 4。"}]},
"move-zeroes":{example:"nums = [0, 1, 0, 3, 12]",traceLabels:["fast / 当前值","slow","nums"],trace:[
{a:"0 / 0",b:"0",c:"[0,1,0,3,12]",message:"看到 0，不处理；slow 仍指向位置 0。"},
{a:"1 / 1",b:"1",c:"[1,0,0,3,12]",message:"看到非零 1，与 nums[slow] 交换，然后 slow += 1。"},
{a:"3 / 3",b:"2",c:"[1,3,0,0,12]",message:"3 被放到下一个非零位置，slow 继续向右。"},
{a:"4 / 12",b:"3",c:"[1,3,12,0,0]",message:"最后得到所有非零数保持原顺序，0 被移动到末尾。"}]},
"container-with-most-water":{example:"height = [1,8,6,2,5,4,8,3,7]",traceLabels:["left / right","当前面积","best"],trace:[
{a:"0 / 8",b:"8",c:"8",message:"短板是左侧高度 1，所以移动 left。"},
{a:"1 / 8",b:"49",c:"49",message:"min(8,7) × 7 = 49，更新最大面积。"},
{a:"1 / 7",b:"18",c:"49",message:"右侧高度 3 更短，移动 right；best 保持 49。"}]},
"3sum":{example:"nums = [-1, 0, 1, 2, -1, -4]",traceLabels:["固定 nums[i]","left / right","total"],trace:[
{a:"-4",b:"-1 / 2",c:"-3",message:"总和小于 0，需要变大，所以 left 右移。"},
{a:"-1",b:"-1 / 2",c:"0",message:"找到 [-1,-1,2]，记录后同时移动左右指针并跳过重复。"},
{a:"-1",b:"0 / 1",c:"0",message:"再找到 [-1,0,1]。之后继续移动直到 left >= right。"}]},
"trapping-rain-water":{example:"height = [4,2,0,3,2,5]",traceLabels:["left / right","leftMax / rightMax","water"],trace:[
{a:"0 / 5",b:"4 / 0",c:"0",message:"右边更高，左侧当前水量可以确定，更新 leftMax。"},
{a:"1 / 5",b:"4 / 0",c:"2",message:"高度 2 左边最高是 4，所以当前位置接 4-2=2。"},
{a:"2 / 5",b:"4 / 0",c:"6",message:"高度 0 可接 4；累计 water = 6。"},
{a:"3 / 5",b:"4 / 0",c:"7",message:"高度 3 可接 1，继续直到左右相遇。"}]},
"longest-substring-without-repeating-characters":{example:'s = "abcabcbb"',traceLabels:["right / ch","left","best"],trace:[
{a:"0 / a",b:"0",c:"1",message:'窗口是 "a"，没有重复。'},
{a:"2 / c",b:"0",c:"3",message:'窗口扩成 "abc"，best = 3。'},
{a:"3 / a",b:"1",c:"3",message:'a 在当前窗口中重复，把 left 移到旧 a 的后一位。'},
{a:"4 / b",b:"2",c:"3",message:'继续维护无重复窗口，最长长度仍为 3。'}]},
"find-all-anagrams-in-a-string":{example:'s = "cbaebabacd"，p = "abc"',traceLabels:["right / ch","当前窗口","答案"],trace:[
{a:"2 / a",b:"cba",c:"[0]",message:"长度达到 3，窗口计数等于 p，记录起点 0。"},
{a:"3 / e",b:"bae",c:"[0]",message:"加入 e，同时移出最左边 c，计数不再匹配。"},
{a:"8 / c",b:"bac",c:"[0,6]",message:"窗口 bac 与 abc 字符计数一致，记录起点 6。"}]},
"subarray-sum-equals-k":{example:"nums = [1, 1, 1]，k = 2",traceLabels:["当前 x","prefix","ans"],trace:[
{a:"1",b:"1",c:"0",message:"prefix-k = -1 没出现；记录前缀和 1。"},
{a:"1",b:"2",c:"1",message:"prefix-k = 0 出现 1 次，所以找到子数组 [1,1]。"},
{a:"1",b:"3",c:"2",message:"prefix-k = 1 出现 1 次，再找到一个和为 2 的子数组。"}]},
"sliding-window-maximum":{example:"nums = [1,3,-1,-3,5,3,6,7]，k = 3",traceLabels:["i / x","deque 中的下标","窗口最大值"],trace:[
{a:"0 / 1",b:"[0]",c:"—",message:"队列为空，先放下标 0。"},
{a:"1 / 3",b:"[1]",c:"—",message:"3 比队尾的 1 大，1 永远不可能再成为最大值，弹出 0。"},
{a:"2 / -1",b:"[1,2]",c:"3",message:"形成第一个完整窗口，队首下标 1 对应值 3，就是最大值。"},
{a:"4 / 5",b:"[4]",c:"5",message:"5 把队尾所有更小元素都淘汰，自己成为新的最大值候选。"}]},
"minimum-window-substring":{example:'s = "ADOBECODEBANC"，t = "ABC"',traceLabels:["right / ch","have / required","当前 best"],trace:[
{a:"0 / A",b:"1 / 3",c:"—",message:"A 的需求满足一种，但窗口还不合法。"},
{a:"5 / C",b:"3 / 3",c:"ADOBEC",message:"A、B、C 都满足，窗口第一次合法，开始收缩 left。"},
{a:"10 / A",b:"3 / 3",c:"CODEBA",message:"再次合法，继续尝试缩短。"},
{a:"12 / C",b:"3 / 3",c:"BANC",message:"得到长度 4 的合法窗口 BANC，成为最终最短答案。"}]},
"maximum-subarray":{example:"nums = [-2,1,-3,4,-1,2,1,-5,4]",traceLabels:["当前 x","cur","best"],trace:[
{a:"-2",b:"-2",c:"-2",message:"第一项既是当前结尾最大和，也是目前 best。"},
{a:"1",b:"1",c:"1",message:"-2+1 不如从 1 重新开始，所以 cur = 1。"},
{a:"4",b:"4",c:"4",message:"前面的 cur 为负贡献，直接从 4 开始。"},
{a:"1",b:"6",c:"6",message:"4 + (-1) + 2 + 1 累积到 6，更新 best。"}]},
"merge-intervals":{example:"intervals = [[1,3],[2,6],[8,10],[15,18]]",traceLabels:["当前区间","结果最后区间","ans"],trace:[
{a:"[1,3]",b:"—",c:"[[1,3]]",message:"结果为空，直接加入第一个区间。"},
{a:"[2,6]",b:"[1,3]",c:"[[1,6]]",message:"2 <= 3，发生重叠，把右端点扩到 6。"},
{a:"[8,10]",b:"[1,6]",c:"[[1,6],[8,10]]",message:"8 > 6，不重叠，新增一个区间。"}]},
"rotate-array":{example:"nums = [1,2,3,4,5,6,7]，k = 3",traceLabels:["阶段","nums","说明"],trace:[
{a:"整体反转",b:"[7,6,5,4,3,2,1]",c:"尾部移到前方",message:"先把整个数组反转。"},
{a:"反转前 k 个",b:"[5,6,7,4,3,2,1]",c:"恢复尾部顺序",message:"前 3 个元素原本是最后 3 个，反转后顺序恢复。"},
{a:"反转剩余部分",b:"[5,6,7,1,2,3,4]",c:"完成",message:"后半段也恢复原顺序，得到右旋 3 步结果。"}]},
"product-of-array-except-self":{example:"nums = [1,2,3,4]",traceLabels:["阶段 / i","prefix / suffix","ans"],trace:[
{a:"左扫 / 0",b:"1 / —",c:"[1,1,1,1]",message:"位置 0 左边没有数，所以左侧乘积是 1。"},
{a:"左扫 / 3",b:"24 / —",c:"[1,1,2,6]",message:"第一遍结束后 ans[i] 保存每个位置左侧乘积。"},
{a:"右扫 / 3",b:"— / 4",c:"[1,1,2,6]",message:"从右边开始维护 suffix。"},
{a:"右扫 / 0",b:"— / 24",c:"[24,12,8,6]",message:"把右侧乘积乘进 ans，得到最终答案。"}]},
"first-missing-positive":{example:"nums = [3,4,-1,1]",traceLabels:["i / x","目标位置 x-1","nums"],trace:[
{a:"0 / 3",b:"2",c:"[-1,4,3,1]",message:"3 应该放在下标 2，与 nums[2] 交换。"},
{a:"0 / -1",b:"忽略",c:"[-1,4,3,1]",message:"-1 不在 1..n 范围内，i 右移。"},
{a:"1 / 4",b:"3",c:"[-1,1,3,4]",message:"4 放到下标 3；当前位置得到 1，还要继续检查。"},
{a:"扫描",b:"下标 1",c:"答案 2",message:"最终 nums[1] != 2，所以最小缺失正数是 2。"}]},
"set-matrix-zeroes":{example:"matrix = [[1,1,1],[1,0,1],[1,1,1]]",traceLabels:["阶段","rows / cols","matrix"],trace:[
{a:"扫描",b:"{1} / {1}",c:"原矩阵",message:"发现 matrix[1][1] = 0，只记录第 1 行、第 1 列需要清零。"},
{a:"统一修改",b:"{1} / {1}",c:"[[1,0,1],[0,0,0],[1,0,1]]",message:"扫描结束后再一次性清零，避免新产生的 0 干扰判断。"}]},
"spiral-matrix":{example:"matrix = [[1,2,3],[4,5,6],[7,8,9]]",traceLabels:["边界 top/bottom","left/right","ans"],trace:[
{a:"0 / 2",b:"0 / 2",c:"[1,2,3]",message:"先走最上边，从左到右加入 1,2,3。"},
{a:"1 / 2",b:"0 / 2",c:"[1,2,3,6,9]",message:"再走最右边，从上到下加入 6,9。"},
{a:"1 / 1",b:"1 / 1",c:"[1,2,3,6,9,8,7,4]",message:"走完下边和左边后，边界向内缩。"},
{a:"1 / 1",b:"1 / 1",c:"[1,2,3,6,9,8,7,4,5]",message:"最后只剩中心元素 5。"}]},
"rotate-image":{example:"matrix = [[1,2,3],[4,5,6],[7,8,9]]",traceLabels:["阶段","matrix","说明"],trace:[
{a:"原矩阵",b:"[[1,2,3],[4,5,6],[7,8,9]]",c:"—",message:"目标是顺时针旋转 90°。"},
{a:"转置",b:"[[1,4,7],[2,5,8],[3,6,9]]",c:"行列互换",message:"沿主对角线交换 matrix[i][j] 与 matrix[j][i]。"},
{a:"每行反转",b:"[[7,4,1],[8,5,2],[9,6,3]]",c:"完成",message:"反转每一行后得到顺时针旋转结果。"}]},
"search-a-2d-matrix-ii":{example:"从右上角 15 开始搜索 target = 5",traceLabels:["row / col","当前 x","动作"],trace:[
{a:"0 / 4",b:"15",c:"左移",message:"15 > 5，这一列下面只会更大，所以排除第 4 列。"},
{a:"0 / 1",b:"4",c:"下移",message:"4 < 5，这一行左边更小，不可能命中，所以排除第 0 行。"},
{a:"1 / 1",b:"5",c:"返回 True",message:"找到 target，函数立即返回。",returned:true}]},
"intersection-of-two-linked-lists":{example:"A: 4→1→8→4→5；B: 5→6→1→8→4→5",traceLabels:["p","q","状态"],trace:[
{a:"A:4",b:"B:5",c:"不同",message:"两个指针分别从各自链表开始。"},
{a:"A 走完 → B 头",b:"B 中",c:"消除长度差",message:"p 到 None 后切到 headB；q 到 None 后切到 headA。"},
{a:"节点 8",b:"节点 8",c:"同一对象",message:"两者最终在共享的节点 8 相遇，返回这个节点。",returned:true}]},
"reverse-linked-list":{example:"1 → 2 → 3 → 4 → 5",traceLabels:["cur","prev","链表变化"],trace:[
{a:"1",b:"None",c:"1 → None",message:"先保存 nxt=2，再把 1.next 指向 prev(None)。"},
{a:"2",b:"1",c:"2 → 1 → None",message:"保存 nxt=3，然后把 2.next 指向 1。"},
{a:"3",b:"2",c:"3 → 2 → 1",message:"重复相同操作，已反转部分不断增长。"},
{a:"None",b:"5",c:"5 → 4 → 3 → 2 → 1",message:"cur 走到 None，prev 就是新头节点。"}]},
"palindrome-linked-list":{example:"1 → 2 → 2 → 1",traceLabels:["阶段","slow / fast","状态"],trace:[
{a:"找中点",b:"2 / 尾部",c:"slow 到中间",message:"fast 每次两步，slow 每次一步。"},
{a:"反转后半段",b:"1 → 2",c:"后半段反向",message:"把后半段变成从尾部向中间的顺序。"},
{a:"逐个比较",b:"1=1，2=2",c:"True",message:"前半段与反转后的后半段全部相等，所以是回文。",returned:true}]},
"linked-list-cycle":{example:"3 → 2 → 0 → -4 ↘︎ 回到 2",traceLabels:["slow","fast","状态"],trace:[
{a:"2",b:"0",c:"未相遇",message:"slow 一步，fast 两步。"},
{a:"0",b:"2",c:"未相遇",message:"进入环后 fast 会持续追赶 slow。"},
{a:"-4",b:"-4",c:"相遇",message:"两个指针指向同一节点，说明存在环，返回 True。",returned:true}]},
"linked-list-cycle-ii":{example:"3 → 2 → 0 → -4 ↘︎ 回到 2",traceLabels:["阶段","指针位置","结果"],trace:[
{a:"第一阶段",b:"slow 与 fast 在环内相遇",c:"确认有环",message:"先用快慢指针找到任意一个环内相遇点。"},
{a:"第二阶段",b:"p=head；slow=相遇点",c:"同步一步",message:"把一个指针放回头节点，两者都每次走一步。"},
{a:"再次相遇",b:"节点 2",c:"入环点",message:"第二次相遇的位置就是环的入口，返回该节点。",returned:true}]},
"merge-two-sorted-lists":{example:"1→2→4 与 1→3→4",traceLabels:["list1","list2","结果链表"],trace:[
{a:"1",b:"1",c:"1",message:"比较两个头节点，把较小（或相等时左边）的节点接到 tail。"},
{a:"2",b:"1",c:"1→1",message:"右边 1 更小，接入结果并移动 list2。"},
{a:"2",b:"3",c:"1→1→2",message:"继续比较当前两个节点。"},
{a:"4",b:"4",c:"1→1→2→3→4→4",message:"一边耗尽后，剩余链表可以整体接上。"}]},
"add-two-numbers":{example:"2→4→3 + 5→6→4（表示 342 + 465）",traceLabels:["x + y + carry","digit","carry / 结果"],trace:[
{a:"2 + 5 + 0 = 7",b:"7",c:"0 / 7",message:"当前位写 7，没有进位。"},
{a:"4 + 6 + 0 = 10",b:"0",c:"1 / 7→0",message:"当前位写 0，carry 变成 1。"},
{a:"3 + 4 + 1 = 8",b:"8",c:"0 / 7→0→8",message:"最后得到链表 7→0→8，对应 807。"}]},
"remove-nth-node-from-end-of-list":{example:"1→2→3→4→5，n = 2",traceLabels:["阶段","fast / slow","说明"],trace:[
{a:"拉开距离",b:"fast 领先 2 步",c:"固定间隔",message:"fast 先走 n 步。"},
{a:"同步移动",b:"fast 到 5 / slow 到 3",c:"slow 在待删节点前",message:"继续到 fast.next 为 None。"},
{a:"删除",b:"slow=3",c:"1→2→3→5",message:"执行 slow.next = slow.next.next，跳过节点 4。"}]},
"swap-nodes-in-pairs":{example:"1 → 2 → 3 → 4",traceLabels:["a","b","链表"],trace:[
{a:"1",b:"2",c:"2→1→3→4",message:"把 prev→1→2 改成 prev→2→1。"},
{a:"3",b:"4",c:"2→1→4→3",message:"prev 移到 1 后，再处理下一对 3、4。"},
{a:"—",b:"—",c:"2→1→4→3",message:"没有完整的一对时结束。"}]}
};