# Component-Based Slide Template System Documentation

## Overview

The new component-based slide template system replaces the generic content-block rendering with dedicated React components for each slide template. This provides better control over layout, styling, and content placement while maintaining backward compatibility.

## Key Features

- **Component-Based**: Each template is a standalone React component
- **Type Safety**: Full TypeScript support with proper prop types
- **Backward Compatibility**: Automatic migration from legacy content-block system
- **Extensible**: Easy to add new templates to the registry
- **AI Integration Ready**: Structured props format for AI content generation

## Architecture

### Core Components

1. **Template Components** (`/src/components/slideTemplates/`)
   - Individual React components for each template type
   - Standardized prop interfaces for consistency
   - Responsive and accessible design

2. **Template Registry** (`TemplateRegistry.ts`)
   - Central mapping of template IDs to React components
   - Default props and validation logic
   - Template metadata (name, description, category)

3. **Template Renderer** (`TemplateRenderer.tsx`)
   - Dynamic component rendering based on template ID
   - Error handling and fallback templates
   - Edit mode integration

4. **Type System** (`/src/types/slideTemplates.ts`)
   - Comprehensive TypeScript interfaces
   - Union types for backward compatibility
   - Type guards for system detection

## Data Model

### New Template-Based Structure

```typescript
interface TemplateBasedSlide {
  slideId: string;
  slideNumber: number;
  templateId: string;  // Maps to registry entry
  props: AnyTemplateProps; // Template-specific props
}

interface TemplateBasedSlideDeck {
  lessonTitle: string;
  slides: TemplateBasedSlide[];
  currentSlideId?: string;
  lessonNumber?: number;
  detectedLanguage?: string;
}
```

### Legacy Content-Block Structure (Supported)

```typescript
interface LegacySlide {
  slideId: string;
  slideNumber: number;
  slideTitle: string;
  contentBlocks: ContentBlock[]; // Old system
}
```

## Available Templates

### 1. Title Slide (`title-slide`)
**Purpose**: Opening slide with large title and optional subtitle
```typescript
interface TitleSlideProps {
  slideId: string;
  slideNumber: number;
  title: TextProps;
  subtitle?: TextProps;
  backgroundImage?: ImageProps;
}
```

### 2. Big Image Left (`big-image-left`)
**Purpose**: Large image on left, content and bullets on right
```typescript
interface BigImageLeftProps {
  slideId: string;
  slideNumber: number;
  title: TextProps;
  image: ImageProps;
  content: TextProps;
  bulletPoints?: string[];
}
```

### 3. Quote Center (`quote-center`)
**Purpose**: Prominent centered quote with attribution
```typescript
interface QuoteCenterProps {
  slideId: string;
  slideNumber: number;
  quote: TextProps;
  author?: TextProps;
  backgroundImage?: ImageProps;
}
```

### 4. Bullet Points (`bullet-points`)
**Purpose**: Title with bullet points in single or two-column layout
```typescript
interface BulletPointsProps {
  slideId: string;
  slideNumber: number;
  title: TextProps;
  bullets: TextProps[];
  layout: 'single-column' | 'two-column';
}
```

### 5. Two Column (`two-column`)
**Purpose**: Side-by-side content layout
```typescript
interface TwoColumnProps {
  slideId: string;
  slideNumber: number;
  title: TextProps;
  leftColumn: ColumnContent;
  rightColumn: ColumnContent;
}
```

## Adding New Templates

### Step 1: Create the Component

Create a new file in `/src/components/slideTemplates/`:

```tsx
// NewTemplate.tsx
import React from 'react';
import { NewTemplateProps } from '@/types/slideTemplates';

export const NewTemplate: React.FC<NewTemplateProps> = ({ 
  slideId, 
  slideNumber, 
  // ...your props
}) => {
  return (
    <div className="new-template" style={{ minHeight: '100vh' }}>
      {/* Your template layout */}
    </div>
  );
};

export default NewTemplate;
```

### Step 2: Define the Props Interface

Add to `/src/types/slideTemplates.ts`:

```typescript
export interface NewTemplateProps extends BaseTemplateProps {
  // Your specific props
  customProp: TextProps;
}

// Update the union type
export type AnyTemplateProps = 
  | TitleSlideProps
  | BigImageLeftProps
  // ... existing
  | NewTemplateProps; // Add yours
```

### Step 3: Register the Template

Add to `TemplateRegistry.ts`:

```typescript
import NewTemplate from './NewTemplate';

export const TEMPLATE_DEFINITIONS = {
  // ... existing templates
  'new-template': {
    id: 'new-template',
    name: 'New Template',
    description: 'Description of what this template does',
    category: 'content', // or 'presentation' or 'special'
    component: NewTemplate,
    defaultProps: {
      customProp: { text: 'Default value' },
    } as Omit<NewTemplateProps, 'slideId' | 'slideNumber'>,
  },
};
```

