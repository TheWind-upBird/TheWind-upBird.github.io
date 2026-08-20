window.HOT100_HANDCRAFTED=Object.assign(window.HOT100_HANDCRAFTED||{}, {
"group-anagrams":{
 syntax:{items:[["key = ''.join(sorted(s))","先把字符串里的字符排序，再把字符列表拼回字符串。eat 会变成 aet。"],["groups = {}","字典保存“分组标记 → 这一组里的原字符串”。"],["groups.setdefault(key, [])","这个 key 第一次出现时，先创建一个空列表。"],[".append(s)","把当前原字符串放进它对应的那一组。"],["list(groups.values())","最后只需要所有分组，所以取字典里的 values。"]],summary:"整段代码只做两件事：给每个字符串算一个稳定的分组标记，再把相同标记的字符串放进同一组。"},
 meaning:{q:"为什么这里不能直接用 s 自己当 key？",options:["eat 和 tea 本身不同，直接当 key 会被分到不同组","字符串不能当字典 key","因为 s 会被修改"],answer:0,explain:"目标是让异位词得到同一个 key。原字符串 eat 和 tea 不相等，所以必须先把它们变成共同表示，例如 aet。"},
 fill:{targets:["key = ''.join(sorted(s))","groups.setdefault(key, []).append(s)","return list(groups.values())"],distractors:["groups[s] = key","return groups"],explain:"第一空负责算“分组标记”；第二空把当前字符串放进对应分组；第三空只返回所有分组列表。每一空都对应一个明确动作。"},
 full:{guide:"先独立写出三件事：算 key、放进 groups、返回所有分组。若卡住，只回看上一张补空卡，不要直接复制完整答案。"},
 recall:{q:"以后看到什么特征时，可以想到这种“统一 key 后分组”的思路？",options:["对象顺序不同，但本质组成相同，需要归为一组","数组已经排好序","只需要找最大值"],answer:0,explain:"当表面形式不同、但存在一个统一表示时，可以先构造 key，再用哈希表分组。"}
},
"longest-consecutive-sequence":{
 syntax:{items:[["s = set(nums)","去重，同时让“某个数字是否存在”的查询很快。"],["if x - 1 not in s","只有前一个数不存在时，x 才可能是一段连续序列的起点。"],["while y in s","从起点不断检查 y、y+1、y+2……是否存在。"],["best = max(best, y - x)","y 已经走到第一个不存在的数，所以 y-x 就是这一段长度。"]],summary:"关键不是从每个数都向右找，而是先判断谁是真正起点。这样 1→2→3→4 只会完整扫描一次。"},
 meaning:{q:"nums=[1,2,3,4] 时，为什么 2、3、4 都不用完整向右扫描？",options:["它们前面都有连续的前驱，已经属于从 1 开始的那一段","因为 set 不能重复查询","因为它们不是正数"],answer:0,explain:"2 前面有 1、3 前面有 2、4 前面有 3，所以都不是序列起点。只从 1 扫一次即可。"},
 fill:{targets:["if x - 1 not in s:","while y in s:","best = max(best, y - x)"],distractors:["if x + 1 not in s:","best += 1"],explain:"第一空筛出真正起点；第二空沿连续序列向右走；第三空用走过的距离更新最长长度。"},
 full:{guide:"完整代码最容易错的是“只从起点开始”和长度 y-x。写完后用 [100,4,200,1,3,2] 手推一次。"},
 recall:{q:"这题最值得带走的技巧是什么？",options:["用 set 快速查询，并只从没有前驱的元素开始扩展","把数组排序后返回","从每个元素都完整向右扫描"],answer:0,explain:"快速查询 + 避免重复扫描，是这题能做到线性复杂度的核心。"}
},
"move-zeroes":{
 syntax:{items:[["slow = 0","slow 指向“下一个非零数应该放的位置”。"],["for fast in range(len(nums))","fast 负责从左到右查看每个元素。"],["if nums[fast] != 0","只有看到非零数时才需要搬动。"],["nums[slow], nums[fast] = ...","把当前非零数交换到 slow 指向的位置。"],["slow += 1","一个非零位置安排好后，slow 准备下一个位置。"]],summary:"slow 管“应该放哪里”，fast 管“去哪里找下一个非零数”。两个指针职责不同。"},
 meaning:{q:"遇到 nums[fast] == 0 时，为什么 slow 不动？",options:["还没有新的非零数需要占用 slow 位置","因为 0 不能交换","因为 fast 会自动跳两格"],answer:0,explain:"slow 只在成功放入一个非零数后才右移。看到 0 时，那个待填位置还要留给后面的非零数。"},
 fill:{targets:["if nums[fast] != 0:","nums[slow], nums[fast] = nums[fast], nums[slow]","slow += 1"],distractors:["if nums[fast] == 0:","fast += 1"],explain:"先判断当前是不是非零数；若是，就把它放到 slow 位置；最后 slow 右移，为下一个非零数准备位置。"},
 full:{guide:"注意题目要求原地修改 nums，不需要返回新数组。先保证逻辑正确，再考虑“自己和自己交换”是否需要优化。"},
 recall:{q:"看到哪类题时可以想到这种 slow/fast 写法？",options:["一边扫描，一边把满足条件的元素稳定地压到前面","只需要找数组最大值","数组完全不能修改"],answer:0,explain:"一个指针扫描，一个指针维护“下一个正确位置”，是常见的原地整理套路。"}
},
"container-with-most-water":{
 syntax:{items:[["left, right = 0, len(height)-1","从最大宽度开始考虑。"],["min(height[left], height[right])","水位由较矮的一边决定。"],["right - left","两根柱子的距离就是宽度。"],["if height[left] < height[right]","比较谁是当前短板。"],["left += 1 / right -= 1","只移动短板那一侧。"]],summary:"宽度一定会变小，因此想得到更大面积，只值得尝试替换当前短板。"},
 meaning:{q:"当前 left 高度 3、right 高度 8，为什么移动 left 而不是 right？",options:["面积受高度 3 限制，换掉短板才有机会提高高度","因为 left 下标更小","因为 right 不能移动"],answer:0,explain:"如果移动高柱 8，短板还是 3，同时宽度更小，面积不可能因此变好。"},
 fill:{targets:["best = max(best, min(height[left],height[right])*(right-left))","if height[left] < height[right]: left += 1","else: right -= 1"],distractors:["left -= 1","right += 1"],explain:"先用“短板×宽度”更新当前面积；然后左边更短就左移，右边更短就右移。"},
 full:{guide:"先确保面积公式写对：min(两边高度) × 宽度。最常见错误是移动了更高的一边。"},
 recall:{q:"这题的核心贪心判断是什么？",options:["移动较短的一侧，因为面积受短板限制","每次移动较高的一侧","固定宽度不变"],answer:0,explain:"宽度只会变小，想变得更优只能争取更高的短板。"}
},
"3sum":{
 syntax:{items:[["nums.sort()","排序后，双指针才知道怎样让总和变大或变小。"],["for i in range(len(nums)-2)","每轮固定三元组中的第一个数。"],["nums[i] == nums[i-1]","相同的固定值只处理一次，避免重复答案。"],["left, right = i+1, len(nums)-1","剩余区间用左右指针找另外两个数。"],["total = nums[i]+nums[left]+nums[right]","根据 total 与 0 的大小决定指针方向。"]],summary:"本质是“排序 + 固定一个数 + 双指针做两数之和”，另外必须认真处理重复值。"},
 meaning:{q:"为什么 total < 0 时一定是 left 右移，而不是 right 左移？",options:["数组已排序，想让总和变大，需要把较小的 left 换成更大的数","因为 right 只能处理正数","因为 i 不能变化"],answer:0,explain:"right 左移只会让右侧数变小，总和更小；left 右移才会让总和变大。"},
 fill:{targets:["if i and nums[i] == nums[i-1]: continue","if total < 0:","elif total > 0:"],distractors:["if total == 0:","left -= 1"],explain:"第一空避免重复固定值；第二空处理总和太小，需要 left 右移；第三空处理总和太大，需要 right 左移。找到 0 时还要记录并去重。"},
 full:{guide:"这题真正难的是去重，不是双指针本身。先写通，再检查 i、left、right 三个位置的重复值是否都处理。"},
 recall:{q:"三数之和最适合记成哪个框架？",options:["排序后固定一个数，再用双指针找另外两个数","三个哈希表嵌套","只用滑动窗口"],answer:0,explain:"把三数问题降成两数问题，是这题最核心的拆解方式。"}
},
"trapping-rain-water":{
 syntax:{items:[["leftMax / rightMax","分别记录从左右两边走来时见过的最高墙。"],["height[left] < height[right]","当前较低的一侧可以先确定水量。"],["leftMax = max(leftMax, height[left])","更新左侧最高墙。"],["water += leftMax - height[left]","当前位置可接水量 = 左侧最高墙 - 当前高度。"],["left += 1","这一格处理完后继续向内走。"]],summary:"每一格能装多少水由两侧最高墙中的较低者决定。双指针让我们不用预存两整张最高墙数组。"},
 meaning:{q:"为什么处理较低的一侧是安全的？",options:["另一侧已经有至少同样高的边界兜底，这一侧的水量可以确定","因为较低侧一定没有水","因为 rightMax 总是更大"],answer:0,explain:"较低侧的瓶颈已经由自己这一边的最高墙决定，另一侧当前边界足够高，不会成为更低限制。"},
 fill:{targets:["leftMax = max(leftMax, height[left])","water += leftMax - height[left]","rightMax = max(rightMax, height[right])"],distractors:["water += height[left]","leftMax += 1"],explain:"左侧分支先更新 leftMax，再加这一格水量；右侧分支完全对称，会先更新 rightMax，再计算右边这一格。"},
 full:{guide:"不要把“当前柱高”和“历史最高墙”混在一起。可以先只写左侧分支，再照镜子写右侧。"},
 recall:{q:"接雨水双指针真正维护的是什么？",options:["左右两侧已经见过的最高墙","当前窗口字符数","数组前缀和"],answer:0,explain:"leftMax/rightMax 决定了当前位置可接水的上界。"}
},
"longest-substring-without-repeating-characters":{
 syntax:{items:[["left = 0","当前无重复窗口的左边界。"],["for right, ch in enumerate(s)","right 每次加入一个新字符。"],["seen[ch] >= left","判断 ch 上次出现的位置是否仍在当前窗口里。"],["left = seen[ch] + 1","越过旧的重复字符。"],["best = max(best, right-left+1)","更新当前无重复窗口长度。"]],summary:"seen 不只是判断“以前见过没有”，而是保存“上次在哪里见过”，这样 left 可以直接跳过冲突。"},
 meaning:{q:"旧 ch 的位置在 left 左边时，为什么不用移动 left？",options:["它已经不属于当前窗口，不会造成当前重复","因为字符会自动删除","因为 right 会后退"],answer:0,explain:"窗口只关心 [left,right] 内的字符。左边界之外的旧位置已经失效。"},
 fill:{targets:["if ch in seen and seen[ch] >= left:","left = seen[ch] + 1","best = max(best, right-left+1)"],distractors:["left = 0","best += 1"],explain:"先判断重复字符是否仍在窗口，再把 left 跳到旧位置之后；最后用 right-left+1 更新当前窗口长度。"},
 full:{guide:"最容易错的是 left 回退。用 s='abba' 手推，确保最后一个 a 不会把 left 从 2 退回 1。"},
 recall:{q:"这类“无重复连续片段”题的窗口状态通常要记录什么？",options:["元素上次出现的位置","数组总和","链表前驱节点"],answer:0,explain:"知道旧位置后，左边界才能一次跳过冲突。"}
},
"find-all-anagrams-in-a-string":{
 syntax:{items:[["need = Counter(p)","记录 p 中每个字符需要多少个。"],["window = Counter()","记录当前窗口内每个字符出现多少次。"],["window[ch] += 1","右边加入新字符。"],["right >= len(p)","窗口超过目标长度时，需要从左边移出一个字符。"],["window == need","两个计数完全一致时，当前窗口就是异位词。"]],summary:"这是固定长度滑动窗口：每移动一格，只需要“进一个、出一个”，不需要重新统计整段。"},
 meaning:{q:"窗口向右移动一格时，哪些计数需要改变？",options:["只加入右边新字符并移出左边旧字符","所有字符都重新统计","只改变 p 的计数"],answer:0,explain:"滑动窗口高效的关键就是只维护边界变化。"},
 fill:{targets:["window[ch] += 1","window[left_ch] -= 1","ans.append(right-len(p)+1)"],distractors:["window.clear()","ans.append(right)"],explain:"第一空加入新字符；第二空移出刚刚离开窗口的字符；第三空在计数匹配时记录当前窗口左端点。"},
 full:{guide:"先用 Counter 版本把逻辑写对。注意候选窗口长度必须始终等于 len(p)。"},
 recall:{q:"固定长度异位词窗口的核心是什么？",options:["固定窗口长度并维护字符计数","窗口长度任意变化","先把整个 s 排序"],answer:0,explain:"长度固定 + 计数匹配，是这类题最直接的识别方式。"}
},
"subarray-sum-equals-k":{
 syntax:{items:[["count = {0: 1}","先放一个前缀和 0，表示“还没取任何数”。"],["prefix += x","累计到当前位置的前缀和。"],["count.get(prefix-k, 0)","查询以前有多少个前缀和能和当前相差 k。"],["ans += ...","这些旧位置分别对应一个合法子数组。"],["count[prefix] = ... + 1","最后记录当前前缀和，供后面使用。"]],summary:"核心公式：区间和 = 当前前缀和 - 旧前缀和。目标是 k，所以旧前缀和应该等于 prefix-k。"},
 meaning:{q:"为什么 count 里必须存“前缀和出现次数”，而不只是 True/False？",options:["同一个旧前缀和可能在多个位置出现，每个位置都对应不同子数组","为了排序","因为字典不能存布尔值"],answer:0,explain:"如果 prefix-k 曾出现 3 次，那么当前点就能和这 3 个不同起点组成 3 个和为 k 的子数组。"},
 fill:{targets:["prefix += x","ans += count.get(prefix-k, 0)","count[prefix] = count.get(prefix,0) + 1"],distractors:["ans += prefix","count = {}"],explain:"先更新当前前缀和，再统计能和它配成 k 的旧前缀和数量，最后记录当前前缀和供未来位置使用。"},
 full:{guide:"数组含负数时普通滑动窗口不可靠，所以前缀和 + 哈希计数才是稳定方法。"},
 recall:{q:"看到“连续子数组和 = k”，尤其数组里可能有负数时，优先想到什么？",options:["前缀和 + 哈希表统计旧前缀和","双指针固定窗口","排序后贪心"],answer:0,explain:"负数会破坏窗口单调性，而前缀和差值不受影响。"}
}
});