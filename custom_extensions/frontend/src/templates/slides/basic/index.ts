// custom_extensions/frontend/src/templates/slides/basic/index.ts

import { HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock } from '@/types/pdfLesson';

export interface SlideTemplate {
  id: string;
  name: string;
  category: 'basic' | 'business' | 'educational' | 'creative' | 'technical';
  icon: string;
  description: string;
  layout: string;
  deckgoTemplate?: string; // DeckDeckGo специфічний темплейт
  aiKeywords: string[]; // Ключові слова для AI аналізу
  contextTags: string[]; // Теги контексту
  blocks: any[];
  cssClasses?: string[];
  animations?: string[];
  interactivity?: 'low' | 'medium' | 'high';
}

export const basicTemplates: SlideTemplate[] = [
  {
    id: 'title-basic',
    name: 'Класичний заголовок',
    category: 'basic',
    icon: '◯',
    description: 'Простий титульний слайд з заголовком та підзаголовком',
    layout: 'title',
    deckgoTemplate: 'deckgo-slide-title',
    aiKeywords: ['заголовок', 'вступ', 'презентація', 'початок'],
    contextTags: ['opening', 'introduction', 'title'],
    interactivity: 'low',
    blocks: [
      { type: 'headline', text: 'Заголовок Презентації', level: 1 } as HeadlineBlock,
      { type: 'headline', text: 'Підзаголовок або ключове повідомлення', level: 2 } as HeadlineBlock
    ]
  },
  {
    id: 'content-simple',
    name: 'Простий контент',
    category: 'basic',
    icon: '▫',
    description: 'Стандартний слайд з заголовком та текстом',
    layout: 'content',
    deckgoTemplate: 'deckgo-slide-content',
    aiKeywords: ['текст', 'контент', 'інформація', 'пояснення'],
    contextTags: ['content', 'explanation', 'information'],
    interactivity: 'low',
    blocks: [
      { type: 'headline', text: 'Заголовок слайду', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'Основний контент розміщується тут. Детальні пояснення та інформація.' } as ParagraphBlock
    ]
  },
  {
    id: 'bullets-four',
    name: '4 ключові пункти',
    category: 'basic',
    icon: '▪',
    description: 'Заголовок з 4 пунктами в сітковому макеті',
    layout: 'four-bullets',
    deckgoTemplate: 'deckgo-slide-content',
    aiKeywords: ['список', 'пункти', 'переліч', '4 пункти'],
    contextTags: ['list', 'points', 'enumeration'],
    interactivity: 'medium',
    blocks: [
      { type: 'headline', text: 'Чотири ключові пункти', level: 1 } as HeadlineBlock,
      { type: 'bullet_list', items: ['Перший пункт', 'Другий пункт', 'Третій пункт', 'Четвертий пункт'] } as BulletListBlock
    ]
  }
]; 