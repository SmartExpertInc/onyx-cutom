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

export interface AvatarWithQuoteProps extends BaseTemplateProps {
  title: string;
  quote: string;
  author?: string;
  avatarPath?: string;
  avatarAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  quoteColor?: string;
  authorColor?: string;
  voiceoverText?: string;
}

// New slide templates based on provided images
export interface CourseOverviewSlideProps extends BaseTemplateProps {
  title: string;
  subtitle?: string;
  imagePath?: string;
  imageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface WorkLifeBalanceSlideProps extends BaseTemplateProps {
  title: string;
  content: string;
  imagePath?: string;
  imageAlt?: string;
  logoPath?: string;
  logoAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface ThankYouSlideProps extends BaseTemplateProps {
  title: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  companyName: string;
  logoNew?: string;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

// New slide templates based on images
export interface BenefitsListSlideProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  profileImagePath?: string;
  profileImageAlt?: string;
  currentStep?: number;
  totalSteps?: number;
  companyName?: string;
  benefitsListIcon?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface HybridWorkBestPracticesSlideProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  mainStatement: string;
  practices: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  teamImagePath?: string;
  teamImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface BenefitsTagsSlideProps extends BaseTemplateProps {
  title: string;
  tags: Array<{
    text: string;
    isHighlighted?: boolean;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  companyName?: string;
  companyLogoPath?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface LearningTopicsSlideProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  topics: string[];
  profileImagePath?: string;
  profileImageAlt?: string;
  companyName?: string;
  logoNew?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface SoftSkillsAssessmentSlideProps extends BaseTemplateProps {
  title: string;
  tips: Array<{
    text: string;
    isHighlighted?: boolean;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface TwoColumnSlideProps extends BaseTemplateProps {
  title: string;
  content: string;
  profileImagePath?: string;
  profileImageAlt?: string;
  rightImagePath?: string;
  rightImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface PhishingDefinitionSlideProps extends BaseTemplateProps {
  title: string;
  definitions: string[];
  profileImagePath?: string;
  profileImageAlt?: string;
  rightImagePath?: string;
  rightImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface ImpactStatementsSlideProps extends BaseTemplateProps {
  title: string;
  statements: Array<{
    number: string;
    description: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface BarChartSlideProps extends BaseTemplateProps {
  title?: string;
  bars: Array<{
    percentage: string;
    description: string;
    height: number; // Height in pixels or percentage
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  website?: string;
  date?: string;
  pageNumber?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface CriticalThinkingSlideProps extends BaseTemplateProps {
  title: string;
  content: string;
  highlightedPhrases: string[];
  profileImagePath?: string;
  profileImageAlt?: string;
  companyLogoPath?: string;
  companyLogoAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface PsychologicalSafetySlideProps extends BaseTemplateProps {
  title: string;
  content: string;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
  voiceoverText?: string;
}

export interface DataAnalysisSlideProps extends BaseTemplateProps {
  title: string;
  profileImagePath?: string;
  profileImageAlt?: string;
  excelIconPath?: string;
  excelIconAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
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
  | 'avatar-service-slide'
  | 'avatar-with-buttons'
  | 'avatar-checklist'
  | 'avatar-steps'
  | 'avatar-crm'
  | 'course-overview-slide'
  | 'work-life-balance-slide'
  | 'thank-you-slide'
  | 'benefits-list-slide'
  | 'hybrid-work-best-practices-slide'
  | 'benefits-tags-slide'
  | 'learning-topics-slide'
  | 'soft-skills-assessment-slide'
  | 'two-column-slide'
  | 'phishing-definition-slide'
  | 'impact-statements-slide'
  | 'bar-chart-slide'
  | 'critical-thinking-slide'
  | 'psychological-safety-slide'
  | 'data-analysis-slide'
  | 'solution-steps-slide'
  | 'proof-statistics-slide'
  | 'marketing-agency-thank-you-slide'
  | 'table-of-contents-slide'
  | 'company-tools-resources-slide'
  | 'stay-safe-tips-slide'
  | 'resources-list-slide'
  | 'course-rules-timeline-slide'
  | 'resilience-behaviors-slide'
  | 'soft-skills-types-slide'
;

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

// --- New Slide Interfaces ---

export interface SolutionStepsSlideProps extends BaseTemplateProps {
  title: string;
  buttonText: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  website?: string;
  date?: string;
  pageNumber?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface ProofStatisticsSlideProps extends BaseTemplateProps {
  tagText: string;
  title: string;
  description: string;
  statistics: Array<{
    value: string;
    description: string;
  }>;
  conclusionText: string;
  bulletPoints: string[];
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface MarketingAgencyThankYouSlideProps extends BaseTemplateProps {
  headerTitle: string;
  logoText: string;
  mainTitle: string;
  bodyText: string;
  profileImagePath?: string;
  profileImageAlt?: string;
  companyLogoPath?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface ImpactValueStatisticsSlideProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  statistics: Array<{
    percentage: string;
    description: string;
    backgroundColor: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  logoText?: string;
  sourceText?: string;
  sourceLink?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface OralHealthConditionsSlideProps extends BaseTemplateProps {
  title: string;
  description: string;
  conditions: Array<{
    number: string;
    condition: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface DeiStandardsMethodsSlideProps extends BaseTemplateProps {
  title: string;
  methods: Array<{
    title: string;
    bulletPoints: string[];
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface KpiReportChartSlideProps extends BaseTemplateProps {
  title: string;
  legend: Array<{
    color: string;
    label: string;
  }>;
  bars: Array<{
    percentage: string;
    color: string;
    height: number;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  companyName?: string;
  reportType?: string;
  date?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface EnterpriseRoadmapSlideProps extends BaseTemplateProps {
  title: string;
  description: string;
  tableData: Array<{
    featureName: string;
    status: string;
    dueDate: string;
    assignee: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  companyName?: string;
  reportType?: string;
  date?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface KpiBestPracticesSlideProps extends BaseTemplateProps {
  leftImagePath?: string;
  leftImageAlt?: string;
  bodyText: string;
  rightImagePath?: string;
  rightImageAlt?: string;
  bottomImagePath?: string;
  bottomImageAlt?: string;
  companyName?: string;
  reportType?: string;
  date?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface TableOfContentsSlideProps extends BaseTemplateProps {
  title: string;
  buttons: Array<{
    text: string;
    link: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  companyLogoPath?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
}

export interface CompanyToolsResourcesSlideProps extends BaseTemplateProps {
  title: string;
  sections: Array<{
    title: string;
    content: string;
    backgroundColor: string;
    textColor: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  companyLogoPath?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
  accentColor?: string;
} 

// --- New pixel-perfect slides based on provided designs ---
export interface StaySafeTipsSlideProps extends BaseTemplateProps {
  title: string;
  tips: Array<{
    number: string;
    heading: string;
    description: string;
  }>;
  actorImagePath?: string;
  actorImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
}

export interface ResourcesListSlideProps extends BaseTemplateProps {
  title: string;
  resources: Array<{
    text: string;
  }>;
  logoPath?: string;
  logoAlt?: string;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  barColor?: string;
  titleColor?: string;
  contentColor?: string;
}

export interface CourseRulesTimelineSlideProps extends BaseTemplateProps {
  steps: Array<{
    number: string;
    text: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ResilienceBehaviorsSlideProps extends BaseTemplateProps {
  title: string;
  subtitle: string;
  bullets: string[];
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
}

export interface SoftSkillsTypesSlideProps extends BaseTemplateProps {
  title: string;
  cards: Array<{
    label: string;
    imagePath?: string;
    imageAlt?: string;
  }>;
  profileImagePath?: string;
  profileImageAlt?: string;
  backgroundColor?: string;
  titleColor?: string;
  contentColor?: string;
}