// custom_extensions/frontend/src/utils/slideMigration.ts

import { 
  ComponentBasedSlide, 
  ComponentBasedSlideDeck, 
  LegacySlide, 
  MigrationResult,
  TitleSlideProps,
  ContentSlideProps,
  BulletPointsProps,
  TwoColumnProps,
  ChallengesSolutionsProps,
  HeroTitleSlideProps,
  ImageComparisonProps
} from '@/types/slideTemplates';
import { DeckSlide, SlideDeckData, AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock } from '@/types/pdfLesson';

/**
 * Migrates a legacy slide to a component-based slide
 */
export function migrateLegacySlide(legacySlide: DeckSlide): MigrationResult {
  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if slide already has a templateId from AI-generated content
    let templateId: string;
    let props: Record<string, any>;
    let templateWarnings: string[] = [];

    if (legacySlide.templateId) {
      // Use the templateId from AI-generated content
      templateId = legacySlide.templateId;
      props = extractPropsFromLegacySlide(legacySlide, templateId);
      warnings.push(`Using AI-specified template: ${templateId}`);
    } else {
      // Fallback to auto-detection based on content analysis
      const analysis = analyzeContentBlocks(legacySlide.contentBlocks, legacySlide.slideTitle);
      templateId = analysis.templateId;
      props = analysis.props;
      templateWarnings = analysis.templateWarnings;
      warnings.push(`Auto-detected template: ${templateId}`);
    }

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

  // Hero Title slide detection - headline + paragraph (like from original HTML)
  if (contentBlocks.length === 2 && 
      contentBlocks[0].type === 'headline' && 
      contentBlocks[1].type === 'paragraph') {
    
    const headline = contentBlocks[0] as HeadlineBlock;
    const paragraph = contentBlocks[1] as ParagraphBlock;
    
    // Check if this looks like a hero title slide with detailed description
    if (headline.level === 1 && paragraph.text.length > 50) {
      const heroProps: Partial<HeroTitleSlideProps> = {
        title: headline.text,
        subtitle: paragraph.text,
        showAccent: true,
        accentPosition: 'left',
        textAlign: 'center'
      };

      return {
        templateId: 'hero-title-slide',
        props: heroProps,
        templateWarnings: []
      };
    }
  }

  // Title slide detection - only headlines (multiple)
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

  // Challenges-Solutions detection - detect problem/solution patterns
  const h2Headlines = contentBlocks.filter(block => 
    block.type === 'headline' && (block as HeadlineBlock).level === 2
  );

  if (h2Headlines.length >= 2 && contentBlocks.length >= 5) {
    const mainTitle = contentBlocks.find(block => 
      block.type === 'headline' && (block as HeadlineBlock).level === 1
    ) as HeadlineBlock;

    const leftTitle = h2Headlines[0] as HeadlineBlock;
    const rightTitle = h2Headlines[1] as HeadlineBlock;

    // Check if this looks like challenges vs solutions
    const isChallengesSolutions = 
      (leftTitle.text.toLowerCase().includes('виклик') || 
       leftTitle.text.toLowerCase().includes('проблем') || 
       leftTitle.text.toLowerCase().includes('challenge') ||
       leftTitle.text.toLowerCase().includes('problem')) &&
      (rightTitle.text.toLowerCase().includes('рішення') || 
       rightTitle.text.toLowerCase().includes('вирішення') || 
       rightTitle.text.toLowerCase().includes('solution') ||
       rightTitle.text.toLowerCase().includes('розв\'язок'));

    if (isChallengesSolutions) {
      // Extract bullet points for challenges and solutions
      const challenges: string[] = [];
      const solutions: string[] = [];
      
      let currentSection = 'none';
      
      for (const block of contentBlocks) {
        if (block.type === 'headline' && (block as HeadlineBlock).level === 1) continue;
        
        if (block === leftTitle) {
          currentSection = 'challenges';
          continue;
        }
        if (block === rightTitle) {
          currentSection = 'solutions';
          continue;
        }
        
        if (block.type === 'bullet_list') {
          const bulletList = block as BulletListBlock;
          const items = bulletList.items.map(item => 
            typeof item === 'string' ? item : 'Complex item'
          );
          
          if (currentSection === 'challenges') {
            challenges.push(...items);
          } else if (currentSection === 'solutions') {
            solutions.push(...items);
          }
        } else if (block.type === 'paragraph') {
          const paragraphText = (block as ParagraphBlock).text;
          if (currentSection === 'challenges') {
            challenges.push(paragraphText);
          } else if (currentSection === 'solutions') {
            solutions.push(paragraphText);
          }
        }
      }

      if (challenges.length > 0 && solutions.length > 0) {
        const challengesSolutionsProps: Partial<ChallengesSolutionsProps> = {
          title: mainTitle?.text || slideTitle,
          challengesTitle: leftTitle.text,
          solutionsTitle: rightTitle.text,
          challenges,
          solutions
        };

        return {
          templateId: 'challenges-solutions',
          props: challengesSolutionsProps,
          templateWarnings: []
        };
      }
    }

    // Check if this looks like image comparison (grid layout with images)
    // Look for pattern: main title, two H3 titles with paragraphs (suggests image-rich comparison)
    if (leftTitle.level === 3 && rightTitle.level === 3) {
      // Extract paragraphs for each section
      const leftParagraphs: string[] = [];
      const rightParagraphs: string[] = [];
      
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
        
        if (block.type === 'paragraph') {
          const paragraphText = (block as ParagraphBlock).text;
          if (currentSection === 'left') {
            leftParagraphs.push(paragraphText);
          } else if (currentSection === 'right') {
            rightParagraphs.push(paragraphText);
          }
        }
      }

      if (leftParagraphs.length > 0 && rightParagraphs.length > 0) {
        const imageComparisonProps: Partial<ImageComparisonProps> = {
          title: mainTitle?.text || slideTitle,
          leftTitle: leftTitle.text,
          leftDescription: leftParagraphs.join('\n\n'),
          leftImage: 'https://via.placeholder.com/400x200?text=Left+Content',
          rightTitle: rightTitle.text,
          rightDescription: rightParagraphs.join('\n\n'),
          rightImage: 'https://via.placeholder.com/400x200?text=Right+Content'
        };

        return {
          templateId: 'image-comparison',
          props: imageComparisonProps,
          templateWarnings: ['Images set to placeholder - please update with actual images']
        };
      }
    }

    // Fallback to regular two-column if not image-comparison
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
    },
    'challenges-solutions': {
      title: 'Виклики та Рішення',
      challengesTitle: 'Виклики',
      solutionsTitle: 'Рішення',
      challenges: ['Перший виклик', 'Другий виклик', 'Третій виклик'],
      solutions: ['Перше рішення', 'Друге рішення', 'Третє рішення'],
      challengeColor: '#fef2f2',
      solutionColor: '#f0fdf4',
      challengeIconColor: '#dc2626',
      solutionIconColor: '#16a34a',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#374151'
    },
    'hero-title-slide': {
      title: 'Новий Hero Title Slide',
      subtitle: 'Детальний опис або підзаголовок що пояснює основну ідею презентації',
      showAccent: true,
      accentColor: '#3b82f6',
      accentPosition: 'left',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#6b7280',
      textAlign: 'center',
      titleSize: 'xlarge',
      subtitleSize: 'medium'
    },
    'image-comparison': {
      title: 'Порівняльний Слайд із Зображеннями',
      leftTitle: 'Ліва Сторона',
      leftDescription: 'Опис лівої частини порівняння з детальним поясненням',
      leftImage: 'https://via.placeholder.com/400x200?text=Left+Image',
      rightTitle: 'Права Сторона',
      rightDescription: 'Опис правої частини порівняння з детальним поясненням',
      rightImage: 'https://via.placeholder.com/400x200?text=Right+Image',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#2d3748',
      descriptionColor: '#4a5568',
      columnGap: 'medium',
      imageHeight: '200px',
      showImageBorder: true,
      imageBorderColor: '#e2e8f0'
    }
  };

  return defaults[templateId] || defaults['content-slide'];
}

