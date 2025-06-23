// custom_extensions/frontend/src/types/pdfLesson.ts

// --- Layout Configuration ---
export interface ContentLayout {
  position: 'left' | 'right' | 'center';
  width: 'full' | 'half';
}

// --- Base Block Types ---
export interface HeadlineBlock {
  type: 'headline';
  level: 1 | 2 | 3 | 4;
  text: string;
  iconName?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  isImportant?: boolean | null;
  layout?: ContentLayout;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
  isRecommendation?: boolean | null;
  layout?: ContentLayout;
}

export interface AlertBlock {
  type: 'alert';
  title?: string | null;
  text: string;
  alertType: 'info' | 'warning' | 'success' | 'danger'; // Assuming these are the only valid types
  iconName?: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
  iconColor?: string | null;
  layout?: ContentLayout;
}

export interface SectionBreakBlock {
  type: 'section_break';
  style?: 'dashed' | 'solid' | 'none' | null;
  layout?: ContentLayout;
}

// --- List Block Types ---
// Forward declaration for AnyContentBlock used in ListItem
export type AnyContentBlock =
  | HeadlineBlock
  | ParagraphBlock
  | BulletListBlock // Defined below
  | NumberedListBlock // Defined below
  | AlertBlock
  | SectionBreakBlock;

export type ListItem = string | AnyContentBlock;

export interface BulletListBlock {
  type: 'bullet_list';
  items: ListItem[];
  iconName?: string | null; // Specific to BulletListBlock
  layout?: ContentLayout;
}

export interface NumberedListBlock {
  type: 'numbered_list';
  items: ListItem[];
  // NumberedListBlock does not have its own iconName in the Pydantic model.
  layout?: ContentLayout;
}

// --- Main Data Structure ---
export interface PdfLessonData {
  lessonTitle: string;
  contentBlocks: AnyContentBlock[];
  detectedLanguage?: string | null;
}

// --- NEW: Slide Deck Types ---
export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContentBlockWithPosition {
  type: 'headline' | 'paragraph' | 'bullet_list' | 'numbered_list' | 'alert' | 'section_break';
  position?: BlockPosition;
  formation?: 'vertical' | 'grid-2x2' | 'grid-3x2' | 'grid-2x3' | 'horizontal';
  // Common properties that all content blocks might have
  text?: string;
  level?: 1 | 2 | 3 | 4;
  items?: any[];
  alertType?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  style?: string;
  iconName?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  iconColor?: string | null;
  isImportant?: boolean | null;
  isRecommendation?: boolean | null;
}

export interface DeckSlide {
  slideId: string;
  slideNumber: number;
  slideTitle: string;
  contentBlocks: ContentBlockWithPosition[];
}

export interface SlideDeckData {
  lessonTitle: string;
  slides: DeckSlide[];
  currentSlideId?: string | null;
  lessonNumber?: number | null;
  detectedLanguage?: string | null;
}
