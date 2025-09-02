# Inter Font Setup Documentation - ONLY INTER

## Overview
This document describes the implementation of the Inter font family across all slide templates in the Content Builder AI application. **ONLY INTER FONT IS USED - NO OTHER FONTS**.

## Font Files Added
The following Inter font files have been copied to `custom_extensions/frontend/src/fonts/`:
- `Inter_18pt-Regular.ttf` - Regular weight (400)
- `Inter_18pt-Medium.ttf` - Medium weight (500) 
- `Inter_18pt-SemiBold.ttf` - SemiBold weight (600)
- `Inter_18pt-Bold.ttf` - Bold weight (700)

## CSS Implementation

### 1. Font Face Definitions
Added to `custom_extensions/frontend/src/styles/globals.css`:
```css
@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter_18pt-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter_18pt-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter_18pt-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter_18pt-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### 2. Global Font Class - ONLY INTER
```css
.inter-font {
  font-family: 'Inter', sans-serif;
}

/* Force Inter everywhere */
* {
  font-family: 'Inter', sans-serif !important;
}
```

### 3. CSS Variables Updated - ONLY INTER
In `custom_extensions/frontend/src/styles/slideDeck.css`:
```css
--font-primary: 'Inter', sans-serif;
--font-mono: 'Inter', sans-serif;
```

### 4. Specific Element Styles - ONLY INTER
Updated all slide-related text elements to use Inter:
- `.slide-title-text`, `.slide-title-display` - font-weight: 600
- `.paragraph-text` - font-weight: 500
- `.bullet-text`, `.number-text` - font-weight: 500
- `.professional-bullet-item`, `.professional-numbered-item` - font-weight: 500
- `.professional-headline .heading-text` - font-weight: 600 for levels 1-3, 500 for level 4
- `.inline-editor-input`, `.inline-editor-textarea` - font-weight: 500

### 5. Comprehensive Inter CSS File - ONLY INTER
Created `custom_extensions/frontend/src/styles/inter.css` with:
- Complete font face definitions
- Global font application with `!important` - ONLY INTER
- Specific targeting of all slide elements - ONLY INTER
- Force override for maximum compatibility - ONLY INTER

## Slide Templates Updated
All 19 specified slide templates now use the `inter-theme` class:

1. CourseOverviewSlideTemplate
2. WorkLifeBalanceSlideTemplate  
3. ThankYouSlideTemplate
4. BenefitsListSlideTemplate
5. HybridWorkBestPracticesSlideTemplate
6. BenefitsTagsSlideTemplate
7. LearningTopicsSlideTemplate
8. SoftSkillsAssessmentSlideTemplate
9. TwoColumnSlideTemplate
10. PhishingDefinitionSlideTemplate
11. ImpactStatementsSlideTemplate
12. BarChartSlideTemplate
13. CriticalThinkingSlideTemplate
14. PsychologicalSafetySlideTemplate
15. CompanyToolsResourcesSlideTemplate
16. ResourcesSlideTemplate
17. ImpactMetricsSlideTemplate
18. TableOfContentsSlideTemplate
19. OnlineSafetyTipsSlideTemplate

## Font Loading Optimization
Updated `custom_extensions/frontend/src/app/layout.tsx`:
- Imported `../styles/inter.css`
- Added preload for `Inter_18pt-Regular.ttf`
- **REMOVED ALL EXTERNAL FONTS** - Only Inter remains
- No Google Fonts, no CDN fonts, no system fonts

## Font Weights Used - ONLY INTER
- **Regular (400)**: Base text, paragraphs
- **Medium (500)**: Most slide content, bullet points, numbered lists
- **SemiBold (600)**: Slide titles, headings level 1-3
- **Bold (700)**: Available for emphasis when needed

## Browser Support
- Modern browsers: Full support via `@font-face`
- **NO FALLBACK FONTS** - Only Inter is used
- Font display: `swap` for better performance

## Maintenance Notes
- All font files are stored in `custom_extensions/frontend/src/fonts/`
- CSS classes use `!important` to ensure font override
- **ONLY INTER FONT IS USED** - No other fonts
- Font weights are optimized for readability across different screen sizes
- Regular (non-italic) versions only to maintain clean appearance

## Performance Considerations
- Font files are preloaded for better loading performance
- `font-display: swap` ensures text remains visible during font loading
- Multiple weights available for design flexibility
- **NO EXTERNAL FONT REQUESTS** - All fonts are local Inter files 