/**
 * Extracts appropriate props for a specific template from legacy slide content
 */
function extractPropsFromLegacySlide(legacySlide: DeckSlide, templateId: string): Record<string, any> {
  const baseProps = {
    slideId: legacySlide.slideId
  };

  // Get default props for the template
  const defaultProps = getDefaultPropsForTemplate(templateId);

  // Extract content based on template type
  switch (templateId) {
    case 'hero-title-slide':
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        subtitle: extractSubtitleFromContent(legacySlide.contentBlocks) || defaultProps.subtitle,
        showAccent: true,
        accentColor: '#3b82f6',
        accentPosition: 'left',
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        subtitleColor: '#6b7280',
        textAlign: 'center',
        titleSize: 'xlarge',
        subtitleSize: 'medium'
      };

    case 'title-slide':
      const headlines = legacySlide.contentBlocks.filter(block => block.type === 'headline') as HeadlineBlock[];
      return {
        ...baseProps,
        title: headlines[0]?.text || legacySlide.slideTitle,
        subtitle: headlines[1]?.text || '',
        author: headlines[2]?.text || '',
        date: headlines[3]?.text || '',
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        subtitleColor: '#666666'
      };

    case 'bullet-points':
      const bulletList = legacySlide.contentBlocks.find(block => block.type === 'bullet_list') as BulletListBlock;
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        bullets: bulletList?.items?.map(item => typeof item === 'string' ? item : 'Bullet point') || ['Key point 1', 'Key point 2', 'Key point 3'],
        maxColumns: bulletList?.items?.length > 6 ? 3 : bulletList?.items?.length > 3 ? 2 : 1,
        bulletStyle: 'dot',
        titleColor: '#1a1a1a',
        bulletColor: '#333333',
        backgroundColor: '#ffffff'
      };

    case 'two-column':
      const twoColumnContent = extractTwoColumnContent(legacySlide.contentBlocks);
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        leftTitle: twoColumnContent.leftTitle || 'Left Column',
        leftContent: twoColumnContent.leftContent || 'Left content goes here',
        rightTitle: twoColumnContent.rightTitle || 'Right Column',
        rightContent: twoColumnContent.rightContent || 'Right content goes here',
        columnRatio: '50-50',
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        contentColor: '#333333'
      };

    case 'challenges-solutions':
      const challengesSolutions = extractChallengesSolutionsContent(legacySlide.contentBlocks);
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        challengesTitle: 'Challenges',
        solutionsTitle: 'Solutions',
        challenges: challengesSolutions.challenges || ['Challenge 1', 'Challenge 2'],
        solutions: challengesSolutions.solutions || ['Solution 1', 'Solution 2'],
        challengeColor: '#fef2f2',
        solutionColor: '#f0fdf4',
        challengeIconColor: '#dc2626',
        solutionIconColor: '#16a34a',
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        contentColor: '#374151'
      };

    case 'image-comparison':
      const comparisonContent = extractImageComparisonContent(legacySlide.contentBlocks);
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        leftTitle: comparisonContent.leftTitle || 'Option A',
        leftDescription: comparisonContent.leftDescription || 'Description for option A',
        leftImage: 'https://via.placeholder.com/400x200?text=Image+A',
        rightTitle: comparisonContent.rightTitle || 'Option B',
        rightDescription: comparisonContent.rightDescription || 'Description for option B',
        rightImage: 'https://via.placeholder.com/400x200?text=Image+B',
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        subtitleColor: '#2d3748',
        descriptionColor: '#4a5568',
        columnGap: 'medium',
        imageHeight: '200px',
        showImageBorder: true,
        imageBorderColor: '#e2e8f0'
      };

    case 'content-slide':
    default:
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        content: extractTextContent(legacySlide.contentBlocks),
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        contentColor: '#333333',
        alignment: 'left'
      };
  }
}

