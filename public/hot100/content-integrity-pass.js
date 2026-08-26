(()=>{
const handcrafted=window.HOT100_HANDCRAFTED||{};
const lessons=window.HOT100_LESSONS||{};
const setTargets=(slug,targets)=>{if(handcrafted[slug]?.fill)handcrafted[slug].fill.targets=targets};
const ensureTrace=(slug,step)=>{const trace=lessons[slug]?.trace;if(Array.isArray(trace)&&trace.length<3)trace.push(step)};

setTargets('letter-combinations-of-a-phone-number',[
  'for ch in mp[digits[i]]:',
  'backtrack(i+1)',
  "ans.append(''.join(path)); return"
]);
setTargets('generate-parentheses',[
  'if left<n:',
  'if right<left:',
  "ans.append(''.join(path)); return"
]);
setTargets('word-search',[
  "ch=board[r][c]; board[r][c]='#'",
  'found=(dfs(r+1,c,i+1) or dfs(r-1,c,i+1) or dfs(r,c+1,i+1) or dfs(r,c-1,i+1))',
  'board[r][c]=ch'
]);
setTargets('median-of-two-sorted-arrays',[
  'i=(l+r)//2; j=half-i',
  'if Al<=Br and Bl<=Ar:',
  'if Al>Br: r=i-1'
]);
setTargets('top-k-frequent-elements',[
  'for x in nums: freq[x]=freq.get(x,0)+1',
  'heapq.heappush(heap,(f,x))',
  'if len(heap)>k: heapq.heappop(heap)'
]);
setTargets('word-break',[
  'dp=[False]*(n+1); dp[0]=True',
  'if dp[j] and s[j:i] in words:',
  'dp[i]=True; break'
]);
setTargets('longest-valid-parentheses',[
  'stack=[-1]; best=0',
  'if not stack:',
  'best=max(best,i-stack[-1])'
]);
setTargets('longest-palindromic-substring',[
  'while l>=0 and r<len(s) and s[l]==s[r]:',
  'return l+1,r-1',
  'for l,r in (expand(i,i),expand(i,i+1)):'
]);
setTargets('edit-distance',[
  'for i in range(m+1): dp[i][0]=i',
  'dp[i][j]=dp[i-1][j-1]',
  'dp[i][j]=1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])'
]);

ensureTrace('set-matrix-zeroes',{
  a:'检查未标记位置',b:'不在 rows / cols',c:'保持原值',
  message:'最后逐格检查：只有行号或列号被记录的位置才改成 0，其余元素保持不变。'
});
ensureTrace('median-of-two-sorted-arrays',{
  a:'偶数总长度',b:'左半最大与右半最小',c:'两者平均',
  message:'如果两个数组总长度为偶数，中位数是左半部分最大值与右半部分最小值的平均数。'
});
ensureTrace('word-break',{
  a:'检查 dp[n]',b:'最后前缀是否可拆',c:'返回 True',
  message:'遍历结束后，dp[n] 直接表示整个字符串能否由字典中的单词完整拼接出来。'
});

if(lessons['climbing-stairs']?.trace?.[2])lessons['climbing-stairs'].trace[2].message='到第 5 阶时，最后一步来自第 4 阶或第 3 阶，因此共有 5 + 3 = 8 种走法。';
if(lessons['perfect-squares']?.trace?.[1])lessons['perfect-squares'].trace[1].message='9 本身就是一个完全平方数，所以组成 9 最少只需要使用 1 个数。';

window.HOT100_CONTENT_INTEGRITY={version:1,fillTargetsFixed:9,tracesCompleted:3};
})();
