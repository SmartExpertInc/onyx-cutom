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
**Root Cause**: The Google Fonts (Montserrat) were not loading fully before the PNG screenshot was taken, resulting in fallback fonts being used or incomplete font loading.

**Solution**:
- Increased font loading timeout from 5 seconds to 10 seconds for poster generation
- Increased final render delay from 1 second to 2 seconds to ensure fonts are fully applied
- Added better logging for font loading diagnostics

**Files Changed**:
- `custom_extensions/backend/app/services/html_to_image_service.py`:
  - Increased font loading timeout to 10 seconds
  - Increased final render delay to 2 seconds
  - Added comments explaining the increased timeouts for poster generation

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

## Frontend Remains Unchanged
The frontend EventPoster component was already correctly using:
- Inline styles with Montserrat font
- 1000x1000 container dimensions
- Proper font weight specifications

The issue was purely in the backend PNG generation service, which has now been corrected.

