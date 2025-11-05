# Slide Template Background Color Update Pattern

## Overview
To make slide templates respect the custom background color feature, templates need to use the `backgroundColor` prop instead of hardcoded background values.

## What Changed

### 1. ComponentBasedSlideRenderer.tsx
Now passes `slide.backgroundColor` to all template components:

```typescript
const templateProps = {
  ...slide.props,
  slideId: slide.slideId,
  isEditable,
  onUpdate: handlePropsUpdate,
  onEditorActive,
  theme: currentTheme,
  getPlaceholderGenerationState,
  backgroundColor: slide.backgroundColor // ← ADDED THIS
};
```

### 2. Template Update Pattern

Each template needs to be updated to use the `backgroundColor` prop with a fallback.

## Update Patterns

### Pattern 1: Simple Solid Background
**Before:**
```typescript
const slideStyles: React.CSSProperties = {
  width: '100%',
  aspectRatio: '16/9',
  backgroundColor: '#ffffff', // ❌ Hardcoded
  // ... other styles
};
```

**After:**
```typescript
const slideStyles: React.CSSProperties = {
  width: '100%',
  aspectRatio: '16/9',
  backgroundColor: backgroundColor || '#ffffff', // ✅ Uses prop with fallback
  // ... other styles
};
```

### Pattern 2: Gradient Background
**Before:**
```typescript
const slideStyles: React.CSSProperties = {
  background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)', // ❌ Always gradient
};
```

**After:**
```typescript
const slideStyles: React.CSSProperties = {
  background: backgroundColor || 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)', // ✅ Respects prop
};
```

### Pattern 3: Nested Panels
For templates with multiple panels, make inner panels transparent:

**Before:**
```typescript
<div style={{
  width: '55%',
  height: '100%',
  backgroundColor: '#ffffff', // ❌ Blocks parent background
}}>
```

**After:**
```typescript
<div style={{
  width: '55%',
  height: '100%',
  backgroundColor: 'transparent', // ✅ Shows parent background
}}>
```

## Templates Updated

### ✅ Completed
1. `CourseOverviewSlideTemplate_old.tsx`
   - Updated main container to use `backgroundColor || '#ffffff'`
   - Made right panel transparent
   
2. `WorkLifeBalanceSlideTemplate_old.tsx`
   - Updated to use `backgroundColor || 'linear-gradient(...)'`

### 🔄 Needs Update (Video Lesson Templates)
Based on `TemplateSelector.tsx` whitelist:

1. `PhishingDefinitionSlideTemplate_old.tsx`
2. `CultureValuesThreeColumnsSlideTemplate_old.tsx`
3. `PercentCirclesSlideTemplate_old.tsx`
4. `BenefitsListSlideTemplate_old.tsx`
5. `ImpactStatementsSlideTemplate_old.tsx`
6. `DeiMethodsSlideTemplate_old.tsx`
7. `CompanyToolsResourcesSlideTemplate_old.tsx`
8. `AiPharmaMarketGrowthSlideTemplate_old.tsx`
9. `CriticalThinkingSlideTemplate_old.tsx`
10. `BenefitsTagsSlideTemplate_old.tsx`
11. `KpiUpdateSlideTemplate_old.tsx`
12. `PhishingRiseSlideTemplate_old.tsx`
13. `SoftSkillsAssessmentSlideTemplate_old.tsx`
14. `ProblemsGridSlideTemplate_old.tsx`
15. `SolutionStepsSlideTemplate_old.tsx`
16. `HybridWorkBestPracticesSlideTemplate_old.tsx`

## Testing Checklist

After updating a template:
1. ✅ Open slide in video editor
2. ✅ Click "Background" in toolbox
3. ✅ Select a color
4. ✅ Verify entire slide background changes (including all panels)
5. ✅ Reload page - color should persist
6. ✅ Delete color - should revert to default/gradient

## Notes

- The `backgroundColor` prop is already defined in most template prop interfaces
- Some templates use `backgroundColor` in theme colors - don't confuse with slide-level prop
- Inner decorative elements (cards, badges) should keep their own backgrounds
- Only the main slide container should respect the custom background

