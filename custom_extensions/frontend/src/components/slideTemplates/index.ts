// Template Components
export { default as TitleSlide } from './TitleSlide';
export { default as BigImageLeft } from './BigImageLeft';
export { default as QuoteCenter } from './QuoteCenter';
export { default as BulletPoints } from './BulletPoints';
export { default as TwoColumn } from './TwoColumn';

// Template Registry
export {
  TEMPLATE_DEFINITIONS,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  createDefaultSlideProps,
  validateTemplateProps,
  migrateContentBlocksToTemplate,
} from './TemplateRegistry';

// Template Renderer
export { default as TemplateRenderer, useTemplateEditor } from './TemplateRenderer';

// Re-export types for convenience
export type {
  TemplateBasedSlide,
  TemplateBasedSlideDeck,
  UnifiedSlideDeckData,
  AnyTemplateProps,
  BaseTemplateProps,
  TitleSlideProps,
  BigImageLeftProps,
  QuoteCenterProps,
  BulletPointsProps,
  TwoColumnProps,
  TemplateDefinition,
} from '@/types/slideTemplates';

// Re-export functions (not types)
export {
  isTemplateBasedDeck,
  isTemplateBasedSlide,
} from '@/types/slideTemplates'; 