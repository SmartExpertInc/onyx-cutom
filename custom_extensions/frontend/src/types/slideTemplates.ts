// custom_extensions/frontend/src/types/slideTemplates.ts

import React from 'react';

// --- Base Template System Types ---

export interface BaseTemplateProps {
  slideId: string;
  isEditable?: boolean;
  onUpdate?: (props: any) => void;
}

export interface TemplateComponentInfo {
  id: string;
  name: string;
  description: string;
  category: 'title' | 'content' | 'media' | 'layout' | 'special';
  icon: string;
  previewImage?: string;
  component: React.ComponentType<BaseTemplateProps & any>;
  defaultProps: Record<string, any>;
  propSchema: Record<string, PropDefinition>;
}

export interface PropDefinition {
  type: 'text' | 'richtext' | 'image' | 'color' | 'number' | 'boolean' | 'select' | 'array';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: Array<{value: any; label: string}>; // For select type
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
  props: Record<string, any>;
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
  content: string;
  imageUrl: string;
  imageAlt: string;
  imageSize?: 'small' | 'medium' | 'large';
  titleColor?: string;
  contentColor?: string;
  backgroundColor?: string;
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
}

export interface TwoColumnProps extends BaseTemplateProps {
  title: string;
  leftTitle: string;
  leftContent: string;
  rightTitle: string;
  rightContent: string;
  columnRatio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70';
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
}

export interface ComparisonSlideProps extends BaseTemplateProps {
  title: string;
  beforeTitle: string;
  beforeContent: string;
  afterTitle: string;
  afterContent: string;
  beforeImage?: string;
  afterImage?: string;
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

export interface ImageComparisonProps extends BaseTemplateProps {
  title: string;
  leftTitle: string;
  leftDescription: string;
  leftImage: string;
  leftImageAlt?: string;
  rightTitle: string;
  rightDescription: string;
  rightImage: string;
  rightImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  columnGap?: 'small' | 'medium' | 'large';
  imageHeight?: string;
  showImageBorder?: boolean;
  imageBorderColor?: string;
}

// --- Migration and Compatibility ---

export interface LegacySlide {
  slideId: string;
  slideNumber: number;
  slideTitle: string;
  contentBlocks: any[];
  deckgoTemplate?: string;
  imagePlaceholders?: any[];
}

export interface MigrationResult {
  success: boolean;
  slide?: ComponentBasedSlide;
  errors?: string[];
  warnings?: string[];
}

export interface SlideEditor {
  templateId: string;
  props: Record<string, any>;
  onPropsChange: (newProps: Record<string, any>) => void;
  onTemplateChange: (newTemplateId: string) => void;
}

// --- Utility Types ---

export type TemplateId = 
  | 'title-slide'
  | 'content-slide'
  | 'big-image-left'
  | 'quote-center'
  | 'bullet-points'
  | 'two-column'
  | 'comparison-slide'
  | 'process-steps'
  | 'challenges-solutions'
  | 'hero-title-slide'
  | 'image-comparison';

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
  value: any;
  onChange: (value: any) => void;
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