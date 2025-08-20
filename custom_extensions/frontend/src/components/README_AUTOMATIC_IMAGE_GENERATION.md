# Automatic AI Image Generation for SmartSlideDeckViewer

## Overview

The `SmartSlideDeckViewer` now includes enhanced automatic AI image generation capabilities. When enabled, the system will automatically generate images for all placeholders in a presentation using AI-generated prompts, with intelligent behavior that only triggers once and automatically crops images.

## Key Features

- ✅ **One-Time Auto-Generation**: Automatic generation only happens once during initial presentation creation
- ✅ **Auto-Cropped Images**: AI-generated images are automatically cropped to fit placeholder dimensions
- ✅ **Smart Behavior**: New slides and deleted images show empty placeholders (no auto-generation)
- ✅ **Manual Uploads Preserved**: Manual image uploads still show the crop/no-crop choice modal
- ✅ **Batch Processing**: Generates images in batches to avoid rate limits
- ✅ **Silent Generation**: Generation process runs silently in the background without modal interruptions
- ✅ **Error Handling**: Graceful handling of failures
- ✅ **Backward Compatible**: Existing functionality preserved

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
  console.log('Auto-generation is now disabled for this presentation');
};

<SmartSlideDeckViewer
  deck={slideDeck}
  enableAutomaticImageGeneration={true}
  onAutomaticGenerationStarted={handleGenerationStarted}
  onAutomaticGenerationCompleted={handleGenerationCompleted}
/>
```

## Enhanced Behavior

### One-Time Auto-Generation
- Automatic generation only triggers **once** during initial presentation creation
- After the first auto-generation cycle, it's disabled permanently for that presentation
- This prevents unwanted auto-generation when adding new slides or deleting images

### Auto-Cropped Images
- AI-generated images are automatically set to `objectFit: 'cover'` (cropped mode)
- No modal window appears for AI-generated images
- Images are cropped to fit the placeholder dimensions perfectly

### Smart Placeholder Behavior
- **New slides**: Show empty placeholders (no auto-generation)
- **Deleted images**: Show empty placeholders (no auto-generation)
- **Silent generation**: AI generation runs in background without modal interruptions
- **Manual uploads**: Still show the crop/no-crop choice modal
- **AI-generated images**: Automatically cropped without user interaction

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
- Manual upload crop/no-crop modal still works

## Troubleshooting

**Images not generating?**
- Check if `imagePrompt` properties exist
- Verify API endpoint is accessible
- Enable debug logging for detailed info
- Ensure `enableAutomaticImageGeneration={true}`

**Auto-generation keeps triggering?**
- Auto-generation should only happen once per presentation
- Check if you're resetting the presentation data
- Verify the `autoGenerationCompleted` state is being preserved

**Images not cropped?**
- AI-generated images should automatically be cropped
- Check if `objectFit: 'cover'` is being set in the slide props
- Manual uploads still show the crop choice modal

**Slow generation?**
- API rate limits may be affecting performance
- Check network connectivity
- Monitor API response times
