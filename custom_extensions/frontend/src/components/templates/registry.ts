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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="15" y="16" width="64" height="9" fill="#E0E0E0"/>
      <rect x="27" y="31" width="41" height="3" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="8" y="8" width="41" height="5" fill="#E0E0E0"/>
      <rect x="8" y="19" width="71" height="2" fill="#E0E0E0"/>
      <rect x="8" y="25" width="71" height="2" fill="#E0E0E0"/>
      <rect x="8" y="31" width="71" height="2" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 0.25H92C92.9665 0.25 93.75 1.0335 93.75 2V51C93.75 51.9665 92.9665 52.75 92 52.75H2C1.0335 52.75 0.25 51.9665 0.25 51V2L0.258789 1.82129C0.348296 0.938726 1.09383 0.25 2 0.25Z" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <path d="M54 15H88V21H54V15Z" fill="#E0E0E0"/>
      <rect x="54" y="24" width="32" height="2" fill="#E0E0E0"/>
      <rect x="54" y="28" width="31" height="2" fill="#E0E0E0"/>
      <rect x="54" y="32" width="28" height="2" fill="#E0E0E0"/>
      <g clip-path="url(#clip0_83_298)">
      <path d="M48.9702 22.1504C48.9702 22.3586 48.9702 22.5668 48.9158 22.8474C48.3609 23.3287 48.5146 23.8297 48.6443 24.3461C48.7126 24.618 48.7374 24.9139 48.7159 25.1937C48.688 25.5587 48.5399 25.9181 48.538 26.2804C48.5228 29.303 48.5426 32.326 48.5175 35.3485C48.5129 35.9084 48.5326 36.6128 48.2309 36.997C47.5195 37.9029 46.6547 38.6642 45.358 38.6594C39.627 38.6379 33.8959 38.6501 28.1649 38.6501C22.0909 38.65 16.0169 38.6676 9.94323 38.6287C9.14422 38.6236 8.33787 38.3656 7.55283 38.1553C7.17082 38.0529 6.83013 37.7901 6.47074 37.5999C6.39167 37.4276 6.3126 37.2553 6.20492 36.9721C6.04252 35.5112 6.70634 34.1342 6.03916 32.7967C5.97003 32.6581 6.02939 32.4527 6.02939 32.2783C6.02935 27.57 6.03416 22.8616 6.01678 18.1533C6.01579 17.8852 5.83334 17.6178 5.73534 17.35C5.73534 17.2376 5.73534 17.1251 5.78541 16.9512C5.94898 16.7431 6.06246 16.5964 6.17595 16.4497C6.42724 15.6601 6.87564 15.0599 7.80168 14.8041C9.06718 14.5137 10.219 14.2198 11.4232 14.3498C11.9063 14.4019 12.3897 14.4932 12.873 14.4936C22.8352 14.5021 32.7973 14.5007 42.7594 14.498C43.2869 14.4978 43.818 14.4209 44.3412 14.4619C45.3963 14.5447 46.4472 14.6842 47.4998 14.8002C47.4998 14.8002 47.5 14.875 47.5007 14.9675C47.8329 15.5371 48.1488 16.0267 48.5021 16.4864C48.7043 16.7493 48.8015 16.8895 48.6463 17.3007C48.4227 17.8932 48.4736 18.6013 48.4487 19.2617C48.4261 19.8638 48.4003 20.477 48.4876 21.0681C48.5433 21.445 48.8024 21.7907 48.9702 22.1504ZM19.8893 22.8985C19.3457 22.5794 18.8697 22.1517 18.1364 22.2757C17.6993 22.3495 17.4439 22.4024 17.4971 22.9167C17.6006 23.9159 17.3994 24.7203 16.1765 24.7648C16.1765 26.5727 16.1766 28.2946 16.1764 30.0165C16.1763 31.3816 16.1759 31.3811 14.9681 31.8319C14.9498 31.8388 14.9573 31.9173 14.9546 31.9625C16.201 32.3581 16.2046 32.3648 15.9183 33.6617C15.9023 33.7343 15.8931 33.8088 15.8861 33.883C15.8185 34.6061 16.1093 34.8544 16.7952 34.6625C17.0534 34.5902 17.309 34.4911 17.5722 34.4584C18.1842 34.3825 18.681 34.4839 18.8377 35.2481C18.8726 35.4183 19.2312 35.6159 19.4534 35.6334C20.5468 35.7193 21.6442 35.7682 22.7409 35.784C22.9978 35.7877 23.4057 35.6837 23.4879 35.5059C23.748 34.9434 24.2093 34.9605 24.5974 35.0981C24.7993 35.1697 24.8719 35.6205 25.0031 35.8999C25.1904 36.2987 24.9398 36.9972 25.7106 36.9979C28.7978 37.0007 31.885 37.0057 34.972 36.9837C35.1606 36.9824 35.4921 36.7748 35.5102 36.6308C35.584 36.0434 35.7769 35.6474 36.4128 35.5545C36.5027 35.5414 36.5939 35.2283 36.6098 35.0471C36.7153 33.8515 37.216 33.4553 38.3781 33.6748C39.1314 33.8171 39.2605 33.7026 39.2646 32.8879C39.2652 32.7629 39.2647 32.638 39.2647 32.513C39.2648 31.1153 39.2648 31.1153 40.5176 30.7274C40.6391 29.6965 40.7753 28.6671 40.8762 27.6342C40.9295 27.0885 40.7068 26.687 40.1183 26.6598C39.652 26.6383 39.5379 26.3845 39.5569 25.9747C39.5686 25.7254 39.5571 25.475 39.5589 25.2251C39.5623 24.7556 39.4705 24.4179 38.8885 24.3735C38.2027 24.3211 37.8302 23.9247 37.938 23.1653C38.0037 22.7029 37.8688 22.4189 37.3858 22.187C36.8892 21.9485 36.5114 21.48 36.6121 20.792C36.7337 19.9609 36.8561 19.1257 36.8997 18.288C36.9421 17.4732 36.593 17.2523 35.8 17.3912C35.0837 17.5167 34.356 17.6214 33.6311 17.6388C32.0884 17.6757 30.544 17.6633 29.0007 17.6427C28.4772 17.6357 28.0359 17.6385 27.9214 18.3198C27.8948 18.4777 27.6436 18.6774 27.4679 18.7124C27.0179 18.8019 26.542 18.7634 26.0963 18.8657C25.7788 18.9386 25.4246 19.0909 25.2081 19.3246C24.7664 19.8014 24.334 20.1819 23.6338 20.0548C23.2765 19.99 22.9107 19.9452 22.5486 19.944C22.0167 19.9421 21.3516 19.9003 21.2484 20.589C21.1412 21.3041 20.7639 21.3958 20.1847 21.3139C20.1199 21.7753 20.0616 22.1903 20.0029 22.7037C20.0026 22.7693 20.0023 22.8349 19.8893 22.8985Z" fill="#F5F5F5"/>
      <path d="M6.47614 37.652C6.83013 37.7901 7.17082 38.0529 7.55283 38.1553C8.33788 38.3657 9.14422 38.6237 9.94323 38.6288C16.0169 38.6676 22.0909 38.6501 28.1649 38.6501C33.8959 38.6501 39.627 38.6379 45.358 38.6594C46.6547 38.6643 47.5195 37.9029 48.2309 36.9971C48.5326 36.6128 48.5129 35.9084 48.5175 35.3485C48.5426 32.326 48.5228 29.3031 48.538 26.2804C48.5399 25.9181 48.688 25.5587 48.7159 25.1938C48.7374 24.9139 48.7126 24.6181 48.6443 24.3461C48.5146 23.8297 48.3609 23.3287 48.9158 22.9099C49.065 23.269 49.253 23.6421 49.2381 24.0065C49.1876 25.2443 49.0017 26.4781 48.9835 27.7152C48.9424 30.5118 48.9911 33.3098 48.9486 36.1064C48.9422 36.5269 48.6994 36.9816 48.4621 37.3511C48.1497 37.8377 47.7732 38.3 47.3485 38.686C47.1006 38.9114 46.7052 39.0818 46.3755 39.0831C40.3031 39.1061 34.2306 39.1107 28.1582 39.0928C26.4014 39.0876 24.6447 38.9579 22.8881 38.9613C20.764 38.9654 18.64 39.0933 16.5161 39.0892C13.8288 39.0841 11.1416 39.006 8.45466 38.9464C7.56959 38.9268 7.01857 38.3181 6.47614 37.652Z" fill="#F9F9FA"/>
      <path d="M47.4984 14.7411C46.4472 14.6842 45.3963 14.5448 44.3412 14.462C43.818 14.4209 43.2869 14.4978 42.7594 14.498C32.7973 14.5008 22.8352 14.5021 12.873 14.4937C12.3897 14.4933 11.9063 14.4019 11.4232 14.3498C10.219 14.2198 9.06719 14.5138 7.85391 14.7986C7.93026 14.6025 8.03913 14.2681 8.20796 14.2329C8.7758 14.1145 9.36495 14.0573 9.94601 14.0568C21.3524 14.0478 32.7589 14.0466 44.1653 14.0566C45.0648 14.0574 45.9672 14.1228 46.8613 14.2226C47.0869 14.2478 47.2858 14.5221 47.4984 14.7411Z" fill="#F9F9FA"/>
      <path d="M5.73526 15.4202C5.83333 15.6176 6.01579 15.885 6.01678 16.1531C6.03415 20.8614 6.02934 25.5698 6.02938 30.2782C6.02938 30.4526 5.97002 30.6579 6.03916 30.7965C6.70633 32.134 6.04252 33.511 6.17607 34.9307C6.029 34.5937 5.75605 34.1876 5.75422 33.7802C5.72684 27.6838 5.73523 21.5871 5.73526 15.4202Z" fill="#F9F9FA"/>
      <path d="M48.9704 22.08C48.8023 21.7906 48.5433 21.445 48.4876 21.068C48.4003 20.4769 48.4261 19.8638 48.4487 19.2617C48.4736 18.6013 48.4227 17.8932 48.6463 17.3006C48.8015 16.8894 48.7043 16.7492 48.5021 16.4863C48.1487 16.0267 47.8329 15.537 47.5007 15.0049C47.8708 15.353 48.2168 15.7841 48.6183 16.1523C49.1173 16.6098 49.0147 17.0815 48.9238 17.6917C48.7982 18.5344 48.949 19.4187 48.9682 20.2854C48.9809 20.8599 48.9705 21.4349 48.9704 22.08Z" fill="#F9F9FA"/>
      <path d="M6.12597 14.4548C6.06246 14.5962 5.94897 14.7429 5.78548 14.8948C5.84898 14.7534 5.96249 14.6068 6.12597 14.4548Z" fill="#F9F9FA"/>
      <path d="M20.0032 22.6053C20.0616 22.1903 20.1199 21.7753 20.1847 21.3139C20.7639 21.3958 21.1412 21.3041 21.2484 20.589C21.3516 19.9003 22.0167 19.9421 22.5486 19.944C22.9107 19.9453 23.2765 19.99 23.6338 20.0548C24.3339 20.1819 24.7664 19.8014 25.2081 19.3246C25.4246 19.0909 25.7788 18.9387 26.0963 18.8657C26.542 18.7634 27.0179 18.802 27.4679 18.7124C27.6436 18.6774 27.8948 18.4777 27.9214 18.3198C28.0359 17.6385 28.4772 17.6357 29.0007 17.6427C30.544 17.6633 32.0884 17.6758 33.6311 17.6388C34.356 17.6214 35.0837 17.5167 35.8 17.3912C36.593 17.2523 36.9421 17.4732 36.8997 18.2881C36.856 19.1257 36.7337 19.9609 36.6121 20.792C36.5114 21.48 36.8892 21.9485 37.3858 22.187C37.8688 22.4189 38.0037 22.7029 37.938 23.1653C37.8302 23.9248 38.2027 24.3211 38.8885 24.3735C39.4705 24.4179 39.5623 24.7556 39.5589 25.2251C39.5571 25.475 39.5686 25.7254 39.5569 25.9748C39.5379 26.3845 39.652 26.6383 40.1183 26.6599C40.7068 26.687 40.9295 27.0885 40.8762 27.6342C40.7753 28.6672 40.6391 29.6966 40.5185 30.7276C39.2648 31.1153 39.2648 31.1153 39.2647 32.513C39.2647 32.638 39.2652 32.7629 39.2646 32.8879C39.2605 33.7026 39.1314 33.8171 38.3781 33.6748C37.216 33.4554 36.7153 33.8515 36.6098 35.0472C36.5939 35.2283 36.5027 35.5414 36.4128 35.5545C35.7769 35.6475 35.584 36.0435 35.5102 36.6309C35.4921 36.7748 35.1606 36.9824 34.972 36.9838C31.885 37.0057 28.7978 37.0008 25.7106 36.9979C24.9398 36.9973 25.1904 36.2988 25.0031 35.8999C24.8719 35.6205 24.7993 35.1697 24.5974 35.0981C24.2093 34.9606 23.748 34.9434 23.4879 35.506C23.4057 35.6837 22.9978 35.7877 22.7409 35.784C21.6442 35.7682 20.5468 35.7194 19.4534 35.6334C19.2312 35.6159 18.8726 35.4183 18.8377 35.2481C18.681 34.4839 18.1842 34.3825 17.5722 34.4585C17.309 34.4911 17.0534 34.5902 16.7952 34.6625C16.1093 34.8545 15.8185 34.6062 15.8861 33.883C15.8931 33.8088 15.9023 33.7343 15.9183 33.6617C16.2046 32.3648 16.201 32.3581 14.9536 31.9624C14.9573 31.9173 14.9498 31.8388 14.9681 31.832C16.1759 31.3811 16.1763 31.3817 16.1764 30.0165C16.1766 28.2946 16.1765 26.5727 16.1765 24.7648C17.3994 24.7203 17.6006 23.9159 17.4971 22.9167C17.4439 22.4024 17.6993 22.3495 18.1364 22.2757C18.8697 22.1518 19.3457 22.5795 19.9457 22.9637C20.0017 23.2859 20.0013 23.5428 19.9441 23.8126C19.6684 24.2902 19.4701 24.7531 20.0018 25.2209C19.8951 26.6852 20.2478 28.1075 19.7278 29.4811C19.6401 29.7128 19.6541 30.0614 19.765 30.28C20.0995 30.9397 20.5049 31.5619 20.8879 32.2526C21.0857 32.546 21.2563 32.8091 21.4749 33.0207C22.1834 33.7065 23.3579 33.5006 24.0005 34.3857C24.0902 34.5092 24.6184 34.3389 24.9281 34.2491C25.2721 34.1493 25.599 33.8673 25.9322 33.8693C28.1518 33.8824 30.3712 33.9463 32.5903 34.0061C32.8287 34.0125 33.0732 34.1622 33.3005 34.1324C33.6468 34.0868 34.1517 34.04 34.2751 33.8147C34.4208 33.5489 34.2643 33.0841 34.1748 32.7219C34.1273 32.5295 33.9446 32.3719 33.8819 32.1962C34.5304 32.0029 34.1565 31.4976 34.318 31.1425C34.6778 30.6098 35.1282 30.1208 35.2672 29.5527C35.5178 28.5278 35.6408 27.4594 35.7079 26.402C35.7758 25.3334 35.8135 24.2413 35.667 23.188C35.5771 22.5414 34.8418 22.0167 35.2692 21.2174C35.3008 21.1583 35.071 20.9295 34.9372 20.8092C34.7758 20.6641 34.5987 20.5272 34.4076 20.4287C34.0745 20.2571 33.7254 20.1176 33.3831 19.9646C33.3941 20.0537 33.4051 20.1428 33.4162 20.2319C33.2571 20.4728 33.098 20.7136 32.8701 20.9538C30.008 20.9528 27.2146 20.9373 24.4216 20.9629C23.7425 20.9692 23.0653 21.1683 22.386 21.1772C21.3032 21.1914 20.5664 21.7286 20.0032 22.6053Z" fill="#F2F2F3"/>
      <path d="M20.0031 22.6543C20.5664 21.7284 21.3032 21.1912 22.386 21.177C23.0653 21.1681 23.7425 20.969 24.4216 20.9628C27.2146 20.9371 30.008 20.9526 32.88 21.0064C33.6865 21.4295 34.4285 21.8135 34.5974 22.7218C34.699 23.2682 34.6729 23.8393 34.7041 24.4593C34.7035 24.6791 34.7029 24.8389 34.6605 25.0373C34.5494 25.4624 34.4346 25.8471 34.4188 26.236C34.3525 27.8735 34.3157 29.5122 34.2681 31.1504C34.1565 31.4974 34.5304 32.0028 33.8233 32.1973C33.3631 32.3003 33.0169 32.497 32.6782 32.4845C28.7474 32.3393 24.8007 32.8571 20.8827 32.1986C20.5049 31.5618 20.0995 30.9395 19.765 30.2799C19.6541 30.0612 19.6401 29.7126 19.7278 29.481C20.2478 28.1074 19.8951 26.685 20.0019 25.1532C20.0015 24.6101 20.0012 24.2048 20.0009 23.7996C20.0013 23.5426 20.0017 23.2857 20.0021 22.9646C20.0023 22.8348 20.0026 22.7691 20.0031 22.6543ZM20.7238 22.5895C20.7272 25.2932 20.7306 27.997 20.7314 30.8248C20.6914 31.3774 20.8209 31.8273 21.4433 31.9183C22.1652 32.0238 22.8899 32.1745 23.6146 32.1826C26.4212 32.2141 29.2282 32.1976 32.0351 32.1972C33.4156 32.197 33.9662 31.6414 33.9727 30.2467C33.9746 29.8484 33.9733 29.4501 33.975 28.9108C33.977 27.0898 33.9377 25.2674 33.9992 23.4485C34.0284 22.5858 33.5755 22.189 32.87 21.7628C32.6158 21.6939 32.3618 21.5662 32.1073 21.565C28.8522 21.5495 25.597 21.5473 22.342 21.5623C22.1441 21.5632 21.9471 21.7372 21.6594 21.8427C21.5989 21.8482 21.5384 21.8538 21.3655 21.8501C21.1542 22.0497 20.9428 22.2493 20.7238 22.5895Z" fill="#E3E2E2"/>
      <path d="M20.8879 32.2527C24.8007 32.8573 28.7474 32.3394 32.6782 32.4847C33.0169 32.4972 33.3631 32.3004 33.7644 32.1997C33.9447 32.3719 34.1273 32.5295 34.1749 32.7219C34.2643 33.0841 34.4208 33.5489 34.2751 33.8147C34.1517 34.04 33.6468 34.0869 33.3006 34.1324C33.0732 34.1623 32.8287 34.0126 32.5903 34.0061C30.3712 33.9463 28.1518 33.8824 25.9322 33.8693C25.599 33.8673 25.2721 34.1493 24.9281 34.2491C24.6184 34.3389 24.0902 34.5093 24.0005 34.3857C23.3579 33.5006 22.1834 33.7065 21.4749 33.0207C21.2563 32.8091 21.0857 32.5461 20.8879 32.2527Z" fill="#EFEFF1"/>
      <path d="M34.7041 24.3995C34.6729 23.8395 34.699 23.2684 34.5974 22.722C34.4285 21.8137 33.6865 21.4297 32.9488 21.0073C33.098 20.7136 33.2571 20.4728 33.4162 20.2319C33.4051 20.1428 33.3941 20.0537 33.3831 19.9646C33.7254 20.1176 34.0745 20.2571 34.4076 20.4287C34.5987 20.5272 34.7758 20.6642 34.9372 20.8092C35.071 20.9295 35.3008 21.1584 35.2692 21.2174C34.8418 22.0167 35.5771 22.5415 35.667 23.1881C35.8135 24.2413 35.7758 25.3334 35.7079 26.402C35.6408 27.4594 35.5178 28.5278 35.2672 29.5527C35.1282 30.1209 34.6778 30.6098 34.318 31.1425C34.3157 29.5124 34.3525 27.8737 34.4188 26.2362C34.4346 25.8473 34.5494 25.4626 34.7169 25.0364C34.9213 24.879 35.0275 24.7612 35.1337 24.6435C34.9905 24.5621 34.8473 24.4808 34.7041 24.3995Z" fill="#EFEFF1"/>
      <path d="M19.9442 23.8125C20.0012 24.2049 20.0015 24.6102 20.0016 25.083C19.4701 24.753 19.6684 24.2901 19.9442 23.8125Z" fill="#F5F5F5"/>
      <path d="M33.9735 29.0518C33.9733 29.4501 33.9746 29.8485 33.9727 30.2468C33.9662 31.6414 33.4156 32.197 32.0351 32.1972C29.2282 32.1976 26.4212 32.2142 23.6146 32.1827C22.8899 32.1745 22.1652 32.0239 21.4433 31.9183C20.8209 31.8273 20.6914 31.3774 20.7844 30.7725C21.1445 31.0781 21.218 31.7329 21.9752 31.6C22.4867 31.6012 22.9344 31.602 23.4511 31.6024C24.7483 31.6024 25.9765 31.6027 27.2186 31.662C28.1286 31.7495 29.0247 31.7798 29.9209 31.7979C29.9466 31.7985 29.9749 31.6699 30.0456 31.5984C30.1581 31.5477 30.227 31.5 30.3554 31.4516C30.7019 31.3572 31.2354 31.2642 31.2357 31.1696C31.2374 30.5547 31.7309 30.4034 32.1149 30.1075C32.3816 30.1899 32.5948 30.2636 32.8081 30.3373C32.8534 30.1283 32.9366 29.9195 32.9381 29.7102C32.9539 27.4866 32.9568 25.263 33.0107 23.0415C33.1217 23.0453 33.1851 23.0469 33.2472 23.1187C33.2521 23.9347 33.2584 24.6805 33.2568 25.4925C33.3159 27.0423 33.383 28.5261 33.4554 30.1297C33.6716 29.6799 33.8226 29.3658 33.9735 29.0518Z" fill="#C5C3C5"/>
      <path d="M21.7496 21.8307C21.9471 21.7373 22.1441 21.5633 22.342 21.5624C25.597 21.5474 28.8522 21.5496 32.1073 21.5651C32.3618 21.5663 32.6158 21.694 32.8743 21.8505C32.7956 22.1175 32.7125 22.2969 32.5626 22.4706C29.2095 22.4557 25.9233 22.4466 22.6524 22.382C22.976 22.229 23.2845 22.1315 23.593 22.0341C23.5878 21.9663 23.5827 21.8985 23.5775 21.8307C22.9682 21.8307 22.3589 21.8307 21.7496 21.8307Z" fill="#C4BBB6"/>
      <path d="M32.6295 22.4763C32.7125 22.2969 32.7956 22.1174 32.9089 21.8962C33.5755 22.189 34.0284 22.5858 33.9992 23.4485C33.9377 25.2674 33.977 27.0898 33.9742 28.9813C33.8226 29.3658 33.6716 29.6798 33.4554 30.1297C33.383 28.526 33.3159 27.0423 33.3143 25.4964C33.4611 25.3935 33.6128 25.3541 33.6135 25.312C33.6275 24.4826 33.6239 23.6529 33.6239 22.7164C33.4245 22.8928 33.3365 22.9707 33.2485 23.0485C33.1851 23.0469 33.1217 23.0453 32.9998 22.9956C32.853 22.8725 32.7647 22.7975 32.6673 22.6819C32.6486 22.5862 32.6391 22.5313 32.6295 22.4763Z" fill="#B4B1B2"/>
      <path d="M21.7045 21.8368C22.3589 21.8308 22.9682 21.8308 23.5775 21.8308C23.5827 21.8986 23.5878 21.9664 23.593 22.0342C23.2845 22.1317 22.9761 22.2291 22.6052 22.3845C22.4798 22.4465 22.4168 22.4507 22.293 22.4507C21.7976 22.3898 21.5222 22.5538 21.4696 23.0223C21.4227 23.4401 21.3425 23.8579 21.3388 24.2762C21.3223 26.1676 21.3278 28.0592 21.267 29.9368C21.1488 29.6739 21.0388 29.4253 21.037 29.1759C21.021 26.9332 21.0241 24.6903 21.033 22.3979C21.189 22.1854 21.3334 22.0224 21.4779 21.8595C21.5384 21.854 21.5989 21.8484 21.7045 21.8368Z" fill="#A09995"/>
      <path d="M21.0215 22.4473C21.0241 24.6901 21.021 26.933 21.037 29.1758C21.0388 29.4251 21.1488 29.6737 21.3068 29.9721C21.5252 30.3473 21.6453 30.6731 21.7699 31.0507C21.8201 31.2683 21.8658 31.4339 21.9115 31.5995C21.218 31.7329 21.1445 31.0781 20.7857 30.7105C20.7307 27.997 20.7272 25.2933 20.7761 22.5193C20.8927 22.4484 20.9571 22.4478 21.0215 22.4473Z" fill="#B4B1B2"/>
      <path d="M34.7041 24.4595C34.8473 24.4808 34.9905 24.5621 35.1337 24.6435C35.0275 24.7612 34.9213 24.879 34.7587 24.9979C34.7029 24.8391 34.7035 24.6793 34.7041 24.4595Z" fill="#F2F2F3"/>
      <path d="M21.033 22.3977C20.9571 22.4478 20.8927 22.4484 20.7799 22.449C20.9429 22.2494 21.1542 22.0497 21.4217 21.8547C21.3334 22.0223 21.189 22.1852 21.033 22.3977Z" fill="#C4BBB6"/>
      <path d="M30.2958 31.4522C30.227 31.4999 30.1581 31.5476 29.9777 31.5977C29.2979 31.5543 28.7301 31.4841 28.1612 31.4723C27.8434 31.4657 27.5236 31.5561 27.2047 31.6029C25.9765 31.6026 24.7483 31.6023 23.4512 31.5429C23.4552 30.9699 23.2081 30.6373 22.7985 30.3467C22.9981 29.9275 23.1918 29.5618 23.4506 29.1961C24.0091 29.0976 24.5027 28.9989 24.9994 28.8941C25.0026 28.888 25.0162 28.8874 25.0232 28.9467C25.7785 29.3971 26.2219 29.2807 26.613 28.5957C26.6172 28.5998 26.6099 28.5907 26.6637 28.5882C27.4516 28.2924 27.584 27.5336 27.9391 26.9477C27.9412 26.9499 27.9368 26.9457 27.9945 26.9406C28.4104 26.7993 28.7687 26.6631 29.1586 26.5222C29.1903 26.5175 29.2544 26.5168 29.271 26.5471C29.3158 26.6152 29.3514 26.6431 29.398 26.7085C29.4061 26.8189 29.4107 26.8821 29.4199 26.9939C29.5187 27.1113 29.613 27.18 29.7066 27.2493C29.7059 27.2499 29.7072 27.2485 29.7071 27.3025C29.8106 27.4657 29.9141 27.5749 30.0629 27.6928C30.178 27.7932 30.2479 27.8848 30.3154 28.0274C30.4077 28.1499 30.5023 28.2213 30.6031 28.3292C30.6093 28.3657 30.6136 28.4397 30.5646 28.4636C30.3165 28.9523 29.8283 29.6524 29.973 29.8375C30.3928 30.3744 30.2412 30.911 30.2958 31.4522Z" fill="#B4B1B2"/>
      <path d="M30.6136 28.4399C30.6136 28.4399 30.6093 28.3659 30.5963 28.2826C30.4948 28.125 30.4063 28.0508 30.3178 27.9765C30.2479 27.885 30.178 27.7934 30.0581 27.6416C29.9078 27.4705 29.8075 27.3596 29.7072 27.2487C29.7072 27.2487 29.7059 27.2501 29.7073 27.1988C29.7106 27.0798 29.7125 27.0122 29.7674 26.9514C30.5221 27.6702 31.2189 28.3874 31.9295 29.0902C32.0829 29.242 32.2859 29.3417 32.4661 29.4654C32.5269 29.2675 32.6396 29.0699 32.6406 28.8718C32.6511 26.8334 32.6434 24.7949 32.6497 22.7479C32.6585 22.7393 32.6765 22.7227 32.6765 22.7227C32.7648 22.7977 32.853 22.8726 32.9522 22.9936C32.9568 25.2631 32.954 27.4868 32.9381 29.7103C32.9366 29.9197 32.8534 30.1284 32.8081 30.3374C32.5949 30.2637 32.3816 30.19 32.1112 30.0632C32.0084 29.9389 31.9629 29.8676 31.9109 29.7486C31.8125 29.6288 31.7206 29.5569 31.6203 29.4353C31.2792 29.0704 30.9464 28.7552 30.6136 28.4399Z" fill="#E3E2E2"/>
      <path d="M31.9174 29.7963C31.9629 29.8675 32.0084 29.9388 32.0577 30.0544C31.7309 30.4034 31.2374 30.5547 31.2357 31.1696C31.2354 31.2642 30.7019 31.3572 30.3555 31.4516C30.2412 30.911 30.3928 30.3744 29.973 29.8376C29.8283 29.6524 30.3165 28.9523 30.5646 28.4636C30.9464 28.755 31.2791 29.0703 31.622 29.4856C31.7272 29.6559 31.8223 29.7261 31.9174 29.7963Z" fill="#B8B8B8"/>
      <path d="M22.7927 30.4001C23.2081 30.6374 23.4552 30.9701 23.3823 31.5433C22.9344 31.6021 22.4867 31.6013 21.9752 31.6001C21.8658 31.434 21.82 31.2684 21.8246 31.0508C22.1808 30.7993 22.4867 30.5997 22.7927 30.4001Z" fill="#B8B8B8"/>
      <path d="M33.2472 23.1189C33.3365 22.9709 33.4245 22.893 33.6239 22.7166C33.6239 23.6531 33.6275 24.4828 33.6135 25.3122C33.6128 25.3543 33.4611 25.3937 33.3222 25.4304C33.2584 24.6807 33.2521 23.9349 33.2472 23.1189Z" fill="#A09995"/>
      <path d="M27.2186 31.6619C27.5236 31.5561 27.8434 31.4657 28.1612 31.4723C28.7301 31.484 29.2978 31.5543 29.934 31.6007C29.9749 31.6698 29.9466 31.7984 29.9209 31.7979C29.0247 31.7798 28.1286 31.7495 27.2186 31.6619Z" fill="#B8B8B8"/>
      <path d="M22.3538 22.4549C22.4168 22.4507 22.4798 22.4465 22.59 22.4399C25.9233 22.4467 29.2095 22.4557 32.5626 22.4706C32.6391 22.5314 32.6486 22.5864 32.6673 22.682C32.6765 22.7226 32.6584 22.7393 32.5814 22.747C29.4143 22.7558 26.3241 22.7569 23.1687 22.7559C22.8218 22.7673 22.5402 22.7808 22.1598 22.799C22.1598 25.061 22.1598 27.2387 22.1598 29.3465C22.7713 28.842 23.3411 28.289 23.9956 27.8753C24.2377 27.7223 24.6855 27.863 25.0272 27.9327C25.33 27.9945 25.6644 28.2967 25.8981 28.2195C26.2837 28.0923 26.7976 27.8913 26.6722 27.2433C27.2811 26.8961 27.84 26.557 28.3862 26.2657C28.228 26.5243 28.0824 26.7351 27.9368 26.9458C27.9368 26.9458 27.9412 26.9501 27.8861 26.9533C27.0437 27.2056 26.9889 28.0242 26.6099 28.5908C26.6099 28.5908 26.6172 28.6 26.5549 28.5964C26.0004 28.691 25.5083 28.7892 25.0162 28.8875C25.0162 28.8875 25.0026 28.8882 24.9905 28.8413C24.4641 28.0478 23.9764 27.9587 23.5546 28.5525C23.4183 28.7443 23.3445 28.9823 23.1906 29.2051C22.9877 29.4271 22.8639 29.673 22.6779 29.8515C22.4659 30.0549 22.1985 30.1982 21.9552 30.3677C21.8896 30.1221 21.7688 29.8769 21.7669 29.6307C21.7517 27.6387 21.7817 25.646 21.7443 23.6546C21.7339 23.0956 21.8644 22.7045 22.3538 22.4549Z" fill="#E3E2E2"/>
      <path d="M22.293 22.4507C21.8644 22.7045 21.7339 23.0956 21.7444 23.6546C21.7817 25.646 21.7517 27.6387 21.767 29.6307C21.7688 29.8769 21.8896 30.1221 21.9552 30.3677C22.1986 30.1982 22.4659 30.0549 22.6779 29.8515C22.8639 29.673 22.9877 29.4271 23.2264 29.2025C23.3138 29.1939 23.3856 29.1961 23.3856 29.1961C23.1918 29.5619 22.9981 29.9277 22.7985 30.3468C22.4867 30.5998 22.1808 30.7993 21.8201 30.999C21.6453 30.6732 21.5252 30.3474 21.3652 29.9861C21.3278 28.0591 21.3223 26.1675 21.3388 24.2762C21.3425 23.8578 21.4227 23.4401 21.4696 23.0223C21.5222 22.5538 21.7976 22.3897 22.293 22.4507Z" fill="#C5C3C5"/>
      <path d="M28.3988 26.2179C27.84 26.557 27.2811 26.8961 26.6276 27.2367C26.433 26.5594 26.0336 26.1931 25.5313 26.2456C24.9275 26.3088 24.318 26.3308 23.711 26.3307C23.6062 26.3307 23.5014 26.1318 23.4634 26.0293C24.0381 26.0339 24.5587 26.1017 25.0487 26.0061C25.3004 25.957 25.6291 25.6495 25.6897 25.3998C25.7949 24.9668 25.7189 24.488 25.7189 24.181C25.2781 23.9598 24.9818 23.8111 24.7368 23.6522C24.9344 23.161 24.886 23.1172 24.3993 23.0431C24.0057 22.9832 23.622 22.8557 23.2339 22.7581C26.3241 22.757 29.4143 22.7558 32.5726 22.7556C32.6434 24.795 32.6511 26.8334 32.6406 28.8718C32.6396 29.07 32.5269 29.2676 32.4661 29.4654C32.2859 29.3417 32.0829 29.242 31.9295 29.0902C31.2189 28.3875 30.5221 27.6703 29.7654 26.9512C29.7105 26.9442 29.7113 26.9413 29.7034 26.8929C29.5952 26.7835 29.4949 26.7224 29.3945 26.6614C29.3514 26.6434 29.3158 26.6154 29.269 26.4958C29.1507 26.349 29.051 26.284 28.8958 26.2176C28.6931 26.2168 28.546 26.2173 28.3988 26.2179Z" fill="#F2F3F7"/>
      <path d="M23.4506 29.1963C23.3856 29.1962 23.3138 29.1939 23.278 29.1966C23.3446 28.9824 23.4183 28.7443 23.5546 28.5525C23.9764 27.9587 24.4641 28.0478 24.9873 28.8474C24.5027 28.9991 24.0091 29.0977 23.4506 29.1963Z" fill="#A09995"/>
      <path d="M26.6637 28.5883C26.9889 28.0241 27.0437 27.2055 27.884 26.9509C27.584 27.5337 27.4516 28.2924 26.6637 28.5883Z" fill="#C5C3C5"/>
      <path d="M25.0232 28.9466C25.5083 28.7891 26.0004 28.6908 26.5507 28.592C26.2219 29.2807 25.7785 29.3971 25.0232 28.9466Z" fill="#C5C3C5"/>
      <path d="M28.3862 26.2657C28.546 26.2173 28.6932 26.2168 28.9052 26.2623C29.0224 26.3813 29.0747 26.4542 29.1269 26.5271C28.7687 26.6633 28.4104 26.7995 27.9945 26.9408C28.0824 26.7351 28.228 26.5243 28.3862 26.2657Z" fill="#C5C3C5"/>
      <path d="M29.7071 27.3025C29.8075 27.3594 29.9078 27.4703 30.0129 27.6326C29.9141 27.5749 29.8106 27.4657 29.7071 27.3025Z" fill="#C5C3C5"/>
      <path d="M30.3154 28.0276C30.4063 28.0508 30.4948 28.125 30.5901 28.2461C30.5023 28.2214 30.4076 28.1501 30.3154 28.0276Z" fill="#C5C3C5"/>
      <path d="M29.1586 26.5224C29.0746 26.4542 29.0224 26.3813 28.9606 26.2637C29.051 26.284 29.1507 26.349 29.2524 26.4655C29.2544 26.517 29.1903 26.5177 29.1586 26.5224Z" fill="#E3E2E2"/>
      <path d="M29.7124 26.9443C29.7124 27.0121 29.7106 27.0798 29.708 27.198C29.613 27.18 29.5187 27.1114 29.4691 26.994C29.5797 26.9439 29.6455 26.9425 29.7113 26.9412C29.7113 26.9412 29.7105 26.9441 29.7124 26.9443Z" fill="#C5C3C5"/>
      <path d="M29.7034 26.8927C29.6455 26.9425 29.5797 26.9438 29.4646 26.9452C29.4107 26.8821 29.4061 26.819 29.398 26.7085C29.4949 26.7222 29.5952 26.7833 29.7034 26.8927Z" fill="#E3E2E2"/>
      <path d="M31.9109 29.7486C31.8223 29.7262 31.7272 29.656 31.6304 29.5354C31.7206 29.5569 31.8125 29.6289 31.9109 29.7486Z" fill="#C5C3C5"/>
      <path d="M23.1687 22.7559C23.622 22.8555 24.0057 22.9831 24.3993 23.043C24.886 23.1171 24.9344 23.1609 24.6778 23.6523C23.1916 23.7543 23.0755 23.8776 23.105 25.2162C23.1066 25.2905 23.1097 25.3647 23.0726 25.4659C23.1512 25.6283 23.2692 25.7638 23.3904 25.9306C23.3935 25.9619 23.3967 26.0247 23.3967 26.0247C23.5015 26.1317 23.6062 26.3306 23.711 26.3306C24.318 26.3307 24.9275 26.3086 25.5313 26.2455C26.0336 26.193 26.433 26.5592 26.5776 27.2447C26.7976 27.8913 26.2837 28.0922 25.8981 28.2195C25.6644 28.2966 25.3301 27.9944 25.0272 27.9326C24.6855 27.8629 24.2377 27.7223 23.9956 27.8753C23.3411 28.2889 22.7713 28.842 22.1598 29.3465C22.1598 27.2386 22.1598 25.0609 22.1598 22.799C22.5402 22.7807 22.8218 22.7672 23.1687 22.7559Z" fill="#F7F9FB"/>
      <path d="M23.4634 26.0292C23.3967 26.0247 23.3935 25.9619 23.3873 25.8826C23.2914 25.682 23.2018 25.5605 23.1121 25.439C23.1097 25.3647 23.1066 25.2905 23.1049 25.2162C23.0754 23.8776 23.1916 23.7543 24.6265 23.6626C24.9818 23.811 25.2781 23.9597 25.7189 24.1809C25.7189 24.4878 25.7949 24.9667 25.6897 25.3997C25.6291 25.6494 25.3004 25.9568 25.0487 26.006C24.5587 26.1016 24.0381 26.0338 23.4634 26.0292ZM25.0039 24.9172C25.0593 24.4593 24.8981 24.1625 24.4109 24.2529C24.1531 24.3008 23.7674 24.4337 23.7124 24.6145C23.6429 24.8434 23.8294 25.3859 23.9435 25.3973C24.3043 25.4333 24.8539 25.7695 25.0039 24.9172Z" fill="#C7CBD0"/>
      <path d="M23.0726 25.4658C23.2018 25.5604 23.2915 25.6819 23.3842 25.8512C23.2692 25.7637 23.1512 25.6282 23.0726 25.4658Z" fill="#F2F3F7"/>
      <path d="M25.0014 24.9837C24.8539 25.7695 24.3043 25.4333 23.9435 25.3973C23.8294 25.3859 23.6429 24.8434 23.7124 24.6145C23.7674 24.4337 24.1531 24.3007 24.4109 24.2529C24.8981 24.1625 25.0593 24.4593 25.0014 24.9837Z" fill="#7E828A"/>
      </g>
      <defs>
      <clipPath id="clip0_83_298">
      <rect width="45" height="27" fill="white" transform="translate(5 11)"/>
      </clipPath>
      </defs>
      </svg>
`,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="8" y="6" width="33" height="6" fill="#E0E0E0"/>
      <rect x="54" y="21" width="30" height="3" fill="#E0E0E0"/>
      <rect x="54" y="28" width="30" height="3" fill="#E0E0E0"/>
      <rect x="54" y="35" width="30" height="3" fill="#E0E0E0"/>
      <circle cx="48.5" cy="36.5" r="1.5" fill="#D9D9D9"/>
      <circle cx="48.5" cy="22.5" r="1.5" fill="#D9D9D9"/>
      <path d="M50 29.5C50 30.3284 49.3284 31 48.5 31C47.6716 31 47 30.3284 47 29.5C47 28.6716 47.6716 28 48.5 28C49.3284 28 50 28.6716 50 29.5Z" fill="#D9D9D9"/>
      <g clip-path="url(#clip0_83_37)">
      <path d="M42.1304 26.1337C42.1304 26.3187 42.1304 26.5038 42.0845 26.7532C41.6158 27.181 41.7456 27.6264 41.8552 28.0854C41.9128 28.3271 41.9338 28.5901 41.9157 28.8388C41.8921 29.1632 41.767 29.4827 41.7654 29.8047C41.7526 32.4916 41.7693 35.1786 41.7481 37.8653C41.7442 38.363 41.7609 38.9891 41.5061 39.3307C40.9054 40.1359 40.1751 40.8126 39.08 40.8083C34.2406 40.7892 29.401 40.8 24.5614 40.8C19.4323 40.8 14.3032 40.8156 9.17427 40.7811C8.49955 40.7765 7.81864 40.5472 7.15571 40.3602C6.83312 40.2692 6.54543 40.0356 6.24195 39.8665C6.17518 39.7134 6.10841 39.5602 6.01748 39.3085C5.88034 38.0099 6.4409 36.7859 5.87751 35.597C5.81913 35.4738 5.86925 35.2913 5.86925 35.1363C5.86922 30.951 5.87328 26.7658 5.85861 22.5806C5.85777 22.3423 5.7037 22.1046 5.62094 21.8667C5.62094 21.7667 5.62094 21.6668 5.66323 21.5122C5.80135 21.3271 5.89718 21.1967 5.99301 21.0664C6.20522 20.3645 6.58387 19.831 7.36585 19.6036C8.4345 19.3455 9.40718 19.0842 10.424 19.1998C10.832 19.2461 11.2402 19.3273 11.6483 19.3277C20.0608 19.3352 28.4733 19.334 36.8857 19.3315C37.3312 19.3314 37.7796 19.263 38.2214 19.2995C39.1124 19.3731 39.9998 19.497 40.8887 19.6002C40.8887 19.6002 40.8889 19.6667 40.8894 19.7489C41.17 20.2552 41.4367 20.6904 41.7351 21.099C41.9058 21.3327 41.9879 21.4573 41.8568 21.8228C41.668 22.3495 41.711 22.9789 41.69 23.566C41.6709 24.1011 41.6491 24.6462 41.7228 25.1716C41.7698 25.5066 41.9886 25.8139 42.1304 26.1337ZM17.5732 26.7986C17.1141 26.515 16.7122 26.1349 16.0929 26.245C15.7238 26.3107 15.5081 26.3576 15.5531 26.8148C15.6405 27.703 15.4706 28.418 14.4379 28.4576C14.4379 30.0646 14.438 31.5952 14.4379 33.1257C14.4377 34.3392 14.4374 34.3388 13.4175 34.7395C13.4021 34.7455 13.4084 34.8153 13.4061 34.8555C14.4586 35.2072 14.4616 35.2131 14.2199 36.3659C14.2064 36.4304 14.1986 36.4967 14.1927 36.5626C14.1356 37.2054 14.3812 37.4261 14.9604 37.2555C15.1784 37.1913 15.3942 37.1032 15.6165 37.0741C16.1333 37.0067 16.5528 37.0968 16.6852 37.7761C16.7146 37.9274 17.0174 38.103 17.2051 38.1185C18.1284 38.1949 19.0551 38.2383 19.9812 38.2524C20.1981 38.2557 20.5426 38.1632 20.612 38.0053C20.8316 37.5052 21.2212 37.5205 21.5489 37.6427C21.7194 37.7064 21.7807 38.1071 21.8915 38.3554C22.0497 38.71 21.8381 39.3308 22.4889 39.3315C25.0959 39.334 27.7029 39.3383 30.3097 39.3188C30.469 39.3177 30.7489 39.1331 30.7642 39.0052C30.8265 38.483 30.9894 38.131 31.5264 38.0484C31.6023 38.0368 31.6792 37.7584 31.6927 37.5974C31.7818 36.5346 32.2046 36.1825 33.186 36.3776C33.8221 36.504 33.9311 36.4022 33.9346 35.6781C33.9351 35.567 33.9346 35.4559 33.9346 35.3449C33.9347 34.1025 33.9347 34.1025 34.9926 33.7577C35.0953 32.8413 35.2103 31.9263 35.2955 31.0081C35.3405 30.5231 35.1524 30.1662 34.6554 30.1421C34.2616 30.1229 34.1653 29.8973 34.1814 29.5331C34.1912 29.3114 34.1816 29.0889 34.1831 28.8667C34.1859 28.4494 34.1084 28.1492 33.617 28.1097C33.0378 28.0632 32.7233 27.7109 32.8143 27.0358C32.8698 26.6247 32.7559 26.3723 32.348 26.1662C31.9286 25.9542 31.6096 25.5377 31.6946 24.9262C31.7973 24.1874 31.9007 23.445 31.9375 22.7005C31.9733 21.9761 31.6785 21.7798 31.0089 21.9033C30.404 22.0148 29.7895 22.1079 29.1774 22.1233C27.8746 22.1562 26.5705 22.1452 25.2672 22.1268C24.8252 22.1206 24.4526 22.1231 24.3558 22.7287C24.3334 22.8691 24.1212 23.0466 23.9729 23.0776C23.5929 23.1573 23.191 23.123 22.8146 23.214C22.5465 23.2788 22.2475 23.4141 22.0646 23.6218C21.6917 24.0456 21.3264 24.3839 20.7352 24.2709C20.4335 24.2133 20.1246 24.1735 19.8188 24.1724C19.3696 24.1707 18.808 24.1336 18.7208 24.7458C18.6304 25.3814 18.3117 25.4629 17.8227 25.3901C17.7679 25.8002 17.7186 26.1691 17.6691 26.6254C17.6689 26.6838 17.6686 26.7421 17.5732 26.7986Z" fill="#F5F5F5"/>
      <path d="M6.24652 39.9129C6.54545 40.0357 6.83314 40.2693 7.15573 40.3603C7.81866 40.5473 8.49957 40.7766 9.17429 40.7811C14.3032 40.8157 19.4324 40.8001 24.5615 40.8001C29.401 40.8001 34.2406 40.7893 39.0801 40.8084C40.1751 40.8127 40.9054 40.136 41.5061 39.3307C41.7609 38.9892 41.7442 38.3631 41.7481 37.8654C41.7693 35.1787 41.7526 32.4916 41.7655 29.8048C41.767 29.4828 41.8921 29.1633 41.9157 28.8389C41.9338 28.5902 41.9129 28.3272 41.8552 28.0854C41.7457 27.6264 41.6159 27.1811 42.0844 26.8088C42.2105 27.1281 42.3692 27.4596 42.3566 27.7835C42.314 28.8838 42.157 29.9805 42.1416 31.0802C42.1069 33.5661 42.148 36.0532 42.1121 38.539C42.1067 38.9128 41.9017 39.317 41.7013 39.6454C41.4375 40.078 41.1196 40.4889 40.761 40.8321C40.5516 41.0324 40.2177 41.1839 39.9393 41.185C34.8115 41.2054 29.6836 41.2095 24.5558 41.1936C23.0723 41.189 21.5889 41.0737 20.1055 41.0767C18.3118 41.0804 16.5182 41.1941 14.7247 41.1905C12.4555 41.1859 10.1863 41.1164 7.91727 41.0635C7.16989 41.0461 6.70458 40.505 6.24652 39.9129Z" fill="#F9F9FA"/>
      <path d="M40.8875 19.5475C39.9999 19.497 39.1124 19.373 38.2214 19.2994C37.7796 19.263 37.3312 19.3313 36.8858 19.3315C28.4733 19.3339 20.0608 19.3351 11.6483 19.3276C11.2402 19.3273 10.832 19.2461 10.4241 19.1997C9.40719 19.0842 8.43452 19.3455 7.40997 19.5987C7.47444 19.4244 7.56638 19.1271 7.70895 19.0959C8.18846 18.9906 8.68596 18.9397 9.17664 18.9393C18.8087 18.9313 28.4408 18.9303 38.0729 18.9391C38.8325 18.9398 39.5945 18.9979 40.3496 19.0867C40.5401 19.1091 40.708 19.3529 40.8875 19.5475Z" fill="#F9F9FA"/>
      <path d="M5.62088 21.9292C5.7037 22.1047 5.85778 22.3424 5.85861 22.5807C5.87328 26.7659 5.86922 30.9511 5.86926 35.1363C5.86926 35.2913 5.81913 35.4739 5.87751 35.5971C6.4409 36.7859 5.88035 38.01 5.99313 39.2719C5.86893 38.9723 5.63845 38.6114 5.6369 38.2493C5.61378 32.8302 5.62086 27.4109 5.62088 21.9292Z" fill="#F9F9FA"/>
      <path d="M42.1305 26.071C41.9887 25.8138 41.7699 25.5065 41.7229 25.1714C41.6491 24.646 41.6709 24.101 41.6901 23.5658C41.7111 22.9788 41.6681 22.3493 41.8569 21.8226C41.9879 21.4571 41.9058 21.3325 41.7351 21.0988C41.4367 20.6902 41.17 20.255 40.8895 19.782C41.202 20.0914 41.4942 20.4746 41.8333 20.8019C42.2546 21.2086 42.168 21.6278 42.0912 22.1702C41.9852 22.9193 42.1125 23.7053 42.1287 24.4758C42.1394 24.9865 42.1307 25.4976 42.1305 26.071Z" fill="#F9F9FA"/>
      <path d="M5.95083 21.071C5.89719 21.1967 5.80136 21.3271 5.6633 21.4622C5.71693 21.3365 5.81278 21.2061 5.95083 21.071Z" fill="#F9F9FA"/>
      <path d="M17.6694 26.538C17.7186 26.1691 17.7679 25.8002 17.8226 25.3901C18.3117 25.4629 18.6303 25.3814 18.7208 24.7458C18.808 24.1336 19.3696 24.1708 19.8188 24.1724C20.1246 24.1735 20.4335 24.2133 20.7352 24.2709C21.3264 24.3839 21.6916 24.0457 22.0646 23.6218C22.2475 23.4141 22.5465 23.2788 22.8146 23.214C23.191 23.123 23.5929 23.1573 23.9729 23.0777C24.1212 23.0466 24.3334 22.8691 24.3558 22.7287C24.4525 22.1231 24.8252 22.1206 25.2672 22.1268C26.5705 22.1452 27.8746 22.1562 29.1774 22.1233C29.7895 22.1079 30.404 22.0148 31.0088 21.9033C31.6785 21.7798 31.9733 21.9762 31.9375 22.7005C31.9006 23.4451 31.7973 24.1874 31.6946 24.9262C31.6096 25.5377 31.9286 25.9542 32.348 26.1662C32.7558 26.3723 32.8697 26.6247 32.8143 27.0358C32.7233 27.7109 33.0378 28.0632 33.617 28.1097C34.1084 28.1492 34.1859 28.4494 34.1831 28.8667C34.1816 29.0889 34.1912 29.3114 34.1814 29.5331C34.1653 29.8973 34.2616 30.1229 34.6554 30.1421C35.1524 30.1662 35.3405 30.5231 35.2955 31.0081C35.2103 31.9263 35.0952 32.8414 34.9934 33.7578C33.9347 34.1025 33.9347 34.1025 33.9346 35.3449C33.9346 35.456 33.9351 35.567 33.9345 35.6781C33.9311 36.4023 33.8221 36.5041 33.186 36.3776C32.2046 36.1825 31.7818 36.5346 31.6927 37.5975C31.6792 37.7584 31.6023 38.0368 31.5264 38.0484C30.9894 38.131 30.8265 38.483 30.7641 39.0052C30.7489 39.1331 30.469 39.3177 30.3097 39.3189C27.7029 39.3384 25.0959 39.334 22.4889 39.3315C21.8381 39.3309 22.0497 38.71 21.8915 38.3554C21.7807 38.1071 21.7194 37.7064 21.5489 37.6428C21.2212 37.5205 20.8316 37.5052 20.612 38.0053C20.5426 38.1633 20.1981 38.2557 19.9812 38.2524C19.0551 38.2384 18.1284 38.195 17.205 38.1186C17.0174 38.103 16.7146 37.9274 16.6852 37.7761C16.5528 37.0968 16.1333 37.0067 15.6165 37.0742C15.3942 37.1032 15.1784 37.1913 14.9604 37.2555C14.3812 37.4262 14.1356 37.2054 14.1927 36.5627C14.1986 36.4967 14.2064 36.4304 14.2199 36.3659C14.4616 35.2131 14.4586 35.2072 13.4053 34.8555C13.4083 34.8153 13.4021 34.7456 13.4175 34.7395C14.4374 34.3388 14.4377 34.3392 14.4379 33.1257C14.438 31.5952 14.4379 30.0646 14.4379 28.4576C15.4706 28.418 15.6405 27.703 15.5531 26.8148C15.5081 26.3577 15.7238 26.3107 16.0929 26.245C16.7122 26.1349 17.1141 26.5151 17.6208 26.8566C17.6681 27.143 17.6678 27.3714 17.6195 27.6111C17.3866 28.0357 17.2192 28.4472 17.6682 28.863C17.5781 30.1646 17.8759 31.4289 17.4368 32.6499C17.3627 32.8558 17.3746 33.1656 17.4682 33.36C17.7507 33.9463 18.093 34.4995 18.4164 35.1134C18.5834 35.3742 18.7276 35.6081 18.9121 35.7962C19.5104 36.4058 20.5022 36.2227 21.0448 37.0095C21.1206 37.1193 21.5666 36.9679 21.8282 36.888C22.1186 36.7993 22.3947 36.5487 22.6761 36.5504C24.5504 36.5621 26.4245 36.6189 28.2985 36.6721C28.4998 36.6778 28.7062 36.8109 28.8982 36.7843C29.1906 36.7438 29.6169 36.7022 29.7212 36.5019C29.8442 36.2657 29.712 35.8525 29.6365 35.5306C29.5964 35.3595 29.4421 35.2194 29.3892 35.0633C29.9367 34.8915 29.621 34.4423 29.7574 34.1266C30.0613 33.6531 30.4416 33.2185 30.5589 32.7135C30.7706 31.8025 30.8744 30.8528 30.9311 29.9128C30.9884 28.963 31.0203 27.9922 30.8966 27.056C30.8207 26.4813 30.1997 26.0148 30.5606 25.3043C30.5873 25.2518 30.3933 25.0484 30.2803 24.9415C30.144 24.8125 29.9944 24.6908 29.833 24.6033C29.5517 24.4507 29.257 24.3267 28.9679 24.1907C28.9772 24.2699 28.9866 24.3491 28.9959 24.4283C28.8615 24.6424 28.7271 24.8565 28.5347 25.07C26.1179 25.0691 23.759 25.0553 21.4004 25.0781C20.827 25.0837 20.2552 25.2607 19.6815 25.2686C18.7671 25.2812 18.1449 25.7587 17.6694 26.538Z" fill="#F2F2F3"/>
      <path d="M17.6693 26.5817C18.1449 25.7587 18.7671 25.2812 19.6815 25.2686C20.2552 25.2607 20.827 25.0837 21.4005 25.0781C23.759 25.0553 26.1179 25.0691 28.5432 25.1169C29.2242 25.493 29.8507 25.8344 29.9934 26.6417C30.0792 27.1274 30.0571 27.6351 30.0835 28.1861C30.0829 28.3815 30.0824 28.5236 30.0466 28.6999C29.9528 29.0778 29.8559 29.4198 29.8426 29.7654C29.7865 31.221 29.7555 32.6776 29.7153 34.1338C29.621 34.4422 29.9368 34.8915 29.3397 35.0643C28.951 35.1559 28.6587 35.3308 28.3727 35.3197C25.0533 35.1906 21.7206 35.6509 18.4121 35.0655C18.0931 34.4994 17.7507 33.9463 17.4682 33.36C17.3746 33.1656 17.3627 32.8558 17.4368 32.6499C17.876 31.4289 17.5781 30.1646 17.6683 28.8029C17.6679 28.3202 17.6677 27.96 17.6675 27.5997C17.6678 27.3713 17.6681 27.143 17.6684 26.8575C17.6686 26.7421 17.6689 26.6838 17.6693 26.5817ZM18.2779 26.5241C18.2808 28.9274 18.2837 31.3308 18.2843 33.8443C18.2506 34.3356 18.3599 34.7355 18.8855 34.8164C19.4951 34.9102 20.107 35.0441 20.719 35.0513C23.089 35.0793 25.4594 35.0646 27.8297 35.0643C28.9954 35.0641 29.4604 34.5702 29.4659 33.3305C29.4675 32.9765 29.4664 32.6224 29.4678 32.1431C29.4695 30.5244 29.4363 28.9044 29.4883 27.2876C29.5129 26.5208 29.1304 26.1681 28.5347 25.7893C28.32 25.728 28.1056 25.6145 27.8906 25.6134C25.1419 25.5997 22.3931 25.5977 19.6444 25.611C19.4773 25.6118 19.3109 25.7665 19.0679 25.8603C19.0169 25.8652 18.9658 25.8701 18.8198 25.8668C18.6413 26.0443 18.4629 26.2217 18.2779 26.5241Z" fill="#E3E2E2"/>
      <path d="M18.4164 35.1135C21.7206 35.6509 25.0533 35.1906 28.3727 35.3197C28.6587 35.3308 28.951 35.1559 29.2899 35.0664C29.4422 35.2194 29.5964 35.3596 29.6366 35.5306C29.7121 35.8525 29.8442 36.2657 29.7212 36.502C29.617 36.7023 29.1906 36.7439 28.8983 36.7843C28.7063 36.8109 28.4998 36.6778 28.2985 36.6721C26.4246 36.619 24.5504 36.5621 22.6761 36.5505C22.3947 36.5487 22.1187 36.7994 21.8282 36.8881C21.5666 36.9679 21.1206 37.1193 21.0448 37.0095C20.5022 36.2228 19.5104 36.4058 18.9122 35.7962C18.7276 35.6081 18.5835 35.3743 18.4164 35.1135Z" fill="#EFEFF1"/>
      <path d="M30.0835 28.1328C30.0571 27.635 30.0792 27.1274 29.9934 26.6417C29.8507 25.8343 29.2242 25.493 28.6012 25.1175C28.7272 24.8565 28.8615 24.6424 28.9959 24.4283C28.9866 24.3491 28.9773 24.2699 28.9679 24.1907C29.257 24.3267 29.5518 24.4507 29.8331 24.6032C29.9944 24.6908 30.144 24.8125 30.2803 24.9415C30.3933 25.0484 30.5873 25.2518 30.5607 25.3043C30.1997 26.0148 30.8207 26.4812 30.8966 27.056C31.0203 27.9922 30.9885 28.963 30.9311 29.9128C30.8744 30.8527 30.7706 31.8024 30.559 32.7134C30.4416 33.2185 30.0613 33.6531 29.7574 34.1266C29.7555 32.6776 29.7865 31.2209 29.8426 29.7654C29.8559 29.4198 29.9528 29.0778 30.0943 28.6989C30.2669 28.559 30.3566 28.4543 30.4462 28.3497C30.3253 28.2774 30.2044 28.2051 30.0835 28.1328Z" fill="#EFEFF1"/>
      <path d="M17.6195 27.6111C17.6677 27.9599 17.6679 28.3201 17.668 28.7404C17.2192 28.4471 17.3867 28.0356 17.6195 27.6111Z" fill="#F5F5F5"/>
      <path d="M29.4665 32.2683C29.4664 32.6224 29.4674 32.9764 29.4659 33.3305C29.4604 34.5702 28.9954 35.064 27.8297 35.0642C25.4594 35.0645 23.089 35.0793 20.719 35.0513C20.107 35.044 19.495 34.9101 18.8855 34.8163C18.3599 34.7354 18.2506 34.3355 18.3291 33.7978C18.6331 34.0694 18.6952 34.6515 19.3346 34.5333C19.7665 34.5344 20.1446 34.5351 20.581 34.5355C21.6763 34.5355 22.7135 34.5357 23.7624 34.5884C24.5309 34.6663 25.2875 34.6932 26.0443 34.7093C26.0661 34.7097 26.0899 34.5954 26.1496 34.5319C26.2446 34.4868 26.3028 34.4444 26.4113 34.4014C26.7039 34.3175 27.1543 34.2348 27.1546 34.1507C27.156 33.6042 27.5727 33.4697 27.8971 33.2067C28.1223 33.2799 28.3023 33.3454 28.4824 33.4109C28.5206 33.2251 28.5909 33.0396 28.5922 32.8535C28.6056 30.877 28.608 28.9004 28.6535 26.9258C28.7472 26.9291 28.8007 26.9306 28.8532 26.9944C28.8574 27.7198 28.8627 28.3827 28.8613 29.1044C28.9112 30.4821 28.9679 31.801 29.029 33.2264C29.2116 32.8265 29.3391 32.5474 29.4665 32.2683Z" fill="#C5C3C5"/>
      <path d="M19.1441 25.8496C19.3109 25.7665 19.4773 25.6119 19.6443 25.6111C22.3931 25.5977 25.1419 25.5997 27.8906 25.6135C28.1056 25.6145 28.32 25.7281 28.5383 25.8672C28.4718 26.1045 28.4017 26.264 28.2751 26.4183C25.4436 26.4051 22.6686 26.3971 19.9065 26.3396C20.1798 26.2036 20.4403 26.117 20.7008 26.0303C20.6964 25.9701 20.692 25.9098 20.6877 25.8496C20.1732 25.8496 19.6587 25.8496 19.1441 25.8496Z" fill="#C4BBB6"/>
      <path d="M28.3316 26.4235C28.4017 26.2641 28.4718 26.1046 28.5675 25.908C29.1304 26.1682 29.5129 26.5209 29.4882 27.2877C29.4362 28.9045 29.4695 30.5245 29.4671 32.2058C29.339 32.5476 29.2116 32.8267 29.029 33.2266C28.9678 31.8011 28.9112 30.4822 28.9098 29.1081C29.0338 29.0166 29.1619 28.9816 29.1625 28.9442C29.1743 28.207 29.1713 27.4694 29.1713 26.6369C29.0029 26.7938 28.9286 26.863 28.8543 26.9322C28.8007 26.9308 28.7472 26.9293 28.6442 26.8851C28.5203 26.7757 28.4458 26.7091 28.3635 26.6063C28.3477 26.5213 28.3397 26.4724 28.3316 26.4235Z" fill="#B4B1B2"/>
      <path d="M19.106 25.855C19.6586 25.8496 20.1732 25.8496 20.6877 25.8496C20.692 25.9099 20.6964 25.9701 20.7007 26.0304C20.4403 26.117 20.1798 26.2037 19.8666 26.3417C19.7607 26.3969 19.7075 26.4007 19.603 26.4006C19.1846 26.3464 18.9521 26.4923 18.9077 26.9087C18.8681 27.2801 18.8003 27.6514 18.7972 28.0233C18.7833 29.7045 18.7879 31.3859 18.7366 33.0549C18.6367 32.8212 18.5439 32.6003 18.5424 32.3786C18.5289 30.385 18.5314 28.3914 18.539 26.3537C18.6707 26.1648 18.7927 26.0199 18.9147 25.8751C18.9658 25.8702 19.0168 25.8652 19.106 25.855Z" fill="#A09995"/>
      <path d="M18.5293 26.3977C18.5314 28.3914 18.5289 30.385 18.5424 32.3786C18.5439 32.6003 18.6368 32.8212 18.7702 33.0864C18.9546 33.4199 19.056 33.7095 19.1612 34.0452C19.2036 34.2386 19.2422 34.3858 19.2808 34.5331C18.6952 34.6516 18.6331 34.0695 18.3302 33.7428C18.2837 31.3308 18.2808 28.9275 18.322 26.4617C18.4205 26.3987 18.4749 26.3982 18.5293 26.3977Z" fill="#B4B1B2"/>
      <path d="M30.0835 28.186C30.2044 28.205 30.3253 28.2773 30.4462 28.3496C30.3566 28.4543 30.2669 28.5589 30.1296 28.6646C30.0824 28.5235 30.0829 28.3814 30.0835 28.186Z" fill="#F2F2F3"/>
      <path d="M18.539 26.3535C18.4749 26.3981 18.4205 26.3986 18.3253 26.3991C18.4629 26.2216 18.6413 26.0442 18.8672 25.8708C18.7927 26.0198 18.6707 26.1646 18.539 26.3535Z" fill="#C4BBB6"/>
      <path d="M26.3609 34.4019C26.3028 34.4444 26.2446 34.4868 26.0923 34.5313C25.5182 34.4927 25.0387 34.4303 24.5583 34.4198C24.2899 34.4139 24.0199 34.4943 23.7506 34.5359C22.7135 34.5357 21.6763 34.5354 20.581 34.4826C20.5844 33.9733 20.3757 33.6776 20.0298 33.4193C20.1984 33.0467 20.362 32.7216 20.5805 32.3965C21.0521 32.3089 21.4689 32.2212 21.8884 32.1281C21.8911 32.1227 21.9026 32.1221 21.9085 32.1748C22.5463 32.5752 22.9207 32.4718 23.251 31.8629C23.2546 31.8665 23.2484 31.8584 23.2938 31.8562C23.9591 31.5932 24.0709 30.9187 24.3708 30.3979C24.3725 30.3999 24.3689 30.3962 24.4175 30.3916C24.7688 30.266 25.0713 30.1449 25.4006 30.0197C25.4274 30.0156 25.4815 30.0149 25.4955 30.0418C25.5333 30.1024 25.5634 30.1272 25.6027 30.1853C25.6096 30.2835 25.6135 30.3396 25.6212 30.4391C25.7047 30.5434 25.7843 30.6044 25.8634 30.666C25.8627 30.6666 25.8639 30.6653 25.8638 30.7133C25.9512 30.8584 26.0386 30.9554 26.1642 31.0603C26.2614 31.1495 26.3204 31.2309 26.3774 31.3577C26.4553 31.4666 26.5352 31.53 26.6204 31.626C26.6256 31.6584 26.6292 31.7242 26.5879 31.7454C26.3784 32.1798 25.9661 32.8021 26.0883 32.9667C26.4428 33.4439 26.3148 33.9209 26.3609 34.4019Z" fill="#B4B1B2"/>
      <path d="M26.6293 31.7244C26.6293 31.7244 26.6257 31.6586 26.6147 31.5845C26.529 31.4445 26.4542 31.3785 26.3794 31.3125C26.3205 31.231 26.2615 31.1496 26.1602 31.0147C26.0333 30.8626 25.9486 30.764 25.8639 30.6655C25.8639 30.6655 25.8628 30.6667 25.8639 30.6211C25.8667 30.5154 25.8683 30.4553 25.9147 30.4012C26.552 31.0402 27.1404 31.6777 27.7405 32.3024C27.87 32.4373 28.0414 32.5259 28.1936 32.6359C28.245 32.46 28.3401 32.2844 28.341 32.1082C28.3498 30.2963 28.3434 28.4843 28.3486 26.6648C28.356 26.6571 28.3713 26.6423 28.3713 26.6423C28.4458 26.709 28.5203 26.7757 28.6041 26.8831C28.608 28.9005 28.6056 30.8771 28.5922 32.8536C28.5909 33.0397 28.5206 33.2252 28.4824 33.411C28.3023 33.3455 28.1223 33.28 27.8939 33.1673C27.8071 33.0568 27.7687 32.9934 27.7248 32.8876C27.6417 32.7812 27.5641 32.7172 27.4794 32.6091C27.1913 32.2848 26.9103 32.0046 26.6293 31.7244Z" fill="#E3E2E2"/>
      <path d="M27.7302 32.9302C27.7687 32.9935 27.8071 33.0568 27.8487 33.1597C27.5727 33.4698 27.156 33.6043 27.1545 34.1509C27.1543 34.235 26.7038 34.3177 26.4113 34.4016C26.3148 33.9211 26.4428 33.4441 26.0883 32.9669C25.9661 32.8023 26.3784 32.18 26.5879 31.7456C26.9103 32.0046 27.1913 32.2849 27.4808 32.654C27.5696 32.8054 27.6499 32.8678 27.7302 32.9302Z" fill="#B8B8B8"/>
      <path d="M20.0249 33.4668C20.3758 33.6777 20.5844 33.9734 20.5228 34.483C20.1446 34.5352 19.7665 34.5345 19.3346 34.5334C19.2422 34.3858 19.2036 34.2385 19.2074 34.0452C19.5082 33.8216 19.7666 33.6442 20.0249 33.4668Z" fill="#B8B8B8"/>
      <path d="M28.8532 26.9944C28.9286 26.8628 29.0029 26.7936 29.1713 26.6367C29.1713 27.4692 29.1743 28.2067 29.1625 28.944C29.1619 28.9814 29.0338 29.0164 28.9165 29.049C28.8627 28.3826 28.8574 27.7197 28.8532 26.9944Z" fill="#A09995"/>
      <path d="M23.7624 34.5885C24.0199 34.4945 24.29 34.4141 24.5583 34.42C25.0388 34.4305 25.5182 34.4929 26.0554 34.5342C26.0899 34.5956 26.0661 34.7099 26.0444 34.7094C25.2875 34.6933 24.5309 34.6664 23.7624 34.5885Z" fill="#B8B8B8"/>
      <path d="M19.6543 26.4044C19.7075 26.4007 19.7607 26.3969 19.8538 26.3911C22.6686 26.3971 25.4436 26.4052 28.2751 26.4184C28.3397 26.4724 28.3477 26.5213 28.3635 26.6063C28.3713 26.6424 28.356 26.6572 28.291 26.664C25.6165 26.6719 23.007 26.6729 20.3424 26.672C20.0495 26.6821 19.8117 26.6941 19.4905 26.7103C19.4905 28.7209 19.4905 30.6567 19.4905 32.5303C20.0069 32.0819 20.4881 31.5903 21.0407 31.2226C21.2451 31.0866 21.6233 31.2116 21.9119 31.2736C22.1676 31.3285 22.4499 31.5971 22.6473 31.5285C22.9729 31.4154 23.4069 31.2368 23.301 30.6608C23.8152 30.3521 24.2871 30.0507 24.7484 29.7918C24.6148 30.0216 24.4918 30.209 24.3689 30.3964C24.3689 30.3964 24.3725 30.4001 24.326 30.4029C23.6147 30.6273 23.5684 31.3549 23.2484 31.8586C23.2484 31.8586 23.2546 31.8667 23.2019 31.8635C22.7337 31.9476 22.3182 32.0349 21.9026 32.1223C21.9026 32.1223 21.8911 32.1229 21.8808 32.0812C21.4364 31.3759 21.0245 31.2966 20.6683 31.8245C20.5532 31.995 20.491 32.2066 20.361 32.4046C20.1896 32.6019 20.0851 32.8205 19.928 32.9791C19.749 33.16 19.5232 33.2874 19.3178 33.438C19.2623 33.2197 19.1603 33.0017 19.1588 32.7829C19.1459 31.0122 19.1712 29.241 19.1397 27.4708C19.1308 26.9739 19.241 26.6263 19.6543 26.4044Z" fill="#E3E2E2"/>
      <path d="M19.603 26.4005C19.241 26.6261 19.1308 26.9737 19.1397 27.4706C19.1712 29.2408 19.1459 31.0121 19.1587 32.7828C19.1603 33.0015 19.2623 33.2195 19.3177 33.4378C19.5232 33.2872 19.749 33.1598 19.928 32.979C20.0851 32.8203 20.1896 32.6018 20.3912 32.4021C20.4649 32.3945 20.5256 32.3965 20.5256 32.3965C20.362 32.7216 20.1983 33.0467 20.0298 33.4193C19.7666 33.6441 19.5082 33.8215 19.2036 33.999C19.056 33.7094 18.9546 33.4198 18.8195 33.0987C18.7879 31.3858 18.7833 29.7044 18.7972 28.0231C18.8003 27.6513 18.8681 27.28 18.9077 26.9086C18.9521 26.4921 19.1846 26.3463 19.603 26.4005Z" fill="#C5C3C5"/>
      <path d="M24.759 29.7492C24.2871 30.0507 23.8152 30.3521 23.2633 30.6549C23.099 30.0527 22.7618 29.7272 22.3375 29.7739C21.8277 29.83 21.313 29.8496 20.8004 29.8495C20.7119 29.8495 20.6235 29.6727 20.5913 29.5816C21.0766 29.5857 21.5163 29.646 21.93 29.5609C22.1425 29.5173 22.4201 29.244 22.4713 29.022C22.5602 28.6371 22.496 28.2115 22.496 27.9386C22.1237 27.742 21.8735 27.6099 21.6666 27.4686C21.8335 27.032 21.7926 26.993 21.3817 26.9272C21.0493 26.8739 20.7253 26.7606 20.3976 26.6738C23.007 26.6728 25.6165 26.6718 28.2836 26.6716C28.3434 28.4844 28.3498 30.2963 28.341 32.1082C28.3401 32.2844 28.245 32.46 28.1936 32.6359C28.0414 32.5259 27.87 32.4373 27.7404 32.3024C27.1404 31.6777 26.552 31.0402 25.913 30.4011C25.8666 30.3948 25.8673 30.3922 25.8607 30.3492C25.7693 30.2519 25.6846 30.1977 25.5998 30.1434C25.5634 30.1274 25.5333 30.1026 25.4938 29.9962C25.3939 29.8657 25.3097 29.808 25.1787 29.7489C25.0076 29.7482 24.8833 29.7487 24.759 29.7492Z" fill="#F2F3F7"/>
      <path d="M20.5805 32.3966C20.5256 32.3966 20.465 32.3945 20.4348 32.3969C20.491 32.2065 20.5533 31.995 20.6683 31.8244C21.0245 31.2966 21.4364 31.3758 21.8781 32.0866C21.4689 32.2214 21.0522 32.3091 20.5805 32.3966Z" fill="#A09995"/>
      <path d="M23.2938 31.8563C23.5684 31.3548 23.6147 30.6272 24.3243 30.4009C24.0709 30.9189 23.9591 31.5933 23.2938 31.8563Z" fill="#C5C3C5"/>
      <path d="M21.9085 32.1748C22.3181 32.0347 22.7337 31.9474 23.1983 31.8596C22.9207 32.4718 22.5463 32.5752 21.9085 32.1748Z" fill="#C5C3C5"/>
      <path d="M24.7484 29.7916C24.8833 29.7486 25.0075 29.7481 25.1866 29.7886C25.2855 29.8943 25.3297 29.9592 25.3738 30.024C25.0713 30.145 24.7688 30.2661 24.4175 30.3917C24.4918 30.2089 24.6148 30.0215 24.7484 29.7916Z" fill="#C5C3C5"/>
      <path d="M25.8638 30.7134C25.9485 30.764 26.0332 30.8625 26.122 31.0068C26.0386 30.9555 25.9511 30.8584 25.8638 30.7134Z" fill="#C5C3C5"/>
      <path d="M26.3774 31.3579C26.4542 31.3785 26.529 31.4445 26.6094 31.5521C26.5352 31.5302 26.4553 31.4668 26.3774 31.3579Z" fill="#C5C3C5"/>
      <path d="M25.4006 30.0198C25.3297 29.9591 25.2855 29.8943 25.2334 29.7898C25.3097 29.8078 25.3939 29.8656 25.4798 29.9692C25.4815 30.015 25.4274 30.0156 25.4006 30.0198Z" fill="#E3E2E2"/>
      <path d="M25.8683 30.3949C25.8683 30.4552 25.8667 30.5153 25.8645 30.6204C25.7843 30.6044 25.7047 30.5434 25.6628 30.439C25.7562 30.3945 25.8117 30.3933 25.8673 30.3921C25.8673 30.3921 25.8666 30.3947 25.8683 30.3949Z" fill="#C5C3C5"/>
      <path d="M25.8607 30.349C25.8117 30.3933 25.7562 30.3945 25.659 30.3957C25.6135 30.3396 25.6096 30.2835 25.6028 30.1853C25.6846 30.1975 25.7693 30.2518 25.8607 30.349Z" fill="#E3E2E2"/>
      <path d="M27.7248 32.8875C27.65 32.8676 27.5697 32.8052 27.4879 32.698C27.5641 32.7171 27.6417 32.7811 27.7248 32.8875Z" fill="#C5C3C5"/>
      <path d="M20.3424 26.6719C20.7253 26.7605 21.0493 26.8739 21.3817 26.9271C21.7926 26.993 21.8335 27.0319 21.6168 27.4687C20.3618 27.5594 20.2637 27.669 20.2886 28.8588C20.29 28.9249 20.2926 28.9909 20.2613 29.0808C20.3277 29.2251 20.4274 29.3456 20.5297 29.4938C20.5323 29.5217 20.535 29.5775 20.535 29.5775C20.6235 29.6726 20.7119 29.8494 20.8004 29.8494C21.313 29.8495 21.8277 29.8299 22.3375 29.7738C22.7618 29.7271 23.099 30.0527 23.2211 30.662C23.4069 31.2367 22.9729 31.4153 22.6473 31.5284C22.4499 31.597 22.1676 31.3284 21.9119 31.2734C21.6233 31.2115 21.2451 31.0865 21.0408 31.2225C20.4881 31.5902 20.0069 32.0818 19.4905 32.5302C19.4905 30.6566 19.4905 28.7208 19.4905 26.7102C19.8118 26.694 20.0495 26.682 20.3424 26.6719Z" fill="#F7F9FB"/>
      <path d="M20.5913 29.5814C20.535 29.5774 20.5323 29.5216 20.5271 29.4512C20.4461 29.2728 20.3704 29.1648 20.2946 29.0568C20.2926 28.9908 20.29 28.9248 20.2886 28.8587C20.2637 27.6689 20.3618 27.5593 21.5735 27.4778C21.8735 27.6097 22.1237 27.7418 22.496 27.9385C22.496 28.2113 22.5602 28.637 22.4713 29.0219C22.4201 29.2438 22.1425 29.5171 21.93 29.5608C21.5163 29.6458 21.0766 29.5855 20.5913 29.5814ZM21.8922 28.593C21.939 28.186 21.8029 27.9222 21.3915 28.0025C21.1738 28.045 20.848 28.1632 20.8016 28.3239C20.7429 28.5274 20.9004 29.0096 20.9967 29.0197C21.3014 29.0518 21.7655 29.3506 21.8922 28.593Z" fill="#C7CBD0"/>
      <path d="M20.2613 29.0808C20.3704 29.1649 20.4461 29.2728 20.5244 29.4234C20.4273 29.3456 20.3277 29.2251 20.2613 29.0808Z" fill="#F2F3F7"/>
      <path d="M21.8901 28.6521C21.7655 29.3507 21.3014 29.0518 20.9967 29.0198C20.9004 29.0097 20.7428 28.5275 20.8016 28.324C20.848 28.1633 21.1737 28.0451 21.3914 28.0026C21.8029 27.9222 21.939 28.1861 21.8901 28.6521Z" fill="#7E828A"/>
      </g>
      <defs>
      <clipPath id="clip0_83_37">
      <rect width="38" height="24" fill="white" transform="translate(5 18)"/>
      </clipPath>
      </defs>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="8" y="6" width="33" height="6" fill="#E0E0E0"/>
      <rect x="13" y="20" width="30" height="3" fill="#E0E0E0"/>
      <rect x="13" y="27" width="30" height="3" fill="#E0E0E0"/>
      <rect x="13" y="34" width="30" height="3" fill="#E0E0E0"/>
      <circle cx="8.5" cy="35.5" r="1.5" fill="#D9D9D9"/>
      <circle cx="8.5" cy="21.5" r="1.5" fill="#D9D9D9"/>
      <path d="M10 28.5C10 29.3284 9.32843 30 8.5 30C7.67157 30 7 29.3284 7 28.5C7 27.6716 7.67157 27 8.5 27C9.32843 27 10 27.6716 10 28.5Z" fill="#D9D9D9"/>
      <g clip-path="url(#clip0_83_193)">
      <path d="M85.1304 25.1337C85.1304 25.3187 85.1304 25.5038 85.0845 25.7532C84.6158 26.181 84.7456 26.6264 84.8552 27.0854C84.9128 27.3271 84.9338 27.5901 84.9157 27.8388C84.8921 28.1632 84.767 28.4827 84.7654 28.8047C84.7526 31.4916 84.7693 34.1786 84.7481 36.8653C84.7442 37.363 84.7609 37.9891 84.5061 38.3307C83.9054 39.1359 83.1751 39.8126 82.08 39.8083C77.2406 39.7892 72.401 39.8 67.5614 39.8C62.4323 39.8 57.3032 39.8156 52.1743 39.7811C51.4996 39.7765 50.8186 39.5472 50.1557 39.3602C49.8331 39.2692 49.5454 39.0356 49.2419 38.8665C49.1752 38.7134 49.1084 38.5602 49.0175 38.3085C48.8803 37.0099 49.4409 35.7859 48.8775 34.597C48.8191 34.4738 48.8693 34.2913 48.8693 34.1363C48.8692 29.951 48.8733 25.7658 48.8586 21.5806C48.8578 21.3423 48.7037 21.1046 48.6209 20.8667C48.6209 20.7667 48.6209 20.6668 48.6632 20.5122C48.8013 20.3271 48.8972 20.1967 48.993 20.0664C49.2052 19.3645 49.5839 18.831 50.3659 18.6036C51.4345 18.3455 52.4072 18.0842 53.424 18.1998C53.832 18.2461 54.2402 18.3273 54.6483 18.3277C63.0608 18.3352 71.4733 18.334 79.8857 18.3315C80.3312 18.3314 80.7796 18.263 81.2214 18.2995C82.1124 18.3731 82.9998 18.497 83.8887 18.6002C83.8887 18.6002 83.8889 18.6667 83.8894 18.7489C84.17 19.2552 84.4367 19.6904 84.7351 20.099C84.9058 20.3327 84.9879 20.4573 84.8568 20.8228C84.668 21.3495 84.711 21.9789 84.69 22.566C84.6709 23.1011 84.6491 23.6462 84.7228 24.1716C84.7698 24.5066 84.9886 24.8139 85.1304 25.1337ZM60.5732 25.7986C60.1141 25.515 59.7122 25.1349 59.0929 25.245C58.7238 25.3107 58.5081 25.3576 58.5531 25.8148C58.6405 26.703 58.4706 27.418 57.4379 27.4576C57.4379 29.0646 57.438 30.5952 57.4379 32.1257C57.4377 33.3392 57.4374 33.3388 56.4175 33.7395C56.4021 33.7455 56.4084 33.8153 56.4061 33.8555C57.4586 34.2072 57.4616 34.2131 57.2199 35.3659C57.2064 35.4304 57.1986 35.4967 57.1927 35.5626C57.1356 36.2054 57.3812 36.4261 57.9604 36.2555C58.1784 36.1913 58.3942 36.1032 58.6165 36.0741C59.1333 36.0067 59.5528 36.0968 59.6852 36.7761C59.7146 36.9274 60.0174 37.103 60.2051 37.1185C61.1284 37.1949 62.0551 37.2383 62.9812 37.2524C63.1981 37.2557 63.5426 37.1632 63.612 37.0053C63.8316 36.5052 64.2212 36.5205 64.5489 36.6427C64.7194 36.7064 64.7807 37.1071 64.8915 37.3554C65.0497 37.71 64.8381 38.3308 65.4889 38.3315C68.0959 38.334 70.7029 38.3383 73.3097 38.3188C73.469 38.3177 73.7489 38.1331 73.7642 38.0052C73.8265 37.483 73.9894 37.131 74.5264 37.0484C74.6023 37.0368 74.6792 36.7584 74.6927 36.5974C74.7818 35.5346 75.2046 35.1825 76.186 35.3776C76.8221 35.504 76.9311 35.4022 76.9346 34.6781C76.9351 34.567 76.9346 34.4559 76.9346 34.3449C76.9347 33.1025 76.9347 33.1025 77.9926 32.7577C78.0953 31.8413 78.2103 30.9263 78.2955 30.0081C78.3405 29.5231 78.1524 29.1662 77.6554 29.1421C77.2616 29.1229 77.1653 28.8973 77.1814 28.5331C77.1912 28.3114 77.1816 28.0889 77.1831 27.8667C77.1859 27.4494 77.1084 27.1492 76.617 27.1097C76.0378 27.0632 75.7233 26.7109 75.8143 26.0358C75.8698 25.6247 75.7559 25.3723 75.348 25.1662C74.9286 24.9542 74.6096 24.5377 74.6946 23.9262C74.7973 23.1874 74.9007 22.445 74.9375 21.7005C74.9733 20.9761 74.6785 20.7798 74.0089 20.9033C73.404 21.0148 72.7895 21.1079 72.1774 21.1233C70.8746 21.1562 69.5705 21.1452 68.2672 21.1268C67.8252 21.1206 67.4526 21.1231 67.3558 21.7287C67.3334 21.8691 67.1212 22.0466 66.9729 22.0776C66.5929 22.1573 66.191 22.123 65.8146 22.214C65.5465 22.2788 65.2475 22.4141 65.0646 22.6218C64.6917 23.0456 64.3264 23.3839 63.7352 23.2709C63.4335 23.2133 63.1246 23.1735 62.8188 23.1724C62.3696 23.1707 61.808 23.1336 61.7208 23.7458C61.6304 24.3814 61.3117 24.4629 60.8227 24.3901C60.7679 24.8002 60.7186 25.1691 60.6691 25.6254C60.6689 25.6838 60.6686 25.7421 60.5732 25.7986Z" fill="#F5F5F5"/>
      <path d="M49.2465 38.9129C49.5455 39.0357 49.8331 39.2693 50.1557 39.3603C50.8187 39.5473 51.4996 39.7766 52.1743 39.7811C57.3032 39.8157 62.4324 39.8001 67.5615 39.8001C72.401 39.8001 77.2406 39.7893 82.0801 39.8084C83.1751 39.8127 83.9054 39.136 84.5061 38.3307C84.7609 37.9892 84.7442 37.3631 84.7481 36.8654C84.7693 34.1787 84.7526 31.4916 84.7655 28.8048C84.767 28.4828 84.8921 28.1633 84.9157 27.8389C84.9338 27.5902 84.9129 27.3272 84.8552 27.0854C84.7457 26.6264 84.6159 26.1811 85.0844 25.8088C85.2105 26.1281 85.3692 26.4596 85.3566 26.7835C85.314 27.8838 85.157 28.9805 85.1416 30.0802C85.1069 32.5661 85.148 35.0532 85.1121 37.539C85.1067 37.9128 84.9017 38.317 84.7013 38.6454C84.4375 39.078 84.1196 39.4889 83.761 39.8321C83.5516 40.0324 83.2177 40.1839 82.9393 40.185C77.8115 40.2054 72.6836 40.2095 67.5558 40.1936C66.0723 40.189 64.5889 40.0737 63.1055 40.0767C61.3118 40.0804 59.5182 40.1941 57.7247 40.1905C55.4555 40.1859 53.1863 40.1164 50.9173 40.0635C50.1699 40.0461 49.7046 39.505 49.2465 38.9129Z" fill="#F9F9FA"/>
      <path d="M83.8875 18.5475C82.9999 18.497 82.1124 18.373 81.2214 18.2994C80.7796 18.263 80.3312 18.3313 79.8858 18.3315C71.4733 18.3339 63.0608 18.3351 54.6483 18.3276C54.2402 18.3273 53.832 18.2461 53.4241 18.1997C52.4072 18.0842 51.4345 18.3455 50.41 18.5987C50.4744 18.4244 50.5664 18.1271 50.7089 18.0959C51.1885 17.9906 51.686 17.9397 52.1766 17.9393C61.8087 17.9313 71.4408 17.9303 81.0729 17.9391C81.8325 17.9398 82.5945 17.9979 83.3496 18.0867C83.5401 18.1091 83.708 18.3529 83.8875 18.5475Z" fill="#F9F9FA"/>
      <path d="M48.6209 20.9292C48.7037 21.1047 48.8578 21.3424 48.8586 21.5807C48.8733 25.7659 48.8692 29.9511 48.8693 34.1363C48.8693 34.2913 48.8191 34.4739 48.8775 34.5971C49.4409 35.7859 48.8803 37.01 48.9931 38.2719C48.8689 37.9723 48.6384 37.6114 48.6369 37.2493C48.6138 31.8302 48.6209 26.4109 48.6209 20.9292Z" fill="#F9F9FA"/>
      <path d="M85.1305 25.071C84.9887 24.8138 84.7699 24.5065 84.7229 24.1714C84.6491 23.646 84.6709 23.101 84.6901 22.5658C84.7111 21.9788 84.6681 21.3493 84.8569 20.8226C84.9879 20.4571 84.9058 20.3325 84.7351 20.0988C84.4367 19.6902 84.17 19.255 83.8895 18.782C84.202 19.0914 84.4942 19.4746 84.8333 19.8019C85.2546 20.2086 85.168 20.6278 85.0912 21.1702C84.9852 21.9193 85.1125 22.7053 85.1287 23.4758C85.1394 23.9865 85.1307 24.4976 85.1305 25.071Z" fill="#F9F9FA"/>
      <path d="M48.9508 20.071C48.8972 20.1967 48.8014 20.3271 48.6633 20.4622C48.7169 20.3365 48.8128 20.2061 48.9508 20.071Z" fill="#F9F9FA"/>
      <path d="M60.6694 25.538C60.7186 25.1691 60.7679 24.8002 60.8226 24.3901C61.3117 24.4629 61.6303 24.3814 61.7208 23.7458C61.808 23.1336 62.3696 23.1708 62.8188 23.1724C63.1246 23.1735 63.4335 23.2133 63.7352 23.2709C64.3264 23.3839 64.6916 23.0457 65.0646 22.6218C65.2475 22.4141 65.5465 22.2788 65.8146 22.214C66.191 22.123 66.5929 22.1573 66.9729 22.0777C67.1212 22.0466 67.3334 21.8691 67.3558 21.7287C67.4525 21.1231 67.8252 21.1206 68.2672 21.1268C69.5705 21.1452 70.8746 21.1562 72.1774 21.1233C72.7895 21.1079 73.404 21.0148 74.0088 20.9033C74.6785 20.7798 74.9733 20.9762 74.9375 21.7005C74.9006 22.4451 74.7973 23.1874 74.6946 23.9262C74.6096 24.5377 74.9286 24.9542 75.348 25.1662C75.7558 25.3723 75.8697 25.6247 75.8143 26.0358C75.7233 26.7109 76.0378 27.0632 76.617 27.1097C77.1084 27.1492 77.1859 27.4494 77.1831 27.8667C77.1816 28.0889 77.1912 28.3114 77.1814 28.5331C77.1653 28.8973 77.2616 29.1229 77.6554 29.1421C78.1524 29.1662 78.3405 29.5231 78.2955 30.0081C78.2103 30.9263 78.0952 31.8414 77.9934 32.7578C76.9347 33.1025 76.9347 33.1025 76.9346 34.3449C76.9346 34.456 76.9351 34.567 76.9345 34.6781C76.9311 35.4023 76.8221 35.5041 76.186 35.3776C75.2046 35.1825 74.7818 35.5346 74.6927 36.5975C74.6792 36.7584 74.6023 37.0368 74.5264 37.0484C73.9894 37.131 73.8265 37.483 73.7641 38.0052C73.7489 38.1331 73.469 38.3177 73.3097 38.3189C70.7029 38.3384 68.0959 38.334 65.4889 38.3315C64.8381 38.3309 65.0497 37.71 64.8915 37.3554C64.7807 37.1071 64.7194 36.7064 64.5489 36.6428C64.2212 36.5205 63.8316 36.5052 63.612 37.0053C63.5426 37.1633 63.1981 37.2557 62.9812 37.2524C62.0551 37.2384 61.1284 37.195 60.205 37.1186C60.0174 37.103 59.7146 36.9274 59.6852 36.7761C59.5528 36.0968 59.1333 36.0067 58.6165 36.0742C58.3942 36.1032 58.1784 36.1913 57.9604 36.2555C57.3812 36.4262 57.1356 36.2054 57.1927 35.5627C57.1986 35.4967 57.2064 35.4304 57.2199 35.3659C57.4616 34.2131 57.4586 34.2072 56.4053 33.8555C56.4083 33.8153 56.4021 33.7456 56.4175 33.7395C57.4374 33.3388 57.4377 33.3392 57.4379 32.1257C57.438 30.5952 57.4379 29.0646 57.4379 27.4576C58.4706 27.418 58.6405 26.703 58.5531 25.8148C58.5081 25.3577 58.7238 25.3107 59.0929 25.245C59.7122 25.1349 60.1141 25.5151 60.6208 25.8566C60.6681 26.143 60.6678 26.3714 60.6195 26.6111C60.3866 27.0357 60.2192 27.4472 60.6682 27.863C60.5781 29.1646 60.8759 30.4289 60.4368 31.6499C60.3627 31.8558 60.3746 32.1656 60.4682 32.36C60.7507 32.9463 61.093 33.4995 61.4164 34.1134C61.5834 34.3742 61.7276 34.6081 61.9121 34.7962C62.5104 35.4058 63.5022 35.2227 64.0448 36.0095C64.1206 36.1193 64.5666 35.9679 64.8282 35.888C65.1186 35.7993 65.3947 35.5487 65.6761 35.5504C67.5504 35.5621 69.4245 35.6189 71.2985 35.6721C71.4998 35.6778 71.7062 35.8109 71.8982 35.7843C72.1906 35.7438 72.6169 35.7022 72.7212 35.5019C72.8442 35.2657 72.712 34.8525 72.6365 34.5306C72.5964 34.3595 72.4421 34.2194 72.3892 34.0633C72.9367 33.8915 72.621 33.4423 72.7574 33.1266C73.0613 32.6531 73.4416 32.2185 73.5589 31.7135C73.7706 30.8025 73.8744 29.8528 73.9311 28.9128C73.9884 27.963 74.0203 26.9922 73.8966 26.056C73.8207 25.4813 73.1997 25.0148 73.5606 24.3043C73.5873 24.2518 73.3933 24.0484 73.2803 23.9415C73.144 23.8125 72.9944 23.6908 72.833 23.6033C72.5517 23.4507 72.257 23.3267 71.9679 23.1907C71.9772 23.2699 71.9866 23.3491 71.9959 23.4283C71.8615 23.6424 71.7271 23.8565 71.5347 24.07C69.1179 24.0691 66.759 24.0553 64.4004 24.0781C63.827 24.0837 63.2552 24.2607 62.6815 24.2686C61.7671 24.2812 61.1449 24.7587 60.6694 25.538Z" fill="#F2F2F3"/>
      <path d="M60.6693 25.5817C61.1449 24.7587 61.7671 24.2812 62.6815 24.2686C63.2552 24.2607 63.827 24.0837 64.4005 24.0781C66.759 24.0553 69.1179 24.0691 71.5432 24.1169C72.2242 24.493 72.8507 24.8344 72.9934 25.6417C73.0792 26.1274 73.0571 26.6351 73.0835 27.1861C73.0829 27.3815 73.0824 27.5236 73.0466 27.6999C72.9528 28.0778 72.8559 28.4198 72.8426 28.7654C72.7865 30.221 72.7555 31.6776 72.7153 33.1338C72.621 33.4422 72.9368 33.8915 72.3397 34.0643C71.951 34.1559 71.6587 34.3308 71.3727 34.3197C68.0533 34.1906 64.7206 34.6509 61.4121 34.0655C61.0931 33.4994 60.7507 32.9463 60.4682 32.36C60.3746 32.1656 60.3627 31.8558 60.4368 31.6499C60.876 30.4289 60.5781 29.1646 60.6683 27.8029C60.6679 27.3202 60.6677 26.96 60.6675 26.5997C60.6678 26.3713 60.6681 26.143 60.6684 25.8575C60.6686 25.7421 60.6689 25.6838 60.6693 25.5817ZM61.2779 25.5241C61.2808 27.9274 61.2837 30.3308 61.2843 32.8443C61.2506 33.3356 61.3599 33.7355 61.8855 33.8164C62.4951 33.9102 63.107 34.0441 63.719 34.0513C66.089 34.0793 68.4594 34.0646 70.8297 34.0643C71.9954 34.0641 72.4604 33.5702 72.4659 32.3305C72.4675 31.9765 72.4664 31.6224 72.4678 31.1431C72.4695 29.5244 72.4363 27.9044 72.4883 26.2876C72.5129 25.5208 72.1304 25.1681 71.5347 24.7893C71.32 24.728 71.1056 24.6145 70.8906 24.6134C68.1419 24.5997 65.3931 24.5977 62.6444 24.611C62.4773 24.6118 62.3109 24.7665 62.0679 24.8603C62.0169 24.8652 61.9658 24.8701 61.8198 24.8668C61.6413 25.0443 61.4629 25.2217 61.2779 25.5241Z" fill="#E3E2E2"/>
      <path d="M61.4164 34.1135C64.7206 34.6509 68.0533 34.1906 71.3727 34.3197C71.6587 34.3308 71.951 34.1559 72.2899 34.0664C72.4422 34.2194 72.5964 34.3596 72.6366 34.5306C72.7121 34.8525 72.8442 35.2657 72.7212 35.502C72.617 35.7023 72.1906 35.7439 71.8983 35.7843C71.7063 35.8109 71.4998 35.6778 71.2985 35.6721C69.4246 35.619 67.5504 35.5621 65.6761 35.5505C65.3947 35.5487 65.1187 35.7994 64.8282 35.8881C64.5666 35.9679 64.1206 36.1193 64.0448 36.0095C63.5022 35.2228 62.5104 35.4058 61.9122 34.7962C61.7276 34.6081 61.5835 34.3743 61.4164 34.1135Z" fill="#EFEFF1"/>
      <path d="M73.0835 27.1328C73.0571 26.635 73.0792 26.1274 72.9934 25.6417C72.8507 24.8343 72.2242 24.493 71.6012 24.1175C71.7272 23.8565 71.8615 23.6424 71.9959 23.4283C71.9866 23.3491 71.9773 23.2699 71.9679 23.1907C72.257 23.3267 72.5518 23.4507 72.8331 23.6032C72.9944 23.6908 73.144 23.8125 73.2803 23.9415C73.3933 24.0484 73.5873 24.2518 73.5607 24.3043C73.1997 25.0148 73.8207 25.4812 73.8966 26.056C74.0203 26.9922 73.9885 27.963 73.9311 28.9128C73.8744 29.8527 73.7706 30.8024 73.559 31.7134C73.4416 32.2185 73.0613 32.6531 72.7574 33.1266C72.7555 31.6776 72.7865 30.2209 72.8426 28.7654C72.8559 28.4198 72.9528 28.0778 73.0943 27.6989C73.2669 27.559 73.3566 27.4543 73.4462 27.3497C73.3253 27.2774 73.2044 27.2051 73.0835 27.1328Z" fill="#EFEFF1"/>
      <path d="M60.6195 26.6111C60.6677 26.9599 60.6679 27.3201 60.668 27.7404C60.2192 27.4471 60.3867 27.0356 60.6195 26.6111Z" fill="#F5F5F5"/>
      <path d="M72.4665 31.2683C72.4664 31.6224 72.4674 31.9764 72.4659 32.3305C72.4604 33.5702 71.9954 34.064 70.8297 34.0642C68.4594 34.0645 66.089 34.0793 63.719 34.0513C63.107 34.044 62.495 33.9101 61.8855 33.8163C61.3599 33.7354 61.2506 33.3355 61.3291 32.7978C61.6331 33.0694 61.6952 33.6515 62.3346 33.5333C62.7665 33.5344 63.1446 33.5351 63.581 33.5355C64.6763 33.5355 65.7135 33.5357 66.7624 33.5884C67.5309 33.6663 68.2875 33.6932 69.0443 33.7093C69.0661 33.7097 69.0899 33.5954 69.1496 33.5319C69.2446 33.4868 69.3028 33.4444 69.4113 33.4014C69.7039 33.3175 70.1543 33.2348 70.1546 33.1507C70.156 32.6042 70.5727 32.4697 70.8971 32.2067C71.1223 32.2799 71.3023 32.3454 71.4824 32.4109C71.5206 32.2251 71.5909 32.0396 71.5922 31.8535C71.6056 29.877 71.608 27.9004 71.6535 25.9258C71.7472 25.9291 71.8007 25.9306 71.8532 25.9944C71.8574 26.7198 71.8627 27.3827 71.8613 28.1044C71.9112 29.4821 71.9679 30.801 72.029 32.2264C72.2116 31.8265 72.3391 31.5474 72.4665 31.2683Z" fill="#C5C3C5"/>
      <path d="M62.1441 24.8496C62.3109 24.7665 62.4773 24.6119 62.6443 24.6111C65.3931 24.5977 68.1419 24.5997 70.8906 24.6135C71.1056 24.6145 71.32 24.7281 71.5383 24.8672C71.4718 25.1045 71.4017 25.264 71.2751 25.4183C68.4436 25.4051 65.6686 25.3971 62.9065 25.3396C63.1798 25.2036 63.4403 25.117 63.7008 25.0303C63.6964 24.9701 63.692 24.9098 63.6877 24.8496C63.1732 24.8496 62.6587 24.8496 62.1441 24.8496Z" fill="#C4BBB6"/>
      <path d="M71.3316 25.4235C71.4017 25.2641 71.4718 25.1046 71.5675 24.908C72.1304 25.1682 72.5129 25.5209 72.4882 26.2877C72.4362 27.9045 72.4695 29.5245 72.4671 31.2058C72.339 31.5476 72.2116 31.8267 72.029 32.2266C71.9678 30.8011 71.9112 29.4822 71.9098 28.1081C72.0338 28.0166 72.1619 27.9816 72.1625 27.9442C72.1743 27.207 72.1713 26.4694 72.1713 25.6369C72.0029 25.7938 71.9286 25.863 71.8543 25.9322C71.8007 25.9308 71.7472 25.9293 71.6442 25.8851C71.5203 25.7757 71.4458 25.7091 71.3635 25.6063C71.3477 25.5213 71.3397 25.4724 71.3316 25.4235Z" fill="#B4B1B2"/>
      <path d="M62.106 24.855C62.6586 24.8496 63.1732 24.8496 63.6877 24.8496C63.692 24.9099 63.6964 24.9701 63.7007 25.0304C63.4403 25.117 63.1798 25.2037 62.8666 25.3417C62.7607 25.3969 62.7075 25.4007 62.603 25.4006C62.1846 25.3464 61.9521 25.4923 61.9077 25.9087C61.8681 26.2801 61.8003 26.6514 61.7972 27.0233C61.7833 28.7045 61.7879 30.3859 61.7366 32.0549C61.6367 31.8212 61.5439 31.6003 61.5424 31.3786C61.5289 29.385 61.5314 27.3914 61.539 25.3537C61.6707 25.1648 61.7927 25.0199 61.9147 24.8751C61.9658 24.8702 62.0168 24.8652 62.106 24.855Z" fill="#A09995"/>
      <path d="M61.5293 25.3977C61.5314 27.3914 61.5289 29.385 61.5424 31.3786C61.5439 31.6003 61.6368 31.8212 61.7702 32.0864C61.9546 32.4199 62.056 32.7095 62.1612 33.0452C62.2036 33.2386 62.2422 33.3858 62.2808 33.5331C61.6952 33.6516 61.6331 33.0695 61.3302 32.7428C61.2837 30.3308 61.2808 27.9275 61.322 25.4617C61.4205 25.3987 61.4749 25.3982 61.5293 25.3977Z" fill="#B4B1B2"/>
      <path d="M73.0835 27.186C73.2044 27.205 73.3253 27.2773 73.4462 27.3496C73.3566 27.4543 73.2669 27.5589 73.1296 27.6646C73.0824 27.5235 73.0829 27.3814 73.0835 27.186Z" fill="#F2F2F3"/>
      <path d="M61.539 25.3535C61.4749 25.3981 61.4205 25.3986 61.3253 25.3991C61.4629 25.2216 61.6413 25.0442 61.8672 24.8708C61.7927 25.0198 61.6707 25.1646 61.539 25.3535Z" fill="#C4BBB6"/>
      <path d="M69.3609 33.4019C69.3028 33.4444 69.2446 33.4868 69.0923 33.5313C68.5182 33.4927 68.0387 33.4303 67.5583 33.4198C67.2899 33.4139 67.0199 33.4943 66.7506 33.5359C65.7135 33.5357 64.6763 33.5354 63.581 33.4826C63.5844 32.9733 63.3757 32.6776 63.0298 32.4193C63.1984 32.0467 63.362 31.7216 63.5805 31.3965C64.0521 31.3089 64.4689 31.2212 64.8884 31.1281C64.8911 31.1227 64.9026 31.1221 64.9085 31.1748C65.5463 31.5752 65.9207 31.4718 66.251 30.8629C66.2546 30.8665 66.2484 30.8584 66.2938 30.8562C66.9591 30.5932 67.0709 29.9187 67.3708 29.3979C67.3725 29.3999 67.3689 29.3962 67.4175 29.3916C67.7688 29.266 68.0713 29.1449 68.4006 29.0197C68.4274 29.0156 68.4815 29.0149 68.4955 29.0418C68.5333 29.1024 68.5634 29.1272 68.6027 29.1853C68.6096 29.2835 68.6135 29.3396 68.6212 29.4391C68.7047 29.5434 68.7843 29.6044 68.8634 29.666C68.8627 29.6666 68.8639 29.6653 68.8638 29.7133C68.9512 29.8584 69.0386 29.9554 69.1642 30.0603C69.2614 30.1495 69.3204 30.2309 69.3774 30.3577C69.4553 30.4666 69.5352 30.53 69.6204 30.626C69.6256 30.6584 69.6292 30.7242 69.5879 30.7454C69.3784 31.1798 68.9661 31.8021 69.0883 31.9667C69.4428 32.4439 69.3148 32.9209 69.3609 33.4019Z" fill="#B4B1B2"/>
      <path d="M69.6293 30.7244C69.6293 30.7244 69.6257 30.6586 69.6147 30.5845C69.529 30.4445 69.4542 30.3785 69.3794 30.3125C69.3205 30.231 69.2615 30.1496 69.1602 30.0147C69.0333 29.8626 68.9486 29.764 68.8639 29.6655C68.8639 29.6655 68.8628 29.6667 68.8639 29.6211C68.8667 29.5154 68.8683 29.4553 68.9147 29.4012C69.552 30.0402 70.1404 30.6777 70.7405 31.3024C70.87 31.4373 71.0414 31.5259 71.1936 31.6359C71.245 31.46 71.3401 31.2844 71.341 31.1082C71.3498 29.2963 71.3434 27.4843 71.3486 25.6648C71.356 25.6571 71.3713 25.6423 71.3713 25.6423C71.4458 25.709 71.5203 25.7757 71.6041 25.8831C71.608 27.9005 71.6056 29.8771 71.5922 31.8536C71.5909 32.0397 71.5206 32.2252 71.4824 32.411C71.3023 32.3455 71.1223 32.28 70.8939 32.1673C70.8071 32.0568 70.7687 31.9934 70.7248 31.8876C70.6417 31.7812 70.5641 31.7172 70.4794 31.6091C70.1913 31.2848 69.9103 31.0046 69.6293 30.7244Z" fill="#E3E2E2"/>
      <path d="M70.7302 31.9302C70.7687 31.9935 70.8071 32.0568 70.8487 32.1597C70.5727 32.4698 70.156 32.6043 70.1545 33.1509C70.1543 33.235 69.7038 33.3177 69.4113 33.4016C69.3148 32.9211 69.4428 32.4441 69.0883 31.9669C68.9661 31.8023 69.3784 31.18 69.5879 30.7456C69.9103 31.0046 70.1913 31.2849 70.4808 31.654C70.5696 31.8054 70.6499 31.8678 70.7302 31.9302Z" fill="#B8B8B8"/>
      <path d="M63.0249 32.4668C63.3758 32.6777 63.5844 32.9734 63.5228 33.483C63.1446 33.5352 62.7665 33.5345 62.3346 33.5334C62.2422 33.3858 62.2036 33.2385 62.2074 33.0452C62.5082 32.8216 62.7666 32.6442 63.0249 32.4668Z" fill="#B8B8B8"/>
      <path d="M71.8532 25.9944C71.9286 25.8628 72.0029 25.7936 72.1713 25.6367C72.1713 26.4692 72.1743 27.2067 72.1625 27.944C72.1619 27.9814 72.0338 28.0164 71.9165 28.049C71.8627 27.3826 71.8574 26.7197 71.8532 25.9944Z" fill="#A09995"/>
      <path d="M66.7624 33.5885C67.0199 33.4945 67.29 33.4141 67.5583 33.42C68.0388 33.4305 68.5182 33.4929 69.0554 33.5342C69.0899 33.5956 69.0661 33.7099 69.0444 33.7094C68.2875 33.6933 67.5309 33.6664 66.7624 33.5885Z" fill="#B8B8B8"/>
      <path d="M62.6543 25.4044C62.7075 25.4007 62.7607 25.3969 62.8538 25.3911C65.6686 25.3971 68.4436 25.4052 71.2751 25.4184C71.3397 25.4724 71.3477 25.5213 71.3635 25.6063C71.3713 25.6424 71.356 25.6572 71.291 25.664C68.6165 25.6719 66.007 25.6729 63.3424 25.672C63.0495 25.6821 62.8117 25.6941 62.4905 25.7103C62.4905 27.7209 62.4905 29.6567 62.4905 31.5303C63.0069 31.0819 63.4881 30.5903 64.0407 30.2226C64.2451 30.0866 64.6233 30.2116 64.9119 30.2736C65.1676 30.3285 65.4499 30.5971 65.6473 30.5285C65.9729 30.4154 66.4069 30.2368 66.301 29.6608C66.8152 29.3521 67.2871 29.0507 67.7484 28.7918C67.6148 29.0216 67.4918 29.209 67.3689 29.3964C67.3689 29.3964 67.3725 29.4001 67.326 29.4029C66.6147 29.6273 66.5684 30.3549 66.2484 30.8586C66.2484 30.8586 66.2546 30.8667 66.2019 30.8635C65.7337 30.9476 65.3182 31.0349 64.9026 31.1223C64.9026 31.1223 64.8911 31.1229 64.8808 31.0812C64.4364 30.3759 64.0245 30.2966 63.6683 30.8245C63.5532 30.995 63.491 31.2066 63.361 31.4046C63.1896 31.6019 63.0851 31.8205 62.928 31.9791C62.749 32.16 62.5232 32.2874 62.3178 32.438C62.2623 32.2197 62.1603 32.0017 62.1588 31.7829C62.1459 30.0122 62.1712 28.241 62.1397 26.4708C62.1308 25.9739 62.241 25.6263 62.6543 25.4044Z" fill="#E3E2E2"/>
      <path d="M62.603 25.4005C62.241 25.6261 62.1308 25.9737 62.1397 26.4706C62.1712 28.2408 62.1459 30.0121 62.1587 31.7828C62.1603 32.0015 62.2623 32.2195 62.3177 32.4378C62.5232 32.2872 62.749 32.1598 62.928 31.979C63.0851 31.8203 63.1896 31.6018 63.3912 31.4021C63.4649 31.3945 63.5256 31.3965 63.5256 31.3965C63.362 31.7216 63.1983 32.0467 63.0298 32.4193C62.7666 32.6441 62.5082 32.8215 62.2036 32.999C62.056 32.7094 61.9546 32.4198 61.8195 32.0987C61.7879 30.3858 61.7833 28.7044 61.7972 27.0231C61.8003 26.6513 61.8681 26.28 61.9077 25.9086C61.9521 25.4921 62.1846 25.3463 62.603 25.4005Z" fill="#C5C3C5"/>
      <path d="M67.759 28.7492C67.2871 29.0507 66.8152 29.3521 66.2633 29.6549C66.099 29.0527 65.7618 28.7272 65.3375 28.7739C64.8277 28.83 64.313 28.8496 63.8004 28.8495C63.7119 28.8495 63.6235 28.6727 63.5913 28.5816C64.0766 28.5857 64.5163 28.646 64.93 28.5609C65.1425 28.5173 65.4201 28.244 65.4713 28.022C65.5602 27.6371 65.496 27.2115 65.496 26.9386C65.1237 26.742 64.8735 26.6099 64.6666 26.4686C64.8335 26.032 64.7926 25.993 64.3817 25.9272C64.0493 25.8739 63.7253 25.7606 63.3976 25.6738C66.007 25.6728 68.6165 25.6718 71.2836 25.6716C71.3434 27.4844 71.3498 29.2963 71.341 31.1082C71.3401 31.2844 71.245 31.46 71.1936 31.6359C71.0414 31.5259 70.87 31.4373 70.7404 31.3024C70.1404 30.6777 69.552 30.0402 68.913 29.4011C68.8666 29.3948 68.8673 29.3922 68.8607 29.3492C68.7693 29.2519 68.6846 29.1977 68.5998 29.1434C68.5634 29.1274 68.5333 29.1026 68.4938 28.9962C68.3939 28.8657 68.3097 28.808 68.1787 28.7489C68.0076 28.7482 67.8833 28.7487 67.759 28.7492Z" fill="#F2F3F7"/>
      <path d="M63.5805 31.3966C63.5256 31.3966 63.465 31.3945 63.4348 31.3969C63.491 31.2065 63.5533 30.995 63.6683 30.8244C64.0245 30.2966 64.4364 30.3758 64.8781 31.0866C64.4689 31.2214 64.0522 31.3091 63.5805 31.3966Z" fill="#A09995"/>
      <path d="M66.2938 30.8563C66.5684 30.3548 66.6147 29.6272 67.3243 29.4009C67.0709 29.9189 66.9591 30.5933 66.2938 30.8563Z" fill="#C5C3C5"/>
      <path d="M64.9085 31.1748C65.3181 31.0347 65.7337 30.9474 66.1983 30.8596C65.9207 31.4718 65.5463 31.5752 64.9085 31.1748Z" fill="#C5C3C5"/>
      <path d="M67.7484 28.7916C67.8833 28.7486 68.0075 28.7481 68.1866 28.7886C68.2855 28.8943 68.3297 28.9592 68.3738 29.024C68.0713 29.145 67.7688 29.2661 67.4175 29.3917C67.4918 29.2089 67.6148 29.0215 67.7484 28.7916Z" fill="#C5C3C5"/>
      <path d="M68.8638 29.7134C68.9485 29.764 69.0332 29.8625 69.122 30.0068C69.0386 29.9555 68.9511 29.8584 68.8638 29.7134Z" fill="#C5C3C5"/>
      <path d="M69.3774 30.3579C69.4542 30.3785 69.529 30.4445 69.6094 30.5521C69.5352 30.5302 69.4553 30.4668 69.3774 30.3579Z" fill="#C5C3C5"/>
      <path d="M68.4006 29.0198C68.3297 28.9591 68.2855 28.8943 68.2334 28.7898C68.3097 28.8078 68.3939 28.8656 68.4798 28.9692C68.4815 29.015 68.4274 29.0156 68.4006 29.0198Z" fill="#E3E2E2"/>
      <path d="M68.8683 29.3949C68.8683 29.4552 68.8667 29.5153 68.8645 29.6204C68.7843 29.6044 68.7047 29.5434 68.6628 29.439C68.7562 29.3945 68.8117 29.3933 68.8673 29.3921C68.8673 29.3921 68.8666 29.3947 68.8683 29.3949Z" fill="#C5C3C5"/>
      <path d="M68.8607 29.349C68.8117 29.3933 68.7562 29.3945 68.659 29.3957C68.6135 29.3396 68.6096 29.2835 68.6028 29.1853C68.6846 29.1975 68.7693 29.2518 68.8607 29.349Z" fill="#E3E2E2"/>
      <path d="M70.7248 31.8875C70.65 31.8676 70.5697 31.8052 70.4879 31.698C70.5641 31.7171 70.6417 31.7811 70.7248 31.8875Z" fill="#C5C3C5"/>
      <path d="M63.3424 25.6719C63.7253 25.7605 64.0493 25.8739 64.3817 25.9271C64.7926 25.993 64.8335 26.0319 64.6168 26.4687C63.3618 26.5594 63.2637 26.669 63.2886 27.8588C63.29 27.9249 63.2926 27.9909 63.2613 28.0808C63.3277 28.2251 63.4274 28.3456 63.5297 28.4938C63.5323 28.5217 63.535 28.5775 63.535 28.5775C63.6235 28.6726 63.7119 28.8494 63.8004 28.8494C64.313 28.8495 64.8277 28.8299 65.3375 28.7738C65.7618 28.7271 66.099 29.0527 66.2211 29.662C66.4069 30.2367 65.9729 30.4153 65.6473 30.5284C65.4499 30.597 65.1676 30.3284 64.9119 30.2734C64.6233 30.2115 64.2451 30.0865 64.0408 30.2225C63.4881 30.5902 63.0069 31.0818 62.4905 31.5302C62.4905 29.6566 62.4905 27.7208 62.4905 25.7102C62.8118 25.694 63.0495 25.682 63.3424 25.6719Z" fill="#F7F9FB"/>
      <path d="M63.5913 28.5814C63.535 28.5774 63.5323 28.5216 63.5271 28.4512C63.4461 28.2728 63.3704 28.1648 63.2946 28.0568C63.2926 27.9908 63.29 27.9248 63.2886 27.8587C63.2637 26.6689 63.3618 26.5593 64.5735 26.4778C64.8735 26.6097 65.1237 26.7418 65.496 26.9385C65.496 27.2113 65.5602 27.637 65.4713 28.0219C65.4201 28.2438 65.1425 28.5171 64.93 28.5608C64.5163 28.6458 64.0766 28.5855 63.5913 28.5814ZM64.8922 27.593C64.939 27.186 64.8029 26.9222 64.3915 27.0025C64.1738 27.045 63.848 27.1632 63.8016 27.3239C63.7429 27.5274 63.9004 28.0096 63.9967 28.0197C64.3014 28.0518 64.7655 28.3506 64.8922 27.593Z" fill="#C7CBD0"/>
      <path d="M63.2613 28.0808C63.3704 28.1649 63.4461 28.2728 63.5244 28.4234C63.4273 28.3456 63.3277 28.2251 63.2613 28.0808Z" fill="#F2F3F7"/>
      <path d="M64.8901 27.6521C64.7655 28.3507 64.3014 28.0518 63.9967 28.0198C63.9004 28.0097 63.7428 27.5275 63.8016 27.324C63.848 27.1633 64.1737 27.0451 64.3914 27.0026C64.8029 26.9222 64.939 27.1861 64.8901 27.6521Z" fill="#7E828A"/>
      </g>
      <defs>
      <clipPath id="clip0_83_193">
      <rect width="38" height="24" fill="white" transform="translate(48 17)"/>
      </clipPath>
      </defs>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="7" y="5" width="33" height="5" fill="#E0E0E0"/>
      <rect x="8" y="37" width="30" height="3" fill="#E0E0E0"/>
      <rect x="8" y="42" width="20" height="2" fill="#E0E0E0"/>
      <g clip-path="url(#clip0_83_95)">
      <path d="M39.2448 20.4391C39.2448 20.5856 39.2448 20.7321 39.205 20.9296C38.798 21.2682 38.9107 21.6208 39.0058 21.9842C39.0559 22.1756 39.0741 22.3838 39.0584 22.5807C39.0378 22.8375 38.9292 23.0904 38.9279 23.3454C38.9167 25.4724 38.9312 27.5997 38.9129 29.7266C38.9095 30.1207 38.9239 30.6163 38.7026 30.8867C38.181 31.5242 37.5468 32.0599 36.5958 32.0565C32.3931 32.0414 28.1903 32.05 23.9876 32.05C19.5334 32.05 15.0791 32.0623 10.625 32.035C10.0391 32.0314 9.44777 31.8498 8.87207 31.7018C8.59193 31.6297 8.34209 31.4448 8.07854 31.311C8.02056 31.1897 7.96257 31.0685 7.88361 30.8692C7.76452 29.8411 8.25131 28.8721 7.76205 27.9309C7.71135 27.8334 7.75489 27.6889 7.75488 27.5662C7.75486 24.2529 7.75838 20.9396 7.74564 17.6263C7.74491 17.4376 7.61111 17.2495 7.53925 17.0611C7.53925 16.9819 7.53925 16.9028 7.57597 16.7804C7.69591 16.6339 7.77914 16.5307 7.86236 16.4275C8.04665 15.8719 8.37547 15.4495 9.05456 15.2695C9.9826 15.0651 10.8273 14.8583 11.7104 14.9498C12.0646 14.9864 12.4191 15.0507 12.7736 15.051C20.0791 15.057 27.3847 15.056 34.6903 15.0541C35.0771 15.0539 35.4665 14.9998 35.8502 15.0287C36.624 15.087 37.3946 15.1851 38.1665 15.2667C38.1665 15.2667 38.1667 15.3194 38.1671 15.3845C38.4108 15.7853 38.6424 16.1298 38.9016 16.4533C39.0498 16.6383 39.1211 16.737 39.0073 17.0263C38.8433 17.4433 38.8807 17.9416 38.8624 18.4063C38.8458 18.83 38.8269 19.2615 38.8909 19.6775C38.9317 19.9427 39.1217 20.186 39.2448 20.4391ZM17.9188 20.9655C17.5202 20.741 17.1711 20.44 16.6333 20.5272C16.3128 20.5792 16.1255 20.6164 16.1646 20.9783C16.2405 21.6815 16.0929 22.2476 15.1961 22.2789C15.1961 23.5511 15.1962 24.7628 15.196 25.9745C15.1959 26.9352 15.1957 26.9348 14.3099 27.252C14.2965 27.2568 14.302 27.3121 14.3 27.3439C15.2141 27.6223 15.2167 27.627 15.0068 28.5396C14.995 28.5907 14.9883 28.6432 14.9832 28.6954C14.9336 29.2042 15.1468 29.379 15.6498 29.2439C15.8391 29.193 16.0266 29.1233 16.2196 29.1003C16.6684 29.0469 17.0327 29.1182 17.1477 29.656C17.1732 29.7758 17.4362 29.9148 17.5991 29.9271C18.401 29.9876 19.2058 30.022 20.01 30.0331C20.1984 30.0357 20.4975 29.9625 20.5578 29.8374C20.7485 29.4416 21.0868 29.4536 21.3714 29.5505C21.5195 29.6008 21.5727 29.9181 21.6689 30.1147C21.8063 30.3953 21.6225 30.8869 22.1878 30.8874C24.4517 30.8893 26.7157 30.8928 28.9795 30.8774C29.1178 30.8764 29.3609 30.7303 29.3741 30.629C29.4283 30.2157 29.5698 29.937 30.0361 29.8716C30.102 29.8624 30.1688 29.642 30.1805 29.5146C30.2579 28.6732 30.625 28.3944 31.4773 28.5489C32.0297 28.649 32.1244 28.5684 32.1274 27.9951C32.1278 27.9072 32.1274 27.8192 32.1275 27.7313C32.1275 26.7477 32.1275 26.7477 33.0462 26.4748C33.1354 25.7493 33.2352 25.025 33.3092 24.298C33.3483 23.914 33.185 23.6315 32.7534 23.6124C32.4114 23.5973 32.3278 23.4186 32.3418 23.1303C32.3503 22.9548 32.3419 22.7786 32.3432 22.6028C32.3457 22.2724 32.2784 22.0348 31.8516 22.0035C31.3486 21.9666 31.0755 21.6877 31.1545 21.1533C31.2027 20.8279 31.1038 20.628 30.7496 20.4649C30.3854 20.297 30.1084 19.9673 30.1822 19.4832C30.2714 18.8983 30.3611 18.3106 30.3931 17.7211C30.4242 17.1477 30.1682 16.9923 29.5866 17.09C29.0614 17.1783 28.5277 17.252 27.9961 17.2642C26.8648 17.2903 25.7323 17.2815 24.6005 17.267C24.2166 17.2621 23.893 17.2641 23.809 17.7435C23.7896 17.8546 23.6053 17.9951 23.4764 18.0198C23.1464 18.0828 22.7975 18.0556 22.4706 18.1277C22.2378 18.179 21.9781 18.2861 21.8193 18.4506C21.4954 18.7861 21.1782 19.0539 20.6648 18.9644C20.4028 18.9188 20.1345 18.8873 19.869 18.8864C19.4789 18.8851 18.9912 18.8557 18.9155 19.3403C18.8369 19.8435 18.5602 19.9081 18.1355 19.8504C18.0879 20.1751 18.0451 20.4672 18.0021 20.8284C18.0019 20.8746 18.0017 20.9208 17.9188 20.9655Z" fill="#F5F5F5"/>
      <path d="M8.08252 31.3477C8.34212 31.4449 8.59195 31.6298 8.8721 31.7019C9.4478 31.8499 10.0391 32.0314 10.6251 32.035C15.0791 32.0624 19.5334 32.05 23.9876 32.0501C28.1904 32.0501 32.3931 32.0415 36.5959 32.0566C37.5468 32.06 38.181 31.5243 38.7027 30.8868C38.9239 30.6164 38.9095 30.1207 38.9129 29.7267C38.9312 27.5998 38.9168 25.4725 38.9279 23.3455C38.9293 23.0905 39.0379 22.8376 39.0584 22.5808C39.0741 22.3839 39.0559 22.1757 39.0058 21.9843C38.9107 21.6209 38.798 21.2683 39.2049 20.9736C39.3144 21.2264 39.4522 21.4888 39.4413 21.7453C39.4042 22.6163 39.2679 23.4846 39.2546 24.3551C39.2245 26.3231 39.2601 28.2921 39.229 30.26C39.2243 30.5559 39.0462 30.8759 38.8722 31.1359C38.6431 31.4783 38.3671 31.8037 38.0556 32.0753C37.8738 32.234 37.5838 32.3539 37.342 32.3547C32.889 32.3709 28.4358 32.3742 23.9827 32.3616C22.6944 32.3579 21.4061 32.2667 20.118 32.269C18.5603 32.2719 17.0027 32.362 15.4452 32.3591C13.4745 32.3555 11.5039 32.3005 9.53343 32.2586C8.88439 32.2448 8.4803 31.8164 8.08252 31.3477Z" fill="#F9F9FA"/>
      <path d="M38.1654 15.2251C37.3946 15.1851 36.6239 15.087 35.8501 15.0287C35.4665 14.9999 35.0771 15.054 34.6902 15.0541C27.3847 15.056 20.0791 15.057 12.7735 15.051C12.4191 15.0508 12.0646 14.9865 11.7103 14.9498C10.8273 14.8583 9.98257 15.0652 9.09283 15.2656C9.14882 15.1277 9.22866 14.8923 9.35247 14.8676C9.76889 14.7843 10.2009 14.7439 10.627 14.7436C18.9918 14.7373 27.3565 14.7365 35.7212 14.7435C36.3808 14.7441 37.0426 14.7901 37.6983 14.8603C37.8637 14.878 38.0095 15.071 38.1654 15.2251Z" fill="#F9F9FA"/>
      <path d="M7.53917 17.1106C7.61109 17.2495 7.7449 17.4377 7.74562 17.6264C7.75836 20.9396 7.75484 24.2529 7.75487 27.5662C7.75487 27.6889 7.71133 27.8335 7.76203 27.931C8.25129 28.8722 7.7645 29.8412 7.86244 30.8402C7.75458 30.6031 7.55442 30.3173 7.55308 30.0307C7.533 25.7405 7.53915 21.4503 7.53917 17.1106Z" fill="#F9F9FA"/>
      <path d="M39.245 20.3897C39.1217 20.1861 38.9317 19.9428 38.8909 19.6775C38.8269 19.2616 38.8458 18.8301 38.8624 18.4064C38.8807 17.9417 38.8433 17.4434 39.0073 17.0264C39.1211 16.737 39.0498 16.6384 38.9016 16.4534C38.6424 16.1299 38.4108 15.7854 38.1672 15.4109C38.4386 15.6559 38.6924 15.9592 38.9868 16.2183C39.3527 16.5403 39.2775 16.8722 39.2108 17.3016C39.1187 17.8946 39.2293 18.5169 39.2433 19.1268C39.2527 19.5311 39.2451 19.9357 39.245 20.3897Z" fill="#F9F9FA"/>
      <path d="M7.82569 16.4312C7.77911 16.5306 7.69588 16.6339 7.57599 16.7408C7.62256 16.6413 7.7058 16.5381 7.82569 16.4312Z" fill="#F9F9FA"/>
      <path d="M18.0024 20.7591C18.0451 20.4671 18.0879 20.1751 18.1355 19.8504C18.5602 19.908 18.8369 19.8435 18.9155 19.3403C18.9911 18.8556 19.4789 18.8851 19.869 18.8864C20.1345 18.8872 20.4028 18.9187 20.6647 18.9644C21.1782 19.0538 21.4954 18.786 21.8193 18.4505C21.9781 18.286 22.2378 18.1789 22.4706 18.1276C22.7975 18.0556 23.1464 18.0827 23.4764 18.0197C23.6053 17.9951 23.7895 17.8546 23.809 17.7434C23.893 17.264 24.2166 17.262 24.6005 17.2669C25.7323 17.2815 26.8648 17.2902 27.9961 17.2642C28.5277 17.252 29.0614 17.1783 29.5866 17.09C30.1682 16.9922 30.4242 17.1477 30.3931 17.7211C30.3611 18.3105 30.2713 18.8983 30.1822 19.4831C30.1083 19.9672 30.3854 20.297 30.7496 20.4648C31.1038 20.628 31.2027 20.8278 31.1545 21.1532C31.0755 21.6876 31.3486 21.9665 31.8516 22.0034C32.2784 22.0347 32.3457 22.2723 32.3432 22.6027C32.3419 22.7786 32.3503 22.9548 32.3417 23.1302C32.3277 23.4186 32.4114 23.5972 32.7534 23.6123C33.185 23.6315 33.3483 23.914 33.3092 24.298C33.2352 25.0249 33.1353 25.7493 33.0469 26.4748C32.1275 26.7477 32.1275 26.7477 32.1274 27.7312C32.1274 27.8192 32.1278 27.9071 32.1274 27.995C32.1243 28.5683 32.0297 28.6489 31.4773 28.5488C30.625 28.3944 30.2578 28.6731 30.1805 29.5145C30.1688 29.642 30.102 29.8623 30.0361 29.8716C29.5697 29.9369 29.4282 30.2156 29.3741 30.629C29.3609 30.7303 29.1178 30.8764 28.9795 30.8773C26.7157 30.8927 24.4517 30.8893 22.1878 30.8873C21.6225 30.8868 21.8063 30.3953 21.6689 30.1146C21.5727 29.918 21.5195 29.6008 21.3714 29.5504C21.0868 29.4536 20.7485 29.4415 20.5578 29.8374C20.4975 29.9624 20.1984 30.0356 20.01 30.033C19.2058 30.0219 18.401 29.9875 17.5991 29.9271C17.4362 29.9148 17.1732 29.7757 17.1476 29.6559C17.0327 29.1182 16.6684 29.0468 16.2196 29.1002C16.0266 29.1232 15.8391 29.193 15.6498 29.2438C15.1468 29.3789 14.9336 29.2042 14.9832 28.6953C14.9882 28.6431 14.995 28.5906 15.0067 28.5396C15.2167 27.6269 15.2141 27.6222 14.2993 27.3438C14.302 27.312 14.2965 27.2568 14.3099 27.252C15.1956 26.9347 15.1959 26.9351 15.196 25.9744C15.1962 24.7627 15.1961 23.551 15.1961 22.2788C16.0929 22.2475 16.2405 21.6814 16.1646 20.9783C16.1255 20.6163 16.3128 20.5792 16.6333 20.5272C17.1711 20.44 17.5201 20.741 17.9602 21.0114C18.0013 21.2381 18.001 21.4189 17.959 21.6087C17.7568 21.9448 17.6114 22.2705 18.0013 22.5997C17.9231 23.6302 18.1817 24.6311 17.8004 25.5977C17.736 25.7607 17.7463 26.006 17.8276 26.1599C18.0729 26.6241 18.3703 27.0619 18.6511 27.548C18.7961 27.7545 18.9213 27.9396 19.0816 28.0885C19.6011 28.5711 20.4625 28.4262 20.9337 29.049C20.9994 29.136 21.3868 29.0161 21.6139 28.9529C21.8662 28.8827 22.1059 28.6842 22.3503 28.6856C23.978 28.6949 25.6055 28.7399 27.2329 28.7819C27.4077 28.7864 27.587 28.8918 27.7537 28.8708C28.0076 28.8387 28.3779 28.8058 28.4684 28.6472C28.5752 28.4602 28.4605 28.1331 28.3949 27.8782C28.36 27.7428 28.2261 27.6319 28.1801 27.5083C28.6556 27.3723 28.3814 27.0167 28.4998 26.7668C28.7637 26.3919 29.094 26.0478 29.1959 25.648C29.3797 24.9268 29.4699 24.175 29.5191 23.4309C29.5689 22.6789 29.5966 21.9104 29.4891 21.1692C29.4232 20.7142 28.884 20.3449 29.1974 19.7824C29.2205 19.7409 29.0521 19.5799 28.9539 19.4952C28.8356 19.3931 28.7057 19.2968 28.5655 19.2275C28.3213 19.1067 28.0653 19.0085 27.8142 18.9008C27.8223 18.9636 27.8304 19.0263 27.8385 19.089C27.7218 19.2584 27.6052 19.4279 27.438 19.597C25.3392 19.5962 23.2907 19.5853 21.2425 19.6034C20.7445 19.6078 20.2479 19.7479 19.7497 19.7542C18.9557 19.7642 18.4153 20.1422 18.0024 20.7591Z" fill="#F2F2F3"/>
      <path d="M18.0022 20.7938C18.4153 20.1423 18.9557 19.7642 19.7497 19.7542C20.2479 19.748 20.7445 19.6079 21.2425 19.6035C23.2907 19.5854 25.3392 19.5963 27.4454 19.6342C28.0368 19.9319 28.5809 20.2022 28.7047 20.8413C28.7793 21.2258 28.7601 21.6277 28.783 22.064C28.7825 22.2187 28.7821 22.3311 28.751 22.4707C28.6695 22.7699 28.5853 23.0406 28.5738 23.3143C28.5251 24.4666 28.4982 25.6197 28.4633 26.7726C28.3814 27.0167 28.6556 27.3724 28.1371 27.5092C27.7996 27.5817 27.5457 27.7202 27.2973 27.7114C24.4147 27.6092 21.5205 27.9736 18.6473 27.5102C18.3703 27.062 18.073 26.6241 17.8276 26.1599C17.7463 26.0061 17.736 25.7608 17.8004 25.5978C18.1817 24.6312 17.9231 23.6303 18.0014 22.5523C18.0011 22.1701 18.0009 21.8849 18.0007 21.5997C18.001 21.4189 18.0013 21.2381 18.0015 21.0122C18.0017 20.9208 18.0019 20.8746 18.0022 20.7938ZM18.5308 20.7482C18.5333 22.6508 18.5358 24.5535 18.5364 26.5434C18.5071 26.9323 18.602 27.2489 19.0584 27.3129C19.5878 27.3872 20.1192 27.4932 20.6507 27.4989C22.7089 27.5211 24.7674 27.5094 26.8257 27.5092C27.8381 27.509 28.2419 27.1181 28.2467 26.1366C28.248 25.8563 28.2471 25.5761 28.2483 25.1966C28.2498 23.9151 28.2209 22.6326 28.2661 21.3527C28.2875 20.7456 27.9554 20.4664 27.438 20.1665C27.2516 20.118 27.0653 20.0281 26.8787 20.0273C24.4916 20.0164 22.1045 20.0148 19.7174 20.0254C19.5724 20.026 19.4278 20.1484 19.2169 20.2227C19.1725 20.2266 19.1281 20.2305 19.0014 20.2279C18.8464 20.3684 18.6914 20.5088 18.5308 20.7482Z" fill="#E3E2E2"/>
      <path d="M18.6511 27.548C21.5205 27.9735 24.4147 27.6091 27.2973 27.7113C27.5457 27.7201 27.7996 27.5816 28.0939 27.5107C28.2261 27.6319 28.3601 27.7428 28.3949 27.8782C28.4605 28.1331 28.5753 28.4602 28.4684 28.6472C28.3779 28.8058 28.0077 28.8387 27.7537 28.8708C27.587 28.8918 27.4077 28.7864 27.2329 28.7819C25.6055 28.7399 23.978 28.6949 22.3503 28.6856C22.106 28.6842 21.8662 28.8827 21.614 28.9529C21.3868 29.0161 20.9995 29.136 20.9337 29.049C20.4625 28.4262 19.6012 28.5711 19.0816 28.0885C18.9213 27.9396 18.7962 27.7545 18.6511 27.548Z" fill="#EFEFF1"/>
      <path d="M28.783 22.0217C28.7601 21.6277 28.7793 21.2258 28.7047 20.8413C28.5809 20.2021 28.0368 19.9319 27.4958 19.6346C27.6052 19.428 27.7218 19.2585 27.8385 19.089C27.8304 19.0263 27.8223 18.9636 27.8142 18.9009C28.0653 19.0085 28.3213 19.1067 28.5655 19.2275C28.7057 19.2968 28.8356 19.3932 28.9539 19.4953C29.0521 19.5799 29.2205 19.7409 29.1974 19.7825C28.884 20.345 29.4232 20.7142 29.4892 21.1692C29.5966 21.9104 29.5689 22.6789 29.5191 23.4309C29.4699 24.175 29.3797 24.9269 29.1959 25.6481C29.094 26.0479 28.7637 26.3919 28.4998 26.7668C28.4982 25.6197 28.5251 24.4665 28.5738 23.3142C28.5853 23.0406 28.6695 22.7699 28.7924 22.4699C28.9423 22.3592 29.0202 22.2763 29.098 22.1934C28.993 22.1362 28.888 22.079 28.783 22.0217Z" fill="#EFEFF1"/>
      <path d="M17.9591 21.6089C18.0009 21.885 18.0011 22.1702 18.0012 22.5029C17.6114 22.2707 17.7568 21.945 17.9591 21.6089Z" fill="#F5F5F5"/>
      <path d="M28.2472 25.2957C28.2471 25.5759 28.2481 25.8562 28.2467 26.1365C28.2419 27.118 27.8382 27.5089 26.8258 27.5091C24.7674 27.5093 22.7089 27.521 20.6508 27.4988C20.1193 27.4931 19.5878 27.3871 19.0585 27.3128C18.602 27.2488 18.5071 26.9322 18.5753 26.5065C18.8393 26.7215 18.8932 27.1823 19.4485 27.0888C19.8236 27.0896 20.152 27.0902 20.5309 27.0905C21.4821 27.0905 22.3828 27.0907 23.2937 27.1324C23.961 27.194 24.6181 27.2153 25.2754 27.2281C25.2942 27.2285 25.3149 27.138 25.3668 27.0877C25.4493 27.052 25.4998 27.0184 25.594 26.9844C25.8481 26.918 26.2393 26.8525 26.2395 26.7859C26.2408 26.3532 26.6027 26.2467 26.8843 26.0386C27.0799 26.0965 27.2362 26.1484 27.3926 26.2002C27.4258 26.0531 27.4869 25.9063 27.488 25.7589C27.4996 24.1942 27.5017 22.6294 27.5412 21.0662C27.6226 21.0688 27.6691 21.07 27.7146 21.1205C27.7183 21.6947 27.7229 22.2195 27.7217 22.7909C27.7651 23.8816 27.8142 24.9257 27.8674 26.0542C28.0259 25.7376 28.1366 25.5166 28.2472 25.2957Z" fill="#C5C3C5"/>
      <path d="M19.2831 20.2143C19.4279 20.1485 19.5724 20.0261 19.7175 20.0254C22.1045 20.0149 24.4917 20.0165 26.8787 20.0273C27.0654 20.0282 27.2516 20.1181 27.4412 20.2282C27.3834 20.4161 27.3226 20.5424 27.2126 20.6645C24.7537 20.6541 22.3438 20.6477 19.9451 20.6022C20.1825 20.4946 20.4087 20.426 20.6349 20.3574C20.6311 20.3097 20.6273 20.262 20.6235 20.2143C20.1767 20.2143 19.7299 20.2143 19.2831 20.2143Z" fill="#C4BBB6"/>
      <path d="M27.2617 20.6684C27.3225 20.5422 27.3834 20.4159 27.4665 20.2603C27.9554 20.4663 28.2875 20.7455 28.2661 21.3526C28.221 22.6325 28.2498 23.915 28.2478 25.246C28.1365 25.5166 28.0259 25.7376 27.8673 26.0542C27.8142 24.9257 27.765 23.8816 27.7638 22.7937C27.8715 22.7213 27.9827 22.6936 27.9832 22.664C27.9935 22.0803 27.9909 21.4964 27.9909 20.8374C27.8446 20.9615 27.7801 21.0163 27.7156 21.0711C27.6691 21.07 27.6226 21.0688 27.5332 21.0338C27.4255 20.9472 27.3608 20.8945 27.2894 20.8131C27.2757 20.7458 27.2687 20.7071 27.2617 20.6684Z" fill="#B4B1B2"/>
      <path d="M19.25 20.2183C19.7299 20.2141 20.1767 20.2141 20.6235 20.2141C20.6273 20.2618 20.6311 20.3095 20.6348 20.3572C20.4086 20.4258 20.1824 20.4944 19.9105 20.6037C19.8185 20.6474 19.7723 20.6504 19.6815 20.6503C19.3182 20.6074 19.1163 20.7229 19.0777 21.0526C19.0433 21.3466 18.9845 21.6406 18.9818 21.9349C18.9697 23.2659 18.9737 24.597 18.9291 25.9183C18.8424 25.7333 18.7618 25.5584 18.7605 25.3829C18.7487 23.8047 18.751 22.2263 18.7575 20.6131C18.8719 20.4636 18.9778 20.349 19.0838 20.2343C19.1281 20.2304 19.1725 20.2265 19.25 20.2183Z" fill="#A09995"/>
      <path d="M18.7491 20.6482C18.751 22.2265 18.7487 23.8048 18.7605 25.3831C18.7618 25.5586 18.8424 25.7335 18.9583 25.9434C19.1184 26.2075 19.2065 26.4367 19.2979 26.7025C19.3347 26.8556 19.3682 26.9721 19.4018 27.0887C18.8931 27.1825 18.8393 26.7217 18.5762 26.4631C18.5358 24.5536 18.5333 22.6509 18.5691 20.6989C18.6547 20.649 18.7019 20.6486 18.7491 20.6482Z" fill="#B4B1B2"/>
      <path d="M28.783 22.064C28.888 22.079 28.993 22.1362 29.0981 22.1934C29.0202 22.2763 28.9423 22.3592 28.8231 22.4428C28.7821 22.3311 28.7825 22.2186 28.783 22.064Z" fill="#F2F2F3"/>
      <path d="M18.7576 20.6133C18.7019 20.6486 18.6547 20.649 18.572 20.6494C18.6914 20.5089 18.8464 20.3684 19.0426 20.2312C18.9779 20.3491 18.8719 20.4638 18.7576 20.6133Z" fill="#C4BBB6"/>
      <path d="M25.5502 26.9849C25.4998 27.0184 25.4493 27.052 25.3169 27.0873C24.8184 27.0567 24.402 27.0073 23.9848 26.999C23.7518 26.9944 23.5173 27.058 23.2834 27.0909C22.3827 27.0907 21.482 27.0905 20.5308 27.0487C20.5338 26.6455 20.3526 26.4114 20.0522 26.2069C20.1985 25.912 20.3407 25.6546 20.5304 25.3972C20.94 25.3279 21.3019 25.2585 21.6662 25.1848C21.6686 25.1804 21.6786 25.18 21.6837 25.2217C22.2376 25.5387 22.5627 25.4568 22.8495 24.9748C22.8526 24.9777 22.8473 24.9712 22.8867 24.9695C23.4645 24.7613 23.5615 24.2273 23.822 23.815C23.8235 23.8166 23.8203 23.8136 23.8626 23.81C24.1676 23.7106 24.4303 23.6148 24.7163 23.5156C24.7395 23.5123 24.7865 23.5118 24.7987 23.5331C24.8315 23.5811 24.8577 23.6007 24.8918 23.6467C24.8977 23.7244 24.9011 23.7689 24.9079 23.8476C24.9804 23.9302 25.0495 23.9785 25.1182 24.0273C25.1176 24.0277 25.1186 24.0267 25.1185 24.0647C25.1944 24.1795 25.2703 24.2564 25.3795 24.3394C25.4639 24.41 25.5151 24.4745 25.5646 24.5749C25.6322 24.661 25.7016 24.7113 25.7756 24.7872C25.7801 24.8129 25.7833 24.865 25.7473 24.8818C25.5654 25.2257 25.2074 25.7183 25.3135 25.8486C25.6214 26.2264 25.5102 26.604 25.5502 26.9849Z" fill="#B4B1B2"/>
      <path d="M25.7833 24.8651C25.7833 24.8651 25.7802 24.813 25.7707 24.7544C25.6962 24.6435 25.6313 24.5912 25.5664 24.539C25.5151 24.4745 25.4639 24.4101 25.376 24.3032C25.2657 24.1828 25.1922 24.1048 25.1186 24.0268C25.1186 24.0268 25.1177 24.0278 25.1187 23.9917C25.1211 23.908 25.1225 23.8604 25.1628 23.8176C25.7162 24.3234 26.2272 24.8281 26.7483 25.3227C26.8608 25.4295 27.0097 25.4996 27.1418 25.5867C27.1864 25.4474 27.2691 25.3084 27.2698 25.1689C27.2775 23.7345 27.2719 22.3001 27.2764 20.8596C27.2829 20.8535 27.2961 20.8418 27.2961 20.8418C27.3608 20.8946 27.4256 20.9473 27.4983 21.0324C27.5017 22.6295 27.4996 24.1943 27.488 25.759C27.4869 25.9064 27.4258 26.0532 27.3926 26.2003C27.2362 26.1485 27.0799 26.0966 26.8815 26.0074C26.8062 25.9199 26.7728 25.8698 26.7347 25.786C26.6625 25.7017 26.5951 25.6511 26.5216 25.5655C26.2714 25.3087 26.0274 25.0869 25.7833 24.8651Z" fill="#E3E2E2"/>
      <path d="M26.7394 25.8196C26.7728 25.8698 26.8062 25.9199 26.8423 26.0013C26.6026 26.2468 26.2408 26.3533 26.2395 26.786C26.2393 26.8526 25.8481 26.9181 25.594 26.9845C25.5102 26.6041 25.6214 26.2265 25.3136 25.8487C25.2074 25.7184 25.5654 25.2257 25.7473 24.8818C26.0273 25.0869 26.2714 25.3087 26.5228 25.601C26.6 25.7208 26.6697 25.7702 26.7394 25.8196Z" fill="#B8B8B8"/>
      <path d="M20.0479 26.2446C20.3526 26.4116 20.5338 26.6457 20.4803 27.0491C20.1519 27.0904 19.8236 27.0899 19.4485 27.089C19.3682 26.9722 19.3347 26.8556 19.338 26.7025C19.5992 26.5255 19.8236 26.3851 20.0479 26.2446Z" fill="#B8B8B8"/>
      <path d="M27.7146 21.1205C27.7801 21.0164 27.8446 20.9616 27.9909 20.8374C27.9909 21.4964 27.9935 22.0803 27.9832 22.664C27.9827 22.6936 27.8715 22.7213 27.7696 22.7472C27.7228 22.2196 27.7182 21.6948 27.7146 21.1205Z" fill="#A09995"/>
      <path d="M23.2937 27.1325C23.5173 27.058 23.7518 26.9944 23.9849 26.999C24.4021 27.0073 24.8185 27.0567 25.285 27.0894C25.3149 27.138 25.2942 27.2285 25.2754 27.2282C24.6181 27.2154 23.961 27.1941 23.2937 27.1325Z" fill="#B8B8B8"/>
      <path d="M19.7261 20.6534C19.7723 20.6504 19.8185 20.6474 19.8993 20.6428C22.3438 20.6476 24.7536 20.6539 27.2126 20.6644C27.2686 20.7072 27.2756 20.7459 27.2894 20.8132C27.2961 20.8418 27.2828 20.8535 27.2264 20.8589C24.9038 20.8651 22.6377 20.8659 20.3237 20.8652C20.0693 20.8732 19.8628 20.8827 19.5838 20.8955C19.5838 22.4872 19.5838 24.0197 19.5838 25.503C20.0323 25.148 20.4501 24.7588 20.9301 24.4677C21.1076 24.3601 21.436 24.459 21.6866 24.5081C21.9087 24.5516 22.1538 24.7642 22.3253 24.7099C22.6081 24.6204 22.9849 24.479 22.8929 24.023C23.3395 23.7786 23.7493 23.54 24.1499 23.335C24.0339 23.517 23.9271 23.6653 23.8203 23.8136C23.8203 23.8136 23.8235 23.8166 23.7831 23.8189C23.1654 23.9965 23.1252 24.5725 22.8473 24.9712C22.8473 24.9712 22.8526 24.9777 22.8069 24.9751C22.4003 25.0417 22.0394 25.1109 21.6786 25.18C21.6786 25.18 21.6686 25.1805 21.6597 25.1475C21.2737 24.5891 20.916 24.5264 20.6067 24.9443C20.5067 25.0793 20.4526 25.2467 20.3398 25.4035C20.191 25.5597 20.1002 25.7327 19.9638 25.8583C19.8083 26.0015 19.6122 26.1024 19.4338 26.2216C19.3857 26.0488 19.2971 25.8762 19.2957 25.703C19.2846 24.3012 19.3065 22.899 19.2792 21.4976C19.2715 21.1042 19.3672 20.829 19.7261 20.6534Z" fill="#E3E2E2"/>
      <path d="M19.6816 20.6504C19.3672 20.8291 19.2715 21.1043 19.2792 21.4976C19.3066 22.899 19.2846 24.3013 19.2958 25.7031C19.2972 25.8763 19.3857 26.0488 19.4339 26.2217C19.6123 26.1024 19.8084 26.0015 19.9638 25.8584C20.1002 25.7328 20.191 25.5598 20.366 25.4017C20.4301 25.3957 20.4828 25.3972 20.4828 25.3972C20.3407 25.6546 20.1986 25.912 20.0522 26.207C19.8236 26.385 19.5992 26.5254 19.3348 26.6659C19.2066 26.4366 19.1185 26.2074 19.0012 25.9531C18.9737 24.5971 18.9697 23.266 18.9818 21.935C18.9845 21.6407 19.0434 21.3467 19.0777 21.0527C19.1163 20.723 19.3182 20.6075 19.6816 20.6504Z" fill="#C5C3C5"/>
      <path d="M24.1592 23.3014C23.7493 23.54 23.3395 23.7787 22.8603 24.0184C22.7176 23.5417 22.4247 23.2839 22.0563 23.3209C21.6135 23.3653 21.1666 23.3809 20.7215 23.3808C20.6446 23.3808 20.5678 23.2409 20.5399 23.1687C20.9613 23.172 21.3431 23.2197 21.7024 23.1524C21.887 23.1178 22.128 22.9014 22.1725 22.7257C22.2496 22.421 22.1939 22.084 22.1939 21.868C21.8706 21.7124 21.6534 21.6078 21.4737 21.4959C21.6186 21.1503 21.5831 21.1194 21.2262 21.0673C20.9376 21.0252 20.6562 20.9354 20.3716 20.8667C22.6377 20.8659 24.9038 20.8652 27.22 20.865C27.2719 22.3001 27.2775 23.7346 27.2698 25.169C27.2691 25.3084 27.1864 25.4475 27.1418 25.5867C27.0097 25.4997 26.8608 25.4295 26.7483 25.3227C26.2272 24.8282 25.7162 24.3234 25.1614 23.8174C25.1211 23.8125 25.1216 23.8105 25.1159 23.7764C25.0365 23.6994 24.9629 23.6565 24.8893 23.6135C24.8577 23.6008 24.8316 23.5811 24.7973 23.497C24.7105 23.3937 24.6374 23.3479 24.5236 23.3012C24.375 23.3006 24.2671 23.301 24.1592 23.3014Z" fill="#F2F3F7"/>
      <path d="M20.5305 25.3973C20.4828 25.3972 20.4301 25.3956 20.4039 25.3975C20.4527 25.2468 20.5068 25.0793 20.6067 24.9443C20.916 24.5264 21.2737 24.5891 21.6573 25.1518C21.302 25.2585 20.94 25.328 20.5305 25.3973Z" fill="#A09995"/>
      <path d="M22.8867 24.9696C23.1252 24.5726 23.1654 23.9965 23.7816 23.8174C23.5616 24.2274 23.4645 24.7614 22.8867 24.9696Z" fill="#C5C3C5"/>
      <path d="M21.6837 25.2217C22.0395 25.1108 22.4003 25.0417 22.8038 24.9722C22.5627 25.4568 22.2376 25.5387 21.6837 25.2217Z" fill="#C5C3C5"/>
      <path d="M24.1499 23.3351C24.2671 23.301 24.375 23.3006 24.5305 23.3327C24.6164 23.4164 24.6547 23.4677 24.6931 23.519C24.4303 23.6149 24.1676 23.7107 23.8626 23.8101C23.9271 23.6654 24.0339 23.5171 24.1499 23.3351Z" fill="#C5C3C5"/>
      <path d="M25.1185 24.0647C25.1921 24.1048 25.2657 24.1828 25.3428 24.297C25.2703 24.2564 25.1944 24.1795 25.1185 24.0647Z" fill="#C5C3C5"/>
      <path d="M25.5646 24.575C25.6313 24.5913 25.6962 24.6435 25.7661 24.7287C25.7017 24.7114 25.6323 24.6611 25.5646 24.575Z" fill="#C5C3C5"/>
      <path d="M24.7164 23.5156C24.6548 23.4676 24.6164 23.4162 24.5712 23.3335C24.6374 23.3478 24.7105 23.3935 24.7851 23.4755C24.7866 23.5118 24.7396 23.5123 24.7164 23.5156Z" fill="#E3E2E2"/>
      <path d="M25.1224 23.8128C25.1225 23.8605 25.1211 23.9081 25.1192 23.9913C25.0495 23.9787 24.9804 23.9303 24.944 23.8477C25.0251 23.8125 25.0733 23.8115 25.1216 23.8105C25.1216 23.8105 25.121 23.8126 25.1224 23.8128Z" fill="#C5C3C5"/>
      <path d="M25.1158 23.7764C25.0733 23.8114 25.0251 23.8123 24.9407 23.8133C24.9012 23.7689 24.8978 23.7245 24.8918 23.6467C24.9629 23.6564 25.0365 23.6994 25.1158 23.7764Z" fill="#E3E2E2"/>
      <path d="M26.7347 25.786C26.6697 25.7703 26.6 25.7209 26.529 25.636C26.5951 25.6511 26.6625 25.7018 26.7347 25.786Z" fill="#C5C3C5"/>
      <path d="M20.3237 20.8652C20.6562 20.9354 20.9375 21.0251 21.2262 21.0673C21.5831 21.1194 21.6186 21.1502 21.4304 21.4961C20.3405 21.5679 20.2553 21.6546 20.277 22.5966C20.2782 22.6488 20.2804 22.7011 20.2533 22.7723C20.3109 22.8866 20.3974 22.9819 20.4863 23.0993C20.4886 23.1213 20.4909 23.1655 20.4909 23.1655C20.5677 23.2408 20.6446 23.3808 20.7214 23.3808C21.1666 23.3809 21.6135 23.3653 22.0563 23.3209C22.4247 23.2839 22.7175 23.5417 22.8236 24.0241C22.9849 24.479 22.6081 24.6204 22.3253 24.71C22.1539 24.7643 21.9087 24.5516 21.6866 24.5081C21.4361 24.4591 21.1076 24.3601 20.9301 24.4678C20.4502 24.7589 20.0323 25.1481 19.5839 25.5031C19.5839 24.0198 19.5839 22.4873 19.5839 20.8956C19.8628 20.8827 20.0693 20.8732 20.3237 20.8652Z" fill="#F7F9FB"/>
      <path d="M20.5398 23.1688C20.4909 23.1657 20.4886 23.1214 20.484 23.0657C20.4137 22.9244 20.3479 22.839 20.2822 22.7535C20.2804 22.7012 20.2781 22.649 20.2769 22.5967C20.2553 21.6547 20.3405 21.568 21.3928 21.5034C21.6533 21.6079 21.8705 21.7125 22.1939 21.8681C22.1939 22.0841 22.2496 22.4211 22.1724 22.7258C22.128 22.9015 21.8869 23.1179 21.7024 23.1525C21.3431 23.2198 20.9612 23.1721 20.5398 23.1688ZM21.6695 22.3863C21.7101 22.0641 21.5919 21.8552 21.2347 21.9188C21.0456 21.9525 20.7627 22.046 20.7224 22.1733C20.6714 22.3344 20.8082 22.7161 20.8919 22.7241C21.1565 22.7495 21.5595 22.9861 21.6695 22.3863Z" fill="#C7CBD0"/>
      <path d="M20.2532 22.7722C20.3479 22.8388 20.4137 22.9242 20.4817 23.0434C20.3974 22.9818 20.3109 22.8865 20.2532 22.7722Z" fill="#F2F3F7"/>
      <path d="M21.6677 22.433C21.5595 22.986 21.1565 22.7494 20.8919 22.7241C20.8082 22.7161 20.6714 22.3343 20.7225 22.1732C20.7628 22.046 21.0456 21.9524 21.2347 21.9188C21.592 21.8552 21.7102 22.064 21.6677 22.433Z" fill="#7E828A"/>
      </g>
      <rect x="51" y="37" width="30" height="3" fill="#E0E0E0"/>
      <rect x="51" y="42" width="20" height="2" fill="#E0E0E0"/>
      <g clip-path="url(#clip1_83_95)">
      <path d="M82.2448 20.4391C82.2448 20.5856 82.2448 20.7321 82.205 20.9296C81.798 21.2682 81.9107 21.6208 82.0058 21.9842C82.0559 22.1756 82.0741 22.3838 82.0584 22.5807C82.0378 22.8375 81.9292 23.0904 81.9279 23.3454C81.9167 25.4724 81.9312 27.5997 81.9129 29.7266C81.9095 30.1207 81.9239 30.6163 81.7026 30.8867C81.181 31.5242 80.5468 32.0599 79.5958 32.0565C75.3931 32.0414 71.1903 32.05 66.9876 32.05C62.5334 32.05 58.0791 32.0623 53.625 32.035C53.0391 32.0314 52.4478 31.8498 51.8721 31.7018C51.5919 31.6297 51.3421 31.4448 51.0785 31.311C51.0206 31.1897 50.9626 31.0685 50.8836 30.8692C50.7645 29.8411 51.2513 28.8721 50.7621 27.9309C50.7114 27.8334 50.7549 27.6889 50.7549 27.5662C50.7549 24.2529 50.7584 20.9396 50.7456 17.6263C50.7449 17.4376 50.6111 17.2495 50.5392 17.0611C50.5392 16.9819 50.5392 16.9028 50.576 16.7804C50.6959 16.6339 50.7791 16.5307 50.8624 16.4275C51.0466 15.8719 51.3755 15.4495 52.0546 15.2695C52.9826 15.0651 53.8273 14.8583 54.7104 14.9498C55.0646 14.9864 55.4191 15.0507 55.7736 15.051C63.0791 15.057 70.3847 15.056 77.6903 15.0541C78.0771 15.0539 78.4665 14.9998 78.8502 15.0287C79.624 15.087 80.3946 15.1851 81.1665 15.2667C81.1665 15.2667 81.1667 15.3194 81.1671 15.3845C81.4108 15.7853 81.6424 16.1298 81.9016 16.4533C82.0498 16.6383 82.1211 16.737 82.0073 17.0263C81.8433 17.4433 81.8807 17.9416 81.8624 18.4063C81.8458 18.83 81.8269 19.2615 81.8909 19.6775C81.9317 19.9427 82.1217 20.186 82.2448 20.4391ZM60.9188 20.9655C60.5202 20.741 60.1711 20.44 59.6333 20.5272C59.3128 20.5792 59.1255 20.6164 59.1646 20.9783C59.2405 21.6815 59.0929 22.2476 58.1961 22.2789C58.1961 23.5511 58.1962 24.7628 58.196 25.9745C58.1959 26.9352 58.1957 26.9348 57.3099 27.252C57.2965 27.2568 57.302 27.3121 57.3 27.3439C58.2141 27.6223 58.2167 27.627 58.0068 28.5396C57.995 28.5907 57.9883 28.6432 57.9832 28.6954C57.9336 29.2042 58.1468 29.379 58.6498 29.2439C58.8391 29.193 59.0266 29.1233 59.2196 29.1003C59.6684 29.0469 60.0327 29.1182 60.1477 29.656C60.1732 29.7758 60.4362 29.9148 60.5991 29.9271C61.401 29.9876 62.2058 30.022 63.01 30.0331C63.1984 30.0357 63.4975 29.9625 63.5578 29.8374C63.7485 29.4416 64.0868 29.4536 64.3714 29.5505C64.5195 29.6008 64.5727 29.9181 64.6689 30.1147C64.8063 30.3953 64.6225 30.8869 65.1878 30.8874C67.4517 30.8893 69.7157 30.8928 71.9795 30.8774C72.1178 30.8764 72.3609 30.7303 72.3741 30.629C72.4283 30.2157 72.5698 29.937 73.0361 29.8716C73.102 29.8624 73.1688 29.642 73.1805 29.5146C73.2579 28.6732 73.625 28.3944 74.4773 28.5489C75.0297 28.649 75.1244 28.5684 75.1274 27.9951C75.1278 27.9072 75.1274 27.8192 75.1275 27.7313C75.1275 26.7477 75.1275 26.7477 76.0462 26.4748C76.1354 25.7493 76.2352 25.025 76.3092 24.298C76.3483 23.914 76.185 23.6315 75.7534 23.6124C75.4114 23.5973 75.3278 23.4186 75.3418 23.1303C75.3503 22.9548 75.3419 22.7786 75.3432 22.6028C75.3457 22.2724 75.2784 22.0348 74.8516 22.0035C74.3486 21.9666 74.0755 21.6877 74.1545 21.1533C74.2027 20.8279 74.1038 20.628 73.7496 20.4649C73.3854 20.297 73.1084 19.9673 73.1822 19.4832C73.2714 18.8983 73.3611 18.3106 73.3931 17.7211C73.4242 17.1477 73.1682 16.9923 72.5866 17.09C72.0614 17.1783 71.5277 17.252 70.9961 17.2642C69.8648 17.2903 68.7323 17.2815 67.6005 17.267C67.2166 17.2621 66.893 17.2641 66.809 17.7435C66.7896 17.8546 66.6053 17.9951 66.4764 18.0198C66.1464 18.0828 65.7975 18.0556 65.4706 18.1277C65.2378 18.179 64.9781 18.2861 64.8193 18.4506C64.4954 18.7861 64.1782 19.0539 63.6648 18.9644C63.4028 18.9188 63.1345 18.8873 62.869 18.8864C62.4789 18.8851 61.9912 18.8557 61.9155 19.3403C61.8369 19.8435 61.5602 19.9081 61.1355 19.8504C61.0879 20.1751 61.0451 20.4672 61.0021 20.8284C61.0019 20.8746 61.0017 20.9208 60.9188 20.9655Z" fill="#F5F5F5"/>
      <path d="M51.0825 31.3477C51.3421 31.4449 51.592 31.6298 51.8721 31.7019C52.4478 31.8499 53.0391 32.0314 53.6251 32.035C58.0791 32.0624 62.5334 32.05 66.9876 32.0501C71.1904 32.0501 75.3931 32.0415 79.5959 32.0566C80.5468 32.06 81.181 31.5243 81.7027 30.8868C81.9239 30.6164 81.9095 30.1207 81.9129 29.7267C81.9312 27.5998 81.9168 25.4725 81.9279 23.3455C81.9293 23.0905 82.0379 22.8376 82.0584 22.5808C82.0741 22.3839 82.0559 22.1757 82.0058 21.9843C81.9107 21.6209 81.798 21.2683 82.2049 20.9736C82.3144 21.2264 82.4522 21.4888 82.4413 21.7453C82.4042 22.6163 82.2679 23.4846 82.2546 24.3551C82.2245 26.3231 82.2601 28.2921 82.229 30.26C82.2243 30.5559 82.0462 30.8759 81.8722 31.1359C81.6431 31.4783 81.3671 31.8037 81.0556 32.0753C80.8738 32.234 80.5838 32.3539 80.342 32.3547C75.889 32.3709 71.4358 32.3742 66.9827 32.3616C65.6944 32.3579 64.4061 32.2667 63.118 32.269C61.5603 32.2719 60.0027 32.362 58.4452 32.3591C56.4745 32.3555 54.5039 32.3005 52.5334 32.2586C51.8844 32.2448 51.4803 31.8164 51.0825 31.3477Z" fill="#F9F9FA"/>
      <path d="M81.1654 15.2251C80.3946 15.1851 79.6239 15.087 78.8501 15.0287C78.4665 14.9999 78.0771 15.054 77.6902 15.0541C70.3847 15.056 63.0791 15.057 55.7735 15.051C55.4191 15.0508 55.0646 14.9865 54.7103 14.9498C53.8273 14.8583 52.9826 15.0652 52.0928 15.2656C52.1488 15.1277 52.2287 14.8923 52.3525 14.8676C52.7689 14.7843 53.2009 14.7439 53.627 14.7436C61.9918 14.7373 70.3565 14.7365 78.7212 14.7435C79.3808 14.7441 80.0426 14.7901 80.6983 14.8603C80.8637 14.878 81.0095 15.071 81.1654 15.2251Z" fill="#F9F9FA"/>
      <path d="M50.5392 17.1106C50.6111 17.2495 50.7449 17.4377 50.7456 17.6264C50.7584 20.9396 50.7548 24.2529 50.7549 27.5662C50.7549 27.6889 50.7113 27.8335 50.762 27.931C51.2513 28.8722 50.7645 29.8412 50.8624 30.8402C50.7546 30.6031 50.5544 30.3173 50.5531 30.0307C50.533 25.7405 50.5392 21.4503 50.5392 17.1106Z" fill="#F9F9FA"/>
      <path d="M82.245 20.3897C82.1217 20.1861 81.9317 19.9428 81.8909 19.6775C81.8269 19.2616 81.8458 18.8301 81.8624 18.4064C81.8807 17.9417 81.8433 17.4434 82.0073 17.0264C82.1211 16.737 82.0498 16.6384 81.9016 16.4534C81.6424 16.1299 81.4108 15.7854 81.1672 15.4109C81.4386 15.6559 81.6924 15.9592 81.9868 16.2183C82.3527 16.5403 82.2775 16.8722 82.2108 17.3016C82.1187 17.8946 82.2293 18.5169 82.2433 19.1268C82.2527 19.5311 82.2451 19.9357 82.245 20.3897Z" fill="#F9F9FA"/>
      <path d="M50.8257 16.4312C50.7791 16.5306 50.6959 16.6339 50.576 16.7408C50.6226 16.6413 50.7058 16.5381 50.8257 16.4312Z" fill="#F9F9FA"/>
      <path d="M61.0024 20.7591C61.0451 20.4671 61.0879 20.1751 61.1355 19.8504C61.5602 19.908 61.8369 19.8435 61.9155 19.3403C61.9911 18.8556 62.4789 18.8851 62.869 18.8864C63.1345 18.8872 63.4028 18.9187 63.6647 18.9644C64.1782 19.0538 64.4954 18.786 64.8193 18.4505C64.9781 18.286 65.2378 18.1789 65.4706 18.1276C65.7975 18.0556 66.1464 18.0827 66.4764 18.0197C66.6053 17.9951 66.7895 17.8546 66.809 17.7434C66.893 17.264 67.2166 17.262 67.6005 17.2669C68.7323 17.2815 69.8648 17.2902 70.9961 17.2642C71.5277 17.252 72.0614 17.1783 72.5866 17.09C73.1682 16.9922 73.4242 17.1477 73.3931 17.7211C73.3611 18.3105 73.2713 18.8983 73.1822 19.4831C73.1083 19.9672 73.3854 20.297 73.7496 20.4648C74.1038 20.628 74.2027 20.8278 74.1545 21.1532C74.0755 21.6876 74.3486 21.9665 74.8516 22.0034C75.2784 22.0347 75.3457 22.2723 75.3432 22.6027C75.3419 22.7786 75.3503 22.9548 75.3417 23.1302C75.3277 23.4186 75.4114 23.5972 75.7534 23.6123C76.185 23.6315 76.3483 23.914 76.3092 24.298C76.2352 25.0249 76.1353 25.7493 76.0469 26.4748C75.1275 26.7477 75.1275 26.7477 75.1274 27.7312C75.1274 27.8192 75.1278 27.9071 75.1274 27.995C75.1243 28.5683 75.0297 28.6489 74.4773 28.5488C73.625 28.3944 73.2578 28.6731 73.1805 29.5145C73.1688 29.642 73.102 29.8623 73.0361 29.8716C72.5697 29.9369 72.4282 30.2156 72.3741 30.629C72.3609 30.7303 72.1178 30.8764 71.9795 30.8773C69.7157 30.8927 67.4517 30.8893 65.1878 30.8873C64.6225 30.8868 64.8063 30.3953 64.6689 30.1146C64.5727 29.918 64.5195 29.6008 64.3714 29.5504C64.0868 29.4536 63.7485 29.4415 63.5578 29.8374C63.4975 29.9624 63.1984 30.0356 63.01 30.033C62.2058 30.0219 61.401 29.9875 60.5991 29.9271C60.4362 29.9148 60.1732 29.7757 60.1476 29.6559C60.0327 29.1182 59.6684 29.0468 59.2196 29.1002C59.0266 29.1232 58.8391 29.193 58.6498 29.2438C58.1468 29.3789 57.9336 29.2042 57.9832 28.6953C57.9882 28.6431 57.995 28.5906 58.0067 28.5396C58.2167 27.6269 58.2141 27.6222 57.2993 27.3438C57.302 27.312 57.2965 27.2568 57.3099 27.252C58.1956 26.9347 58.1959 26.9351 58.196 25.9744C58.1962 24.7627 58.1961 23.551 58.1961 22.2788C59.0929 22.2475 59.2405 21.6814 59.1646 20.9783C59.1255 20.6163 59.3128 20.5792 59.6333 20.5272C60.1711 20.44 60.5201 20.741 60.9602 21.0114C61.0013 21.2381 61.001 21.4189 60.959 21.6087C60.7568 21.9448 60.6114 22.2705 61.0013 22.5997C60.9231 23.6302 61.1817 24.6311 60.8004 25.5977C60.736 25.7607 60.7463 26.006 60.8276 26.1599C61.0729 26.6241 61.3703 27.0619 61.6511 27.548C61.7961 27.7545 61.9213 27.9396 62.0816 28.0885C62.6011 28.5711 63.4625 28.4262 63.9337 29.049C63.9994 29.136 64.3868 29.0161 64.6139 28.9529C64.8662 28.8827 65.1059 28.6842 65.3503 28.6856C66.978 28.6949 68.6055 28.7399 70.2329 28.7819C70.4077 28.7864 70.587 28.8918 70.7537 28.8708C71.0076 28.8387 71.3779 28.8058 71.4684 28.6472C71.5752 28.4602 71.4605 28.1331 71.3949 27.8782C71.36 27.7428 71.2261 27.6319 71.1801 27.5083C71.6556 27.3723 71.3814 27.0167 71.4998 26.7668C71.7637 26.3919 72.094 26.0478 72.1959 25.648C72.3797 24.9268 72.4699 24.175 72.5191 23.4309C72.5689 22.6789 72.5966 21.9104 72.4891 21.1692C72.4232 20.7142 71.884 20.3449 72.1974 19.7824C72.2205 19.7409 72.0521 19.5799 71.9539 19.4952C71.8356 19.3931 71.7057 19.2968 71.5655 19.2275C71.3213 19.1067 71.0653 19.0085 70.8142 18.9008C70.8223 18.9636 70.8304 19.0263 70.8385 19.089C70.7218 19.2584 70.6052 19.4279 70.438 19.597C68.3392 19.5962 66.2907 19.5853 64.2425 19.6034C63.7445 19.6078 63.2479 19.7479 62.7497 19.7542C61.9557 19.7642 61.4153 20.1422 61.0024 20.7591Z" fill="#F2F2F3"/>
      <path d="M61.0022 20.7938C61.4153 20.1423 61.9557 19.7642 62.7497 19.7542C63.2479 19.748 63.7445 19.6079 64.2425 19.6035C66.2907 19.5854 68.3392 19.5963 70.4454 19.6342C71.0368 19.9319 71.5809 20.2022 71.7047 20.8413C71.7793 21.2258 71.7601 21.6277 71.783 22.064C71.7825 22.2187 71.7821 22.3311 71.751 22.4707C71.6695 22.7699 71.5853 23.0406 71.5738 23.3143C71.5251 24.4666 71.4982 25.6197 71.4633 26.7726C71.3814 27.0167 71.6556 27.3724 71.1371 27.5092C70.7996 27.5817 70.5457 27.7202 70.2973 27.7114C67.4147 27.6092 64.5205 27.9736 61.6473 27.5102C61.3703 27.062 61.073 26.6241 60.8276 26.1599C60.7463 26.0061 60.736 25.7608 60.8004 25.5978C61.1817 24.6312 60.9231 23.6303 61.0014 22.5523C61.0011 22.1701 61.0009 21.8849 61.0007 21.5997C61.001 21.4189 61.0013 21.2381 61.0015 21.0122C61.0017 20.9208 61.0019 20.8746 61.0022 20.7938ZM61.5308 20.7482C61.5333 22.6508 61.5358 24.5535 61.5364 26.5434C61.5071 26.9323 61.602 27.2489 62.0584 27.3129C62.5878 27.3872 63.1192 27.4932 63.6507 27.4989C65.7089 27.5211 67.7674 27.5094 69.8257 27.5092C70.8381 27.509 71.2419 27.1181 71.2467 26.1366C71.248 25.8563 71.2471 25.5761 71.2483 25.1966C71.2498 23.9151 71.2209 22.6326 71.2661 21.3527C71.2875 20.7456 70.9554 20.4664 70.438 20.1665C70.2516 20.118 70.0653 20.0281 69.8787 20.0273C67.4916 20.0164 65.1045 20.0148 62.7174 20.0254C62.5724 20.026 62.4278 20.1484 62.2169 20.2227C62.1725 20.2266 62.1281 20.2305 62.0014 20.2279C61.8464 20.3684 61.6914 20.5088 61.5308 20.7482Z" fill="#E3E2E2"/>
      <path d="M61.6511 27.548C64.5205 27.9735 67.4147 27.6091 70.2973 27.7113C70.5457 27.7201 70.7996 27.5816 71.0939 27.5107C71.2261 27.6319 71.3601 27.7428 71.3949 27.8782C71.4605 28.1331 71.5753 28.4602 71.4684 28.6472C71.3779 28.8058 71.0077 28.8387 70.7537 28.8708C70.587 28.8918 70.4077 28.7864 70.2329 28.7819C68.6055 28.7399 66.978 28.6949 65.3503 28.6856C65.106 28.6842 64.8662 28.8827 64.614 28.9529C64.3868 29.0161 63.9995 29.136 63.9337 29.049C63.4625 28.4262 62.6012 28.5711 62.0816 28.0885C61.9213 27.9396 61.7962 27.7545 61.6511 27.548Z" fill="#EFEFF1"/>
      <path d="M71.783 22.0217C71.7601 21.6277 71.7793 21.2258 71.7047 20.8413C71.5809 20.2021 71.0368 19.9319 70.4958 19.6346C70.6052 19.428 70.7218 19.2585 70.8385 19.089C70.8304 19.0263 70.8223 18.9636 70.8142 18.9009C71.0653 19.0085 71.3213 19.1067 71.5655 19.2275C71.7057 19.2968 71.8356 19.3932 71.9539 19.4953C72.0521 19.5799 72.2205 19.7409 72.1974 19.7825C71.884 20.345 72.4232 20.7142 72.4892 21.1692C72.5966 21.9104 72.5689 22.6789 72.5191 23.4309C72.4699 24.175 72.3797 24.9269 72.1959 25.6481C72.094 26.0479 71.7637 26.3919 71.4998 26.7668C71.4982 25.6197 71.5251 24.4665 71.5738 23.3142C71.5853 23.0406 71.6695 22.7699 71.7924 22.4699C71.9423 22.3592 72.0202 22.2763 72.098 22.1934C71.993 22.1362 71.888 22.079 71.783 22.0217Z" fill="#EFEFF1"/>
      <path d="M60.9591 21.6089C61.0009 21.885 61.0011 22.1702 61.0012 22.5029C60.6114 22.2707 60.7568 21.945 60.9591 21.6089Z" fill="#F5F5F5"/>
      <path d="M71.2472 25.2957C71.2471 25.5759 71.2481 25.8562 71.2467 26.1365C71.2419 27.118 70.8382 27.5089 69.8258 27.5091C67.7674 27.5093 65.7089 27.521 63.6508 27.4988C63.1193 27.4931 62.5878 27.3871 62.0585 27.3128C61.602 27.2488 61.5071 26.9322 61.5753 26.5065C61.8393 26.7215 61.8932 27.1823 62.4485 27.0888C62.8236 27.0896 63.152 27.0902 63.5309 27.0905C64.4821 27.0905 65.3828 27.0907 66.2937 27.1324C66.961 27.194 67.6181 27.2153 68.2754 27.2281C68.2942 27.2285 68.3149 27.138 68.3668 27.0877C68.4493 27.052 68.4998 27.0184 68.594 26.9844C68.8481 26.918 69.2393 26.8525 69.2395 26.7859C69.2408 26.3532 69.6027 26.2467 69.8843 26.0386C70.0799 26.0965 70.2362 26.1484 70.3926 26.2002C70.4258 26.0531 70.4869 25.9063 70.488 25.7589C70.4996 24.1942 70.5017 22.6294 70.5412 21.0662C70.6226 21.0688 70.6691 21.07 70.7146 21.1205C70.7183 21.6947 70.7229 22.2195 70.7217 22.7909C70.7651 23.8816 70.8142 24.9257 70.8674 26.0542C71.0259 25.7376 71.1366 25.5166 71.2472 25.2957Z" fill="#C5C3C5"/>
      <path d="M62.2831 20.2143C62.4279 20.1485 62.5724 20.0261 62.7175 20.0254C65.1045 20.0149 67.4917 20.0165 69.8787 20.0273C70.0654 20.0282 70.2516 20.1181 70.4412 20.2282C70.3834 20.4161 70.3226 20.5424 70.2126 20.6645C67.7537 20.6541 65.3438 20.6477 62.9451 20.6022C63.1825 20.4946 63.4087 20.426 63.6349 20.3574C63.6311 20.3097 63.6273 20.262 63.6235 20.2143C63.1767 20.2143 62.7299 20.2143 62.2831 20.2143Z" fill="#C4BBB6"/>
      <path d="M70.2617 20.6684C70.3225 20.5422 70.3834 20.4159 70.4665 20.2603C70.9554 20.4663 71.2875 20.7455 71.2661 21.3526C71.221 22.6325 71.2498 23.915 71.2478 25.246C71.1365 25.5166 71.0259 25.7376 70.8673 26.0542C70.8142 24.9257 70.765 23.8816 70.7638 22.7937C70.8715 22.7213 70.9827 22.6936 70.9832 22.664C70.9935 22.0803 70.9909 21.4964 70.9909 20.8374C70.8446 20.9615 70.7801 21.0163 70.7156 21.0711C70.6691 21.07 70.6226 21.0688 70.5332 21.0338C70.4255 20.9472 70.3608 20.8945 70.2894 20.8131C70.2757 20.7458 70.2687 20.7071 70.2617 20.6684Z" fill="#B4B1B2"/>
      <path d="M62.25 20.2183C62.7299 20.2141 63.1767 20.2141 63.6235 20.2141C63.6273 20.2618 63.6311 20.3095 63.6348 20.3572C63.4086 20.4258 63.1824 20.4944 62.9105 20.6037C62.8185 20.6474 62.7723 20.6504 62.6815 20.6503C62.3182 20.6074 62.1163 20.7229 62.0777 21.0526C62.0433 21.3466 61.9845 21.6406 61.9818 21.9349C61.9697 23.2659 61.9737 24.597 61.9291 25.9183C61.8424 25.7333 61.7618 25.5584 61.7605 25.3829C61.7487 23.8047 61.751 22.2263 61.7575 20.6131C61.8719 20.4636 61.9778 20.349 62.0838 20.2343C62.1281 20.2304 62.1725 20.2265 62.25 20.2183Z" fill="#A09995"/>
      <path d="M61.7491 20.6482C61.751 22.2265 61.7487 23.8048 61.7605 25.3831C61.7618 25.5586 61.8424 25.7335 61.9583 25.9434C62.1184 26.2075 62.2065 26.4367 62.2979 26.7025C62.3347 26.8556 62.3682 26.9721 62.4018 27.0887C61.8931 27.1825 61.8393 26.7217 61.5762 26.4631C61.5358 24.5536 61.5333 22.6509 61.5691 20.6989C61.6547 20.649 61.7019 20.6486 61.7491 20.6482Z" fill="#B4B1B2"/>
      <path d="M71.783 22.064C71.888 22.079 71.993 22.1362 72.0981 22.1934C72.0202 22.2763 71.9423 22.3592 71.8231 22.4428C71.7821 22.3311 71.7825 22.2186 71.783 22.064Z" fill="#F2F2F3"/>
      <path d="M61.7576 20.6133C61.7019 20.6486 61.6547 20.649 61.572 20.6494C61.6914 20.5089 61.8464 20.3684 62.0426 20.2312C61.9779 20.3491 61.8719 20.4638 61.7576 20.6133Z" fill="#C4BBB6"/>
      <path d="M68.5502 26.9849C68.4998 27.0184 68.4493 27.052 68.3169 27.0873C67.8184 27.0567 67.402 27.0073 66.9848 26.999C66.7518 26.9944 66.5173 27.058 66.2834 27.0909C65.3827 27.0907 64.482 27.0905 63.5308 27.0487C63.5338 26.6455 63.3526 26.4114 63.0522 26.2069C63.1985 25.912 63.3407 25.6546 63.5304 25.3972C63.94 25.3279 64.3019 25.2585 64.6662 25.1848C64.6686 25.1804 64.6786 25.18 64.6837 25.2217C65.2376 25.5387 65.5627 25.4568 65.8495 24.9748C65.8526 24.9777 65.8473 24.9712 65.8867 24.9695C66.4645 24.7613 66.5615 24.2273 66.822 23.815C66.8235 23.8166 66.8203 23.8136 66.8626 23.81C67.1676 23.7106 67.4303 23.6148 67.7163 23.5156C67.7395 23.5123 67.7865 23.5118 67.7987 23.5331C67.8315 23.5811 67.8577 23.6007 67.8918 23.6467C67.8977 23.7244 67.9011 23.7689 67.9079 23.8476C67.9804 23.9302 68.0495 23.9785 68.1182 24.0273C68.1176 24.0277 68.1186 24.0267 68.1185 24.0647C68.1944 24.1795 68.2703 24.2564 68.3795 24.3394C68.4639 24.41 68.5151 24.4745 68.5646 24.5749C68.6322 24.661 68.7016 24.7113 68.7756 24.7872C68.7801 24.8129 68.7833 24.865 68.7473 24.8818C68.5654 25.2257 68.2074 25.7183 68.3135 25.8486C68.6214 26.2264 68.5102 26.604 68.5502 26.9849Z" fill="#B4B1B2"/>
      <path d="M68.7833 24.8651C68.7833 24.8651 68.7802 24.813 68.7707 24.7544C68.6962 24.6435 68.6313 24.5912 68.5664 24.539C68.5151 24.4745 68.4639 24.4101 68.376 24.3032C68.2657 24.1828 68.1922 24.1048 68.1186 24.0268C68.1186 24.0268 68.1177 24.0278 68.1187 23.9917C68.1211 23.908 68.1225 23.8604 68.1628 23.8176C68.7162 24.3234 69.2272 24.8281 69.7483 25.3227C69.8608 25.4295 70.0097 25.4996 70.1418 25.5867C70.1864 25.4474 70.2691 25.3084 70.2698 25.1689C70.2775 23.7345 70.2719 22.3001 70.2764 20.8596C70.2829 20.8535 70.2961 20.8418 70.2961 20.8418C70.3608 20.8946 70.4256 20.9473 70.4983 21.0324C70.5017 22.6295 70.4996 24.1943 70.488 25.759C70.4869 25.9064 70.4258 26.0532 70.3926 26.2003C70.2362 26.1485 70.0799 26.0966 69.8815 26.0074C69.8062 25.9199 69.7728 25.8698 69.7347 25.786C69.6625 25.7017 69.5951 25.6511 69.5216 25.5655C69.2714 25.3087 69.0274 25.0869 68.7833 24.8651Z" fill="#E3E2E2"/>
      <path d="M69.7394 25.8196C69.7728 25.8698 69.8062 25.9199 69.8423 26.0013C69.6026 26.2468 69.2408 26.3533 69.2395 26.786C69.2393 26.8526 68.8481 26.9181 68.594 26.9845C68.5102 26.6041 68.6214 26.2265 68.3136 25.8487C68.2074 25.7184 68.5654 25.2257 68.7473 24.8818C69.0273 25.0869 69.2714 25.3087 69.5228 25.601C69.6 25.7208 69.6697 25.7702 69.7394 25.8196Z" fill="#B8B8B8"/>
      <path d="M63.0479 26.2446C63.3526 26.4116 63.5338 26.6457 63.4803 27.0491C63.1519 27.0904 62.8236 27.0899 62.4485 27.089C62.3682 26.9722 62.3347 26.8556 62.338 26.7025C62.5992 26.5255 62.8236 26.3851 63.0479 26.2446Z" fill="#B8B8B8"/>
      <path d="M70.7146 21.1205C70.7801 21.0164 70.8446 20.9616 70.9909 20.8374C70.9909 21.4964 70.9935 22.0803 70.9832 22.664C70.9827 22.6936 70.8715 22.7213 70.7696 22.7472C70.7228 22.2196 70.7182 21.6948 70.7146 21.1205Z" fill="#A09995"/>
      <path d="M66.2937 27.1325C66.5173 27.058 66.7518 26.9944 66.9849 26.999C67.4021 27.0073 67.8185 27.0567 68.285 27.0894C68.3149 27.138 68.2942 27.2285 68.2754 27.2282C67.6181 27.2154 66.961 27.1941 66.2937 27.1325Z" fill="#B8B8B8"/>
      <path d="M62.7261 20.6534C62.7723 20.6504 62.8185 20.6474 62.8993 20.6428C65.3438 20.6476 67.7536 20.6539 70.2126 20.6644C70.2686 20.7072 70.2756 20.7459 70.2894 20.8132C70.2961 20.8418 70.2828 20.8535 70.2264 20.8589C67.9038 20.8651 65.6377 20.8659 63.3237 20.8652C63.0693 20.8732 62.8628 20.8827 62.5838 20.8955C62.5838 22.4872 62.5838 24.0197 62.5838 25.503C63.0323 25.148 63.4501 24.7588 63.9301 24.4677C64.1076 24.3601 64.436 24.459 64.6866 24.5081C64.9087 24.5516 65.1538 24.7642 65.3253 24.7099C65.6081 24.6204 65.9849 24.479 65.8929 24.023C66.3395 23.7786 66.7493 23.54 67.1499 23.335C67.0339 23.517 66.9271 23.6653 66.8203 23.8136C66.8203 23.8136 66.8235 23.8166 66.7831 23.8189C66.1654 23.9965 66.1252 24.5725 65.8473 24.9712C65.8473 24.9712 65.8526 24.9777 65.8069 24.9751C65.4003 25.0417 65.0394 25.1109 64.6786 25.18C64.6786 25.18 64.6686 25.1805 64.6597 25.1475C64.2737 24.5891 63.916 24.5264 63.6067 24.9443C63.5067 25.0793 63.4526 25.2467 63.3398 25.4035C63.191 25.5597 63.1002 25.7327 62.9638 25.8583C62.8083 26.0015 62.6122 26.1024 62.4338 26.2216C62.3857 26.0488 62.2971 25.8762 62.2957 25.703C62.2846 24.3012 62.3065 22.899 62.2792 21.4976C62.2715 21.1042 62.3672 20.829 62.7261 20.6534Z" fill="#E3E2E2"/>
      <path d="M62.6816 20.6504C62.3672 20.8291 62.2715 21.1043 62.2792 21.4976C62.3066 22.899 62.2846 24.3013 62.2958 25.7031C62.2972 25.8763 62.3857 26.0488 62.4339 26.2217C62.6123 26.1024 62.8084 26.0015 62.9638 25.8584C63.1002 25.7328 63.191 25.5598 63.366 25.4017C63.4301 25.3957 63.4828 25.3972 63.4828 25.3972C63.3407 25.6546 63.1986 25.912 63.0522 26.207C62.8236 26.385 62.5992 26.5254 62.3348 26.6659C62.2066 26.4366 62.1185 26.2074 62.0012 25.9531C61.9737 24.5971 61.9697 23.266 61.9818 21.935C61.9845 21.6407 62.0434 21.3467 62.0777 21.0527C62.1163 20.723 62.3182 20.6075 62.6816 20.6504Z" fill="#C5C3C5"/>
      <path d="M67.1592 23.3014C66.7493 23.54 66.3395 23.7787 65.8603 24.0184C65.7176 23.5417 65.4247 23.2839 65.0563 23.3209C64.6135 23.3653 64.1666 23.3809 63.7215 23.3808C63.6446 23.3808 63.5678 23.2409 63.5399 23.1687C63.9613 23.172 64.3431 23.2197 64.7024 23.1524C64.887 23.1178 65.128 22.9014 65.1725 22.7257C65.2496 22.421 65.1939 22.084 65.1939 21.868C64.8706 21.7124 64.6534 21.6078 64.4737 21.4959C64.6186 21.1503 64.5831 21.1194 64.2262 21.0673C63.9376 21.0252 63.6562 20.9354 63.3716 20.8667C65.6377 20.8659 67.9038 20.8652 70.22 20.865C70.2719 22.3001 70.2775 23.7346 70.2698 25.169C70.2691 25.3084 70.1864 25.4475 70.1418 25.5867C70.0097 25.4997 69.8608 25.4295 69.7483 25.3227C69.2272 24.8282 68.7162 24.3234 68.1614 23.8174C68.1211 23.8125 68.1216 23.8105 68.1159 23.7764C68.0365 23.6994 67.9629 23.6565 67.8893 23.6135C67.8577 23.6008 67.8316 23.5811 67.7973 23.497C67.7105 23.3937 67.6374 23.3479 67.5236 23.3012C67.375 23.3006 67.2671 23.301 67.1592 23.3014Z" fill="#F2F3F7"/>
      <path d="M63.5305 25.3973C63.4828 25.3972 63.4301 25.3956 63.4039 25.3975C63.4527 25.2468 63.5068 25.0793 63.6067 24.9443C63.916 24.5264 64.2737 24.5891 64.6573 25.1518C64.302 25.2585 63.94 25.328 63.5305 25.3973Z" fill="#A09995"/>
      <path d="M65.8867 24.9696C66.1252 24.5726 66.1654 23.9965 66.7816 23.8174C66.5616 24.2274 66.4645 24.7614 65.8867 24.9696Z" fill="#C5C3C5"/>
      <path d="M64.6837 25.2217C65.0395 25.1108 65.4003 25.0417 65.8038 24.9722C65.5627 25.4568 65.2376 25.5387 64.6837 25.2217Z" fill="#C5C3C5"/>
      <path d="M67.1499 23.3351C67.2671 23.301 67.375 23.3006 67.5305 23.3327C67.6164 23.4164 67.6547 23.4677 67.6931 23.519C67.4303 23.6149 67.1676 23.7107 66.8626 23.8101C66.9271 23.6654 67.0339 23.5171 67.1499 23.3351Z" fill="#C5C3C5"/>
      <path d="M68.1185 24.0647C68.1921 24.1048 68.2657 24.1828 68.3428 24.297C68.2703 24.2564 68.1944 24.1795 68.1185 24.0647Z" fill="#C5C3C5"/>
      <path d="M68.5646 24.575C68.6313 24.5913 68.6962 24.6435 68.7661 24.7287C68.7017 24.7114 68.6323 24.6611 68.5646 24.575Z" fill="#C5C3C5"/>
      <path d="M67.7164 23.5156C67.6548 23.4676 67.6164 23.4162 67.5712 23.3335C67.6374 23.3478 67.7105 23.3935 67.7851 23.4755C67.7866 23.5118 67.7396 23.5123 67.7164 23.5156Z" fill="#E3E2E2"/>
      <path d="M68.1224 23.8128C68.1225 23.8605 68.1211 23.9081 68.1192 23.9913C68.0495 23.9787 67.9804 23.9303 67.944 23.8477C68.0251 23.8125 68.0733 23.8115 68.1216 23.8105C68.1216 23.8105 68.121 23.8126 68.1224 23.8128Z" fill="#C5C3C5"/>
      <path d="M68.1158 23.7764C68.0733 23.8114 68.0251 23.8123 67.9407 23.8133C67.9012 23.7689 67.8978 23.7245 67.8918 23.6467C67.9629 23.6564 68.0365 23.6994 68.1158 23.7764Z" fill="#E3E2E2"/>
      <path d="M69.7347 25.786C69.6697 25.7703 69.6 25.7209 69.529 25.636C69.5951 25.6511 69.6625 25.7018 69.7347 25.786Z" fill="#C5C3C5"/>
      <path d="M63.3237 20.8652C63.6562 20.9354 63.9375 21.0251 64.2262 21.0673C64.5831 21.1194 64.6186 21.1502 64.4304 21.4961C63.3405 21.5679 63.2553 21.6546 63.277 22.5966C63.2782 22.6488 63.2804 22.7011 63.2533 22.7723C63.3109 22.8866 63.3974 22.9819 63.4863 23.0993C63.4886 23.1213 63.4909 23.1655 63.4909 23.1655C63.5677 23.2408 63.6446 23.3808 63.7214 23.3808C64.1666 23.3809 64.6135 23.3653 65.0563 23.3209C65.4247 23.2839 65.7175 23.5417 65.8236 24.0241C65.9849 24.479 65.6081 24.6204 65.3253 24.71C65.1539 24.7643 64.9087 24.5516 64.6866 24.5081C64.4361 24.4591 64.1076 24.3601 63.9301 24.4678C63.4502 24.7589 63.0323 25.1481 62.5839 25.5031C62.5839 24.0198 62.5839 22.4873 62.5839 20.8956C62.8628 20.8827 63.0693 20.8732 63.3237 20.8652Z" fill="#F7F9FB"/>
      <path d="M63.5398 23.1688C63.4909 23.1657 63.4886 23.1214 63.484 23.0657C63.4137 22.9244 63.3479 22.839 63.2822 22.7535C63.2804 22.7012 63.2781 22.649 63.2769 22.5967C63.2553 21.6547 63.3405 21.568 64.3928 21.5034C64.6533 21.6079 64.8705 21.7125 65.1939 21.8681C65.1939 22.0841 65.2496 22.4211 65.1724 22.7258C65.128 22.9015 64.8869 23.1179 64.7024 23.1525C64.3431 23.2198 63.9612 23.1721 63.5398 23.1688ZM64.6695 22.3863C64.7101 22.0641 64.5919 21.8552 64.2347 21.9188C64.0456 21.9525 63.7627 22.046 63.7224 22.1733C63.6714 22.3344 63.8082 22.7161 63.8919 22.7241C64.1565 22.7495 64.5595 22.9861 64.6695 22.3863Z" fill="#C7CBD0"/>
      <path d="M63.2532 22.7722C63.3479 22.8388 63.4137 22.9242 63.4817 23.0434C63.3974 22.9818 63.3109 22.8865 63.2532 22.7722Z" fill="#F2F3F7"/>
      <path d="M64.6677 22.433C64.5595 22.986 64.1565 22.7494 63.8919 22.7241C63.8082 22.7161 63.6714 22.3343 63.7225 22.1732C63.7628 22.046 64.0456 21.9524 64.2347 21.9188C64.592 21.8552 64.7102 22.064 64.6677 22.433Z" fill="#7E828A"/>
      </g>
      <defs>
      <clipPath id="clip0_83_95">
      <rect width="33" height="19" fill="white" transform="translate(7 14)"/>
      </clipPath>
      <clipPath id="clip1_83_95">
      <rect width="33" height="19" fill="white" transform="translate(50 14)"/>
      </clipPath>
      </defs>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="27" y="7" width="37" height="7" fill="#E0E0E0"/>
      <rect x="9" y="27" width="22" height="2" fill="#E0E0E0"/>
      <path d="M10 32H26V34H10V32Z" fill="#E0E0E0"/>
      <rect x="38" y="27" width="22" height="2" fill="#E0E0E0"/>
      <path d="M39 32H55V34H39V32Z" fill="#E0E0E0"/>
      <rect x="67" y="27" width="22" height="2" fill="#E0E0E0"/>
      <path d="M68 32H84V34H68V32Z" fill="#E0E0E0"/>
      <path d="M18.7832 23V19.101H17.8452V18.5935C18.1415 18.5935 18.376 18.569 18.5487 18.52C18.7237 18.4687 18.8509 18.394 18.9302 18.296C19.0119 18.198 19.0585 18.079 19.0702 17.939H19.6512V23H18.7832Z" fill="#E0E0E0"/>
      <path d="M44.2528 23V22.545V22.3105C44.2528 22.0515 44.3007 21.8287 44.3963 21.642C44.492 21.453 44.6192 21.2885 44.7778 21.1485C44.9365 21.0085 45.1103 20.8848 45.2993 20.7775C45.4907 20.6678 45.6797 20.5652 45.8663 20.4695C46.0553 20.3715 46.2292 20.2712 46.3878 20.1685C46.5465 20.0635 46.6737 19.9468 46.7693 19.8185C46.8673 19.6902 46.9163 19.5373 46.9163 19.36C46.9163 19.1337 46.8358 18.9493 46.6748 18.807C46.5162 18.6623 46.3003 18.59 46.0273 18.59C45.738 18.59 45.4988 18.6728 45.3098 18.8385C45.1232 19.0042 45.0123 19.2375 44.9773 19.5385H44.1513C44.156 19.2305 44.2295 18.9505 44.3718 18.6985C44.5142 18.4465 44.7253 18.2458 45.0053 18.0965C45.2853 17.9448 45.6342 17.869 46.0518 17.869C46.4135 17.869 46.725 17.932 46.9863 18.058C47.25 18.1817 47.453 18.3555 47.5953 18.5795C47.74 18.8012 47.8123 19.0602 47.8123 19.3565C47.8123 19.6155 47.7645 19.8372 47.6688 20.0215C47.5755 20.2058 47.4507 20.3657 47.2943 20.501C47.1403 20.634 46.97 20.7518 46.7833 20.8545C46.599 20.9572 46.4135 21.054 46.2268 21.145C46.0425 21.2337 45.8722 21.327 45.7158 21.425C45.5618 21.5207 45.437 21.6303 45.3413 21.754C45.248 21.8777 45.2013 22.0258 45.2013 22.1985V22.272H47.8228V23H44.2528Z" fill="#E0E0E0"/>
      <path d="M75.9146 23.077C75.5342 23.0747 75.2064 23.0093 74.9311 22.881C74.6557 22.7527 74.4411 22.5695 74.2871 22.3315C74.1354 22.0935 74.0561 21.8112 74.0491 21.4845H74.8786C74.9276 21.7855 75.0466 22.0095 75.2356 22.1565C75.4269 22.3012 75.6591 22.3735 75.9321 22.3735C76.1584 22.3735 76.3544 22.3397 76.5201 22.272C76.6857 22.202 76.8129 22.1063 76.9016 21.985C76.9926 21.8637 77.0381 21.7225 77.0381 21.5615C77.0381 21.3912 76.9891 21.2453 76.8911 21.124C76.7954 21.0027 76.6636 20.9093 76.4956 20.844C76.3276 20.7787 76.1386 20.7437 75.9286 20.739L75.4596 20.725V20.032L75.8936 20.0145C76.0942 20.0075 76.2704 19.969 76.4221 19.899C76.5761 19.829 76.6962 19.7368 76.7826 19.6225C76.8689 19.5082 76.9121 19.3798 76.9121 19.2375C76.9121 19.1068 76.8712 18.989 76.7896 18.884C76.7102 18.779 76.5971 18.6973 76.4501 18.639C76.3031 18.5783 76.1292 18.548 75.9286 18.548C75.7582 18.548 75.5984 18.5783 75.4491 18.639C75.2997 18.6997 75.1761 18.7977 75.0781 18.933C74.9824 19.066 74.9299 19.241 74.9206 19.458H74.0946C74.0946 19.1127 74.1774 18.8222 74.3431 18.5865C74.5087 18.3485 74.7304 18.17 75.0081 18.051C75.2881 17.9297 75.5984 17.869 75.9391 17.869C76.3054 17.869 76.6297 17.9192 76.9121 18.0195C77.1967 18.1175 77.4196 18.2657 77.5806 18.464C77.7439 18.6623 77.8256 18.9085 77.8256 19.2025C77.8256 19.4522 77.7497 19.675 77.5981 19.871C77.4464 20.067 77.2072 20.221 76.8806 20.333C77.0836 20.389 77.2656 20.473 77.4266 20.585C77.5876 20.6947 77.7147 20.8323 77.8081 20.998C77.9037 21.1637 77.9516 21.3585 77.9516 21.5825C77.9516 21.8228 77.8991 22.0363 77.7941 22.223C77.6914 22.4097 77.5467 22.5672 77.3601 22.6955C77.1757 22.8215 76.9599 22.9172 76.7126 22.9825C76.4652 23.0455 76.1992 23.077 75.9146 23.077Z" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 95 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_90_5)">
      <path d="M92.7261 3H1.76862C0.791837 3 0 3.79184 0 4.76862V54.2899C0 55.2667 0.791837 56.0585 1.76862 56.0585H92.7261C93.7029 56.0585 94.4947 55.2667 94.4947 54.2899V4.76862C94.4947 3.79184 93.7029 3 92.7261 3Z" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.505319"/>
      <path d="M52.5532 38.5904C53.1113 38.5904 53.5638 38.1379 53.5638 37.5797C53.5638 37.0216 53.1113 36.5691 52.5532 36.5691C51.995 36.5691 51.5425 37.0216 51.5425 37.5797C51.5425 38.1379 51.995 38.5904 52.5532 38.5904Z" fill="#D9D9D9"/>
      <path d="M64.6809 10.2925H27.2872V17.3669H64.6809V10.2925Z" fill="#E0E0E0"/>
      <path d="M33.351 31.5159H11.117V33.5371H33.351V31.5159Z" fill="#E0E0E0"/>
      <path d="M33.351 24.4414H11.117V28.484H33.351V24.4414Z" fill="#E0E0E0"/>
      <path d="M78.8298 24.4414H56.5958V28.484H78.8298V24.4414Z" fill="#E0E0E0"/>
      <path d="M11.117 36.5691H33.351V38.5904H11.117V36.5691Z" fill="#E0E0E0"/>
      <path d="M78.8298 31.5159H56.5958V33.5371H78.8298V31.5159Z" fill="#E0E0E0"/>
      <path d="M56.5958 36.5691H78.8298V38.5904H56.5958V36.5691Z" fill="#E0E0E0"/>
      <path d="M52.5532 33.5371C53.1113 33.5371 53.5638 33.0847 53.5638 32.5265C53.5638 31.9683 53.1113 31.5159 52.5532 31.5159C51.995 31.5159 51.5425 31.9683 51.5425 32.5265C51.5425 33.0847 51.995 33.5371 52.5532 33.5371Z" fill="#D9D9D9"/>
      <path d="M8.01064 34.0213C8.5688 34.0213 9.02128 33.5688 9.02128 33.0106C9.02128 32.4525 8.5688 32 8.01064 32C7.45248 32 7 32.4525 7 33.0106C7 33.5688 7.45248 34.0213 8.01064 34.0213Z" fill="#D9D9D9"/>
      <path d="M8.01064 39.0213C8.5688 39.0213 9.02128 38.5688 9.02128 38.0106C9.02128 37.4525 8.5688 37 8.01064 37C7.45248 37 7 37.4525 7 38.0106C7 38.5688 7.45248 39.0213 8.01064 39.0213Z" fill="#D9D9D9"/>
      </g>
      <defs>
      <clipPath id="clip0_90_5">
      <rect width="95" height="60" fill="white"/>
      </clipPath>
      </defs>
      </svg>
          `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="15" y="16" width="64" height="9" fill="#E0E0E0"/>
      <rect x="27" y="31" width="41" height="3" fill="#E0E0E0"/>
      </svg>`,
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
    icon: `<svg width="96" height="53" viewBox="0 0 96 53" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
    <rect x="8" y="28" width="33" height="6" fill="#E0E0E0"/>
    <rect x="8" y="41" width="26" height="2" fill="#E0E0E0"/>
    <rect x="8" y="45" width="29" height="2" fill="#E0E0E0"/>
    <rect x="8" y="37" width="30" height="2" fill="#E0E0E0"/>
    <path d="M93.8032 8.13365C93.8032 8.31873 93.8032 8.5038 93.6871 8.75324C92.5032 9.181 92.8311 9.62636 93.1078 10.0854C93.2535 10.3271 93.3065 10.5901 93.2607 10.8388C93.201 11.1632 92.885 11.4827 92.8812 11.8047C92.8487 14.4916 92.8908 17.1786 92.8374 19.8653C92.8275 20.363 92.8696 20.9891 92.2259 21.3307C90.7084 22.1359 88.8634 22.8126 86.097 22.8083C73.8709 22.7892 61.6446 22.8 49.4184 22.8C36.4607 22.8 23.5028 22.8156 10.5456 22.7811C8.841 22.7765 7.12081 22.5472 5.44604 22.3602C4.63108 22.2692 3.90429 22.0356 3.13758 21.8665C2.9689 21.7134 2.80023 21.5602 2.57051 21.3085C2.22406 20.0099 3.6402 18.7859 2.21689 17.597C2.0694 17.4738 2.19604 17.2913 2.19604 17.1363C2.19596 12.951 2.20621 8.76581 2.16915 4.58065C2.16703 4.34234 1.77779 4.10465 1.56873 3.86667C1.56873 3.76671 1.56873 3.66675 1.67556 3.51216C2.02449 3.32714 2.26659 3.19674 2.5087 3.06635C3.0448 2.36451 4.00138 1.83101 5.97692 1.6036C8.67667 1.34551 11.1339 1.08423 13.7029 1.19975C14.7334 1.2461 15.7647 1.32729 16.7958 1.32766C38.0484 1.33518 59.3009 1.33396 80.5535 1.3315C81.6788 1.33137 82.8117 1.26299 83.9278 1.29948C86.1788 1.37306 88.4207 1.497 90.6663 1.60016C90.6663 1.60016 90.6667 1.66667 90.6681 1.74888C91.3768 2.25516 92.0507 2.69039 92.8045 3.09896C93.2357 3.33266 93.4431 3.45727 93.1121 3.8228C92.6351 4.34949 92.7437 4.97893 92.6907 5.56597C92.6423 6.10114 92.5873 6.64616 92.7735 7.17159C92.8923 7.50665 93.445 7.81392 93.8032 8.13365ZM31.7639 8.79865C30.6041 8.51504 29.5888 8.13486 28.0243 8.24501C27.0918 8.31066 26.5469 8.35764 26.6606 8.81481C26.8814 9.70301 26.4521 10.418 23.8432 10.4576C23.8432 12.0646 23.8435 13.5952 23.8431 15.1257C23.8427 16.3392 23.8419 16.3388 21.2653 16.7395C21.2263 16.7455 21.2422 16.8153 21.2364 16.8555C23.8955 17.2072 23.9031 17.2131 23.2924 18.3659C23.2582 18.4304 23.2386 18.4967 23.2238 18.5626C23.0795 19.2054 23.6998 19.4261 25.1631 19.2555C25.7139 19.1913 26.2592 19.1032 26.8208 19.0741C28.1263 19.0067 29.1861 19.0968 29.5205 19.7761C29.5949 19.9274 30.3598 20.103 30.8339 20.1185C33.1665 20.1949 35.5077 20.2383 37.8472 20.2524C38.3953 20.2557 39.2655 20.1632 39.4408 20.0053C39.9957 19.5052 40.9799 19.5205 41.8078 19.6427C42.2385 19.7064 42.3934 20.1071 42.6733 20.3554C43.0729 20.71 42.5383 21.3308 44.1826 21.3315C50.7686 21.334 57.3547 21.3383 63.9404 21.3188C64.3427 21.3177 65.0499 21.1331 65.0884 21.0052C65.2459 20.483 65.6575 20.131 67.0141 20.0484C67.2059 20.0368 67.4002 19.7584 67.4343 19.5974C67.6592 18.5346 68.7274 18.1825 71.2067 18.3776C72.8137 18.504 73.0891 18.4022 73.0978 17.6781C73.0992 17.567 73.098 17.4559 73.0981 17.3449C73.0982 16.1025 73.0982 16.1025 75.7709 15.7577C76.0302 14.8413 76.3207 13.9263 76.5359 13.0081C76.6496 12.5231 76.1746 12.1662 74.919 12.1421C73.9242 12.1229 73.6808 11.8973 73.7215 11.5331C73.7463 11.3114 73.7219 11.0889 73.7257 10.8667C73.7329 10.4494 73.5371 10.1492 72.2955 10.1097C70.8323 10.0632 70.0378 9.71085 70.2678 9.0358C70.4078 8.62473 70.1201 8.37232 69.0898 8.16619C68.0303 7.95422 67.2243 7.53772 67.4391 6.9262C67.6985 6.18741 67.9596 5.44504 68.0526 4.70045C68.1431 3.97614 67.3984 3.77977 65.7066 3.90327C64.1786 4.0148 62.6261 4.10788 61.0797 4.12332C57.7885 4.15619 54.4939 4.14515 51.2014 4.12682C50.0847 4.1206 49.1433 4.12308 48.899 4.72867C48.8423 4.86907 48.3063 5.04656 47.9315 5.07764C46.9715 5.15726 45.9563 5.12296 45.0054 5.21395C44.3281 5.27877 43.5726 5.41407 43.1107 5.62181C42.1684 6.04565 41.2458 6.3839 39.752 6.27093C38.9899 6.21329 38.2095 6.17352 37.437 6.17239C36.3023 6.17074 34.8834 6.13355 34.6632 6.74576C34.4346 7.38137 33.6297 7.46293 32.3941 7.39009C32.2558 7.80023 32.1314 8.16912 32.0062 8.62545C32.0056 8.68379 32.0049 8.74214 31.7639 8.79865Z" fill="#F5F5F5"/>
    <path d="M3.14908 21.9129C3.90427 22.0357 4.63107 22.2693 5.44603 22.3603C7.12079 22.5473 8.84099 22.7766 10.5455 22.7811C23.5027 22.8157 36.4607 22.8001 49.4184 22.8001C61.6446 22.8001 73.8709 22.7893 86.097 22.8084C88.8633 22.8127 90.7083 22.136 92.2259 21.3307C92.8696 20.9892 92.8275 20.3631 92.8374 19.8654C92.8908 17.1787 92.8487 14.4916 92.8811 11.8048C92.885 11.4828 93.201 11.1633 93.2607 10.8389C93.3064 10.5902 93.2535 10.3272 93.1078 10.0854C92.8311 9.62644 92.5032 9.18108 93.6869 8.80884C94.0054 9.12806 94.4064 9.45963 94.3746 9.78354C94.2668 10.8838 93.8703 11.9805 93.8315 13.0802C93.7438 15.5661 93.8476 18.0532 93.7569 20.539C93.7433 20.9128 93.2254 21.317 92.7192 21.6454C92.0526 22.078 91.2496 22.4889 90.3435 22.8321C89.8146 23.0324 88.9711 23.1839 88.2676 23.185C75.3133 23.2054 62.3586 23.2095 49.4042 23.1936C45.6563 23.189 41.9087 23.0737 38.1612 23.0767C33.6299 23.0804 29.0986 23.1941 24.5677 23.1905C18.8349 23.1859 13.1021 23.1164 7.36992 23.0635C5.48179 23.0461 4.30627 22.505 3.14908 21.9129Z" fill="#F9F9FA"/>
    <path d="M90.6632 1.54753C88.4206 1.49697 86.1788 1.37303 83.9278 1.29945C82.8116 1.26296 81.6788 1.33133 80.5534 1.33146C59.3009 1.33393 38.0483 1.33515 16.7958 1.32762C15.7647 1.32726 14.7334 1.24606 13.7029 1.19972C11.1339 1.08419 8.67664 1.34548 6.08832 1.59869C6.25119 1.42439 6.48345 1.12715 6.84362 1.09586C8.05502 0.990627 9.31187 0.939703 10.5515 0.939293C34.8852 0.931253 59.2189 0.930252 83.5527 0.939141C85.4715 0.939842 87.3967 0.997946 89.3042 1.0867C89.7854 1.10909 90.2096 1.35288 90.6632 1.54753Z" fill="#F9F9FA"/>
    <path d="M1.56855 3.9292C1.77777 4.10469 2.16701 4.34238 2.16912 4.58069C2.20618 8.76585 2.19593 12.9511 2.19602 17.1363C2.19602 17.2913 2.06938 17.4739 2.21687 17.5971C3.64017 18.7859 2.22403 20.01 2.50896 21.2719C2.19519 20.9723 1.61292 20.6114 1.60901 20.2493C1.5506 14.8302 1.56848 9.41091 1.56855 3.9292Z" fill="#F9F9FA"/>
    <path d="M93.8034 8.07098C93.445 7.81377 92.8922 7.5065 92.7735 7.17144C92.5873 6.64601 92.6422 6.10098 92.6906 5.56582C92.7437 4.97878 92.635 4.34934 93.112 3.82264C93.4431 3.45711 93.2357 3.33251 92.8045 3.09881C92.0506 2.69024 91.3768 2.255 90.6682 1.78198C91.4577 2.09141 92.1959 2.47463 93.0524 2.8019C94.1169 3.20861 93.8981 3.62784 93.7041 4.17024C93.4362 4.91929 93.7578 5.70534 93.7987 6.47582C93.8259 6.98646 93.8038 7.49757 93.8034 8.07098Z" fill="#F9F9FA"/>
    <path d="M2.40208 3.07104C2.26658 3.19672 2.02447 3.32712 1.67569 3.46216C1.81117 3.33646 2.05333 3.20611 2.40208 3.07104Z" fill="#F9F9FA"/>
    <path d="M32.0069 8.53803C32.1313 8.16914 32.2557 7.80025 32.3941 7.39011C33.6297 7.46294 34.4346 7.38139 34.6632 6.74578C34.8834 6.13357 36.3022 6.17076 37.437 6.17241C38.2095 6.17353 38.9899 6.2133 39.752 6.27094C41.2457 6.38392 42.1684 6.04567 43.1107 5.62183C43.5726 5.41409 44.3281 5.27878 45.0054 5.21397C45.9563 5.12298 46.9715 5.15728 47.9314 5.07766C48.3063 5.04658 48.8423 4.86908 48.899 4.72869C49.1433 4.1231 50.0847 4.12062 51.2014 4.12684C54.4939 4.14517 57.7885 4.15621 61.0797 4.12334C62.6261 4.1079 64.1785 4.01482 65.7066 3.90328C67.3984 3.77979 68.1431 3.97616 68.0526 4.70047C67.9596 5.44506 67.6985 6.18743 67.439 6.92621C67.2243 7.53774 68.0302 7.95424 69.0898 8.16621C70.12 8.37234 70.4078 8.62475 70.2677 9.03581C70.0378 9.71087 70.8323 10.0632 72.2955 10.1097C73.5371 10.1492 73.7329 10.4494 73.7257 10.8667C73.7219 11.0889 73.7462 11.3114 73.7215 11.5331C73.6807 11.8973 73.9242 12.1229 74.919 12.1421C76.1746 12.1662 76.6496 12.5231 76.5359 13.0081C76.3207 13.9263 76.0301 14.8414 75.7727 15.7578C73.0982 16.1025 73.0982 16.1025 73.098 17.3449C73.098 17.456 73.0992 17.567 73.0978 17.6781C73.089 18.4023 72.8136 18.5041 71.2067 18.3776C68.7274 18.1825 67.6592 18.5346 67.4343 19.5975C67.4002 19.7584 67.2058 20.0368 67.014 20.0484C65.6574 20.131 65.2458 20.483 65.0884 21.0052C65.0498 21.1331 64.3427 21.3177 63.9403 21.3189C57.3547 21.3384 50.7686 21.334 44.1826 21.3315C42.5383 21.3309 43.0729 20.71 42.6733 20.3554C42.3933 20.1071 42.2385 19.7064 41.8078 19.6428C40.9799 19.5205 39.9956 19.5052 39.4408 20.0053C39.2655 20.1633 38.3952 20.2557 37.8472 20.2524C35.5077 20.2384 33.1665 20.195 30.8338 20.1186C30.3598 20.103 29.5949 19.9274 29.5204 19.7761C29.1861 19.0968 28.1262 19.0067 26.8207 19.0742C26.2591 19.1032 25.7138 19.1913 25.1631 19.2555C23.6998 19.4262 23.0795 19.2054 23.2238 18.5627C23.2385 18.4967 23.2582 18.4304 23.2924 18.3659C23.903 17.2131 23.8955 17.2072 21.2344 16.8555C21.2422 16.8153 21.2263 16.7456 21.2652 16.7395C23.8419 16.3388 23.8427 16.3392 23.843 15.1257C23.8435 13.5952 23.8431 12.0646 23.8431 10.4576C26.4521 10.418 26.8813 9.70303 26.6606 8.81483C26.5469 8.35766 27.0918 8.31068 28.0243 8.24502C29.5888 8.13488 30.6041 8.51505 31.8842 8.85664C32.0037 9.14298 32.0028 9.37136 31.8808 9.61115C31.2926 10.0357 30.8695 10.4472 32.0038 10.863C31.7762 12.1646 32.5287 13.4289 31.4193 14.6499C31.2322 14.8558 31.2621 15.1656 31.4986 15.36C32.2122 15.9463 33.0771 16.4995 33.8941 17.1134C34.3161 17.3742 34.6802 17.6081 35.1465 17.7962C36.6579 18.4058 39.1635 18.2227 40.5343 19.0095C40.7257 19.1193 41.8525 18.9679 42.5133 18.888C43.2471 18.7993 43.9445 18.5487 44.6553 18.5504C49.3905 18.5621 54.1251 18.6189 58.8593 18.6721C59.3679 18.6778 59.8894 18.8109 60.3745 18.7843C61.1131 18.7438 62.1902 18.7022 62.4536 18.5019C62.7644 18.2657 62.4305 17.8525 62.2397 17.5306C62.1383 17.3595 61.7486 17.2194 61.6148 17.0633C62.9981 16.8915 62.2005 16.4423 62.545 16.1266C63.3127 15.6531 64.2736 15.2185 64.57 14.7135C65.1047 13.8025 65.367 12.8528 65.5102 11.9128C65.655 10.963 65.7355 9.99222 65.423 9.05601C65.2312 8.48126 63.6625 8.01483 64.5743 7.30431C64.6416 7.25184 64.1515 7.04843 63.866 6.9415C63.5217 6.81253 63.1438 6.6908 62.7361 6.60327C62.0255 6.45069 61.2809 6.32669 60.5505 6.19071C60.5741 6.26992 60.5976 6.34913 60.6212 6.42834C60.2817 6.64242 59.9423 6.8565 59.4561 7.07C53.3504 7.0691 47.3912 7.05532 41.4327 7.07815C39.984 7.0837 38.5394 7.26067 37.0901 7.26859C34.7801 7.28121 33.2082 7.75872 32.0069 8.53803Z" fill="#F2F2F3"/>
    <path d="M32.0066 8.58173C33.2082 7.75871 34.7801 7.2812 37.0901 7.26857C38.5394 7.26066 39.984 7.08369 41.4327 7.07814C47.3912 7.05531 53.3504 7.06909 59.4774 7.11692C61.1979 7.49302 62.7807 7.83436 63.1411 8.64175C63.3578 9.12742 63.3021 9.63505 63.3687 10.1861C63.3674 10.3815 63.3661 10.5236 63.2757 10.6999C63.0386 11.0778 62.7937 11.4198 62.7601 11.7654C62.6186 13.221 62.5401 14.6776 62.4386 16.1338C62.2005 16.4422 62.9981 16.8915 61.4898 17.0643C60.5078 17.1559 59.7694 17.3308 59.0467 17.3197C50.661 17.1906 42.2414 17.6509 33.8831 17.0655C33.0771 16.4994 32.2122 15.9463 31.4986 15.36C31.2621 15.1656 31.2322 14.8558 31.4193 14.6499C32.5287 13.4289 31.7762 12.1646 32.0041 10.8029C32.0032 10.3202 32.0026 9.95995 32.002 9.59973C32.0028 9.37135 32.0037 9.14297 32.0044 8.85754C32.0049 8.74214 32.0056 8.6838 32.0066 8.58173ZM33.5441 8.5241C33.5514 10.9274 33.5587 13.3308 33.5604 15.8443C33.4751 16.3356 33.7512 16.7355 35.0791 16.8164C36.619 16.9102 38.165 17.0441 39.7112 17.0513C45.6985 17.0793 51.6869 17.0646 57.6749 17.0643C60.62 17.0641 61.7946 16.5702 61.8085 15.3305C61.8125 14.9765 61.8097 14.6224 61.8132 14.1431C61.8176 12.5244 61.7337 10.9044 61.865 9.28764C61.9273 8.52081 60.9611 8.1681 59.456 7.78931C58.9136 7.72804 58.3719 7.6145 57.8289 7.61343C50.8847 7.5997 43.9403 7.59772 36.9962 7.61103C36.5741 7.61184 36.1537 7.76648 35.54 7.86025C35.411 7.86519 35.2819 7.87012 34.9131 7.86685C34.4623 8.04429 34.0114 8.22173 33.5441 8.5241Z" fill="#E3E2E2"/>
    <path d="M33.8941 17.1135C42.2414 17.6509 50.661 17.1906 59.0467 17.3197C59.7694 17.3308 60.5079 17.1559 61.364 17.0664C61.7486 17.2194 62.1383 17.3596 62.2397 17.5306C62.4305 17.8525 62.7644 18.2657 62.4536 18.502C62.1902 18.7023 61.1132 18.7439 60.3745 18.7843C59.8894 18.8109 59.3679 18.6778 58.8593 18.6721C54.1251 18.619 49.3905 18.5621 44.6554 18.5505C43.9446 18.5487 43.2471 18.7994 42.5133 18.8881C41.8525 18.9679 40.7257 19.1193 40.5343 19.0095C39.1635 18.2228 36.6579 18.4058 35.1465 17.7962C34.6802 17.6081 34.3161 17.3743 33.8941 17.1135Z" fill="#EFEFF1"/>
    <path d="M63.3688 10.1328C63.3021 9.63503 63.3579 9.1274 63.1411 8.64173C62.7808 7.83434 61.1979 7.493 59.6241 7.11749C59.9423 6.85647 60.2818 6.64239 60.6212 6.4283C60.5977 6.34909 60.5741 6.26988 60.5506 6.19067C61.2809 6.32666 62.0255 6.45066 62.7362 6.60324C63.1439 6.69077 63.5217 6.8125 63.866 6.94147C64.1515 7.0484 64.6416 7.25181 64.5743 7.30428C63.6625 8.0148 65.2312 8.48123 65.423 9.05597C65.7355 9.99219 65.655 10.963 65.5103 11.9128C65.367 12.8527 65.1048 13.8024 64.57 14.7134C64.2736 15.2185 63.3128 15.6531 62.545 16.1266C62.5401 14.6776 62.6186 13.2209 62.7601 11.7654C62.7937 11.4198 63.0387 11.0778 63.396 10.6989C63.8322 10.559 64.0587 10.4543 64.2853 10.3497C63.9798 10.2774 63.6743 10.2051 63.3688 10.1328Z" fill="#EFEFF1"/>
    <path d="M31.8809 9.61108C32.0026 9.95991 32.0032 10.3201 32.0035 10.7404C30.8695 10.4471 31.2926 10.0356 31.8809 9.61108Z" fill="#F5F5F5"/>
    <path d="M61.8101 14.2683C61.8097 14.6224 61.8125 14.9764 61.8085 15.3305C61.7946 16.5702 60.62 17.064 57.6749 17.0642C51.6869 17.0645 45.6985 17.0793 39.7112 17.0513C38.165 17.044 36.6191 16.9101 35.0791 16.8163C33.7512 16.7354 33.4751 16.3355 33.6734 15.7978C34.4416 16.0694 34.5983 16.6515 36.2138 16.5333C37.305 16.5344 38.2602 16.5351 39.3624 16.5355C42.1297 16.5355 44.7499 16.5357 47.3998 16.5884C49.3411 16.6663 51.2526 16.6932 53.1647 16.7093C53.2195 16.7097 53.2797 16.5954 53.4306 16.5319C53.6707 16.4868 53.8176 16.4444 54.0916 16.4014C54.8308 16.3175 55.9688 16.2348 55.9694 16.1507C55.9731 15.6042 57.0258 15.4697 57.8452 15.2067C58.4141 15.2799 58.869 15.3454 59.3239 15.4109C59.4205 15.2251 59.5981 15.0396 59.6013 14.8535C59.6351 12.877 59.6412 10.9004 59.7562 8.92578C59.9929 8.92915 60.1282 8.9306 60.2606 8.99444C60.2712 9.71975 60.2846 10.3827 60.2812 11.1044C60.4073 12.4821 60.5504 13.801 60.7049 15.2264C61.1662 14.8265 61.4881 14.5474 61.8101 14.2683Z" fill="#C5C3C5"/>
    <path d="M35.7325 7.84957C36.1537 7.76651 36.5742 7.61187 36.9962 7.61106C43.9404 7.59775 50.8848 7.59973 57.8289 7.61346C58.3719 7.61453 58.9137 7.72807 59.4651 7.86719C59.2972 8.10452 59.1201 8.26401 58.8003 8.41833C51.647 8.40511 44.6365 8.39705 37.6584 8.33964C38.3489 8.20364 39.007 8.11699 39.6651 8.03034C39.6541 7.97008 39.643 7.90983 39.632 7.84957C38.3322 7.84957 37.0324 7.84957 35.7325 7.84957Z" fill="#C4BBB6"/>
    <path d="M58.943 8.42355C59.1201 8.26406 59.2972 8.10458 59.539 7.90796C60.9611 8.16818 61.9273 8.52089 61.865 9.28772C61.7337 10.9045 61.8176 12.5245 61.8117 14.2058C61.4881 14.5476 61.1662 14.8267 60.705 15.2266C60.5504 13.8011 60.4074 12.4822 60.4038 11.1081C60.717 11.0166 61.0407 10.9816 61.0422 10.9442C61.072 10.207 61.0643 9.46942 61.0643 8.63695C60.6389 8.79379 60.4512 8.863 60.2634 8.93222C60.1282 8.93076 59.9929 8.92931 59.7328 8.88513C59.4198 8.77573 59.2315 8.70907 59.0237 8.60629C58.9837 8.52129 58.9634 8.47242 58.943 8.42355Z" fill="#B4B1B2"/>
    <path d="M35.6363 7.85496C37.0324 7.84961 38.3322 7.84961 39.632 7.84961C39.643 7.90986 39.654 7.97012 39.665 8.03037C39.007 8.11702 38.3489 8.20367 37.5577 8.34174C37.2902 8.39691 37.1558 8.40066 36.8918 8.40064C35.8349 8.34645 35.2474 8.4923 35.1352 8.90874C35.0352 9.28012 34.8639 9.65145 34.8561 10.0233C34.821 11.7045 34.8326 13.3859 34.7029 15.0549C34.4507 14.8212 34.2161 14.6003 34.2123 14.3786C34.1782 12.385 34.1847 10.3914 34.2038 8.35366C34.5365 8.16477 34.8447 8.01994 35.1528 7.87512C35.2819 7.87018 35.411 7.86525 35.6363 7.85496Z" fill="#A09995"/>
    <path d="M34.1792 8.39771C34.1847 10.3914 34.1782 12.385 34.2123 14.3786C34.2161 14.6003 34.4508 14.8212 34.7879 15.0864C35.2537 15.4199 35.51 15.7095 35.7757 16.0452C35.8828 16.2386 35.9803 16.3858 36.0779 16.5331C34.5983 16.6516 34.4416 16.0695 33.6762 15.7428C33.5587 13.3308 33.5514 10.9275 33.6556 8.46169C33.9045 8.39872 34.0419 8.39821 34.1792 8.39771Z" fill="#B4B1B2"/>
    <path d="M63.3687 10.186C63.6743 10.205 63.9798 10.2773 64.2853 10.3496C64.0587 10.4543 63.8322 10.5589 63.4853 10.6646C63.3662 10.5235 63.3674 10.3814 63.3687 10.186Z" fill="#F2F2F3"/>
    <path d="M34.2038 8.35349C34.0419 8.39806 33.9045 8.39857 33.6638 8.39907C34.0114 8.22163 34.4623 8.04419 35.033 7.87085C34.8447 8.01978 34.5365 8.16461 34.2038 8.35349Z" fill="#C4BBB6"/>
    <path d="M53.9644 16.4019C53.8176 16.4444 53.6707 16.4868 53.2857 16.5313C51.8354 16.4927 50.6242 16.4303 49.4105 16.4198C48.7325 16.4139 48.0503 16.4943 47.3701 16.5359C44.7498 16.5357 42.1296 16.5354 39.3625 16.4826C39.3711 15.9733 38.844 15.6776 37.9701 15.4193C38.3958 15.0467 38.8092 14.7216 39.3613 14.3965C40.5528 14.3089 41.6057 14.2212 42.6654 14.1281C42.6723 14.1227 42.7013 14.1221 42.7162 14.1748C44.3275 14.5752 45.2733 14.4718 46.1078 13.8629C46.1168 13.8665 46.1012 13.8584 46.2159 13.8562C47.8967 13.5932 48.1791 12.9187 48.9367 12.3979C48.9412 12.3999 48.9319 12.3962 49.0549 12.3916C49.9421 12.266 50.7065 12.1449 51.5384 12.0197C51.606 12.0156 51.7426 12.0149 51.7781 12.0418C51.8736 12.1024 51.9497 12.1272 52.049 12.1853C52.0662 12.2835 52.0761 12.3396 52.0957 12.4391C52.3066 12.5434 52.5078 12.6044 52.7074 12.666C52.7059 12.6666 52.7087 12.6653 52.7085 12.7133C52.9292 12.8584 53.1501 12.9554 53.4676 13.0603C53.7131 13.1495 53.8621 13.2309 54.0062 13.3577C54.203 13.4666 54.4048 13.53 54.6199 13.626C54.6332 13.6584 54.6423 13.7242 54.5377 13.7454C54.0085 14.1798 52.9669 14.8021 53.2758 14.9667C54.1713 15.4439 53.8478 15.9209 53.9644 16.4019Z" fill="#B4B1B2"/>
    <path d="M54.6423 13.7244C54.6423 13.7244 54.6332 13.6586 54.6055 13.5845C54.389 13.4445 54.2001 13.3785 54.0112 13.3125C53.8622 13.231 53.7131 13.1496 53.4574 13.0147C53.1367 12.8626 52.9227 12.764 52.7087 12.6655C52.7087 12.6655 52.7059 12.6667 52.7089 12.6211C52.7159 12.5154 52.7199 12.4553 52.8371 12.4012C54.4472 13.0402 55.9337 13.6777 57.4496 14.3024C57.7769 14.4373 58.2099 14.5259 58.5943 14.6359C58.7241 14.46 58.9645 14.2844 58.9667 14.1082C58.989 12.2963 58.9727 10.4843 58.9859 8.66476C59.0047 8.65713 59.0432 8.64233 59.0432 8.64233C59.2315 8.709 59.4198 8.77566 59.6315 8.88313C59.6412 10.9005 59.6351 12.8771 59.6013 14.8536C59.5981 15.0397 59.4205 15.2252 59.3239 15.411C58.869 15.3455 58.4141 15.28 57.8371 15.1673C57.6179 15.0568 57.5209 14.9934 57.41 14.8876C57.2001 14.7812 57.004 14.7172 56.79 14.6091C56.0622 14.2848 55.3523 14.0046 54.6423 13.7244Z" fill="#E3E2E2"/>
    <path d="M57.4238 14.9302C57.5208 14.9935 57.6179 15.0568 57.7231 15.1597C57.0258 15.4698 55.9731 15.6043 55.9694 16.1509C55.9688 16.235 54.8308 16.3177 54.0916 16.4016C53.8478 15.9211 54.1713 15.4441 53.2758 14.9669C52.9669 14.8023 54.0085 14.18 54.5377 13.7456C55.3522 14.0046 56.0622 14.2849 56.7936 14.654C57.0181 14.8054 57.2209 14.8678 57.4238 14.9302Z" fill="#B8B8B8"/>
    <path d="M37.9577 15.4668C38.844 15.6777 39.3711 15.9734 39.2155 16.483C38.2602 16.5352 37.305 16.5345 36.2138 16.5334C35.9803 16.3858 35.8828 16.2385 35.8924 16.0452C36.6523 15.8216 37.305 15.6442 37.9577 15.4668Z" fill="#B8B8B8"/>
    <path d="M60.2607 8.99437C60.4512 8.86277 60.6389 8.79356 61.0643 8.63672C61.0643 9.46919 61.0719 10.2067 61.0422 10.944C61.0407 10.9814 60.717 11.0164 60.4206 11.049C60.2846 10.3826 60.2712 9.71969 60.2607 8.99437Z" fill="#A09995"/>
    <path d="M47.3998 16.5885C48.0504 16.4945 48.7325 16.4141 49.4105 16.42C50.6242 16.4305 51.8354 16.4929 53.1925 16.5342C53.2797 16.5956 53.2195 16.7099 53.1647 16.7094C51.2526 16.6933 49.3411 16.6664 47.3998 16.5885Z" fill="#B8B8B8"/>
    <path d="M37.0214 8.40442C37.1558 8.40067 37.2902 8.39693 37.5253 8.39111C44.6365 8.3971 51.647 8.40516 58.8003 8.41838C58.9634 8.47241 58.9837 8.52128 59.0236 8.60628C59.0432 8.6424 59.0047 8.6572 58.8404 8.66404C52.0838 8.67187 45.4914 8.67287 38.7598 8.67199C38.0199 8.6821 37.4192 8.6941 36.6076 8.71031C36.6076 10.7209 36.6076 12.6567 36.6076 14.5303C37.9122 14.0819 39.1278 13.5903 40.524 13.2226C41.0403 13.0866 41.9958 13.2116 42.7247 13.2736C43.3708 13.3285 44.084 13.5971 44.5826 13.5285C45.4053 13.4154 46.5016 13.2368 46.234 12.6608C47.533 12.3521 48.7253 12.0507 49.8906 11.7918C49.5531 12.0216 49.2425 12.209 48.9319 12.3964C48.9319 12.3964 48.9412 12.4001 48.8237 12.4029C47.0266 12.6273 46.9096 13.3549 46.1012 13.8586C46.1012 13.8586 46.1168 13.8667 45.9837 13.8635C44.8009 13.9476 43.7511 14.0349 42.7013 14.1223C42.7013 14.1223 42.6723 14.1229 42.6464 14.0812C41.5235 13.3759 40.4829 13.2966 39.5831 13.8245C39.2924 13.995 39.135 14.2066 38.8066 14.4046C38.3738 14.6019 38.1097 14.8205 37.7129 14.9791C37.2607 15.16 36.6902 15.2874 36.1712 15.438C36.0311 15.2197 35.7735 15.0017 35.7695 14.7829C35.737 13.0122 35.8009 11.241 35.7213 9.47081C35.6989 8.97391 35.9774 8.62629 37.0214 8.40442Z" fill="#E3E2E2"/>
    <path d="M36.8918 8.40049C35.9774 8.62613 35.699 8.97374 35.7213 9.47065C35.8009 11.2408 35.737 13.0121 35.7695 14.7828C35.7735 15.0015 36.0311 15.2195 36.1712 15.4378C36.6902 15.2872 37.2607 15.1598 37.7129 14.979C38.1097 14.8203 38.3738 14.6018 38.883 14.4021C39.0694 14.3945 39.2227 14.3965 39.2227 14.3965C38.8093 14.7216 38.3959 15.0467 37.9701 15.4193C37.305 15.6441 36.6523 15.8215 35.8829 15.999C35.51 15.7094 35.2537 15.4198 34.9125 15.0987C34.8327 13.3858 34.821 11.7044 34.8561 10.0231C34.8639 9.6513 35.0352 9.27997 35.1352 8.90859C35.2474 8.49214 35.8349 8.34629 36.8918 8.40049Z" fill="#C5C3C5"/>
    <path d="M49.9175 11.7492C48.7253 12.0507 47.533 12.3521 46.139 12.6549C45.7237 12.0527 44.8718 11.7272 43.8 11.7739C42.512 11.83 41.2118 11.8496 39.9169 11.8495C39.6933 11.8495 39.4698 11.6727 39.3886 11.5816C40.6146 11.5857 41.7253 11.646 42.7706 11.5609C43.3075 11.5173 44.0087 11.244 44.1381 11.022C44.3625 10.6371 44.2004 10.2115 44.2004 9.93863C43.2599 9.74199 42.6279 9.60987 42.1052 9.46863C42.5268 9.03197 42.4234 8.99305 41.3853 8.9272C40.5456 8.87395 39.727 8.76056 38.8991 8.67385C45.4914 8.67284 52.0838 8.67184 58.8217 8.67163C58.9727 10.4844 58.989 12.2963 58.9667 14.1082C58.9645 14.2844 58.7241 14.46 58.5943 14.6359C58.2099 14.5259 57.7769 14.4373 57.4495 14.3024C55.9337 13.6777 54.4472 13.0402 52.833 12.4011C52.7157 12.3948 52.7174 12.3922 52.7007 12.3492C52.4698 12.2519 52.2557 12.1977 52.0417 12.1434C51.9497 12.1274 51.8737 12.1026 51.7739 11.9962C51.5215 11.8657 51.3087 11.808 50.9776 11.7489C50.5454 11.7482 50.2315 11.7487 49.9175 11.7492Z" fill="#F2F3F7"/>
    <path d="M39.3613 14.3966C39.2227 14.3966 39.0694 14.3945 38.993 14.3969C39.1351 14.2065 39.2924 13.995 39.5831 13.8244C40.4829 13.2966 41.5235 13.3758 42.6395 14.0866C41.6057 14.2214 40.5528 14.3091 39.3613 14.3966Z" fill="#A09995"/>
    <path d="M46.2159 13.8563C46.9096 13.3548 47.0266 12.6272 48.8192 12.4009C48.1791 12.9189 47.8967 13.5933 46.2159 13.8563Z" fill="#C5C3C5"/>
    <path d="M42.7162 14.1748C43.7511 14.0347 44.8009 13.9474 45.9748 13.8596C45.2733 14.4718 44.3275 14.5752 42.7162 14.1748Z" fill="#C5C3C5"/>
    <path d="M49.8906 11.7916C50.2315 11.7486 50.5454 11.7481 50.9977 11.7886C51.2477 11.8943 51.3593 11.9592 51.4708 12.024C50.7065 12.145 49.9422 12.2661 49.0549 12.3917C49.2425 12.2089 49.5531 12.0215 49.8906 11.7916Z" fill="#C5C3C5"/>
    <path d="M52.7085 12.7134C52.9227 12.764 53.1366 12.8625 53.3608 13.0068C53.1501 12.9555 52.9292 12.8584 52.7085 12.7134Z" fill="#C5C3C5"/>
    <path d="M54.0062 13.3579C54.2001 13.3785 54.3889 13.4445 54.5922 13.5521C54.4048 13.5302 54.203 13.4668 54.0062 13.3579Z" fill="#C5C3C5"/>
    <path d="M51.5384 12.0198C51.3593 11.9591 51.2477 11.8943 51.1161 11.7898C51.3087 11.8078 51.5215 11.8656 51.7384 11.9692C51.7426 12.015 51.606 12.0156 51.5384 12.0198Z" fill="#E3E2E2"/>
    <path d="M52.7198 12.3949C52.7199 12.4552 52.7159 12.5153 52.7104 12.6204C52.5078 12.6044 52.3066 12.5434 52.2008 12.439C52.4366 12.3945 52.577 12.3933 52.7174 12.3921C52.7174 12.3921 52.7157 12.3947 52.7198 12.3949Z" fill="#C5C3C5"/>
    <path d="M52.7007 12.349C52.577 12.3933 52.4366 12.3945 52.1911 12.3957C52.0761 12.3396 52.0663 12.2835 52.049 12.1853C52.2558 12.1975 52.4698 12.2518 52.7007 12.349Z" fill="#E3E2E2"/>
    <path d="M57.4099 14.8875C57.2209 14.8676 57.018 14.8052 56.8115 14.698C57.0039 14.7171 57.2 14.7811 57.4099 14.8875Z" fill="#C5C3C5"/>
    <path d="M38.7599 8.67188C39.727 8.76048 40.5456 8.87387 41.3853 8.92712C42.4235 8.99296 42.5268 9.03188 41.9793 9.46875C38.8087 9.55939 38.561 9.66899 38.6239 10.8588C38.6274 10.9249 38.634 10.9909 38.5549 11.0808C38.7226 11.2251 38.9744 11.3456 39.2329 11.4938C39.2396 11.5217 39.2462 11.5775 39.2462 11.5775C39.4698 11.6726 39.6933 11.8494 39.9169 11.8494C41.2118 11.8495 42.512 11.8299 43.8 11.7738C44.8718 11.7271 45.7237 12.0527 46.0322 12.662C46.5016 13.2367 45.4053 13.4153 44.5827 13.5284C44.084 13.597 43.3708 13.3284 42.7247 13.2734C41.9958 13.2115 41.0404 13.0865 40.524 13.2225C39.1278 13.5902 37.9122 14.0818 36.6076 14.5302C36.6076 12.6566 36.6076 10.7208 36.6076 8.71019C37.4192 8.69399 38.0199 8.68199 38.7599 8.67188Z" fill="#F7F9FB"/>
    <path d="M39.3886 11.5814C39.2462 11.5774 39.2396 11.5216 39.2263 11.4512C39.0218 11.2728 38.8304 11.1648 38.6391 11.0568C38.6339 10.9908 38.6274 10.9248 38.6239 10.8587C38.561 9.66891 38.8087 9.55932 41.87 9.47778C42.6279 9.60971 43.2599 9.74184 44.2004 9.93847C44.2004 10.2113 44.3625 10.637 44.1381 11.0219C44.0087 11.2438 43.3074 11.5171 42.7706 11.5608C41.7253 11.6458 40.6146 11.5855 39.3886 11.5814ZM42.675 10.593C42.7932 10.186 42.4494 9.92218 41.41 10.0025C40.86 10.045 40.0371 10.1632 39.9198 10.3239C39.7714 10.5274 40.1694 11.0096 40.4128 11.0197C41.1826 11.0518 42.3549 11.3506 42.675 10.593Z" fill="#C7CBD0"/>
    <path d="M38.5549 11.0808C38.8304 11.1649 39.0218 11.2728 39.2196 11.4234C38.9744 11.3456 38.7226 11.2251 38.5549 11.0808Z" fill="#F2F3F7"/>
    <path d="M42.6697 10.6521C42.3549 11.3507 41.1826 11.0518 40.4128 11.0198C40.1694 11.0097 39.7714 10.5275 39.9198 10.324C40.0371 10.1633 40.86 10.0451 41.41 10.0026C42.4494 9.92224 42.7932 10.1861 42.6697 10.6521Z" fill="#7E828A"/>
    <g clip-path="url(#clip0_83_193)">
    <path d="M64.1304 8.45583C64.1304 8.62548 64.1304 8.79513 64.0845 9.02378C63.6158 9.4159 63.7456 9.82414 63.8552 10.2449C63.9128 10.4665 63.9338 10.7076 63.9157 10.9356C63.8921 11.2329 63.767 11.5258 63.7654 11.821C63.7526 14.2839 63.7693 16.747 63.7481 19.2098C63.7442 19.6661 63.7609 20.24 63.5061 20.5531C62.9054 21.2912 62.1751 21.9115 61.08 21.9076C56.2406 21.8901 51.401 21.9 46.5614 21.9C41.4323 21.9 36.3032 21.9143 31.1743 21.8826C30.4996 21.8785 29.8186 21.6682 29.1557 21.4968C28.8331 21.4134 28.5454 21.1993 28.2419 21.0443C28.1752 20.9039 28.1084 20.7635 28.0175 20.5328C27.8803 19.3424 28.4409 18.2204 27.8775 17.1306C27.8191 17.0177 27.8693 16.8503 27.8693 16.7082C27.8692 12.8718 27.8733 9.03531 27.8586 5.19891C27.8578 4.98046 27.7037 4.76257 27.6209 4.54443C27.6209 4.4528 27.6209 4.36117 27.6632 4.21946C27.8013 4.04986 27.8972 3.93033 27.993 3.8108C28.2052 3.16745 28.5839 2.6784 29.3659 2.46995C30.4345 2.23336 31.4072 1.99385 32.424 2.09975C32.832 2.14223 33.2402 2.21666 33.6483 2.217C42.0608 2.22389 50.4733 2.22278 58.8857 2.22052C59.3312 2.2204 59.7796 2.15772 60.2214 2.19117C61.1124 2.25862 61.9998 2.37223 62.8887 2.4668C62.8887 2.4668 62.8889 2.52776 62.8894 2.60312C63.17 3.06721 63.4367 3.46617 63.7351 3.84069C63.9058 4.05492 63.9879 4.16914 63.8568 4.50421C63.668 4.98701 63.711 5.564 63.69 6.10212C63.6709 6.59269 63.6491 7.0923 63.7228 7.57394C63.7698 7.88107 63.9886 8.16274 64.1304 8.45583ZM39.5732 9.06541C39.1141 8.80543 38.7122 8.45693 38.0929 8.5579C37.7238 8.61808 37.5081 8.66115 37.5531 9.08023C37.6405 9.8944 37.4706 10.5498 36.4379 10.5861C36.4379 12.0592 36.438 13.4622 36.4379 14.8652C36.4377 15.9776 36.4374 15.9772 35.4175 16.3445C35.4021 16.3501 35.4084 16.414 35.4061 16.4509C36.4586 16.7732 36.4616 16.7787 36.2199 17.8354C36.2064 17.8945 36.1986 17.9553 36.1927 18.0157C36.1356 18.605 36.3812 18.8073 36.9604 18.6509C37.1784 18.592 37.3942 18.5112 37.6165 18.4846C38.1333 18.4228 38.5528 18.5053 38.6852 19.128C38.7146 19.2667 39.0174 19.4277 39.2051 19.442C40.1284 19.512 41.0551 19.5518 41.9812 19.5647C42.1981 19.5677 42.5426 19.4829 42.612 19.3381C42.8316 18.8798 43.2212 18.8937 43.5489 19.0058C43.7194 19.0642 43.7807 19.4315 43.8915 19.6591C44.0497 19.9841 43.8381 20.5533 44.4889 20.5538C47.0959 20.5561 49.7029 20.5601 52.3097 20.5423C52.469 20.5412 52.7489 20.372 52.7642 20.2547C52.8265 19.7761 52.9894 19.4534 53.5264 19.3777C53.6023 19.367 53.6792 19.1119 53.6927 18.9643C53.7818 17.9901 54.2046 17.6673 55.186 17.8461C55.8221 17.962 55.9311 17.8687 55.9346 17.2049C55.9351 17.1031 55.9346 17.0013 55.9346 16.8994C55.9347 15.7606 55.9347 15.7606 56.9926 15.4445C57.0953 14.6045 57.2103 13.7658 57.2955 12.9241C57.3405 12.4795 57.1524 12.1523 56.6554 12.1302C56.2616 12.1127 56.1653 11.9058 56.1814 11.572C56.1912 11.3688 56.1816 11.1648 56.1831 10.9611C56.1859 10.5786 56.1084 10.3034 55.617 10.2672C55.0378 10.2245 54.7233 9.90159 54.8143 9.28279C54.8698 8.90598 54.7559 8.6746 54.348 8.48566C53.9286 8.29135 53.6096 7.90956 53.6946 7.34899C53.7973 6.67178 53.9007 5.99127 53.9375 5.30873C53.9733 4.64478 53.6785 4.46477 53.0089 4.57797C52.404 4.68022 51.7895 4.76554 51.1774 4.77969C49.8746 4.80982 48.5705 4.7997 47.2672 4.7829C46.8252 4.7772 46.4526 4.77947 46.3558 5.3346C46.3334 5.46329 46.1212 5.62599 45.9729 5.65449C45.5929 5.72747 45.191 5.69603 44.8146 5.77944C44.5465 5.83885 44.2475 5.96288 44.0646 6.15331C43.6917 6.54182 43.3264 6.85189 42.7352 6.74833C42.4335 6.69549 42.1246 6.65904 41.8188 6.65801C41.3696 6.65649 40.808 6.6224 40.7208 7.1836C40.6304 7.76624 40.3117 7.841 39.8227 7.77423C39.7679 8.15019 39.7186 8.48834 39.6691 8.90664C39.6689 8.96012 39.6686 9.0136 39.5732 9.06541Z" fill="#F5F5F5"/>
    <path d="M28.2465 21.0868C28.5455 21.1993 28.8331 21.4135 29.1557 21.4969C29.8187 21.6683 30.4996 21.8785 31.1743 21.8827C36.3032 21.9143 41.4324 21.9 46.5615 21.9C51.401 21.9001 56.2406 21.8901 61.0801 21.9076C62.1751 21.9116 62.9054 21.2912 63.5061 20.5531C63.7609 20.24 63.7442 19.6661 63.7481 19.2099C63.7693 16.7471 63.7526 14.284 63.7655 11.821C63.767 11.5258 63.8921 11.233 63.9157 10.9356C63.9338 10.7076 63.9129 10.4665 63.8552 10.2449C63.7457 9.82417 63.6159 9.41593 64.0844 9.07471C64.2105 9.36733 64.3692 9.67127 64.3566 9.96819C64.314 10.9768 64.157 11.9821 64.1416 12.9901C64.1069 15.2688 64.148 17.5487 64.1121 19.8274C64.1067 20.17 63.9017 20.5405 63.7013 20.8416C63.4375 21.2381 63.1196 21.6148 62.761 21.9293C62.5516 22.113 62.2177 22.2518 61.9393 22.2528C56.8115 22.2716 51.6836 22.2753 46.5558 22.2608C45.0723 22.2565 43.5889 22.1509 42.1055 22.1536C40.3118 22.1569 38.5182 22.2612 36.7247 22.2579C34.4555 22.2537 32.1863 22.19 29.9173 22.1415C29.1699 22.1255 28.7046 21.6295 28.2465 21.0868Z" fill="#F9F9FA"/>
    <path d="M62.8875 2.41867C61.9999 2.37232 61.1124 2.25871 60.2214 2.19126C59.7796 2.15782 59.3312 2.22049 58.8858 2.22061C50.4733 2.22287 42.0608 2.22398 33.6483 2.21709C33.2402 2.21675 32.832 2.14233 32.4241 2.09985C31.4072 1.99395 30.4345 2.23346 29.41 2.46556C29.4744 2.3058 29.5664 2.03332 29.7089 2.00464C30.1885 1.90818 30.686 1.8615 31.1766 1.86112C40.8087 1.85375 50.4408 1.85283 60.0729 1.86098C60.8325 1.86162 61.5945 1.91489 62.3496 1.99624C62.5401 2.01677 62.708 2.24024 62.8875 2.41867Z" fill="#F9F9FA"/>
    <path d="M27.6209 4.60181C27.7037 4.76267 27.8578 4.98055 27.8586 5.19901C27.8733 9.0354 27.8692 12.8719 27.8693 16.7083C27.8693 16.8504 27.8191 17.0177 27.8775 17.1307C28.4409 18.2205 27.8803 19.3425 27.9931 20.4993C27.8689 20.2247 27.6384 19.8938 27.6369 19.5619C27.6138 14.5944 27.6209 9.62671 27.6209 4.60181Z" fill="#F9F9FA"/>
    <path d="M64.1305 8.39846C63.9887 8.16268 63.7699 7.88101 63.7229 7.57388C63.6491 7.09224 63.6709 6.59263 63.6901 6.10206C63.7111 5.56394 63.6681 4.98695 63.8569 4.50415C63.9879 4.16908 63.9058 4.05486 63.7351 3.84063C63.4367 3.46612 63.17 3.06715 62.8895 2.63354C63.202 2.91719 63.4942 3.26848 63.8333 3.56847C64.2546 3.94128 64.168 4.32558 64.0912 4.82278C63.9852 5.50941 64.1125 6.22996 64.1287 6.93623C64.1394 7.40431 64.1307 7.87283 64.1305 8.39846Z" fill="#F9F9FA"/>
    <path d="M27.9508 3.81519C27.8972 3.93039 27.8014 4.04992 27.6633 4.17371C27.7169 4.05849 27.8128 3.939 27.9508 3.81519Z" fill="#F9F9FA"/>
    <path d="M39.6694 8.82643C39.7186 8.48827 39.7679 8.15012 39.8226 7.77416C40.3117 7.84093 40.6303 7.76617 40.7208 7.18353C40.808 6.62234 41.3696 6.65643 41.8188 6.65794C42.1246 6.65897 42.4335 6.69543 42.7352 6.74826C43.3264 6.85182 43.6916 6.54176 44.0646 6.15324C44.2475 5.96281 44.5465 5.83878 44.8146 5.77937C45.191 5.69596 45.5929 5.7274 45.9729 5.65442C46.1212 5.62593 46.3334 5.46322 46.3558 5.33453C46.4525 4.7794 46.8252 4.77713 47.2672 4.78283C48.5705 4.79964 49.8746 4.80976 51.1774 4.77963C51.7895 4.76547 52.404 4.68015 53.0088 4.57791C53.6785 4.46471 53.9733 4.64471 53.9375 5.30866C53.9006 5.99121 53.7973 6.67171 53.6946 7.34893C53.6096 7.90949 53.9286 8.29128 54.348 8.48559C54.7558 8.67454 54.8697 8.90592 54.8143 9.28273C54.7233 9.90153 55.0378 10.2245 55.617 10.2672C56.1084 10.3034 56.1859 10.5785 56.1831 10.9611C56.1816 11.1647 56.1912 11.3687 56.1814 11.5719C56.1653 11.9058 56.2616 12.1126 56.6554 12.1301C57.1524 12.1523 57.3405 12.4794 57.2955 12.924C57.2103 13.7657 57.0952 14.6045 56.9934 15.4446C55.9347 15.7605 55.9347 15.7605 55.9346 16.8994C55.9346 17.0012 55.9351 17.103 55.9345 17.2048C55.9311 17.8686 55.8221 17.9619 55.186 17.846C54.2046 17.6672 53.7818 17.99 53.6927 18.9642C53.6792 19.1118 53.6023 19.3669 53.5264 19.3776C52.9894 19.4534 52.8265 19.776 52.7641 20.2547C52.7489 20.3719 52.469 20.5411 52.3097 20.5422C49.7029 20.5601 47.0959 20.556 44.4889 20.5538C43.8381 20.5532 44.0497 19.984 43.8915 19.6591C43.7807 19.4314 43.7194 19.0641 43.5489 19.0058C43.2212 18.8937 42.8316 18.8797 42.612 19.3381C42.5426 19.4829 42.1981 19.5676 41.9812 19.5646C41.0551 19.5517 40.1284 19.5119 39.205 19.4419C39.0174 19.4277 38.7146 19.2667 38.6852 19.128C38.5528 18.5053 38.1333 18.4227 37.6165 18.4845C37.3942 18.5111 37.1784 18.5919 36.9604 18.6508C36.3812 18.8072 36.1356 18.6049 36.1927 18.0157C36.1986 17.9552 36.2064 17.8945 36.2199 17.8353C36.4616 16.7786 36.4586 16.7732 35.4053 16.4507C35.4083 16.414 35.4021 16.35 35.4175 16.3444C36.4374 15.9771 36.4377 15.9775 36.4379 14.8652C36.438 13.4621 36.4379 12.0591 36.4379 10.586C37.4706 10.5498 37.6405 9.89434 37.5531 9.08016C37.5081 8.66109 37.7238 8.61802 38.0929 8.55784C38.7122 8.45687 39.1141 8.80536 39.6208 9.11848C39.6681 9.38097 39.6678 9.59031 39.6195 9.81012C39.3866 10.1993 39.2192 10.5765 39.6682 10.9577C39.5781 12.1508 39.8759 13.3097 39.4368 14.4289C39.3627 14.6177 39.3746 14.9017 39.4682 15.0799C39.7507 15.6174 40.093 16.1244 40.4164 16.6872C40.5834 16.9263 40.7276 17.1406 40.9121 17.313C41.5104 17.8718 42.5022 17.7041 43.0448 18.4252C43.1206 18.5259 43.5666 18.3871 43.8282 18.3139C44.1186 18.2326 44.3947 18.0028 44.6761 18.0045C46.5504 18.0152 48.4245 18.0673 50.2985 18.116C50.4998 18.1212 50.7062 18.2432 50.8982 18.2188C51.1906 18.1817 51.6169 18.1436 51.7212 17.96C51.8442 17.7434 51.712 17.3647 51.6365 17.0696C51.5964 16.9128 51.4421 16.7843 51.3892 16.6413C51.9367 16.4837 51.621 16.072 51.7574 15.7827C52.0613 15.3486 52.4416 14.9502 52.5589 14.4872C52.7706 13.6522 52.8744 12.7816 52.9311 11.92C52.9884 11.0493 53.0203 10.1594 52.8966 9.30124C52.8207 8.77438 52.1997 8.34683 52.5606 7.69551C52.5873 7.64742 52.3933 7.46096 52.2803 7.36294C52.144 7.24472 51.9944 7.13313 51.833 7.0529C51.5517 6.91303 51.257 6.79936 50.9679 6.67471C50.9772 6.74732 50.9866 6.81993 50.9959 6.89254C50.8615 7.08878 50.7271 7.28503 50.5347 7.48073C48.1179 7.47991 45.759 7.46728 43.4004 7.4882C42.827 7.49329 42.2552 7.65551 41.6815 7.66277C40.7671 7.67434 40.1449 8.11206 39.6694 8.82643Z" fill="#F2F2F3"/>
    <path d="M39.6693 8.86667C40.1449 8.11223 40.7671 7.67451 41.6815 7.66294C42.2552 7.65568 42.827 7.49346 43.4005 7.48837C45.759 7.46745 48.1179 7.48008 50.5432 7.52393C51.2242 7.86868 51.8507 8.18158 51.9934 8.92169C52.0792 9.36688 52.0571 9.83221 52.0835 10.3374C52.0829 10.5165 52.0824 10.6467 52.0466 10.8083C51.9528 11.1548 51.8559 11.4682 51.8426 11.7851C51.7865 13.1193 51.7555 14.4545 51.7153 15.7894C51.621 16.0721 51.9368 16.4839 51.3397 16.6424C50.951 16.7263 50.6587 16.8866 50.3727 16.8764C47.0533 16.7581 43.7206 17.18 40.4121 16.6435C40.0931 16.1246 39.7507 15.6176 39.4682 15.0801C39.3746 14.9019 39.3627 14.6179 39.4368 14.4291C39.876 13.3099 39.5781 12.1509 39.6683 10.9028C39.6679 10.4602 39.6677 10.13 39.6675 9.79983C39.6678 9.59049 39.6681 9.38114 39.6684 9.11949C39.6686 9.01371 39.6689 8.96023 39.6693 8.86667ZM40.2779 8.81384C40.2808 11.0169 40.2837 13.2199 40.2843 15.5241C40.2506 15.9743 40.3599 16.3409 40.8855 16.4151C41.4951 16.5011 42.107 16.6238 42.719 16.6305C45.089 16.6561 47.4594 16.6426 49.8297 16.6423C50.9954 16.6422 51.4604 16.1895 51.4659 15.0531C51.4675 14.7285 51.4664 14.404 51.4678 13.9646C51.4695 12.4808 51.4363 10.9958 51.4883 9.51375C51.5129 8.81082 51.1304 8.4875 50.5347 8.14028C50.32 8.08412 50.1056 7.98004 49.8906 7.97906C47.1419 7.96647 44.3931 7.96466 41.6444 7.97686C41.4773 7.9776 41.3109 8.11936 41.0679 8.20531C41.0169 8.20984 40.9658 8.21436 40.8198 8.21136C40.6413 8.37401 40.4629 8.53667 40.2779 8.81384Z" fill="#E3E2E2"/>
    <path d="M40.4164 16.6872C43.7206 17.1798 47.0533 16.7579 50.3727 16.8762C50.6587 16.8864 50.951 16.7261 51.2899 16.644C51.4422 16.7843 51.5964 16.9128 51.6366 17.0696C51.7121 17.3646 51.8442 17.7434 51.7212 17.96C51.617 18.1436 51.1906 18.1817 50.8983 18.2188C50.7063 18.2432 50.4998 18.1212 50.2985 18.1159C48.4246 18.0672 46.5504 18.0151 44.6761 18.0044C44.3947 18.0028 44.1187 18.2326 43.8282 18.3139C43.5666 18.3871 43.1206 18.5259 43.0448 18.4252C42.5022 17.704 41.5104 17.8718 40.9122 17.313C40.7276 17.1406 40.5835 16.9263 40.4164 16.6872Z" fill="#EFEFF1"/>
    <path d="M52.0835 10.2884C52.0571 9.83214 52.0792 9.3668 51.9934 8.92161C51.8507 8.1815 51.2242 7.8686 50.6012 7.52439C50.7272 7.28512 50.8615 7.08888 50.9959 6.89263C50.9866 6.82002 50.9773 6.74741 50.9679 6.6748C51.257 6.79945 51.5518 6.91313 51.8331 7.05299C51.9944 7.13323 52.144 7.24481 52.2803 7.36303C52.3933 7.46106 52.5873 7.64751 52.5607 7.69561C52.1997 8.34692 52.8207 8.77448 52.8966 9.30133C53.0203 10.1595 52.9885 11.0494 52.9311 11.9201C52.8744 12.7817 52.7706 13.6522 52.559 14.4873C52.4416 14.9503 52.0613 15.3487 51.7574 15.7827C51.7555 14.4545 51.7865 13.1192 51.8426 11.785C51.8559 11.4681 51.9528 11.1547 52.0943 10.8074C52.2669 10.6791 52.3566 10.5832 52.4462 10.4872C52.3253 10.4209 52.2044 10.3547 52.0835 10.2884Z" fill="#EFEFF1"/>
    <path d="M39.6195 9.81006C39.6677 10.1298 39.6679 10.46 39.668 10.8453C39.2192 10.5764 39.3867 10.1992 39.6195 9.81006Z" fill="#F5F5F5"/>
    <path d="M51.4665 14.0792C51.4664 14.4037 51.4674 14.7283 51.4659 15.0528C51.4604 16.1892 50.9954 16.6419 49.8297 16.6421C47.4594 16.6424 45.089 16.6559 42.719 16.6302C42.107 16.6236 41.495 16.5009 40.8855 16.4148C40.3599 16.3407 40.2506 15.9741 40.3291 15.4812C40.6331 15.7302 40.6952 16.2637 41.3346 16.1554C41.7665 16.1564 42.1446 16.1571 42.581 16.1575C43.6763 16.1574 44.7135 16.1576 45.7624 16.206C46.5309 16.2773 47.2875 16.302 48.0443 16.3168C48.0661 16.3172 48.0899 16.2124 48.1496 16.1542C48.2446 16.1128 48.3028 16.074 48.4113 16.0346C48.7039 15.9577 49.1543 15.8819 49.1546 15.8048C49.156 15.3037 49.5727 15.1804 49.8971 14.9394C50.1223 15.0065 50.3023 15.0666 50.4824 15.1266C50.5206 14.9563 50.5909 14.7862 50.5922 14.6156C50.6056 12.8038 50.608 10.992 50.6535 9.18188C50.7472 9.18497 50.8007 9.1863 50.8532 9.24482C50.8574 9.90969 50.8627 10.5174 50.8613 11.179C50.9112 12.4418 50.9679 13.6508 51.029 14.9575C51.2116 14.5909 51.3391 14.3351 51.4665 14.0792Z" fill="#C5C3C5"/>
    <path d="M41.1441 8.1954C41.3109 8.11926 41.4773 7.9775 41.6443 7.97676C44.3931 7.96456 47.1419 7.96638 49.8906 7.97896C50.1056 7.97994 50.32 8.08402 50.5383 8.21155C50.4718 8.42911 50.4017 8.5753 50.2751 8.71676C47.4436 8.70464 44.6686 8.69726 41.9065 8.64463C42.1798 8.51996 42.4403 8.44053 42.7008 8.3611C42.6964 8.30587 42.692 8.25064 42.6877 8.1954C42.1732 8.1954 41.6587 8.1954 41.1441 8.1954Z" fill="#C4BBB6"/>
    <path d="M50.3316 8.7214C50.4017 8.57521 50.4718 8.42901 50.5675 8.24878C51.1304 8.48732 51.5129 8.81063 51.4882 9.51356C51.4362 10.9956 51.4695 12.4806 51.4671 14.0218C51.339 14.3351 51.2116 14.591 51.029 14.9575C50.9678 13.6508 50.9112 12.4419 50.9098 11.1822C51.0338 11.0984 51.1619 11.0663 51.1625 11.032C51.1743 10.3562 51.1713 9.68012 51.1713 8.91702C51.0029 9.06079 50.9286 9.12423 50.8543 9.18768C50.8007 9.18635 50.7472 9.18502 50.6442 9.14452C50.5203 9.04424 50.4458 8.98313 50.3635 8.88891C50.3477 8.811 50.3397 8.7662 50.3316 8.7214Z" fill="#B4B1B2"/>
    <path d="M41.106 8.20022C41.6586 8.19531 42.1732 8.19531 42.6877 8.19531C42.692 8.25055 42.6964 8.30578 42.7007 8.36101C42.4403 8.44044 42.1798 8.51987 41.8666 8.64643C41.7607 8.69701 41.7075 8.70044 41.603 8.70043C41.1846 8.65075 40.9521 8.78444 40.9077 9.16619C40.8681 9.50661 40.8003 9.847 40.7972 10.1879C40.7833 11.729 40.7879 13.2703 40.7366 14.8002C40.6367 14.586 40.5439 14.3834 40.5424 14.1802C40.5289 12.3528 40.5314 10.5253 40.539 8.65735C40.6707 8.48421 40.7927 8.35145 40.9147 8.21869C40.9658 8.21417 41.0168 8.20965 41.106 8.20022Z" fill="#A09995"/>
    <path d="M40.5293 8.69775C40.5314 10.5253 40.5289 12.3528 40.5424 14.1802C40.5439 14.3834 40.6368 14.586 40.7702 14.8291C40.9546 15.1348 41.056 15.4003 41.1612 15.708C41.2036 15.8852 41.2422 16.0202 41.2808 16.1552C40.6952 16.2638 40.6331 15.7303 40.3302 15.4308C40.2837 13.2198 40.2808 11.0167 40.322 8.75641C40.4205 8.69868 40.4749 8.69822 40.5293 8.69775Z" fill="#B4B1B2"/>
    <path d="M52.0835 10.3372C52.2044 10.3545 52.3253 10.4208 52.4462 10.4871C52.3566 10.583 52.2669 10.679 52.1296 10.7758C52.0824 10.6465 52.0829 10.5163 52.0835 10.3372Z" fill="#F2F2F3"/>
    <path d="M40.539 8.65751C40.4749 8.69836 40.4205 8.69883 40.3253 8.69929C40.4629 8.53664 40.6413 8.37398 40.8672 8.21509C40.7927 8.35161 40.6707 8.48437 40.539 8.65751Z" fill="#C4BBB6"/>
    <path d="M48.3609 16.0351C48.3028 16.074 48.2446 16.1129 48.0923 16.1537C47.5182 16.1183 47.0387 16.0611 46.5583 16.0515C46.2899 16.0461 46.0199 16.1198 45.7506 16.1579C44.7135 16.1577 43.6763 16.1575 42.581 16.109C42.5844 15.6422 42.3757 15.3711 42.0298 15.1343C42.1984 14.7928 42.362 14.4948 42.5805 14.1968C43.0521 14.1165 43.4689 14.0361 43.8884 13.9508C43.8911 13.9458 43.9026 13.9453 43.9085 13.9936C44.5463 14.3606 44.9207 14.2658 45.251 13.7076C45.2546 13.711 45.2484 13.7035 45.2938 13.7015C45.9591 13.4605 46.0709 12.8422 46.3708 12.3648C46.3725 12.3666 46.3689 12.3631 46.4175 12.359C46.7688 12.2438 47.0713 12.1329 47.4006 12.0181C47.4274 12.0143 47.4815 12.0137 47.4955 12.0383C47.5333 12.0939 47.5634 12.1166 47.6027 12.1699C47.6096 12.2599 47.6135 12.3113 47.6212 12.4025C47.7047 12.4981 47.7843 12.554 47.8634 12.6105C47.8627 12.611 47.8639 12.6099 47.8638 12.6539C47.9512 12.7868 48.0386 12.8758 48.1642 12.9719C48.2614 13.0537 48.3204 13.1283 48.3774 13.2446C48.4553 13.3444 48.5352 13.4025 48.6204 13.4905C48.6256 13.5202 48.6292 13.5805 48.5879 13.5999C48.3784 13.9981 47.9661 14.5686 48.0883 14.7195C48.4428 15.1569 48.3148 15.5941 48.3609 16.0351Z" fill="#B4B1B2"/>
    <path d="M48.6293 13.5806C48.6293 13.5806 48.6257 13.5203 48.6147 13.4524C48.529 13.3241 48.4542 13.2636 48.3794 13.2031C48.3205 13.1284 48.2615 13.0538 48.1602 12.9301C48.0333 12.7907 47.9486 12.7003 47.8639 12.61C47.8639 12.61 47.8628 12.6111 47.8639 12.5693C47.8667 12.4724 47.8683 12.4173 47.9147 12.3678C48.552 12.9535 49.1404 13.5379 49.7405 14.1105C49.87 14.2342 50.0414 14.3154 50.1936 14.4162C50.245 14.255 50.3401 14.094 50.341 13.9325C50.3498 12.2716 50.3434 10.6106 50.3486 8.94268C50.356 8.93569 50.3713 8.92212 50.3713 8.92212C50.4458 8.98323 50.5203 9.04433 50.6041 9.14285C50.608 10.9921 50.6056 12.804 50.5922 14.6158C50.5909 14.7863 50.5206 14.9564 50.4824 15.1267C50.3023 15.0667 50.1223 15.0067 49.8939 14.9033C49.8071 14.802 49.7687 14.744 49.7248 14.647C49.6417 14.5494 49.5641 14.4908 49.4794 14.3917C49.1913 14.0944 48.9103 13.8375 48.6293 13.5806Z" fill="#E3E2E2"/>
    <path d="M49.7302 14.686C49.7687 14.744 49.8071 14.8021 49.8487 14.8963C49.5727 15.1806 49.156 15.3039 49.1545 15.805C49.1543 15.882 48.7038 15.9578 48.4113 16.0348C48.3148 15.5943 48.4428 15.1571 48.0883 14.7196C47.9661 14.5688 48.3784 13.9983 48.5879 13.6001C48.9103 13.8375 49.1913 14.0944 49.4808 14.4328C49.5696 14.5716 49.6499 14.6288 49.7302 14.686Z" fill="#B8B8B8"/>
    <path d="M42.0249 15.178C42.3758 15.3713 42.5844 15.6424 42.5228 16.1095C42.1446 16.1573 41.7665 16.1567 41.3346 16.1557C41.2422 16.0204 41.2036 15.8854 41.2074 15.7082C41.5082 15.5032 41.7666 15.3406 42.0249 15.178Z" fill="#B8B8B8"/>
    <path d="M50.8532 9.24484C50.9286 9.12421 51.0029 9.06076 51.1713 8.91699C51.1713 9.68009 51.1743 10.3562 51.1625 11.032C51.1619 11.0663 51.0338 11.0984 50.9165 11.1283C50.8627 10.5174 50.8574 9.90971 50.8532 9.24484Z" fill="#A09995"/>
    <path d="M45.7624 16.2061C46.0199 16.1199 46.29 16.0462 46.5583 16.0515C47.0388 16.0611 47.5182 16.1184 48.0554 16.1562C48.0899 16.2125 48.0661 16.3173 48.0444 16.3169C47.2875 16.3021 46.5309 16.2774 45.7624 16.2061Z" fill="#B8B8B8"/>
    <path d="M41.6543 8.70385C41.7075 8.70041 41.7607 8.69698 41.8538 8.69165C44.6686 8.69714 47.4436 8.70453 50.2751 8.71664C50.3397 8.76617 50.3477 8.81097 50.3635 8.88889C50.3713 8.922 50.356 8.93557 50.291 8.94183C47.6165 8.94901 45.007 8.94993 42.3424 8.94912C42.0495 8.95839 41.8117 8.96939 41.4905 8.98425C41.4905 10.8273 41.4905 12.6017 41.4905 14.3192C42.0069 13.9082 42.4881 13.4576 43.0407 13.1205C43.2451 12.9958 43.6233 13.1104 43.9119 13.1672C44.1676 13.2176 44.4499 13.4638 44.6473 13.4009C44.9729 13.2972 45.4069 13.1335 45.301 12.6055C45.8152 12.3226 46.2871 12.0463 46.7484 11.8089C46.6148 12.0196 46.4918 12.1914 46.3689 12.3631C46.3689 12.3631 46.3725 12.3666 46.326 12.3692C45.6147 12.5748 45.5684 13.2418 45.2484 13.7035C45.2484 13.7035 45.2546 13.711 45.2019 13.708C44.7337 13.7851 44.3182 13.8652 43.9026 13.9452C43.9026 13.9452 43.8911 13.9458 43.8808 13.9076C43.4364 13.261 43.0245 13.1884 42.6683 13.6723C42.5532 13.8286 42.491 14.0225 42.361 14.204C42.1896 14.3849 42.0851 14.5852 41.928 14.7307C41.749 14.8964 41.5232 15.0132 41.3178 15.1513C41.2623 14.9511 41.1603 14.7514 41.1588 14.5508C41.1459 12.9277 41.1712 11.304 41.1397 9.68137C41.1308 9.22588 41.241 8.90723 41.6543 8.70385Z" fill="#E3E2E2"/>
    <path d="M41.603 8.70061C41.241 8.90745 41.1308 9.22609 41.1397 9.68159C41.1712 11.3042 41.1459 12.9279 41.1587 14.551C41.1603 14.7516 41.2623 14.9514 41.3177 15.1515C41.5232 15.0134 41.749 14.8966 41.928 14.7309C42.0851 14.5855 42.1896 14.3851 42.3912 14.2021C42.4649 14.1951 42.5256 14.1969 42.5256 14.1969C42.362 14.495 42.1983 14.793 42.0298 15.1345C41.7666 15.3406 41.5082 15.5032 41.2036 15.6659C41.056 15.4004 40.9546 15.135 40.8195 14.8406C40.7879 13.2705 40.7833 11.7292 40.7972 10.188C40.8003 9.84719 40.8681 9.5068 40.9077 9.16637C40.9521 8.78463 41.1846 8.65093 41.603 8.70061Z" fill="#C5C3C5"/>
    <path d="M46.759 11.7701C46.2871 12.0464 45.8152 12.3227 45.2633 12.6003C45.099 12.0483 44.7618 11.7499 44.3375 11.7927C43.8277 11.8441 43.313 11.8621 42.8004 11.862C42.7119 11.862 42.6235 11.7 42.5913 11.6165C43.0766 11.6202 43.5163 11.6754 43.93 11.5975C44.1425 11.5575 44.4201 11.3069 44.4713 11.1035C44.5602 10.7507 44.496 10.3605 44.496 10.1104C44.1237 9.93014 43.8735 9.80902 43.6666 9.67955C43.8335 9.27928 43.7926 9.2436 43.3817 9.18325C43.0493 9.13443 42.7253 9.03049 42.3976 8.95101C45.007 8.95008 47.6165 8.94916 50.2836 8.94897C50.3434 10.6107 50.3498 12.2716 50.341 13.9325C50.3401 14.094 50.245 14.255 50.1936 14.4162C50.0414 14.3154 49.87 14.2342 49.7404 14.1105C49.1404 13.5379 48.552 12.9535 47.913 12.3676C47.8666 12.3619 47.8673 12.3595 47.8607 12.3201C47.7693 12.2309 47.6846 12.1812 47.5998 12.1315C47.5634 12.1168 47.5333 12.094 47.4938 11.9965C47.3939 11.8769 47.3097 11.8239 47.1787 11.7698C47.0076 11.7692 46.8833 11.7696 46.759 11.7701Z" fill="#F2F3F7"/>
    <path d="M42.5805 14.1969C42.5256 14.1968 42.465 14.195 42.4348 14.1972C42.491 14.0226 42.5533 13.8287 42.6683 13.6724C43.0245 13.1885 43.4364 13.2611 43.8781 13.9127C43.4689 14.0362 43.0522 14.1166 42.5805 14.1969Z" fill="#A09995"/>
    <path d="M45.2938 13.7016C45.5684 13.2419 45.6147 12.5749 46.3243 12.3674C46.0709 12.8422 45.9591 13.4605 45.2938 13.7016Z" fill="#C5C3C5"/>
    <path d="M43.9085 13.9938C44.3181 13.8654 44.7337 13.7853 45.1983 13.7048C44.9207 14.266 44.5463 14.3608 43.9085 13.9938Z" fill="#C5C3C5"/>
    <path d="M46.7484 11.8089C46.8833 11.7695 47.0075 11.769 47.1866 11.8061C47.2855 11.9031 47.3297 11.9625 47.3738 12.0219C47.0713 12.1329 46.7688 12.2438 46.4175 12.359C46.4918 12.1914 46.6148 12.0196 46.7484 11.8089Z" fill="#C5C3C5"/>
    <path d="M47.8638 12.6541C47.9485 12.7004 48.0332 12.7908 48.122 12.9231C48.0386 12.876 47.9511 12.787 47.8638 12.6541Z" fill="#C5C3C5"/>
    <path d="M48.3774 13.2446C48.4542 13.2635 48.529 13.324 48.6094 13.4226C48.5352 13.4026 48.4553 13.3444 48.3774 13.2446Z" fill="#C5C3C5"/>
    <path d="M47.4006 12.0182C47.3297 11.9626 47.2855 11.9032 47.2334 11.8074C47.3097 11.8239 47.3939 11.8769 47.4798 11.9718C47.4815 12.0138 47.4274 12.0144 47.4006 12.0182Z" fill="#E3E2E2"/>
    <path d="M47.8683 12.3619C47.8683 12.4172 47.8667 12.4723 47.8645 12.5687C47.7843 12.554 47.7047 12.4981 47.6628 12.4024C47.7562 12.3616 47.8117 12.3605 47.8673 12.3594C47.8673 12.3594 47.8666 12.3618 47.8683 12.3619Z" fill="#C5C3C5"/>
    <path d="M47.8607 12.32C47.8117 12.3606 47.7562 12.3617 47.659 12.3628C47.6135 12.3114 47.6096 12.2599 47.6028 12.1699C47.6846 12.1811 47.7693 12.2309 47.8607 12.32Z" fill="#E3E2E2"/>
    <path d="M49.7248 14.6469C49.65 14.6286 49.5697 14.5714 49.4879 14.4731C49.5641 14.4907 49.6417 14.5493 49.7248 14.6469Z" fill="#C5C3C5"/>
    <path d="M42.3424 8.94922C42.7253 9.03044 43.0493 9.13438 43.3817 9.18319C43.7926 9.24355 43.8335 9.27923 43.6168 9.67968C42.3618 9.76277 42.2637 9.86324 42.2886 10.9539C42.29 11.0144 42.2926 11.075 42.2613 11.1574C42.3277 11.2897 42.4274 11.4001 42.5297 11.536C42.5323 11.5615 42.535 11.6127 42.535 11.6127C42.6235 11.6999 42.7119 11.8619 42.8004 11.862C43.313 11.8621 43.8277 11.8441 44.3375 11.7926C44.7618 11.7498 45.099 12.0483 45.2211 12.6068C45.4069 13.1336 44.9729 13.2973 44.6473 13.401C44.4499 13.4639 44.1676 13.2177 43.9119 13.1673C43.6233 13.1105 43.2451 12.9959 43.0408 13.1206C42.4881 13.4577 42.0069 13.9083 41.4905 14.3193C41.4905 12.6018 41.4905 10.8274 41.4905 8.98435C41.8118 8.96949 42.0495 8.95849 42.3424 8.94922Z" fill="#F7F9FB"/>
    <path d="M42.5913 11.6163C42.535 11.6127 42.5323 11.5615 42.5271 11.4969C42.4461 11.3334 42.3704 11.2344 42.2946 11.1355C42.2926 11.0749 42.29 11.0144 42.2886 10.9539C42.2637 9.86319 42.3618 9.76273 43.5735 9.68799C43.8735 9.80892 44.1237 9.93004 44.496 10.1103C44.496 10.3604 44.5602 10.7506 44.4713 11.1034C44.4201 11.3068 44.1425 11.5574 43.93 11.5974C43.5163 11.6753 43.0766 11.6201 42.5913 11.6163ZM43.8922 10.7103C43.939 10.3372 43.8029 10.0954 43.3915 10.169C43.1738 10.208 42.848 10.3163 42.8016 10.4636C42.7429 10.6502 42.9004 11.0922 42.9967 11.1014C43.3014 11.1308 43.7655 11.4048 43.8922 10.7103Z" fill="#C7CBD0"/>
    <path d="M42.2613 11.1575C42.3704 11.2345 42.4461 11.3335 42.5244 11.4715C42.4273 11.4002 42.3277 11.2898 42.2613 11.1575Z" fill="#F2F3F7"/>
    <path d="M43.8901 10.7645C43.7655 11.4049 43.3014 11.1309 42.9967 11.1016C42.9004 11.0923 42.7428 10.6503 42.8016 10.4637C42.848 10.3164 43.1737 10.2081 43.3914 10.1691C43.8029 10.0955 43.939 10.3373 43.8901 10.7645Z" fill="#7E828A"/>
    </g>
    <defs>
    <clipPath id="clip0_83_193">
    <rect width="38" height="22" fill="white" transform="translate(27 1)"/>
    </clipPath>
    </defs>
    </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="6" y="5" width="34" height="5" fill="#E0E0E0"/>
      <rect x="6" y="18" width="39" height="12" fill="#E0E0E0"/>
      <rect x="49" y="18" width="38" height="12" fill="#E0E0E0"/>
      <rect x="6" y="33" width="39" height="12" fill="#E0E0E0"/>
      <rect x="49" y="33" width="38" height="12" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="6" y="5" width="34" height="5" fill="#E0E0E0"/>
      <rect x="6" y="35" width="18" height="2" fill="#E0E0E0"/>
      <rect x="6" y="39" width="13" height="2" fill="#E0E0E0"/>
      <rect x="27" y="16" width="18" height="2" fill="#E0E0E0"/>
      <rect x="27" y="20" width="13" height="2" fill="#E0E0E0"/>
      <path d="M32.2528 31V30.545V30.3105C32.2528 30.0515 32.3007 29.8287 32.3963 29.642C32.492 29.453 32.6192 29.2885 32.7778 29.1485C32.9365 29.0085 33.1103 28.8848 33.2993 28.7775C33.4907 28.6678 33.6797 28.5652 33.8663 28.4695C34.0553 28.3715 34.2292 28.2712 34.3878 28.1685C34.5465 28.0635 34.6737 27.9468 34.7693 27.8185C34.8673 27.6902 34.9163 27.5373 34.9163 27.36C34.9163 27.1337 34.8358 26.9493 34.6748 26.807C34.5162 26.6623 34.3003 26.59 34.0273 26.59C33.738 26.59 33.4988 26.6728 33.3098 26.8385C33.1232 27.0042 33.0123 27.2375 32.9773 27.5385H32.1513C32.156 27.2305 32.2295 26.9505 32.3718 26.6985C32.5142 26.4465 32.7253 26.2458 33.0053 26.0965C33.2853 25.9448 33.6342 25.869 34.0518 25.869C34.4135 25.869 34.725 25.932 34.9863 26.058C35.25 26.1817 35.453 26.3555 35.5953 26.5795C35.74 26.8012 35.8123 27.0602 35.8123 27.3565C35.8123 27.6155 35.7645 27.8372 35.6688 28.0215C35.5755 28.2058 35.4507 28.3657 35.2943 28.501C35.1403 28.634 34.97 28.7518 34.7833 28.8545C34.599 28.9572 34.4135 29.054 34.2268 29.145C34.0425 29.2337 33.8722 29.327 33.7158 29.425C33.5618 29.5207 33.437 29.6303 33.3413 29.754C33.248 29.8777 33.2013 30.0258 33.2013 30.1985V30.272H35.8228V31H32.2528Z" fill="#E0E0E0"/>
      <rect x="69" y="16" width="18" height="2" fill="#E0E0E0"/>
      <rect x="69" y="20" width="13" height="2" fill="#E0E0E0"/>
      <path d="M76.4111 31L76.4146 29.7995H74.0591V29.075L76.3901 25.939H77.2371V29.075H78.0456V29.7995H77.2371V31H76.4111ZM74.8571 29.075H76.4076V26.996L74.8571 29.075Z" fill="#E0E0E0"/>
      <rect x="47" y="35" width="18" height="2" fill="#E0E0E0"/>
      <rect x="47" y="39" width="13" height="2" fill="#E0E0E0"/>
      <path d="M53.9146 31.077C53.5342 31.0747 53.2064 31.0093 52.9311 30.881C52.6557 30.7527 52.4411 30.5695 52.2871 30.3315C52.1354 30.0935 52.0561 29.8112 52.0491 29.4845H52.8786C52.9276 29.7855 53.0466 30.0095 53.2356 30.1565C53.4269 30.3012 53.6591 30.3735 53.9321 30.3735C54.1584 30.3735 54.3544 30.3397 54.5201 30.272C54.6857 30.202 54.8129 30.1063 54.9016 29.985C54.9926 29.8637 55.0381 29.7225 55.0381 29.5615C55.0381 29.3912 54.9891 29.2453 54.8911 29.124C54.7954 29.0027 54.6636 28.9093 54.4956 28.844C54.3276 28.7787 54.1386 28.7437 53.9286 28.739L53.4596 28.725V28.032L53.8936 28.0145C54.0942 28.0075 54.2704 27.969 54.4221 27.899C54.5761 27.829 54.6962 27.7368 54.7826 27.6225C54.8689 27.5082 54.9121 27.3798 54.9121 27.2375C54.9121 27.1068 54.8712 26.989 54.7896 26.884C54.7102 26.779 54.5971 26.6973 54.4501 26.639C54.3031 26.5783 54.1292 26.548 53.9286 26.548C53.7582 26.548 53.5984 26.5783 53.4491 26.639C53.2997 26.6997 53.1761 26.7977 53.0781 26.933C52.9824 27.066 52.9299 27.241 52.9206 27.458H52.0946C52.0946 27.1127 52.1774 26.8222 52.3431 26.5865C52.5087 26.3485 52.7304 26.17 53.0081 26.051C53.2881 25.9297 53.5984 25.869 53.9391 25.869C54.3054 25.869 54.6297 25.9192 54.9121 26.0195C55.1967 26.1175 55.4196 26.2657 55.5806 26.464C55.7439 26.6623 55.8256 26.9085 55.8256 27.2025C55.8256 27.4522 55.7497 27.675 55.5981 27.871C55.4464 28.067 55.2072 28.221 54.8806 28.333C55.0836 28.389 55.2656 28.473 55.4266 28.585C55.5876 28.6947 55.7147 28.8323 55.8081 28.998C55.9037 29.1637 55.9516 29.3585 55.9516 29.5825C55.9516 29.8228 55.8991 30.0363 55.7941 30.223C55.6914 30.4097 55.5467 30.5672 55.3601 30.6955C55.1757 30.8215 54.9599 30.9172 54.7126 30.9825C54.4652 31.0455 54.1992 31.077 53.9146 31.077Z" fill="#E0E0E0"/>
      <path d="M12.7832 31V27.101H11.8452V26.5935C12.1415 26.5935 12.376 26.569 12.5487 26.52C12.7237 26.4687 12.8509 26.394 12.9302 26.296C13.0119 26.198 13.0585 26.079 13.0702 25.939H13.6512V31H12.7832Z" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="6" y="5" width="34" height="5" fill="#E0E0E0"/>
      <rect x="6" y="35" width="18" height="2" fill="#E0E0E0"/>
      <rect x="6" y="39" width="13" height="2" fill="#E0E0E0"/>
      <rect x="37" y="35" width="18" height="2" fill="#E0E0E0"/>
      <rect x="37" y="39" width="13" height="2" fill="#E0E0E0"/>
      <path d="M42.2553 30V29.155V28.7195C42.2553 28.2385 42.3441 27.8247 42.5218 27.478C42.6994 27.127 42.9356 26.8215 43.2303 26.5615C43.5249 26.3015 43.8478 26.0718 44.1988 25.8725C44.5541 25.6688 44.9051 25.4782 45.2518 25.3005C45.6028 25.1185 45.9256 24.9322 46.2203 24.7415C46.5149 24.5465 46.7511 24.3298 46.9288 24.0915C47.1108 23.8532 47.2018 23.5693 47.2018 23.24C47.2018 22.8197 47.0523 22.4773 46.7533 22.213C46.4586 21.9443 46.0578 21.81 45.5508 21.81C45.0134 21.81 44.5693 21.9638 44.2183 22.2715C43.8716 22.5792 43.6658 23.0125 43.6008 23.5715H42.0668C42.0754 22.9995 42.2119 22.4795 42.4763 22.0115C42.7406 21.5435 43.1328 21.1708 43.6528 20.8935C44.1728 20.6118 44.8206 20.471 45.5963 20.471C46.2679 20.471 46.8464 20.588 47.3318 20.822C47.8214 21.0517 48.1984 21.3745 48.4628 21.7905C48.7314 22.2022 48.8658 22.6832 48.8658 23.2335C48.8658 23.7145 48.7769 24.1262 48.5993 24.4685C48.4259 24.8108 48.1941 25.1077 47.9038 25.359C47.6178 25.606 47.3014 25.8248 46.9548 26.0155C46.6124 26.2062 46.2679 26.386 45.9213 26.555C45.5789 26.7197 45.2626 26.893 44.9723 27.075C44.6863 27.2527 44.4544 27.4563 44.2768 27.686C44.1034 27.9157 44.0168 28.1908 44.0168 28.5115V28.648H48.8853V30H42.2553Z" fill="#E0E0E0"/>
      <rect x="68" y="35" width="18" height="2" fill="#E0E0E0"/>
      <rect x="68" y="39" width="13" height="2" fill="#E0E0E0"/>
      <path d="M75.3413 30.143C74.635 30.1387 74.0261 30.0173 73.5148 29.779C73.0035 29.5407 72.6048 29.2005 72.3188 28.7585C72.0371 28.3165 71.8898 27.7922 71.8768 27.1855H73.4173C73.5083 27.7445 73.7293 28.1605 74.0803 28.4335C74.4356 28.7022 74.8668 28.8365 75.3738 28.8365C75.7941 28.8365 76.1581 28.7737 76.4658 28.648C76.7735 28.518 77.0096 28.3403 77.1743 28.115C77.3433 27.8897 77.4278 27.6275 77.4278 27.3285C77.4278 27.0122 77.3368 26.7413 77.1548 26.516C76.9771 26.2907 76.7323 26.1173 76.4203 25.996C76.1083 25.8747 75.7573 25.8097 75.3673 25.801L74.4963 25.775V24.488L75.3023 24.4555C75.675 24.4425 76.0021 24.371 76.2838 24.241C76.5698 24.111 76.793 23.9398 76.9533 23.7275C77.1136 23.5152 77.1938 23.2768 77.1938 23.0125C77.1938 22.7698 77.118 22.551 76.9663 22.356C76.819 22.161 76.6088 22.0093 76.3358 21.901C76.0628 21.7883 75.74 21.732 75.3673 21.732C75.051 21.732 74.7541 21.7883 74.4768 21.901C74.1995 22.0137 73.9698 22.1957 73.7878 22.447C73.6101 22.694 73.5126 23.019 73.4953 23.422H71.9613C71.9613 22.7807 72.1151 22.2412 72.4228 21.8035C72.7305 21.3615 73.1421 21.03 73.6578 20.809C74.1778 20.5837 74.7541 20.471 75.3868 20.471C76.0671 20.471 76.6695 20.5642 77.1938 20.7505C77.7225 20.9325 78.1363 21.2077 78.4353 21.576C78.7386 21.9443 78.8903 22.4015 78.8903 22.9475C78.8903 23.4112 78.7495 23.825 78.4678 24.189C78.1861 24.553 77.742 24.839 77.1353 25.047C77.5123 25.151 77.8503 25.307 78.1493 25.515C78.4483 25.7187 78.6845 25.9743 78.8578 26.282C79.0355 26.5897 79.1243 26.9515 79.1243 27.3675C79.1243 27.8138 79.0268 28.2103 78.8318 28.557C78.6411 28.9037 78.3725 29.1962 78.0258 29.4345C77.6835 29.6685 77.2826 29.8462 76.8233 29.9675C76.364 30.0845 75.87 30.143 75.3413 30.143Z" fill="#E0E0E0"/>
      <path d="M13.0974 30V22.759H11.3554V21.8165C11.9057 21.8165 12.3412 21.771 12.6619 21.68C12.9869 21.5847 13.223 21.446 13.3704 21.264C13.522 21.082 13.6087 20.861 13.6304 20.601H14.7094V30H13.0974Z" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 100 63" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M97.8723 3.57446H2.12766C1.09947 3.57446 0.265961 4.40798 0.265961 5.43616V57.5638C0.265961 58.592 1.09947 59.4255 2.12766 59.4255H97.8723C98.9005 59.4255 99.734 58.592 99.734 57.5638V5.43616C99.734 4.40798 98.9005 3.57446 97.8723 3.57446Z" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.531915"/>
      <path d="M42.5532 8.62769H6.38297V13.9468H42.5532V8.62769Z" fill="#E0E0E0"/>
      <path d="M25.5319 17.1382H6.38297V19.2658H25.5319V17.1382Z" fill="#E0E0E0"/>
      <path d="M20.2128 21.3936H6.38297V23.5212H20.2128V21.3936Z" fill="#E0E0E0"/>
      <path d="M70.2128 25.6489H51.0638V26.7128H70.2128V25.6489Z" fill="#E0E0E0"/>
      <path d="M64.8936 27.7766H51.0638V28.8404H64.8936V27.7766Z" fill="#E0E0E0"/>
      <path d="M78.7234 34.1597H59.5745V35.2235H78.7234V34.1597Z" fill="#E0E0E0"/>
      <path d="M73.4043 36.2874H59.5745V37.3512H73.4043V36.2874Z" fill="#E0E0E0"/>
      <path d="M82.9787 45.8618H63.8298V46.9256H82.9787V45.8618Z" fill="#E0E0E0"/>
      <path d="M77.6596 47.9893H63.8298V49.0531H77.6596V47.9893Z" fill="#E0E0E0"/>
      <path d="M42.5 24L57.6554 50.25H27.3446L42.5 24Z" fill="#D9D9D9"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="30" y="7" width="34" height="5" fill="#E0E0E0"/>
      <rect x="36" y="15" width="21" height="2" fill="#E0E0E0"/>
      <rect x="40" y="19" width="13" height="2" fill="#E0E0E0"/>
      <rect x="30" y="27" width="34" height="5" fill="#E0E0E0"/>
      <rect x="36" y="35" width="21" height="2" fill="#E0E0E0"/>
      <rect x="40" y="39" width="13" height="2" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="96" height="53" viewBox="0 0 96 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="32" y="4" width="34" height="4" fill="#E0E0E0"/>
      <rect x="11" y="17" width="21" height="1" fill="#E0E0E0"/>
      <rect x="11" y="19" width="13" height="1" fill="#E0E0E0"/>
      <rect x="11" y="23" width="21" height="1" fill="#E0E0E0"/>
      <rect x="11" y="25" width="13" height="1" fill="#E0E0E0"/>
      <rect x="11" y="11" width="21" height="1" fill="#E0E0E0"/>
      <rect x="11" y="13" width="13" height="1" fill="#E0E0E0"/>
      <rect x="60" y="17" width="21" height="1" fill="#E0E0E0"/>
      <rect x="60" y="19" width="13" height="1" fill="#E0E0E0"/>
      <rect x="60" y="23" width="21" height="1" fill="#E0E0E0"/>
      <rect x="60" y="25" width="13" height="1" fill="#E0E0E0"/>
      <rect x="60" y="11" width="21" height="1" fill="#E0E0E0"/>
      <rect x="60" y="13" width="13" height="1" fill="#E0E0E0"/>
      <path d="M93.8032 37.1337C93.8032 37.3187 93.8032 37.5038 93.6871 37.7532C92.5032 38.181 92.8311 38.6264 93.1078 39.0854C93.2535 39.3271 93.3065 39.5901 93.2607 39.8388C93.201 40.1632 92.885 40.4827 92.8812 40.8047C92.8487 43.4916 92.8908 46.1786 92.8374 48.8653C92.8275 49.363 92.8696 49.9891 92.2259 50.3307C90.7084 51.1359 88.8634 51.8126 86.097 51.8083C73.8709 51.7892 61.6446 51.8 49.4184 51.8C36.4607 51.8 23.5028 51.8156 10.5456 51.7811C8.841 51.7765 7.12081 51.5472 5.44604 51.3602C4.63108 51.2692 3.90429 51.0356 3.13758 50.8665C2.9689 50.7134 2.80023 50.5602 2.57051 50.3085C2.22406 49.0099 3.6402 47.7859 2.21689 46.597C2.0694 46.4738 2.19604 46.2913 2.19604 46.1363C2.19596 41.951 2.20621 37.7658 2.16915 33.5806C2.16703 33.3423 1.77779 33.1046 1.56873 32.8667C1.56873 32.7667 1.56873 32.6668 1.67556 32.5122C2.02449 32.3271 2.26659 32.1967 2.5087 32.0664C3.0448 31.3645 4.00138 30.831 5.97692 30.6036C8.67667 30.3455 11.1339 30.0842 13.7029 30.1998C14.7334 30.2461 15.7647 30.3273 16.7958 30.3277C38.0484 30.3352 59.3009 30.334 80.5535 30.3315C81.6788 30.3314 82.8117 30.263 83.9278 30.2995C86.1788 30.3731 88.4207 30.497 90.6663 30.6002C90.6663 30.6002 90.6667 30.6667 90.6681 30.7489C91.3768 31.2552 92.0507 31.6904 92.8045 32.099C93.2357 32.3327 93.4431 32.4573 93.1121 32.8228C92.6351 33.3495 92.7437 33.9789 92.6907 34.566C92.6423 35.1011 92.5873 35.6462 92.7735 36.1716C92.8923 36.5066 93.445 36.8139 93.8032 37.1337ZM31.7639 37.7986C30.6041 37.515 29.5888 37.1349 28.0243 37.245C27.0918 37.3107 26.5469 37.3576 26.6606 37.8148C26.8814 38.703 26.4521 39.418 23.8432 39.4576C23.8432 41.0646 23.8435 42.5952 23.8431 44.1257C23.8427 45.3392 23.8419 45.3388 21.2653 45.7395C21.2263 45.7455 21.2422 45.8153 21.2364 45.8555C23.8955 46.2072 23.9031 46.2131 23.2924 47.3659C23.2582 47.4304 23.2386 47.4967 23.2238 47.5626C23.0795 48.2054 23.6998 48.4261 25.1631 48.2555C25.7139 48.1913 26.2592 48.1032 26.8208 48.0741C28.1263 48.0067 29.1861 48.0968 29.5205 48.7761C29.5949 48.9274 30.3598 49.103 30.8339 49.1185C33.1665 49.1949 35.5077 49.2383 37.8472 49.2524C38.3953 49.2557 39.2655 49.1632 39.4408 49.0053C39.9957 48.5052 40.9799 48.5205 41.8078 48.6427C42.2385 48.7064 42.3934 49.1071 42.6733 49.3554C43.0729 49.71 42.5383 50.3308 44.1826 50.3315C50.7686 50.334 57.3547 50.3383 63.9404 50.3188C64.3427 50.3177 65.0499 50.1331 65.0884 50.0052C65.2459 49.483 65.6575 49.131 67.0141 49.0484C67.2059 49.0368 67.4002 48.7584 67.4343 48.5974C67.6592 47.5346 68.7274 47.1825 71.2067 47.3776C72.8137 47.504 73.0891 47.4022 73.0978 46.6781C73.0992 46.567 73.098 46.4559 73.0981 46.3449C73.0982 45.1025 73.0982 45.1025 75.7709 44.7577C76.0302 43.8413 76.3207 42.9263 76.5359 42.0081C76.6496 41.5231 76.1746 41.1662 74.919 41.1421C73.9242 41.1229 73.6808 40.8973 73.7215 40.5331C73.7463 40.3114 73.7219 40.0889 73.7257 39.8667C73.7329 39.4494 73.5371 39.1492 72.2955 39.1097C70.8323 39.0632 70.0378 38.7109 70.2678 38.0358C70.4078 37.6247 70.1201 37.3723 69.0898 37.1662C68.0303 36.9542 67.2243 36.5377 67.4391 35.9262C67.6985 35.1874 67.9596 34.445 68.0526 33.7005C68.1431 32.9761 67.3984 32.7798 65.7066 32.9033C64.1786 33.0148 62.6261 33.1079 61.0797 33.1233C57.7885 33.1562 54.4939 33.1452 51.2014 33.1268C50.0847 33.1206 49.1433 33.1231 48.899 33.7287C48.8423 33.8691 48.3063 34.0466 47.9315 34.0776C46.9715 34.1573 45.9563 34.123 45.0054 34.214C44.3281 34.2788 43.5726 34.4141 43.1107 34.6218C42.1684 35.0456 41.2458 35.3839 39.752 35.2709C38.9899 35.2133 38.2095 35.1735 37.437 35.1724C36.3023 35.1707 34.8834 35.1336 34.6632 35.7458C34.4346 36.3814 33.6297 36.4629 32.3941 36.3901C32.2558 36.8002 32.1314 37.1691 32.0062 37.6254C32.0056 37.6838 32.0049 37.7421 31.7639 37.7986Z" fill="#F5F5F5"/>
      <path d="M3.14908 50.9129C3.90427 51.0357 4.63107 51.2693 5.44603 51.3603C7.12079 51.5473 8.84099 51.7766 10.5455 51.7811C23.5027 51.8157 36.4607 51.8001 49.4184 51.8001C61.6446 51.8001 73.8709 51.7893 86.097 51.8084C88.8633 51.8127 90.7083 51.136 92.2259 50.3307C92.8696 49.9892 92.8275 49.3631 92.8374 48.8654C92.8908 46.1787 92.8487 43.4916 92.8811 40.8048C92.885 40.4828 93.201 40.1633 93.2607 39.8389C93.3064 39.5902 93.2535 39.3272 93.1078 39.0854C92.8311 38.6264 92.5032 38.1811 93.6869 37.8088C94.0054 38.1281 94.4064 38.4596 94.3746 38.7835C94.2668 39.8838 93.8703 40.9805 93.8315 42.0802C93.7438 44.5661 93.8476 47.0532 93.7569 49.539C93.7433 49.9128 93.2254 50.317 92.7192 50.6454C92.0526 51.078 91.2496 51.4889 90.3435 51.8321C89.8146 52.0324 88.9711 52.1839 88.2676 52.185C75.3133 52.2054 62.3586 52.2095 49.4042 52.1936C45.6563 52.189 41.9087 52.0737 38.1612 52.0767C33.6299 52.0804 29.0986 52.1941 24.5677 52.1905C18.8349 52.1859 13.1021 52.1164 7.36992 52.0635C5.48179 52.0461 4.30627 51.505 3.14908 50.9129Z" fill="#F9F9FA"/>
      <path d="M90.6632 30.5475C88.4206 30.497 86.1788 30.373 83.9278 30.2994C82.8116 30.263 81.6788 30.3313 80.5534 30.3315C59.3009 30.3339 38.0483 30.3351 16.7958 30.3276C15.7647 30.3273 14.7334 30.2461 13.7029 30.1997C11.1339 30.0842 8.67664 30.3455 6.08832 30.5987C6.25119 30.4244 6.48345 30.1271 6.84362 30.0959C8.05502 29.9906 9.31187 29.9397 10.5515 29.9393C34.8852 29.9313 59.2189 29.9303 83.5527 29.9391C85.4715 29.9398 87.3967 29.9979 89.3042 30.0867C89.7854 30.1091 90.2096 30.3529 90.6632 30.5475Z" fill="#F9F9FA"/>
      <path d="M1.56855 32.9292C1.77777 33.1047 2.16701 33.3424 2.16912 33.5807C2.20618 37.7659 2.19593 41.9511 2.19602 46.1363C2.19602 46.2913 2.06938 46.4739 2.21687 46.5971C3.64017 47.7859 2.22403 49.01 2.50896 50.2719C2.19519 49.9723 1.61292 49.6114 1.60901 49.2493C1.5506 43.8302 1.56848 38.4109 1.56855 32.9292Z" fill="#F9F9FA"/>
      <path d="M93.8034 37.071C93.445 36.8138 92.8922 36.5065 92.7735 36.1714C92.5873 35.646 92.6422 35.101 92.6906 34.5658C92.7437 33.9788 92.635 33.3493 93.112 32.8226C93.4431 32.4571 93.2357 32.3325 92.8045 32.0988C92.0506 31.6902 91.3768 31.255 90.6682 30.782C91.4577 31.0914 92.1959 31.4746 93.0524 31.8019C94.1169 32.2086 93.8981 32.6278 93.7041 33.1702C93.4362 33.9193 93.7578 34.7053 93.7987 35.4758C93.8259 35.9865 93.8038 36.4976 93.8034 37.071Z" fill="#F9F9FA"/>
      <path d="M2.40208 32.071C2.26658 32.1967 2.02447 32.3271 1.67569 32.4622C1.81117 32.3365 2.05333 32.2061 2.40208 32.071Z" fill="#F9F9FA"/>
      <path d="M32.0069 37.538C32.1313 37.1691 32.2557 36.8002 32.3941 36.3901C33.6297 36.4629 34.4346 36.3814 34.6632 35.7458C34.8834 35.1336 36.3022 35.1708 37.437 35.1724C38.2095 35.1735 38.9899 35.2133 39.752 35.2709C41.2457 35.3839 42.1684 35.0457 43.1107 34.6218C43.5726 34.4141 44.3281 34.2788 45.0054 34.214C45.9563 34.123 46.9715 34.1573 47.9314 34.0777C48.3063 34.0466 48.8423 33.8691 48.899 33.7287C49.1433 33.1231 50.0847 33.1206 51.2014 33.1268C54.4939 33.1452 57.7885 33.1562 61.0797 33.1233C62.6261 33.1079 64.1785 33.0148 65.7066 32.9033C67.3984 32.7798 68.1431 32.9762 68.0526 33.7005C67.9596 34.4451 67.6985 35.1874 67.439 35.9262C67.2243 36.5377 68.0302 36.9542 69.0898 37.1662C70.12 37.3723 70.4078 37.6247 70.2677 38.0358C70.0378 38.7109 70.8323 39.0632 72.2955 39.1097C73.5371 39.1492 73.7329 39.4494 73.7257 39.8667C73.7219 40.0889 73.7462 40.3114 73.7215 40.5331C73.6807 40.8973 73.9242 41.1229 74.919 41.1421C76.1746 41.1662 76.6496 41.5231 76.5359 42.0081C76.3207 42.9263 76.0301 43.8414 75.7727 44.7578C73.0982 45.1025 73.0982 45.1025 73.098 46.3449C73.098 46.456 73.0992 46.567 73.0978 46.6781C73.089 47.4023 72.8136 47.5041 71.2067 47.3776C68.7274 47.1825 67.6592 47.5346 67.4343 48.5975C67.4002 48.7584 67.2058 49.0368 67.014 49.0484C65.6574 49.131 65.2458 49.483 65.0884 50.0052C65.0498 50.1331 64.3427 50.3177 63.9403 50.3189C57.3547 50.3384 50.7686 50.334 44.1826 50.3315C42.5383 50.3309 43.0729 49.71 42.6733 49.3554C42.3933 49.1071 42.2385 48.7064 41.8078 48.6428C40.9799 48.5205 39.9956 48.5052 39.4408 49.0053C39.2655 49.1633 38.3952 49.2557 37.8472 49.2524C35.5077 49.2384 33.1665 49.195 30.8338 49.1186C30.3598 49.103 29.5949 48.9274 29.5204 48.7761C29.1861 48.0968 28.1262 48.0067 26.8207 48.0742C26.2591 48.1032 25.7138 48.1913 25.1631 48.2555C23.6998 48.4262 23.0795 48.2054 23.2238 47.5627C23.2385 47.4967 23.2582 47.4304 23.2924 47.3659C23.903 46.2131 23.8955 46.2072 21.2344 45.8555C21.2422 45.8153 21.2263 45.7456 21.2652 45.7395C23.8419 45.3388 23.8427 45.3392 23.843 44.1257C23.8435 42.5952 23.8431 41.0646 23.8431 39.4576C26.4521 39.418 26.8813 38.703 26.6606 37.8148C26.5469 37.3577 27.0918 37.3107 28.0243 37.245C29.5888 37.1349 30.6041 37.5151 31.8842 37.8566C32.0037 38.143 32.0028 38.3714 31.8808 38.6111C31.2926 39.0357 30.8695 39.4472 32.0038 39.863C31.7762 41.1646 32.5287 42.4289 31.4193 43.6499C31.2322 43.8558 31.2621 44.1656 31.4986 44.36C32.2122 44.9463 33.0771 45.4995 33.8941 46.1134C34.3161 46.3742 34.6802 46.6081 35.1465 46.7962C36.6579 47.4058 39.1635 47.2227 40.5343 48.0095C40.7257 48.1193 41.8525 47.9679 42.5133 47.888C43.2471 47.7993 43.9445 47.5487 44.6553 47.5504C49.3905 47.5621 54.1251 47.6189 58.8593 47.6721C59.3679 47.6778 59.8894 47.8109 60.3745 47.7843C61.1131 47.7438 62.1902 47.7022 62.4536 47.5019C62.7644 47.2657 62.4305 46.8525 62.2397 46.5306C62.1383 46.3595 61.7486 46.2194 61.6148 46.0633C62.9981 45.8915 62.2005 45.4423 62.545 45.1266C63.3127 44.6531 64.2736 44.2185 64.57 43.7135C65.1047 42.8025 65.367 41.8528 65.5102 40.9128C65.655 39.963 65.7355 38.9922 65.423 38.056C65.2312 37.4813 63.6625 37.0148 64.5743 36.3043C64.6416 36.2518 64.1515 36.0484 63.866 35.9415C63.5217 35.8125 63.1438 35.6908 62.7361 35.6033C62.0255 35.4507 61.2809 35.3267 60.5505 35.1907C60.5741 35.2699 60.5976 35.3491 60.6212 35.4283C60.2817 35.6424 59.9423 35.8565 59.4561 36.07C53.3504 36.0691 47.3912 36.0553 41.4327 36.0781C39.984 36.0837 38.5394 36.2607 37.0901 36.2686C34.7801 36.2812 33.2082 36.7587 32.0069 37.538Z" fill="#F2F2F3"/>
      <path d="M32.0066 37.5817C33.2082 36.7587 34.7801 36.2812 37.0901 36.2686C38.5394 36.2607 39.984 36.0837 41.4327 36.0781C47.3912 36.0553 53.3504 36.0691 59.4774 36.1169C61.1979 36.493 62.7807 36.8344 63.1411 37.6417C63.3578 38.1274 63.3021 38.6351 63.3687 39.1861C63.3674 39.3815 63.3661 39.5236 63.2757 39.6999C63.0386 40.0778 62.7937 40.4198 62.7601 40.7654C62.6186 42.221 62.5401 43.6776 62.4386 45.1338C62.2005 45.4422 62.9981 45.8915 61.4898 46.0643C60.5078 46.1559 59.7694 46.3308 59.0467 46.3197C50.661 46.1906 42.2414 46.6509 33.8831 46.0655C33.0771 45.4994 32.2122 44.9463 31.4986 44.36C31.2621 44.1656 31.2322 43.8558 31.4193 43.6499C32.5287 42.4289 31.7762 41.1646 32.0041 39.8029C32.0032 39.3202 32.0026 38.96 32.002 38.5997C32.0028 38.3713 32.0037 38.143 32.0044 37.8575C32.0049 37.7421 32.0056 37.6838 32.0066 37.5817ZM33.5441 37.5241C33.5514 39.9274 33.5587 42.3308 33.5604 44.8443C33.4751 45.3356 33.7512 45.7355 35.0791 45.8164C36.619 45.9102 38.165 46.0441 39.7112 46.0513C45.6985 46.0793 51.6869 46.0646 57.6749 46.0643C60.62 46.0641 61.7946 45.5702 61.8085 44.3305C61.8125 43.9765 61.8097 43.6224 61.8132 43.1431C61.8176 41.5244 61.7337 39.9044 61.865 38.2876C61.9273 37.5208 60.9611 37.1681 59.456 36.7893C58.9136 36.728 58.3719 36.6145 57.8289 36.6134C50.8847 36.5997 43.9403 36.5977 36.9962 36.611C36.5741 36.6118 36.1537 36.7665 35.54 36.8603C35.411 36.8652 35.2819 36.8701 34.9131 36.8668C34.4623 37.0443 34.0114 37.2217 33.5441 37.5241Z" fill="#E3E2E2"/>
      <path d="M33.8941 46.1135C42.2414 46.6509 50.661 46.1906 59.0467 46.3197C59.7694 46.3308 60.5079 46.1559 61.364 46.0664C61.7486 46.2194 62.1383 46.3596 62.2397 46.5306C62.4305 46.8525 62.7644 47.2657 62.4536 47.502C62.1902 47.7023 61.1132 47.7439 60.3745 47.7843C59.8894 47.8109 59.3679 47.6778 58.8593 47.6721C54.1251 47.619 49.3905 47.5621 44.6554 47.5505C43.9446 47.5487 43.2471 47.7994 42.5133 47.8881C41.8525 47.9679 40.7257 48.1193 40.5343 48.0095C39.1635 47.2228 36.6579 47.4058 35.1465 46.7962C34.6802 46.6081 34.3161 46.3743 33.8941 46.1135Z" fill="#EFEFF1"/>
      <path d="M63.3688 39.1328C63.3021 38.635 63.3579 38.1274 63.1411 37.6417C62.7808 36.8343 61.1979 36.493 59.6241 36.1175C59.9423 35.8565 60.2818 35.6424 60.6212 35.4283C60.5977 35.3491 60.5741 35.2699 60.5506 35.1907C61.2809 35.3267 62.0255 35.4507 62.7362 35.6032C63.1439 35.6908 63.5217 35.8125 63.866 35.9415C64.1515 36.0484 64.6416 36.2518 64.5743 36.3043C63.6625 37.0148 65.2312 37.4812 65.423 38.056C65.7355 38.9922 65.655 39.963 65.5103 40.9128C65.367 41.8527 65.1048 42.8024 64.57 43.7134C64.2736 44.2185 63.3128 44.6531 62.545 45.1266C62.5401 43.6776 62.6186 42.2209 62.7601 40.7654C62.7937 40.4198 63.0387 40.0778 63.396 39.6989C63.8322 39.559 64.0587 39.4543 64.2853 39.3497C63.9798 39.2774 63.6743 39.2051 63.3688 39.1328Z" fill="#EFEFF1"/>
      <path d="M31.8809 38.6111C32.0026 38.9599 32.0032 39.3201 32.0035 39.7404C30.8695 39.4471 31.2926 39.0356 31.8809 38.6111Z" fill="#F5F5F5"/>
      <path d="M61.8101 43.2683C61.8097 43.6224 61.8125 43.9764 61.8085 44.3305C61.7946 45.5702 60.62 46.064 57.6749 46.0642C51.6869 46.0645 45.6985 46.0793 39.7112 46.0513C38.165 46.044 36.6191 45.9101 35.0791 45.8163C33.7512 45.7354 33.4751 45.3355 33.6734 44.7978C34.4416 45.0694 34.5983 45.6515 36.2138 45.5333C37.305 45.5344 38.2602 45.5351 39.3624 45.5355C42.1297 45.5355 44.7499 45.5357 47.3998 45.5884C49.3411 45.6663 51.2526 45.6932 53.1647 45.7093C53.2195 45.7097 53.2797 45.5954 53.4306 45.5319C53.6707 45.4868 53.8176 45.4444 54.0916 45.4014C54.8308 45.3175 55.9688 45.2348 55.9694 45.1507C55.9731 44.6042 57.0258 44.4697 57.8452 44.2067C58.4141 44.2799 58.869 44.3454 59.3239 44.4109C59.4205 44.2251 59.5981 44.0396 59.6013 43.8535C59.6351 41.877 59.6412 39.9004 59.7562 37.9258C59.9929 37.9291 60.1282 37.9306 60.2606 37.9944C60.2712 38.7198 60.2846 39.3827 60.2812 40.1044C60.4073 41.4821 60.5504 42.801 60.7049 44.2264C61.1662 43.8265 61.4881 43.5474 61.8101 43.2683Z" fill="#C5C3C5"/>
      <path d="M35.7325 36.8496C36.1537 36.7665 36.5742 36.6119 36.9962 36.6111C43.9404 36.5977 50.8848 36.5997 57.8289 36.6135C58.3719 36.6145 58.9137 36.7281 59.4651 36.8672C59.2972 37.1045 59.1201 37.264 58.8003 37.4183C51.647 37.4051 44.6365 37.3971 37.6584 37.3396C38.3489 37.2036 39.007 37.117 39.6651 37.0303C39.6541 36.9701 39.643 36.9098 39.632 36.8496C38.3322 36.8496 37.0324 36.8496 35.7325 36.8496Z" fill="#C4BBB6"/>
      <path d="M58.943 37.4235C59.1201 37.2641 59.2972 37.1046 59.539 36.908C60.9611 37.1682 61.9273 37.5209 61.865 38.2877C61.7337 39.9045 61.8176 41.5245 61.8117 43.2058C61.4881 43.5476 61.1662 43.8267 60.705 44.2266C60.5504 42.8011 60.4074 41.4822 60.4038 40.1081C60.717 40.0166 61.0407 39.9816 61.0422 39.9442C61.072 39.207 61.0643 38.4694 61.0643 37.6369C60.6389 37.7938 60.4512 37.863 60.2634 37.9322C60.1282 37.9308 59.9929 37.9293 59.7328 37.8851C59.4198 37.7757 59.2315 37.7091 59.0237 37.6063C58.9837 37.5213 58.9634 37.4724 58.943 37.4235Z" fill="#B4B1B2"/>
      <path d="M35.6363 36.855C37.0324 36.8496 38.3322 36.8496 39.632 36.8496C39.643 36.9099 39.654 36.9701 39.665 37.0304C39.007 37.117 38.3489 37.2037 37.5577 37.3417C37.2902 37.3969 37.1558 37.4007 36.8918 37.4006C35.8349 37.3464 35.2474 37.4923 35.1352 37.9087C35.0352 38.2801 34.8639 38.6514 34.8561 39.0233C34.821 40.7045 34.8326 42.3859 34.7029 44.0549C34.4507 43.8212 34.2161 43.6003 34.2123 43.3786C34.1782 41.385 34.1847 39.3914 34.2038 37.3537C34.5365 37.1648 34.8447 37.0199 35.1528 36.8751C35.2819 36.8702 35.411 36.8652 35.6363 36.855Z" fill="#A09995"/>
      <path d="M34.1792 37.3977C34.1847 39.3914 34.1782 41.385 34.2123 43.3786C34.2161 43.6003 34.4508 43.8212 34.7879 44.0864C35.2537 44.4199 35.51 44.7095 35.7757 45.0452C35.8828 45.2386 35.9803 45.3858 36.0779 45.5331C34.5983 45.6516 34.4416 45.0695 33.6762 44.7428C33.5587 42.3308 33.5514 39.9275 33.6556 37.4617C33.9045 37.3987 34.0419 37.3982 34.1792 37.3977Z" fill="#B4B1B2"/>
      <path d="M63.3687 39.186C63.6743 39.205 63.9798 39.2773 64.2853 39.3496C64.0587 39.4543 63.8322 39.5589 63.4853 39.6646C63.3662 39.5235 63.3674 39.3814 63.3687 39.186Z" fill="#F2F2F3"/>
      <path d="M34.2038 37.3535C34.0419 37.3981 33.9045 37.3986 33.6638 37.3991C34.0114 37.2216 34.4623 37.0442 35.033 36.8708C34.8447 37.0198 34.5365 37.1646 34.2038 37.3535Z" fill="#C4BBB6"/>
      <path d="M53.9644 45.4019C53.8176 45.4444 53.6707 45.4868 53.2857 45.5313C51.8354 45.4927 50.6242 45.4303 49.4105 45.4198C48.7325 45.4139 48.0503 45.4943 47.3701 45.5359C44.7498 45.5357 42.1296 45.5354 39.3625 45.4826C39.3711 44.9733 38.844 44.6776 37.9701 44.4193C38.3958 44.0467 38.8092 43.7216 39.3613 43.3965C40.5528 43.3089 41.6057 43.2212 42.6654 43.1281C42.6723 43.1227 42.7013 43.1221 42.7162 43.1748C44.3275 43.5752 45.2733 43.4718 46.1078 42.8629C46.1168 42.8665 46.1012 42.8584 46.2159 42.8562C47.8967 42.5932 48.1791 41.9187 48.9367 41.3979C48.9412 41.3999 48.9319 41.3962 49.0549 41.3916C49.9421 41.266 50.7065 41.1449 51.5384 41.0197C51.606 41.0156 51.7426 41.0149 51.7781 41.0418C51.8736 41.1024 51.9497 41.1272 52.049 41.1853C52.0662 41.2835 52.0761 41.3396 52.0957 41.4391C52.3066 41.5434 52.5078 41.6044 52.7074 41.666C52.7059 41.6666 52.7087 41.6653 52.7085 41.7133C52.9292 41.8584 53.1501 41.9554 53.4676 42.0603C53.7131 42.1495 53.8621 42.2309 54.0062 42.3577C54.203 42.4666 54.4048 42.53 54.6199 42.626C54.6332 42.6584 54.6423 42.7242 54.5377 42.7454C54.0085 43.1798 52.9669 43.8021 53.2758 43.9667C54.1713 44.4439 53.8478 44.9209 53.9644 45.4019Z" fill="#B4B1B2"/>
      <path d="M54.6423 42.7244C54.6423 42.7244 54.6332 42.6586 54.6055 42.5845C54.389 42.4445 54.2001 42.3785 54.0112 42.3125C53.8622 42.231 53.7131 42.1496 53.4574 42.0147C53.1367 41.8626 52.9227 41.764 52.7087 41.6655C52.7087 41.6655 52.7059 41.6667 52.7089 41.6211C52.7159 41.5154 52.7199 41.4553 52.8371 41.4012C54.4472 42.0402 55.9337 42.6777 57.4496 43.3024C57.7769 43.4373 58.2099 43.5259 58.5943 43.6359C58.7241 43.46 58.9645 43.2844 58.9667 43.1082C58.989 41.2963 58.9727 39.4843 58.9859 37.6648C59.0047 37.6571 59.0432 37.6423 59.0432 37.6423C59.2315 37.709 59.4198 37.7757 59.6315 37.8831C59.6412 39.9005 59.6351 41.8771 59.6013 43.8536C59.5981 44.0397 59.4205 44.2252 59.3239 44.411C58.869 44.3455 58.4141 44.28 57.8371 44.1673C57.6179 44.0568 57.5209 43.9934 57.41 43.8876C57.2001 43.7812 57.004 43.7172 56.79 43.6091C56.0622 43.2848 55.3523 43.0046 54.6423 42.7244Z" fill="#E3E2E2"/>
      <path d="M57.4238 43.9302C57.5208 43.9935 57.6179 44.0568 57.7231 44.1597C57.0258 44.4698 55.9731 44.6043 55.9694 45.1509C55.9688 45.235 54.8308 45.3177 54.0916 45.4016C53.8478 44.9211 54.1713 44.4441 53.2758 43.9669C52.9669 43.8023 54.0085 43.18 54.5377 42.7456C55.3522 43.0046 56.0622 43.2849 56.7936 43.654C57.0181 43.8054 57.2209 43.8678 57.4238 43.9302Z" fill="#B8B8B8"/>
      <path d="M37.9577 44.4668C38.844 44.6777 39.3711 44.9734 39.2155 45.483C38.2602 45.5352 37.305 45.5345 36.2138 45.5334C35.9803 45.3858 35.8828 45.2385 35.8924 45.0452C36.6523 44.8216 37.305 44.6442 37.9577 44.4668Z" fill="#B8B8B8"/>
      <path d="M60.2607 37.9944C60.4512 37.8628 60.6389 37.7936 61.0643 37.6367C61.0643 38.4692 61.0719 39.2067 61.0422 39.944C61.0407 39.9814 60.717 40.0164 60.4206 40.049C60.2846 39.3826 60.2712 38.7197 60.2607 37.9944Z" fill="#A09995"/>
      <path d="M47.3998 45.5885C48.0504 45.4945 48.7325 45.4141 49.4105 45.42C50.6242 45.4305 51.8354 45.4929 53.1925 45.5342C53.2797 45.5956 53.2195 45.7099 53.1647 45.7094C51.2526 45.6933 49.3411 45.6664 47.3998 45.5885Z" fill="#B8B8B8"/>
      <path d="M37.0214 37.4044C37.1558 37.4007 37.2902 37.3969 37.5253 37.3911C44.6365 37.3971 51.647 37.4052 58.8003 37.4184C58.9634 37.4724 58.9837 37.5213 59.0236 37.6063C59.0432 37.6424 59.0047 37.6572 58.8404 37.664C52.0838 37.6719 45.4914 37.6729 38.7598 37.672C38.0199 37.6821 37.4192 37.6941 36.6076 37.7103C36.6076 39.7209 36.6076 41.6567 36.6076 43.5303C37.9122 43.0819 39.1278 42.5903 40.524 42.2226C41.0403 42.0866 41.9958 42.2116 42.7247 42.2736C43.3708 42.3285 44.084 42.5971 44.5826 42.5285C45.4053 42.4154 46.5016 42.2368 46.234 41.6608C47.533 41.3521 48.7253 41.0507 49.8906 40.7918C49.5531 41.0216 49.2425 41.209 48.9319 41.3964C48.9319 41.3964 48.9412 41.4001 48.8237 41.4029C47.0266 41.6273 46.9096 42.3549 46.1012 42.8586C46.1012 42.8586 46.1168 42.8667 45.9837 42.8635C44.8009 42.9476 43.7511 43.0349 42.7013 43.1223C42.7013 43.1223 42.6723 43.1229 42.6464 43.0812C41.5235 42.3759 40.4829 42.2966 39.5831 42.8245C39.2924 42.995 39.135 43.2066 38.8066 43.4046C38.3738 43.6019 38.1097 43.8205 37.7129 43.9791C37.2607 44.16 36.6902 44.2874 36.1712 44.438C36.0311 44.2197 35.7735 44.0017 35.7695 43.7829C35.737 42.0122 35.8009 40.241 35.7213 38.4708C35.6989 37.9739 35.9774 37.6263 37.0214 37.4044Z" fill="#E3E2E2"/>
      <path d="M36.8918 37.4005C35.9774 37.6261 35.699 37.9737 35.7213 38.4706C35.8009 40.2408 35.737 42.0121 35.7695 43.7828C35.7735 44.0015 36.0311 44.2195 36.1712 44.4378C36.6902 44.2872 37.2607 44.1598 37.7129 43.979C38.1097 43.8203 38.3738 43.6018 38.883 43.4021C39.0694 43.3945 39.2227 43.3965 39.2227 43.3965C38.8093 43.7216 38.3959 44.0467 37.9701 44.4193C37.305 44.6441 36.6523 44.8215 35.8829 44.999C35.51 44.7094 35.2537 44.4198 34.9125 44.0987C34.8327 42.3858 34.821 40.7044 34.8561 39.0231C34.8639 38.6513 35.0352 38.28 35.1352 37.9086C35.2474 37.4921 35.8349 37.3463 36.8918 37.4005Z" fill="#C5C3C5"/>
      <path d="M49.9175 40.7492C48.7253 41.0507 47.533 41.3521 46.139 41.6549C45.7237 41.0527 44.8718 40.7272 43.8 40.7739C42.512 40.83 41.2118 40.8496 39.9169 40.8495C39.6933 40.8495 39.4698 40.6727 39.3886 40.5816C40.6146 40.5857 41.7253 40.646 42.7706 40.5609C43.3075 40.5173 44.0087 40.244 44.1381 40.022C44.3625 39.6371 44.2004 39.2115 44.2004 38.9386C43.2599 38.742 42.6279 38.6099 42.1052 38.4686C42.5268 38.032 42.4234 37.993 41.3853 37.9272C40.5456 37.8739 39.727 37.7606 38.8991 37.6738C45.4914 37.6728 52.0838 37.6718 58.8217 37.6716C58.9727 39.4844 58.989 41.2963 58.9667 43.1082C58.9645 43.2844 58.7241 43.46 58.5943 43.6359C58.2099 43.5259 57.7769 43.4373 57.4495 43.3024C55.9337 42.6777 54.4472 42.0402 52.833 41.4011C52.7157 41.3948 52.7174 41.3922 52.7007 41.3492C52.4698 41.2519 52.2557 41.1977 52.0417 41.1434C51.9497 41.1274 51.8737 41.1026 51.7739 40.9962C51.5215 40.8657 51.3087 40.808 50.9776 40.7489C50.5454 40.7482 50.2315 40.7487 49.9175 40.7492Z" fill="#F2F3F7"/>
      <path d="M39.3613 43.3966C39.2227 43.3966 39.0694 43.3945 38.993 43.3969C39.1351 43.2065 39.2924 42.995 39.5831 42.8244C40.4829 42.2966 41.5235 42.3758 42.6395 43.0866C41.6057 43.2214 40.5528 43.3091 39.3613 43.3966Z" fill="#A09995"/>
      <path d="M46.2159 42.8563C46.9096 42.3548 47.0266 41.6272 48.8192 41.4009C48.1791 41.9189 47.8967 42.5933 46.2159 42.8563Z" fill="#C5C3C5"/>
      <path d="M42.7162 43.1748C43.7511 43.0347 44.8009 42.9474 45.9748 42.8596C45.2733 43.4718 44.3275 43.5752 42.7162 43.1748Z" fill="#C5C3C5"/>
      <path d="M49.8906 40.7916C50.2315 40.7486 50.5454 40.7481 50.9977 40.7886C51.2477 40.8943 51.3593 40.9592 51.4708 41.024C50.7065 41.145 49.9422 41.2661 49.0549 41.3917C49.2425 41.2089 49.5531 41.0215 49.8906 40.7916Z" fill="#C5C3C5"/>
      <path d="M52.7085 41.7134C52.9227 41.764 53.1366 41.8625 53.3608 42.0068C53.1501 41.9555 52.9292 41.8584 52.7085 41.7134Z" fill="#C5C3C5"/>
      <path d="M54.0062 42.3579C54.2001 42.3785 54.3889 42.4445 54.5922 42.5521C54.4048 42.5302 54.203 42.4668 54.0062 42.3579Z" fill="#C5C3C5"/>
      <path d="M51.5384 41.0198C51.3593 40.9591 51.2477 40.8943 51.1161 40.7898C51.3087 40.8078 51.5215 40.8656 51.7384 40.9692C51.7426 41.015 51.606 41.0156 51.5384 41.0198Z" fill="#E3E2E2"/>
      <path d="M52.7198 41.3949C52.7199 41.4552 52.7159 41.5153 52.7104 41.6204C52.5078 41.6044 52.3066 41.5434 52.2008 41.439C52.4366 41.3945 52.577 41.3933 52.7174 41.3921C52.7174 41.3921 52.7157 41.3947 52.7198 41.3949Z" fill="#C5C3C5"/>
      <path d="M52.7007 41.349C52.577 41.3933 52.4366 41.3945 52.1911 41.3957C52.0761 41.3396 52.0663 41.2835 52.049 41.1853C52.2558 41.1975 52.4698 41.2518 52.7007 41.349Z" fill="#E3E2E2"/>
      <path d="M57.4099 43.8875C57.2209 43.8676 57.018 43.8052 56.8115 43.698C57.0039 43.7171 57.2 43.7811 57.4099 43.8875Z" fill="#C5C3C5"/>
      <path d="M38.7599 37.6719C39.727 37.7605 40.5456 37.8739 41.3853 37.9271C42.4235 37.993 42.5268 38.0319 41.9793 38.4687C38.8087 38.5594 38.561 38.669 38.6239 39.8588C38.6274 39.9249 38.634 39.9909 38.5549 40.0808C38.7226 40.2251 38.9744 40.3456 39.2329 40.4938C39.2396 40.5217 39.2462 40.5775 39.2462 40.5775C39.4698 40.6726 39.6933 40.8494 39.9169 40.8494C41.2118 40.8495 42.512 40.8299 43.8 40.7738C44.8718 40.7271 45.7237 41.0527 46.0322 41.662C46.5016 42.2367 45.4053 42.4153 44.5827 42.5284C44.084 42.597 43.3708 42.3284 42.7247 42.2734C41.9958 42.2115 41.0404 42.0865 40.524 42.2225C39.1278 42.5902 37.9122 43.0818 36.6076 43.5302C36.6076 41.6566 36.6076 39.7208 36.6076 37.7102C37.4192 37.694 38.0199 37.682 38.7599 37.6719Z" fill="#F7F9FB"/>
      <path d="M39.3886 40.5814C39.2462 40.5774 39.2396 40.5216 39.2263 40.4512C39.0218 40.2728 38.8304 40.1648 38.6391 40.0568C38.6339 39.9908 38.6274 39.9248 38.6239 39.8587C38.561 38.6689 38.8087 38.5593 41.87 38.4778C42.6279 38.6097 43.2599 38.7418 44.2004 38.9385C44.2004 39.2113 44.3625 39.637 44.1381 40.0219C44.0087 40.2438 43.3074 40.5171 42.7706 40.5608C41.7253 40.6458 40.6146 40.5855 39.3886 40.5814ZM42.675 39.593C42.7932 39.186 42.4494 38.9222 41.41 39.0025C40.86 39.045 40.0371 39.1632 39.9198 39.3239C39.7714 39.5274 40.1694 40.0096 40.4128 40.0197C41.1826 40.0518 42.3549 40.3506 42.675 39.593Z" fill="#C7CBD0"/>
      <path d="M38.5549 40.0808C38.8304 40.1649 39.0218 40.2728 39.2196 40.4234C38.9744 40.3456 38.7226 40.2251 38.5549 40.0808Z" fill="#F2F3F7"/>
      <path d="M42.6697 39.6521C42.3549 40.3507 41.1826 40.0518 40.4128 40.0198C40.1694 40.0097 39.7714 39.5275 39.9198 39.324C40.0371 39.1633 40.86 39.0451 41.41 39.0026C42.4494 38.9222 42.7932 39.1861 42.6697 39.6521Z" fill="#7E828A"/>
      <g clip-path="url(#clip0_79_7)">
      <path d="M64.1304 37.4558C64.1304 37.6255 64.1304 37.7951 64.0845 38.0238C63.6158 38.4159 63.7456 38.8241 63.8552 39.2449C63.9128 39.4665 63.9338 39.7076 63.9157 39.9356C63.8921 40.2329 63.767 40.5258 63.7654 40.821C63.7526 43.2839 63.7693 45.747 63.7481 48.2098C63.7442 48.6661 63.7609 49.24 63.5061 49.5531C62.9054 50.2912 62.1751 50.9115 61.08 50.9076C56.2406 50.8901 51.401 50.9 46.5614 50.9C41.4323 50.9 36.3032 50.9143 31.1743 50.8826C30.4996 50.8785 29.8186 50.6682 29.1557 50.4968C28.8331 50.4134 28.5454 50.1993 28.2419 50.0443C28.1752 49.9039 28.1084 49.7635 28.0175 49.5328C27.8803 48.3424 28.4409 47.2204 27.8775 46.1306C27.8191 46.0177 27.8693 45.8503 27.8693 45.7082C27.8692 41.8718 27.8733 38.0353 27.8586 34.1989C27.8578 33.9805 27.7037 33.7626 27.6209 33.5444C27.6209 33.4528 27.6209 33.3612 27.6632 33.2195C27.8013 33.0499 27.8972 32.9303 27.993 32.8108C28.2052 32.1674 28.5839 31.6784 29.3659 31.4699C30.4345 31.2334 31.4072 30.9939 32.424 31.0998C32.832 31.1422 33.2402 31.2167 33.6483 31.217C42.0608 31.2239 50.4733 31.2228 58.8857 31.2205C59.3312 31.2204 59.7796 31.1577 60.2214 31.1912C61.1124 31.2586 61.9998 31.3722 62.8887 31.4668C62.8887 31.4668 62.8889 31.5278 62.8894 31.6031C63.17 32.0672 63.4367 32.4662 63.7351 32.8407C63.9058 33.0549 63.9879 33.1691 63.8568 33.5042C63.668 33.987 63.711 34.564 63.69 35.1021C63.6709 35.5927 63.6491 36.0923 63.7228 36.5739C63.7698 36.8811 63.9886 37.1627 64.1304 37.4558ZM39.5732 38.0654C39.1141 37.8054 38.7122 37.4569 38.0929 37.5579C37.7238 37.6181 37.5081 37.6612 37.5531 38.0802C37.6405 38.8944 37.4706 39.5498 36.4379 39.5861C36.4379 41.0592 36.438 42.4622 36.4379 43.8652C36.4377 44.9776 36.4374 44.9772 35.4175 45.3445C35.4021 45.3501 35.4084 45.414 35.4061 45.4509C36.4586 45.7732 36.4616 45.7787 36.2199 46.8354C36.2064 46.8945 36.1986 46.9553 36.1927 47.0157C36.1356 47.605 36.3812 47.8073 36.9604 47.6509C37.1784 47.592 37.3942 47.5112 37.6165 47.4846C38.1333 47.4228 38.5528 47.5053 38.6852 48.128C38.7146 48.2667 39.0174 48.4277 39.2051 48.442C40.1284 48.512 41.0551 48.5518 41.9812 48.5647C42.1981 48.5677 42.5426 48.4829 42.612 48.3381C42.8316 47.8798 43.2212 47.8937 43.5489 48.0058C43.7194 48.0642 43.7807 48.4315 43.8915 48.6591C44.0497 48.9841 43.8381 49.5533 44.4889 49.5538C47.0959 49.5561 49.7029 49.5601 52.3097 49.5423C52.469 49.5412 52.7489 49.372 52.7642 49.2547C52.8265 48.7761 52.9894 48.4534 53.5264 48.3777C53.6023 48.367 53.6792 48.1119 53.6927 47.9643C53.7818 46.9901 54.2046 46.6673 55.186 46.8461C55.8221 46.962 55.9311 46.8687 55.9346 46.2049C55.9351 46.1031 55.9346 46.0013 55.9346 45.8994C55.9347 44.7606 55.9347 44.7606 56.9926 44.4445C57.0953 43.6045 57.2103 42.7658 57.2955 41.9241C57.3405 41.4795 57.1524 41.1523 56.6554 41.1302C56.2616 41.1127 56.1653 40.9058 56.1814 40.572C56.1912 40.3688 56.1816 40.1648 56.1831 39.9611C56.1859 39.5786 56.1084 39.3034 55.617 39.2672C55.0378 39.2245 54.7233 38.9016 54.8143 38.2828C54.8698 37.906 54.7559 37.6746 54.348 37.4857C53.9286 37.2913 53.6096 36.9096 53.6946 36.349C53.7973 35.6718 53.9007 34.9913 53.9375 34.3087C53.9733 33.6448 53.6785 33.4648 53.0089 33.578C52.404 33.6802 51.7895 33.7655 51.1774 33.7797C49.8746 33.8098 48.5705 33.7997 47.2672 33.7829C46.8252 33.7772 46.4526 33.7795 46.3558 34.3346C46.3334 34.4633 46.1212 34.626 45.9729 34.6545C45.5929 34.7275 45.191 34.696 44.8146 34.7794C44.5465 34.8388 44.2475 34.9629 44.0646 35.1533C43.6917 35.5418 43.3264 35.8519 42.7352 35.7483C42.4335 35.6955 42.1246 35.659 41.8188 35.658C41.3696 35.6565 40.808 35.6224 40.7208 36.1836C40.6304 36.7662 40.3117 36.841 39.8227 36.7742C39.7679 37.1502 39.7186 37.4883 39.6691 37.9066C39.6689 37.9601 39.6686 38.0136 39.5732 38.0654Z" fill="#F5F5F5"/>
      <path d="M28.2465 50.0868C28.5455 50.1993 28.8331 50.4135 29.1557 50.4969C29.8187 50.6683 30.4996 50.8785 31.1743 50.8827C36.3032 50.9143 41.4324 50.9 46.5615 50.9C51.401 50.9001 56.2406 50.8901 61.0801 50.9076C62.1751 50.9116 62.9054 50.2912 63.5061 49.5531C63.7609 49.24 63.7442 48.6661 63.7481 48.2099C63.7693 45.7471 63.7526 43.284 63.7655 40.821C63.767 40.5258 63.8921 40.233 63.9157 39.9356C63.9338 39.7076 63.9129 39.4665 63.8552 39.2449C63.7457 38.8242 63.6159 38.4159 64.0844 38.0747C64.2105 38.3673 64.3692 38.6713 64.3566 38.9682C64.314 39.9768 64.157 40.9821 64.1416 41.9901C64.1069 44.2688 64.148 46.5487 64.1121 48.8274C64.1067 49.17 63.9017 49.5405 63.7013 49.8416C63.4375 50.2381 63.1196 50.6148 62.761 50.9293C62.5516 51.113 62.2177 51.2518 61.9393 51.2528C56.8115 51.2716 51.6836 51.2753 46.5558 51.2608C45.0723 51.2565 43.5889 51.1509 42.1055 51.1536C40.3118 51.1569 38.5182 51.2612 36.7247 51.2579C34.4555 51.2537 32.1863 51.19 29.9173 51.1415C29.1699 51.1255 28.7046 50.6295 28.2465 50.0868Z" fill="#F9F9FA"/>
      <path d="M62.8875 31.4187C61.9999 31.3723 61.1124 31.2587 60.2214 31.1913C59.7796 31.1578 59.3312 31.2205 58.8858 31.2206C50.4733 31.2229 42.0608 31.224 33.6483 31.2171C33.2402 31.2168 32.832 31.1423 32.4241 31.0998C31.4072 30.9939 30.4345 31.2335 29.41 31.4656C29.4744 31.3058 29.5664 31.0333 29.7089 31.0046C30.1885 30.9082 30.686 30.8615 31.1766 30.8611C40.8087 30.8538 50.4408 30.8528 60.0729 30.861C60.8325 30.8616 61.5945 30.9149 62.3496 30.9962C62.5401 31.0168 62.708 31.2402 62.8875 31.4187Z" fill="#F9F9FA"/>
      <path d="M27.6209 33.6018C27.7037 33.7627 27.8578 33.9806 27.8586 34.199C27.8733 38.0354 27.8692 41.8719 27.8693 45.7083C27.8693 45.8504 27.8191 46.0177 27.8775 46.1307C28.4409 47.2205 27.8803 48.3425 27.9931 49.4993C27.8689 49.2247 27.6384 48.8938 27.6369 48.5619C27.6138 43.5944 27.6209 38.6267 27.6209 33.6018Z" fill="#F9F9FA"/>
      <path d="M64.1305 37.3985C63.9887 37.1627 63.7699 36.881 63.7229 36.5739C63.6491 36.0922 63.6709 35.5926 63.6901 35.1021C63.7111 34.5639 63.6681 33.987 63.8569 33.5042C63.9879 33.1691 63.9058 33.0549 63.7351 32.8406C63.4367 32.4661 63.17 32.0671 62.8895 31.6335C63.202 31.9172 63.4942 32.2685 63.8333 32.5685C64.2546 32.9413 64.168 33.3256 64.0912 33.8228C63.9852 34.5094 64.1125 35.23 64.1287 35.9362C64.1394 36.4043 64.1307 36.8728 64.1305 37.3985Z" fill="#F9F9FA"/>
      <path d="M27.9508 32.8152C27.8972 32.9304 27.8014 33.0499 27.6633 33.1737C27.7169 33.0585 27.8128 32.939 27.9508 32.8152Z" fill="#F9F9FA"/>
      <path d="M39.6694 37.8264C39.7186 37.4883 39.7679 37.1501 39.8226 36.7742C40.3117 36.8409 40.6303 36.7662 40.7208 36.1835C40.808 35.6223 41.3696 35.6564 41.8188 35.6579C42.1246 35.659 42.4335 35.6954 42.7352 35.7483C43.3264 35.8518 43.6916 35.5418 44.0646 35.1532C44.2475 34.9628 44.5465 34.8388 44.8146 34.7794C45.191 34.696 45.5929 34.7274 45.9729 34.6544C46.1212 34.6259 46.3334 34.4632 46.3558 34.3345C46.4525 33.7794 46.8252 33.7771 47.2672 33.7828C48.5705 33.7996 49.8746 33.8098 51.1774 33.7796C51.7895 33.7655 52.404 33.6802 53.0088 33.5779C53.6785 33.4647 53.9733 33.6447 53.9375 34.3087C53.9006 34.9912 53.7973 35.6717 53.6946 36.3489C53.6096 36.9095 53.9286 37.2913 54.348 37.4856C54.7558 37.6745 54.8697 37.9059 54.8143 38.2827C54.7233 38.9015 55.0378 39.2245 55.617 39.2672C56.1084 39.3034 56.1859 39.5785 56.1831 39.9611C56.1816 40.1647 56.1912 40.3687 56.1814 40.5719C56.1653 40.9058 56.2616 41.1126 56.6554 41.1301C57.1524 41.1523 57.3405 41.4794 57.2955 41.924C57.2103 42.7657 57.0952 43.6045 56.9934 44.4446C55.9347 44.7605 55.9347 44.7605 55.9346 45.8994C55.9346 46.0012 55.9351 46.103 55.9345 46.2048C55.9311 46.8686 55.8221 46.9619 55.186 46.846C54.2046 46.6672 53.7818 46.99 53.6927 47.9642C53.6792 48.1118 53.6023 48.3669 53.5264 48.3776C52.9894 48.4534 52.8265 48.776 52.7641 49.2547C52.7489 49.3719 52.469 49.5411 52.3097 49.5422C49.7029 49.5601 47.0959 49.556 44.4889 49.5538C43.8381 49.5532 44.0497 48.984 43.8915 48.6591C43.7807 48.4314 43.7194 48.0641 43.5489 48.0058C43.2212 47.8937 42.8316 47.8797 42.612 48.3381C42.5426 48.4829 42.1981 48.5676 41.9812 48.5646C41.0551 48.5517 40.1284 48.5119 39.205 48.4419C39.0174 48.4277 38.7146 48.2667 38.6852 48.128C38.5528 47.5053 38.1333 47.4227 37.6165 47.4845C37.3942 47.5111 37.1784 47.5919 36.9604 47.6508C36.3812 47.8072 36.1356 47.6049 36.1927 47.0157C36.1986 46.9552 36.2064 46.8945 36.2199 46.8353C36.4616 45.7786 36.4586 45.7732 35.4053 45.4507C35.4083 45.414 35.4021 45.35 35.4175 45.3444C36.4374 44.9771 36.4377 44.9775 36.4379 43.8652C36.438 42.4621 36.4379 41.0591 36.4379 39.586C37.4706 39.5498 37.6405 38.8943 37.5531 38.0802C37.5081 37.6611 37.7238 37.618 38.0929 37.5578C38.7122 37.4569 39.1141 37.8054 39.6208 38.1185C39.6681 38.381 39.6678 38.5903 39.6195 38.8101C39.3866 39.1993 39.2192 39.5765 39.6682 39.9577C39.5781 41.1508 39.8759 42.3097 39.4368 43.4289C39.3627 43.6177 39.3746 43.9017 39.4682 44.0799C39.7507 44.6174 40.093 45.1244 40.4164 45.6872C40.5834 45.9263 40.7276 46.1406 40.9121 46.313C41.5104 46.8718 42.5022 46.7041 43.0448 47.4252C43.1206 47.5259 43.5666 47.3871 43.8282 47.3139C44.1186 47.2326 44.3947 47.0028 44.6761 47.0045C46.5504 47.0152 48.4245 47.0673 50.2985 47.116C50.4998 47.1212 50.7062 47.2432 50.8982 47.2188C51.1906 47.1817 51.6169 47.1436 51.7212 46.96C51.8442 46.7434 51.712 46.3647 51.6365 46.0696C51.5964 45.9128 51.4421 45.7843 51.3892 45.6413C51.9367 45.4837 51.621 45.072 51.7574 44.7827C52.0613 44.3486 52.4416 43.9502 52.5589 43.4872C52.7706 42.6522 52.8744 41.7816 52.9311 40.92C52.9884 40.0493 53.0203 39.1594 52.8966 38.3012C52.8207 37.7744 52.1997 37.3468 52.5606 36.6955C52.5873 36.6474 52.3933 36.461 52.2803 36.3629C52.144 36.2447 51.9944 36.1331 51.833 36.0529C51.5517 35.913 51.257 35.7994 50.9679 35.6747C50.9772 35.7473 50.9866 35.8199 50.9959 35.8925C50.8615 36.0888 50.7271 36.285 50.5347 36.4807C48.1179 36.4799 45.759 36.4673 43.4004 36.4882C42.827 36.4933 42.2552 36.6555 41.6815 36.6628C40.7671 36.6743 40.1449 37.1121 39.6694 37.8264Z" fill="#F2F2F3"/>
      <path d="M39.6693 37.8667C40.1449 37.1122 40.7671 36.6745 41.6815 36.6629C42.2552 36.6557 42.827 36.4935 43.4005 36.4884C45.759 36.4674 48.1179 36.4801 50.5432 36.5239C51.2242 36.8687 51.8507 37.1816 51.9934 37.9217C52.0792 38.3669 52.0571 38.8322 52.0835 39.3374C52.0829 39.5165 52.0824 39.6467 52.0466 39.8083C51.9528 40.1548 51.8559 40.4682 51.8426 40.7851C51.7865 42.1193 51.7555 43.4545 51.7153 44.7894C51.621 45.0721 51.9368 45.4839 51.3397 45.6424C50.951 45.7263 50.6587 45.8866 50.3727 45.8764C47.0533 45.7581 43.7206 46.18 40.4121 45.6435C40.0931 45.1246 39.7507 44.6176 39.4682 44.0801C39.3746 43.9019 39.3627 43.6179 39.4368 43.4291C39.876 42.3099 39.5781 41.1509 39.6683 39.9028C39.6679 39.4602 39.6677 39.13 39.6675 38.7998C39.6678 38.5905 39.6681 38.3811 39.6684 38.1195C39.6686 38.0137 39.6689 37.9602 39.6693 37.8667ZM40.2779 37.8138C40.2808 40.0169 40.2837 42.2199 40.2843 44.5241C40.2506 44.9743 40.3599 45.3409 40.8855 45.4151C41.4951 45.5011 42.107 45.6238 42.719 45.6305C45.089 45.6561 47.4594 45.6426 49.8297 45.6423C50.9954 45.6422 51.4604 45.1895 51.4659 44.0531C51.4675 43.7285 51.4664 43.404 51.4678 42.9646C51.4695 41.4808 51.4363 39.9958 51.4883 38.5137C51.5129 37.8108 51.1304 37.4875 50.5347 37.1403C50.32 37.0841 50.1056 36.98 49.8906 36.9791C47.1419 36.9665 44.3931 36.9647 41.6444 36.9769C41.4773 36.9776 41.3109 37.1194 41.0679 37.2053C41.0169 37.2098 40.9658 37.2144 40.8198 37.2114C40.6413 37.374 40.4629 37.5367 40.2779 37.8138Z" fill="#E3E2E2"/>
      <path d="M40.4164 45.6872C43.7206 46.1798 47.0533 45.7579 50.3727 45.8762C50.6587 45.8864 50.951 45.7261 51.2899 45.644C51.4422 45.7843 51.5964 45.9128 51.6366 46.0696C51.7121 46.3646 51.8442 46.7434 51.7212 46.96C51.617 47.1436 51.1906 47.1817 50.8983 47.2188C50.7063 47.2432 50.4998 47.1212 50.2985 47.1159C48.4246 47.0672 46.5504 47.0151 44.6761 47.0044C44.3947 47.0028 44.1187 47.2326 43.8282 47.3139C43.5666 47.3871 43.1206 47.5259 43.0448 47.4252C42.5022 46.704 41.5104 46.8718 40.9122 46.313C40.7276 46.1406 40.5835 45.9263 40.4164 45.6872Z" fill="#EFEFF1"/>
      <path d="M52.0835 39.2884C52.0571 38.8321 52.0792 38.3668 51.9934 37.9216C51.8507 37.1815 51.2242 36.8686 50.6012 36.5244C50.7272 36.2851 50.8615 36.0889 50.9959 35.8926C50.9866 35.82 50.9773 35.7474 50.9679 35.6748C51.257 35.7995 51.5518 35.9131 51.8331 36.053C51.9944 36.1332 52.144 36.2448 52.2803 36.363C52.3933 36.4611 52.5873 36.6475 52.5607 36.6956C52.1997 37.3469 52.8207 37.7745 52.8966 38.3013C53.0203 39.1595 52.9885 40.0494 52.9311 40.9201C52.8744 41.7817 52.7706 42.6522 52.559 43.4873C52.4416 43.9503 52.0613 44.3487 51.7574 44.7827C51.7555 43.4545 51.7865 42.1192 51.8426 40.785C51.8559 40.4681 51.9528 40.1547 52.0943 39.8074C52.2669 39.6791 52.3566 39.5832 52.4462 39.4872C52.3253 39.4209 52.2044 39.3547 52.0835 39.2884Z" fill="#EFEFF1"/>
      <path d="M39.6195 38.8101C39.6677 39.1298 39.6679 39.46 39.668 39.8453C39.2192 39.5764 39.3867 39.1992 39.6195 38.8101Z" fill="#F5F5F5"/>
      <path d="M51.4665 43.0792C51.4664 43.4037 51.4674 43.7283 51.4659 44.0528C51.4604 45.1892 50.9954 45.6419 49.8297 45.6421C47.4594 45.6424 45.089 45.6559 42.719 45.6302C42.107 45.6236 41.495 45.5009 40.8855 45.4148C40.3599 45.3407 40.2506 44.9741 40.3291 44.4812C40.6331 44.7302 40.6952 45.2637 41.3346 45.1554C41.7665 45.1564 42.1446 45.1571 42.581 45.1575C43.6763 45.1574 44.7135 45.1576 45.7624 45.206C46.5309 45.2773 47.2875 45.302 48.0443 45.3168C48.0661 45.3172 48.0899 45.2124 48.1496 45.1542C48.2446 45.1128 48.3028 45.074 48.4113 45.0346C48.7039 44.9577 49.1543 44.8819 49.1546 44.8048C49.156 44.3037 49.5727 44.1804 49.8971 43.9394C50.1223 44.0065 50.3023 44.0666 50.4824 44.1266C50.5206 43.9563 50.5909 43.7862 50.5922 43.6156C50.6056 41.8038 50.608 39.992 50.6535 38.1819C50.7472 38.185 50.8007 38.1863 50.8532 38.2448C50.8574 38.9097 50.8627 39.5174 50.8613 40.179C50.9112 41.4418 50.9679 42.6508 51.029 43.9575C51.2116 43.5909 51.3391 43.3351 51.4665 43.0792Z" fill="#C5C3C5"/>
      <path d="M41.1441 37.1954C41.3109 37.1193 41.4773 36.9775 41.6443 36.9768C44.3931 36.9646 47.1419 36.9664 49.8906 36.979C50.1056 36.9799 50.32 37.084 50.5383 37.2115C50.4718 37.4291 50.4017 37.5753 50.2751 37.7168C47.4436 37.7046 44.6686 37.6973 41.9065 37.6446C42.1798 37.52 42.4403 37.4405 42.7008 37.3611C42.6964 37.3059 42.692 37.2506 42.6877 37.1954C42.1732 37.1954 41.6587 37.1954 41.1441 37.1954Z" fill="#C4BBB6"/>
      <path d="M50.3316 37.7214C50.4017 37.5752 50.4718 37.429 50.5675 37.2488C51.1304 37.4873 51.5129 37.8106 51.4882 38.5136C51.4362 39.9956 51.4695 41.4806 51.4671 43.0218C51.339 43.3351 51.2116 43.591 51.029 43.9575C50.9678 42.6508 50.9112 41.4419 50.9098 40.1822C51.0338 40.0984 51.1619 40.0663 51.1625 40.032C51.1743 39.3562 51.1713 38.6801 51.1713 37.917C51.0029 38.0608 50.9286 38.1242 50.8543 38.1877C50.8007 38.1864 50.7472 38.185 50.6442 38.1445C50.5203 38.0442 50.4458 37.9831 50.3635 37.8889C50.3477 37.811 50.3397 37.7662 50.3316 37.7214Z" fill="#B4B1B2"/>
      <path d="M41.106 37.2002C41.6586 37.1953 42.1732 37.1953 42.6877 37.1953C42.692 37.2505 42.6964 37.3058 42.7007 37.361C42.4403 37.4404 42.1798 37.5199 41.8666 37.6464C41.7607 37.697 41.7075 37.7004 41.603 37.7004C41.1846 37.6507 40.9521 37.7844 40.9077 38.1662C40.8681 38.5066 40.8003 38.847 40.7972 39.1879C40.7833 40.729 40.7879 42.2703 40.7366 43.8002C40.6367 43.586 40.5439 43.3834 40.5424 43.1802C40.5289 41.3528 40.5314 39.5253 40.539 37.6574C40.6707 37.4842 40.7927 37.3515 40.9147 37.2187C40.9658 37.2142 41.0168 37.2096 41.106 37.2002Z" fill="#A09995"/>
      <path d="M40.5293 37.6978C40.5314 39.5253 40.5289 41.3528 40.5424 43.1802C40.5439 43.3834 40.6368 43.586 40.7702 43.8291C40.9546 44.1348 41.056 44.4003 41.1612 44.708C41.2036 44.8852 41.2422 45.0202 41.2808 45.1552C40.6952 45.2638 40.6331 44.7303 40.3302 44.4308C40.2837 42.2198 40.2808 40.0167 40.322 37.7564C40.4205 37.6987 40.4749 37.6982 40.5293 37.6978Z" fill="#B4B1B2"/>
      <path d="M52.0835 39.3372C52.2044 39.3545 52.3253 39.4208 52.4462 39.4871C52.3566 39.583 52.2669 39.679 52.1296 39.7758C52.0824 39.6465 52.0829 39.5163 52.0835 39.3372Z" fill="#F2F2F3"/>
      <path d="M40.539 37.6575C40.4749 37.6984 40.4205 37.6988 40.3253 37.6993C40.4629 37.5366 40.6413 37.374 40.8672 37.2151C40.7927 37.3516 40.6707 37.4844 40.539 37.6575Z" fill="#C4BBB6"/>
      <path d="M48.3609 45.0351C48.3028 45.074 48.2446 45.1129 48.0923 45.1537C47.5182 45.1183 47.0387 45.0611 46.5583 45.0515C46.2899 45.0461 46.0199 45.1198 45.7506 45.1579C44.7135 45.1577 43.6763 45.1575 42.581 45.109C42.5844 44.6422 42.3757 44.3711 42.0298 44.1343C42.1984 43.7928 42.362 43.4948 42.5805 43.1968C43.0521 43.1165 43.4689 43.0361 43.8884 42.9508C43.8911 42.9458 43.9026 42.9453 43.9085 42.9936C44.5463 43.3606 44.9207 43.2658 45.251 42.7076C45.2546 42.711 45.2484 42.7035 45.2938 42.7015C45.9591 42.4605 46.0709 41.8422 46.3708 41.3648C46.3725 41.3666 46.3689 41.3631 46.4175 41.359C46.7688 41.2438 47.0713 41.1329 47.4006 41.0181C47.4274 41.0143 47.4815 41.0137 47.4955 41.0383C47.5333 41.0939 47.5634 41.1166 47.6027 41.1699C47.6096 41.2599 47.6135 41.3113 47.6212 41.4025C47.7047 41.4981 47.7843 41.554 47.8634 41.6105C47.8627 41.611 47.8639 41.6099 47.8638 41.6539C47.9512 41.7868 48.0386 41.8758 48.1642 41.9719C48.2614 42.0537 48.3204 42.1283 48.3774 42.2446C48.4553 42.3444 48.5352 42.4025 48.6204 42.4905C48.6256 42.5202 48.6292 42.5805 48.5879 42.5999C48.3784 42.9981 47.9661 43.5686 48.0883 43.7195C48.4428 44.1569 48.3148 44.5941 48.3609 45.0351Z" fill="#B4B1B2"/>
      <path d="M48.6293 42.5806C48.6293 42.5806 48.6257 42.5203 48.6147 42.4524C48.529 42.3241 48.4542 42.2636 48.3794 42.2031C48.3205 42.1284 48.2615 42.0538 48.1602 41.9301C48.0333 41.7907 47.9486 41.7003 47.8639 41.61C47.8639 41.61 47.8628 41.6111 47.8639 41.5693C47.8667 41.4724 47.8683 41.4173 47.9147 41.3678C48.552 41.9535 49.1404 42.5379 49.7405 43.1105C49.87 43.2342 50.0414 43.3154 50.1936 43.4162C50.245 43.255 50.3401 43.094 50.341 42.9325C50.3498 41.2716 50.3434 39.6106 50.3486 37.9427C50.356 37.9357 50.3713 37.9221 50.3713 37.9221C50.4458 37.9832 50.5203 38.0443 50.6041 38.1429C50.608 39.9921 50.6056 41.804 50.5922 43.6158C50.5909 43.7863 50.5206 43.9564 50.4824 44.1267C50.3023 44.0667 50.1223 44.0067 49.8939 43.9033C49.8071 43.802 49.7687 43.744 49.7248 43.647C49.6417 43.5494 49.5641 43.4908 49.4794 43.3917C49.1913 43.0944 48.9103 42.8375 48.6293 42.5806Z" fill="#E3E2E2"/>
      <path d="M49.7302 43.686C49.7687 43.744 49.8071 43.8021 49.8487 43.8963C49.5727 44.1806 49.156 44.3039 49.1545 44.805C49.1543 44.882 48.7038 44.9578 48.4113 45.0348C48.3148 44.5943 48.4428 44.1571 48.0883 43.7196C47.9661 43.5688 48.3784 42.9983 48.5879 42.6001C48.9103 42.8375 49.1913 43.0944 49.4808 43.4328C49.5696 43.5716 49.6499 43.6288 49.7302 43.686Z" fill="#B8B8B8"/>
      <path d="M42.0249 44.178C42.3758 44.3713 42.5844 44.6424 42.5228 45.1095C42.1446 45.1573 41.7665 45.1567 41.3346 45.1557C41.2422 45.0204 41.2036 44.8854 41.2074 44.7082C41.5082 44.5032 41.7666 44.3406 42.0249 44.178Z" fill="#B8B8B8"/>
      <path d="M50.8532 38.2448C50.9286 38.1242 51.0029 38.0608 51.1713 37.917C51.1713 38.6801 51.1743 39.3562 51.1625 40.032C51.1619 40.0663 51.0338 40.0984 50.9165 40.1283C50.8627 39.5174 50.8574 38.9097 50.8532 38.2448Z" fill="#A09995"/>
      <path d="M45.7624 45.2061C46.0199 45.1199 46.29 45.0462 46.5583 45.0515C47.0388 45.0611 47.5182 45.1184 48.0554 45.1562C48.0899 45.2125 48.0661 45.3173 48.0444 45.3169C47.2875 45.3021 46.5309 45.2774 45.7624 45.2061Z" fill="#B8B8B8"/>
      <path d="M41.6543 37.7038C41.7075 37.7004 41.7607 37.697 41.8538 37.6917C44.6686 37.6971 47.4436 37.7045 50.2751 37.7166C50.3397 37.7662 50.3477 37.811 50.3635 37.8889C50.3713 37.922 50.356 37.9356 50.291 37.9418C47.6165 37.949 45.007 37.9499 42.3424 37.9491C42.0495 37.9584 41.8117 37.9694 41.4905 37.9842C41.4905 39.8273 41.4905 41.6017 41.4905 43.3192C42.0069 42.9082 42.4881 42.4576 43.0407 42.1205C43.2451 41.9958 43.6233 42.1104 43.9119 42.1672C44.1676 42.2176 44.4499 42.4638 44.6473 42.4009C44.9729 42.2972 45.4069 42.1335 45.301 41.6055C45.8152 41.3226 46.2871 41.0463 46.7484 40.8089C46.6148 41.0196 46.4918 41.1914 46.3689 41.3631C46.3689 41.3631 46.3725 41.3666 46.326 41.3692C45.6147 41.5748 45.5684 42.2418 45.2484 42.7035C45.2484 42.7035 45.2546 42.711 45.2019 42.708C44.7337 42.7851 44.3182 42.8652 43.9026 42.9452C43.9026 42.9452 43.8911 42.9458 43.8808 42.9076C43.4364 42.261 43.0245 42.1884 42.6683 42.6723C42.5532 42.8286 42.491 43.0225 42.361 43.204C42.1896 43.3849 42.0851 43.5852 41.928 43.7307C41.749 43.8964 41.5232 44.0132 41.3178 44.1513C41.2623 43.9511 41.1603 43.7514 41.1588 43.5508C41.1459 41.9277 41.1712 40.304 41.1397 38.6814C41.1308 38.2259 41.241 37.9072 41.6543 37.7038Z" fill="#E3E2E2"/>
      <path d="M41.603 37.7006C41.241 37.9074 41.1308 38.2261 41.1397 38.6816C41.1712 40.3042 41.1459 41.9279 41.1587 43.551C41.1603 43.7516 41.2623 43.9514 41.3177 44.1515C41.5232 44.0134 41.749 43.8966 41.928 43.7309C42.0851 43.5855 42.1896 43.3851 42.3912 43.2021C42.4649 43.1951 42.5256 43.1969 42.5256 43.1969C42.362 43.495 42.1983 43.793 42.0298 44.1345C41.7666 44.3406 41.5082 44.5032 41.2036 44.6659C41.056 44.4004 40.9546 44.135 40.8195 43.8406C40.7879 42.2705 40.7833 40.7292 40.7972 39.188C40.8003 38.8472 40.8681 38.5068 40.9077 38.1664C40.9521 37.7846 41.1846 37.6509 41.603 37.7006Z" fill="#C5C3C5"/>
      <path d="M46.759 40.7701C46.2871 41.0464 45.8152 41.3227 45.2633 41.6003C45.099 41.0483 44.7618 40.7499 44.3375 40.7927C43.8277 40.8441 43.313 40.8621 42.8004 40.862C42.7119 40.862 42.6235 40.7 42.5913 40.6165C43.0766 40.6202 43.5163 40.6754 43.93 40.5975C44.1425 40.5575 44.4201 40.3069 44.4713 40.1035C44.5602 39.7507 44.496 39.3605 44.496 39.1104C44.1237 38.9301 43.8735 38.809 43.6666 38.6796C43.8335 38.2793 43.7926 38.2436 43.3817 38.1832C43.0493 38.1344 42.7253 38.0305 42.3976 37.951C45.007 37.9501 47.6165 37.9492 50.2836 37.949C50.3434 39.6107 50.3498 41.2716 50.341 42.9325C50.3401 43.094 50.245 43.255 50.1936 43.4162C50.0414 43.3154 49.87 43.2342 49.7404 43.1105C49.1404 42.5379 48.552 41.9535 47.913 41.3676C47.8666 41.3619 47.8673 41.3595 47.8607 41.3201C47.7693 41.2309 47.6846 41.1812 47.5998 41.1315C47.5634 41.1168 47.5333 41.094 47.4938 40.9965C47.3939 40.8769 47.3097 40.8239 47.1787 40.7698C47.0076 40.7692 46.8833 40.7696 46.759 40.7701Z" fill="#F2F3F7"/>
      <path d="M42.5805 43.1969C42.5256 43.1968 42.465 43.195 42.4348 43.1972C42.491 43.0226 42.5533 42.8287 42.6683 42.6724C43.0245 42.1885 43.4364 42.2611 43.8781 42.9127C43.4689 43.0362 43.0522 43.1166 42.5805 43.1969Z" fill="#A09995"/>
      <path d="M45.2938 42.7016C45.5684 42.2419 45.6147 41.5749 46.3243 41.3674C46.0709 41.8422 45.9591 42.4605 45.2938 42.7016Z" fill="#C5C3C5"/>
      <path d="M43.9085 42.9938C44.3181 42.8654 44.7337 42.7853 45.1983 42.7048C44.9207 43.266 44.5463 43.3608 43.9085 42.9938Z" fill="#C5C3C5"/>
      <path d="M46.7484 40.8089C46.8833 40.7695 47.0075 40.769 47.1866 40.8061C47.2855 40.9031 47.3297 40.9625 47.3738 41.0219C47.0713 41.1329 46.7688 41.2438 46.4175 41.359C46.4918 41.1914 46.6148 41.0196 46.7484 40.8089Z" fill="#C5C3C5"/>
      <path d="M47.8638 41.6541C47.9485 41.7004 48.0332 41.7908 48.122 41.9231C48.0386 41.876 47.9511 41.787 47.8638 41.6541Z" fill="#C5C3C5"/>
      <path d="M48.3774 42.2446C48.4542 42.2635 48.529 42.324 48.6094 42.4226C48.5352 42.4026 48.4553 42.3444 48.3774 42.2446Z" fill="#C5C3C5"/>
      <path d="M47.4006 41.0182C47.3297 40.9626 47.2855 40.9032 47.2334 40.8074C47.3097 40.8239 47.3939 40.8769 47.4798 40.9718C47.4815 41.0138 47.4274 41.0144 47.4006 41.0182Z" fill="#E3E2E2"/>
      <path d="M47.8683 41.3619C47.8683 41.4172 47.8667 41.4723 47.8645 41.5687C47.7843 41.554 47.7047 41.4981 47.6628 41.4024C47.7562 41.3616 47.8117 41.3605 47.8673 41.3594C47.8673 41.3594 47.8666 41.3618 47.8683 41.3619Z" fill="#C5C3C5"/>
      <path d="M47.8607 41.32C47.8117 41.3606 47.7562 41.3617 47.659 41.3628C47.6135 41.3114 47.6096 41.2599 47.6028 41.1699C47.6846 41.1811 47.7693 41.2309 47.8607 41.32Z" fill="#E3E2E2"/>
      <path d="M49.7248 43.6469C49.65 43.6286 49.5697 43.5714 49.4879 43.4731C49.5641 43.4907 49.6417 43.5493 49.7248 43.6469Z" fill="#C5C3C5"/>
      <path d="M42.3424 37.9492C42.7253 38.0304 43.0493 38.1344 43.3817 38.1832C43.7926 38.2435 43.8335 38.2792 43.6168 38.6797C42.3618 38.7628 42.2637 38.8632 42.2886 39.9539C42.29 40.0144 42.2926 40.075 42.2613 40.1574C42.3277 40.2897 42.4274 40.4001 42.5297 40.536C42.5323 40.5615 42.535 40.6127 42.535 40.6127C42.6235 40.6999 42.7119 40.8619 42.8004 40.862C43.313 40.8621 43.8277 40.8441 44.3375 40.7926C44.7618 40.7498 45.099 41.0483 45.2211 41.6068C45.4069 42.1336 44.9729 42.2973 44.6473 42.401C44.4499 42.4639 44.1676 42.2177 43.9119 42.1673C43.6233 42.1105 43.2451 41.9959 43.0408 42.1206C42.4881 42.4577 42.0069 42.9083 41.4905 43.3193C41.4905 41.6018 41.4905 39.8274 41.4905 37.9843C41.8118 37.9695 42.0495 37.9585 42.3424 37.9492Z" fill="#F7F9FB"/>
      <path d="M42.5913 40.6163C42.535 40.6127 42.5323 40.5615 42.5271 40.4969C42.4461 40.3334 42.3704 40.2344 42.2946 40.1355C42.2926 40.0749 42.29 40.0144 42.2886 39.9539C42.2637 38.8632 42.3618 38.7627 43.5735 38.688C43.8735 38.8089 44.1237 38.93 44.496 39.1103C44.496 39.3604 44.5602 39.7506 44.4713 40.1034C44.4201 40.3068 44.1425 40.5574 43.93 40.5974C43.5163 40.6753 43.0766 40.6201 42.5913 40.6163ZM43.8922 39.7103C43.939 39.3372 43.8029 39.0954 43.3915 39.169C43.1738 39.208 42.848 39.3163 42.8016 39.4636C42.7429 39.6502 42.9004 40.0922 42.9967 40.1014C43.3014 40.1308 43.7655 40.4048 43.8922 39.7103Z" fill="#C7CBD0"/>
      <path d="M42.2613 40.1575C42.3704 40.2345 42.4461 40.3335 42.5244 40.4715C42.4273 40.4002 42.3277 40.2898 42.2613 40.1575Z" fill="#F2F3F7"/>
      <path d="M43.8901 39.7645C43.7655 40.4049 43.3014 40.1309 42.9967 40.1016C42.9004 40.0923 42.7428 39.6503 42.8016 39.4637C42.848 39.3164 43.1737 39.2081 43.3914 39.1691C43.8029 39.0955 43.939 39.3373 43.8901 39.7645Z" fill="#7E828A"/>
      </g>
      <defs>
      <clipPath id="clip0_79_7">
      <rect width="38" height="22" fill="white" transform="translate(27 30)"/>
      </clipPath>
      </defs>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="31" y="4" width="34" height="5" fill="#E0E0E0"/>
      <rect x="13" y="26" width="24" height="1" fill="#E0E0E0"/>
      <rect x="13" y="29" width="15" height="1" fill="#E0E0E0"/>
      <rect x="13" y="34" width="24" height="1" fill="#E0E0E0"/>
      <rect x="13" y="37" width="15" height="1" fill="#E0E0E0"/>
      <rect x="9" y="13" width="25" height="4" fill="#E0E0E0"/>
      <rect x="13" y="21" width="15" height="1" fill="#E0E0E0"/>
      <rect x="61" y="26" width="24" height="1" fill="#E0E0E0"/>
      <rect x="61" y="29" width="15" height="1" fill="#E0E0E0"/>
      <rect x="61" y="34" width="24" height="1" fill="#E0E0E0"/>
      <rect x="61" y="37" width="15" height="1" fill="#E0E0E0"/>
      <rect x="57" y="13" width="25" height="4" fill="#E0E0E0"/>
      <rect x="61" y="21" width="15" height="1" fill="#E0E0E0"/>
      <circle cx="58.5" cy="21.5" r="0.5" fill="#D9D9D9"/>
      <circle cx="58.5" cy="26.5" r="0.5" fill="#D9D9D9"/>
      <circle cx="58.5" cy="34.5" r="0.5" fill="#D9D9D9"/>
      <circle cx="10.5" cy="21.5" r="0.5" fill="#D9D9D9"/>
      <circle cx="10.5" cy="26.5" r="0.5" fill="#D9D9D9"/>
      <circle cx="10.5" cy="34.5" r="0.5" fill="#D9D9D9"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="31" y="4" width="34" height="5" fill="#E0E0E0"/>
      <rect x="8" y="21" width="20" height="1" fill="#E0E0E0"/>
      <rect x="11" y="24" width="15" height="1" fill="#E0E0E0"/>
      <path d="M18.3142 19V15.658H17.5102V15.223C17.7642 15.223 17.9652 15.202 18.1132 15.16C18.2632 15.116 18.3722 15.052 18.4402 14.968C18.5102 14.884 18.5502 14.782 18.5602 14.662H19.0582V19H18.3142Z" fill="#E0E0E0"/>
      <rect x="8" y="37" width="20" height="1" fill="#E0E0E0"/>
      <rect x="11" y="40" width="15" height="1" fill="#E0E0E0"/>
      <path d="M18.3523 35L18.3553 33.971H16.3363V33.35L18.3343 30.662H19.0603V33.35H19.7533V33.971H19.0603V35H18.3523ZM17.0203 33.35H18.3493V31.568L17.0203 33.35Z" fill="#E0E0E0"/>
      <rect x="38" y="21" width="20" height="1" fill="#E0E0E0"/>
      <rect x="41" y="24" width="15" height="1" fill="#E0E0E0"/>
      <path d="M46.5024 19V18.61V18.409C46.5024 18.187 46.5434 17.996 46.6254 17.836C46.7074 17.674 46.8164 17.533 46.9524 17.413C47.0884 17.293 47.2374 17.187 47.3994 17.095C47.5634 17.001 47.7254 16.913 47.8854 16.831C48.0474 16.747 48.1964 16.661 48.3324 16.573C48.4684 16.483 48.5774 16.383 48.6594 16.273C48.7434 16.163 48.7854 16.032 48.7854 15.88C48.7854 15.686 48.7164 15.528 48.5784 15.406C48.4424 15.282 48.2574 15.22 48.0234 15.22C47.7754 15.22 47.5704 15.291 47.4084 15.433C47.2484 15.575 47.1534 15.775 47.1234 16.033H46.4154C46.4194 15.769 46.4824 15.529 46.6044 15.313C46.7264 15.097 46.9074 14.925 47.1474 14.797C47.3874 14.667 47.6864 14.602 48.0444 14.602C48.3544 14.602 48.6214 14.656 48.8454 14.764C49.0714 14.87 49.2454 15.019 49.3674 15.211C49.4914 15.401 49.5534 15.623 49.5534 15.877C49.5534 16.099 49.5124 16.289 49.4304 16.447C49.3504 16.605 49.2434 16.742 49.1094 16.858C48.9774 16.972 48.8314 17.073 48.6714 17.161C48.5134 17.249 48.3544 17.332 48.1944 17.41C48.0364 17.486 47.8904 17.566 47.7564 17.65C47.6244 17.732 47.5174 17.826 47.4354 17.932C47.3554 18.038 47.3154 18.165 47.3154 18.313V18.376H49.5624V19H46.5024Z" fill="#E0E0E0"/>
      <rect x="38" y="37" width="20" height="1" fill="#E0E0E0"/>
      <rect x="41" y="40" width="15" height="1" fill="#E0E0E0"/>
      <path d="M48.0625 35.066C47.7865 35.066 47.5295 35.021 47.2915 34.931C47.0555 34.839 46.8515 34.713 46.6795 34.553C46.5095 34.393 46.3825 34.21 46.2985 34.004L46.8895 33.692C46.9635 33.84 47.0515 33.973 47.1535 34.091C47.2575 34.209 47.3785 34.302 47.5165 34.37C47.6565 34.436 47.8165 34.469 47.9965 34.469C48.2785 34.469 48.5045 34.391 48.6745 34.235C48.8465 34.077 48.9325 33.867 48.9325 33.605C48.9325 33.443 48.8925 33.299 48.8125 33.173C48.7345 33.047 48.6275 32.949 48.4915 32.879C48.3575 32.807 48.2045 32.771 48.0325 32.771C47.9305 32.771 47.8345 32.78 47.7445 32.798C47.6565 32.816 47.5675 32.85 47.4775 32.9C47.3875 32.948 47.2905 33.021 47.1865 33.119C47.1665 33.129 47.1515 33.134 47.1415 33.134C47.1335 33.132 47.1185 33.126 47.0965 33.116L46.5355 32.888L46.7335 30.662H49.4305L49.4035 31.271H47.3275L47.2285 32.477C47.3825 32.369 47.5375 32.291 47.6935 32.243C47.8495 32.195 48.0215 32.171 48.2095 32.171C48.4855 32.171 48.7365 32.225 48.9625 32.333C49.1885 32.441 49.3685 32.6 49.5025 32.81C49.6365 33.02 49.7035 33.277 49.7035 33.581C49.7035 33.885 49.6355 34.148 49.4995 34.37C49.3655 34.592 49.1755 34.764 48.9295 34.886C48.6855 35.006 48.3965 35.066 48.0625 35.066Z" fill="#E0E0E0"/>
      <rect x="65" y="21" width="20" height="1" fill="#E0E0E0"/>
      <rect x="68" y="24" width="15" height="1" fill="#E0E0E0"/>
      <path d="M74.9268 19.066C74.6008 19.064 74.3198 19.008 74.0838 18.898C73.8478 18.788 73.6638 18.631 73.5318 18.427C73.4018 18.223 73.3338 17.981 73.3278 17.701H74.0388C74.0808 17.959 74.1828 18.151 74.3448 18.277C74.5088 18.401 74.7078 18.463 74.9418 18.463C75.1358 18.463 75.3038 18.434 75.4458 18.376C75.5878 18.316 75.6968 18.234 75.7728 18.13C75.8508 18.026 75.8898 17.905 75.8898 17.767C75.8898 17.621 75.8478 17.496 75.7638 17.392C75.6818 17.288 75.5688 17.208 75.4248 17.152C75.2808 17.096 75.1188 17.066 74.9388 17.062L74.5368 17.05V16.456L74.9088 16.441C75.0808 16.435 75.2318 16.402 75.3618 16.342C75.4938 16.282 75.5968 16.203 75.6708 16.105C75.7448 16.007 75.7818 15.897 75.7818 15.775C75.7818 15.663 75.7468 15.562 75.6768 15.472C75.6088 15.382 75.5118 15.312 75.3858 15.262C75.2598 15.21 75.1108 15.184 74.9388 15.184C74.7928 15.184 74.6558 15.21 74.5278 15.262C74.3998 15.314 74.2938 15.398 74.2098 15.514C74.1278 15.628 74.0828 15.778 74.0748 15.964H73.3668C73.3668 15.668 73.4378 15.419 73.5798 15.217C73.7218 15.013 73.9118 14.86 74.1498 14.758C74.3898 14.654 74.6558 14.602 74.9478 14.602C75.2618 14.602 75.5398 14.645 75.7818 14.731C76.0258 14.815 76.2168 14.942 76.3548 15.112C76.4948 15.282 76.5648 15.493 76.5648 15.745C76.5648 15.959 76.4998 16.15 76.3698 16.318C76.2398 16.486 76.0348 16.618 75.7548 16.714C75.9288 16.762 76.0848 16.834 76.2228 16.93C76.3608 17.024 76.4698 17.142 76.5498 17.284C76.6318 17.426 76.6728 17.593 76.6728 17.785C76.6728 17.991 76.6278 18.174 76.5378 18.334C76.4498 18.494 76.3258 18.629 76.1658 18.739C76.0078 18.847 75.8228 18.929 75.6108 18.985C75.3988 19.039 75.1708 19.066 74.9268 19.066Z" fill="#E0E0E0"/>
      <rect x="65" y="37" width="20" height="1" fill="#E0E0E0"/>
      <rect x="68" y="40" width="15" height="1" fill="#E0E0E0"/>
      <path d="M75.0703 35.066C74.7163 35.066 74.4103 34.978 74.1523 34.802C73.8943 34.626 73.6953 34.377 73.5553 34.055C73.4173 33.731 73.3483 33.348 73.3483 32.906C73.3483 32.436 73.4173 32.029 73.5553 31.685C73.6933 31.339 73.8933 31.072 74.1553 30.884C74.4193 30.696 74.7383 30.602 75.1123 30.602C75.3683 30.602 75.6053 30.65 75.8233 30.746C76.0413 30.84 76.2203 30.976 76.3603 31.154C76.5003 31.332 76.5823 31.547 76.6063 31.799H75.9313C75.8753 31.605 75.7793 31.455 75.6433 31.349C75.5073 31.243 75.3353 31.19 75.1273 31.19C74.8973 31.19 74.7053 31.255 74.5513 31.385C74.3973 31.515 74.2863 31.702 74.2183 31.946C74.1523 32.188 74.1313 32.478 74.1553 32.816C74.2173 32.698 74.3013 32.596 74.4073 32.51C74.5133 32.422 74.6343 32.354 74.7703 32.306C74.9063 32.258 75.0503 32.234 75.2023 32.234C75.4923 32.234 75.7463 32.289 75.9643 32.399C76.1823 32.509 76.3523 32.665 76.4743 32.867C76.5963 33.069 76.6573 33.308 76.6573 33.584C76.6573 33.87 76.5913 34.125 76.4593 34.349C76.3273 34.571 76.1423 34.746 75.9043 34.874C75.6663 35.002 75.3883 35.066 75.0703 35.066ZM75.0523 34.493C75.2083 34.493 75.3483 34.456 75.4723 34.382C75.5983 34.308 75.6973 34.205 75.7693 34.073C75.8433 33.941 75.8803 33.789 75.8803 33.617C75.8803 33.441 75.8463 33.292 75.7783 33.17C75.7103 33.048 75.6133 32.955 75.4873 32.891C75.3633 32.827 75.2173 32.795 75.0493 32.795C74.9113 32.795 74.7773 32.827 74.6473 32.891C74.5193 32.955 74.4143 33.038 74.3323 33.14C74.2523 33.242 74.2123 33.351 74.2123 33.467C74.2103 33.673 74.2443 33.853 74.3143 34.007C74.3843 34.161 74.4823 34.281 74.6083 34.367C74.7363 34.451 74.8843 34.493 75.0523 34.493Z" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="31" y="4" width="34" height="5" fill="#E0E0E0"/>
      <rect x="19.2005" y="19" width="20" height="6.20053" transform="rotate(89.7427 19.2005 19)" fill="#E0E0E0"/>
      <rect x="26.0753" y="24.0022" width="15" height="5.07532" transform="rotate(89.7427 26.0753 24.0022)" fill="#E0E0E0"/>
      <rect x="33.1065" y="30.9663" width="8.04078" height="5.07532" transform="rotate(89.7427 33.1065 30.9663)" fill="#E0E0E0"/>
      <rect x="48" y="21" width="20" height="1" fill="#E0E0E0"/>
      <rect x="48" y="24" width="15" height="1" fill="#E0E0E0"/>
      <rect x="48" y="31" width="20" height="1" fill="#E0E0E0"/>
      <rect x="48" y="34" width="15" height="1" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="32" y="5" width="34" height="5" fill="#E0E0E0"/>
      <rect x="20" y="18" width="56" height="4" fill="#E0E0E0"/>
      <rect x="20" y="25" width="56" height="0.3" fill="#E0E0E0"/>
      <rect x="20.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 20.2211 19)" fill="#E0E0E0"/>
      <rect x="34.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 34.2211 19)" fill="#E0E0E0"/>
      <rect x="49.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 49.2211 19)" fill="#E0E0E0"/>
      <rect x="63.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 63.2211 19)" fill="#E0E0E0"/>
      <rect x="76.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 76.2211 19)" fill="#E0E0E0"/>
      <rect x="20" y="29" width="56" height="0.3" fill="#E0E0E0"/>
      <rect x="20" y="33" width="56" height="0.3" fill="#E0E0E0"/>
      <rect x="20" y="37" width="56" height="0.3" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="32" y="5" width="34" height="5" fill="#E0E0E0"/>
      <rect x="20" y="18" width="56" height="4" fill="#E0E0E0"/>
      <rect x="20" y="25" width="56" height="0.3" fill="#E0E0E0"/>
      <rect x="20.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 20.2211 19)" fill="#E0E0E0"/>
      <rect x="34.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 34.2211 19)" fill="#E0E0E0"/>
      <rect x="49.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 49.2211 19)" fill="#E0E0E0"/>
      <rect x="63.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 63.2211 19)" fill="#E0E0E0"/>
      <rect x="76.2211" y="19" width="18.0741" height="0.22111" transform="rotate(89.7177 76.2211 19)" fill="#E0E0E0"/>
      <rect x="20" y="29" width="56" height="0.3" fill="#E0E0E0"/>
      <rect x="20" y="33" width="56" height="0.3" fill="#E0E0E0"/>
      <rect x="20" y="37" width="56" height="0.3" fill="#E0E0E0"/>
      </svg>
      `,
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
    icon: `<svg width="95" height="60" viewBox="0 0 94 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="93.5" height="52.5" rx="1.75" fill="#FEFEFE" stroke="#E0E0E0" stroke-width="0.5"/>
      <rect x="31" y="5" width="34" height="5" fill="#E0E0E0"/>
      <rect x="6" y="21" width="22" height="2" fill="#E0E0E0"/>
      <rect x="6" y="25" width="13" height="1" fill="#E0E0E0"/>
      <ellipse cx="46.5" cy="29" rx="11.5" ry="11" fill="#D9D9D9"/>
      <circle cx="4.5" cy="22.5" r="0.5" fill="#D9D9D9"/>
      <rect x="6" y="33" width="22" height="2" fill="#E0E0E0"/>
      <rect x="6" y="37" width="13" height="1" fill="#E0E0E0"/>
      <circle cx="4.5" cy="34.5" r="0.5" fill="#D9D9D9"/>
      <rect x="66" y="20" width="22" height="2" fill="#E0E0E0"/>
      <rect x="66" y="24" width="13" height="1" fill="#E0E0E0"/>
      <circle cx="64.5" cy="21.5" r="0.5" fill="#D9D9D9"/>
      <rect x="66" y="32" width="22" height="2" fill="#E0E0E0"/>
      <rect x="66" y="36" width="13" height="1" fill="#E0E0E0"/>
      <circle cx="64.5" cy="33.5" r="0.5" fill="#D9D9D9"/>
      </svg>
      `,
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
    uploadedVideoPosition: {
      // ✅ RIGHT IMAGE VIDEO POSITION - Based on measured right image container
      // Right image positioned on right half of slide (rightImagePath)
      // Measured position: X: 960px, Y: 0px, Width: 960px, Height: 1080px
      x: 960,       // ✅ Measured: 960px (right half of slide starts here)
      y: 0,         // ✅ Measured: 0px (starts at top of slide)
      width: 960,   // ✅ Measured: 960px (right half width: 1920 - 960 = 960px)
      height: 1080, // ✅ Measured: 1080px (full slide height)
      shape: 'rectangle' // Default rectangular shape for uploaded videos
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
      profileImageAlt: 'Profile image'
    },
    propSchema: {
      title: { type: 'text', label: 'Title', required: true, maxLength: 100 },
      content: { type: 'text', label: 'Content', required: true, maxLength: 300 },
      profileImagePath: { type: 'image', label: 'Profile Image' },
      profileImageAlt: { type: 'text', label: 'Profile Image Alt Text' }
    }
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