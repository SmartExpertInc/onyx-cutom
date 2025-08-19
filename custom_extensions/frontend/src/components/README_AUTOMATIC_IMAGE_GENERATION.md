# Automatic AI Image Generation for SmartSlideDeckViewer

## Overview

The `SmartSlideDeckViewer` now includes automatic AI image generation capabilities. When enabled, the system will automatically generate images for all placeholders in a presentation using AI-generated prompts.

## Quick Start

### 1. Enable Automatic Generation

```tsx
import SmartSlideDeckViewer from './SmartSlideDeckViewer';

<SmartSlideDeckViewer
  deck={slideDeck}
  isEditable={true}
  onSave={handleSave}
  enableAutomaticImageGeneration={true} // Enable automatic generation
/>
```

### 2. Ensure Slide Data Has Prompts

Your slide deck should include `imagePrompt` properties:

```typescript
const slideDeck = {
  lessonTitle: "My Presentation",
  slides: [
    {
      slideId: "slide-1",
      templateId: "big-image-left",
      props: {
        title: "Introduction",
        subtitle: "Welcome to our presentation",
        imagePrompt: "A modern business presentation slide, professional style, clean design",
        imagePath: "", // Empty - will trigger automatic generation
        imageAlt: "Presentation illustration"
      }
    }
  ]
};
```

### 3. Handle Callbacks (Optional)

```tsx
const handleGenerationStarted = () => {
  console.log('Automatic generation started');
};

const handleGenerationCompleted = (results) => {
  const successCount = results.filter(r => r.success).length;
  console.log(`${successCount} images generated successfully`);
};

<SmartSlideDeckViewer
  deck={slideDeck}
  enableAutomaticImageGeneration={true}
  onAutomaticGenerationStarted={handleGenerationStarted}
  onAutomaticGenerationCompleted={handleGenerationCompleted}
/>
```

## Features

- ✅ **Automatic Detection**: Scans for placeholders needing images
- ✅ **Batch Processing**: Generates images in batches to avoid rate limits
- ✅ **Real-time Progress**: Shows generation progress with visual indicator
- ✅ **Error Handling**: Graceful handling of failures
- ✅ **Backward Compatible**: Existing functionality preserved
- ✅ **Visual Feedback**: Loading spinners on individual placeholders

## Supported Templates

- `big-image-left`: Single large image on left
- `big-image-top`: Single large image on top
- `bullet-points`: Bullet points with supporting image
- `bullet-points-right`: Bullet points with image on right
- `two-column`: Two columns with separate images

## Configuration

### Enable/Disable

```tsx
// Enable (default)
enableAutomaticImageGeneration={true}

// Disable
enableAutomaticImageGeneration={false}
```

### Debug Mode

Enable detailed logging:

```javascript
window.__MOVEABLE_DEBUG__ = true;
```

## Example

See `ExampleAutomaticImageGeneration.tsx` for a complete working example.

## API Requirements

Uses existing endpoint: `POST /api/custom/presentation/generate_image`

## Backward Compatibility

- All existing functionality preserved
- Automatic generation is opt-in
- No breaking changes to current API
- Manual generation still available

## Troubleshooting

**Images not generating?**
- Check if `imagePrompt` properties exist
- Verify API endpoint is accessible
- Enable debug logging for detailed info
- Ensure `enableAutomaticImageGeneration={true}`

**Slow generation?**
- API rate limits may be affecting performance
- Check network connectivity
- Monitor API response times
