# OpenSans-Semibold Font Setup

## Overview
This document describes the setup and implementation of the OpenSans-Semibold font across all slide templates in the Content Builder AI application.

## Font Files
- **Source**: `OpenSans-Semibold.ttf` (copied to `src/fonts/`)
- **Font Weight**: 600 (Semibold)
- **Font Style**: Normal

## Implementation Details

### 1. CSS Font Definition
The font is defined in multiple CSS files:

#### `src/styles/globals.css`
- Basic `@font-face` definition
- Global font class `.opensans-semibold`

#### `src/styles/slideDeck.css`
- Updated `--font-primary` variable
- Applied to all slide text elements
- Overrides for titles, content, bullets, and inline editors

#### `src/styles/opensans-semibold.css`
- Dedicated font styles file
- Force overrides for all text elements
- Comprehensive coverage of slide components

#### `src/app/globals.css`
- Theme-specific font classes
- Global application to all slide elements

### 2. Slide Templates Updated
The following slide templates now use OpenSans-Semibold:

- ✅ Course Overview Slide
- ✅ Work-Life Balance Slide  
- ✅ Thank You Slide
- ✅ Benefits List Slide
- ✅ Hybrid Work Best Practices
- ✅ Benefits Tags Slide
- ✅ Learning Topics Slide
- ✅ Soft Skills Assessment Slide
- ✅ Two Column Slide
- ✅ Phishing Definition Slide
- ✅ Impact Statements Slide
- ✅ Bar Chart Slide
- ✅ Critical Thinking Slide
- ✅ Psychological Safety Slide


### 3. CSS Classes Applied
Each slide template now includes the class `opensans-semibold-theme` which ensures:
- All text elements use OpenSans-Semibold
- Font weight is consistently set to 600
- Fallback fonts are properly configured

### 4. Font Loading
- Font is preloaded in `layout.tsx` for better performance
- Uses `font-display: swap` for optimal loading behavior
- Fallback fonts ensure text remains visible during loading

## Usage

### Automatic Application
The font is automatically applied to all slide templates. No additional configuration is needed.

### Manual Override
If you need to override the font for specific elements:

```css
.custom-element {
  font-family: 'OpenSans-Semibold', sans-serif !important;
  font-weight: 600 !important;
}
```

### CSS Variables
The font is available through CSS variables:

```css
:root {
  --font-primary: 'OpenSans-Semibold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## Browser Support
- **Modern Browsers**: Full support with `@font-face`
- **Fallback**: System fonts (San Francisco, Segoe UI, Roboto)
- **Performance**: Optimized with `font-display: swap`

## Maintenance
- Font file is located in `src/fonts/OpenSans-Semibold.ttf`
- CSS files are automatically imported in `layout.tsx`
- All slide templates inherit the font automatically

## Troubleshooting
If the font is not loading:

1. Check that `OpenSans-Semibold.ttf` exists in `src/fonts/`
2. Verify CSS imports in `layout.tsx`
3. Check browser console for font loading errors
4. Ensure the `opensans-semibold-theme` class is applied to slide containers

## Performance Notes
- Font file size: ~200KB
- Preloaded for optimal performance
- Uses `font-display: swap` for better user experience
- Fallback fonts ensure immediate text visibility 