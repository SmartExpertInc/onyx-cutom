"use client";

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Eye, Plus } from 'lucide-react';

import CustomViewCard, { defaultContentTypes as defaultCardContentTypes } from '@/components/ui/custom-view-card';
import { TrainingPlanData, Lesson } from '@/types/projectSpecificTypes';

export type LessonContentStatusMap = {
  [key: string]: {
    presentation: { exists: boolean; productId?: number };
    onePager: { exists: boolean; productId?: number };
    quiz: { exists: boolean; productId?: number };
    videoLesson: { exists: boolean; productId?: number };
  };
};

type RegenerateRequest = {
  lesson: Lesson;
  contentType: string;
  existingProductId: number | null;
};

type CourseMetrics = {
  completed: number;
  estimatedDuration: string;
  estimatedCompletionTime: string;
  creditsUsed: number;
  creditsTotal: number;
  progress: number;
  totalModules?: number;
  totalLessons?: number;
};

type CourseDisplayProps = {
  t: (key: string, fallback: string) => string;
  trainingPlanData: TrainingPlanData | null;
  collapsedSections?: Record<number, boolean>;
  onToggleSectionCollapse?: (index: number) => void;
  columnVideoLessonEnabled?: boolean;
  lessonContentStatus?: LessonContentStatusMap;
  onAddContent?: (lesson: Lesson, contentType: string) => void;
  onRequestRegenerate?: (payload: RegenerateRequest) => void;
  onViewProduct?: (productId: number, contentType?: string) => void;
  productId?: string;
  metrics?: CourseMetrics;
  contentTypes?: typeof defaultCardContentTypes;
  sources?: { type: string; name: string; icon: React.ReactNode }[];
  showMetricsCard?: boolean;
};

const CustomTooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom';
  disabled?: boolean;
}> = ({ children, content, position = 'bottom', disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const elementRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      if (position === 'top') {
        setTooltipPosition({
          top: rect.top - 6,
          left: rect.left + rect.width / 2
        });
      } else {
        setTooltipPosition({
          top: rect.bottom + 6,
          left: rect.left + rect.width / 2
        });
      }
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={elementRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {!disabled && isVisible && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: position === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)'
          }}
        >
          <div className="bg-blue-500 text-white px-1.5 py-1 rounded-md shadow-lg text-xs whitespace-nowrap relative max-w-xs">
            <div className="font-medium">{content}</div>
            <div className={`absolute ${position === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2`}>
              <div className={`w-0 h-0 border-l-3 border-r-3 ${position === 'top' ? 'border-t-3 border-t-blue-500' : 'border-b-3 border-b-blue-500'} border-l-transparent border-r-transparent`}></div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const getSlavicPluralForm = (count: number): 'one' | 'few' | 'many' => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return 'one';
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return 'few';
  return 'many';
};