### Step 4: Export the Component

Update `/src/components/slideTemplates/index.ts`:

```typescript
export { default as NewTemplate } from './NewTemplate';
```

### Step 5: Add Validation (Optional)

Update the validation function in `TemplateRegistry.ts`:

```typescript
export function validateTemplateProps(templateId: string, props: any): boolean {
  switch (templateId) {
    // ... existing cases
    case 'new-template':
      return !!(props.customProp?.text);
    default:
      return true;
  }
}
```

## Usage Examples

### Creating a New Template-Based Deck

```typescript
import { createDefaultSlideProps } from '@/components/slideTemplates';

const newDeck: TemplateBasedSlideDeck = {
  lessonTitle: 'My Presentation',
  slides: [
    {
      slideId: 'slide-1',
      slideNumber: 1,
      templateId: 'title-slide',
      props: createDefaultSlideProps('title-slide', 'slide-1', 1)!,
    }
  ],
};
```

### Converting Legacy Deck

```typescript
import { migrateContentBlocksToTemplate } from '@/components/slideTemplates';

const migration = migrateContentBlocksToTemplate(legacySlide.contentBlocks);
if (migration) {
  const newSlide: TemplateBasedSlide = {
    slideId: legacySlide.slideId,
    slideNumber: legacySlide.slideNumber,
    templateId: migration.templateId,
    props: { ...baseProps, ...migration.props },
  };
}
```

### Rendering Templates

```tsx
import { TemplateRenderer } from '@/components/slideTemplates';

<TemplateRenderer
  slide={templateBasedSlide}
  isEditable={true}
  onSlideChange={handleSlideChange}
/>
```

## Migration Guide

### Automatic Migration

The system automatically detects legacy content-block slides and provides:
1. **Detection**: `isTemplateBasedDeck()` type guard
2. **Conversion**: `convertToTemplateSystem()` in the viewer
3. **Migration**: `migrateContentBlocksToTemplate()` for individual slides

### Migration Patterns

- **Headlines only** → `title-slide`
- **Quote-like paragraphs** → `quote-center`
- **Bullet lists** → `bullet-points`
- **Complex layouts** → `big-image-left` or `two-column`

## AI Integration

### For AI Systems

The new structure is designed to be AI-friendly:

```typescript
// AI should output this format
{
  "templateId": "bullet-points",
  "props": {
    "title": { "text": "Key Benefits" },
    "bullets": [
      { "text": "Improved performance" },
      { "text": "Better user experience" },
      { "text": "Easier maintenance" }
    ],
    "layout": "single-column"
  }
}
```

### Template Selection Guidelines for AI

1. **Title Slide**: Opening slides, section dividers
2. **Big Image Left**: Content with visual focus
3. **Quote Center**: Testimonials, important quotes
4. **Bullet Points**: Lists, key points, features
5. **Two Column**: Comparisons, before/after, side-by-side content

## Best Practices

### Template Design

1. **Consistent Sizing**: Use `minHeight: '100vh'` for full-screen slides
2. **Responsive Design**: Use `clamp()` for scalable typography
3. **Accessibility**: Proper heading hierarchy, alt text for images
4. **Error Handling**: Graceful fallbacks for missing content

### Props Design

1. **Text Props**: Always use `TextProps` interface for consistency
2. **Optional Content**: Mark optional props with `?`
3. **Sensible Defaults**: Provide meaningful default values
4. **Validation**: Add template-specific validation logic

### Performance

1. **Lazy Loading**: Consider lazy loading for complex templates
2. **Memoization**: Use React.memo for static content
3. **Image Optimization**: Implement proper image loading strategies

## Troubleshooting

### Common Issues

1. **Template Not Found**: Check registry export and import
2. **Type Errors**: Ensure props interface matches component expectations
3. **Missing Props**: Verify default props in registry
4. **Rendering Errors**: Check error boundary in TemplateRenderer

### Debug Mode

Enable debug mode to see template rendering information:

```typescript
<TemplateRenderer 
  slide={slide}
  className="debug-template" // Adds debug attributes
/>
```

## Future Enhancements

### Planned Features

1. **Drag & Drop Editor**: Visual editing interface
2. **Theme System**: Customizable color schemes and fonts
3. **Animation Support**: Slide transitions and element animations
4. **Advanced Templates**: Charts, tables, interactive elements
5. **Template Marketplace**: Community-contributed templates

### Extension Points

The system is designed for future extensibility:

- **Custom Validators**: Template-specific validation logic
- **Template Variants**: Multiple versions of the same template
- **Dynamic Props**: Runtime prop modification
- **Template Inheritance**: Base templates with variations

---

This documentation covers the complete component-based slide template system. For questions or contributions, refer to the source code in `/src/components/slideTemplates/`. 