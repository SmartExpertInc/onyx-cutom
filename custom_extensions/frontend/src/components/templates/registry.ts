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
import ChallengesSolutionsTemplate from './ChallengesSolutionsTemplate';
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
import { SolutionStepsSlideTemplate } from './SolutionStepsSlideTemplate';
import { ProofStatisticsSlideTemplate } from './ProofStatisticsSlideTemplate';
import { MarketingAgencyThankYouSlideTemplate } from './MarketingAgencyThankYouSlideTemplate';
import { TableOfContentsSlideTemplate } from './TableOfContentsSlideTemplate';
import { CompanyToolsResourcesSlideTemplate } from './CompanyToolsResourcesSlideTemplate';
import { StaySafeTipsSlideTemplate } from './StaySafeTipsSlideTemplate';
import { ResourcesListSlideTemplate } from './ResourcesListSlideTemplate';
import { CourseRulesTimelineSlideTemplate } from './CourseRulesTimelineSlideTemplate';
import { ResilienceBehaviorsSlideTemplate } from './ResilienceBehaviorsSlideTemplate';
import { SoftSkillsTypesSlideTemplate } from './SoftSkillsTypesSlideTemplate';
import { PhishingRiseSlideTemplate } from './PhishingRiseSlideTemplate';
import { AiPharmaMarketGrowthSlideTemplate } from './AiPharmaMarketGrowthSlideTemplate';
import { KpiUpdateSlideTemplate } from './KpiUpdateSlideTemplate';
import { InterestGrowthSlideTemplate } from './InterestGrowthSlideTemplate';
import { ConnectionSlideTemplate } from './ConnectionSlideTemplate';
import HighPerformingTeamsSlideTemplate from './HighPerformingTeamsSlideTemplate';
import EnterpriseRoadmapSlideTemplate from './EnterpriseRoadmapSlideTemplate';
import ConcentricPhishingRiseSlideTemplate from './ConcentricPhishingRiseSlideTemplate';
import ImpactMetricsRightImageSlideTemplate from './ImpactMetricsRightImageSlideTemplate';
import CultureValuesThreeColumnsSlideTemplate from './CultureValuesThreeColumnsSlideTemplate';
import KeySkillsDataAnalysisSlideTemplate from './KeySkillsDataAnalysisSlideTemplate';
import ChangeManagementTabsSlideTemplate from './ChangeManagementTabsSlideTemplate';
import BenefitsAndPerksColumnsSlideTemplate from './BenefitsAndPerksColumnsSlideTemplate';
import OralHygieneSignsSlideTemplate from './OralHygieneSignsSlideTemplate';
import ResourcesSlideTemplate from './ResourcesSlideTemplate';
import LeftBarAvatarImageSlideTemplate from './LeftBarAvatarImageSlideTemplate';
import ProblemsGridSlideTemplate from './ProblemsGridSlideTemplate';
import DataDrivenInsightsSlideTemplate from './DataDrivenInsightsSlideTemplate';
import DeiMethodsSlideTemplate from './DeiMethodsSlideTemplate';
import SoftSkillsDevelopSlideTemplate from './SoftSkillsDevelopSlideTemplate';
import PercentCirclesSlideTemplate from './PercentCirclesSlideTemplate';
import IntroductionDataAnalysisSlideTemplate from './IntroductionDataAnalysisSlideTemplate';
import ImpactValueStatementsSlideTemplate from './ImpactValueStatementsSlideTemplate';
import TopicsSlideTemplate from './TopicsSlideTemplate';

// ========== OLD TEMPLATE IMPORTS ==========
import AiPharmaMarketGrowthSlideTemplate_old from './AiPharmaMarketGrowthSlideTemplate_old';
import BarChartInfographicsTemplate_old from './BarChartInfographicsTemplate_old';
import BarChartSlideTemplate_old from './BarChartSlideTemplate_old';
import BenefitsAndPerksColumnsSlideTemplate_old from './BenefitsAndPerksColumnsSlideTemplate_old';
import BenefitsListSlideTemplate_old from './BenefitsListSlideTemplate_old';
import BenefitsTagsSlideTemplate_old from './BenefitsTagsSlideTemplate_old';
import BigImageLeftTemplate_old from './BigImageLeftTemplate_old';
import BigImageTopTemplate_old from './BigImageTopTemplate_old';
import BigNumbersTemplate_old from './BigNumbersTemplate_old';
import BulletPointsRightTemplate_old from './BulletPointsRightTemplate_old';
import BulletPointsTemplate_old from './BulletPointsTemplate_old';
import ChallengesSolutionsTemplate_old from './ChallengesSolutionsTemplate_old';
import ChangeManagementTabsSlideTemplate_old from './ChangeManagementTabsSlideTemplate_old';
import ChartTemplate_old from './ChartTemplate_old';
import CompanyToolsResourcesSlideTemplate_old from './CompanyToolsResourcesSlideTemplate_old';
import ComparisonSlideTemplate_old from './ComparisonSlideTemplate_old';
import ConcentricPhishingRiseSlideTemplate_old from './ConcentricPhishingRiseSlideTemplate_old';
import ConnectionSlideTemplate_old from './ConnectionSlideTemplate_old';
import ContentSlideTemplate_old from './ContentSlideTemplate_old';
import ContraindicationsIndicationsTemplate_old from './ContraindicationsIndicationsTemplate_old';
import CourseOverviewSlideTemplate_old from './CourseOverviewSlideTemplate_old';
import CourseRulesTimelineSlideTemplate_old from './CourseRulesTimelineSlideTemplate_old';
import CriticalThinkingSlideTemplate_old from './CriticalThinkingSlideTemplate_old';
import CultureValuesThreeColumnsSlideTemplate_old from './CultureValuesThreeColumnsSlideTemplate_old';
import DataAnalysisSlideTemplate_old from './DataAnalysisSlideTemplate_old';
import DataDrivenInsightsSlideTemplate_old from './DataDrivenInsightsSlideTemplate_old';
import DeiMethodsSlideTemplate_old from './DeiMethodsSlideTemplate_old';
import EnterpriseRoadmapSlideTemplate_old from './EnterpriseRoadmapSlideTemplate_old';
import EventListTemplate_old from './EventListTemplate_old';
import FourBoxGridTemplate_old from './FourBoxGridTemplate_old';
import HeroTitleSlideTemplate_old from './HeroTitleSlideTemplate_old';
import HighPerformingTeamsSlideTemplate_old from './HighPerformingTeamsSlideTemplate_old';
import HybridWorkBestPracticesSlideTemplate_old from './HybridWorkBestPracticesSlideTemplate_old';
import ImpactMetricsRightImageSlideTemplate_old from './ImpactMetricsRightImageSlideTemplate_old';
import ImpactStatementsSlideTemplate_old from './ImpactStatementsSlideTemplate_old';
import ImpactValueStatementsSlideTemplate_old from './ImpactValueStatementsSlideTemplate_old';
import InterestGrowthSlideTemplate_old from './InterestGrowthSlideTemplate_old';
import IntroductionDataAnalysisSlideTemplate_old from './IntroductionDataAnalysisSlideTemplate_old';
import KeySkillsDataAnalysisSlideTemplate_old from './KeySkillsDataAnalysisSlideTemplate_old';
import KpiUpdateSlideTemplate_old from './KpiUpdateSlideTemplate_old';
import LearningTopicsSlideTemplate_old from './LearningTopicsSlideTemplate_old';
import MarketingAgencyThankYouSlideTemplate_old from './MarketingAgencyThankYouSlideTemplate_old';
import MarketShareTemplate_old from './MarketShareTemplate_old';
import MetricsAnalyticsTemplate_old from './MetricsAnalyticsTemplate_old';
import OralHygieneSignsSlideTemplate_old from './OralHygieneSignsSlideTemplate_old';
import OrgChartTemplate_old from './OrgChartTemplate_old';
import PercentCirclesSlideTemplate_old from './PercentCirclesSlideTemplate_old';
import PhishingDefinitionSlideTemplate_old from './PhishingDefinitionSlideTemplate_old';
import PhishingRiseSlideTemplate_old from './PhishingRiseSlideTemplate_old';
import PieChartInfographicsTemplate_old from './PieChartInfographicsTemplate_old';
import ProblemsGridSlideTemplate_old from './ProblemsGridSlideTemplate_old';
import ProcessStepsTemplate_old from './ProcessStepsTemplate_old';
import ProofStatisticsSlideTemplate_old from './ProofStatisticsSlideTemplate_old';
import PsychologicalSafetySlideTemplate_old from './PsychologicalSafetySlideTemplate_old';
import PyramidTemplate_old from './PyramidTemplate_old';
import ResilienceBehaviorsSlideTemplate_old from './ResilienceBehaviorsSlideTemplate_old';
import ResourcesListSlideTemplate_old from './ResourcesListSlideTemplate_old';
import ResourcesSlideTemplate_old from './ResourcesSlideTemplate_old';
import SixIdeasListTemplate_old from './SixIdeasListTemplate_old';
import SoftSkillsAssessmentSlideTemplate_old from './SoftSkillsAssessmentSlideTemplate_old';
import SoftSkillsDevelopSlideTemplate_old from './SoftSkillsDevelopSlideTemplate_old';
import SoftSkillsTypesSlideTemplate_old from './SoftSkillsTypesSlideTemplate_old';
import SolutionStepsSlideTemplate_old from './SolutionStepsSlideTemplate_old';
import StaySafeTipsSlideTemplate_old from './StaySafeTipsSlideTemplate_old';
import TableDarkTemplate_old from './TableDarkTemplate_old';
import TableLightTemplate_old from './TableLightTemplate_old';
import TableOfContentsSlideTemplate_old from './TableOfContentsSlideTemplate_old';
import ThankYouSlideTemplate_old from './ThankYouSlideTemplate_old';
import TimelineTemplate_old from './TimelineTemplate_old';
import TitleSlideTemplate_old from './TitleSlideTemplate_old';
import TopicsSlideTemplate_old from './TopicsSlideTemplate_old';
import TwoColumnSlideTemplate_old from './TwoColumnSlideTemplate_old';
import TwoColumnTemplate_old from './TwoColumnTemplate_old';
import WorkLifeBalanceSlideTemplate_old from './WorkLifeBalanceSlideTemplate_old';

