// custom_extensions/frontend/src/components/templates/registry.ts

import { TemplateRegistry, TemplateComponentInfo, PropDefinition } from '@/types/slideTemplates';

// Template components (will import these after creating them)
import { TitleSlideTemplate } from './TitleSlideTemplate';
import { ContentSlideTemplate } from './ContentSlideTemplate';
import { BigImageLeftTemplate } from './BigImageLeftTemplate';
import { QuoteCenterTemplate } from './QuoteCenterTemplate';
import { BulletPointsTemplate } from './BulletPointsTemplate';
import { TwoColumnTemplate } from './TwoColumnTemplate';
import { ComparisonSlideTemplate } from './ComparisonSlideTemplate';
import { ProcessStepsTemplate } from './ProcessStepsTemplate';

// Template registry with comprehensive metadata
export const SLIDE_TEMPLATE_REGISTRY: TemplateRegistry = {
  'title-slide': {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Opening slide with title, subtitle, and optional author/date information',
    category: 'title',
    icon: '🎯',
    component: TitleSlideTemplate,
    defaultProps: {
      title: 'Presentation Title',
      subtitle: 'Compelling subtitle that captures attention',
      author: '',
      date: '',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#666666',
      backgroundImage: ''
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        description: 'Main presentation title',
        required: true,
        maxLength: 100
      },
      subtitle: {
        type: 'text',
        label: 'Subtitle',
        description: 'Supporting subtitle or tagline',
        maxLength: 200
      },
      author: {
        type: 'text',
        label: 'Author',
        description: 'Presenter or author name',
        maxLength: 50
      },
      date: {
        type: 'text',
        label: 'Date',
        description: 'Presentation date',
        maxLength: 50
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
      },
      subtitleColor: {
        type: 'color',
        label: 'Subtitle Color',
        default: '#666666'
      },
      backgroundImage: {
        type: 'image',
        label: 'Background Image',
        description: 'Optional background image URL'
      }
    }
  },

  'content-slide': {
    id: 'content-slide',
    name: 'Content Slide',
    description: 'Standard content slide with title and body text',
    category: 'content',
    icon: '📄',
    component: ContentSlideTemplate,
    defaultProps: {
      title: 'Slide Title',
      content: 'Your content goes here. This is where you explain your key points with detailed information that supports your presentation narrative.',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#333333',
      alignment: 'left',
      backgroundImage: ''
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        description: 'Slide title',
        required: true,
        maxLength: 100
      },
      content: {
        type: 'richtext',
        label: 'Content',
        description: 'Main slide content',
        required: true,
        maxLength: 2000
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
      },
      contentColor: {
        type: 'color',
        label: 'Content Color',
        default: '#333333'
      },
      alignment: {
        type: 'select',
        label: 'Text Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        default: 'left'
      },
      backgroundImage: {
        type: 'image',
        label: 'Background Image',
        description: 'Optional background image URL'
      }
    }
  },

  'big-image-left': {
    id: 'big-image-left',
    name: 'Big Image Left',
    description: 'Large image on the left with content on the right',
    category: 'media',
    icon: '🖼️',
    component: BigImageLeftTemplate,
    defaultProps: {
      title: 'Image Title',
      content: 'Content that complements the image and provides context or explanation.',
      imageUrl: 'https://via.placeholder.com/600x400?text=Your+Image',
      imageAlt: 'Descriptive alt text',
      imageSize: 'large',
      titleColor: '#1a1a1a',
      contentColor: '#333333',
      backgroundColor: '#ffffff'
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
        description: 'URL of the image to display',
        required: true
      },
      imageAlt: {
        type: 'text',
        label: 'Image Alt Text',
        description: 'Descriptive text for accessibility',
        required: true,
        maxLength: 200
      },
      imageSize: {
        type: 'select',
        label: 'Image Size',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ],
        default: 'large'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#1a1a1a'
      },
      contentColor: {
        type: 'color',
        label: 'Content Color',
        default: '#333333'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff'
      }
    }
  },

  'quote-center': {
    id: 'quote-center',
    name: 'Quote Center',
    description: 'Prominently displayed quote with optional author attribution',
    category: 'special',
    icon: '💬',
    component: QuoteCenterTemplate,
    defaultProps: {
      quote: 'This is an inspiring quote that captures the essence of your message and resonates with your audience.',
      author: 'Quote Author',
      attribution: 'Title, Organization',
      backgroundColor: '#f8f9fa',
      quoteColor: '#1a1a1a',
      authorColor: '#666666',
      fontSize: 'large'
    },
    propSchema: {
      quote: {
        type: 'richtext',
        label: 'Quote',
        description: 'The main quote text',
        required: true,
        maxLength: 500
      },
      author: {
        type: 'text',
        label: 'Author',
        description: 'Quote author name',
        maxLength: 100
      },
      attribution: {
        type: 'text',
        label: 'Attribution',
        description: 'Author title, organization, etc.',
        maxLength: 200
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#f8f9fa'
      },
      quoteColor: {
        type: 'color',
        label: 'Quote Color',
        default: '#1a1a1a'
      },
      authorColor: {
        type: 'color',
        label: 'Author Color',
        default: '#666666'
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'xlarge', label: 'Extra Large' }
        ],
        default: 'large'
      }
    }
  },

  'bullet-points': {
    id: 'bullet-points',
    name: 'Bullet Points',
    description: 'Title with formatted bullet points in customizable columns',
    category: 'content',
    icon: '📝',
    component: BulletPointsTemplate,
    defaultProps: {
      title: 'Key Points',
      bullets: [
        'First important point',
        'Second key insight',
        'Third critical element',
        'Fourth essential detail'
      ],
      maxColumns: 2,
      bulletStyle: 'dot',
      titleColor: '#1a1a1a',
      bulletColor: '#333333',
      backgroundColor: '#ffffff'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        maxLength: 100
      },
      bullets: {
        type: 'array',
        label: 'Bullet Points',
        description: 'List of bullet point items',
        required: true,
        arrayItemType: {
          type: 'text',
          label: 'Bullet Point',
          maxLength: 200
        }
      },
      maxColumns: {
        type: 'select',
        label: 'Columns',
        options: [
          { value: 1, label: '1 Column' },
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' }
        ],
        default: 2
      },
      bulletStyle: {
        type: 'select',
        label: 'Bullet Style',
        options: [
          { value: 'dot', label: '• Dot' },
          { value: 'arrow', label: '→ Arrow' },
          { value: 'check', label: '✓ Check' },
          { value: 'star', label: '★ Star' },
          { value: 'number', label: '1. Number' }
        ],
        default: 'dot'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#1a1a1a'
      },
      bulletColor: {
        type: 'color',
        label: 'Bullet Color',
        default: '#333333'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff'
      }
    }
  },

  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    description: 'Split layout with two content areas and customizable ratios',
    category: 'layout',
    icon: '📑',
    component: TwoColumnTemplate,
    defaultProps: {
      title: 'Two Column Layout',
      leftTitle: 'Left Column',
      leftContent: 'Content for the left side of your slide.',
      rightTitle: 'Right Column',
      rightContent: 'Content for the right side of your slide.',
      columnRatio: '50-50',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#333333'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Main Title',
        required: true,
        maxLength: 100
      },
      leftTitle: {
        type: 'text',
        label: 'Left Column Title',
        maxLength: 100
      },
      leftContent: {
        type: 'richtext',
        label: 'Left Content',
        required: true,
        maxLength: 1000
      },
      rightTitle: {
        type: 'text',
        label: 'Right Column Title',
        maxLength: 100
      },
      rightContent: {
        type: 'richtext',
        label: 'Right Content',
        required: true,
        maxLength: 1000
      },
      columnRatio: {
        type: 'select',
        label: 'Column Ratio',
        options: [
          { value: '50-50', label: '50-50' },
          { value: '60-40', label: '60-40' },
          { value: '40-60', label: '40-60' },
          { value: '70-30', label: '70-30' },
          { value: '30-70', label: '30-70' }
        ],
        default: '50-50'
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
      },
      contentColor: {
        type: 'color',
        label: 'Content Color',
        default: '#333333'
      }
    }
  },

  'comparison-slide': {
    id: 'comparison-slide',
    name: 'Comparison',
    description: 'Before/after or side-by-side comparison layout',
    category: 'layout',
    icon: '⚖️',
    component: ComparisonSlideTemplate,
    defaultProps: {
      title: 'Comparison Analysis',
      beforeTitle: 'Before',
      beforeContent: 'Current situation or old approach',
      afterTitle: 'After',
      afterContent: 'Improved situation or new approach',
      beforeImage: '',
      afterImage: '',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#333333'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Main Title',
        required: true,
        maxLength: 100
      },
      beforeTitle: {
        type: 'text',
        label: 'Before Title',
        required: true,
        maxLength: 50
      },
      beforeContent: {
        type: 'richtext',
        label: 'Before Content',
        required: true,
        maxLength: 800
      },
      afterTitle: {
        type: 'text',
        label: 'After Title',
        required: true,
        maxLength: 50
      },
      afterContent: {
        type: 'richtext',
        label: 'After Content',
        required: true,
        maxLength: 800
      },
      beforeImage: {
        type: 'image',
        label: 'Before Image',
        description: 'Optional image for before state'
      },
      afterImage: {
        type: 'image',
        label: 'After Image',
        description: 'Optional image for after state'
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
      },
      contentColor: {
        type: 'color',
        label: 'Content Color',
        default: '#333333'
      }
    }
  },

  'process-steps': {
    id: 'process-steps',
    name: 'Process Steps',
    description: 'Numbered process or workflow steps with customizable layouts',
    category: 'content',
    icon: '🔄',
    component: ProcessStepsTemplate,
    defaultProps: {
      title: 'Process Steps',
      steps: [
        {
          title: 'Step 1',
          description: 'First step in the process',
          icon: '1️⃣'
        },
        {
          title: 'Step 2',
          description: 'Second step in the process',
          icon: '2️⃣'
        },
        {
          title: 'Step 3',
          description: 'Third step in the process',
          icon: '3️⃣'
        }
      ],
      layout: 'horizontal',
      stepColor: '#007bff',
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
      steps: {
        type: 'array',
        label: 'Process Steps',
        description: 'List of process steps',
        required: true,
        arrayItemType: {
          type: 'text', // This will be expanded to handle the step object structure
          label: 'Step'
        }
      },
      layout: {
        type: 'select',
        label: 'Layout',
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'circular', label: 'Circular' }
        ],
        default: 'horizontal'
      },
      stepColor: {
        type: 'color',
        label: 'Step Color',
        default: '#007bff'
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

// Utility functions for working with the registry

export function getTemplate(templateId: string): TemplateComponentInfo | undefined {
  return SLIDE_TEMPLATE_REGISTRY[templateId];
}

export function getAllTemplates(): TemplateComponentInfo[] {
  return Object.values(SLIDE_TEMPLATE_REGISTRY);
}

export function getTemplatesByCategory(category: string): TemplateComponentInfo[] {
  return getAllTemplates().filter(template => template.category === category);
}

export function getTemplateCategories(): string[] {
  const categories = new Set(getAllTemplates().map(template => template.category));
  return Array.from(categories);
}

export function validateTemplateProps(templateId: string, props: any): { valid: boolean; errors: string[] } {
  const template = getTemplate(templateId);
  if (!template) {
    return { valid: false, errors: [`Template ${templateId} not found`] };
  }

  const errors: string[] = [];
  const schema = template.propSchema;

  // Check required props
  Object.entries(schema).forEach(([key, definition]) => {
    if (definition.required && (props[key] === undefined || props[key] === '')) {
      errors.push(`${definition.label} is required`);
    }

    // Additional validation based on type
    if (props[key] !== undefined && props[key] !== '') {
      const value = props[key];
      
      switch (definition.type) {
        case 'text':
          if (typeof value !== 'string') {
            errors.push(`${definition.label} must be text`);
          } else if (definition.maxLength && value.length > definition.maxLength) {
            errors.push(`${definition.label} must be ${definition.maxLength} characters or less`);
          }
          break;
        
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`${definition.label} must be a number`);
          } else {
            if (definition.min !== undefined && value < definition.min) {
              errors.push(`${definition.label} must be at least ${definition.min}`);
            }
            if (definition.max !== undefined && value > definition.max) {
              errors.push(`${definition.label} must be at most ${definition.max}`);
            }
          }
          break;
        
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${definition.label} must be an array`);
          }
          break;
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

export default SLIDE_TEMPLATE_REGISTRY; 