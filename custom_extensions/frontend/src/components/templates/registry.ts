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
import EventListTemplate from './EventListTemplate';
import SixIdeasListTemplate from './SixIdeasListTemplate';
import ContraindicationsIndicationsTemplate from './ContraindicationsIndicationsTemplate';
import MetricsAnalyticsTemplate from './MetricsAnalyticsTemplate';
import MarketShareTemplate from './MarketShareTemplate';
import TableDarkTemplate from './TableDarkTemplate';
import TableLightTemplate from './TableLightTemplate';
import ComparisonSlideTemplate from './ComparisonSlideTemplate';
import PieChartInfographicsTemplate from './PieChartInfographicsTemplate';
// import OrgChartTemplate from './OrgChartTemplate';
import { AvatarServiceSlideTemplate } from './AvatarServiceSlideTemplate';
import { AvatarWithButtonsSlideTemplate } from './AvatarWithButtonsSlideTemplate';
import { AvatarChecklistSlideTemplate } from './AvatarChecklistSlideTemplate';
import { AvatarCrmSlideTemplate } from './AvatarCrmSlideTemplate';
import { AvatarStepsSlideTemplate } from './AvatarStepsSlideTemplate';
import { CourseOverviewSlideTemplate } from './CourseOverviewSlideTemplate';
import { WorkLifeBalanceSlideTemplate } from './WorkLifeBalanceSlideTemplate';
import { ThankYouSlideTemplate } from './ThankYouSlideTemplate';
import { BenefitsListSlideTemplate } from './BenefitsListSlideTemplate';
import { HybridWorkBestPracticesSlideTemplate } from './HybridWorkBestPracticesSlideTemplate';
import { BenefitsTagsSlideTemplate } from './BenefitsTagsSlideTemplate';
import { LearningTopicsSlideTemplate } from './LearningTopicsSlideTemplate';
import { SoftSkillsAssessmentSlideTemplate } from './SoftSkillsAssessmentSlideTemplate';
import { TwoColumnSlideTemplate } from './TwoColumnSlideTemplate';
import { PhishingDefinitionSlideTemplate } from './PhishingDefinitionSlideTemplate';
import { ImpactStatementsSlideTemplate } from './ImpactStatementsSlideTemplate';
import { BarChartSlideTemplate } from './BarChartSlideTemplate';
import { CriticalThinkingSlideTemplate } from './CriticalThinkingSlideTemplate';
import { PsychologicalSafetySlideTemplate } from './PsychologicalSafetySlideTemplate';
import { DataAnalysisSlideTemplate } from './DataAnalysisSlideTemplate';

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
      title: 'Add title',
      subtitle: 'Add subtitle',
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
    icon: '📝',
    component: ContentSlideTemplate,
    defaultProps: {
      title: 'Add title',
      content: 'Add content here',
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
        description: 'Main content text',
        required: true
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
      title: 'Add title',
      subtitle: 'Add subtitle',
      imageUrl: 'https://via.placeholder.com/600x400?text=Your+Image',
      imageAlt: 'Add image description',
      imagePrompt: 'man sitting on a chair',
      imageSize: 'large',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff',
      companyName: 'Company name'
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
      },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      bullets: ['Add point 1', 'Add point 2', 'Add point 3'],
      maxColumns: 2,
      bulletStyle: 'dot',
      titleColor: '#1a1a1a',
      bulletColor: '#333333',
      backgroundColor: '#ffffff',
      imagePrompt: 'A relevant illustration for the bullet points',
      imageAlt: 'Add image description',
      companyName: 'Company name'
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
      imageAlt: { type: 'text', label: 'Image Alt', required: false },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      subtitle: 'Add subtitle',
      bullets: ['Add point 1', 'Add point 2', 'Add point 3'],
      maxColumns: 1,
      bulletStyle: 'dot',
      titleColor: '#1a1a1a',
      bulletColor: '#333333',
      backgroundColor: '#ffffff',
      imagePrompt: 'A relevant illustration for the bullet points',
      imageAlt: 'Add image description',
      companyName: 'Company name'
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
      imageAlt: { type: 'text', label: 'Image Alt', required: false },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      leftTitle: 'Add left title',
      leftContent: 'Add left content',
      leftImageUrl: '',
      leftImageAlt: '',
      leftImagePrompt: '',
      rightTitle: 'Add right title',
      rightContent: 'Add right content',
      rightImageUrl: '',
      rightImageAlt: '',
      rightImagePrompt: '',
      columnRatio: '50-50',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff',
      companyName: 'Company name'
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
      contentColor: { type: 'color', label: 'Content Color', default: '#d9e1ff' },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      steps: [
        {
          title: 'Add step 1',
          description: 'Add step description',
          icon: '1️⃣'
        },
        {
          title: 'Add step 2',
          description: 'Add step description',
          icon: '2️⃣'
        },
        {
          title: 'Add step 3',
          description: 'Add step description',
          icon: '3️⃣'
        }
      ],
      layout: 'horizontal',
      stepColor: '#007bff',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      companyName: 'Company name'
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
      },
      companyName: { type: 'text', label: 'Company Name', required: true }
    }
  },

  'challenges-solutions': {
    id: 'challenges-solutions',
    name: 'Challenges Solutions',
    description: 'Порівняння проблем і рішень з візуальними іконками',
    category: 'layout',
    icon: '⚖️',
    component: ChallengesSolutionsTemplate,
    defaultProps: {
      title: 'Add title',
      challengesTitle: 'Add challenges title',
      solutionsTitle: 'Add solutions title',
      challenges: [
        'Add challenge 1',
        'Add challenge 2',
        'Add challenge 3'
      ],
      solutions: [
        'Add solution 1',
        'Add solution 2',
        'Add solution 3'
      ],
      challengeColor: '#fef2f2',
      solutionColor: '#f0fdf4',
      challengeIconColor: '#dc2626',
      solutionIconColor: '#16a34a',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      contentColor: '#374151',
      companyName: 'Company name'
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
      },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      subtitle: 'Add subtitle',
      showAccent: true,
      accentColor: '#3b82f6',
      accentPosition: 'left',
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#6b7280',
      textAlign: 'center',
      titleSize: 'xlarge',
      subtitleSize: 'medium',
      companyName: 'Company name'
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
      },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      subtitle: 'Add subtitle',
      imageUrl: '',
      imageAlt: '',
      imagePrompt: '',
      imageSize: 'large',
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff',
      companyName: 'Company name'
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
      contentColor: { type: 'color', label: 'Content Color', default: '#d9e1ff' },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      boxes: [
        { heading: 'Add box 1', text: 'Add box description' },
        { heading: 'Add box 2', text: 'Add box description' },
        { heading: 'Add box 3', text: 'Add box description' },
        { heading: 'Add box 4', text: 'Add box description' }
      ],
      companyName: 'Company name'
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
      },
      companyName: { type: 'text', label: 'Company Name', required: true }
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
      title: 'Add title',
      steps: [
        { heading: 'Add step 1', description: 'Add step description' },
        { heading: 'Add step 2', description: 'Add step description' },
        { heading: 'Add step 3', description: 'Add step description' },
        { heading: 'Add step 4', description: 'Add step description' }
      ],
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      steps: {
        type: 'array',
        label: 'Steps',
        description: 'Array of 4 timeline steps',
        required: true,
        // arrayItemType: { type: 'object', label: 'Step', description: 'Step with heading and description', required: true }
      },
      companyName: { type: 'text', label: 'Company Name', required: true }
    }
  },

  'big-numbers': {
    id: 'big-numbers',
    name: 'Big Numbers',
    description: 'Three-column layout for highlighting key metrics or statistics with big numbers, labels, and descriptions.',
    category: 'content',
    icon: '📊',
    component: BigNumbersTemplate,
    defaultProps: {
      title: 'Add title',
      steps: [
        { value: 'Add value', label: 'Add label', description: 'Add description' },
        { value: 'Add value', label: 'Add label', description: 'Add description' },
        { value: 'Add value', label: 'Add label', description: 'Add description' },
      ],
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title' },
      steps: { type: 'array', label: 'Big Numbers' },
    },
  },
  'pyramid': {
    id: 'pyramid',
    name: 'Pyramid',
    description: 'Pyramid diagram with 3 levels and descriptions.',
    category: 'layout',
    icon: '📶',
    component: PyramidTemplate,
    defaultProps: {
      title: 'Add title',
      subtitle: 'Add subtitle',
      steps: [  // Changed from 'items' to 'steps'
        { heading: 'Add heading 1', description: 'Add description' },
        { heading: 'Add heading 2', description: 'Add description' },
        { heading: 'Add heading 3', description: 'Add description' },
      ],
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title' },
      subtitle: { type: 'text', label: 'Subtitle' },
      steps: { type: 'array', label: 'Pyramid Steps' },  // Changed from 'items' to 'steps'
    },
  },
  'event-list': {
    id: 'event-list',
    name: 'Event Dates',
    description: 'List of event dates with descriptions, visually separated.',
    category: 'special',
    icon: '📅',
    component: EventListTemplate,
    defaultProps: {
      events: [
        { date: 'April 14', description: 'You can insert here the title of the event or a small description' },
        { date: 'June 6', description: 'You can insert here the title of the event or a small description' },
        { date: 'July 12', description: 'You can insert here the title of the event or a small description' },
      ],
      titleColor: undefined, // Will use theme color
      descriptionColor: undefined, // Will use theme content color
      backgroundColor: undefined, // Will use theme background color
    },
    propSchema: {
      events: {
        type: 'array',
        label: 'Events',
        description: 'List of events with date and description',
        required: true,
      },
      titleColor: { type: 'color', label: 'Date Color', default: undefined },
      descriptionColor: { type: 'color', label: 'Description Color', default: undefined },
      backgroundColor: { type: 'color', label: 'Background', default: undefined },
    }
  },

  'six-ideas-list': {
    id: 'six-ideas-list',
    name: 'Six Ideas List',
    description: 'Two-column layout with six numbered ideas and optional image',
    category: 'content',
    icon: '💡',
    component: SixIdeasListTemplate,
    defaultProps: {
      title: 'SIX DIFFERENT IDEAS',
      ideas: [
        { number: '01', text: 'Mercury is the smallest planet in the Solar System' },
        { number: '02', text: 'Venus is the second planet from the Sun' },
        { number: '03', text: 'Despite being red, Mars is actually a cold place' },
        { number: '04', text: 'Jupiter is the biggest planet in the Solar System' },
        { number: '05', text: 'Saturn is composed of hydrogen and helium' },
        { number: '06', text: 'Neptune is the farthest planet from the Sun' }
      ],
      imageUrl: '',
      imageAlt: '',
      imagePrompt: '',
      imagePath: '',
      titleColor: undefined, // Will use theme color
      textColor: undefined, // Will use theme content color
      backgroundColor: undefined, // Will use theme background color
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      ideas: {
        type: 'array',
        label: 'Ideas',
        description: 'List of six ideas with numbers and text',
        required: true,
      },
      imageUrl: { type: 'image', label: 'Background Image' },
      imageAlt: { type: 'text', label: 'Image Alt Text' },
      imagePrompt: { type: 'text', label: 'Image Prompt' },
      imagePath: { type: 'text', label: 'Image Path' },
      titleColor: { type: 'color', label: 'Title Color', default: undefined },
      textColor: { type: 'color', label: 'Text Color', default: undefined },
      backgroundColor: { type: 'color', label: 'Background', default: undefined },
    }
  },

  'contraindications-indications': {
    id: 'contraindications-indications',
    name: 'Contraindications & Indications',
    description: 'Two-column medical template with contraindications and indications',
    category: 'special',
    icon: '💊',
    component: ContraindicationsIndicationsTemplate,
    defaultProps: {
      title: 'Contraindications and indications',
      contraindications: [
        'Describe the things patients should do here',
        'Describe the things patients should do here',
        'Describe the things patients should do here',
        'Describe the things patients should do here',
        'Describe the things patients should do here'
      ],
      indications: [
        'Describe the things patients shouldn\'t do here',
        'Describe the things patients shouldn\'t do here',
        'Describe the things patients shouldn\'t do here',
        'Describe the things patients shouldn\'t do here',
        'Describe the things patients shouldn\'t do here'
      ],
      titleColor: undefined, // Will use theme color
      contraindicationsColor: undefined, // Will use theme content color
      indicationsColor: undefined, // Will use theme content color
      backgroundColor: undefined, // Will use theme background color
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      contraindications: {
        type: 'array',
        label: 'Contraindications',
        description: 'List of things patients should not do',
        required: true,
      },
      indications: {
        type: 'array',
        label: 'Indications',
        description: 'List of things patients should do',
        required: true,
      },
      titleColor: { type: 'color', label: 'Title Color', default: undefined },
      contraindicationsColor: { type: 'color', label: 'Contraindications Color', default: undefined },
      indicationsColor: { type: 'color', label: 'Indications Color', default: undefined },
      backgroundColor: { type: 'color', label: 'Background', default: undefined },
    }
  },

  'metrics-analytics': {
    id: 'metrics-analytics',
    name: 'Metrics & Analytics',
    description: 'Six metrics with connecting timeline and numbered layout',
    category: 'content',
    icon: '📊',
    component: MetricsAnalyticsTemplate,
    defaultProps: {
      title: 'Metrics and analytics',
      metrics: [
        { number: '01', text: 'Key performance indicators (KPIs)' },
        { number: '02', text: 'Funnel analytics' },
        { number: '03', text: 'Traffic sources and attribution' },
        { number: '04', text: 'Customer lifetime value (CLV)' },
        { number: '05', text: 'A/B testing and experimentation' },
        { number: '06', text: 'Data visualization' }
      ],
      titleColor: undefined, // Will use theme color
      numberColor: undefined, // Will use theme accent color
      textColor: undefined, // Will use theme content color
      backgroundColor: undefined, // Will use theme background color
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      metrics: {
        type: 'array',
        label: 'Metrics',
        description: 'List of six metrics with numbers and descriptions',
        required: true,
      },
      titleColor: { type: 'color', label: 'Title Color', default: undefined },
      numberColor: { type: 'color', label: 'Number Color', default: undefined },
      textColor: { type: 'color', label: 'Text Color', default: undefined },
      backgroundColor: { type: 'color', label: 'Background', default: undefined },
    }
  },

  // 'org-chart': {
  //   id: 'org-chart',
  //   name: 'Organizational Chart',
  //   description: 'Hierarchical organizational structure with connecting lines',
  //   category: 'layout',
  //   icon: '🏢',
  //   // component: OrgChartTemplate,
  //   defaultProps: {
  //     title: 'Organizational chart',
  //     chartData: [
  //       { id: 'ceo', title: 'CEO', level: 0 },
  //       { id: 'manager1', title: 'Manager 1', level: 1, parentId: 'ceo' },
  //       { id: 'manager2', title: 'Manager 2', level: 1, parentId: 'ceo' },
  //       { id: 'teamleader1-1', title: 'Team Leader 1', level: 2, parentId: 'manager1' },
  //       { id: 'teamleader1-2', title: 'Team Leader 2', level: 2, parentId: 'manager1' },
  //       { id: 'teamleader2-1', title: 'Team Leader 1', level: 2, parentId: 'manager2' },
  //       { id: 'teamleader2-2', title: 'Team Leader 2', level: 2, parentId: 'manager2' },
  //       { id: 'employee1-1', title: 'Employee 1', level: 3, parentId: 'teamleader1-1' },
  //       { id: 'employee1-2', title: 'Employee 2', level: 3, parentId: 'teamleader1-1' },
  //       { id: 'employee2-1', title: 'Employee 3', level: 3, parentId: 'teamleader2-1' },
  //       { id: 'employee2-2', title: 'Employee 4', level: 3, parentId: 'teamleader2-1' },
  //       { id: 'employee3-1', title: 'Employee 5', level: 3, parentId: 'teamleader2-2' }
  //     ],
  //     titleColor: undefined, // Will use theme color
  //     textColor: undefined, // Will use theme content color
  //     backgroundColor: undefined, // Will use theme background color
  //   },
  //   propSchema: {
  //     title: { type: 'text', label: 'Title', required: true },
  //     chartData: {
  //       type: 'array',
  //       label: 'Chart Data',
  //       description: 'Hierarchical organizational data with parent-child relationships',
  //       required: true,
  //     },
  //     titleColor: { type: 'color', label: 'Title Color', default: undefined },
  //     textColor: { type: 'color', label: 'Text Color', default: undefined },
  //     backgroundColor: { type: 'color', label: 'Background', default: undefined },
  //   }
  // },

  'market-share': {
    id: 'market-share',
    name: 'Market Share',
    description: 'Market share chart with bar comparison and legend',
    category: 'content',
    icon: '📊',
    component: MarketShareTemplate,
    defaultProps: {
      title: 'Market share',
      subtitle: '',
      chartData: [
        {
          label: 'Mercury',
          description: 'Mercury is the closest planet to the Sun',
          percentage: 85,
          color: '#2a5490',
          year: '2023'
        },
        {
          label: 'Mars',
          description: 'Despite being red, Mars is a cold place',
          percentage: 40,
          color: '#9ca3af',
          year: '2024'
        }
      ],
      bottomText: 'Follow the link in the graph to modify its data and then paste the new one here. For more info, click here'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle', required: false },
      chartData: {
        type: 'array',
        label: 'Chart Data',
        required: true
      },
      bottomText: { type: 'text', label: 'Bottom Description', required: false }
    }
  },

  'comparison-slide': {
    id: 'comparison-slide',
    name: 'Comparison Slide',
    description: 'Side-by-side comparison table for contrasting concepts',
    category: 'content',
    icon: '⚖️',
    component: ComparisonSlideTemplate,
    defaultProps: {
      title: 'Comparison',
      subtitle: '',
      tableData: {
        headers: ['Feature', 'Option A', 'Option B'],
        rows: [
          ['Characteristic 1', 'Value A1', 'Value B1'],
          ['Characteristic 2', 'Value A2', 'Value B2'],
          ['Characteristic 3', 'Value A3', 'Value B3']
        ]
      }
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle', required: false },
      tableData: {
        type: 'object',
        label: 'Table Data',
        required: true
      }
    }
  },

  'table-dark': {
    id: 'table-dark',
    name: 'Table Dark',
    description: 'Dynamic table with dark theme and checkmarks',
    category: 'content',
    icon: '⬛',
    component: TableDarkTemplate,
    defaultProps: {
      title: 'This is a table',
      tableData: {
        headers: ['Mars', 'Venus', 'Jupiter'],
        rows: [
          ['Task 1', '✓', '✗', '✓'],
          ['Task 2', '✗', '✓', '✗'],
          ['Task 3', '✓', '✗', '✓'],
          ['Task 4', '✗', '✓', '✗']
        ]
      },
      showCheckmarks: true,
      backgroundColor: '#1a1a1a',
      titleColor: '#ffffff',
      headerColor: '#ffffff',
      textColor: '#ffffff',
      tableBackgroundColor: '#2a2a2a',
      headerBackgroundColor: '#3a3a3a',
      borderColor: '#4a4a4a',
      checkmarkColor: '#10b981',
      crossColor: '#ef4444'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      tableData: {
        type: 'object',
        label: 'Table Data',
        required: true
      },
      showCheckmarks: { type: 'boolean', label: 'Show Checkmarks', default: true },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#1a1a1a' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      headerColor: { type: 'color', label: 'Header Color', default: '#ffffff' },
      textColor: { type: 'color', label: 'Text Color', default: '#ffffff' },
      tableBackgroundColor: { type: 'color', label: 'Table Background', default: '#2a2a2a' },
      headerBackgroundColor: { type: 'color', label: 'Header Background', default: '#3a3a3a' },
      borderColor: { type: 'color', label: 'Border Color', default: '#4a4a4a' },
      checkmarkColor: { type: 'color', label: 'Checkmark Color', default: '#10b981' },
      crossColor: { type: 'color', label: 'Cross Color', default: '#ef4444' }
    }
  },

  'table-light': {
    id: 'table-light',
    name: 'Table Light',
    description: 'Dynamic table with light theme',
    category: 'content',
    icon: '⬜',
    component: TableLightTemplate,
    defaultProps: {
      title: 'This is a table',
      tableData: {
        headers: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'],
        rows: [
          ['Mercury', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Mars', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Saturn', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Venus', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Jupiter', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Earth', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Moon', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX']
        ]
      },
      backgroundColor: '#f8fafc',
      titleColor: '#1f2937',
      headerColor: '#ffffff',
      textColor: '#374151',
      tableBackgroundColor: '#ffffff',
      headerBackgroundColor: '#0ea5e9',
      borderColor: '#e5e7eb',
      accentColor: '#0ea5e9'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      tableData: {
        type: 'object',
        label: 'Table Data',
        required: true
      },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#f8fafc' },
      titleColor: { type: 'color', label: 'Title Color', default: '#1f2937' },
      headerColor: { type: 'color', label: 'Header Color', default: '#ffffff' },
      textColor: { type: 'color', label: 'Text Color', default: '#374151' },
      tableBackgroundColor: { type: 'color', label: 'Table Background', default: '#ffffff' },
      headerBackgroundColor: { type: 'color', label: 'Header Background', default: '#0ea5e9' },
      borderColor: { type: 'color', label: 'Border Color', default: '#e5e7eb' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#0ea5e9' }
    }
  },

  'pie-chart-infographics': {
    id: 'pie-chart-infographics',
    name: 'Pie Chart Infographics',
    description: 'Pie chart with detailed monthly infographics',
    category: 'content',
    icon: '🥧',
    component: PieChartInfographicsTemplate,
    defaultProps: {
      title: 'Pie Chart Infographics',
      chartData: {
        segments: [
          { label: '15%', percentage: 15, color: '#0ea5e9', description: 'Blue segment' },
          { label: '20%', percentage: 20, color: '#06b6d4', description: 'Cyan segment' },
          { label: '25%', percentage: 25, color: '#67e8f9', description: 'Light blue segment' },
          { label: '20%', percentage: 20, color: '#0891b2', description: 'Dark blue segment' },
          { label: '12%', percentage: 12, color: '#f97316', description: 'Orange segment' },
          { label: '8%', percentage: 8, color: '#fb923c', description: 'Light orange segment' }
        ]
      },
      monthlyData: [
        { month: 'Month 1', description: 'Mercury is the smallest planet of them all', color: '#0ea5e9' },
        { month: 'Month 2', description: 'Jupiter is the biggest planet of them all', color: '#0ea5e9' },
        { month: 'Month 3', description: 'Venus has a very poisonous atmosphere', color: '#0ea5e9' },
        { month: 'Month 4', description: 'Saturn is a gas giant and has rings', color: '#f97316' },
        { month: 'Month 5', description: 'Neptune is far away from Earth', color: '#f97316' },
        { month: 'Month 6', description: 'Despite being red, Mars is actually cold', color: '#f97316' }
      ],
      backgroundColor: '#ffffff',
      titleColor: '#1f2937',
      textColor: '#374151',
      chartSize: 280,
      descriptionText: 'To modify this graph, click on it, follow the link, change the data and paste it here'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      chartData: {
        type: 'array',
        label: 'Chart Data',
        required: true
      },
      monthlyData: {
        type: 'array',
        label: 'Monthly Data',
        required: true
      },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      titleColor: { type: 'color', label: 'Title Color', default: '#1f2937' },
      textColor: { type: 'color', label: 'Text Color', default: '#374151' },
      chartSize: { type: 'number', label: 'Chart Size', default: 280, min: 200, max: 400 },
      descriptionText: { type: 'text', label: 'Description Text', required: false }
    }
  }
  'avatar-service-slide': {
    id: 'avatar-service-slide',
    name: 'Avatar Service Slide',
    description: 'Slide with avatar and service content - white background with dark shape',
    category: 'media',
    icon: '👤',
    component: AvatarServiceSlideTemplate,
    defaultProps: {
      title: 'Клиентский сервис - это основа успеха',
      subtitle: '',
      content: 'Сегодня разберём, как сделать сервис тёплым, профессиональным и запоминающимся',
      avatarPath: '',
      avatarAlt: 'Avatar',
      backgroundColor: '#ffffff',
      titleColor: '#e91e63',
      subtitleColor: '#000000',
      contentColor: '#e91e63',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle' },
      content: { type: 'text', label: 'Content' },
      avatarPath: { type: 'image', label: 'Avatar Image' },
      avatarAlt: { type: 'text', label: 'Avatar Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      titleColor: { type: 'color', label: 'Title Color', default: '#e91e63' },
      subtitleColor: { type: 'color', label: 'Subtitle Color', default: '#000000' },
      contentColor: { type: 'color', label: 'Content Color', default: '#e91e63' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'avatar-with-buttons': {
    id: 'avatar-with-buttons',
    name: 'Avatar with Buttons',
    description: 'Slide with avatar and interactive buttons - dark background',
    category: 'media',
    icon: '🔘',
    component: AvatarWithButtonsSlideTemplate,
    defaultProps: {
      title: 'Продуманный сервис ощущается сразу',
      buttons: [
        { text: 'Внимание', color: '#e91e63' },
        { text: 'Скорость', color: '#e91e63' },
        { text: 'Тепло', color: '#e91e63' },
        { text: 'Забота', color: '#e91e63' }
      ],
      avatarPath: '',
      avatarAlt: 'Avatar',
      backgroundColor: '#1a1a2e',
      titleColor: '#e91e63',
      buttonColor: '#e91e63',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      buttons: { type: 'array', label: 'Buttons' },
      avatarPath: { type: 'image', label: 'Avatar Image' },
      avatarAlt: { type: 'text', label: 'Avatar Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#1a1a2e' },
      titleColor: { type: 'color', label: 'Title Color', default: '#e91e63' },
      buttonColor: { type: 'color', label: 'Button Color', default: '#e91e63' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'avatar-checklist': {
    id: 'avatar-checklist',
    name: 'Avatar Checklist',
    description: 'Slide with avatar and checklist - white background with pink shapes',
    category: 'media',
    icon: '✅',
    component: AvatarChecklistSlideTemplate,
    defaultProps: {
      title: 'Как звучать профессионально',
      items: [
        { text: '«Позвольте я помогу»', isPositive: true },
        { text: '«С удовольствием уточню»', isPositive: true },
        { text: '«Спасибо, что обратили внимание»', isPositive: true },
        { text: 'Исключаем холодные фразы и неуверенность', isPositive: false }
      ],
      avatarPath: '',
      avatarAlt: 'Avatar',
      backgroundColor: '#ffffff',
      titleColor: '#e91e63',
      itemColor: '#000000',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      items: { type: 'array', label: 'Checklist Items' },
      avatarPath: { type: 'image', label: 'Avatar Image' },
      avatarAlt: { type: 'text', label: 'Avatar Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      titleColor: { type: 'color', label: 'Title Color', default: '#e91e63' },
      itemColor: { type: 'color', label: 'Item Color', default: '#000000' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'avatar-steps': {
    id: 'avatar-steps',
    name: 'Avatar Steps',
    description: 'Slide with avatar and process steps - dark background',
    category: 'media',
    icon: '📋',
    component: AvatarStepsSlideTemplate,
    defaultProps: {
      title: 'Каждый шаг - это часть сервиса',
      steps: [
        'Приветствие',
        'Консультация',
        'Комфорт во время',
        'Финальные рекомендации',
        'Прощание и отзыв'
      ],
      avatarPath: '',
      avatarAlt: 'Avatar',
      backgroundColor: '#1a1a2e',
      titleColor: '#ffffff',
      stepColor: '#e91e63',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      steps: { type: 'array', label: 'Steps' },
      avatarPath: { type: 'image', label: 'Avatar Image' },
      avatarAlt: { type: 'text', label: 'Avatar Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#1a1a2e' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      stepColor: { type: 'color', label: 'Step Color', default: '#e91e63' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'avatar-crm': {
    id: 'avatar-crm',
    name: 'Avatar CRM',
    description: 'Slide with avatar and CRM interface - dark background',
    category: 'media',
    icon: '💼',
    component: AvatarCrmSlideTemplate,
    defaultProps: {
      title: 'Личное отношение - залог следующих ВИЗИТОВ',
      subtitle: 'Помните детали, интересуйтесь, сохраняйте тёплый контакт',
      content: 'Клиент это почувствует',
      avatarPath: '',
      avatarAlt: 'Avatar',
      backgroundColor: '#1a1a2e',
      titleColor: '#e91e63',
      subtitleColor: '#ffffff',
      contentColor: '#ffffff',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle' },
      content: { type: 'text', label: 'Content' },
      avatarPath: { type: 'image', label: 'Avatar Image' },
      avatarAlt: { type: 'text', label: 'Avatar Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#1a1a2e' },
      titleColor: { type: 'color', label: 'Title Color', default: '#e91e63' },
      subtitleColor: { type: 'color', label: 'Subtitle Color', default: '#ffffff' },
      contentColor: { type: 'color', label: 'Content Color', default: '#ffffff' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'course-overview-slide': {
    id: 'course-overview-slide',
    name: 'Course Overview Slide',
    description: 'Slide with purple panel on left and image on right',
    category: 'title',
    icon: '📚',
    component: CourseOverviewSlideTemplate,
    defaultProps: {
      title: 'Course',
      subtitle: 'Overview',
      imagePath: '',
      imageAlt: 'Course overview image',
      backgroundColor: '#110c35',
      titleColor: '#ffffff',
      subtitleColor: '#d9e1ff',
      accentColor: '#f35657',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 50 },
      subtitle: { type: 'text', label: 'Subtitle', maxLength: 50 },
      imagePath: { type: 'image', label: 'Image' },
      imageAlt: { type: 'text', label: 'Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#110c35' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      subtitleColor: { type: 'color', label: 'Subtitle Color', default: '#d9e1ff' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#f35657' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'work-life-balance-slide': {
    id: 'work-life-balance-slide',
    name: 'Work-Life Balance Slide',
    description: 'Slide with dark olive background and arched image area',
    category: 'content',
    icon: '⚖️',
    component: WorkLifeBalanceSlideTemplate,
    defaultProps: {
      title: 'Work-life balance',
      content: 'Maintaining a healthy work-life balance allows me to be more present and engaged both at work and in my personal life, resulting in increased productivity and overall satisfaction.',
      imagePath: '',
      imageAlt: 'Work-life balance image',
      backgroundColor: '#110c35',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff',
      accentColor: '#f35657',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      content: { type: 'text', label: 'Content', maxLength: 500 },
      imagePath: { type: 'image', label: 'Image' },
      imageAlt: { type: 'text', label: 'Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#110c35' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      contentColor: { type: 'color', label: 'Content Color', default: '#d9e1ff' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#f35657' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    },
  },

  'thank-you-slide': {
    id: 'thank-you-slide',
    name: 'Thank You Slide',
    description: 'Contact information slide with profile image',
    category: 'special',
    icon: '🙏',
    component: ThankYouSlideTemplate,
    defaultProps: {
      title: 'Thank you',
      email: 'hello@gmail.com',
      phone: '+1 (305) 212-4253',
      address: '374 Creekside Road Palmetto',
      postalCode: 'F134221',
      companyName: 'Company name',
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      backgroundColor: '#110c35',
      titleColor: '#ffffff',
      textColor: '#d9e1ff',
      accentColor: '#f35657'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 50 },
      email: { type: 'text', label: 'Email', required: true },
      phone: { type: 'text', label: 'Phone', required: true },
      address: { type: 'text', label: 'Address', required: true },
      postalCode: { type: 'text', label: 'Postal Code', required: true },
      companyName: { type: 'text', label: 'Company Name', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#110c35' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      textColor: { type: 'color', label: 'Text Color', default: '#d9e1ff' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#f35657' }
    }
  },

  'benefits-list-slide': {
    id: 'benefits-list-slide',
    name: 'Benefits List Slide',
    description: 'Slide with benefits list, navigation circles, and profile image',
    category: 'content',
    icon: '📋',
    component: BenefitsListSlideTemplate,
    defaultProps: {
      title: 'Benefits',
      subtitle: 'Employment',
      description: 'Here is a list of benefits that you can offer to your employees to maintain small business compliance:',
      benefits: [
        "Workers' compensation",
        "Unemployment insurance",
        "Disability insurance",
        "Health insurance",
        "COBRA benefits",
        "Leave of absence"
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      currentStep: 3,
      totalSteps: 4,
      backgroundColor: '#261c4e',
      titleColor: '#ffffff',
      contentColor: '#d9e1ff',
      accentColor: '#4CAF50',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 50 },
      subtitle: { type: 'text', label: 'Subtitle', required: true, maxLength: 50 },
      description: { type: 'text', label: 'Description', required: true },
      benefits: { type: 'array', label: 'Benefits List', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      currentStep: { type: 'number', label: 'Current Step', min: 1, max: 10 },
      totalSteps: { type: 'number', label: 'Total Steps', min: 1, max: 10 },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#261c4e' },
      titleColor: { type: 'color', label: 'Title Color', default: '#ffffff' },
      contentColor: { type: 'color', label: 'Content Color', default: '#d9e1ff' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#4CAF50' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    }
  },

  'hybrid-work-best-practices-slide': {
    id: 'hybrid-work-best-practices-slide',
    name: 'Hybrid Work Best Practices',
    description: 'Slide with numbered best practices and team image',
    category: 'content',
    icon: '🏢',
    component: HybridWorkBestPracticesSlideTemplate,
    defaultProps: {
      title: 'HYBRID WORK BEST PRACTICES',
      subtitle: '',
      mainStatement: 'To adopt a hybrid work model, you need the right people, processes, and technology.',
      practices: [
        {
          number: 1,
          title: 'Communicate with your employees',
          description: 'When you roll out hybrid work, your decisions will affect everyone in your workforce.'
        },
        {
          number: 2,
          title: 'Work with HR and IT',
          description: 'Working cross-functionally is important when adopting hybrid work to ensure your workplace technology is seamless.'
        },
        {
          number: 3,
          title: 'Create the right work environment',
          description: 'Hybrid work means the office must be a place where employees want to work, so creating a dynamic workplace is important.'
        },
        {
          number: 4,
          title: 'Delight and connect remote',
          description: 'Finding ways to connect and delight everyone is an important part of keeping employee happiness and engagement high.'
        }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      teamImagePath: '',
      teamImageAlt: 'Team meeting',
      backgroundColor: '#ffffff',
      titleColor: '#333333',
      contentColor: '#666666',
      accentColor: '#4CAF50',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      subtitle: { type: 'text', label: 'Subtitle', maxLength: 100 },
      mainStatement: { type: 'text', label: 'Main Statement', required: true },
      practices: { type: 'array', label: 'Best Practices', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      teamImagePath: { type: 'image', label: 'Team Image' },
      teamImageAlt: { type: 'text', label: 'Team Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      titleColor: { type: 'color', label: 'Title Color', default: '#333333' },
      contentColor: { type: 'color', label: 'Content Color', default: '#666666' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#4CAF50' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    }
  },

  'benefits-tags-slide': {
    id: 'benefits-tags-slide',
    name: 'Benefits Tags Slide',
    description: 'Slide with benefit tags and profile image',
    category: 'content',
    icon: '🏷️',
    component: BenefitsTagsSlideTemplate,
    defaultProps: {
      title: 'Benefits',
      tags: [
        { text: 'Better decisions', isHighlighted: false },
        { text: 'Insight', isHighlighted: false },
        { text: 'Growth', isHighlighted: false },
        { text: 'Progress', isHighlighted: false },
        { text: 'Creativity', isHighlighted: false },
        { text: 'Innovative solutions', isHighlighted: true }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      backgroundColor: '#f5f5f5',
      titleColor: '#333333',
      contentColor: '#666666',
      accentColor: '#ff6b35',
      companyName: 'Company Logo',
      companyLogoPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 50 },
      tags: { type: 'array', label: 'Tags', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#f5f5f5' },
      titleColor: { type: 'color', label: 'Title Color', default: '#333333' },
      contentColor: { type: 'color', label: 'Content Color', default: '#666666' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#ff6b35' },
      companyName: { type: 'text', label: 'Company Name', required: true },
      companyLogoPath: { type: 'image', label: 'Company Logo' }
    }
  },

  'learning-topics-slide': {
    id: 'learning-topics-slide',
    name: 'Learning Topics Slide',
    description: 'Slide with learning topics and profile image',
    category: 'content',
    icon: '📚',
    component: LearningTopicsSlideTemplate,
    defaultProps: {
      title: 'You will learn about:',
      subtitle: 'Employment',
      topics: [
        'Payroll',
        'Taxes',
        'Benefits',
        'Hiring'
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      backgroundColor: '#ffffff',
      titleColor: '#333333',
      contentColor: '#666666',
      accentColor: '#9c27b0',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      subtitle: { type: 'text', label: 'Subtitle', required: true, maxLength: 50 },
      topics: { type: 'array', label: 'Topics', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      titleColor: { type: 'color', label: 'Title Color', default: '#333333' },
      contentColor: { type: 'color', label: 'Content Color', default: '#666666' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#9c27b0' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    }
  },

  'soft-skills-assessment-slide': {
    id: 'soft-skills-assessment-slide',
    name: 'Soft Skills Assessment Slide',
    description: 'Slide with assessment tips and profile image',
    category: 'content',
    icon: '🎯',
    component: SoftSkillsAssessmentSlideTemplate,
    defaultProps: {
      title: 'How do you assess soft skills in candidates?',
      tips: [
        { text: "Know what you're looking for in potential hires beforehand.", isHighlighted: false },
        { text: "Ask behavioral questions to learn how they've used soft skills in previous jobs", isHighlighted: false }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      backgroundColor: '#ffffff',
      titleColor: '#333333',
      contentColor: '#666666',
      accentColor: '#ff6b35',
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      tips: { type: 'array', label: 'Tips', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      backgroundColor: { type: 'color', label: 'Background Color', default: '#ffffff' },
      titleColor: { type: 'color', label: 'Title Color', default: '#333333' },
      contentColor: { type: 'color', label: 'Content Color', default: '#666666' },
      accentColor: { type: 'color', label: 'Accent Color', default: '#ff6b35' },
      companyName: { type: 'text', label: 'Company Name', required: true }
    }
  },

  'two-column-slide': {
    id: 'two-column-slide',
    name: 'Two Column Slide',
    description: 'Slide with avatar and text on left, image on right',
    category: 'content',
    icon: '📄',
    component: TwoColumnSlideTemplate,
    defaultProps: {
      title: 'We expect you to meet or exceed these metrics',
      content: 'We expect you to meet or exceed these metrics, and we will provide you with regular feedback and performance evaluations to help you track your progress and identify areas for improvement. We believe that by embodying these qualities and achieving your performance metrics, you will contribute to the success of our company and your own personal growth and development.',
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      rightImagePath: '',
      rightImageAlt: 'Right side image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      content: { type: 'text', label: 'Content', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      rightImagePath: { type: 'image', label: 'Right Side Image' },
      rightImageAlt: { type: 'text', label: 'Right Side Image Alt Text' }
    }
  },

  'phishing-definition-slide': {
    id: 'phishing-definition-slide',
    name: 'Phishing Definition Slide',
    description: 'Slide with phishing definitions and image',
    category: 'content',
    icon: '🛡️',
    component: PhishingDefinitionSlideTemplate,
    defaultProps: {
      title: 'What is phishing?',
      definitions: [
        "Using data to access a victim's account and withdrawing money or making an online transaction, e.g. buying a product or service.",
        "Using data to open fake bank accounts or credit cards in the name of the victim and using them to cash out illegal checks, etc.",
        "Using the victim's computer systems to install viruses and worms and disseminating phishing emails further to their contacts.",
        "Using data from some systems to gain access to high value organizational data such as banking information, employee credentials, social security numbers, etc."
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      rightImagePath: '',
      rightImageAlt: 'Right side image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      definitions: { type: 'array', label: 'Definitions', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      rightImagePath: { type: 'image', label: 'Right Side Image' },
      rightImageAlt: { type: 'text', label: 'Right Side Image Alt Text' }
    }
  },

  'impact-statements-slide': {
    id: 'impact-statements-slide',
    name: 'Impact Statements Slide',
    description: 'Slide with impact statements and statistics',
    category: 'content',
    icon: '📊',
    component: ImpactStatementsSlideTemplate,
    defaultProps: {
      title: 'Here are some impact value statements backed by numbers:',
      statements: [
        { number: '50%', description: 'decrease in turnover rates.' },
        { number: '$2.8B', description: 'the cost of harassment to businesses in the United States annually.' },
        { number: '40%', description: 'increase in employee morale and engagement' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',

    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      statements: { type: 'array', label: 'Statements', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },

    }
  },

  'bar-chart-slide': {
    id: 'bar-chart-slide',
    name: 'Bar Chart Slide',
    description: 'Slide with interactive bar chart and data visualization',
    category: 'content',
    icon: '📊',
    component: BarChartSlideTemplate,
    defaultProps: {
      bars: [
        { percentage: '20%', description: 'Decrease in insurance costs', height: 60 },
        { percentage: '30%', description: 'Increase in employee morale and satisfaction', height: 90 },
        { percentage: '52%', description: 'Decrease in insurance costs', height: 156 }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      website: 'www.company.com',
      date: 'Date Goes Here',
      pageNumber: 'Page Number'
    },
    propSchema: {
      bars: { type: 'array', label: 'Chart Bars', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      website: { type: 'text', label: 'Website', maxLength: 100 },
      date: { type: 'text', label: 'Date', maxLength: 50 },
      pageNumber: { type: 'text', label: 'Page Number', maxLength: 20 }
    }
  },

  'critical-thinking-slide': {
    id: 'critical-thinking-slide',
    name: 'Critical Thinking Slide',
    description: 'Slide with highlighted phrases and key concepts',
    category: 'content',
    icon: '🧠',
    component: CriticalThinkingSlideTemplate,
    defaultProps: {
      title: 'Critical Thinking\nand Problem Solving',
      content: 'Critical thinking and problem solving are essential skills that empower individuals to analyze information, make informed decisions, and overcome challenges.',
      highlightedPhrases: ['analyze information,', 'make informed decisions,', 'overcome challenges.'],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      companyLogoPath: '',
      companyLogoAlt: 'Company logo'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      content: { type: 'text', label: 'Content', required: true, maxLength: 500 },
      highlightedPhrases: { type: 'array', label: 'Highlighted Phrases', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      companyLogoPath: { type: 'image', label: 'Company Logo' },
      companyLogoAlt: { type: 'text', label: 'Company Logo Alt Text' }
    }
  },

  'psychological-safety-slide': {
    id: 'psychological-safety-slide',
    name: 'Psychological Safety Slide',
    description: 'Slide with centered card design and key message',
    category: 'content',
    icon: '🛡️',
    component: PsychologicalSafetySlideTemplate,
    defaultProps: {
      title: 'Fostering Psychological Safety',
      content: 'Studies indicate that teams with a high level of psychological safety have a 21% higher chance of delivering high-quality results.',
      profileImagePath: '',
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      content: { type: 'text', label: 'Content', required: true, maxLength: 300 },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
  },

  'data-analysis-slide': {
    id: 'data-analysis-slide',
    name: 'Data Analysis Slide',
    description: 'Slide with profile image and Excel icon for data analysis topics',
    category: 'content',
    icon: '📈',
    component: DataAnalysisSlideTemplate,
    defaultProps: {
      title: 'Introduction to Data Analysis',
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      excelIconPath: '',
      excelIconAlt: 'Excel icon'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      excelIconPath: { type: 'image', label: 'Excel Icon' },
      excelIconAlt: { type: 'text', label: 'Excel Icon Alt Text' }
    }
  }
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

export function validateTemplateProps(templateId: string, props: any): { valid: boolean; errors: string[] } {
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