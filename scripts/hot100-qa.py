import json
import traceback

with open('/tmp/hot100-qa.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

BASIC_PRELUDE = r'''
_results=[]
def check(ok, case, got=None):
    _results.append({'ok': bool(ok), 'case': case, 'got': repr(got)})

class ListNode:
    def __init__(self, val=0, next=None):
        self.val=val
        self.next=next
    def __repr__(self):
        return f'ListNode({self.val})'

def build_list(vals):
    dummy=ListNode(); cur=dummy
    for v in vals:
        cur.next=ListNode(v); cur=cur.next
    return dummy.next

def list_values(head, limit=200):
    out=[]; seen=set()
    while head and len(out)<limit:
        if id(head) in seen: break
        seen.add(id(head)); out.append(head.val); head=head.next
    return out

def node_at(head, idx):
    for _ in range(idx):
        if head is None: return None
        head=head.next
    return head

def build_cycle(vals, pos):
    head=build_list(vals)
    if not head or pos < 0: return head
    entry=node_at(head,pos); tail=head
    while tail.next: tail=tail.next
    tail.next=entry
    return head
'''

extra = data.get('pythonExtra', '')
failures=[]
passed=0

for p in data['problems']:
    g={}
    try:
        exec(BASIC_PRELUDE + '\n' + extra, g)
        g['_results']=[]
        exec(p['pattern'], g)
        exec(p['judge'], g)
        results=g.get('_results', [])
        if not results:
            failures.append((p['slug'], 'judge produced no check results'))
            continue
        bad=[r for r in results if not r.get('ok')]
        if bad:
            failures.append((p['slug'], f'{len(bad)}/{len(results)} checks failed: {bad[:2]}'))
            continue
        passed += 1
        print(f"PASS {p['slug']} ({len(results)} checks)")
    except Exception as e:
        failures.append((p['slug'], f'{type(e).__name__}: {e}\n{traceback.format_exc(limit=2)}'))

print(f'\nPython judge QA: {passed}/{len(data["problems"])} problems passed.')
if failures:
    print('Failures:')
    for slug,msg in failures:
        print(f'  - {slug}: {msg}')
    raise SystemExit(1)
