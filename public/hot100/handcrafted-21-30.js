window.HOT100_HANDCRAFTED=Object.assign(window.HOT100_HANDCRAFTED||{}, {
"search-a-2d-matrix-ii":{
 syntax:{items:[["row, col = 0, len(matrix[0])-1","从右上角开始，因为这里左边更小、下边更大。"],["x = matrix[row][col]","读取当前候选值。"],["if x == target: return True","找到目标就立即结束。"],["if x > target: col -= 1","当前太大，只能去更小的左边，同时排除这一列。"],["else: row += 1","当前太小，只能去更大的下方，同时排除这一行。"]],summary:"每比较一个位置，不只是排除一个格子，而是排除一整行或一整列，所以最多走 m+n 步。"},
 meaning:{q:"为什么当前值比 target 大时一定左移，而不是下移？",options:["同一列下面只会更大，不可能找到更小的 target","因为左边一定就是 target","因为下移会越界"],answer:0,explain:"列是递增的。当前位置已经太大，下面只会更大，所以整列都可以排除。"},
 fill:{targets:["x = matrix[row][col]","if x == target: return True","if x > target: col -= 1"],distractors:["row -= 1","col += 1"],explain:"先读取右上角候选；相等直接返回；太大就左移。剩下的 else 对应当前太小，因此 row += 1 向下走。"},
 full:{guide:"别忘了空矩阵边界。若 matrix 或 matrix[0] 为空，要直接返回 False。"},
 recall:{q:"搜索行列都递增的矩阵，为什么常从右上角开始？",options:["比较后可以唯一决定左移或下移，并排除整行或整列","因为右上角一定最大","因为左上角不能访问"],answer:0,explain:"右上角同时拥有一个变小方向和一个变大方向，比较后决策唯一。"}
},
"intersection-of-two-linked-lists":{
 syntax:{items:[["p, q = headA, headB","两个指针分别从两条链表起点出发。"],["while p is not q","比较的是不是同一个节点对象，而不是节点值是否相同。"],["p = headB if p is None else p.next","p 走完 A 后改走 B。"],["q = headA if q is None else q.next","q 走完 B 后改走 A。"],["return p","相遇时就是交点；若无交点，两者最终都会是 None。"]],summary:"p 走 A→B，q 走 B→A。两人总路程都变成 len(A)+len(B)，原本的长度差自然被抵消。"},
 meaning:{q:"为什么这里必须比较节点对象，而不是比较 val？",options:["相交要求两条链表真正共享同一个节点，值相同并不代表相交","因为 val 不能比较","因为节点值一定不同"],answer:0,explain:"两个独立节点都可以写着 8，但它们不是同一个节点，也不会共享后续链表。"},
 fill:{targets:["p, q = headA, headB","p = headB if p is None else p.next","q = headA if q is None else q.next"],distractors:["p = p.next.next","q = q.next.next"],explain:"先建立两个指针；每个指针走完自己的链表后切到另一条。这样两者走过的总长度一致，最终会在交点或 None 相遇。"},
 full:{guide:"站内测试会检查对象身份，所以返回一个新建但 val 相同的节点也会判错。"},
 recall:{q:"两个长度不同的链表找交点，最简洁的对齐方法是什么？",options:["两个指针分别走 A→B 和 B→A","比较所有节点值","先反转两条链表"],answer:0,explain:"交叉走法自动消除长度差，不需要先计算长度。"}
},
"reverse-linked-list":{
 syntax:{items:[["prev, cur = None, head","prev 是已经反转好的部分，cur 是当前要处理的节点。"],["nxt = cur.next","先保存原来的后继，防止改 next 后丢失剩余链表。"],["cur.next = prev","真正把当前箭头反过来。"],["prev = cur","当前节点加入已反转部分。"],["cur = nxt","沿着刚才保存的后路继续。"]],summary:"顺序必须是：保存后路 → 反转箭头 → 推进 prev → 推进 cur。任何一步乱序都可能断链。"},
 meaning:{q:"为什么 nxt = cur.next 必须发生在 cur.next = prev 之前？",options:["否则原来的下一个节点引用会被覆盖，剩余链表就找不到了","因为 nxt 必须先初始化为 None","为了计算长度"],answer:0,explain:"单链表只有 next 这一条路。一旦覆盖 cur.next，就无法凭空恢复原来的后继。"},
 fill:{targets:["nxt = cur.next","cur.next = prev","prev = cur"],distractors:["cur.next = nxt","prev = None"],explain:"第一空保存后路；第二空把箭头反向；第三空把当前节点纳入已反转部分。之后 cur=nxt 才能继续。"},
 full:{guide:"用 1→2→3 画箭头手推三轮，比背代码可靠。循环结束时 cur=None，新的头就是 prev。"},
 recall:{q:"反转单链表最关键的安全动作是什么？",options:["修改 cur.next 前先保存 nxt","先删除 head","先给节点排序"],answer:0,explain:"保存后路避免链表断掉后无法继续遍历。"}
},
"palindrome-linked-list":{
 syntax:{items:[["slow = fast = head","快慢指针同时从头开始。"],["slow = slow.next","slow 每轮走一步。"],["fast = fast.next.next","fast 每轮走两步，因此 fast 到尾时 slow 在中点附近。"],["反转 slow 开始的后半段","单链表不能从尾向前读，所以把后半段方向翻过来。"],["从 head 和反转后的后半段同步比较","两边节点值逐个对应，任意不等就不是回文。"]],summary:"这题其实是三个已经熟悉的动作组合：快慢指针找中点 → 反转链表 → 两边同步比较。"},
 meaning:{q:"为什么 fast 每次走两步能帮助 slow 找到中点？",options:["fast 速度是 slow 的两倍，fast 到尾时 slow 大约走了链表一半","因为 fast 会记录长度","因为 slow 会自动停在中间"],answer:0,explain:"速度比 2:1 让我们无需先计算链表长度就能定位中间。"},
 fill:{targets:["slow = fast = head","slow = slow.next","fast = fast.next.next"],distractors:["slow = slow.next.next","fast = fast.next"],explain:"三个空只负责第一阶段“找中点”：两个指针从头出发，slow 一步、fast 两步。之后还需要反转后半段并逐个比较。"},
 full:{guide:"先独立写出找中点和反转后半段，再写比较。奇数长度时中间那个节点不需要与自己特别比较。"},
 recall:{q:"回文链表的经典三步是什么？",options:["快慢指针找中点 → 反转后半段 → 两边比较","排序 → 去重 → 比较","哈希计数 → 二分"],answer:0,explain:"这套组合把单向链表转换成了可以做两端比较的问题。"}
},
"linked-list-cycle":{
 syntax:{items:[["slow = fast = head","两个指针从同一位置出发。"],["while fast and fast.next","保证 fast 每轮可以安全走两步。"],["slow = slow.next","慢指针一次一步。"],["fast = fast.next.next","快指针一次两步。"],["if slow is fast: return True","如果在某个节点对象相遇，就说明存在环。"]],summary:"有环时，fast 进入环后每轮相对 slow 多走一步，最终一定追上；无环时，fast 会先走到 None。"},
 meaning:{q:"有环时为什么快慢指针一定能相遇？",options:["进入有限长度的环后，fast 每轮相对 slow 多前进 1 个节点，最终相对距离会变成 0","因为节点值会重复","因为 fast 会停下来等 slow"],answer:0,explain:"这是环形跑道上的追赶问题，与节点值无关。"},
 fill:{targets:["slow = fast = head","slow = slow.next","fast = fast.next.next"],distractors:["slow = slow.next.next","fast = fast.next"],explain:"先让两个指针同点出发；循环中 slow 一步、fast 两步。每轮移动后还要检查 slow is fast，相遇就返回 True。"},
 full:{guide:"不要通过节点值是否重复判断环，链表里本来就可以有重复值；必须比较节点对象身份。"},
 recall:{q:"检测链表环的标准 O(1) 空间方法是什么？",options:["Floyd 快慢指针","把所有节点排序","只看最后一个节点"],answer:0,explain:"有环追上、无环 fast 到 None，是这套方法的完整逻辑。"}
},
"linked-list-cycle-ii":{
 syntax:{items:[["第一阶段：slow/fast 相遇","先确认有环，并得到一个环内相遇点。这个点通常不是入口。"],["p = head","第二阶段让一个指针回到链表头。"],["while p is not slow","p 与相遇点处的 slow 还没碰面就继续。"],["p = p.next; slow = slow.next","第二阶段两者都改成一次一步。"],["return p","再次相遇的位置就是入环点。"]],summary:"这是两阶段 Floyd：第一阶段找到环内相遇点，第二阶段一个回头、一个留在原处，同速前进定位入口。"},
 meaning:{q:"第二阶段为什么两边都改成一次走一步？",options:["Floyd 的距离关系保证它们同速前进会在入口相遇","因为 fast 已经不能走两步","为了让代码更短"],answer:0,explain:"这是由“头到入口距离”和“相遇点到入口的等价距离”推出来的结论。"},
 fill:{targets:["p = head","p = p.next","slow = slow.next"],distractors:["fast = fast.next.next","return head"],explain:"第一阶段相遇后，p 回到 head；第二阶段 p 和 slow 每轮都只走一步。它们下一次相遇的位置就是入口。"},
 full:{guide:"这题比 141 多的只有第二阶段。先确认你能独立写出“检测环”，再加入“一个回头、同步一步”的入口定位。"},
 recall:{q:"Floyd 找环入口的第二阶段怎么做？",options:["一个指针回 head，与相遇点指针同步一步走，再次相遇即入口","继续保持一快一慢","从尾节点倒着找"],answer:0,explain:"记住“一回头、一留在相遇点、同步一步”。"}
},
"merge-two-sorted-lists":{
 syntax:{items:[["dummy = ListNode(0)","假头节点，不属于最终有效数据，用来统一处理第一次连接。"],["tail = dummy","tail 始终指向当前合并结果的最后一个节点。"],["list1.val <= list2.val","比较两条有序链表当前最前面的候选。"],["tail.next = list1 / list2","把更小的节点接到结果后面。"],["tail = tail.next","接好一个节点后，结果尾巴跟着向后移动。"]],summary:"dummy 解决“第一个节点怎么接”，tail 解决“下一个节点接在哪里”。这两个角色在很多链表构造题里都会出现。"},
 meaning:{q:"一条链表已经耗尽后，为什么可以直接把另一条剩余链表接上？",options:["另一条剩余部分本身仍然有序，不需要继续逐个比较","因为剩余节点都相等","因为 tail 会自动复制节点"],answer:0,explain:"只有两边都还有节点时才需要比较；一边为空后，另一边剩余顺序已经正确。"},
 fill:{targets:["dummy = ListNode(0)","tail = dummy","tail = tail.next"],distractors:["tail = None","dummy = list1"],explain:"dummy 创建统一假头，tail 从它开始；每次接入较小节点后，tail 都要移动到新的结果末尾。循环结束后还需把剩余链表接上。"},
 full:{guide:"最终返回 dummy.next，不是 dummy。dummy 本身只是辅助节点。"},
 recall:{q:"链表构造类题为什么常用 dummy？",options:["统一处理头节点和后续节点的连接","让链表自动排序","避免使用 next"],answer:0,explain:"dummy 可以消除“第一次插入”和“删除头节点”这类特殊分支。"}
},
"add-two-numbers":{
 syntax:{items:[["carry = 0","保存上一位留下来的进位。"],["x = l1.val if l1 else 0","某条链表提前结束时，这一位按 0 处理。"],["total = x + y + carry","当前这一位完整的竖式加法。"],["carry, digit = divmod(total, 10)","商是新进位，余数是当前结果位。"],["while l1 or l2 or carry","两条链表都结束后，可能还剩最后一个进位节点。"]],summary:"每一轮只处理一位：两个当前数字 + 旧进位 → 当前 digit + 新 carry。它就是小学竖式加法。"},
 meaning:{q:"为什么循环条件里必须包含 carry？",options:["最后一位相加后可能仍产生一个新的最高位","carry 用来记录链表长度","否则不能访问 l1"],answer:0,explain:"例如 5+5=10，两条链表都走完后还需要再创建一个值为 1 的节点。"},
 fill:{targets:["carry = 0","total = x + y + carry","carry, digit = divmod(total, 10)"],distractors:["carry = total","digit = total"],explain:"先从 carry=0 开始；每轮把两位和旧进位加成 total；再用 divmod 一次拆出新进位和当前位。之后要创建 digit 节点并推进 l1/l2。"},
 full:{guide:"重点测试 [9,9,9] + [1]，它最容易暴露“最后 carry 没处理”的 bug。"},
 recall:{q:"两数相加链表题最核心的状态是什么？",options:["carry 进位","链表总长度","节点下标"],answer:0,explain:"它本质就是按链表顺序执行逐位竖式加法。"}
},
"remove-nth-node-from-end-of-list":{
 syntax:{items:[["dummy = ListNode(0, head)","给原头节点前面加统一前驱，删除 head 时也不用特殊处理。"],["fast = slow = dummy","两个指针都从 dummy 开始。"],["for _ in range(n): fast = fast.next","先让 fast 领先 slow n 个节点。"],["while fast.next","之后两者同步走，保持固定距离。"],["slow.next = slow.next.next","slow 最终停在待删节点前一个位置，直接跳过它。"]],summary:"固定距离双指针把“倒数第 n 个”转换成一次从前往后的扫描；dummy 则统一了删除头节点的边界情况。"},
 meaning:{q:"为什么希望 slow 最终停在待删除节点的前一个节点，而不是待删除节点本身？",options:["单链表删除需要修改前驱的 next，让它跳过目标节点","因为 slow 不能访问目标节点","为了返回节点值"],answer:0,explain:"删除动作本质是 slow.next = slow.next.next，所以必须拿到前驱。"},
 fill:{targets:["dummy = ListNode(0, head)","fast = slow = dummy","for _ in range(n): fast = fast.next"],distractors:["fast = head.next","slow = head.next"],explain:"dummy 提供统一前驱；fast/slow 从同一点出发；先让 fast 领先 n。接下来同步走到 fast.next 为空时，slow 就在待删节点前面。"},
 full:{guide:"一定测试 [1], n=1。若没有 dummy，这个“删除原头节点”的情况最容易让代码变得特殊。"},
 recall:{q:"“删除倒数第 n 个”常见的一次扫描技巧是什么？",options:["先让 fast 领先 n，再和 slow 同步移动","先反转链表","使用二分查找"],answer:0,explain:"固定间距双指针能避免先计算链表长度。"}
},
"swap-nodes-in-pairs":{
 syntax:{items:[["dummy = ListNode(0, head)","第一对交换后原 head 会变化，所以先放一个统一前驱。"],["a = prev.next; b = a.next","给当前要交换的两个节点明确命名。"],["a.next = b.next","先让 a 接回这一对之后的剩余链表，保存后路。"],["b.next = a","再让 b 指向 a，完成这一对内部反转。"],["prev.next = b","最后让前驱接到交换后的新头 b。"]],summary:"把 prev→a→b→next 改成 prev→b→a→next。推荐按“a 接后路 → b 指 a → prev 指 b”的顺序改，最不容易断链。"},
 meaning:{q:"交换完成后为什么 prev 要移动到 a？",options:["交换后顺序是 b→a，a 成为已处理部分最后一个节点，下一对就在它后面","因为 a 的值更小","为了把顺序再换回来"],answer:0,explain:"下一轮需要从 a.next 开始取新的两个节点，因此 a 正好是新的 prev。"},
 fill:{targets:["a.next = b.next","b.next = a","prev.next = b"],distractors:["a = b.next","prev = b"],explain:"三个空对应三条关键连线：a 先接回后路，b 再指向 a，最后 prev 改指 b。任何一条缺失都可能丢节点或断链。"},
 full:{guide:"用 1→2→3 手推：第一轮后应得到 2→1→3，最后单独的 3 保持不动。"},
 recall:{q:"两两交换节点时，最重要的思维方式是什么？",options:["先固定 prev、a、b 三个角色，再逐条重连 next","只交换节点值","先反转整条链表"],answer:0,explain:"链表指针题先给角色命名，再改连接关系，会清楚很多。"}
}
});