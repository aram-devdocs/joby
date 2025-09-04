#!/bin/bash

# Script to check TypeScript types for staged files
# This provides faster, incremental type checking during commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Running TypeScript checks on staged files...${NC}"

# Get all staged TypeScript files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo -e "${GREEN}✅ No TypeScript files to check${NC}"
  exit 0
fi

# Count files
FILE_COUNT=$(echo "$STAGED_FILES" | wc -l | tr -d ' ')
echo -e "${BLUE}Checking ${FILE_COUNT} TypeScript file(s)...${NC}"

# Create a temporary tsconfig that includes only staged files
TEMP_TSCONFIG=$(mktemp)
cat > "$TEMP_TSCONFIG" << EOF
{
  "extends": "./tsconfig.json",
  "include": [
$(echo "$STAGED_FILES" | sed 's/^/    "/' | sed 's/$/",/')
    "**/*.d.ts"
  ]
}
EOF

# Run TypeScript compiler with the temporary config
echo -e "${BLUE}Running tsc...${NC}"
if npx tsc --noEmit --project "$TEMP_TSCONFIG" --skipLibCheck; then
  rm -f "$TEMP_TSCONFIG"
  echo -e "${GREEN}✅ TypeScript checks passed!${NC}"
  exit 0
else
  rm -f "$TEMP_TSCONFIG"
  echo -e "${RED}❌ TypeScript errors found! Please fix them before committing.${NC}"
  exit 1
fi