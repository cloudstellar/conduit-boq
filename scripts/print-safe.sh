#!/bin/bash
# scripts/print-safe.sh
# GATE 2 Check: Verify print page is not touched before commit
# Usage: bash scripts/print-safe.sh

PRINT_FILE="app/boq/\[id\]/print/page.tsx"

echo "🛡️ GATE 2 CHECK: Verifying print page safety..."

# Check unstaged changes
if git diff --name-only | grep -q "$PRINT_FILE"; then
  echo "❌ PRINT TOUCHED (unstaged changes detected)"
  echo "   File: $PRINT_FILE"
  exit 1
fi

# Check staged changes
if git diff --cached --name-only | grep -q "$PRINT_FILE"; then
  echo "❌ PRINT TOUCHED (staged changes detected)"
  echo "   File: $PRINT_FILE"
  exit 1
fi

echo "✅ PRINT SAFE - No changes to print page detected"
exit 0
