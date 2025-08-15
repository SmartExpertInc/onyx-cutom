# AI Image Generation Integration Guide

## Enhanced UX Flow

The AI image generation has been enhanced with the following UX improvements:

### 1. Modal Behavior
- **Immediate Close**: Modal closes immediately when user clicks "Generate"
- **Background Processing**: Generation continues in background
- **Loading State**: Spinner appears on placeholder during generation

### 2. Pre-filled Prompts
- **AI Integration**: Prompts can be pre-filled from AI-generated content
- **Editable**: Users can still edit pre-filled prompts before generation
- **Smart Defaults**: Uses AI suggestions when available

## Usage Examples

### Basic Usage

```tsx
import ClickableImagePlaceholder from './ClickableImagePlaceholder';

function MyComponent() {
  const [imagePath, setImagePath] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>();

  const handleImageUploaded = (path: string) => {
    setImagePath(path);
  };

  return (
    <ClickableImagePlaceholder
      imagePath={imagePath}
      onImageUploaded={handleImageUploaded}
      isEditable={true}
      size="MEDIUM"
      position="CENTER"
      elementId="slide_1_image"
      aiGeneratedPrompt={aiPrompt}
      isGenerating={isGenerating}
    />
  );
}
```

### With AI-Generated Content Integration

```tsx
import ClickableImagePlaceholder from './ClickableImagePlaceholder';

interface SlideData {
  id: string;
  content: string;
  imagePlaceholders: {
    id: string;
    aiGeneratedPrompt?: string;
    isGenerating?: boolean;
    imagePath?: string;
  }[];
}

function SlideComponent({ slide }: { slide: SlideData }) {
  const [placeholders, setPlaceholders] = useState(slide.imagePlaceholders);

  const handleImageUploaded = (placeholderId: string, imagePath: string) => {
    setPlaceholders(prev => 
      prev.map(p => 
        p.id === placeholderId 
          ? { ...p, imagePath, isGenerating: false }
          : p
      )
    );
  };

  const handleGenerationStarted = (placeholderId: string) => {
    setPlaceholders(prev => 
      prev.map(p => 
        p.id === placeholderId 
          ? { ...p, isGenerating: true }
          : p
      )
    );
  };

  return (
    <div className="slide">
      <div className="content">{slide.content}</div>
      
      {placeholders.map(placeholder => (
        <ClickableImagePlaceholder
          key={placeholder.id}
          imagePath={placeholder.imagePath}
          onImageUploaded={(path) => handleImageUploaded(placeholder.id, path)}
          isEditable={true}
          size="MEDIUM"
          position="CENTER"
          elementId={placeholder.id}
          aiGeneratedPrompt={placeholder.aiGeneratedPrompt}
          isGenerating={placeholder.isGenerating}
        />
      ))}
    </div>
  );
}
```

### AI Content Generation Integration

```tsx
// Example of how AI-generated content might set prompts
async function generateSlideContent(topic: string) {
  const aiResponse = await generateSlideWithAI(topic);
  
  // AI returns content with image prompts
  const slideData = {
    content: aiResponse.content,
    imagePlaceholders: aiResponse.images.map((img, index) => ({
      id: `slide_${slideId}_image_${index}`,
      aiGeneratedPrompt: img.prompt, // AI-generated prompt
      isGenerating: false,
      imagePath: undefined
    }))
  };
  
  return slideData;
}

// Example AI response structure
const aiResponse = {
  content: "Here's how to optimize your code...",
  images: [
    {
      prompt: "A modern code editor with syntax highlighting, showing optimized JavaScript code with performance metrics, professional style, clean design"
    },
    {
      prompt: "A flowchart showing the optimization process with arrows and decision points, business presentation style, clear and professional"
    }
  ]
};
```

## Component Props

### New Props Added

| Prop | Type | Description |
|------|------|-------------|
| `aiGeneratedPrompt` | `string \| undefined` | Pre-filled prompt from AI-generated content |
| `isGenerating` | `boolean \| undefined` | Loading state for AI generation |

### Updated Props