export const SLIDE_TEMPLATE_REGISTRY: TemplateRegistry = {
  'title-slide': {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Opening slide with title, subtitle, and optional author/date information',
    category: 'title',
    icon: '🎯',
    component: TitleSlideTemplate,
    defaultProps: {
      title: 'Your title here',
      subtitle: 'Add a short description.',
      author: '',
      date: '',
      backgroundColor: 'linear-gradient(90deg, #002D91 0%, #000C5B 100%)',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
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
      title: 'Spring picnic meetup',
      content: 'Join us for an afternoon of fun!',
      backgroundColor: 'linear-gradient(90deg, #002D91 0%, #000C5B 100%)',
      titleColor: '#ffffff',
      contentColor: '#ffffff',
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
      title: 'Problem',
      subtitle: '',
      bullets: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed vestibulum nunc, eget aliquam felis.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed vestibulum nunc, eget aliquam felis.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed vestibulum nunc, eget aliquam felis.'
      ],
      maxColumns: 1,
      bulletStyle: 'number',
      titleColor: '#000000',
      bulletColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      imagePrompt: 'Three people collaborating around a laptop on a wooden table',
      imageAlt: 'Team collaboration',
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
      leftTitle: 'Assess risks for the organization.',
      leftContent: 'Present with Canva like a professional using presenter mode.',
      leftImagePath: '',
      leftImageAlt: '',
      rightTitle: 'Assess risks for the organization.',
      rightContent: 'Present with Canva like a professional using presenter mode.',
      rightImagePath: '',
      rightImageAlt: '',
      backgroundColor: 'linear-gradient(90deg, #002D91 0%, #000C5B 100%)',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff'
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
      title: 'The Stages of Research',
      subtitle: 'Miss Jones Science Class',
      steps: [
        {
          title: 'PROBLEM',
          description: 'Identify a problem and form a thesis statement.'
        },
        {
          title: 'READ',
          description: 'Review literature related to your topic.'
        },
        {
          title: 'HYPOTHESIZE',
          description: 'Come up with an educated guess based on your research.'
        },
        {
          title: 'RESEARCH',
          description: 'Read resources to support your hypothesis.'
        },
        {
          title: 'CONCLUSION',
          description: 'Interpret the results and write your conclusion.'
        }
      ],
      layout: 'vertical',
      backgroundColor: '#ffffff',
      titleColor: '#000000',
      subtitleColor: '#000000'
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
      title: 'What Do You Know About Our Studio?',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit',
      imageUrl: '',
      imageAlt: '',
      imagePrompt: 'modern office workspace with plants and computers',
      imageSize: 'large',
      backgroundColor: '#ffffff',
      titleColor: '#000000',
      contentColor: '#333333',
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
      backgroundColor: '#ffffff',
      titleColor: '#000000',
      contentColor: '#ffffff'
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
      subtitle: 'Add slide description',
      steps: [
        { value: 'Add value', label: 'Add label', description: 'Add description' },
        { value: 'Add value', label: 'Add label', description: 'Add description' },
        { value: 'Add value', label: 'Add label', description: 'Add description' },
      ],
      companyName: 'Company name'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle', required: true },
      steps: { type: 'array', label: 'Big Numbers', required: true },
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
    description: 'Two-column layout with title/presenter info on blue left side and timeline on white right side',
    category: 'special',
    icon: '📅',
    component: EventListTemplate,
    defaultProps: {
      title: 'Add title',
      presenter: 'Add presenter name',
      subject: 'Add subject',
      events: [
        { description: 'description' },
        { description: 'description' },
        { description: 'description' },
      ],
      titleColor: undefined,
      descriptionColor: undefined,
      backgroundColor: undefined,
      imagePrompt: 'timeline illustration for research stages',
      imageAlt: 'Research timeline',
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      presenter: { type: 'text', label: 'Presenter', required: true },
      subject: { type: 'text', label: 'Subject', required: true },
      events: {
        type: 'array',
        label: 'Timeline Steps',
        description: 'List of timeline steps with titles and descriptions',
        required: true,
        arrayItemType: {
          type: 'object',
          label: 'Step'
        }
      },
      titleColor: { type: 'color', label: 'Title Color', default: undefined },
      descriptionColor: { type: 'color', label: 'Presenter Color', default: undefined },
      backgroundColor: { type: 'color', label: 'Background Color', default: undefined },
      imagePrompt: { type: 'text', label: 'Image Prompt', required: false },
      imageAlt: { type: 'text', label: 'Image Alt', required: false },
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
    description: 'Two-column layout with title/subtitle/list on blue left side and bar chart on white right side',
    category: 'content',
    icon: '📊',
    component: MarketShareTemplate,
    defaultProps: {
      title: 'The new os solution',
      subtitle: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium ?',
      chartData: [
        { label: '2019', description: 'Lorem ipsum dolor sit amet', percentage: 48, color: '#4A70E8', gradientStart: '#87CEEB', gradientEnd: '#4682B4' },
        { label: '2020', description: 'Lorem ipsum dolor sit amet', percentage: 61, color: '#FF8C00', gradientStart: '#FFA07A', gradientEnd: '#FF8C00' },
        { label: '2021', description: 'Lorem ipsum dolor sit amet', percentage: 83, color: '#32CD32', gradientStart: '#90EE90', gradientEnd: '#3CB371' },
        { label: '2022', description: 'Lorem ipsum dolor sit amet', percentage: 74, color: '#8A2BE2', gradientStart: '#DDA0DD', gradientEnd: '#9370DB' }
      ],
      bottomText: '',
      imagePrompt: 'bar chart illustration for market share data',
      imageAlt: 'Market share bar chart',
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle', required: false },
      chartData: {
        type: 'array',
        label: 'Chart Data',
        description: 'Array of chart items with labels, descriptions, percentages and colors',
        required: true,
        arrayItemType: {
          type: 'object',
          label: 'Chart Item'
        }
      },
      bottomText: { type: 'text', label: 'Bottom Description', required: false },
      imagePrompt: { type: 'text', label: 'Image Prompt', required: false },
      imageAlt: { type: 'text', label: 'Image Alt', required: false },
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
    description: 'Comparison table template with features and options',
    category: 'content',
    icon: '⬛',
    component: TableDarkTemplate,
    defaultProps: {
      title: 'Comparison table template',
      tableData: {
        headers: ['Feature', 'Option 1', 'Option 2', 'Option 3'],
        rows: [
          ['Feature A', '✓', '✓', '✗'],
          ['Feature B', '✗', '✓', '✓'],
          ['Feature C', '✗', '✗', '✓']
        ]
      },
      backgroundColor: '#f8fafc',
      titleColor: '#1f2937',
      headerColor: '#ffffff',
      textColor: '#374151',
      tableBackgroundColor: '#ffffff',
      headerBackgroundColor: '#0ea5e9',
      borderColor: '#e5e7eb',
      checkmarkColor: '#0ea5e9',
      crossColor: '#94a3b8'
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
      checkmarkColor: { type: 'color', label: 'Checkmark Color', default: '#0ea5e9' },
      crossColor: { type: 'color', label: 'Cross Color', default: '#94a3b8' }
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
      title: 'This is table',
      tableData: {
        headers: ['Planet', 'Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
        rows: [
          ['Mercury', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Mars', 'XX', 'XX', 'XX', 'XX', 'XX'],
          ['Saturn', 'XX', 'XX', 'XX', 'XX', 'XX']
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
  },
  
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
    avatarPosition: {
      // ✅ RECTANGULAR AVATAR - Based on measured image container logs
      // Image container positioned on right side of slide (right panel)
      // Measured values show full-height container spanning entire right panel
      x: 864,       // ✅ Measured: 864px (left edge of right panel)
      y: 0,         // ✅ Measured: 0px (starts at top of slide)
      width: 1056,  // ✅ Measured: 1056px (right panel width: 1920 - 864 = 1056)
      height: 1080  // ✅ Measured: 1080px (full slide height)
    },
    elaiBackgroundColor: '#ffffff'  // Elai API video background color (matches slide backgroundColor)
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
    avatarPosition: {
      // ✅ ARCH AVATAR - Based on measured arch background container logs
      // Arch background positioned on right side of slide
      // Arch shape: Rounded TOP corners (top-left and top-right), sharp bottom corners
      // CSS equivalent: border-radius: 50% 50% 0 0 (after transform rotation)
      // ⚠️ CORRECTED: Height adjusted to fit within 1080px boundary
      x: 1075,      // ✅ Measured: 1075px (left edge of arch container)
      y: 235,       // ✅ Measured: 235px (top edge of arch container)
      width: 799,   // ✅ Measured: 799px (arch container width)
      height: 845,  // ✅ CORRECTED: 1080 - 235 = 845px (was 891px, exceeded boundary by 46px)
      shape: 'arch'  // ✅ MANDATORY: Arch mask required (rounded top, sharp bottom)
    },
    elaiBackgroundColor: '#ffffff'  // Elai API video background color (matches slide gradient: linear-gradient(90deg, #0F58F9 0%, #102396 100%))
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
      logoNew: '',
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
      logoNew: { type: 'image', label: 'Company Logo' },
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
      companyName: 'Company name',
      logoNew: ''
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
      companyName: { type: 'text', label: 'Company Name', required: true },
      logoNew: { type: 'image', label: 'Company Logo' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs (same as company-tools-resources-slide)
      // CSS: top: 64px, right: 96px, width: 272px, height: 272px, border-radius: 50%
      // Calculated X: 1920 - 96 - 272 = 1552px
      x: 1552,      // ✅ Measured: 1552px (calculated from right: 96px)
      y: 64,        // ✅ Measured: 64px (matches CSS top: 64px)
      width: 272,   // ✅ Measured: 272px (perfect square for circle)
      height: 272,  // ✅ Measured: 272px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#ffffff'  // Elai API video background color (same as company-tools-resources-slide)
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
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Profile image positioned at bottom-left of slide
      // CSS: position: absolute, bottom: 96px
      // Measured absolute position perfectly aligns with calculation
      x: 96,        // ✅ Measured: 96px (matches CSS left position)
      y: 712,       // ✅ Measured: 712px (calculated: 1080 - 96 bottom - 272 height = 712px) ✓
      width: 272,   // ✅ Measured: 272px (perfect square for circle)
      height: 272,  // ✅ Measured: 272px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#ffffff'  // Elai API video background color (matches slide backgroundColor)
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
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Profile image positioned with absolute positioning
      // CSS: left: 80px, top: 160px
      x: 80,        // ✅ Measured: 80px (matches CSS left)
      y: 160,       // ✅ Measured: 160px (matches CSS top)
      width: 264,   // ✅ Measured: 264px (perfect square for circle)
      height: 264,  // ✅ Measured: 264px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
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
      companyName: 'Company name',
      logoNew: ''
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
      companyName: { type: 'text', label: 'Company Name', required: true },
      logoNew: { type: 'image', label: 'Company Logo' }
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
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Updated with measured container logs
      // Profile image positioned at top-right of slide
      // CSS: right: 60px, top: 40px (CSS defines 170×170)
      // Measured container (with padding/wrapper): 240×240px
      x: 1620,      // ✅ Measured: 1620px (calculated: 1920 - 60 - 240 = 1620)
      y: 55,        // ✅ Measured: 55px (actual rendered position includes padding)
      width: 240,   // ✅ Measured: 240px (container width including wrapper/padding)
      height: 240,  // ✅ Measured: 240px (container height including wrapper/padding)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  },

  // New: Connection slide (dark UI with venn and bottom tabs)
  'connection-slide': {
    id: 'connection-slide',
    name: 'Connection Slide',
    description: 'Dark split layout with venn diagram and bottom navigation',
    category: 'content',
    icon: '🕸️',
    component: ConnectionSlideTemplate,
    defaultProps: {
      title: 'Connection',
      description: 'Connections create trust, encourage open communication, and build a culture of collaboration.',
      avatarPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 80 },
      description: { type: 'text', label: 'Description', required: true, maxLength: 400 },
      avatarPath: { type: 'image', label: 'Avatar Image' }
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
      rightImageAlt: 'Right side image',
      rightImagePrompt: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      definitions: { type: 'array', label: 'Definitions', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      rightImagePath: { type: 'image', label: 'Right Side Image' },
      rightImageAlt: { type: 'text', label: 'Right Side Image Alt Text' },
      rightImagePrompt: { type: 'text', label: 'Right Image Prompt', required: false }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs (profile image)
      // Profile image positioned at bottom-left of slide
      // CSS: position: absolute, left: 96px, bottom: 149px
      // Measured absolute position perfectly aligns with calculation
      x: 96,        // ✅ Measured: 96px (matches CSS left)
      y: 675,       // ✅ Measured: 675px (calculated: 1080 - 149 bottom - 256 height = 675px) ✓
      width: 256,   // ✅ Measured: 256px (perfect square for circle)
      height: 256,  // ✅ Measured: 256px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0F58F9'  // Elai API video background color (matches slide backgroundColor)
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
        { number: '50%', description: 'decrease in turnover\nrates.' },
        { number: '$2.8B', description: 'the cost of harassment\nto businesses in the United States annually.' },
        { number: '40%', description: 'increase in employee morale and engagement' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      pageNumber: '18',
      logoNew: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      statements: { type: 'array', label: 'Statements', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      pageNumber: { type: 'text', label: 'Page Number', maxLength: 10 },
      logoNew: { type: 'image', label: 'Company Logo' }
    },
    avatarPosition: {
      x: 80,        // ✅ Measured: 80px (matches CSS padding-left)
      y: 521,       // ✅ CORRECTED: Measured from logs (was 551px, now 521px - 30px difference)
      width: 749,   // ✅ Measured: 749px (matches container width)
      height: 471   // ✅ Measured: 471px (matches container height)
    },
    elaiBackgroundColor: '#0F58F9'  // Elai API video background color (from linear-gradient(rgb(15, 88, 249) 0%, rgb(16, 35, 161) 100%))
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
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Profile-image is inside content-block (top: 128px, left: 24px)
      // CSS relative to content-block: top: 52.8px, left: 112px
      // Absolute position: X = 24 + 112 = 136px, Y = 128 + 52.8 = 181px
      x: 136,       // ✅ Measured: 136px (content-block left 24px + profile left 112px)
      y: 181,       // ✅ Measured: 181px (content-block top 128px + profile top 52.8px)
      width: 248,   // ✅ Measured: 248px (perfect square for circle)
      height: 248,  // ✅ Measured: 248px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
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
      profileImageAlt: 'Profile image',
      logoPath: '',
      logoText: 'Your Logo',
      pageNumber: '01'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      content: { type: 'text', label: 'Content', required: true, maxLength: 300 },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      logoPath: { type: 'image', label: 'Logo Image' },
      logoText: { type: 'text', label: 'Logo Text', maxLength: 80 },
      pageNumber: { type: 'text', label: 'Page Number', maxLength: 10 }
    },
    avatarPosition: {
      x: 623,
      y: 363,
      width: 135,
      height: 135,
      shape: 'circle'
    },
    elaiBackgroundColor: '#E0E7FF'
  },

  'solution-steps-slide': {
    id: 'solution-steps-slide',
    name: 'Solution Steps Slide',
    description: 'Dark themed slide with step-by-step guide and timeline',
    category: 'content',
    icon: '📋',
    component: SolutionStepsSlideTemplate,
    defaultProps: {
      subtitle: 'The Solution',
      title: 'Step-by-step Guide',
      steps: [
        { title: 'Step 1', description: 'Know the Regulations' },
        { title: 'Step 2', description: 'Conduct Risk Assessments' },
        { title: 'Step 3', description: 'Provide Training and Education' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      website: 'www.company.com',
      date: 'Date Goes Here',
      pageNumber: '23'
    },
    propSchema: {
      subtitle: { type: 'text', label: 'Subtitle', required: true, maxLength: 100 },
      title: { type: 'text', label: 'Title', required: true, maxLength: 50 },
      steps: { type: 'array', label: 'Steps', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      website: { type: 'text', label: 'Website', maxLength: 100 },
      date: { type: 'text', label: 'Date', maxLength: 50 },
      pageNumber: { type: 'text', label: 'Page Number', maxLength: 50 }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Profile image positioned at top-right of slide
      // CSS: top: 35px, right: 60px
      // Measured absolute position perfectly aligns with calculation
      x: 1630,      // ✅ Measured: 1630px (calculated: 1920 - 60 - 230 = 1630) ✓
      y: 35,        // ✅ Measured: 35px (matches CSS top exactly)
      width: 230,   // ✅ Measured: 230px (perfect square for circle)
      height: 230,  // ✅ Measured: 230px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  },

  'proof-statistics-slide': {
    id: 'proof-statistics-slide',
    name: 'Proof Statistics Slide',
    description: 'Blue themed slide with statistics and bullet points',
    category: 'content',
    icon: '📊',
    component: ProofStatisticsSlideTemplate,
    defaultProps: {
      tagText: 'Presentation',
      title: 'The Proof Is in the Pudding',
      description: 'We know that numbers speak louder than words, so here are some key stats that demonstrate the power of [Product Name]:',
      statistics: [
        { value: 'XX%', description: 'Percentage increase in productivity' },
        { value: 'XX%', description: 'Percentage increase in productivity' },
        { value: 'XX%', description: 'Percentage increase in productivity' },
        { value: 'XX%', description: 'Percentage increase in productivity' },
        { value: 'XX%', description: 'Percentage increase in productivity' },
        { value: 'XX%', description: 'Percentage increase in productivity' }
      ],
      conclusionText: 'With these impressive results, it\'s clear that [Product Name] is the real deal, Don\'t miss out on the opportunity to take your business to the next level- try [Product Name] today.',
      bulletPoints: [
        'With these impressive results, it\'s clear that',
        'With these impressive results, it\'s clear that',
        'With these impressive results, it\'s clear that'
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      tagText: { type: 'text', label: 'Tag Text', required: true, maxLength: 50 },
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      description: { type: 'text', label: 'Description', required: true, maxLength: 500 },
      statistics: { type: 'array', label: 'Statistics', required: true },
      conclusionText: { type: 'text', label: 'Conclusion Text', required: true, maxLength: 500 },
      bulletPoints: { type: 'array', label: 'Bullet Points', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
  },

  'marketing-agency-thank-you-slide': {
    id: 'marketing-agency-thank-you-slide',
    name: 'Marketing Agency Thank You Slide',
    description: 'Light themed slide with orange accent and thank you message',
    category: 'content',
    icon: '🙏',
    component: MarketingAgencyThankYouSlideTemplate,
    defaultProps: {
      headerTitle: 'Introduction to Our\nMarketing Agency',
      logoText: 'Your Logo',
      mainTitle: 'Thank you!',
      bodyText: 'We look forward to helping\nyou achieve remarkable\nresults. Contact us today, and\nlet\'s make success happen!',
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      companyLogoPath: ''
    },
    propSchema: {
      headerTitle: { type: 'text', label: 'Header Title', required: true, maxLength: 100 },
      logoText: { type: 'text', label: 'Logo Text', maxLength: 50 },
      mainTitle: { type: 'text', label: 'Main Title', required: true, maxLength: 100 },
      bodyText: { type: 'text', label: 'Body Text', required: true, maxLength: 500 },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      companyLogoPath: { type: 'image', label: 'Company Logo' }
    }
  },

  'stay-safe-tips-slide': {
    id: 'stay-safe-tips-slide',
    name: 'Stay Safe Tips Slide',
    description: 'White left panel with 4 numbered tips and actor on black',
    category: 'content',
    icon: '🛡️',
    component: StaySafeTipsSlideTemplate,
    defaultProps: {
      title: '4 tips to staysafe online',
      tips: [
        { number: '1', heading: 'Know the scams', description: 'Read articles and blogs, follow the news, and share this so you can learn about different kinds of scams and what you can do to avoid them.' },
        { number: '2', heading: "Don't click", description: 'These phishing emails have links that lead to websites that can lure you into giving personal information or download malware to your computer' },
        { number: '3', heading: 'Shop safely', description: 'Don\'t shop on a site unless it has the "https". Also, protect yourself and use a credit card instead of a debit card while shopping online' },
        { number: '4', heading: 'Passwords', description: 'Do away with the "Fitguy1982" password and use an extremely uncrackable one like 9&4yiw2pyqx# Phrases are good too.' },
      ],
      actorImagePath: '',
      actorImageAlt: 'Actor image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 120 },
      tips: { type: 'array', label: 'Tips', required: true },
      actorImagePath: { type: 'image', label: 'Actor Image' },
      actorImageAlt: { type: 'text', label: 'Actor Image Alt Text' }
    }
  },

  'resources-list-slide': {
    id: 'resources-list-slide',
    name: 'Resources List Slide',
    description: 'Olive background with three resource bars and title',
    category: 'content',
    icon: '📚',
    component: ResourcesListSlideTemplate,
    defaultProps: {
      title: 'Resources',
      resources: [
        { text: 'Resource 1: [Website/Book Title] - [Link/Author Name]' },
        { text: 'Resource 2: [Website/Book Title] - [Link/Author Name]' },
        { text: 'Resource 3: [Website/Book Title] - [Link/Author Name]' }
      ],
      logoPath: '',
      logoAlt: 'Your Logo',
      profileImagePath: '',
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      resources: { type: 'array', label: 'Resources', required: true },
      logoPath: { type: 'image', label: 'Logo' },
      logoAlt: { type: 'text', label: 'Logo Alt Text' },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
  },

  'course-rules-timeline-slide': {
    id: 'course-rules-timeline-slide',
    name: 'Course Rules Timeline Slide',
    description: 'Purple background, actor left, vertical line with two steps',
    category: 'content',
    icon: '🧭',
    component: CourseRulesTimelineSlideTemplate,
    defaultProps: {
      steps: [
        { number: '01', text: 'Rules of the course' },
        { number: '02', text: 'Prerequisite courses' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      steps: { type: 'array', label: 'Steps', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
  },

  'resilience-behaviors-slide': {
    id: 'resilience-behaviors-slide',
    name: 'Resilience Behaviors Slide',
    description: 'Green background with title, subtitle, avatar and 8 bullets',
    category: 'content',
    icon: '🌿',
    component: ResilienceBehaviorsSlideTemplate,
    defaultProps: {
      title: 'Research shows that resilient employees engage in three specific behaviors.',
      subtitle: 'Research shows that resilient employees engage in three specific behaviors. These help them remain focused and optimistic despite setbacks or uncertainty:',
      bullets: [
        'Pay attention to your health',
        'Focus on your physical well-being',
        'Practice relaxation techniques',
        'Practice reframing threats as challenges',
        'Watch your stress levels',
        'Mind your mindset',
        'Practice self-awareness',
        'Get connected'
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 140 },
      subtitle: { type: 'text', label: 'Subtitle', required: true, maxLength: 400 },
      bullets: { type: 'array', label: 'Bullets', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
  },

  'soft-skills-types-slide': {
    id: 'soft-skills-types-slide',
    name: 'Soft Skills Types Slide',
    description: 'Light background with big title and three image cards',
    category: 'content',
    icon: '🧠',
    component: SoftSkillsTypesSlideTemplate,
    defaultProps: {
      title: 'Types of Soft Skills',
      cards: [
        { label: 'Time management' },
        { label: 'Team work' },
        { label: 'Work ethic' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      cards: { type: 'array', label: 'Cards', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
  },

  // Pixel-perfect: Phishing rise
  'phishing-rise-slide': {
    id: 'phishing-rise-slide',
    name: 'Phishing Rise Slide',
    description: 'Two-column slide with narrative and black bar chart',
    category: 'content',
    icon: '📈',
    component: PhishingRiseSlideTemplate,
    defaultProps: {
      title: 'Phishing rise',
      description: 'This has become a growing threat in the world of today... documented a 250% increase in phishing sites between October 2015 and March 2016. There has also been a noted that 93% of phishing emails are now ransomware.',
      bars: [
        { year: '2019', valueLabel: '33M$', height: 160 },
        { year: '2020', valueLabel: '39M$', height: 200 },
        { year: '2021', valueLabel: '55M$', height: 330 },
        { year: '2022', valueLabel: '44M$', height: 270 },
        { year: '2023', valueLabel: '67M$', height: 420 },
        { year: '2024', valueLabel: '35M$', height: 210 }
      ],
      actorImagePath: '',
      actorImageAlt: 'Actor image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 80 },
      description: { type: 'text', label: 'Description', required: true, maxLength: 600 },
      bars: { type: 'array', label: 'Bars', required: true },
      actorImagePath: { type: 'image', label: 'Actor Image' },
      actorImageAlt: { type: 'text', label: 'Actor Image Alt Text' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Avatar holder positioned at bottom-left of slide
      // CSS: left: 100px, bottom: 100px
      // Measured absolute position: Y = 1080 - 100 (bottom) - 220 (height) = 760px
      x: 100,       // ✅ Measured: 100px (matches CSS left)
      y: 760,       // ✅ Measured: 760px (calculated from bottom: 1080 - 100 - 220)
      width: 220,   // ✅ Measured: 220px (perfect square for circle)
      height: 220,  // ✅ Measured: 220px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  },

  // Pixel-perfect: AI Pharma Market Growth
  'ai-pharma-market-growth-slide': {
    id: 'ai-pharma-market-growth-slide',
    name: 'AI Pharma Market Growth Slide',
    description: 'Rounded light panel with left labels and right doctor photo',
    category: 'content',
    icon: '🏥',
    component: AiPharmaMarketGrowthSlideTemplate,
    defaultProps: {
      title: 'AI Pharma\nMarket Growth',
      bars: [
        { year: '2012', label: '$10 million', widthPercent: 24 },
        { year: '2016', label: '$100 million', widthPercent: 72 },
        { year: '2020', label: '$700 million', widthPercent: 92 },
        { year: '2030', label: '$9000 billion', widthPercent: 100 }
      ],
      doctorImagePath: '',
      doctorImageAlt: 'Doctor',
      panelBackgroundColor: '#dfeeff'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 80 },
      bars: { type: 'array', label: 'Bars', required: true },
      doctorImagePath: { type: 'image', label: 'Right Image' },
      doctorImageAlt: { type: 'text', label: 'Right Image Alt Text' },
      panelBackgroundColor: { type: 'color', label: 'Panel Color' }
    },
    avatarPosition: {
      // ✅ RECTANGULAR AVATAR - Based on updated measured container logs (doctor image area)
      // Doctor image positioned on right side of slide
      // CSS UPDATED: position: absolute, right: 40px (was 144px), top: 48px, bottom: 155px
      // Width: 864px, height: 96%
      // ⚠️ CORRECTED: Height adjusted to fit within 1080px boundary
      x: 1016,      // ✅ Measured: 1016px (calculated: 1920 - 40 right - 864 width = 1016) ✓
      y: 48,        // ✅ Measured: 48px (matches CSS top)
      width: 864,   // ✅ Measured: 864px (right-side doctor image area)
      height: 1032  // ✅ CORRECTED: 1080 - 48 = 1032px (was 1037px, exceeded boundary by 5px)
    },
    elaiBackgroundColor: '#e0e7ff'  // Elai API video background color (light background for contrast)
  },

  // Pixel-perfect: KPI Update
  'kpi-update-slide': {
    id: 'kpi-update-slide',
    name: 'KPI Update Slide',
    description: 'Light report slide with big KPI values and footer',
    category: 'content',
    icon: '📑',
    component: KpiUpdateSlideTemplate,
    defaultProps: {
      title: 'KPI Update',
      items: [
        { value: '10%', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' },
        { value: '75', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' },
        { value: '86%', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' },
        { value: '1M', description: 'With so much data, it can be tempting to measure everything-or at least things that are easiest to measure. However, you need to be sure you\'re' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile',
      footerLeft: 'Company name',
      footerCenter: 'KPI Report',
      footerRight: 'February 2023'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 60 },
      items: { type: 'array', label: 'Items', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      footerLeft: { type: 'text', label: 'Footer Left' },
      footerCenter: { type: 'text', label: 'Footer Center' },
      footerRight: { type: 'text', label: 'Footer Right' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Profile image positioned in footer (absolute positioning within footer)
      // CSS relative to footer: right: 84px, top: 68px
      // Measured absolute position in viewport
      x: 56,        // ✅ Measured: 56px (absolute position in viewport)
      y: 645,       // ✅ Measured: 645px (footer area at bottom of slide)
      width: 220,   // ✅ Measured: 220px (rendered width for circle)
      height: 220,  // ✅ Measured: 220px (rendered height for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  },

  // Pixel-perfect: Interest Growth
  'interest-growth-slide': {
    id: 'interest-growth-slide',
    name: 'Interest Growth Slide',
    description: 'Left 2x2 cards with percentages and right photo panel',
    category: 'content',
    icon: '🧭',
    component: InterestGrowthSlideTemplate,
    defaultProps: {
      title: 'Interest',
      cards: [
        { label: 'Interest growth', percentage: '50%' },
        { label: 'Interest growth', percentage: '140%' },
        { label: 'Interest growth', percentage: '128%' },
        { label: 'Interest growth', percentage: '100%' }
      ],
      rightImagePath: '',
      rightImageAlt: 'Person',
      rightPanelColor: '#3a5bf0'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 60 },
      cards: { type: 'array', label: 'Cards', required: true },
      rightImagePath: { type: 'image', label: 'Right Image' },
      rightImageAlt: { type: 'text', label: 'Right Image Alt Text' },
      rightPanelColor: { type: 'color', label: 'Right Panel Color' }
    },
    avatarPosition: {
      // ✅ RECTANGULAR AVATAR - Based on right panel position
      // Right panel positioned on left side of slide (grid column 1/2)
      // Panel: width 430px, height 498px, marginTop 69px, padding 24px
      x: 24,         // Left padding of slide
      y: 93,         // Top padding (24px) + marginTop (69px) = 93px
      width: 430,    // Panel width
      height: 498   // Panel height
    }
  },

  // Pixel-perfect: High-Performing Teams
  'high-performing-teams-slide': {
    id: 'high-performing-teams-slide',
    name: 'High-Performing Teams',
    description: 'Title, paragraph, rounded panel with editable line and avatar',
    category: 'content',
    icon: '🟡',
    component: HighPerformingTeamsSlideTemplate,
    defaultProps: {
      title: 'The Power of High-\nPerforming Teams',
      description: 'High-performing teams are the driving\nforce behind exceptional results. They\nachieve more, innovate faster, and\nadapt to challenges with resilience.',
      panelColor: '#E9B84C',
      lineColor: '#5A4DF6',
      points: [
        { x: 6, y: 72 },
        { x: 22, y: 58 },
        { x: 40, y: 64 },
        { x: 58, y: 48 },
        { x: 72, y: 42 },
        { x: 84, y: 38 }
      ],
      avatarPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 120 },
      description: { type: 'text', label: 'Description', required: true, maxLength: 400 },
      panelColor: { type: 'color', label: 'Panel Color' },
      lineColor: { type: 'color', label: 'Line Color' },
      points: { type: 'array', label: 'Line Points', required: true },
      avatarPath: { type: 'image', label: 'Avatar Image' }
    }
  },


  'table-of-contents-slide': {
    id: 'table-of-contents-slide',
    name: 'Table of Contents Slide',
    description: 'Clean slide with green buttons and profile image',
    category: 'content',
    icon: '📋',
    component: TableOfContentsSlideTemplate,
    defaultProps: {
      title: 'Table of Contents',
      buttons: [
        { text: 'The Problem', link: '' },
        { text: 'Benefits', link: '' },
        { text: 'Best Practices', link: '' },
        { text: 'Methods', link: '' },
        { text: 'Achieving Success', link: '' },
        { text: 'The Future', link: '' }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      companyLogoPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      buttons: { type: 'array', label: 'Buttons', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      companyLogoPath: { type: 'image', label: 'Company Logo' }
    }
  },

  'company-tools-resources-slide': {
    id: 'company-tools-resources-slide',
    name: 'Company Tools and Resources Slide',
    description: 'Grid layout with alternating colored sections',
    category: 'content',
    icon: '🛠️',
    component: CompanyToolsResourcesSlideTemplate,
    defaultProps: {
      title: 'Company tools and resources',
      sections: [
        {
          title: 'Communication Tools:',
          content: 'Effective communication is key to success in any workplace. At [Company Name], we use a variety of communication tools to keep our team connected and informed. Here are some of the key tools we use.',
          backgroundColor: '#E5E7EB',
          textColor: '#374151'
        },
        {
          title: 'Project Management:',
          content: 'Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.',
          backgroundColor: '#3B82F6',
          textColor: '#FFFFFF'
        },
        {
          title: 'Learning and Development Resources',
          content: 'We believe in investing in our employees\' growth and development. Here are some of the resources we offer: Online training courses (LinkedIn Learning, Udemy, etc.); In-house training and workshops; Professional development funds.',
          backgroundColor: '#3B82F6',
          textColor: '#FFFFFF'
        },
        {
          title: 'Project Management',
          content: 'Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.',
          backgroundColor: '#E5E7EB',
          textColor: '#374151'
        }
      ],
      profileImagePath: '',
      profileImageAlt: 'Profile image',
      companyLogoPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      sections: { type: 'array', label: 'Sections', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' },
      companyLogoPath: { type: 'image', label: 'Company Logo' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // CSS: top: 64px, right: 96px, width: 272px, height: 272px, border-radius: 50%
      // Calculated X: 1920 - 96 - 272 = 1552px
      x: 1552,      // ✅ Measured: 1552px (calculated from right: 96px)
      y: 64,        // ✅ Measured: 64px (matches CSS top: 64px)
      width: 272,   // ✅ Measured: 272px (perfect square for circle)
      height: 272,  // ✅ Measured: 272px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#ffffff'  // Elai API video background color (matches slide backgroundColor)
  }
  ,

  // New: Impact metrics with right image panel (matches screenshots 1 and 3 variants)
  'impact-metrics-right-image': {
    id: 'impact-metrics-right-image',
    name: 'Impact Metrics (Right Image)',
    description: 'Three big impact metrics on the left and rounded image panel on the right',
    category: 'content',
    icon: '📈',
    component: ImpactMetricsRightImageSlideTemplate,
    defaultProps: {
      metrics: [
        { text: '300% increase in online visibility' },
        { text: '$5 for every $1 spent average ROI' },
        { text: '95% increase in customer loyalty' }
      ],
      showTitle: false,
      backgroundColor: '#0f2a2e',
      textColor: '#E6ECE9',
      bulletBg: 'rgba(255,255,255,0.2)',
      bulletColor: '#E6ECE9',
      rightPanelColor: '#EA6A20'
    },
    propSchema: {
      metrics: { type: 'array', label: 'Metrics', required: true },
      showTitle: { type: 'boolean', label: 'Show Title' },
      title: { type: 'text', label: 'Title' },
      backgroundColor: { type: 'color', label: 'Background' },
      textColor: { type: 'color', label: 'Text Color' },
      bulletBg: { type: 'color', label: 'Bullet BG' },
      bulletColor: { type: 'color', label: 'Bullet Color' },
      rightPanelColor: { type: 'color', label: 'Right Panel' },
      rightImagePath: { type: 'image', label: 'Right Image' }
    }
  }
  ,

  

  

  // New: Culture & Values with three columns and avatar
  'culture-values-three-columns': {
    id: 'culture-values-three-columns',
    name: 'Culture & Values (3 columns)',
    description: 'Top bar with logo and title, three equal columns with a colored middle panel and avatar',
    category: 'content',
    icon: '🏛️',
    component: CultureValuesThreeColumnsSlideTemplate,
    defaultProps: {
      logoText: 'Logo',
      title: 'Our culture and values',
      leftText: 'Code of conduct and ethics.\n\nWe expect all employees to behave in an ethical and professional manner...',
      middleText: 'HR policies, including time off, benefits, and compensation.\n\nOur HR policies are designed to support employees...',
      rightText: 'IT policies, including data security and acceptable use.\n\nSecure password management and protection of company data...',
      middlePanelColor: '#3B46FF'
    },
    propSchema: {
      logoText: { type: 'text', label: 'Logo' },
      title: { type: 'text', label: 'Title', required: true },
      leftText: { type: 'text', label: 'Left Text', required: true },
      middleText: { type: 'text', label: 'Middle Text', required: true },
      rightText: { type: 'text', label: 'Right Text', required: true },
      middlePanelColor: { type: 'color', label: 'Middle Panel' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // CSS: right: 48px, top: 65px, width: 240px, height: 240px, border-radius: 50%
      // Calculated X: 1920 - 48 - 240 = 1632px
      x: 1632,      // ✅ Measured: 1632px (calculated from right: 48px)
      y: 65,        // ✅ Measured: 65px (matches CSS top: 65px)
      width: 240,   // ✅ Measured: 240px (perfect square for circle)
      height: 240,  // ✅ Measured: 240px (perfect square for circle)
      shape: 'circle' // ✅ MANDATORY: Circular crop required
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  }
  , 

  // New: Key skills list with numbered items and avatar on left
  'key-skills-data-analysis': {
    id: 'key-skills-data-analysis',
    name: 'Key Skills (Data Analysis)',
    description: 'Blue gradient left panel with heading and avatar, numbered list on light right panel',
    category: 'content',
    icon: '🧠',
    component: KeySkillsDataAnalysisSlideTemplate,
    defaultProps: {
      heading: 'Key skills\nfor data analysis:',
      items: [ 'Sorting and filtering data.', 'Formulas and functions.', 'Pivot tables.', 'Data validation.', 'Charts and graphs.' ],
      avatarImagePath: '',
      logoPath: '',
      pageNumber: '36'
    },
    propSchema: {
      heading: { type: 'text', label: 'Heading', required: true },
      items: { type: 'array', label: 'Items', required: true },
      avatarImagePath: { type: 'image', label: 'Avatar Image' },
      logoPath: { type: 'image', label: 'Logo' },
      pageNumber: { type: 'text', label: 'Page Number', maxLength: 10 }
    }
  }
  ,

  // New: Change Management Tabs
  'change-management-tabs': {
    id: 'change-management-tabs',
    name: 'Change Management Tabs',
    description: 'Four top bars (tabs) + main heading + three capsule pills',
    category: 'content',
    icon: '🗂️',
    component: ChangeManagementTabsSlideTemplate,
    defaultProps: {
      topTabs: [
        'Change management fundamentals',
        'The need for change',
        'Building a change-ready culture',
        'Effective communication and engagement'
      ],
      heading: 'Communication is the lifeblood\nof successful change initiatives.',
      pills: ['Organization', 'Communication', 'Stakeholders'],
      pageNumber: '39',
      logoNew: ''
    },
    propSchema: {
      topTabs: { type: 'array', label: 'Top Tabs', required: true },
      heading: { type: 'text', label: 'Heading', required: true },
      pills: { type: 'array', label: 'Pills', required: true },
      avatarPath: { type: 'image', label: 'Avatar' },
      pageNumber: { type: 'text', label: 'Page Number' },
      logoNew: { type: 'image', label: 'Logo' }
    }
  }
  ,

  // New: Benefits and Perks Columns
  'benefits-and-perks-columns': {
    id: 'benefits-and-perks-columns',
    name: 'Benefits and Perks Columns',
    description: 'Four equal columns; 2nd and 4th are accent blocks with numbers',
    category: 'content',
    icon: '🎁',
    component: BenefitsAndPerksColumnsSlideTemplate,
    defaultProps: {
      logoText: 'Your Logo',
      heading: 'Our culture and values',
      columns: [
        { title: 'Health and Wellness', body: 'Medical, dental, and vision insurance.Wellness programs and resources (gym memberships, fitness classes, mental health resources).' },
        { title: 'Financial Benefits', body: '401(k) retirement savings plan; Life insurance and disability coverage; Flexible spending accounts (FSA) for healthcare and dependent care expenses.', accent: true },
        { title: 'Time off and work-life balance', body: 'Paid time off (PTO) for vacation, sick days, and holidays; Flexible work arrangements (remote work, flexible schedules); Parental leave and family care leave.' },
        { title: 'Professional Development', body: 'Tuition reimbursement for continued education; Professional development funds for training and conferences; Mentorship and coaching programs.', accent: true }
      ]
    },
    propSchema: {
      logoText: { type: 'text', label: 'Logo' },
      heading: { type: 'text', label: 'Heading', required: true },
      columns: { type: 'array', label: 'Columns', required: true },
      avatarPath: { type: 'image', label: 'Avatar' },
      pageNumber: { type: 'text', label: 'Page Number' }
    }
  }
  ,

  // New: Oral Hygiene Signs
  'oral-hygiene-signs': {
    id: 'oral-hygiene-signs',
    name: 'Oral Hygiene Signs',
    description: 'Large heading with two 3-item lists with big numbers',
    category: 'content',
    icon: '🦷',
    component: OralHygieneSignsSlideTemplate,
    defaultProps: {
      heading: 'What are the signs of\npoor oral hygiene?'
    },
    propSchema: {
      heading: { type: 'text', label: 'Heading', required: true },
      leftItems: { type: 'array', label: 'Left Items', required: true },
      rightItems: { type: 'array', label: 'Right Items', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    }
  }
  ,

  // New: Resources slide (pixel-perfect)
  'resources-slide': {
    id: 'resources-slide',
    name: 'Resources',
    description: 'Centered heading with 3 resources rows and speaker card',
    category: 'content',
    icon: '📚',
    component: ResourcesSlideTemplate,
    defaultProps: {
      title: 'Resources',
      items: [
        'Resource 1 | Website/Book Title - Link/Author Name',
        'Resource 2 | Website/Book Title - Link/Author Name',
        'Resource 3 | Website/Book Title - Link/Author Name'
      ],
      speakerName: "Speaker's Name",
      speakerTitle: "Speaker's Title"
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      items: { type: 'array', label: 'Items', required: true },
      speakerName: { type: 'text', label: 'Speaker Name', required: true },
      speakerTitle: { type: 'text', label: 'Speaker Title', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    }
  }
  ,

  // New: Left bar with avatar and big image
  'leftbar-avatar-image': {
    id: 'leftbar-avatar-image',
    name: 'Left Bar + Avatar + Image',
    description: 'Black left bar, circular avatar, large framed image. No texts.',
    category: 'content',
    icon: '🖼️',
    component: LeftBarAvatarImageSlideTemplate,
    defaultProps: {
      avatarPath: '',
      mainImagePath: ''
    },
    propSchema: {
      avatarPath: { type: 'image', label: 'Avatar' },
      mainImagePath: { type: 'image', label: 'Main Image' }
    }
  }
  ,

  // New: Problems Grid (tag, title, 2x2 cards, right paragraph, avatar)
  'problems-grid': {
    id: 'problems-grid',
    name: 'Problems Grid',
    description: 'Dark layout with tag, large title, 4 cards, right paragraph and avatar',
    category: 'content',
    icon: '🧩',
    component: ProblemsGridSlideTemplate,
    defaultProps: {
      tag: 'The problem',
      title: 'Problem Name'
    },
    propSchema: {
      tag: { type: 'text', label: 'Tag', required: true },
      title: { type: 'text', label: 'Title', required: true },
      cards: { type: 'array', label: 'Cards', required: true },
      rightText: { type: 'text', label: 'Right Text', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Avatar positioned at top-right of slide
      // CSS: right: 64px, top: 45px
      // Measured absolute position perfectly aligns with calculation
      x: 1616,      // ✅ Measured: 1616px (calculated: 1920 - 64 - 240 = 1616) ✓
      y: 45,        // ✅ Measured: 45px (matches CSS top exactly)
      width: 240,   // ✅ Measured: 240px (perfect square for circle)
      height: 240,  // ✅ Measured: 240px (perfect square for circle)
      shape: 'circle', // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  }
  ,

  // New: Data-Driven Insights
  'data-driven-insights': {
    id: 'data-driven-insights',
    name: 'Data-Driven Insights',
    description: 'Two bar charts with right metrics, tag and title',
    category: 'content',
    icon: '📊',
    component: DataDrivenInsightsSlideTemplate,
    defaultProps: {},
    propSchema: {
      tag: { type: 'text', label: 'Tag', required: true },
      title: { type: 'text', label: 'Title', required: true },
      description: { type: 'text', label: 'Description', required: true },
      leftChartTitle: { type: 'text', label: 'Left Chart Title', required: true },
      rightChartTitle: { type: 'text', label: 'Right Chart Title', required: true },
      leftBars: { type: 'array', label: 'Left Bars', required: true },
      rightBars: { type: 'array', label: 'Right Bars', required: true },
      barLabels: { type: 'array', label: 'Bar Labels', required: true },
      metrics: { type: 'array', label: 'Metrics', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    }
  }
  ,

  // New: Company Timeline

  // New: DEI Methods
  'dei-methods': {
    id: 'dei-methods',
    name: 'DEI Methods',
    description: 'Green header card with two sections and avatar rings',
    category: 'content',
    icon: '🟩',
    component: DeiMethodsSlideTemplate,
    defaultProps: {
      headerTitle: 'Methods to Meet DEI Standards',
      section1Title: 'Diverse Recruitment:',
      section1Lines: [
        'Source candidates from underrepresented groups.',
        'Use blind screening processes to focus on skills and qualifications.'
      ],
      section2Title: 'Mentorship and Sponsorship Programs:',
      section2Lines: [
        'Mentor and sponsor diverse talent.',
        'Create opportunities for growth & advancement.'
      ],
      avatarPath: '',
      logoPath: '',
      logoText: 'Your Logo'
    },
    propSchema: {
      headerTitle: { type: 'text', label: 'Header Title', required: true },
      section1Title: { type: 'text', label: 'Section 1 Title', required: true },
      section1Lines: { type: 'array', label: 'Section 1 Lines', required: true },
      section2Title: { type: 'text', label: 'Section 2 Title', required: true },
      section2Lines: { type: 'array', label: 'Section 2 Lines', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // CSS: right: 60px, top: 75px, width: 230px, height: 230px, border-radius: 50%
      // Calculated X: 1920 - 60 - 230 = 1630px
      x: 1630,      // ✅ Measured: 1630px (calculated from right: 60px)
      y: 75,        // ✅ Measured: 75px (matches CSS top: 75px)
      width: 230,   // ✅ Measured: 230px (perfect square for circle)
      height: 230,  // ✅ Measured: 230px (perfect square for circle)
      shape: 'circle', // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#ffffff'  // Elai API video background color (matches slide backgroundColor)
  }
  ,

  // New: Soft Skills Develop
  'soft-skills-develop': {
    id: 'soft-skills-develop',
    name: 'Soft Skills Develop',
    description: 'Left content grid with right image and purple bar',
    category: 'content',
    icon: '🟣',
    component: SoftSkillsDevelopSlideTemplate,
    defaultProps: {},
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      items: { type: 'array', label: 'Items', required: true },
      rightImagePath: { type: 'image', label: 'Right Image' }
    }
  }
  ,

  // New: Percent Circles
  'percent-circles': {
    id: 'percent-circles',
    name: 'Percent Circles',
    description: 'Title, 11 circles row, two green cards bottom, avatar',
    category: 'content',
    icon: '🟢',
    component: PercentCirclesSlideTemplate,
    defaultProps: {},
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      percent: { type: 'text', label: 'Percent', required: true },
      bottomCards: { type: 'array', label: 'Bottom Cards', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    },
    avatarPosition: {
      // ✅ CIRCULAR AVATAR - Based on measured container logs
      // Avatar positioned at top-right of slide
      // CSS: right: 70px, top: 60px
      // Measured absolute position perfectly aligns with calculation
      x: 1610,      // ✅ Measured: 1610px (calculated: 1920 - 70 - 240 = 1610) ✓
      y: 60,        // ✅ Measured: 60px (matches CSS top exactly)
      width: 240,   // ✅ Measured: 240px (perfect square for circle)
      height: 240,  // ✅ Measured: 240px (perfect square for circle)
      shape: 'circle', // ✅ MANDATORY: Circular crop required (border-radius: 50%)
    },
    elaiBackgroundColor: '#0f58f9'  // Elai API video background color (matches slide backgroundColor)
  },

  'introduction-data-analysis': {
    id: 'introduction-data-analysis',
    name: 'Introduction to Data Analysis',
    description: 'Dark green slide with avatar frame, title, and icon placeholder',
    category: 'content',
    icon: '📊',
    component: IntroductionDataAnalysisSlideTemplate,
    defaultProps: {
      title: 'Introduction to Data Analysis',
      avatarPath: '',
      iconPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      avatarPath: { type: 'image', label: 'Avatar' },
      iconPath: { type: 'image', label: 'Icon' }
    }
  },

  'impact-value-statements': {
    id: 'impact-value-statements',
    name: 'Impact Value Statements',
    description: 'Light grey slide with percentage statements and blue avatar frame',
    category: 'content',
    icon: '📈',
    component: ImpactValueStatementsSlideTemplate,
    defaultProps: {
      title: 'Impact Value Statements',
      statements: [
        { percentage: '27%', description: 'increase in profit margins of companies' },
        { percentage: '10%', description: 'increase in revenue growth led by data-driven decisions' },
        { percentage: '50%', description: 'less failure when engaging stakeholders in decisions' }
      ],
      avatarPath: ''
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      statements: { type: 'array', label: 'Statements', required: true },
      avatarPath: { type: 'image', label: 'Avatar' }
    }
  },

  'topics': {
    id: 'topics',
    name: 'Topics',
    description: 'Split slide with dark green avatar section and black topics list with yellow banner',
    category: 'content',
    icon: '📋',
    component: TopicsSlideTemplate,
    defaultProps: {
      title: 'Topics',
      topics: [
        'Fixed mindset VS Growth mindset',
        'Growth mindset - Success & Fulfilment',
        'How to develop a growth mindset',
        'Learning from errors'
      ],
      avatarPath: '',
      logoNew: '',
      pageNumber: '32'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      topics: { type: 'array', label: 'Topics', required: true },
      avatarPath: { type: 'image', label: 'Avatar' },
      logoNew: { type: 'image', label: 'Logo' },
      pageNumber: { type: 'text', label: 'Page Number' }
    }
  },


  

  // New: Enterprise Roadmap (table)
  'enterprise-roadmap-slide': {
    id: 'enterprise-roadmap-slide',
    name: 'Enterprise Roadmap Slide',
    description: 'Light report slide with avatar and zebra table',
    category: 'content',
    icon: '📋',
    component: EnterpriseRoadmapSlideTemplate,
    defaultProps: {
      title: 'Enterprise Offerings: Roadmap',
      description: 'These KPIs typically measure performance in a shorter time frame... (CPA)',
      tableData: [
        { featureName: 'Mobile optimization', status: 'Testing', dueDate: '14 April', assignee: 'Julius' },
        { featureName: 'App Marketplace', status: 'Implementing', dueDate: '28 May', assignee: 'Ben' },
        { featureName: 'Cross-platform sync', status: 'Concept', dueDate: '30 June', assignee: 'Vanessa' }
      ],
      companyName: 'Company name',
      reportType: 'KPI Report',
      date: 'February 2023'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      description: { type: 'text', label: 'Description', required: true },
      tableData: { type: 'array', label: 'Rows', required: true },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      companyName: { type: 'text', label: 'Company' },
      reportType: { type: 'text', label: 'Report' },
      date: { type: 'text', label: 'Date' }
    }
  },

  // New: Concentric Phishing Rise
  'concentric-phishing-rise-slide': {
    id: 'concentric-phishing-rise-slide',
    name: 'Phishing Rise (Concentric)',
    description: 'Big/medium/small circles with labels and avatar',
    category: 'content',
    icon: '⭕',
    component: ConcentricPhishingRiseSlideTemplate,
    defaultProps: {
      title: 'Phishing rise',
      description: 'This has become a growing threat in the world of today...',
      bigLabel: '564$',
      mediumLabel: '321$',
      smallLabel: '128$'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true },
      description: { type: 'text', label: 'Description', required: true },
      bigLabel: { type: 'text', label: 'Big Label', required: true },
      mediumLabel: { type: 'text', label: 'Medium Label', required: true },
      smallLabel: { type: 'text', label: 'Small Label', required: true },
      actorImagePath: { type: 'image', label: 'Actor Image' }
    }
  },

  
};

// Utility functions for working with the registry

export function getTemplate(templateId: string): TemplateComponentInfo | undefined {
  return SLIDE_TEMPLATE_REGISTRY[templateId];
}

// Version-aware resolution
// Returns the correct template id based on deck templateVersion.
// v1 (missing or < 'v2') -> use `${id}_old`; v2+ -> use id as-is.
export function resolveTemplateIdForVersion(templateId: string, deckTemplateVersion?: string, defaultVersion?: string): string {
  const effectiveVersion = deckTemplateVersion || defaultVersion || (typeof process !== 'undefined' ? (process.env?.SLIDES_DEFAULT_VERSION || 'v1') : 'v1');
  
  // Simple lexical compare for our v1/v2 scheme
  if (!effectiveVersion || effectiveVersion < 'v2') {
    const candidate = `${templateId}_old`;
    return SLIDE_TEMPLATE_REGISTRY[candidate] ? candidate : templateId;
  }
  return templateId;
}

export function getTemplateResolved(templateId: string, deckTemplateVersion?: string, defaultVersion?: string): TemplateComponentInfo | undefined {
  const resolvedId = resolveTemplateIdForVersion(templateId, deckTemplateVersion, defaultVersion);
  return getTemplate(resolvedId);
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

// Register `_old` variants with their actual old components
// Map template IDs to their _old component imports
const OLD_TEMPLATE_COMPONENTS: Record<string, any> = {
  'ai-pharma-market-growth': AiPharmaMarketGrowthSlideTemplate_old,
  'bar-chart-infographics': BarChartInfographicsTemplate_old,
  'bar-chart': BarChartSlideTemplate_old,
  'benefits-and-perks-columns': BenefitsAndPerksColumnsSlideTemplate_old,
  'benefits-list': BenefitsListSlideTemplate_old,
  'benefits-tags': BenefitsTagsSlideTemplate_old,
  'big-image-left': BigImageLeftTemplate_old,
  'big-image-top': BigImageTopTemplate_old,
  'big-numbers': BigNumbersTemplate_old,
  'bullet-points-right': BulletPointsRightTemplate_old,
  'bullet-points': BulletPointsTemplate_old,
  'challenges-solutions': ChallengesSolutionsTemplate_old,
  'change-management-tabs': ChangeManagementTabsSlideTemplate_old,
  'chart': ChartTemplate_old,
  'company-tools-resources': CompanyToolsResourcesSlideTemplate_old,
  'comparison-slide': ComparisonSlideTemplate_old,
  'concentric-phishing-rise': ConcentricPhishingRiseSlideTemplate_old,
  'connection': ConnectionSlideTemplate_old,
  'content-slide': ContentSlideTemplate_old,
  'contraindications-indications': ContraindicationsIndicationsTemplate_old,
  'course-overview': CourseOverviewSlideTemplate_old,
  'course-rules-timeline': CourseRulesTimelineSlideTemplate_old,
  'critical-thinking': CriticalThinkingSlideTemplate_old,
  'culture-values-three-columns': CultureValuesThreeColumnsSlideTemplate_old,
  'data-analysis': DataAnalysisSlideTemplate_old,
  'data-driven-insights': DataDrivenInsightsSlideTemplate_old,
  'dei-methods': DeiMethodsSlideTemplate_old,
  'enterprise-roadmap': EnterpriseRoadmapSlideTemplate_old,
  'event-list': EventListTemplate_old,
  'four-box-grid': FourBoxGridTemplate_old,
  'hero-title-slide': HeroTitleSlideTemplate_old,
  'high-performing-teams': HighPerformingTeamsSlideTemplate_old,
  'hybrid-work-best-practices': HybridWorkBestPracticesSlideTemplate_old,
  'impact-metrics-right-image': ImpactMetricsRightImageSlideTemplate_old,
  'impact-statements': ImpactStatementsSlideTemplate_old,
  'impact-value-statements': ImpactValueStatementsSlideTemplate_old,
  'interest-growth': InterestGrowthSlideTemplate_old,
  'introduction-data-analysis': IntroductionDataAnalysisSlideTemplate_old,
  'key-skills-data-analysis': KeySkillsDataAnalysisSlideTemplate_old,
  'kpi-update': KpiUpdateSlideTemplate_old,
  'learning-topics': LearningTopicsSlideTemplate_old,
  'marketing-agency-thank-you': MarketingAgencyThankYouSlideTemplate_old,
  'market-share': MarketShareTemplate_old,
  'metrics-analytics': MetricsAnalyticsTemplate_old,
  'oral-hygiene-signs': OralHygieneSignsSlideTemplate_old,
  'org-chart': OrgChartTemplate_old,
  'percent-circles': PercentCirclesSlideTemplate,
  'phishing-definition': PhishingDefinitionSlideTemplate_old,
  'phishing-rise': PhishingRiseSlideTemplate_old,
  'pie-chart-infographics': PieChartInfographicsTemplate_old,
  'problems-grid': ProblemsGridSlideTemplate_old,
  'process-steps': ProcessStepsTemplate_old,
  'proof-statistics': ProofStatisticsSlideTemplate_old,
  'psychological-safety': PsychologicalSafetySlideTemplate_old,
  'pyramid': PyramidTemplate_old,
  'resilience-behaviors': ResilienceBehaviorsSlideTemplate_old,
  'resources-list': ResourcesListSlideTemplate_old,
  'resources': ResourcesSlideTemplate_old,
  'six-ideas-list': SixIdeasListTemplate_old,
  'soft-skills-assessment': SoftSkillsAssessmentSlideTemplate_old,
  'soft-skills-develop': SoftSkillsDevelopSlideTemplate_old,
  'soft-skills-types': SoftSkillsTypesSlideTemplate_old,
  'solution-steps': SolutionStepsSlideTemplate_old,
  'stay-safe-tips': StaySafeTipsSlideTemplate_old,
  'table-dark': TableDarkTemplate_old,
  'table-light': TableLightTemplate_old,
  'table-of-contents': TableOfContentsSlideTemplate_old,
  'thank-you': ThankYouSlideTemplate_old,
  'timeline': TimelineTemplate_old,
  'title-slide': TitleSlideTemplate_old,
  'topics': TopicsSlideTemplate_old,
  'two-column-slide': TwoColumnSlideTemplate_old,
  'two-column': TwoColumnTemplate_old,
  'work-life-balance': WorkLifeBalanceSlideTemplate_old,
};

// Register all _old templates with their actual old components
(() => {
  try {
    const ids = Object.keys(SLIDE_TEMPLATE_REGISTRY);
    for (const id of ids) {
      if (id.endsWith('_old')) continue;
      const t = SLIDE_TEMPLATE_REGISTRY[id];
      const isAvatar = (t.category || '').toLowerCase() === 'avatar' || id.startsWith('avatar-');
      if (isAvatar) continue;
      const oldId = `${id}_old`;
      if (!(oldId in SLIDE_TEMPLATE_REGISTRY)) {
        const oldComponent = OLD_TEMPLATE_COMPONENTS[id];
        if (oldComponent) {
          SLIDE_TEMPLATE_REGISTRY[oldId] = {
            ...t,
            id: oldId,
            name: `${t.name} (Old)`,
            component: oldComponent  // ← Use the actual _old component!
          } as any;
        }
      }
    }
  } catch {}
})();