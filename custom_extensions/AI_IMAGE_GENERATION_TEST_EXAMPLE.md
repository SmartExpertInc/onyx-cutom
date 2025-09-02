# AI Image Generation Test Example

This example demonstrates how to properly manage the `isGenerating` state for multiple placeholders to ensure the spinner appears on the correct placeholder.

## Test Component

```tsx
import React, { useState } from 'react';
import ClickableImagePlaceholder from './ClickableImagePlaceholder';

interface PlaceholderData {
  id: string;
  imagePath?: string;
  aiGeneratedPrompt?: string;
  isGenerating: boolean;
}

function TestAIImageGeneration() {
  // State for multiple placeholders
  const [placeholders, setPlaceholders] = useState<PlaceholderData[]>([
    {
      id: 'slide_1_image_1',
      aiGeneratedPrompt: 'A modern business presentation slide with charts and graphs, professional style, clean design',
      isGenerating: false
    },
    {
      id: 'slide_1_image_2', 
      aiGeneratedPrompt: 'A flowchart showing the optimization process with arrows and decision points, business presentation style',
      isGenerating: false
    },
    {
      id: 'slide_1_image_3',
      aiGeneratedPrompt: 'A team collaboration scene with people working on computers, modern office environment',
      isGenerating: false
    }
  ]);

  // Handle image upload/generation for specific placeholder
  const handleImageUploaded = (placeholderId: string, imagePath: string) => {
    console.log('🔍 [Test] Image uploaded/generated', { placeholderId, imagePath });
    
    setPlaceholders(prev => 
      prev.map(p => 
        p.id === placeholderId 
          ? { ...p, imagePath, isGenerating: false }
          : p
      )
    );
  };

  // Handle generation started for specific placeholder
  const handleGenerationStarted = (placeholderId: string) => {
    console.log('🔍 [Test] Generation started', { placeholderId });
    
    setPlaceholders(prev => 
      prev.map(p => 
        p.id === placeholderId 
          ? { ...p, isGenerating: true }
          : p
      )
    );
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">AI Image Generation Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholders.map((placeholder) => (
          <div key={placeholder.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Placeholder: {placeholder.id}</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI Prompt: {placeholder.aiGeneratedPrompt?.substring(0, 50)}...
            </p>
            
            <ClickableImagePlaceholder
              imagePath={placeholder.imagePath}
              onImageUploaded={(path) => handleImageUploaded(placeholder.id, path)}
              isEditable={true}
              size="MEDIUM"
              position="CENTER"
              elementId={placeholder.id}
              aiGeneratedPrompt={placeholder.aiGeneratedPrompt}
              isGenerating={placeholder.isGenerating}
            />
            
            <div className="mt-2 text-xs text-gray-500">
              Status: {placeholder.isGenerating ? '🔄 Generating...' : placeholder.imagePath ? '✅ Has Image' : '📝 Empty'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(placeholders, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default TestAIImageGeneration;
```

## Expected Behavior

1. **Multiple Placeholders**: Each placeholder has its own independent state
2. **Spinner Isolation**: Only the placeholder being generated shows a spinner
3. **Prompt Pre-filling**: Each modal opens with the correct AI-generated prompt
4. **Concurrent Generation**: Multiple placeholders can generate simultaneously

## Debug Logs to Watch

When testing, look for these log patterns:

### Modal Opening
```
🔍 [AIGeneration] Choose AI clicked { elementId: "slide_1_image_1", hasAiGeneratedPrompt: true, aiGeneratedPromptPreview: "A modern business presentation slide with charts..." }
🔍 [AIImageGenerationModal] modalOpened_noPreFill { placeholderId: "slide_1_image_1", reason: "No preFilledPrompt provided" }
```

### Generation Started
```
🔍 [AIGeneration] Generation started { elementId: "slide_1_image_1", timestamp: 1234567890 }
🔍 [SpinnerState] isGenerating changed { elementId: "slide_1_image_1", isGenerating: true }
```

### Generation Complete
```
🔍 [AIGeneration] Image generated successfully { elementId: "slide_1_image_1", imagePath: "/static_design_images/..." }
🔍 [SpinnerState] isGenerating changed { elementId: "slide_1_image_1", isGenerating: false }
```

## Common Issues to Check

1. **Spinner not showing**: Verify `isGenerating` prop is being passed correctly
2. **Wrong placeholder spinning**: Check that `elementId` is unique for each placeholder
3. **Prompt not pre-filling**: Ensure `aiGeneratedPrompt` prop is being passed
4. **Multiple spinners**: Verify state management is per-placeholder, not global

## Integration with Existing Components

To integrate this pattern with your existing slide components:

```tsx
// In your slide component
const [slideData, setSlideData] = useState({
  content: "...",
  imagePlaceholders: [
    {
      id: "slide_1_image_1",
      aiGeneratedPrompt: "A modern business presentation...",
      isGenerating: false,
      imagePath: undefined
    }
  ]
});

const handleGenerationStarted = (placeholderId: string) => {
  setSlideData(prev => ({
    ...prev,
    imagePlaceholders: prev.imagePlaceholders.map(p => 
      p.id === placeholderId ? { ...p, isGenerating: true } : p
    )
  }));
};

const handleImageGenerated = (placeholderId: string, imagePath: string) => {
  setSlideData(prev => ({
    ...prev,
    imagePlaceholders: prev.imagePlaceholders.map(p => 
      p.id === placeholderId ? { ...p, imagePath, isGenerating: false } : p
    )
  }));
};
```

This ensures each placeholder maintains its own independent state and the spinner appears only on the correct placeholder during generation.