| Prop | Type | Description |
|------|------|-------------|
| `isEditable` | `boolean` | Controls if placeholder is interactive |
| `onImageUploaded` | `(path: string) => void` | Callback when image is uploaded/generated |

## UX Flow

### 1. Initial State (No Image)
```
┌─────────────────────────┐
│   [Image Placeholder]   │
│   Click to upload       │
│   Or generate with AI   │
└─────────────────────────┘
```

### 2. User Clicks Placeholder
```
┌─────────────────────────┐
│      Choose Option      │
│                         │
│  [📁 Upload Image]      │
│  [✨ Generate with AI]   │
└─────────────────────────┘
```

### 3. AI Generation Modal (with pre-filled prompt)
```
┌─────────────────────────┐
│   Generate AI Image     │
│                         │
│  [Pre-filled prompt]    │
│  [Quality: Standard]    │
│  [Style: Vivid]         │
│                         │
│  [Cancel] [Generate]    │
└─────────────────────────┘
```

### 4. Generation Started (Modal closes, spinner appears)
```
┌─────────────────────────┘
│   [Image Placeholder]   │
│   [🔄 Generating...]    │
│   (disabled)            │
└─────────────────────────┘
```

### 5. Generation Complete
```
┌─────────────────────────┐
│   [Generated Image]     │
│   [✨] [🔄] [🗑️]        │
└─────────────────────────┘
```

## Integration with AI Content Generation

### Step 1: AI Generates Slide Content
```typescript
const slideContent = await generateSlideWithAI(topic);
// Returns: { content: "...", images: [{ prompt: "..." }] }
```

### Step 2: Create Placeholders with AI Prompts
```typescript
const placeholders = slideContent.images.map((img, index) => ({
  id: `slide_${id}_image_${index}`,
  aiGeneratedPrompt: img.prompt,
  isGenerating: false
}));
```

### Step 3: Render with Enhanced Component
```tsx
{placeholders.map(placeholder => (
  <ClickableImagePlaceholder
    key={placeholder.id}
    aiGeneratedPrompt={placeholder.aiGeneratedPrompt}
    isGenerating={placeholder.isGenerating}
    // ... other props
  />
))}
```

## Best Practices

### 1. State Management
- Keep placeholder state in parent component
- Update `isGenerating` when generation starts/ends
- Handle errors gracefully

### 2. AI Prompt Generation
- Generate specific, descriptive prompts
- Include style and context information
- Consider placeholder size and position

### 3. User Experience
- Show loading states clearly
- Disable interactions during generation
- Provide clear feedback on completion

### 4. Error Handling
- Handle API failures gracefully
- Show user-friendly error messages
- Allow retry functionality

## Example Implementation

```tsx
// Complete example with state management
function SlideEditor({ slideId }: { slideId: string }) {
  const [slideData, setSlideData] = useState<SlideData | null>(null);
  const [generatingStates, setGeneratingStates] = useState<Record<string, boolean>>({});

  const handleGenerationStarted = (placeholderId: string) => {
    setGeneratingStates(prev => ({ ...prev, [placeholderId]: true }));
  };

  const handleImageGenerated = (placeholderId: string, imagePath: string) => {
    setSlideData(prev => prev ? {
      ...prev,
      imagePlaceholders: prev.imagePlaceholders.map(p => 
        p.id === placeholderId 
          ? { ...p, imagePath, isGenerating: false }
          : p
      )
    } : null);
    
    setGeneratingStates(prev => ({ ...prev, [placeholderId]: false }));
  };

  return (
    <div className="slide-editor">
      {slideData?.imagePlaceholders.map(placeholder => (
        <ClickableImagePlaceholder
          key={placeholder.id}
          imagePath={placeholder.imagePath}
          onImageUploaded={(path) => handleImageGenerated(placeholder.id, path)}
          isEditable={true}
          elementId={placeholder.id}
          aiGeneratedPrompt={placeholder.aiGeneratedPrompt}
          isGenerating={generatingStates[placeholder.id] || false}
        />
      ))}
    </div>
  );
}
```

This enhanced integration provides a seamless user experience where AI-generated content naturally flows into image generation, with clear visual feedback and intuitive interactions.
