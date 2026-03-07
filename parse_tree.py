import re
import os

tree_text = open('/Users/sarahsahl/Desktop/mythos/repo_file_tree.md').read()

lines = tree_text.split('\n')
items = []
for line in lines:
    line = line.split('#')[0].strip()
    # match tree characters
    m = re.match(r'^[├─│└\s]*([a-zA-Z0-9_.\-\[\]]+)/?$', line)
    if m:
        name = m.group(1)
        if name != 'mythos':
            items.append(name)

# Now find all files in the repo
repo_files = []
for root, dirs, files in os.walk('/Users/sarahsahl/Desktop/mythos'):
    if '.git' in root or 'node_modules' in root or '.next' in root:
        continue
    for name in files + dirs:
        repo_files.append(os.path.join(root, name))

missing = []
for item in items:
    # See if any path ends with this item
    found = any(p.endswith('/' + item) or p == '/Users/sarahsahl/Desktop/mythos/' + item for p in repo_files)
    if not found:
        missing.append(item)

print("Missing items (by exact name match anywhere in repo):")
for m in missing:
    print(m)
