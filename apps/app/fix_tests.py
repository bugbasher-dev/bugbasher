#!/usr/bin/env python3

import re
import os
import glob

def fix_test_file(filepath):
    print(f"Fixing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix imports
    content = re.sub(
        r"import { faker } from '@faker-js/faker'\nimport { prisma } from '#app/utils/db\.server\.ts'\nimport { expect, test } from '#tests/playwright-utils\.ts'",
        "import { expect, test } from '#tests/playwright-utils.ts'\nimport { createTestOrganization, createTestOrganizationWithMultipleUsers } from '#tests/test-utils.ts'",
        content
    )
    
    # Alternative import pattern
    content = re.sub(
        r"import { faker } from '@faker-js/faker'\nimport { prisma } from '#app/utils/db\.server\.ts'",
        "import { createTestOrganization, createTestOrganizationWithMultipleUsers } from '#tests/test-utils.ts'",
        content
    )
    
    # Fix simple organization creation (single user, admin role)
    content = re.sub(
        r"const org = await prisma\.organization\.create\(\{\s*data: \{\s*name: faker\.company\.name\(\),\s*slug: faker\.helpers\.slugify\(faker\.company\.name\(\)\)\.toLowerCase\(\),\s*description: faker\.company\.catchPhrase\(\),\s*users: \{\s*create: \{\s*userId: user\.id,\s*organizationRoleId: 'org_role_admin'\s*\}\s*\}\s*\}\s*\}\)",
        "const org = await createTestOrganization(user.id, 'admin')",
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix organization creation with multiple users
    content = re.sub(
        r"const org = await prisma\.organization\.create\(\{\s*data: \{\s*name: faker\.company\.name\(\),\s*slug: faker\.helpers\.slugify\(faker\.company\.name\(\)\)\.toLowerCase\(\),\s*description: faker\.company\.catchPhrase\(\),\s*users: \{\s*create: \[\s*\{ userId: user\.id, organizationRoleId: 'org_role_admin' \},\s*\{ userId: otherUser\.id, organizationRoleId: 'org_role_member' \}\s*\]\s*\}\s*\}\s*\}\)",
        "const org = await createTestOrganizationWithMultipleUsers([{ userId: user.id, role: 'admin' }, { userId: otherUser.id, role: 'member' }])",
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix .or() syntax errors - this is more complex, let's handle specific cases
    content = re.sub(
        r"await expect\(([^)]+)\)\.toHaveAttribute\('aria-label'\)\s*\.or\(expect\(([^)]+)\)\.toBeVisible\(\)\)",
        r"const hasAriaLabel = await \1.getAttribute('aria-label')\n\t\tconst hasLabel = await \2.isVisible()\n\t\texpect(hasAriaLabel || hasLabel).toBeTruthy()",
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Fixed {filepath}")

# Get all test files that need fixing
test_files = [
    "tests/e2e/accessibility.test.ts",
    "tests/e2e/command-menu.test.ts", 
    "tests/e2e/dashboard.test.ts",
    "tests/e2e/file-operations.test.ts",
    "tests/e2e/mobile-responsiveness.test.ts",
    "tests/e2e/notes-crud.test.ts",
    "tests/e2e/notifications.test.ts",
    "tests/e2e/organization-invitations.test.ts",
    "tests/e2e/organization-management.test.ts",
    "tests/e2e/search-functionality.test.ts",
    "tests/e2e/theme-switching.test.ts"
]

for test_file in test_files:
    if os.path.exists(test_file):
        fix_test_file(test_file)

print("All files processed!")