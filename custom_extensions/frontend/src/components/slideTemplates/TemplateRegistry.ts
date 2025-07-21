// Template Registry - Maps template IDs to React components
import { 
  TemplateDefinition, 
  BaseTemplateProps,
  TitleSlideProps,
  BigImageLeftProps,
  QuoteCenterProps,
  BulletPointsProps,
  TwoColumnProps,
  AnyTemplateProps
} from '@/types/slideTemplates';

// Import template components
import TitleSlide from './TitleSlide';
import BigImageLeft from './BigImageLeft';
import QuoteCenter from './QuoteCenter';
import BulletPoints from './BulletPoints';
import TwoColumn from './TwoColumn';

// Template definitions with default props
export const TEMPLATE_DEFINITIONS: Record<string, TemplateDefinition> = {
  'title-slide': {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Large title with optional subtitle and background image',
    category: 'presentation',
    component: TitleSlide,
    defaultProps: {
      title: { text: 'Presentation Title', style: 'bold' },
      subtitle: { text: 'Subtitle or Key Message' },
    } as Omit<TitleSlideProps, 'slideId' | 'slideNumber'>,
  },

  'big-image-left': {
    id: 'big-image-left',
    name: 'Big Image Left',
    description: 'Large image on the left with content and optional bullets on the right',
    category: 'content',
    component: BigImageLeft,
    defaultProps: {
      title: { text: 'Content Title' },
      image: { description: 'Featured image placeholder' },
      content: { text: 'Main content description goes here. This layout is perfect for showcasing visual content alongside explanatory text.' },
      bulletPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
    } as Omit<BigImageLeftProps, 'slideId' | 'slideNumber'>,
  },

  'quote-center': {
    id: 'quote-center',
    name: 'Quote Center',
    description: 'Centered quote with attribution and optional background',
    category: 'special',
    component: QuoteCenter,
    defaultProps: {
      quote: { text: 'This is an inspiring quote that captures the essence of your message.' },
      author: { text: 'Author Name' },
    } as Omit<QuoteCenterProps, 'slideId' | 'slideNumber'>,
  },

  'bullet-points': {
    id: 'bullet-points',
    name: 'Bullet Points',
    description: 'Title with numbered bullet points in single or two-column layout',
    category: 'content',
    component: BulletPoints,
    defaultProps: {
      title: { text: 'Key Points' },
      bullets: [
        { text: 'First important point to highlight' },
        { text: 'Second key message for your audience' },
        { text: 'Third critical insight to share' },
        { text: 'Fourth valuable takeaway' },
      ],
      layout: 'single-column',
    } as Omit<BulletPointsProps, 'slideId' | 'slideNumber'>,
  },

  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    description: 'Side-by-side content layout with optional headings and images',
    category: 'content',
    component: TwoColumn,
    defaultProps: {
      title: { text: 'Comparison or Side-by-Side Content' },
      leftColumn: {
        heading: { text: 'Left Section' },
        content: { text: 'Content for the left column goes here. This side can contain text, images, or a combination of both.' },
      },
      rightColumn: {
        heading: { text: 'Right Section' },
        content: { text: 'Content for the right column goes here. This layout is great for comparisons, before/after scenarios, or complementary information.' },
      },
    } as Omit<TwoColumnProps, 'slideId' | 'slideNumber'>,
  },
};

// Helper functions for template registry
export function getTemplate(templateId: string): TemplateDefinition | null {
  return TEMPLATE_DEFINITIONS[templateId] || null;
}

export function getAllTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_DEFINITIONS);
}

export function getTemplatesByCategory(category: 'presentation' | 'content' | 'special'): TemplateDefinition[] {
  return getAllTemplates().filter(template => template.category === category);
}

export function createDefaultSlideProps(templateId: string, slideId: string, slideNumber: number): AnyTemplateProps | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  return {
    slideId,
    slideNumber,
    ...template.defaultProps,
  } as AnyTemplateProps;
}

// Validation function to check if props match template requirements
export function validateTemplateProps(templateId: string, props: any): boolean {
  const template = getTemplate(templateId);
  if (!template) return false;

  // Basic validation - check if required base props are present
  if (!props.slideId || typeof props.slideNumber !== 'number') {
    return false;
  }

  // Template-specific validation could be added here
  switch (templateId) {
    case 'title-slide':
      return !!(props.title?.text);
    
    case 'big-image-left':
      return !!(props.title?.text && props.image && props.content?.text);
    
    case 'quote-center':
      return !!(props.quote?.text);
    
    case 'bullet-points':
      return !!(props.title?.text && Array.isArray(props.bullets));
    
    case 'two-column':
      return !!(props.title?.text && props.leftColumn?.content?.text && props.rightColumn?.content?.text);
    
    default:
      return true;
  }
}

// Migration helper - converts old content blocks to new template props
export function migrateContentBlocksToTemplate(contentBlocks: any[]): { templateId: string; props: Partial<AnyTemplateProps> } | null {
  if (!contentBlocks || contentBlocks.length === 0) {
    return null;
  }

  // Simple migration logic based on content block patterns
  const hasTitle = contentBlocks.some(block => block.type === 'headline');
  const hasParagraph = contentBlocks.some(block => block.type === 'paragraph');
  const hasBullets = contentBlocks.some(block => block.type === 'bullet_list');
  const hasNumbered = contentBlocks.some(block => block.type === 'numbered_list');

  // Title slide - only headlines
  if (contentBlocks.every(block => block.type === 'headline')) {
    const titles = contentBlocks.filter(block => block.type === 'headline');
    return {
      templateId: 'title-slide',
      props: {
        title: { text: titles[0]?.text || 'Untitled' },
        subtitle: titles[1] ? { text: titles[1].text } : undefined,
      },
    };
  }

  // Quote center - paragraph with quote-like content
  if (contentBlocks.length <= 2 && hasParagraph) {
    const paragraph = contentBlocks.find(block => block.type === 'paragraph');
    if (paragraph?.text.includes('"') || paragraph?.text.toLowerCase().includes('quote')) {
      return {
        templateId: 'quote-center',
        props: {
          quote: { text: paragraph.text },
          author: hasTitle ? { text: contentBlocks.find(block => block.type === 'headline')?.text } : undefined,
        },
      };
    }
  }

  // Bullet points
  if (hasBullets) {
    const title = contentBlocks.find(block => block.type === 'headline');
    const bullets = contentBlocks.find(block => block.type === 'bullet_list');
    return {
      templateId: 'bullet-points',
      props: {
        title: { text: title?.text || 'Key Points' },
        bullets: bullets?.items?.map((item: any) => ({ text: typeof item === 'string' ? item : 'Bullet point' })) || [],
        layout: bullets?.items?.length > 4 ? 'two-column' : 'single-column',
      },
    };
  }

  // Default to title + content template
  const title = contentBlocks.find(block => block.type === 'headline');
  const content = contentBlocks.find(block => block.type === 'paragraph');
  
  if (title && content) {
    return {
      templateId: 'big-image-left',
      props: {
        title: { text: title.text },
        image: { description: 'Content image placeholder' },
        content: { text: content.text },
      },
    };
  }

  return null;
} 