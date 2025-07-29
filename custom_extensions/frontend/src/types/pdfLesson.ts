// custom_extensions/frontend/src/types/pdfLesson.ts

// --- Base Block Types ---
export interface HeadlineBlock {
  type: 'headline';
  level: 1 | 2 | 3 | 4;
  text: string;
  iconName?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  isImportant?: boolean | null;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
  isRecommendation?: boolean | null;
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
}

export interface SectionBreakBlock {
  type: 'section_break';
  style?: 'dashed' | 'solid' | 'none' | null;
}

// --- List Block Types ---
// Forward declaration for AnyContentBlock used in ListItem
export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

export type AnyContentBlock =
  | HeadlineBlock
  | ParagraphBlock
  | BulletListBlock // Defined below
  | NumberedListBlock // Defined below
  | TableBlock
  | AlertBlock
  | SectionBreakBlock;

export type ListItem = string | AnyContentBlock;

export interface BulletListBlock {
  type: 'bullet_list';
  items: ListItem[];
  iconName?: string | null; // Specific to BulletListBlock
}

export interface NumberedListBlock {
  type: 'numbered_list';
  items: ListItem[];
  // NumberedListBlock does not have its own iconName in the Pydantic model.
}

// --- Main Data Structure ---
export interface PdfLessonData {
  lessonTitle: string;
  contentBlocks: AnyContentBlock[];
  detectedLanguage?: string | null;
}


