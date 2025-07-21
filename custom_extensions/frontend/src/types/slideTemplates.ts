// Template-based slide system types

// Base template prop interface that all templates must extend
export interface BaseTemplateProps {
  slideId: string;
  slideNumber: number;
}

// Common prop types used across templates
export interface ImageProps {
  src?: string;
  alt?: string;
  description?: string; // For AI-generated content description
}

export interface TextProps {
  text: string;
  style?: 'normal' | 'bold' | 'italic' | 'emphasis';
  color?: string;
}

// Specific template prop interfaces
export interface TitleSlideProps extends BaseTemplateProps {
  title: TextProps;
  subtitle?: TextProps;
  backgroundImage?: ImageProps;
}

export interface BigImageLeftProps extends BaseTemplateProps {
  title: TextProps;
  image: ImageProps;
  content: TextProps;
  bulletPoints?: string[];
}

export interface QuoteCenterProps extends BaseTemplateProps {
  quote: TextProps;
  author?: TextProps;
  backgroundImage?: ImageProps;
}

export interface BulletPointsProps extends BaseTemplateProps {
  title: TextProps;
  bullets: TextProps[];
  layout?: 'single-column' | 'two-column';
}

export interface TwoColumnProps extends BaseTemplateProps {
  title: TextProps;
  leftColumn: {
    heading?: TextProps;
    content: TextProps;
    image?: ImageProps;
  };
  rightColumn: {
    heading?: TextProps;
    content: TextProps;
    image?: ImageProps;
  };
}

export interface ComparisonProps extends BaseTemplateProps {
  title: TextProps;
  beforeSection: {
    heading: TextProps;
    content: TextProps;
    image?: ImageProps;
  };
  afterSection: {
    heading: TextProps;
    content: TextProps;
    image?: ImageProps;
  };
}

export interface ProcessStepsProps extends BaseTemplateProps {
  title: TextProps;
  steps: Array<{
    number: number;
    title: TextProps;
    description: TextProps;
  }>;
}

export interface AgendaProps extends BaseTemplateProps {
  title: TextProps;
  items: Array<{
    title: TextProps;
    duration?: string;
    description?: TextProps;
  }>;
}

// Union type of all template props
export type AnyTemplateProps = 
  | TitleSlideProps
  | BigImageLeftProps
  | QuoteCenterProps
  | BulletPointsProps
  | TwoColumnProps
  | ComparisonProps
  | ProcessStepsProps
  | AgendaProps;

// Template component type
export type SlideTemplate<T extends BaseTemplateProps = BaseTemplateProps> = (props: T) => any;

// Template definition for the registry
export interface TemplateDefinition<T extends BaseTemplateProps = BaseTemplateProps> {
  id: string;
  name: string;
  description: string;
  category: 'presentation' | 'content' | 'special';
  component: SlideTemplate<T>;
  defaultProps: Omit<T, 'slideId' | 'slideNumber'>;
  previewImage?: string;
}

// New slide data structure using templates
export interface TemplateBasedSlide {
  slideId: string;
  slideNumber: number;
  templateId: string;
  props: AnyTemplateProps;
}

// New deck data structure
export interface TemplateBasedSlideDeck {
  lessonTitle: string;
  slides: TemplateBasedSlide[];
  currentSlideId?: string | null;
  lessonNumber?: number | null;
  detectedLanguage?: string | null;
}

// Migration types for backward compatibility
export interface LegacySlide {
  slideId: string;
  slideNumber: number;
  slideTitle: string;
  contentBlocks: any[]; // Legacy content blocks
  deckgoTemplate?: string;
  imagePlaceholders?: any[];
}

export interface LegacySlideDeck {
  lessonTitle: string;
  slides: LegacySlide[];
  currentSlideId?: string | null;
  lessonNumber?: number | null;
  detectedLanguage?: string | null;
}

// Union type for both old and new systems  
export type UnifiedSlideDeckData = TemplateBasedSlideDeck | LegacySlideDeck;

// Type guard to check if deck uses new template system
export function isTemplateBasedDeck(deck: UnifiedSlideDeckData): deck is TemplateBasedSlideDeck {
  return deck.slides.length > 0 && 'templateId' in deck.slides[0];
}

// Type guard to check if slide uses new template system
export function isTemplateBasedSlide(slide: any): slide is TemplateBasedSlide {
  return slide && typeof slide.templateId === 'string' && slide.props;
} 