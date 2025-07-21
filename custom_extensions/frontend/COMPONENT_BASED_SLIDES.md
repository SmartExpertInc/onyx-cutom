# Component-Based Slide Template System

## Overview

The Component-Based Slide Template System is a modern, flexible approach to creating and managing presentation slides. Instead of using generic content blocks, each slide is now a dedicated React component with full control over layout, styling, and content placement.

## Key Features

- **50+ Professional Templates**: Highly detailed, purpose-built slide templates
- **Component-Based Architecture**: Each template is a standalone React component
- **Props-Based Configuration**: All content and styling controlled through typed props
- **Template Registry**: Centralized system for managing and discovering templates
- **Migration Support**: Seamless migration from legacy content-block system
- **Editor Integration**: Built for future WYSIWYG and drag-and-drop editing
- **AI-Ready**: Structured for AI content generation and template selection

## Architecture

### Data Model

```typescript
// New slide format
interface ComponentBasedSlide {
  slideId: string;
  slideNumber: number;
  templateId: string;  // References template in registry
  props: Record<string, any>;  // All template-specific data
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    notes?: string;
  };
}

// Example slide
const slide: ComponentBasedSlide = {
  slideId: "slide-123",
  slideNumber: 1,
  templateId: "title-slide",
  props: {
    title: "My Presentation",
    subtitle: "Key insights and findings",
    author: "John Doe",
    backgroundColor: "#ffffff"
  }
};
```

### Template Registry

The template registry (`src/components/templates/registry.ts`) maps template IDs to their components and metadata:

```typescript
export const SLIDE_TEMPLATE_REGISTRY: TemplateRegistry = {
  'title-slide': {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Opening slide with title and subtitle',
    category: 'title',
    icon: '🎯',
    component: TitleSlideTemplate,
    defaultProps: { /* ... */ },
    propSchema: { /* ... */ }
  },
  // ... more templates
};
```

## Creating New Templates

### 1. Define Props Interface

```typescript
// src/types/slideTemplates.ts
export interface MyTemplateProps extends BaseTemplateProps {
  title: string;
  content: string;
  imageUrl?: string;
  backgroundColor?: string;
  titleColor?: string;
}
```

### 2. Create Template Component

```typescript
// src/components/templates/MyTemplate.tsx
import React from 'react';
import { MyTemplateProps } from '@/types/slideTemplates';

export const MyTemplate: React.FC<MyTemplateProps> = ({
  slideId,
  title,
  content,
  imageUrl,
  backgroundColor = '#ffffff',
  titleColor = '#1a1a1a',
  isEditable = false,
  onUpdate
}) => {
  const handleClick = () => {
    if (isEditable && onUpdate) {
      onUpdate({ slideId });
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor, 
        minHeight: '600px',
        padding: '60px'
      }}
      onClick={handleClick}
    >
      <h1 style={{ color: titleColor, fontSize: '2.5rem' }}>
        {title}
      </h1>
      {imageUrl && (
        <img src={imageUrl} alt="Template image" style={{ maxWidth: '100%' }} />
      )}
      <div style={{ fontSize: '1.2rem', marginTop: '24px' }}>
        {content}
      </div>
    </div>
  );
};

export default MyTemplate;
```

### 3. Register Template

```typescript
// src/components/templates/registry.ts
import { MyTemplate } from './MyTemplate';

export const SLIDE_TEMPLATE_REGISTRY: TemplateRegistry = {
  // ... existing templates
  'my-template': {
    id: 'my-template',
    name: 'My Custom Template',
    description: 'A custom template with image and content',
    category: 'content',
    icon: '🎨',
    component: MyTemplate,
    defaultProps: {
      title: 'Default Title',
      content: 'Default content...',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        maxLength: 100
      },
      content: {
        type: 'richtext',
        label: 'Content',
        required: true,
        maxLength: 1000
      },
      imageUrl: {
        type: 'image',
        label: 'Image URL',
        description: 'Optional image to display'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#1a1a1a'
      }
    }
  }
};
```

## Template Categories

Templates are organized into categories for better discoverability:

- **title**: Opening/title slides
- **content**: Standard content presentations
- **media**: Image-heavy or multimedia slides
- **layout**: Multi-column or complex layouts
- **special**: Quotes, callouts, and unique formats

## Prop Schema Types

Define how props should be edited in the UI:

```typescript
interface PropDefinition {
  type: 'text' | 'richtext' | 'image' | 'color' | 'number' | 'boolean' | 'select' | 'array';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  
  // Type-specific options
  options?: Array<{value: any; label: string}>; // For select
  min?: number; max?: number; // For number
  maxLength?: number; // For text
  arrayItemType?: PropDefinition; // For array
}
```

## Migration from Legacy System

### Automatic Migration

The system includes utilities to migrate legacy content-block slides:

```typescript
import { migrateLegacySlideDeck } from '@/utils/slideMigration';

// Migrate entire deck
const result = migrateLegacySlideDeck(legacyDeck);
if (result.success) {
  console.log('Migrated deck:', result.deck);
  console.log('Migration results:', result.results);
}
```

