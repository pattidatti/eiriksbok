
import re

def audit_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple stack-based balance check for braces and parentheses
    # Note: This is naive and doesn't handle strings/comments perfectly, but can help find obvious issues.
    
    braces = 0
    parens = 0
    stack = []
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                braces += 1
                stack.append(('{', i+1))
            elif char == '}':
                braces -= 1
                if braces < 0:
                    print(f"Extra closing brace at line {i+1}")
                    braces = 0
                else:
                    stack.pop()
            elif char == '(':
                parens += 1
                stack.append(('(', i+1))
            elif char == ')':
                parens -= 1
                if parens < 0:
                    print(f"Extra closing parenthesis at line {i+1}")
                    parens = 0
                else:
                    stack.pop()
    
    if braces > 0:
        print(f"Unclosed braces: {braces}")
        for item in stack:
            if item[0] == '{':
                print(f"  Opened at line {item[1]}")
    if parens > 0:
        print(f"Unclosed parentheses: {parens}")
        for item in stack:
            if item[0] == '(':
                print(f"  Opened at line {item[1]}")

    # Also check for unclosed div tags in the "Main Content Area" specifically
    main_start = -1
    for i, line in enumerate(lines):
        if 'flex-1 relative p-8' in line and '<div' in line:
            main_start = i
            break
    
    if main_start != -1:
        print(f"Main div starts at line {main_start + 1}")
        div_balance = 0
        for i in range(main_start, len(lines)):
            line = lines[i]
            div_balance += line.count('<div')
            div_balance -= line.count('</div')
            if div_balance == 0:
                print(f"Main div seems to close around line {i + 1}")
                break
        if div_balance != 0:
            print(f"Main div is UNCLOSED! Remaining balance: {div_balance}")

if __name__ == "__main__":
    audit_file(r'c:\Users\Eirik\Documents\Eiriksbok\Eiriksbok\src\features\simulation\SimulationPlayer.tsx')