const deriveSourcesFromTrainingPlan = (
  trainingPlanData: TrainingPlanData | null,
  t: (key: string, fallback: string) => string
) => {
  const sources = new Set<string>();

  const createdFromScratchLabel = t('interface.customViewCard.source.createdfromscratch', 'Created from scratch');

  if (trainingPlanData?.sections) {
    trainingPlanData.sections.forEach(section => {
      section.lessons?.forEach(lesson => {
        if (lesson.source) {
          const match = lesson.source.match(/Connector Search:\s*(.+)/i);
          if (match) {
            sources.add(match[1]);
          } else if (lesson.source.includes('PDF') || lesson.source.includes('Document')) {
            sources.add('PDF Document');
          } else if (lesson.source.includes('text') || lesson.source.includes('Text') || lesson.source === 'Create from scratch') {
            sources.add(createdFromScratchLabel);
          } else {
            sources.add(lesson.source);
          }
        }
      });
    });
  }

  const getConnectorIcon = (connectorName: string) => {
    const connectorMap: { [key: string]: React.ReactNode } = {
      'notion': <img src="/Notion.png" alt="Notion" className="w-5 h-5" />,
      'google_drive': <img src="/GoogleDrive.png" alt="Google Drive" className="w-5 h-5" />,
      'dropbox': <img src="/Dropbox.png" alt="Dropbox" className="w-5 h-5" />,
      'slack': <img src="/Slack.png" alt="Slack" className="w-5 h-5" />,
      'confluence': <img src="/Confluence.svg" alt="Confluence" className="w-5 h-5" />,
      'github': <img src="/Github.png" alt="GitHub" className="w-5 h-5" />,
      'gitlab': <img src="/Gitlab.png" alt="GitLab" className="w-5 h-5" />,
      'jira': <img src="/Jira.svg" alt="Jira" className="w-5 h-5" />,
      'asana': <img src="/Asana.png" alt="Asana" className="w-5 h-5" />,
      'salesforce': <img src="/Salesforce.png" alt="Salesforce" className="w-5 h-5" />,
      'hubspot': <img src="/HubSpot.png" alt="HubSpot" className="w-5 h-5" />,
      'airtable': <img src="/Airtable.svg" alt="Airtable" className="w-5 h-5" />,
      'teams': <img src="/Teams.png" alt="Microsoft Teams" className="w-5 h-5" />,
      'gmail': <img src="/Gmail.png" alt="Gmail" className="w-5 h-5" />,
      'zendesk': <img src="/Zendesk.svg" alt="Zendesk" className="w-5 h-5" />,
      'PDF Document': <svg className="text-red-500" width={17} height={17} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.37 8.87988H17.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M6.38 8.87988L7.13 9.62988L9.38 7.37988" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12.37 15.8799H17.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M6.38 15.8799L7.13 16.6299L9.38 14.3799" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>,
      [createdFromScratchLabel]: <svg className="text-gray-700" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
    };

    return connectorMap[connectorName] ||
      <svg className="text-gray-800" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>;
  };

  return Array.from(sources).map(source => ({
    type: source === 'PDF Document' || source === createdFromScratchLabel ? 'file' : 'connector',
    name: source,
    icon: getConnectorIcon(source)
  }));
};

