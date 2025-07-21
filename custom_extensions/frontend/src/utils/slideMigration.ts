// custom_extensions/frontend/src/utils/slideMigration.ts

import { 
  ComponentBasedSlide, 
  ComponentBasedSlideDeck, 
  LegacySlide, 
  MigrationResult,
  TitleSlideProps,
  ContentSlideProps,
  BulletPointsProps,
  TwoColumnProps
} from '@/types/slideTemplates';
import { DeckSlide, SlideDeckData, AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock } from '@/types/pdfLesson';

/**
 * Migrates a legacy slide to a component-based slide
 */
export function migrateLegacySlide(legacySlide: DeckSlide): MigrationResult {
  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Analyze content blocks to determine best template
    const { templateId, props, templateWarnings } = analyzeContentBlocks(
      legacySlide.contentBlocks, 
      legacySlide.slideTitle
    );

    warnings.push(...templateWarnings);

    const componentSlide: ComponentBasedSlide = {
      slideId: legacySlide.slideId,
      slideNumber: legacySlide.slideNumber,
      templateId,
      props: {
        ...props,
        slideId: legacySlide.slideId
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '2.0',
        notes: `Migrated from legacy slide with ${legacySlide.contentBlocks.length} content blocks`
      }
    };

    return {
      success: true,
      slide: componentSlide,
      errors,
      warnings
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

/**
 * Migrates a complete legacy slide deck to component-based format
 */
export function migrateLegacySlideDeck(legacyDeck: SlideDeckData): {
  success: boolean;
  deck?: ComponentBasedSlideDeck;
  results: MigrationResult[];
} {
  const results: MigrationResult[] = [];
  const migratedSlides: ComponentBasedSlide[] = [];

  for (const legacySlide of legacyDeck.slides) {
    const result = migrateLegacySlide(legacySlide);
    results.push(result);
    
    if (result.success && result.slide) {
      migratedSlides.push(result.slide);
    }
  }

  const allSuccessful = results.every(r => r.success);

  if (allSuccessful) {
    const componentDeck: ComponentBasedSlideDeck = {
      lessonTitle: legacyDeck.lessonTitle,
      slides: migratedSlides,
      currentSlideId: legacyDeck.currentSlideId,
      lessonNumber: legacyDeck.lessonNumber,
      detectedLanguage: legacyDeck.detectedLanguage,
      templateVersion: '2.0',
      metadata: {
        createdAt: new Date().toISOString(),
        author: 'Migration Tool',
        description: `Migrated from legacy format with ${legacyDeck.slides.length} slides`
      }
    };

    return {
      success: true,
      deck: componentDeck,
      results
    };
  }

  return {
    success: false,
    results
  };
}

/**
 * Analyzes legacy content blocks to determine the best template and extract props
 */
function analyzeContentBlocks(contentBlocks: AnyContentBlock[], slideTitle: string): {
  templateId: string;
  props: Record<string, any>;
  templateWarnings: string[];
} {
  const warnings: string[] = [];

  // No content blocks - default to content slide
  if (contentBlocks.length === 0) {
    return {
      templateId: 'content-slide',
      props: {
        title: slideTitle,
        content: 'Empty slide content'
      },
      templateWarnings: ['Slide had no content blocks']
    };
  }

  // Title slide detection - only headlines
  if (contentBlocks.every(block => block.type === 'headline')) {
    const headlines = contentBlocks as HeadlineBlock[];
    const titleProps: Partial<TitleSlideProps> = {
      title: headlines[0]?.text || slideTitle,
      subtitle: headlines[1]?.text || '',
      author: headlines[2]?.text || '',
      date: headlines[3]?.text || ''
    };

    return {
      templateId: 'title-slide',
      props: titleProps,
      templateWarnings: headlines.length > 4 ? ['Title slide had more than 4 headlines - extras ignored'] : []
    };
  }

  // Bullet points detection
  if (contentBlocks.length === 2 && 
      contentBlocks[0].type === 'headline' && 
      contentBlocks[1].type === 'bullet_list') {
    
    const headline = contentBlocks[0] as HeadlineBlock;
    const bulletList = contentBlocks[1] as BulletListBlock;
    
    const bulletProps: Partial<BulletPointsProps> = {
      title: headline.text,
      bullets: bulletList.items.map(item => 
        typeof item === 'string' ? item : 'Complex bullet item'
      ),
      maxColumns: bulletList.items.length > 6 ? 3 : bulletList.items.length > 3 ? 2 : 1,
      bulletStyle: 'dot'
    };

    return {
      templateId: 'bullet-points',
      props: bulletProps,
      templateWarnings: bulletList.items.some(item => typeof item !== 'string') ? 
        ['Some bullet items were complex objects and were simplified'] : []
    };
  }

  // Two-column detection - multiple h2 headlines with content
  const h2Headlines = contentBlocks.filter(block => 
    block.type === 'headline' && (block as HeadlineBlock).level === 2
  );

  if (h2Headlines.length >= 2 && contentBlocks.length >= 5) {
    const mainTitle = contentBlocks.find(block => 
      block.type === 'headline' && (block as HeadlineBlock).level === 1
    ) as HeadlineBlock;

    const leftTitle = h2Headlines[0] as HeadlineBlock;
    const rightTitle = h2Headlines[1] as HeadlineBlock;

    // Find content after each h2
    const leftContentBlocks: string[] = [];
    const rightContentBlocks: string[] = [];
    
    let currentSection = 'none';
    
    for (const block of contentBlocks) {
      if (block.type === 'headline' && (block as HeadlineBlock).level === 1) continue;
      
      if (block === leftTitle) {
        currentSection = 'left';
        continue;
      }
      if (block === rightTitle) {
        currentSection = 'right';
        continue;
      }
      
      const textContent = extractTextFromBlock(block);
      if (currentSection === 'left') {
        leftContentBlocks.push(textContent);
      } else if (currentSection === 'right') {
        rightContentBlocks.push(textContent);
      }
    }

    const twoColumnProps: Partial<TwoColumnProps> = {
      title: mainTitle?.text || slideTitle,
      leftTitle: leftTitle.text,
      leftContent: leftContentBlocks.join('\n\n'),
      rightTitle: rightTitle.text,
      rightContent: rightContentBlocks.join('\n\n'),
      columnRatio: '50-50'
    };

    return {
      templateId: 'two-column',
      props: twoColumnProps,
      templateWarnings: []
    };
  }

  // Default: content slide
  const title = contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const contentBlocks_filtered = contentBlocks.filter(block => block !== title);
  const content = contentBlocks_filtered.map(block => extractTextFromBlock(block)).join('\n\n');

  const contentProps: Partial<ContentSlideProps> = {
    title: title?.text || slideTitle,
    content: content || 'No content available',
    alignment: 'left'
  };

  return {
    templateId: 'content-slide',
    props: contentProps,
    templateWarnings: contentBlocks.length > 10 ? ['Content slide had many blocks - formatting may be simplified'] : []
  };
}

/**
 * Extracts text content from any content block type
 */
function extractTextFromBlock(block: AnyContentBlock): string {
  switch (block.type) {
    case 'headline':
      return (block as HeadlineBlock).text;
    
    case 'paragraph':
      return (block as ParagraphBlock).text;
    
    case 'bullet_list':
      const bulletList = block as BulletListBlock;
      return bulletList.items.map((item, index) => 
        `• ${typeof item === 'string' ? item : 'Complex item'}`
      ).join('\n');
    
    case 'numbered_list':
      const numberedList = block as NumberedListBlock;
      return numberedList.items.map((item, index) => 
        `${index + 1}. ${typeof item === 'string' ? item : 'Complex item'}`
      ).join('\n');
    
    case 'alert':
      const alert = block as any; // AlertBlock
      return `${alert.title ? alert.title + ': ' : ''}${alert.text}`;
    
    case 'section_break':
      return '---';
    
    default:
      return 'Unknown content block';
  }
}

/**
 * Creates a new component-based slide with default values
 */
export function createNewComponentSlide(templateId: string, slideNumber: number): ComponentBasedSlide {
  const slideId = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Get default props from registry
  const defaultProps = getDefaultPropsForTemplate(templateId);
  
  return {
    slideId,
    slideNumber,
    templateId,
    props: {
      ...defaultProps,
      slideId
    },
    metadata: {
      createdAt: new Date().toISOString(),
      version: '2.0'
    }
  };
}

/**
 * Gets default props for a given template ID
 */
function getDefaultPropsForTemplate(templateId: string): Record<string, any> {
  // This would ideally come from the registry, but for now we'll define defaults here
  const defaults: Record<string, Record<string, any>> = {
    'title-slide': {
      title: 'New Title Slide',
      subtitle: 'Subtitle goes here',
      author: '',
      date: '',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#666666'
    },
    'content-slide': {
      title: 'New Content Slide',
      content: 'Your content goes here...',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#333333',
      alignment: 'left'
    },
    'bullet-points': {
      title: 'Key Points',
      bullets: ['First point', 'Second point', 'Third point'],
      maxColumns: 1,
      bulletStyle: 'dot',
      titleColor: '#1a1a1a',
      bulletColor: '#333333',
      backgroundColor: '#ffffff'
    },
    'two-column': {
      title: 'Two Column Layout',
      leftTitle: 'Left Column',
      leftContent: 'Left content goes here',
      rightTitle: 'Right Column',
      rightContent: 'Right content goes here',
      columnRatio: '50-50',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#333333'
    }
  };

  return defaults[templateId] || defaults['content-slide'];
}

/**
 * Validates that a component-based slide deck is properly formatted
 */
export function validateComponentSlideDeck(deck: ComponentBasedSlideDeck): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!deck.lessonTitle) {
    errors.push('Lesson title is required');
  }

  if (!deck.slides || deck.slides.length === 0) {
    errors.push('Deck must have at least one slide');
  }

  // Check each slide
  deck.slides.forEach((slide, index) => {
    if (!slide.slideId) {
      errors.push(`Slide ${index + 1} is missing slideId`);
    }

    if (!slide.templateId) {
      errors.push(`Slide ${index + 1} is missing templateId`);
    }

    if (!slide.props) {
      errors.push(`Slide ${index + 1} is missing props`);
    }

    if (slide.slideNumber !== index + 1) {
      warnings.push(`Slide ${index + 1} has incorrect slideNumber: ${slide.slideNumber}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
} 