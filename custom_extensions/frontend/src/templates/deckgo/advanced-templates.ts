// custom_extensions/frontend/src/templates/deckgo/advanced-templates.ts

import { SlideTemplate } from '../slides/basic/index';
import { HeadlineBlock, ParagraphBlock } from '@/types/pdfLesson';

export const deckgoAdvancedTemplates: SlideTemplate[] = [
  {
    id: 'chart-data',
    name: 'Графік даних',
    category: 'business',
    icon: '📊',
    description: 'Інтерактивний слайд з графіками та даними',
    layout: 'chart',
    deckgoTemplate: 'deckgo-slide-chart',
    aiKeywords: ['графік', 'дані', 'статистика', 'аналіз', 'числа', 'показники'],
    contextTags: ['data', 'chart', 'statistics', 'analysis'],
    interactivity: 'high',
    blocks: [
      { type: 'headline', text: 'Аналіз даних', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'Інтерактивний графік буде відображатися тут' } as ParagraphBlock
    ],
    cssClasses: ['chart-slide'],
    animations: ['fade-in', 'chart-draw']
  },
  {
    id: 'split-comparison',
    name: 'Розширене порівняння',
    category: 'business',
    icon: '⚖️',
    description: 'Слайд розділений на дві частини для порівняння',
    layout: 'split-advanced',
    deckgoTemplate: 'deckgo-slide-split',
    aiKeywords: ['порівняння', 'до/після', 'протиставлення', 'аналіз', 'різниця'],
    contextTags: ['comparison', 'before-after', 'analysis', 'contrast'],
    interactivity: 'medium',
    blocks: [
      { type: 'headline', text: 'Порівняльний аналіз', level: 1 } as HeadlineBlock,
      { type: 'headline', text: 'Ліва сторона', level: 2 } as HeadlineBlock,
      { type: 'paragraph', text: 'Поточна ситуація або старий підхід' } as ParagraphBlock,
      { type: 'headline', text: 'Права сторона', level: 2 } as HeadlineBlock,
      { type: 'paragraph', text: 'Покращена ситуація або новий підхід' } as ParagraphBlock
    ],
    cssClasses: ['split-slide'],
    animations: ['slide-in-left', 'slide-in-right']
  },
  {
    id: 'code-presentation',
    name: 'Презентація коду',
    category: 'technical',
    icon: '💻',
    description: 'Слайд для демонстрації коду з підсвічуванням синтаксису',
    layout: 'code',
    deckgoTemplate: 'deckgo-slide-code',
    aiKeywords: ['код', 'програмування', 'алгоритм', 'функція', 'скрипт'],
    contextTags: ['code', 'programming', 'development', 'technical'],
    interactivity: 'high',
    blocks: [
      { type: 'headline', text: 'Приклад коду', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'Код з підсвічуванням синтаксису буде тут' } as ParagraphBlock
    ],
    cssClasses: ['code-slide'],
    animations: ['type-writer']
  },
  {
    id: 'gif-demo',
    name: 'GIF демонстрація',
    category: 'creative',
    icon: '🎬',
    description: 'Слайд з анімованими GIF для демонстрації процесів',
    layout: 'gif',
    deckgoTemplate: 'deckgo-slide-gif',
    aiKeywords: ['демонстрація', 'процес', 'анімація', 'покрокова інструкція'],
    contextTags: ['demo', 'process', 'animation', 'tutorial'],
    interactivity: 'high',
    blocks: [
      { type: 'headline', text: 'Демонстрація процесу', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'Анімована демонстрація буде відображатися тут' } as ParagraphBlock
    ],
    cssClasses: ['gif-slide'],
    animations: ['fade-in']
  },
  {
    id: 'qr-interactive',
    name: 'QR-код інтерактив',
    category: 'creative',
    icon: '📱',
    description: 'Слайд з QR-кодом для інтерактивної взаємодії',
    layout: 'qr',
    deckgoTemplate: 'deckgo-slide-qrcode',
    aiKeywords: ['qr', 'посилання', 'інтерактив', 'мобільний', 'сканування'],
    contextTags: ['qr', 'interactive', 'mobile', 'engagement'],
    interactivity: 'high',
    blocks: [
      { type: 'headline', text: 'Сканувати для взаємодії', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'QR-код для доступу до додаткових матеріалів' } as ParagraphBlock
    ],
    cssClasses: ['qr-slide']
  },
  {
    id: 'countdown-timer',
    name: 'Таймер зворотного відліку',
    category: 'educational',
    icon: '⏰',
    description: 'Слайд з таймером для вправ або перерв',
    layout: 'countdown',
    deckgoTemplate: 'deckgo-slide-countdown',
    aiKeywords: ['таймер', 'час', 'вправа', 'перерва', 'відлік'],
    contextTags: ['timer', 'exercise', 'break', 'time-management'],
    interactivity: 'high',
    blocks: [
      { type: 'headline', text: 'Час на виконання', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'Таймер зворотного відліку' } as ParagraphBlock
    ],
    cssClasses: ['countdown-slide'],
    animations: ['pulse']
  }
]; 