/**
 * Helper function to extract subtitle from content blocks
 */
function extractSubtitleFromContent(contentBlocks: AnyContentBlock[]): string | null {
  // Look for the first paragraph or second headline
  const paragraph = contentBlocks.find(block => block.type === 'paragraph') as ParagraphBlock;
  if (paragraph) return paragraph.text;

  const headlines = contentBlocks.filter(block => block.type === 'headline') as HeadlineBlock[];
  if (headlines.length > 1) return headlines[1].text;

  return null;
}

/**
 * Helper function to extract text content from blocks
 */
function extractTextContent(contentBlocks: AnyContentBlock[]): string {
  return contentBlocks
    .filter(block => block.type !== 'headline') // Skip main titles
    .map(block => {
      switch (block.type) {
        case 'paragraph':
          return (block as ParagraphBlock).text;
        case 'bullet_list':
          return (block as BulletListBlock).items
            .map(item => typeof item === 'string' ? `• ${item}` : '• List item')
            .join('\n');
        case 'numbered_list':
          return (block as NumberedListBlock).items
            .map((item, index) => typeof item === 'string' ? `${index + 1}. ${item}` : `${index + 1}. List item`)
            .join('\n');
        default:
          return '';
      }
    })
    .filter(text => text.trim())
    .join('\n\n') || 'No content available';
}

