// custom_extensions/frontend/src/components/templates/registry.ts

import { TemplateRegistry, TemplateComponentInfo, PropDefinition } from '@/types/slideTemplates';

// Template components (will import these after creating them)
import { TitleSlideTemplate } from './TitleSlideTemplate';
import { ContentSlideTemplate } from './ContentSlideTemplate';
import { BigImageLeftTemplate } from './BigImageLeftTemplate';
import { BulletPointsTemplate } from './BulletPointsTemplate';
import { BulletPointsRightTemplate } from './BulletPointsRightTemplate';
import { TwoColumnTemplate } from './TwoColumnTemplate';
import { ProcessStepsTemplate } from './ProcessStepsTemplate';
import { ChallengesSolutionsTemplate } from './ChallengesSolutionsTemplate';
import { HeroTitleSlideTemplate } from './HeroTitleSlideTemplate';
import { BigImageTopTemplate } from './BigImageTopTemplate';
import { FourBoxGridTemplate } from './FourBoxGridTemplate';
import { TimelineTemplate } from './TimelineTemplate';
import { BigNumbersTemplate } from './BigNumbersTemplate';
import { PyramidTemplate } from './PyramidTemplate';

// Template registry with comprehensive metadata
export const SLIDE_TEMPLATE_REGISTRY: TemplateRegistry = {
  'title-slide': {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Opening slide with title, subtitle, and optional author/date information',
    category: 'title',
    icon: '🎯',
    component: TitleSlideTemplate,
    defaultProps: {
      title: 'Presentation Title',
      subtitle: 'Compelling subtitle that captures attention',
      author: '',
      date: '',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      subtitleColor: '#d9e1ff',
      backgroundImage: ''
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        description: 'Main presentation title',
        required: true,
        maxLength: 100
      },
      subtitle: {
        type: 'text',
        label: 'Subtitle',
        description: 'Supporting subtitle or tagline',
        maxLength: 200
      },
      author: {
        type: 'text',
        label: 'Author',
        description: 'Presenter or author name',
        maxLength: 50
      },
      date: {
        type: 'text',
        label: 'Date',
        description: 'Presentation date',
        maxLength: 50
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#261c4e'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#ffffff'
      },
      subtitleColor: {
        type: 'color',
        label: 'Subtitle Color',
        default: '#d9e1ff'
      },
      backgroundImage: {
        type: 'image',
        label: 'Background Image',
        description: 'Optional background image URL'
      }
    }
  },

  'content-slide': {
    id: 'content-slide',
    name: 'Content Slide',
    description: 'Standard content slide with title and body text',
    category: 'content',
    icon: '📄',
    component: ContentSlideTemplate,
    defaultProps: {
      title: 'Slide Title',
      content: 'Your content goes here. This is where you explain your key points with detailed information that supports your presentation narrative.',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff',
      alignment: 'left',
      backgroundImage: ''
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        description: 'Slide title',
        required: true,
        maxLength: 100
      },
      content: {
        type: 'richtext',
        label: 'Content',
        description: 'Main slide content',
        required: true,
        maxLength: 2000
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#261c4e'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#ffffff'
      },
      contentColor: {
        type: 'color',
        label: 'Content Color',
        default: '#d9e1ff'
      },
      alignment: {
        type: 'select',
        label: 'Text Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        default: 'left'
      },
      backgroundImage: {
        type: 'image',
        label: 'Background Image',
        description: 'Optional background image URL'
      }
    }
  },

  'big-image-left': {
    id: 'big-image-left',
    name: 'Big Image Left',
    description: 'Large image on the left with content on the right',
    category: 'media',
    icon: '🖼️',
    component: BigImageLeftTemplate,
    defaultProps: {
      title: 'Image Title',
      subtitle: 'Subtitle that complements the image and provides context or explanation.',
      imageUrl: 'https://via.placeholder.com/600x400?text=Your+Image',
      imageAlt: 'Descriptive alt text',
      imagePrompt: 'man sitting on a chair',
      imageSize: 'large',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        maxLength: 100
      },
      subtitle: {
        type: 'richtext',
        label: 'Subtitle',
        required: true,
        maxLength: 1000
      },
      imageUrl: {
        type: 'image',
        label: 'Image URL',
        description: 'URL of the image to display',
        required: true
      },
      imageAlt: {
        type: 'text',
        label: 'Image Alt Text',
        description: 'Descriptive text for accessibility',
        required: true,
        maxLength: 200
      },
      imagePrompt: {
        type: 'text',
        label: 'Image Prompt',
        description: 'Prompt for image generation (e.g., "man sitting on a chair")',
        maxLength: 500
      },
      imageSize: {
        type: 'select',
        label: 'Image Size',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ],
        default: 'large'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#ffffff'
      },
      contentColor: {
        type: 'color',
        label: 'Content Color',
        default: '#d9e1ff'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#261c4e'
      }
    }
  },

  'bullet-points': {
    id: 'bullet-points',
    name: 'Bullet Points',
    description: 'Title with formatted bullet points in customizable columns',
    category: 'content',
    icon: '📝',
    component: BulletPointsTemplate,
    defaultProps: {
      title: 'Bullet Points',
      bullets: ['First point', 'Second point', 'Third point'],
      maxColumns: 2,
      bulletStyle: 'dot',
      titleColor: '#1a1a1a',
      bulletColor: '#333333',
      backgroundColor: '#ffffff',
      imagePrompt: 'A relevant illustration for the bullet points',
      imageAlt: 'Description of the image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      bullets: {
        type: 'array',
        label: 'Bullet Points',
        description: 'List of bullet point items',
        required: true,
        arrayItemType: {
        type: 'text',
          label: 'Bullet Point',
        maxLength: 200
        }
      },
      maxColumns: {
        type: 'select',
        label: 'Columns',
        options: [
          { value: 1, label: '1 Column' },
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' }
        ],
        default: 2
      },
      bulletStyle: {
        type: 'select',
        label: 'Bullet Style',
        options: [
          { value: 'dot', label: '• Dot' },
          { value: 'arrow', label: '→ Arrow' },
          { value: 'check', label: '✓ Check' },
          { value: 'star', label: '★ Star' },
          { value: 'number', label: '1. Number' }
        ],
        default: 'dot'
      },
      titleColor: { type: 'color', label: 'Title Color', default: '#1a1a1a' },
      bulletColor: { type: 'color', label: 'Bullet Color', default: '#333333' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      imagePrompt: { type: 'text', label: 'Image Prompt', required: false },
      imageAlt: { type: 'text', label: 'Image Alt', required: false }
    }
  },

  'bullet-points-right': {
    id: 'bullet-points-right',
    name: 'Bullet Points Right',
    description: 'Title, subtitle, bullet points (зліва), placeholder (справа)',
    category: 'content',
    icon: '📋',
    component: BulletPointsRightTemplate,
    defaultProps: {
      title: 'Key Points',
      subtitle: 'Short intro or context before the list',
      bullets: ['First point', 'Second point', 'Third point'],
      maxColumns: 1,
      bulletStyle: 'dot',
      titleColor: '#1a1a1a',
      bulletColor: '#333333',
      backgroundColor: '#ffffff',
      imagePrompt: 'A relevant illustration for the bullet points',
      imageAlt: 'Description of the image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle', required: false },
      bullets: {
        type: 'array',
        label: 'Bullet Points',
        description: 'List of bullet point items',
        required: true,
        arrayItemType: {
          type: 'text',
          label: 'Bullet Point',
          maxLength: 200
        }
      },
      maxColumns: {
        type: 'select',
        label: 'Columns',
        options: [
          { value: 1, label: '1 Column' }
        ],
        default: 1
      },
      bulletStyle: {
        type: 'select',
        label: 'Bullet Style',
        options: [
          { value: 'dot', label: '• Dot' },
          { value: 'arrow', label: '→ Arrow' },
          { value: 'check', label: '✓ Check' },
          { value: 'star', label: '★ Star' },
          { value: 'number', label: '1. Number' }
        ],
        default: 'dot'
      },
      titleColor: { type: 'color', label: 'Title Color', default: '#1a1a1a' },
      bulletColor: { type: 'color', label: 'Bullet Color', default: '#333333' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      imagePrompt: { type: 'text', label: 'Image Prompt', required: false },
      imageAlt: { type: 'text', label: 'Image Alt', required: false }
    }
  },

  'two-column': {
    id: 'two-column',
    name: 'Two Column',
    description: 'Split layout with two content areas and customizable ratios',
    category: 'layout',
    icon: '📑',
    component: TwoColumnTemplate,
    defaultProps: {
      title: 'Two Column Layout',
      leftTitle: 'Left Column',
      leftContent: 'Content for the left side',
      leftImageUrl: '',
      leftImageAlt: '',
      leftImagePrompt: '',
      rightTitle: 'Right Column',
      rightContent: 'Content for the right side',
      rightImageUrl: '',
      rightImageAlt: '',
      rightImagePrompt: '',
      columnRatio: '50-50',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      leftTitle: { type: 'text', label: 'Left Title', required: true },
      leftContent: { type: 'richtext', label: 'Left Content', required: true },
      leftImageUrl: { type: 'image', label: 'Left Image URL', required: false },
      leftImageAlt: { type: 'text', label: 'Left Image Alt', required: false },
      leftImagePrompt: { type: 'text', label: 'Left Image Prompt', required: false },
      rightTitle: { type: 'text', label: 'Right Title', required: true },
      rightContent: { type: 'richtext', label: 'Right Content', required: true },
      rightImageUrl: { type: 'image', label: 'Right Image URL', required: false },
      rightImageAlt: { type: 'text', label: 'Right Image Alt', required: false },
      rightImagePrompt: { type: 'text', label: 'Right Image Prompt', required: false },
      columnRatio: { type: 'select', label: 'Column Ratio', options: [ { value: '50-50', label: '50-50' }, { value: '60-40', label: '60-40' }, { value: '40-60', label: '40-60' }, { value: '70-30', label: '70-30' }, { value: '30-70', label: '30-70' } ], default: '50-50' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#261c4e' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      contentColor: { type: 'color', label: 'Content Color', default: '#d9e1ff' }
    }
  },

  

  'process-steps': {
    id: 'process-steps',
    name: 'Process Steps',
    description: 'Numbered process or workflow steps with customizable layouts',
    category: 'content',
    icon: '🔄',
    component: ProcessStepsTemplate,
    defaultProps: {
      title: 'Process Steps',
      steps: [
        {
          title: 'Step 1',
          description: 'First step in the process',
          icon: '1️⃣'
        },
        {
          title: 'Step 2',
          description: 'Second step in the process',
          icon: '2️⃣'
        },
        {
          title: 'Step 3',
          description: 'Third step in the process',
          icon: '3️⃣'
        }
      ],
      layout: 'horizontal',
      stepColor: '#007bff',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        required: true,
        maxLength: 100
      },
      steps: {
        type: 'array',
        label: 'Process Steps',
        description: 'List of process steps',
        required: true,
        arrayItemType: {
          type: 'text', // This will be expanded to handle the step object structure
          label: 'Step'
        }
      },
      layout: {
        type: 'select',
        label: 'Layout',
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'circular', label: 'Circular' }
        ],
        default: 'horizontal'
      },
      stepColor: {
        type: 'color',
        label: 'Step Color',
        default: '#007bff'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff'
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#1a1a1a'
      }
    }
  },

  'challenges-solutions': {
    id: 'challenges-solutions',
    name: 'Виклики та Рішення',
    description: 'Порівняння проблем і рішень з візуальними іконками',
    category: 'layout',
    icon: '⚖️',
    component: ChallengesSolutionsTemplate,
    defaultProps: {
      title: 'Виклики у Просуванні та Як Їх Подолати',
      challengesTitle: 'Виклики',
      solutionsTitle: 'Рішення',
      challenges: [
        'Відмова та низький відгук на холодні контакти',
        'Відсутність чіткої кваліфікації лідів',
        'Перевантаження інформацією потенційних клієнтів'
      ],
      solutions: [
        'Інтенсивні тренінги для продавців із техніки просування',
        'Впровадження автоматизації для ефективності',
        'Ретельна сегментація ринку та персоналізація'
      ],
      challengeColor: '#fef2f2',
      solutionColor: '#f0fdf4',
      challengeIconColor: '#dc2626',
      solutionIconColor: '#16a34a',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#374151'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Заголовок',
        description: 'Основний заголовок слайду',
        required: true,
        maxLength: 150
      },
      challengesTitle: {
        type: 'text',
        label: 'Заголовок Викликів',
        description: 'Назва розділу з викликами',
        maxLength: 50,
        default: 'Виклики'
      },
      solutionsTitle: {
        type: 'text',
        label: 'Заголовок Рішень',
        description: 'Назва розділу з рішеннями',
        maxLength: 50,
        default: 'Рішення'
      },
      challenges: {
        type: 'array',
        label: 'Список Викликів',
        description: 'Перелік проблем або викликів',
        required: true,
        arrayItemType: {
          type: 'text',
          label: 'Виклик',
          maxLength: 200
        }
      },
      solutions: {
        type: 'array',
        label: 'Список Рішень',
        description: 'Перелік рішень або способів вирішення',
        required: true,
        arrayItemType: {
          type: 'text',
          label: 'Рішення',
          maxLength: 200
        }
      },
      challengeColor: {
        type: 'color',
        label: 'Колір Фону Викликів',
        description: 'Фоновий колір розділу з викликами',
        default: '#fef2f2'
      },
      solutionColor: {
        type: 'color',
        label: 'Колір Фону Рішень',
        description: 'Фоновий колір розділу з рішеннями',
        default: '#f0fdf4'
      },
      challengeIconColor: {
        type: 'color',
        label: 'Колір Іконки Викликів',
        description: 'Колір іконки хрестика',
        default: '#dc2626'
      },
      solutionIconColor: {
        type: 'color',
        label: 'Колір Іконки Рішень',
        description: 'Колір іконки галочки',
        default: '#16a34a'
      },
      backgroundColor: {
        type: 'color',
        label: 'Колір Фону Слайду',
        default: '#ffffff'
      },
      titleColor: {
        type: 'color',
        label: 'Колір Заголовку',
        default: '#1a1a1a'
      },
      contentColor: {
        type: 'color',
        label: 'Колір Тексту',
        default: '#374151'
      }
    }
  },

  'hero-title-slide': {
    id: 'hero-title-slide',
    name: 'Hero Title Slide',
    description: 'Потужний заголовковий слайд з акцентним елементом та детальним описом',
    category: 'title',
    icon: '🚀',
    component: HeroTitleSlideTemplate,
    defaultProps: {
      title: 'Виявлення та Просування Нових Лідів для Генерації Продажів',
      subtitle: 'Визначення лідів, перспектив і можливостей: шлях до успіху в продажах 2025 року.',
      showAccent: true,
      accentColor: '#3b82f6',
      accentPosition: 'left',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#6b7280',
      textAlign: 'center',
      titleSize: 'xlarge',
      subtitleSize: 'medium'
    },
    propSchema: {
      title: {
        type: 'text',
        label: 'Заголовок',
        description: 'Основний заголовок презентації',
        required: true,
        maxLength: 200
      },
      subtitle: {
        type: 'richtext',
        label: 'Підзаголовок',
        description: 'Детальний опис або підзаголовок',
        required: true,
        maxLength: 400
      },
      showAccent: {
        type: 'boolean',
        label: 'Показати Акцентний Елемент',
        description: 'Відображати декоративний акцентний елемент',
        default: true
      },
      accentColor: {
        type: 'color',
        label: 'Колір Акценту',
        description: 'Колір акцентного елементу',
        default: '#3b82f6'
      },
      accentPosition: {
        type: 'select',
        label: 'Позиція Акценту',
        description: 'Розташування акцентного елементу',
        options: [
          { value: 'left', label: 'Зліва' },
          { value: 'right', label: 'Справа' },
          { value: 'top', label: 'Зверху' },
          { value: 'bottom', label: 'Знизу' }
        ],
        default: 'left'
      },
      backgroundColor: {
        type: 'color',
        label: 'Колір Фону',
        default: '#ffffff'
      },
      titleColor: {
        type: 'color',
        label: 'Колір Заголовку',
        default: '#1a1a1a'
      },
      subtitleColor: {
        type: 'color',
        label: 'Колір Підзаголовку',
        default: '#6b7280'
      },
      backgroundImage: {
        type: 'image',
        label: 'Фонове Зображення',
        description: 'Опціональне фонове зображення'
      },
      textAlign: {
        type: 'select',
        label: 'Вирівнювання Тексту',
        options: [
          { value: 'left', label: 'По лівому краю' },
          { value: 'center', label: 'По центру' },
          { value: 'right', label: 'По правому краю' }
        ],
        default: 'center'
      },
      titleSize: {
        type: 'select',
        label: 'Розмір Заголовку',
        options: [
          { value: 'small', label: 'Малий' },
          { value: 'medium', label: 'Середній' },
          { value: 'large', label: 'Великий' },
          { value: 'xlarge', label: 'Дуже Великий' }
        ],
        default: 'xlarge'
      },
      subtitleSize: {
        type: 'select',
        label: 'Розмір Підзаголовку',
        options: [
          { value: 'small', label: 'Малий' },
          { value: 'medium', label: 'Середній' },
          { value: 'large', label: 'Великий' }
        ],
        default: 'medium'
      }
    }
  },

  'big-image-top': {
    id: 'big-image-top',
    name: 'Big Image Top',
    description: 'Large image on top, title and content below',
    category: 'media',
    icon: '🖼️',
    component: BigImageTopTemplate,
    defaultProps: {
      title: 'Main Title',
      subtitle: 'Subtitle or content goes here',
      imageUrl: '',
      imageAlt: '',
      imagePrompt: '',
      imageSize: 'large',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'richtext', label: 'Subtitle/Content', required: false },
      imageUrl: { type: 'image', label: 'Image URL', required: false },
      imageAlt: { type: 'text', label: 'Image Alt', required: false },
      imagePrompt: { type: 'text', label: 'Image Prompt', required: false },
      imageSize: { type: 'select', label: 'Image Size', options: [ { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' } ], default: 'large' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#261c4e' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      contentColor: { type: 'color', label: 'Content Color', default: '#d9e1ff' }
    }
  },

  'four-box-grid': {
    id: 'four-box-grid',
    name: 'Four Box Grid',
    description: 'Title and 4 boxes in a 2x2 grid',
    category: 'layout',
    icon: '🟪',
    component: FourBoxGridTemplate,
    defaultProps: {
      title: 'Main Title',
      boxes: [
        { heading: 'Box 1', text: 'Description for box 1.' },
        { heading: 'Box 2', text: 'Description for box 2.' },
        { heading: 'Box 3', text: 'Description for box 3.' },
        { heading: 'Box 4', text: 'Description for box 4.' }
      ]
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      boxes: {
        type: 'array',
        label: 'Boxes',
        description: 'Array of 4 boxes',
        required: true,
        // arrayItemType: { type: 'object', label: 'Box', description: 'Box with heading and text', required: true }
        // Якщо потрібна підтримка object, додати окрему схему для box
      }
    }
  },

  'timeline': {
    id: 'timeline',
    name: 'Timeline',
    description: 'Horizontal timeline with 4 steps and alternating text blocks',
    category: 'layout',
    icon: '⏳',
    component: TimelineTemplate,
    defaultProps: {
      title: 'History and Evolution',
      steps: [
        { heading: 'Hip-Hop Influence', description: 'Deeply intertwined with hip-hop culture, early street art was a raw, authentic voice of the streets.' },
        { heading: '1960s NYC Graffiti', description: 'Street art\'s roots trace back to graffiti tagging in New York City, an underground movement defining urban identity.' },
        { heading: 'Transition to Commissioned Works', description: 'From illicit markings to celebrated public art, its evolution saw a shift towards acceptance and commissioned projects.' },
        { heading: 'Pioneers Emerge', description: 'Artists like Basquiat, Haring, and Banksy transformed the landscape, bringing street art into mainstream consciousness.' }
      ]
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      steps: {
        type: 'array',
        label: 'Steps',
        description: 'Array of 4 timeline steps',
        required: true,
        // arrayItemType: { type: 'object', label: 'Step', description: 'Step with heading and description', required: true }
      }
    }
  },

  'big-numbers': {
    id: 'big-numbers',
    name: 'Big Numbers',
    description: 'Three-column layout for highlighting key metrics or statistics with big numbers, labels, and descriptions.',
    category: 'content',
    icon: 'bar_chart',
    component: BigNumbersTemplate,
    defaultProps: {
      title: 'Key Metrics',
      items: [
        { value: '25%', label: 'Reduced Costs', description: 'Efficient architecture can decrease development and maintenance expenses by up to 25%.' },
        { value: '3x', label: 'Faster Time-to-Market', description: 'Well-defined architectures accelerate feature deployment, bringing products to market 3 times faster.' },
        { value: '50%', label: 'Improved Stability', description: 'Robust designs lead to a 50% reduction in critical system outages and performance issues.' },
      ],
    },
    propSchema: {
      title: { type: 'text', label: 'Title' },
      items: { type: 'array', label: 'Big Numbers' },
    },
  },
  'pyramid': {
    id: 'pyramid',
    name: 'Pyramid',
    description: 'Pyramid diagram with 3 levels and descriptions.',
    category: 'layout',
    icon: 'signal_cellular_alt',
    component: PyramidTemplate,
    defaultProps: {
      title: 'Key Metrics of Effective System Architecture',
      subtitle: 'Effective system architecture is measured by how well it delivers on key objectives, balancing user needs, operational demands, and technical robustness.',
      items: [
        { heading: 'User Satisfaction', description: 'Achieving user delight' },
        { heading: 'Operational Efficiency', description: 'Optimizing resources' },
        { heading: 'System Reliability', description: 'Ensuring stability' },
      ],
    },
    propSchema: {
      title: { type: 'text', label: 'Title' },
      subtitle: { type: 'text', label: 'Subtitle' },
      items: { type: 'array', label: 'Pyramid Items' },
    },
  },
};

// Utility functions for working with the registry

export function getTemplate(templateId: string): TemplateComponentInfo | undefined {
  return SLIDE_TEMPLATE_REGISTRY[templateId];
}

export function getAllTemplates(): TemplateComponentInfo[] {
  return Object.values(SLIDE_TEMPLATE_REGISTRY);
}

export function getTemplatesByCategory(category: string): TemplateComponentInfo[] {
  return getAllTemplates().filter(template => template.category === category);
}

export function getTemplateCategories(): string[] {
  const categories = new Set(getAllTemplates().map(template => template.category));
  return Array.from(categories);
}

export function validateTemplateProps(templateId: string, props: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const template = getTemplate(templateId);
  if (!template) {
    return { valid: false, errors: [`Template ${templateId} not found`] };
  }

  const errors: string[] = [];
  const schema = template.propSchema;

  // Check required props
  Object.entries(schema).forEach(([key, definition]) => {
    if (definition.required && (props[key] === undefined || props[key] === '')) {
      errors.push(`${definition.label} is required`);
    }

    // Additional validation based on type
    if (props[key] !== undefined && props[key] !== '') {
      const value = props[key];
      
      switch (definition.type) {
        case 'text':
          if (typeof value !== 'string') {
            errors.push(`${definition.label} must be text`);
          } else if (definition.maxLength && value.length > definition.maxLength) {
            errors.push(`${definition.label} must be ${definition.maxLength} characters or less`);
          }
          break;
        
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`${definition.label} must be a number`);
          } else {
            if (definition.min !== undefined && value < definition.min) {
              errors.push(`${definition.label} must be at least ${definition.min}`);
            }
            if (definition.max !== undefined && value > definition.max) {
              errors.push(`${definition.label} must be at most ${definition.max}`);
            }
          }
          break;
        
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${definition.label} must be an array`);
          }
          break;
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

export default SLIDE_TEMPLATE_REGISTRY; 