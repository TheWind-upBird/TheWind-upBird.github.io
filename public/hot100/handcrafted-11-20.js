window.HOT100_HANDCRAFTED=Object.assign(window.HOT100_HANDCRAFTED||{}, {
"sliding-window-maximum":{
 syntax:{items:[["dq = deque()","双端队列，两头都能高效弹出。这里保存的是下标，不是单纯的数值。"],["nums[dq[-1]] <= x","新值 x 比队尾候选更大时，队尾以后不可能再成为最大值，可以淘汰。"],["dq.append(i)","把当前下标加入候选队列。"],["dq[0] <= i-k","判断队首下标是否已经离开当前窗口。"],["nums[dq[0]]","队首对应的值就是当前窗口最大值。"]],summary:"deque 里不是窗口的全部元素，而是一份“未来还有机会成为最大值”的候选名单，并且对应值保持从大到小。"},
 meaning:{q:"为什么新值 5 进来时，可以把队尾更小的 3、-1 删除？",options:["5 更大而且更晚离开窗口，这些更小更早的值以后不可能压过 5","因为队列最多只能放一个数","因为负数必须删除"],answer:0,explain:"只要 5 还在窗口，那些更小且更早的值就不可能成为最大值；等 5 离开时，它们早已先离开。"},
 fill:{targets:["while dq and nums[dq[-1]] <= x: dq.pop()","dq.append(i)","if dq[0] <= i-k: dq.popleft()"],distractors:["dq.clear()","dq.append(x)"],explain:"第一空维护候选值单调递减；第二空加入当前下标；第三空把已经离开窗口的队首下标移除。形成完整窗口后，最大值就是 nums[dq[0]]。"},
 full:{guide:"这题最重要的是能解释“为什么可以删队尾”。先保证 deque 存下标、值单调递减，再补上形成完整窗口后把队首值加入答案。"},
 recall:{q:"单调队列解决窗口最大值的本质是什么？",options:["只保留未来仍可能成为最大值的候选下标","保存窗口全部元素并每次排序","只记录当前最大值而不管位置"],answer:0,explain:"候选保持单调，队首才能 O(1) 给出最大值，同时下标还能判断是否过期。"}
},
"minimum-window-substring":{
 syntax:{items:[["need = Counter(t)","记录目标 t 中每个字符需要多少个。"],["window = Counter()","记录当前窗口内各字符数量。"],["have","已经满足“所需数量”的字符种类数。"],["required = len(need)","需要满足的字符种类总数。"],["while have == required","只有窗口已经合法时，才开始移动 left 尝试缩短。"]],summary:"这是典型的“先扩张到合法，再收缩到极限”的可变长度窗口。have/required 用来快速判断窗口是否已经覆盖 t。"},
 meaning:{q:"为什么不能只看窗口长度 >= len(t) 就开始收缩？",options:["长度够不代表字符种类和数量满足，例如 t='ABC' 而窗口是 'AAA'","因为字符串没有长度","因为 left 不能移动"],answer:0,explain:"覆盖要求是每个目标字符的数量都达到 need，而不是单纯长度够长。"},
 fill:{targets:["need = Counter(t)","required = len(need)","while have == required:"],distractors:["while have < required:","required = len(s)"],explain:"先建立目标计数，再记录需要满足多少种字符；当 have==required 时说明窗口已经合法，此时才进入收缩阶段寻找更短答案。"},
 full:{guide:"Hard 点在 have 的更新：某字符数量“刚好达到需求”时 have+1；收缩后“跌破需求”时 have-1。建议先写清楚这两个时刻，再写最短区间更新。"},
 recall:{q:"最小覆盖子串的窗口节奏是什么？",options:["右边扩张直到合法，合法后左边尽量收缩","始终固定窗口长度","只移动左边界"],answer:0,explain:"这就是大多数“最短满足条件子串”问题的基本框架。"}
},
"maximum-subarray":{
 syntax:{items:[["cur = best = nums[0]","第一项既是“以当前位置结尾”的最好结果，也是目前全局最好结果。"],["for x in nums[1:]","从第二个数开始逐个做选择。"],["cur = max(x, cur + x)","决定从 x 重新开始，还是把 x 接在前面的连续段后面。"],["best = max(best, cur)","把当前结尾最优和历史全局最优比较。"]],summary:"cur 是局部状态：必须以当前位置结尾。best 是全局答案：可以在任意位置结尾。区分这两个变量，转移就很自然。"},
 meaning:{q:"什么时候应该从当前 x 重新开始一段子数组？",options:["cur+x 还不如 x 本身时，说明之前那段是负贡献","只要 x 是负数","每次都应该重开"],answer:0,explain:"如果带上前面的连续段反而更小，就应该把前面丢掉，从当前 x 重新开始。"},
 fill:{targets:["cur = max(x, cur + x)","best = max(best, cur)"],distractors:["cur += x","best = cur"],explain:"第一空只决定“当前结尾”的最好结果；第二空再把这个局部结果拿去更新全局 best。最终应返回 best，而不是最后一次 cur。"},
 full:{guide:"用 [-2,1,-3,4,-1,2,1] 手推 cur：你应该看到它在 4 处重新开始，之后累积到 6。"},
 recall:{q:"最大子数组和里 cur 表示什么？",options:["必须以当前位置结尾的最大连续和","整个数组总和","当前最大元素"],answer:0,explain:"状态定义清楚后，cur=max(x,cur+x) 就不需要死记。"}
},
"merge-intervals":{
 syntax:{items:[["intervals.sort(key=lambda x: x[0])","先按区间起点排序，让可能重叠的区间靠在一起。"],["not ans","第一个区间还没有历史结果可比较，直接加入。"],["start > ans[-1][1]","新区间起点已经越过最后结果区间的终点，说明完全分离。"],["ans.append([start,end])","不重叠时，新开一段。"],["ans[-1][1] = max(...)","重叠时只需要扩展最后结果区间的右端点。"]],summary:"排序后，新区间若能和历史结果发生重叠，只可能延续最后一个合并区间，所以每次只需看 ans[-1]。"},
 meaning:{q:"为什么 [1,4] 和 [4,5] 也要合并？",options:["新区间起点 4 没有超过上一段终点 4，它们在端点相接","因为所有相邻区间都合并","因为长度相同"],answer:0,explain:"题目中的闭区间 [1,4] 和 [4,5] 在点 4 重叠，因此结果是 [1,5]。"},
 fill:{targets:["if not ans or start > ans[-1][1]:","ans.append([start,end])","ans[-1][1] = max(ans[-1][1], end)"],distractors:["ans.sort()","ans[-1] = [start,end]"],explain:"先判断是否完全分离；分离就新开区间；否则说明重叠，只扩展最后一段的右端点。"},
 full:{guide:"边界条件最容易错：判断“不重叠”应写 start > last_end，而不是 >=。"},
 recall:{q:"合并区间为什么通常第一步是排序？",options:["让可能重叠的区间在扫描顺序上相邻","为了删除重复数字","为了计算区间长度"],answer:0,explain:"排序把全局比较问题压缩成只比较当前区间和最后一个合并结果。"}
},
"rotate-array":{
 syntax:{items:[["k %= len(nums)","转满一整圈等于没动，所以把 k 化成 0..n-1 的有效移动量。"],["nums.reverse()","第一步把整个数组倒过来。"],["nums[:k] = reversed(nums[:k])","恢复搬到前面的那一段内部顺序。"],["nums[k:] = reversed(nums[k:])","恢复剩余那一段内部顺序。"]],summary:"三次反转不是口诀：第一次交换两段相对位置，后两次只负责把两段各自的内部顺序恢复。"},
 meaning:{q:"长度 7 的数组右移 9 格，为什么等价于右移 2 格？",options:["完整右移 7 格会回到原样，所以只剩 9%7=2","因为 9-7=2 只是巧合","因为数组最多移动 2 格"],answer:0,explain:"任何 k 都可以先做 k%=n，去掉完整转圈的部分。"},
 fill:{targets:["k %= len(nums)","nums.reverse()","nums[:k] = reversed(nums[:k])"],distractors:["nums.sort()","k = len(nums)"],explain:"先把 k 化成有效范围，再整体反转；第三步恢复前 k 个元素的内部顺序，之后还要对 nums[k:] 再反转一次。"},
 full:{guide:"用 [1,2,3,4,5,6,7], k=3 逐步打印三次反转结果，确保你知道每一步为什么存在。"},
 recall:{q:"数组右旋的原地经典技巧是什么？",options:["整体反转，再分别反转前后两段","排序数组","循环 k 次把第一个移到最后"],answer:0,explain:"三次反转能在 O(1) 额外空间内完成两段交换。"}
},
"product-of-array-except-self":{
 syntax:{items:[["ans = [1]*len(nums)","先给每个位置一个乘法单位元 1。"],["prefix = 1","prefix 表示当前位置左边所有数的乘积。"],["ans[i] = prefix","第一遍先把左侧贡献写进答案。注意这时还没乘 nums[i]。"],["suffix = 1","第二遍从右往左维护右侧乘积。"],["ans[i] *= suffix","把右侧贡献乘进已经保存的左侧贡献。"]],summary:"每个答案都拆成“左侧乘积 × 右侧乘积”。第一遍写左贡献，第二遍乘右贡献。"},
 meaning:{q:"第一遍执行 ans[i] = prefix 时，prefix 为什么不能包含 nums[i]？",options:["题目要求除自身以外，当前位置自己的数不能参与答案","因为 prefix 只能是 1","因为 nums[i] 可能为负"],answer:0,explain:"所以顺序必须是先 ans[i]=prefix，再 prefix*=nums[i]。"},
 fill:{targets:["ans[i] = prefix","prefix *= nums[i]","ans[i] *= suffix"],distractors:["ans[i] = nums[i]","prefix += nums[i]"],explain:"第一空把“左边所有数的乘积”保存到当前位置；第二空把当前数纳入 prefix 给下一个位置；第三空再乘入右侧 suffix。"},
 full:{guide:"有 0 时“总乘积除自己”的方法会麻烦，而前后缀乘积仍然自然工作。一定测试 [-1,1,0,-3,3]。"},
 recall:{q:"这题为什么可以不用除法？",options:["每个答案都可以拆成左侧乘积 × 右侧乘积","因为数组里没有 0","因为 Python 不支持除法"],answer:0,explain:"分解左右贡献比“总乘积除自己”更稳健。"}
},
"first-missing-positive":{
 syntax:{items:[["n = len(nums)","答案一定在 1..n+1 中，因此只关心 1..n 这些值能不能各归其位。"],["x = nums[i]","查看当前位置的数应该去哪个下标。"],["1 <= x <= n","只有 1..n 才值得放置，负数、0、过大值都可忽略。"],["nums[x-1] != x","目标位置还没放对时才交换，避免重复值导致死循环。"],["nums[i], nums[x-1] = ...","把值 x 放到它天然对应的下标 x-1。"]],summary:"把数组本身当哈希表：值 x 应该去位置 x-1。while 很关键，因为一次交换后当前位置来了新值，还要继续检查。"},
 meaning:{q:"为什么交换后不能立刻 i += 1？",options:["交换过来的新值可能也应该继续被放到别的位置","因为 while 不允许前进","为了把数组完全排序"],answer:0,explain:"当前位置只有在无法继续进行有效交换时才算处理完成。"},
 fill:{targets:["x = nums[i]","if 1 <= x <= n and nums[x-1] != x:","nums[i], nums[x-1] = nums[x-1], nums[i]"],distractors:["nums.sort()","i -= 1"],explain:"先读当前 x；只有 x 属于 1..n 且目标位置还没放对时才交换；交换后仍留在同一个 i 继续检查新换来的值。"},
 full:{guide:"最容易出现的 bug 是重复值导致无限交换，所以条件 nums[x-1] != x 不能少。最后再从左到右找第一个 nums[i] != i+1。"},
 recall:{q:"这道 Hard 使用了什么特殊技巧？",options:["把值 x 放到下标 x-1，用数组自身做哈希位置","普通排序","滑动窗口"],answer:0,explain:"原地哈希是这题做到 O(n) 时间、O(1) 额外空间的核心。"}
},
"set-matrix-zeroes":{
 syntax:{items:[["rows, cols = set(), set()","分别记录哪些行、哪些列需要清零。"],["if matrix[i][j] == 0","第一遍只根据原始矩阵中的 0 做判断。"],["rows.add(i); cols.add(j)","只记影响范围，不立刻修改矩阵。"],["i in rows or j in cols","第二遍判断某位置是否落在需要清零的行或列。"],["matrix[i][j] = 0","统一执行修改。"]],summary:"核心不是 set，而是“先读完并记录，再统一写”。如果边扫描边改，新产生的 0 会污染后续判断。"},
 meaning:{q:"为什么不能扫描到 0 就立即把整行整列改成 0？",options:["新写出来的 0 会被后续扫描误认为原始 0，造成错误扩散","矩阵不能原地修改","会导致下标变化"],answer:0,explain:"必须区分原始 0 和修改产生的 0，所以至少要把读阶段和写阶段分开。"},
 fill:{targets:["rows, cols = set(), set()","if matrix[i][j] == 0:","rows.add(i); cols.add(j)"],distractors:["matrix[i][j] = 1","rows.clear()"],explain:"第一遍建立两组标记：发现原始 0 时只记录它所在的行和列。扫描完成后再根据 rows/cols 统一清零。"},
 full:{guide:"先写 set 版本保证理解正确，再考虑用首行首列作为标记的 O(1) 额外空间进阶写法。"},
 recall:{q:"这题最重要的通用习惯是什么？",options:["修改会影响后续判断时，先记录信息再统一修改","看到 0 立即扩散","先把矩阵排序"],answer:0,explain:"很多原地修改题都需要避免“写操作污染读操作”。"}
},
"spiral-matrix":{
 syntax:{items:[["top, bottom","还没访问区域的上、下边界。"],["left, right","还没访问区域的左、右边界。"],["while top <= bottom and left <= right","只要剩余矩形仍然存在就继续。"],["上边 → 右边 → 下边 → 左边","每轮沿剩余矩形外圈走一圈。"],["走完一边就收缩边界","例如走完上边后 top += 1。"]],summary:"不要死背四个 for。把问题想成“剩余矩形”：每走完一条边，就把它从剩余区域中删掉。"},
 meaning:{q:"为什么走下边、左边前常要再次检查边界？",options:["上边和右边收缩后，可能已经只剩空区域，继续走会重复访问","因为矩阵元素可能为负","因为 for 循环不能连续使用"],answer:0,explain:"单行或单列矩阵尤其容易在这里重复加入元素。"},
 fill:{targets:["while top <= bottom and left <= right:","# 上边 → 右边 → 下边 → 左边"],distractors:["while top < bottom:","matrix.sort()"],explain:"循环条件描述“剩余矩形是否还存在”；每轮依次走四边，并在每走完一边后把对应边界向内收缩。下边和左边前要再次确认边界仍合法。"},
 full:{guide:"建议用 1×4、4×1、2×2 三种矩阵手推，专门验证边界收缩是否会重复访问。"},
 recall:{q:"螺旋矩阵最值得记的抽象是什么？",options:["维护剩余矩形的四条边界并逐层收缩","固定中心点旋转","用哈希表保存所有坐标"],answer:0,explain:"边界收缩比死记方向顺序更稳定。"}
},
"rotate-image":{
 syntax:{items:[["for j in range(i+1,n)","只处理主对角线上方，避免同一对元素交换两次。"],["matrix[i][j], matrix[j][i] = ...","转置：把行列坐标互换。"],["for row in matrix","转置后逐行处理。"],["row.reverse()","把每行左右翻转，得到顺时针 90°。"]],summary:"转置负责把“列”变成“行”，逐行反转负责修正方向。两步合起来就是顺时针旋转。"},
 meaning:{q:"为什么转置时 j 从 i+1 开始？",options:["主对角线不用动，同一对 (i,j)/(j,i) 也只应该交换一次","第一列不能修改","为了让矩阵有序"],answer:0,explain:"如果从 0 开始，会把已经交换过的元素再交换回来。"},
 fill:{targets:["matrix[i][j],matrix[j][i]=matrix[j][i],matrix[i][j]","for row in matrix:","row.reverse()"],distractors:["matrix.reverse()","return matrix"],explain:"第一空完成主对角线转置；第二、三空遍历每一行并反转。题目要求原地修改，因此通常不用返回新矩阵。"},
 full:{guide:"先用 2×2 验证：[[1,2],[3,4]] 应变成 [[3,1],[4,2]]。如果只转置，你会看到还差一次水平翻转。"},
 recall:{q:"顺时针旋转矩阵最容易记的两步是什么？",options:["转置 + 每行反转","每列排序 + 转置","只反转整个矩阵"],answer:0,explain:"这两步既简洁又容易手推验证。"}
}
});