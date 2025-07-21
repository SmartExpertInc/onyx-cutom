// Example: Creating a new template-based slide deck

import { 
  TemplateBasedSlideDeck, 
  TemplateBasedSlide,
  createDefaultSlideProps 
} from '@/components/slideTemplates';

// Example 1: Creating a simple presentation deck
export function createExampleDeck(): TemplateBasedSlideDeck {
  const deck: TemplateBasedSlideDeck = {
    lessonTitle: 'Introduction to React Templates',
    slides: [],
    detectedLanguage: 'en',
  };

  // Slide 1: Title slide
  const titleSlide: TemplateBasedSlide = {
    slideId: 'slide-1',
    slideNumber: 1,
    templateId: 'title-slide',
    props: {
      slideId: 'slide-1',
      slideNumber: 1,
      title: { 
        text: 'Component-Based Slide Templates', 
        style: 'bold' 
      },
      subtitle: { 
        text: 'A Modern Approach to Presentations' 
      },
    },
  };

  // Slide 2: Bullet points
  const bulletSlide: TemplateBasedSlide = {
    slideId: 'slide-2',
    slideNumber: 2,
    templateId: 'bullet-points',
    props: {
      slideId: 'slide-2',
      slideNumber: 2,
      title: { text: 'Key Benefits' },
      bullets: [
        { text: 'Better maintainability and reusability' },
        { text: 'Type-safe props with TypeScript' },
        { text: 'Consistent styling and layout' },
        { text: 'Easy to extend and customize' },
      ],
      layout: 'single-column',
    },
  };

  // Slide 3: Quote slide
  const quoteSlide: TemplateBasedSlide = {
    slideId: 'slide-3',
    slideNumber: 3,
    templateId: 'quote-center',
    props: {
      slideId: 'slide-3',
      slideNumber: 3,
      quote: { 
        text: 'The best way to predict the future is to create it.' 
      },
      author: { text: 'Peter Drucker' },
    },
  };

  // Slide 4: Two-column comparison
  const comparisonSlide: TemplateBasedSlide = {
    slideId: 'slide-4',
    slideNumber: 4,
    templateId: 'two-column',
    props: {
      slideId: 'slide-4',
      slideNumber: 4,
      title: { text: 'Before vs After' },
      leftColumn: {
        heading: { text: 'Old System' },
        content: { 
          text: 'Generic content blocks with limited layout options and complex rendering logic.' 
        },
      },
      rightColumn: {
        heading: { text: 'New System' },
        content: { 
          text: 'Dedicated React components with precise control over layout, styling, and behavior.' 
        },
      },
    },
  };

  // Slide 5: Big image left
  const imageSlide: TemplateBasedSlide = {
    slideId: 'slide-5',
    slideNumber: 5,
    templateId: 'big-image-left',
    props: {
      slideId: 'slide-5',
      slideNumber: 5,
      title: { text: 'Visual Content Support' },
      image: { 
        description: 'Modern slide design with visual hierarchy',
        src: undefined, // Will show placeholder
      },
      content: { 
        text: 'Templates provide excellent support for visual content with proper image handling and responsive layouts.' 
      },
      bulletPoints: [
        'Responsive image scaling',
        'Placeholder support',
        'Alt text for accessibility',
      ],
    },
  };

  deck.slides = [titleSlide, bulletSlide, quoteSlide, comparisonSlide, imageSlide];
  return deck;
}

// Example 2: Using helper functions
export function createQuickDeck(title: string, templateId: string = 'title-slide'): TemplateBasedSlideDeck {
  const slideProps = createDefaultSlideProps(templateId, 'slide-1', 1);
  
  if (!slideProps) {
    throw new Error(`Invalid template ID: ${templateId}`);
  }

  // Customize the title if it's a title slide
  if (templateId === 'title-slide' && 'title' in slideProps) {
    slideProps.title = { text: title };
  }

  const deck: TemplateBasedSlideDeck = {
    lessonTitle: title,
    slides: [
      {
        slideId: 'slide-1',
        slideNumber: 1,
        templateId,
        props: slideProps,
      }
    ],
  };

  return deck;
}

// Example 3: AI Integration format
export const aiExampleSlide = {
  templateId: 'bullet-points',
  props: {
    title: { text: 'AI-Generated Content' },
    bullets: [
      { text: 'Artificial Intelligence can now generate structured slide content' },
      { text: 'The template system accepts well-defined prop structures' },
      { text: 'This enables seamless AI-to-presentation workflows' },
    ],
    layout: 'single-column',
  }
};

// Example 4: Bulk slide creation
export function createBulkSlides(contents: Array<{
  templateId: string;
  customProps: any;
}>): TemplateBasedSlide[] {
  return contents.map((content, index) => {
    const slideId = `slide-${index + 1}`;
    const slideNumber = index + 1;
    
    const defaultProps = createDefaultSlideProps(content.templateId, slideId, slideNumber);
    
    return {
      slideId,
      slideNumber,
      templateId: content.templateId,
      props: {
        ...defaultProps,
        ...content.customProps,
      },
    };
  });
} 