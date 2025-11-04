#!/usr/bin/env python3
import re

def check_jinja_structure(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    errors = []
    
    for i, line in enumerate(lines, 1):
        # Find all Jinja2 control structures
        if_match = re.search(r'{%\s*if\s+', line)
        elif_match = re.search(r'{%\s*elif\s+', line)
        else_match = re.search(r'{%\s*else\s*%}', line)
        endif_match = re.search(r'{%\s*endif\s*%}', line)
        for_match = re.search(r'{%\s*for\s+', line)
        endfor_match = re.search(r'{%\s*endfor\s*%}', line)
        
        if if_match:
            stack.append(('if', i, line.strip()))
        elif elif_match:
            if not stack or stack[-1][0] not in ['if', 'elif']:
                errors.append(f"Line {i}: Found 'elif' without matching 'if': {line.strip()}")
            else:
                stack[-1] = ('elif', i, line.strip())
        elif else_match:
            if not stack or stack[-1][0] not in ['if', 'elif']:
                errors.append(f"Line {i}: Found 'else' without matching 'if': {line.strip()}")
            else:
                stack[-1] = ('else', i, line.strip())
        elif endif_match:
            if not stack or stack[-1][0] not in ['if', 'elif', 'else']:
                errors.append(f"Line {i}: Found 'endif' without matching 'if': {line.strip()}")
            else:
                stack.pop()
        elif for_match:
            stack.append(('for', i, line.strip()))
        elif endfor_match:
            if not stack or stack[-1][0] != 'for':
                errors.append(f"Line {i}: Found 'endfor' without matching 'for': {line.strip()}")
            else:
                stack.pop()
    
    # Check for unclosed blocks
    if stack:
        for block_type, line_num, line_text in stack:
            errors.append(f"Line {line_num}: Unclosed '{block_type}' block: {line_text}")
    
    return errors

if __name__ == '__main__':
    errors = check_jinja_structure('avatar_slide_template.html')
    if errors:
        print("Found errors:")
        for error in errors:
            print(error)
    else:
        print("No errors found!")