/**
 * Helper function to extract two-column content structure
 */
function extractTwoColumnContent(contentBlocks: AnyContentBlock[]): {
  leftTitle: string | null;
  leftContent: string | null;
  rightTitle: string | null;
  rightContent: string | null;
} {
  const headlines = contentBlocks.filter(block => block.type === 'headline' && (block as HeadlineBlock).level >= 2) as HeadlineBlock[];
  
  if (headlines.length >= 2) {
    const leftTitle = headlines[0].text;
    const rightTitle = headlines[1].text;
    
    // Try to extract content between headlines
    const leftContent = extractContentBetweenHeadlines(contentBlocks, headlines[0], headlines[1]);
    const rightContent = extractContentAfterHeadline(contentBlocks, headlines[1]);
    
    return { leftTitle, leftContent, rightTitle, rightContent };
  }

  return { leftTitle: null, leftContent: null, rightTitle: null, rightContent: null };
}

/**
 * Helper function to extract challenges and solutions content
 */
function extractChallengesSolutionsContent(contentBlocks: AnyContentBlock[]): {
  challenges: string[] | null;
  solutions: string[] | null;
} {
  // Look for bullet lists that could represent challenges/solutions
  const bulletLists = contentBlocks.filter(block => block.type === 'bullet_list') as BulletListBlock[];
  
  if (bulletLists.length >= 2) {
    const challenges = bulletLists[0].items.map(item => typeof item === 'string' ? item : 'Challenge item');
    const solutions = bulletLists[1].items.map(item => typeof item === 'string' ? item : 'Solution item');
    return { challenges, solutions };
  } else if (bulletLists.length === 1) {
    const items = bulletLists[0].items.map(item => typeof item === 'string' ? item : 'Item');
    // Try to split items into challenges and solutions
    const mid = Math.ceil(items.length / 2);
    return { 
      challenges: items.slice(0, mid),
      solutions: items.slice(mid)
    };
  }

  return { challenges: null, solutions: null };
}

/**
 * Helper function to extract image comparison content
 */
function extractImageComparisonContent(contentBlocks: AnyContentBlock[]): {
  leftTitle: string | null;
  leftDescription: string | null;
  rightTitle: string | null;
  rightDescription: string | null;
} {
  // Similar to two-column but focused on comparison content
  const twoColContent = extractTwoColumnContent(contentBlocks);
  return {
    leftTitle: twoColContent.leftTitle,
    leftDescription: twoColContent.leftContent,
    rightTitle: twoColContent.rightTitle,
    rightDescription: twoColContent.rightContent
  };
}

/**
 * Helper function to extract content between two headlines
 */
function extractContentBetweenHeadlines(contentBlocks: AnyContentBlock[], startHeadline: HeadlineBlock, endHeadline: HeadlineBlock): string | null {
  const startIndex = contentBlocks.indexOf(startHeadline);
  const endIndex = contentBlocks.indexOf(endHeadline);
  
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return null;
  
  const betweenBlocks = contentBlocks.slice(startIndex + 1, endIndex);
  return extractTextContent(betweenBlocks) || null;
}

/**
 * Helper function to extract content after a headline
 */
function extractContentAfterHeadline(contentBlocks: AnyContentBlock[], headline: HeadlineBlock): string | null {
  const index = contentBlocks.indexOf(headline);
  if (index === -1 || index >= contentBlocks.length - 1) return null;
  
  const afterBlocks = contentBlocks.slice(index + 1);
  return extractTextContent(afterBlocks) || null;
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