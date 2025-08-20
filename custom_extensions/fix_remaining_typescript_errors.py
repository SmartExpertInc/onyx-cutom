#!/usr/bin/env python3
"""
Script to fix remaining TypeScript errors in ProjectsTable.tsx
"""

import re

def fix_typescript_errors():
    file_path = "frontend/src/components/ProjectsTable.tsx"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix remaining designMicroproductType property access errors
        # Replace direct property access with helper function calls
        
        # Pattern 1: if (project.designMicroproductType === 'Training Plan')
        content = re.sub(
            r'if \(project\.designMicroproductType === \'Training Plan\'\)',
            'if (getDesignMicroproductType(project) === \'Training Plan\')',
            content
        )
        
        # Pattern 2: if (project.designMicroproductType !== 'Training Plan')
        content = re.sub(
            r'if \(project\.designMicroproductType !== \'Training Plan\'\)',
            'if (getDesignMicroproductType(project) !== \'Training Plan\')',
            content
        )
        
        # Write the fixed content back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Fixed remaining TypeScript errors in ProjectsTable.tsx")
        
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
    except Exception as e:
        print(f"❌ Error fixing TypeScript errors: {e}")

if __name__ == "__main__":
    fix_typescript_errors() 