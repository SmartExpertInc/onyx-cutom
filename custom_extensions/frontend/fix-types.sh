#!/bin/bash
# Fix remaining TypeScript parameter type issues

TARGET_FILE="src/components/SlideDeckViewer.tsx"

# Fix remaining parameter type annotations
sed -i 's/localDeck\.slides\.map((slide)/localDeck.slides.map((slide: any)/g' "$TARGET_FILE"
sed -i 's/\.find(s =>/\.find((s: any) =>/g' "$TARGET_FILE"
sed -i 's/\.map((block,/\.map((block: any,/g' "$TARGET_FILE"
sed -i 's/\.map((block, blockIndex)/\.map((block: any, blockIndex: number)/g' "$TARGET_FILE"
sed -i 's/onChange={(e)/onChange={(e: any)/g' "$TARGET_FILE"

echo "TypeScript parameter type fixes applied to $TARGET_FILE" 