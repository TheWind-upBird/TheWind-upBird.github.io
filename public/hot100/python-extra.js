window.HOT100_PY_EXTRA = `
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val=val; self.left=left; self.right=right
    def __repr__(self): return f'TreeNode({self.val})'

def build_tree(values):
    if not values: return None
    root=TreeNode(values[0]); q=deque([root]); i=1
    while q and i < len(values):
        node=q.popleft()
        if i < len(values) and values[i] is not None:
            node.left=TreeNode(values[i]); q.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right=TreeNode(values[i]); q.append(node.right)
        i += 1
    return root

def tree_values(root):
    if root is None: return []
    out=[]; q=deque([root])
    while q:
        node=q.popleft()
        if node is None:
            out.append(None); continue
        out.append(node.val); q.append(node.left); q.append(node.right)
    while out and out[-1] is None: out.pop()
    return out

def inorder_values(root):
    out=[]
    def dfs(node):
        if not node: return
        dfs(node.left); out.append(node.val); dfs(node.right)
    dfs(root); return out

def preorder_values(root):
    out=[]
    def dfs(node):
        if not node: return
        out.append(node.val); dfs(node.left); dfs(node.right)
    dfs(root); return out

def is_balanced(root):
    def h(node):
        if not node: return 0
        a=h(node.left)
        if a < 0: return -1
        b=h(node.right)
        if b < 0 or abs(a-b) > 1: return -1
        return max(a,b)+1
    return h(root) >= 0

def find_tree_node(root, val):
    if not root: return None
    q=deque([root])
    while q:
        node=q.popleft()
        if node.val == val: return node
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    return None

def right_chain_values(root, limit=200):
    out=[]
    while root and len(out) < limit:
        out.append(root.val); root=root.right
    return out

def all_left_none(root):
    while root:
        if root.left is not None: return False
        root=root.right
    return True

class Node:
    def __init__(self, x=0, next=None, random=None):
        self.val=x; self.next=next; self.random=random

def build_random_list(vals, random_indices):
    if not vals: return None
    nodes=[Node(v) for v in vals]
    for i in range(len(nodes)-1): nodes[i].next=nodes[i+1]
    for i,r in enumerate(random_indices):
        nodes[i].random = None if r is None or r < 0 else nodes[r]
    return nodes[0]

def random_signature(head):
    nodes=[]; cur=head
    while cur:
        nodes.append(cur); cur=cur.next
    pos={id(n):i for i,n in enumerate(nodes)}
    vals=[n.val for n in nodes]
    rnd=[-1 if n.random is None else pos.get(id(n.random),-999) for n in nodes]
    return vals,rnd

def disjoint_random_lists(a,b):
    old=set(); cur=a
    while cur: old.add(id(cur)); cur=cur.next
    cur=b
    while cur:
        if id(cur) in old: return False
        if cur.random is not None and id(cur.random) in old: return False
        cur=cur.next
    return True

class DNode:
    def __init__(self, key=0, val=0):
        self.key=key; self.val=val; self.prev=None; self.next=None

def valid_parens(s):
    stack=[]; match={')':'(',']':'[','}':'{'}
    for ch in s:
        if ch in '([{': stack.append(ch)
        elif not stack or stack.pop() != match[ch]: return False
    return not stack
`;
