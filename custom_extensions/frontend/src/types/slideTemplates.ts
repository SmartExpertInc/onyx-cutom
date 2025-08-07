// custom_extensions/frontend/src/types/slideTemplates.ts

import React from 'react';
import { SlideTheme } from '@/types/slideThemes';

// --- Base Template System Types ---

export interface BaseTemplateProps {
  slideId: string;
  isEditable?: boolean;
  onUpdate?: (props: any) => void;
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  hasVoiceover?: boolean; // Flag indicating if any slide has voiceover
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
  voiceoverText?: string; // Optional voiceover text for video lessons
}

export interface ContentSlideProps extends BaseTemplateProps {
  title: string;
  content: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundImage?: string;
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  voiceoverText?: string; // Optional voiceover text for video lessons
  imagePath?: string; // Path to uploaded image
}

export interface BigImageTopProps extends BigImageLeftProps {}

export interface QuoteCenterProps extends BaseTemplateProps {
  quote: string;
  author?: string;
  attribution?: string;
  backgroundColor?: string;
  quoteColor?: string;
  authorColor?: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  voiceoverText?: string; // Optional voiceover text for video lessons
  imagePath?: string;
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
  leftImagePath?: string; // Path to uploaded image for left column
  rightTitle: string;
  rightContent: string;
  rightImageUrl?: string;
  rightImageAlt?: string;
  rightImagePrompt?: string;
  rightImagePath?: string; // Path to uploaded image for right column
  columnRatio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70';
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  voiceoverText?: string; // Optional voiceover text for video lessons
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
  voiceoverText?: string; // Optional voiceover text for video lessons
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

// Avatar-based slide templates
export interface AvatarSlideProps extends BaseTemplateProps {
  title: string;
  subtitle?: string;
  content?: string;
  avatarPath?: string; // Path to uploaded avatar image
  avatarAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  contentColor?: string;
  voiceoverText?: string;
}

export interface AvatarWithButtonsProps extends BaseTemplateProps {
  title: string;
  buttons: Array<{
    text: string;
    color?: string;
  }>;
  avatarPath?: string;
  avatarAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  buttonColor?: string;
  voiceoverText?: string;
}

export interface AvatarWithChecklistProps extends BaseTemplateProps {
  title: string;
  items: Array<{
    text: string;
    isPositive: boolean; // true for checkmark, false for X
  }>;
  avatarPath?: string;
  avatarAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  itemColor?: string;
  voiceoverText?: string;
}

export interface AvatarWithStepsProps extends BaseTemplateProps {
  title: string;
  steps: string[];
  avatarPath?: string;
  avatarAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  stepColor?: string;
  voiceoverText?: string;
}

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
  | 'pyramid'
  | 'avatar-slide'
  | 'avatar-with-buttons'
  | 'avatar-with-checklist'
  | 'avatar-with-steps';

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