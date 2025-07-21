// custom_extensions/frontend/src/types/textPresentation.ts

// --- Base Block Types ---
export interface HeadlineBlock {
  type: 'headline';
  level: 1 | 2 | 3 | 4;
  text: string;
  iconName?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  isImportant?: boolean;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
  isRecommendation?: boolean;
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

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

// --- List Block Types ---
// Forward declaration for AnyContentBlock used in ListItem
export type AnyContentBlock =
  | HeadlineBlock
  | ParagraphBlock
  | AlertBlock
  | SectionBreakBlock
  | BulletListBlock
  | NumberedListBlock
  | MiniSection
  | StandaloneBlock
  | TableBlock;

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

// --- Composite Types for Rendering ---
export interface MiniSection {
  type: "mini_section";
  headline: HeadlineBlock;
  list: BulletListBlock | NumberedListBlock | ParagraphBlock | AlertBlock;
};

export interface StandaloneBlock { 
  type: "standalone_block"; 
  content: AnyContentBlock; 
};

// --- Main Data Structure ---
export interface TextPresentationData {
  textTitle: string;
  contentBlocks: AnyContentBlock[];
  detectedLanguage?: string | null;
} 