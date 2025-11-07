# Event Poster Fixes - Font and Size Issues

## Issues Fixed

### 1. PNG Download Size Issue (Banner in top left corner and purple rectangle behind)
**Root Cause**: The HTML-to-image service was using hardcoded video dimensions (1920x1080) for all conversions, but event posters require square dimensions (1000x1000).

**Solution**:
- Modified `html_to_image_service.py` to accept custom width and height parameters
- Updated `convert_html_to_png_playwright()` to use target dimensions instead of hardcoded video dimensions
- Updated poster generation endpoint in `main.py` to pass correct poster dimensions (1000x1000)

**Files Changed**:
- `custom_extensions/backend/app/services/html_to_image_service.py`:
  - Added `width` and `height` parameters to `convert_html_to_png()` method
  - Added `width` and `height` parameters to `convert_html_to_png_playwright()` method
  - Updated viewport and screenshot clip dimensions to use `target_width` and `target_height`
  
- `custom_extensions/backend/main.py`:
  - Updated poster generation endpoint to pass `width=1000, height=1000` to conversion service

### 2. Font Rendering Issue (Fonts incorrect in PNG vs frontend)
**Root Cause**: 
- **Backend**: The Google Fonts (Montserrat) were not loading fully before the PNG screenshot was taken, resulting in fallback fonts being used
- **Frontend**: The Montserrat font was not being loaded at all on the results pages, causing the browser to use fallback sans-serif fonts

**Solution**:

**Backend (PNG Generation)**:
- Increased font loading timeout from 5 seconds to 10 seconds for poster generation
- Increased final render delay from 1 second to 2 seconds to ensure fonts are fully applied
- Added better logging for font loading diagnostics

**Frontend (Live Display)**:
- Added dynamic font loading via useEffect hook in both results pages
- Loads Montserrat font from Google Fonts CDN with preconnect optimization
- Checks if font is already loaded to avoid duplicate loading

**Files Changed**:
- `custom_extensions/backend/app/services/html_to_image_service.py`:
  - Increased font loading timeout to 10 seconds
  - Increased final render delay to 2 seconds
  - Added comments explaining the increased timeouts for poster generation

- `custom_extensions/frontend/src/app/create/event-poster/results/[projectId]/page.tsx`:
  - Added useEffect hook to dynamically load Montserrat font
  - Added preconnect links for faster font loading
  
- `custom_extensions/frontend/src/app/create/event-poster/results/page.tsx`:
  - Added useEffect hook to dynamically load Montserrat font
  - Added preconnect links for faster font loading

## Technical Details

### Dimension Fix
The poster template is designed with these specifications:
```css
.poster-container {
    width: 1000px;
    height: 1000px;
}
```

Previously, the HTML-to-image service was capturing with dimensions:
- Viewport: 1920x1080 (video dimensions)
- Screenshot clip: 1920x1080

This caused the 1000x1000 poster to be cropped/scaled incorrectly, appearing in the top-left corner.

Now it correctly uses:
- Viewport: 1000x1000 (poster dimensions)
- Screenshot clip: 1000x1000

### Font Loading Fix
The poster template loads Montserrat font from Google Fonts CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
```

Playwright now waits longer for fonts to load:
```javascript
await asyncio.wait_for(
    page.evaluate("document.fonts.ready"),
    timeout=10.0  // Increased from 5.0
)
await asyncio.sleep(2)  // Increased from 1
```

## Testing
To test the fixes:
1. Create or edit an event poster
2. Click "Generate and Download Poster"
3. Verify:
   - The downloaded PNG is 1000x1000 pixels (square)
   - All text uses Montserrat font (not fallback fonts)
   - The poster is centered and fills the entire image
   - No cropping or scaling artifacts

## Frontend Font Loading Fix
The frontend EventPoster component was already correctly specifying Montserrat in inline styles:
- `fontFamily: 'Montserrat, sans-serif'`
- 1000x1000 container dimensions
- Proper font weight specifications (300, 400, 600, 900)

However, the font file itself was not being loaded. The fix adds dynamic font loading:

```typescript
useEffect(() => {
  // Check if font link already exists
  if (!document.querySelector('link[href*="Montserrat"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    document.head.appendChild(link);
    
    // Preconnect for faster loading
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
    
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }
}, []);
```

Now both the frontend display and PNG download use the same Montserrat font with all weight variants (100-900).

