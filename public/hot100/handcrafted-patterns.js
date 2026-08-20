window.HOT100_PATTERNS={
"group-anagrams":`groups = {}
for s in strs:
    key = ''.join(sorted(s))
    groups.setdefault(key, []).append(s)
return list(groups.values())`,
"longest-consecutive-sequence":`s = set(nums)
best = 0
for x in s:
    if x - 1 not in s:
        y = x
        while y in s:
            y += 1
        best = max(best, y - x)
return best`,
"move-zeroes":`slow = 0
for fast in range(len(nums)):
    if nums[fast] != 0:
        nums[slow], nums[fast] = nums[fast], nums[slow]
        slow += 1`,
"container-with-most-water":`left, right = 0, len(height)-1
best = 0
while left < right:
    best = max(best, min(height[left],height[right])*(right-left))
    if height[left] < height[right]: left += 1
    else: right -= 1
return best`,
"3sum":`nums.sort()
ans = []
for i in range(len(nums)-2):
    if i and nums[i] == nums[i-1]: continue
    left, right = i+1, len(nums)-1
    while left < right:
        total = nums[i]+nums[left]+nums[right]
        if total < 0:
            left += 1
        elif total > 0:
            right -= 1
        else:
            ans.append([nums[i], nums[left], nums[right]])
            left += 1
            right -= 1
            while left < right and nums[left] == nums[left-1]: left += 1
            while left < right and nums[right] == nums[right+1]: right -= 1
return ans`,
"trapping-rain-water":`left, right = 0, len(height)-1
leftMax = rightMax = 0
water = 0
while left < right:
    if height[left] < height[right]:
        leftMax = max(leftMax, height[left])
        water += leftMax - height[left]
        left += 1
    else:
        rightMax = max(rightMax, height[right])
        water += rightMax - height[right]
        right -= 1
return water`,
"longest-substring-without-repeating-characters":`left = 0
seen = {}
best = 0
for right, ch in enumerate(s):
    if ch in seen and seen[ch] >= left:
        left = seen[ch] + 1
    seen[ch] = right
    best = max(best, right-left+1)
return best`,
"find-all-anagrams-in-a-string":`need = Counter(p)
window = Counter()
ans = []
for right, ch in enumerate(s):
    window[ch] += 1
    if right >= len(p):
        left_ch = s[right-len(p)]
        window[left_ch] -= 1
        if window[left_ch] == 0:
            del window[left_ch]
    if window == need:
        ans.append(right-len(p)+1)
return ans`,
"subarray-sum-equals-k":`count = {0: 1}
prefix = ans = 0
for x in nums:
    prefix += x
    ans += count.get(prefix-k, 0)
    count[prefix] = count.get(prefix,0) + 1
return ans`,
"sliding-window-maximum":`from collections import deque
dq = deque()
ans = []
for i, x in enumerate(nums):
    while dq and nums[dq[-1]] <= x: dq.pop()
    dq.append(i)
    if dq[0] <= i-k: dq.popleft()
    if i >= k-1:
        ans.append(nums[dq[0]])
return ans`,
"minimum-window-substring":`need = Counter(t)
window = Counter()
left = 0
have = 0
required = len(need)
bestLen = float('inf')
bestStart = 0
for right, ch in enumerate(s):
    window[ch] += 1
    if ch in need and window[ch] == need[ch]:
        have += 1
    while have == required:
        if right-left+1 < bestLen:
            bestLen = right-left+1
            bestStart = left
        left_ch = s[left]
        window[left_ch] -= 1
        if left_ch in need and window[left_ch] < need[left_ch]:
            have -= 1
        left += 1
return '' if bestLen == float('inf') else s[bestStart:bestStart+bestLen]`,
"maximum-subarray":`cur = best = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)
return best`,
"merge-intervals":`intervals.sort(key=lambda x: x[0])
ans = []
for start, end in intervals:
    if not ans or start > ans[-1][1]:
        ans.append([start,end])
    else:
        ans[-1][1] = max(ans[-1][1], end)
return ans`,
"rotate-array":`if not nums: return
k %= len(nums)
nums.reverse()
nums[:k] = reversed(nums[:k])
nums[k:] = reversed(nums[k:])`,
"product-of-array-except-self":`ans = [1]*len(nums)
prefix = 1
for i in range(len(nums)):
    ans[i] = prefix
    prefix *= nums[i]
suffix = 1
for i in range(len(nums)-1,-1,-1):
    ans[i] *= suffix
    suffix *= nums[i]
return ans`,
"first-missing-positive":`n = len(nums)
i = 0
while i < n:
    x = nums[i]
    if 1 <= x <= n and nums[x-1] != x:
        nums[i], nums[x-1] = nums[x-1], nums[i]
    else:
        i += 1
for i, x in enumerate(nums):
    if x != i+1:
        return i+1
return n+1`,
"set-matrix-zeroes":`rows, cols = set(), set()
for i in range(len(matrix)):
    for j in range(len(matrix[0])):
        if matrix[i][j] == 0:
            rows.add(i); cols.add(j)
for i in range(len(matrix)):
    for j in range(len(matrix[0])):
        if i in rows or j in cols:
            matrix[i][j] = 0`,
"spiral-matrix":`top, bottom = 0, len(matrix)-1
left, right = 0, len(matrix[0])-1
ans = []
while top <= bottom and left <= right:
    # 上边 → 右边 → 下边 → 左边
    for j in range(left, right+1): ans.append(matrix[top][j])
    top += 1
    for i in range(top, bottom+1): ans.append(matrix[i][right])
    right -= 1
    if top <= bottom:
        for j in range(right, left-1, -1): ans.append(matrix[bottom][j])
        bottom -= 1
    if left <= right:
        for i in range(bottom, top-1, -1): ans.append(matrix[i][left])
        left += 1
return ans`,
"rotate-image":`n = len(matrix)
for i in range(n):
    for j in range(i+1,n):
        matrix[i][j],matrix[j][i]=matrix[j][i],matrix[i][j]
for row in matrix:
    row.reverse()`,
"search-a-2d-matrix-ii":`row, col = 0, len(matrix[0])-1
while row < len(matrix) and col >= 0:
    x = matrix[row][col]
    if x == target: return True
    if x > target: col -= 1
    else: row += 1
return False`,
"intersection-of-two-linked-lists":`p, q = headA, headB
while p is not q:
    p = headB if p is None else p.next
    q = headA if q is None else q.next
return p`,
"reverse-linked-list":`prev, cur = None, head
while cur:
    nxt = cur.next
    cur.next = prev
    prev = cur
    cur = nxt
return prev`,
"palindrome-linked-list":`slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
prev = None
while slow:
    nxt = slow.next
    slow.next = prev
    prev = slow
    slow = nxt
p1, p2 = head, prev
while p2:
    if p1.val != p2.val: return False
    p1 = p1.next
    p2 = p2.next
return True`,
"linked-list-cycle":`slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow is fast: return True
return False`,
"linked-list-cycle-ii":`slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow is fast:
        break
else:
    return None
p = head
while p is not slow:
    p = p.next
    slow = slow.next
return p`,
"merge-two-sorted-lists":`dummy = ListNode(0)
tail = dummy
while list1 and list2:
    if list1.val <= list2.val:
        tail.next = list1
        list1 = list1.next
    else:
        tail.next = list2
        list2 = list2.next
    tail = tail.next
tail.next = list1 if list1 else list2
return dummy.next`,
"add-two-numbers":`dummy = ListNode(0)
tail = dummy
carry = 0
while l1 or l2 or carry:
    x = l1.val if l1 else 0
    y = l2.val if l2 else 0
    total = x + y + carry
    carry, digit = divmod(total, 10)
    tail.next = ListNode(digit)
    tail = tail.next
    if l1: l1 = l1.next
    if l2: l2 = l2.next
return dummy.next`,
"remove-nth-node-from-end-of-list":`dummy = ListNode(0, head)
fast = slow = dummy
for _ in range(n): fast = fast.next
while fast.next:
    fast = fast.next
    slow = slow.next
slow.next = slow.next.next
return dummy.next`,
"swap-nodes-in-pairs":`dummy = ListNode(0, head)
prev = dummy
while prev.next and prev.next.next:
    a = prev.next
    b = a.next
    a.next = b.next
    b.next = a
    prev.next = b
    prev = a
return dummy.next`
};
for(const p of (window.HOT100_CURRICULUM||[])){
  if(window.HOT100_PATTERNS[p.slug]) p.pattern=window.HOT100_PATTERNS[p.slug];
}