const CourseDisplay: React.FC<CourseDisplayProps> = ({
  t,
  trainingPlanData,
  collapsedSections,
  onToggleSectionCollapse,
  columnVideoLessonEnabled = false,
  lessonContentStatus = {},
  onAddContent,
  onRequestRegenerate,
  onViewProduct,
  productId,
  metrics,
  contentTypes = defaultCardContentTypes,
  sources,
  showMetricsCard = false
}) => {
  const [internalCollapsedSections, setInternalCollapsedSections] = useState<Record<number, boolean>>({});

  const sectionsToUse = collapsedSections ?? internalCollapsedSections;

  const totalModules = trainingPlanData?.sections?.length || 0;
  const totalLessons = trainingPlanData?.sections?.reduce(
    (acc, section) => acc + (section.lessons?.length || 0),
    0
  ) || 0;

  const computedDuration = useMemo(() => {
    if (totalLessons === 0) return "0h 0m";
    const hours = Math.ceil(totalLessons * 0.5);
    const minutes = Math.ceil((totalLessons * 0.5 % 1) * 60);
    return `${hours}h ${minutes}m`;
  }, [totalLessons]);

  const metricsWithFallback = useMemo(() => ({
    totalModules,
    totalLessons,
    completed: metrics?.completed ?? 0,
    estimatedDuration: metrics?.estimatedDuration ?? computedDuration,
    estimatedCompletionTime: metrics?.estimatedCompletionTime ?? computedDuration,
    creditsUsed: metrics?.creditsUsed ?? 5,
    creditsTotal: metrics?.creditsTotal ?? 100,
    progress: metrics?.progress ?? (totalLessons > 0 ? Math.round((metrics?.completed ?? 0) / totalLessons * 100) : 0)
  }), [computedDuration, metrics, totalLessons, totalModules]);

  const derivedSources = useMemo(() => sources ?? deriveSourcesFromTrainingPlan(trainingPlanData, t), [sources, trainingPlanData, t]);

  const handleToggleSection = (index: number) => {
    if (onToggleSectionCollapse) {
      onToggleSectionCollapse(index);
    } else {
      setInternalCollapsedSections(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    }
  };

  const renderRegenerateButton = (
    lesson: Lesson,
    contentType: string,
    existingProductId: number | null,
    disabled: boolean
  ) => {
    const clickHandler = disabled ? undefined : () => onRequestRegenerate?.({ lesson, contentType, existingProductId });

    return (
      <div className={`w-[30px] h-[30px] rounded-full bg-[#0F58F9] flex items-center justify-center transition-all duration-200 ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-blue-600 group-hover:-translate-x-2'}`}
        onClick={clickHandler}
      >
        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 2.41421H2.33333C1.97971 2.41421 1.64057 2.55469 1.39052 2.80474C1.14048 3.05479 1 3.39392 1 3.74755V13.0809C1 13.4345 1.14048 13.7736 1.39052 14.0237C1.64057 14.2737 1.97971 14.4142 2.33333 14.4142H11.6667C12.0203 14.4142 12.3594 14.2737 12.6095 14.0237C12.8595 13.7736 13 13.4345 13 13.0809V8.41421M12 1.41421C12.2652 1.149 12.6249 1 13 1C13.3751 1 13.7348 1.149 14 1.41421C14.2652 1.67943 14.4142 2.03914 14.4142 2.41421C14.4142 2.78929 14.2652 3.149 14 3.41421L7.66667 9.74755L5 10.4142L5.66667 7.74755L12 1.41421Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  };

  const renderAddButton = (lesson: Lesson, contentType: string, disabled: boolean) => {
    const clickHandler = disabled ? undefined : () => onAddContent?.(lesson, contentType);
    return (
      <div
        className={`w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center transition-colors ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
        style={{ border: '1px solid #0F58F9' }}
        onClick={clickHandler}
      >
        <Plus size={15} strokeWidth={2} className="text-[#0F58F9]" />
      </div>
    );
  };

  const renderViewButton = (productId: number | undefined, contentType: string) => {
    const disabled = !productId || !onViewProduct;
    const clickHandler = disabled ? undefined : () => onViewProduct?.(productId!, contentType);
    return (
      <div
        className={`w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center transition-colors ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
        style={{ border: '1px solid #0F58F9' }}
        onClick={clickHandler}
      >
        <Eye size={15} strokeWidth={2} className="text-[#0F58F9]" />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-8 lg:px-[100px]">
      <div className="lg:col-span-3 space-y-4 pb-4">
        {(() => {
          if (!trainingPlanData?.sections) {
            return (
              <div className="bg-white rounded-lg p-[25px]">
                <p className="text-[#9A9DA2]">{t('interface.viewNew.noModulesFound', 'No modules found in this course outline.')}</p>
              </div>
            );
          }

          return trainingPlanData.sections.map((section, index) => {
            const sectionLessonsCount = section.lessons?.length || 0;
            const isCollapsed = sectionsToUse[index];

            return (
              <div key={section.id || index} className="bg-[#F9F9F9] rounded-lg border border-[#E0E0E0] overflow-hidden">
                <div className="bg-[#CCDBFC] px-[12px] py-[24px]">
                  <div className="group flex items-center gap-2">
                    <button
                      className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-transform duration-300"
                      style={{ backgroundColor: '#719AF5' }}
                      onClick={() => handleToggleSection(index)}
                    >
                      <ChevronDown size={14} className={`text-white transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>
                    <h2 className="text-[#0F58F9] font-semibold text-[20px] leading-[100%]">
                      {t('interface.viewNew.moduleTitle', 'Module')} {index + 1}: {section.title}
                    </h2>
                    <span className="bg-white text-[#A5A5A5] text-[12px] px-2 py-[5px] rounded-full">
                      {sectionLessonsCount} {(() => {
                        const form = getSlavicPluralForm(sectionLessonsCount);
                        if (form === 'one') return t('interface.viewNew.lesson', 'Lesson');
                        if (form === 'few') return t('interface.viewNew.lessonsGenitiveSingle', 'Lessons');
                        return t('interface.viewNew.lessonsGenitivePlural', 'Lessons');
                      })()}
                    </span>
                  </div>
                </div>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isCollapsed ? '0' : '10000px',
                    opacity: isCollapsed ? 0 : 1
                  }}
                >
                  <div className="p-[25px] pt-0">
                    <div
                      className="grid mb-4 gap-4 items-center px-[25px] py-[10px] mx-[-25px]"
                      style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 100px' : ''} 100px 100px 100px`, borderBottom: '1px solid #E0E0E0' }}
                    >
                      <div className="text-[14px] font-medium text-[#4D4D4D]">
                        {t('interface.viewNew.lessons', 'Lessons')}
                      </div>
                      {columnVideoLessonEnabled && (
                        <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.99967 11.3333V14M5.33301 14H10.6663M6.66634 4.66667L9.99967 6.66667L6.66634 8.66667V4.66667ZM2.66634 2H13.333C14.0694 2 14.6663 2.59695 14.6663 3.33333V10C14.6663 10.7364 14.0694 11.3333 13.333 11.3333H2.66634C1.92996 11.3333 1.33301 10.7364 1.33301 10V3.33333C1.33301 2.59695 1.92996 2 2.66634 2Z" stroke="#0AFFEA" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{t('interface.viewNew.videoLesson', 'Video Lesson')}</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.66699 6.86732C6.80033 6.60065 7.00033 6.33398 7.26699 6.20065C7.54308 6.04103 7.86539 5.98046 8.18059 6.02895C8.49579 6.07745 8.78498 6.2321 9.00033 6.46732C9.20033 6.73398 9.33366 7.00065 9.33366 7.33398C9.33366 8.20065 8.00033 8.66732 8.00033 8.66732M8.00033 11.334H8.00699M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="#FF960A" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('interface.viewNew.quiz', 'Quiz')}</span>
                      </div>
                      <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3333 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H13.3333C13.7015 6.66667 14 6.36819 14 6V2.66667C14 2.29848 13.7015 2 13.3333 2Z" stroke="#D60AFF" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.33333 9.33333H2.66667C2.29848 9.33333 2 9.63181 2 10V13.3333C2 13.7015 2.29848 14 2.66667 14H7.33333C7.70152 14 8 13.7015 8 13.3333V10C8 9.63181 7.70152 9.33333 7.33333 9.33333Z" stroke="#D60AFF" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.3333 9.33333H11.3333C10.9651 9.33333 10.6667 9.63181 10.6667 10V13.3333C10.6667 13.7015 10.9651 14 11.3333 14H13.3333C13.7015 14 14 13.7015 14 13.3333V10C14 9.63181 13.7015 9.33333 13.3333 9.33333Z" stroke="#D60AFF" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('interface.viewNew.presentation', 'Presentation')}</span>
                      </div>
                      <div className="flex flex-col items-center text-[12px] font-medium text-[#4D4D4D] justify-center gap-1 p-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.33366 1.33398V5.33398H13.3337M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('interface.viewNew.onePager', 'One-Pager')}</span>
                      </div>
                    </div>

                    {section.lessons && section.lessons.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const lessonKey = lesson.id || lesson.title;
                          const status = lessonContentStatus[lessonKey] || {
                            presentation: { exists: false },
                            onePager: { exists: false },
                            quiz: { exists: false },
                            videoLesson: { exists: false }
                          };
                          const hasPresentation = status.presentation.exists;
                          const hasOnePager = status.onePager.exists;
                          const hasQuiz = status.quiz.exists;
                          const hasVideoLesson = status.videoLesson.exists;

                          const createdCount = [hasPresentation, hasOnePager, hasQuiz, hasVideoLesson].filter(Boolean).length;
                          const totalProducts = columnVideoLessonEnabled ? 4 : 3;
                          const actualCreatedCount = columnVideoLessonEnabled ? createdCount : [hasPresentation, hasOnePager, hasQuiz].filter(Boolean).length;

                          const videoLessonProductId = status.videoLesson.productId;
                          const quizProductId = status.quiz.productId;
                          const presentationProductId = status.presentation.productId;
                          const onePagerProductId = status.onePager.productId;

                          return (
                            <div
                              key={lesson?.id || lessonIndex}
                              className="grid gap-4 items-center pl-[24px] py-[16px] rounded-md"
                              style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 100px' : ''} 100px 100px 100px`, border: '1px solid #E0E0E0' }}
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#171718] text-[16px] font-medium">{lessonIndex + 1}.</span>
                                  <span className="text-[#191D30] text-[16px] leading-[100%] font-medium">
                                    {lesson.title.replace(/^\d+\.\d*\.?\s*/, '')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 ml-6">
                                  <div className="relative w-32 h-[3px] bg-[#CCDBFC] rounded-full overflow-hidden">
                                    <div
                                      className="absolute top-0 left-0 h-full bg-[#719AF5] rounded-full transition-all duration-300"
                                      style={{ width: `${(actualCreatedCount / totalProducts) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[#A5A5A5] text-[9px]">{actualCreatedCount}/{totalProducts} {t('interface.viewNew.created', 'created')}</span>
                                </div>
                              </div>

                              {columnVideoLessonEnabled && (
                                <div className="flex items-center justify-center">
                                  {hasVideoLesson ? (
                                    <div className="relative group flex items-center justify-center">
                                      <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top" disabled={!onRequestRegenerate}>
                                        {renderRegenerateButton(lesson, 'video-lesson', videoLessonProductId ?? null, !onRequestRegenerate)}
                                      </CustomTooltip>
                                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                        <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top" disabled={!onViewProduct}>
                                          {renderViewButton(videoLessonProductId, 'video-lesson')}
                                        </CustomTooltip>
                                      </div>
                                    </div>
                                  ) : (
                                    <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top" disabled={!onAddContent}>
                                      {renderAddButton(lesson, 'video-lesson', !onAddContent)}
                                    </CustomTooltip>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-center">
                                {hasQuiz ? (
                                  <div className="relative group flex items-center justify-center">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top" disabled={!onRequestRegenerate}>
                                      {renderRegenerateButton(lesson, 'quiz', quizProductId ?? null, !onRequestRegenerate)}
                                    </CustomTooltip>
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                      <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top" disabled={!onViewProduct}>
                                        {renderViewButton(quizProductId, 'quiz')}
                                      </CustomTooltip>
                                    </div>
                                  </div>
                                ) : (
                                  <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top" disabled={!onAddContent}>
                                    {renderAddButton(lesson, 'quiz', !onAddContent)}
                                  </CustomTooltip>
                                )}
                              </div>

                              <div className="flex items-center justify-center">
                                {hasPresentation ? (
                                  <div className="relative group flex items-center justify-center">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top" disabled={!onRequestRegenerate}>
                                      {renderRegenerateButton(lesson, 'presentation', presentationProductId ?? null, !onRequestRegenerate)}
                                    </CustomTooltip>
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                      <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top" disabled={!onViewProduct}>
                                        {renderViewButton(presentationProductId, 'presentation')}
                                      </CustomTooltip>
                                    </div>
                                  </div>
                                ) : (
                                  <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top" disabled={!onAddContent}>
                                    {renderAddButton(lesson, 'presentation', !onAddContent)}
                                  </CustomTooltip>
                                )}
                              </div>

                              <div className="flex items-center justify-center">
                                {hasOnePager ? (
                                  <div className="relative group flex items-center justify-center">
                                    <CustomTooltip content={t('interface.viewNew.regenerate', 'Regenerate')} position="top" disabled={!onRequestRegenerate}>
                                      {renderRegenerateButton(lesson, 'one-pager', onePagerProductId ?? null, !onRequestRegenerate)}
                                    </CustomTooltip>
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4">
                                      <CustomTooltip content={t('interface.viewNew.view', 'View')} position="top" disabled={!onViewProduct}>
                                        {renderViewButton(onePagerProductId, 'one-pager')}
                                      </CustomTooltip>
                                    </div>
                                  </div>
                                ) : (
                                  <CustomTooltip content={t('interface.viewNew.add', 'Add')} position="top" disabled={!onAddContent}>
                                    {renderAddButton(lesson, 'one-pager', !onAddContent)}
                                  </CustomTooltip>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className={`lg:col-span-1 ${showMetricsCard ? '' : 'hidden'}`}>
        <CustomViewCard
          projectId={productId}
          sources={derivedSources}
          contentTypes={contentTypes}
          metrics={metricsWithFallback}
        />
      </div>
    </div>
  );
};

export default CourseDisplay;

