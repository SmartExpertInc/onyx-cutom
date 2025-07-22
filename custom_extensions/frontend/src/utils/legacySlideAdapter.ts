// utils/legacySlideAdapter.ts
// Adapter to convert legacy DeckGo slides to component-based slides

import { DeckSlide, SlideDeckData } from '@/types/pdfLesson';
import { ComponentBasedSlide, ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { migrateLegacySlideDeck } from './slideMigration';

/**
 * Converts legacy slides with deckgoTemplate to component-based format
 */
export function adaptLegacySlideDeck(legacyDeck: SlideDeckData): ComponentBasedSlideDeck {
  // Use our existing migration logic
  const migrationResult = migrateLegacySlideDeck(legacyDeck);
  
  if (migrationResult.success) {
    return migrationResult.deck!;
  }
  
  // Fallback: create a basic component deck if migration fails
  return {
    lessonTitle: legacyDeck.lessonTitle,
    slides: legacyDeck.slides.map(adaptLegacySlide),
    currentSlideId: legacyDeck.currentSlideId,
    lessonNumber: legacyDeck.lessonNumber,
    detectedLanguage: legacyDeck.detectedLanguage
  };
}

/**
 * Converts a single legacy slide to component-based format
 */
export function adaptLegacySlide(legacySlide: DeckSlide, index: number = 0): ComponentBasedSlide {
  // Map DeckGo templates to our component templates
  const templateId = mapDeckGoToComponent(legacySlide.deckgoTemplate);
  
  // Basic props based on template
  const props = generatePropsForTemplate(templateId, legacySlide);
  
  return {
    slideId: legacySlide.slideId,
    slideNumber: legacySlide.slideNumber,
    templateId,
    props
  };
}

/**
 * Maps DeckGo template names to our component template IDs
 */
function mapDeckGoToComponent(deckgoTemplate?: string): string {
  switch (deckgoTemplate) {
    case 'deckgo-slide-title':
      return 'hero-title-slide';
    case 'deckgo-slide-content':
      return 'content-slide';
    case 'deckgo-slide-split':
      return 'image-comparison';
    case 'deckgo-slide-chart':
      return 'content-slide';
    default:
      return 'content-slide'; // Default fallback
  }
}

/**
 * Generates props for a template based on legacy slide content
 */
function generatePropsForTemplate(templateId: string, legacySlide: DeckSlide): any {
  const baseProps = {
    slideId: legacySlide.slideId
  };

  switch (templateId) {
    case 'hero-title-slide':
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        subtitle: extractSubtitle(legacySlide) || 'Detailed presentation overview and learning objectives',
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

    case 'image-comparison':
      const comparison = extractComparisonContent(legacySlide);
      return {
        ...baseProps,
        title: legacySlide.slideTitle,
        leftTitle: comparison.leftTitle,
        leftDescription: comparison.leftDescription,
        leftImage: 'https://via.placeholder.com/400x200?text=Left+Content',
        rightTitle: comparison.rightTitle,
        rightDescription: comparison.rightDescription,
        rightImage: 'https://via.placeholder.com/400x200?text=Right+Content',
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
        content: extractContentText(legacySlide),
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        contentColor: '#374151',
        showDivider: true,
        dividerColor: '#e5e7eb'
      };
  }
}

/**
 * Extracts subtitle from legacy slide content blocks
 */
function extractSubtitle(legacySlide: DeckSlide): string | null {
  for (const block of legacySlide.contentBlocks) {
    if (block.type === 'headline' && (block as any).level === 2) {
      return (block as any).text;
    }
    if (block.type === 'paragraph' && legacySlide.contentBlocks.indexOf(block) <= 1) {
      return (block as any).text;
    }
  }
  return null;
}

/**
 * Extracts comparison content for split layouts
 */
function extractComparisonContent(legacySlide: DeckSlide): {
  leftTitle: string;
  leftDescription: string;
  rightTitle: string;
  rightDescription: string;
} {
  const headlines = legacySlide.contentBlocks
    .filter(block => block.type === 'headline')
    .map(block => (block as any).text);
  
  const paragraphs = legacySlide.contentBlocks
    .filter(block => block.type === 'paragraph')
    .map(block => (block as any).text);

  return {
    leftTitle: headlines[1] || 'Option A',
    leftDescription: paragraphs[0] || 'Description for the first option or approach',
    rightTitle: headlines[2] || 'Option B', 
    rightDescription: paragraphs[1] || 'Description for the second option or approach'
  };
}

/**
 * Extracts main content text from legacy slide
 */
function extractContentText(legacySlide: DeckSlide): string {
  const contentParts: string[] = [];
  
  for (const block of legacySlide.contentBlocks) {
    if (block.type === 'paragraph') {
      contentParts.push((block as any).text);
    } else if (block.type === 'bullet_list') {
      const items = (block as any).items || [];
      contentParts.push(items.map((item: any) => `• ${item}`).join('\n'));
    } else if (block.type === 'numbered_list') {
      const items = (block as any).items || [];
      contentParts.push(items.map((item: any, idx: number) => `${idx + 1}. ${item}`).join('\n'));
    }
  }
  
  return contentParts.join('\n\n') || 'Content description and main points for this slide.';
}

/**
 * Check if a slide deck needs legacy adaptation
 */
export function needsLegacyAdaptation(deck: any): boolean {
  return deck && deck.slides && deck.slides.some((slide: any) => 
    slide.hasOwnProperty('deckgoTemplate') || 
    slide.hasOwnProperty('contentBlocks')
  );
}

/**
 * Smart detection of slide deck format
 */
export function detectSlideDeckFormat(deck: any): 'legacy' | 'component' | 'unknown' {
  if (!deck || !deck.slides || !Array.isArray(deck.slides) || deck.slides.length === 0) {
    return 'unknown';
  }
  
  const firstSlide = deck.slides[0];
  
  // Check for component-based format
  if (firstSlide.hasOwnProperty('templateId') && firstSlide.hasOwnProperty('props')) {
    return 'component';
  }
  
  // Check for legacy format
  if (firstSlide.hasOwnProperty('contentBlocks') || firstSlide.hasOwnProperty('deckgoTemplate')) {
    return 'legacy';
  }
  
  return 'unknown';
}

export default {
  adaptLegacySlideDeck,
  adaptLegacySlide,
  needsLegacyAdaptation,
  detectSlideDeckFormat
}; 