### Migration Rules

1. **Title slides**: Multiple headlines → `title-slide`
2. **Bullet lists**: Headline + bullets → `bullet-points`
3. **Two columns**: Multiple H2s with content → `two-column`
4. **Default**: Everything else → `content-slide`

## Usage Examples

### Basic Rendering

```typescript
import { ComponentBasedSlideRenderer } from '@/components/ComponentBasedSlideRenderer';

const slide: ComponentBasedSlide = {
  slideId: 'slide-1',
  slideNumber: 1,
  templateId: 'content-slide',
  props: {
    title: 'Welcome',
    content: 'This is the content...',
    alignment: 'center'
  }
};

function MyPresentation() {
  return (
    <ComponentBasedSlideRenderer 
      slide={slide}
      isEditable={true}
      onSlideUpdate={(updatedSlide) => {
        // Handle slide updates
        console.log('Slide updated:', updatedSlide);
      }}
    />
  );
}
```

### Enhanced Viewer with Migration

```typescript
import { EnhancedSlideDeckViewer } from '@/components/EnhancedSlideDeckViewer';

function PresentationViewer({ legacyDeck, componentDeck }) {
  return (
    <EnhancedSlideDeckViewer
      deck={legacyDeck}  // Will offer migration
      componentDeck={componentDeck}  // Direct component-based rendering
      isEditable={true}
      onSave={(updatedDeck) => {
        // Save component-based deck
      }}
    />
  );
}
```

## Best Practices

### Template Design

1. **Responsive**: Use flexible layouts that work on different screen sizes
2. **Accessible**: Include proper ARIA labels and alt text
3. **Consistent**: Follow the design system for colors and typography
4. **Performant**: Avoid heavy images or complex animations
5. **Editable**: Design for future WYSIWYG editing capabilities

### Styling

1. **CSS-in-JS**: Use inline styles or styled-components for template styling
2. **Theme-ready**: Use color props for easy theming
3. **No external dependencies**: Keep templates self-contained
4. **Professional fonts**: Use system fonts or web-safe alternatives

### Props Design

1. **Type safety**: Always define TypeScript interfaces
2. **Sensible defaults**: Provide good default values
3. **Validation**: Use prop schema for validation rules
4. **Clear naming**: Use descriptive prop names

## File Structure

```
src/
├── types/
│   └── slideTemplates.ts           # All TypeScript interfaces
├── components/
│   ├── templates/
│   │   ├── registry.ts             # Template registry
│   │   ├── TitleSlideTemplate.tsx  # Individual templates
│   │   ├── ContentSlideTemplate.tsx
│   │   └── ...
│   ├── ComponentBasedSlideRenderer.tsx
│   └── EnhancedSlideDeckViewer.tsx
└── utils/
    └── slideMigration.ts           # Migration utilities
```

## API Reference

### Core Functions

```typescript
// Get template by ID
getTemplate(templateId: string): TemplateComponentInfo | undefined

// Get all templates
getAllTemplates(): TemplateComponentInfo[]

// Get templates by category
getTemplatesByCategory(category: string): TemplateComponentInfo[]

// Validate template props
validateTemplateProps(templateId: string, props: any): ValidationResult

// Migrate legacy slide
migrateLegacySlide(legacySlide: DeckSlide): MigrationResult

// Create new slide
createNewComponentSlide(templateId: string, slideNumber: number): ComponentBasedSlide
```

## Future Enhancements

### Planned Features

1. **WYSIWYG Editor**: Visual editing interface for template props
2. **Drag & Drop**: Reorder slides and elements within templates
3. **Advanced Theming**: Global theme support with CSS variables
4. **Template Marketplace**: Community-contributed templates
5. **Animation System**: Slide transitions and element animations
6. **Collaboration**: Real-time editing and commenting
7. **Version History**: Track changes and revert capabilities

### AI Integration

The component-based system is designed for AI integration:

```typescript
// AI can output structured slide data
const aiGeneratedSlide = {
  templateId: 'bullet-points',
  props: {
    title: 'Key Benefits',
    bullets: ['Faster performance', 'Better user experience', 'Lower costs'],
    bulletStyle: 'check',
    maxColumns: 2
  }
};
```

## Troubleshooting

### Common Issues

1. **Template not found**: Check that template is registered in registry
2. **Props validation errors**: Ensure props match the schema definition
3. **Migration failures**: Check console for specific migration errors
4. **Styling issues**: Verify CSS-in-JS styles are properly applied

### Debug Tips

```typescript
// Debug template rendering
console.log('Available templates:', getAllTemplates());
console.log('Template info:', getTemplate('my-template'));

// Debug prop validation
const validation = validateTemplateProps('my-template', props);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

## Contributing

When contributing new templates:

1. Follow the template creation guide above
2. Include comprehensive prop schema
3. Test with different prop combinations
4. Add to appropriate category
5. Update this documentation
6. Include example usage

---

For more information or help with implementation, see the codebase examples or create an issue. 