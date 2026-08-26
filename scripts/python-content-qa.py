import json
import re
import tempfile
from pathlib import Path


PRELUDE = r'''
import json
_results=[]
def check(ok, case, got=None):
    _results.append({'ok': bool(ok), 'case': case, 'got': repr(got)})
class ListNode:
    def __init__(self, val=0, next=None): self.val=val; self.next=next
    def __repr__(self): return f'ListNode({self.val})'
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


def reference_code(problem):
    pattern = str(problem.get("pattern") or "").strip()
    if re.match(r"^(def |class )", pattern):
        return pattern
    if re.match(r"^(import |from )", pattern) and re.search(r"^(class |def )", pattern, re.M):
        return pattern
    starter = str(problem.get("starter") or "")
    signature = next((line.strip() for line in starter.splitlines() if re.match(r"^\s*def\s+", line)), "")
    if not signature:
        return pattern
    lines = pattern.splitlines()
    imports = [line.strip() for line in starter.splitlines() if re.match(r"^\s*(from |import )", line)]
    while lines and re.match(r"^(from |import )", lines[0].strip()):
        imports.append(lines.pop(0).strip())
    imports = list(dict.fromkeys(imports))
    body = "\n".join("    " + line for line in lines)
    prefix = "\n".join(imports) + ("\n\n" if imports else "")
    return f"{prefix}{signature}\n{body}"


def main():
    payload_path = Path(tempfile.gettempdir()) / "hot100-qa.json"
    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    failures = []
    for problem in payload["problems"]:
        namespace = {}
        source = "\n".join((PRELUDE, payload.get("pythonExtra", ""), reference_code(problem), problem["judge"]))
        try:
            exec(compile(source, f"<{problem['slug']}>", "exec"), namespace)
            results = namespace.get("_results", [])
            failed = [result for result in results if not result.get("ok")]
            if not results:
                failures.append(f"{problem['slug']}: judge produced no results")
            elif failed:
                sample = failed[0]
                failures.append(f"{problem['slug']}: {len(failed)}/{len(results)} failed; {sample.get('case')} -> {sample.get('got')}")
        except Exception as error:
            failures.append(f"{problem['slug']}: {type(error).__name__}: {error}")
    if failures:
        print("SolveShift executable Python content QA failed:")
        for failure in failures:
            print(f"  - {failure}")
        raise SystemExit(1)
    print(f"SolveShift executable Python content QA passed: {len(payload['problems'])} reference implementations passed their judges.")


if __name__ == "__main__":
    main()
