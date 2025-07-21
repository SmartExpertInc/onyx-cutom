# Manual TypeScript Fixes for SlideDeckViewer.tsx

## Remaining Parameter Type Issues

Apply these fixes to `src/components/SlideDeckViewer.tsx`:

### 1. Fix slide parameter in legacy slide rendering (around line 704)
```typescript
// BEFORE:
localDeck.slides.map((slide) => (

// AFTER:
localDeck.slides.map((slide: any) => (
```

### 2. Fix slide finder in title editing (around line 721)
```typescript
// BEFORE:
.find(s => s.slideId === slide.slideId)

// AFTER:
.find((s: any) => s.slideId === slide.slideId)
```

### 3. Fix content block mapping (around line 741)
```typescript
// BEFORE:
.map((block, blockIndex) => (

// AFTER:
.map((block: any, blockIndex: number) => (
```

### 4. Fix event handlers (around lines 798, 812)
```typescript
// BEFORE:
onChange={(e) => setValue(e.target.value)}

// AFTER:
onChange={(e: any) => setValue(e.target.value)}
```

## Alternative: Run the Fix Script

You can also run the automated fix script:

```bash
cd onyx-cutom/custom_extensions/frontend
chmod +x fix-types.sh
./fix-types.sh
```

## React Import Issue

If you still see React import errors, add this to the top of any TypeScript files:
```typescript
/// <reference types="react" />
```

Or ensure your `tsconfig.json` includes React types properly:
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "types": ["node", "react", "react-dom"]
  }
}
``` 