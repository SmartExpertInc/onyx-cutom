// custom_extensions/frontend/src/types/slideTemplates.ts

import React from 'react';
import { SlideTheme } from '@/types/slideThemes';

// --- Base Template System Types ---

// Inline editing function types
export type RenderEditableTextFunction = (
  fieldPath: string[],
  value: string,
  options?: {
    multiline?: boolean;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    maxLength?: number;
    rows?: number;
  }
) => React.ReactNode;

export type RenderEditableFieldFunction = (
  fieldPath: string[],
  value: string,
  renderDisplay: (value: string) => React.ReactNode,
  options?: {
    multiline?: boolean;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    maxLength?: number;
    rows?: number;
  }
) => React.ReactNode;

export type RenderEditableArrayFunction = (
  fieldPath: string[],
  items: string[],
  options?: {
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    maxLength?: number;
  }
) => React.ReactNode;

export interface BaseTemplateProps {
  slideId: string;
  isEditable?: boolean;
  onUpdate?: (props: Record<string, unknown>) => void;
  // Inline editing props (optional)
  renderEditableText?: RenderEditableTextFunction;
  renderEditableField?: RenderEditableFieldFunction;
  renderEditableArray?: RenderEditableArrayFunction;
}

export interface TemplateComponentInfo {
  id: string;
  name: string;
  description: string;
  category: 'title' | 'content' | 'media' | 'layout' | 'special';
  icon: string;
  previewImage?: string;
  component: React.ComponentType<BaseTemplateProps & Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
  propSchema: Record<string, PropDefinition>;
}

export interface PropDefinition {
  type: 'text' | 'richtext' | 'image' | 'color' | 'number' | 'boolean' | 'select' | 'array';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: Array<{value: unknown; label: string}>; // For select type
  min?: number; // For number type
  max?: number; // For number type
  maxLength?: number; // For text type
  arrayItemType?: PropDefinition; // For array type
}

// --- Template Registry ---

export type TemplateRegistry = Record<string, TemplateComponentInfo>;

// --- New Slide Data Model ---

export interface ComponentBasedSlide {
  slideId: string;
  slideNumber: number;
  templateId: string;
  props: Record<string, unknown>;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    notes?: string;
  };
}

export interface ComponentBasedSlideDeck {
  lessonTitle: string;
  slides: ComponentBasedSlide[];
  currentSlideId?: string | null;
  lessonNumber?: number | null;
  detectedLanguage?: string | null;
  templateVersion?: string;
  theme?: string; // Theme ID for the slide deck
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    author?: string;
    description?: string;
  };
}

// --- Specific Template Prop Interfaces ---

export interface TitleSlideProps extends BaseTemplateProps {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  backgroundImage?: string;
}

export interface ContentSlideProps extends BaseTemplateProps {
  title: string;
  content: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundImage?: string;
}

export interface BigImageLeftProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  imagePrompt?: string; // AI prompt for image generation
  imageSize?: 'small' | 'medium' | 'large';
  titleColor?: string;
  contentColor?: string;
  backgroundColor?: string;
}

export interface BigImageTopProps extends BigImageLeftProps {
  // Inherits all properties from BigImageLeftProps
}

export interface QuoteCenterProps extends BaseTemplateProps {
  quote: string;
  author?: string;
  attribution?: string;
  backgroundColor?: string;
  quoteColor?: string;
  authorColor?: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface BulletPointsProps extends BaseTemplateProps {
  title: string;
  bullets: string[];
  maxColumns?: 1 | 2 | 3;
  bulletStyle?: 'dot' | 'arrow' | 'check' | 'star' | 'number';
  titleColor?: string;
  bulletColor?: string;
  backgroundColor?: string;
  imagePrompt?: string;
  imageAlt?: string;
}

export interface BulletPointsRightProps extends BulletPointsProps {
  subtitle?: string;
}

export interface TwoColumnProps extends BaseTemplateProps {
  title: string;
  leftTitle: string;
  leftContent: string;
  leftImageUrl?: string;
  leftImageAlt?: string;
  leftImagePrompt?: string;
  rightTitle: string;
  rightContent: string;
  rightImageUrl?: string;
  rightImageAlt?: string;
  rightImagePrompt?: string;
  columnRatio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70';
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
}

export interface ProcessStepsProps extends BaseTemplateProps {
  title: string;
  steps: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  layout?: 'vertical' | 'horizontal' | 'circular';
  stepColor?: string;
  backgroundColor?: string;
  titleColor?: string;
}

export interface ChallengesSolutionsProps extends BaseTemplateProps {
  title: string;
  challengesTitle?: string;
  solutionsTitle?: string;
  challenges: string[];
  solutions: string[];
  challengeColor?: string;
  solutionColor?: string;
  challengeIconColor?: string;
  solutionIconColor?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
}

export interface HeroTitleSlideProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  showAccent?: boolean;
  accentColor?: string;
  accentPosition?: 'left' | 'right' | 'top' | 'bottom';
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  backgroundImage?: string;
  textAlign?: 'left' | 'center' | 'right';
  titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleSize?: 'small' | 'medium' | 'large';
}


export interface FourBoxGridProps {
  slideId: string;
  title: string;
  boxes: Array<{
    heading: string;
    text: string;
  }>;
  theme?: SlideTheme;
}

export interface TimelineStep {
  heading: string;
  description: string;
}

export interface TimelineTemplateProps {
  slideId: string;
  title: string;
  steps: TimelineStep[];
  theme?: SlideTheme;
}

export interface PyramidTemplateProps {
  slideId: string;
  title: string;
  subtitle: string;
  items: { heading: string; description: string }[];
  theme?: SlideTheme;
}

export interface BigNumberItem {
  value: string;
  label: string;
  description: string;
}

export interface BigNumbersTemplateProps {
  slideId: string;
  title: string;
  items: BigNumberItem[];
  theme?: SlideTheme;
}

// --- Migration and Compatibility ---

export interface LegacySlide {
  slideId: string;
  slideNumber: number;
  slideTitle: string;
  contentBlocks: unknown[];
  deckgoTemplate?: string;
  imagePlaceholders?: unknown[];
}

export interface MigrationResult {
  success: boolean;
  slide?: ComponentBasedSlide;
  errors?: string[];
  warnings?: string[];
}

export interface SlideEditor {
  templateId: string;
  props: Record<string, unknown>;
  onPropsChange: (newProps: Record<string, unknown>) => void;
  onTemplateChange: (newTemplateId: string) => void;
}

// --- Utility Types ---

export type TemplateId = 
  | 'title-slide'
  | 'content-slide'
  | 'big-image-left'
  | 'big-image-top'
  | 'quote-center'
  | 'bullet-points'
  | 'bullet-points-right'
  | 'two-column'
  | 'process-steps'
  | 'challenges-solutions'
  | 'hero-title-slide'
  | 'four-box-grid'
  | 'timeline'
  | 'big-numbers'
  | 'pyramid';

export interface TemplatePreview {
  templateId: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  tags: string[];
}

// --- Editor Integration ---

export interface EditableField {
  key: string;
  label: string;
  type: PropDefinition['type'];
  value: unknown;
  onChange: (value: unknown) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export interface TemplateEditor {
  fields: EditableField[];
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
} 