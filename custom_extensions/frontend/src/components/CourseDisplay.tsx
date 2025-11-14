"use client";

import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import CustomViewCard, { defaultContentTypes as defaultCardContentTypes } from '@/components/ui/custom-view-card';
import { TrainingPlanData } from '@/types/projectSpecificTypes';

export type LessonContentStatusMap = {
  [key: string]: {
    presentation: { exists: boolean; productId?: number };
    onePager: { exists: boolean; productId?: number };
    quiz: { exists: boolean; productId?: number };
    videoLesson: { exists: boolean; productId?: number };
  };
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
  onViewProduct?: (productId: number, contentType?: string) => void;
  productId?: string;
  metrics?: CourseMetrics;
  contentTypes?: typeof defaultCardContentTypes;
  sources?: { type: string; name: string; icon: React.ReactNode }[];
  showMetricsCard?: boolean;
  isAuthorized?: boolean;
};

type LessonContentKey = 'videoLesson' | 'quiz' | 'presentation' | 'onePager';

type ContentColumnConfig = {
  key: LessonContentKey;
  label: string;
  contentType: 'video-lesson' | 'quiz' | 'presentation' | 'one-pager';
  headerColor: string;
};

const renderContentIcon = (key: LessonContentKey) => {
  switch (key) {
    case 'videoLesson':
      return (
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99967 11.3333V14M5.33301 14H10.6663M6.66634 4.66667L9.99967 6.66667L6.66634 8.66667V4.66667ZM2.66634 2H13.333C14.0694 2 14.6663 2.59695 14.6663 3.33333V10C14.6663 10.7364 14.0694 11.3333 13.333 11.3333H2.66634C1.92996 11.3333 1.33301 10.7364 1.33301 10V3.33333C1.33301 2.59695 1.92996 2 2.66634 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'quiz':
      return (
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66699 6.86732C6.80033 6.60065 7.00033 6.33398 7.26699 6.20065C7.54308 6.04103 7.86539 5.98046 8.18059 6.02895C8.49579 6.07745 8.78498 6.2321 9.00033 6.46732C9.20033 6.73398 9.33366 7.00065 9.33366 7.33398C9.33366 8.20065 8.00033 8.66732 8.00033 8.66732M8.00033 11.334H8.00699M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'presentation':
      return (
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3333 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H13.3333C13.7015 6.66667 14 6.36819 14 6V2.66667C14 2.29848 13.7015 2 13.3333 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.33333 9.33333H2.66667C2.29848 9.33333 2 9.63181 2 10V13.3333C2 13.7015 2.29848 14 2.66667 14H7.33333C7.70152 14 8 13.7015 8 13.3333V10C8 9.63181 7.70152 9.33333 7.33333 9.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.3333 9.33333H11.3333C10.9651 9.33333 10.6667 9.63181 10.6667 10V13.3333C10.6667 13.7015 10.9651 14 11.3333 14H13.3333C13.7015 14 14 13.7015 14 13.3333V10C14 9.63181 13.7015 9.33333 13.3333 9.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'onePager':
      return (
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.33366 1.33398V5.33398H13.3337M9.66699 1.33398H4.00033C3.6467 1.33398 3.30756 1.47446 3.05752 1.72451C2.80747 1.97456 2.66699 2.3137 2.66699 2.66732V13.334C2.66699 13.6876 2.80747 14.0267 3.05752 14.2768C3.30756 14.5268 3.6467 14.6673 4.00033 14.6673H12.0003C12.3539 14.6673 12.6931 14.5268 12.9431 14.2768C13.1932 14.0267 13.3337 13.6876 13.3337 13.334V5.00065L9.66699 1.33398Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
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
  onViewProduct,
  productId,
  metrics,
  contentTypes = defaultCardContentTypes,
  sources,
  showMetricsCard = false,
  isAuthorized = true
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

  const contentColumnConfigs = useMemo<ContentColumnConfig[]>(() => {
    const configs: ContentColumnConfig[] = [
      {
        key: 'quiz',
        label: t('interface.viewNew.quiz', 'Quiz'),
        contentType: 'quiz',
        headerColor: '#FF960A'
      },
      {
        key: 'presentation',
        label: t('interface.viewNew.presentation', 'Presentation'),
        contentType: 'presentation',
        headerColor: '#D60AFF'
      },
      {
        key: 'onePager',
        label: t('interface.viewNew.onePager', 'One-Pager'),
        contentType: 'one-pager',
        headerColor: '#0F58F9'
      }
    ];

    if (columnVideoLessonEnabled) {
      configs.unshift({
        key: 'videoLesson',
        label: t('interface.viewNew.videoLesson', 'Video Lesson'),
        contentType: 'video-lesson',
        headerColor: '#0AFFEA'
      });
    }

    return configs;
  }, [columnVideoLessonEnabled, t]);

  const handleProductClick = (productId: number, contentType: string) => {
    if (onViewProduct) {
      onViewProduct(productId, contentType);
      return;
    }

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const projectsSegmentIndex = currentPath.indexOf('/projects/');
      const prefix = projectsSegmentIndex >= 0 ? currentPath.slice(0, projectsSegmentIndex) : '';
      const basePath = currentPath.includes('/projects/view-link/') ? `${prefix}/projects/view-link` : `${prefix}/projects/view`;
      const url = `${basePath}/${productId}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

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

  const gridClasses = showMetricsCard ? 'grid grid-cols-1 lg:grid-cols-3 gap-[6px]' : 'grid grid-cols-1 gap-[6px]';
  const mainColumnClasses = showMetricsCard ? 'lg:col-span-2 space-y-4' : 'space-y-4';

  return (
    <div className={gridClasses}>
      <div className={mainColumnClasses}>
        {(() => {
          if (!trainingPlanData?.sections) {
            return (
              <div className="bg-white rounded-lg p-[25px]">
                <p className="text-[#9A9DA2]">{t('interface.viewNew.noModulesFound', 'No modules found in this course outline.')}</p>
              </div>
            );
          }

          return trainingPlanData.sections.map((section, index) => {
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
                    </div>
                </div>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isCollapsed ? '0' : '10000px',
                    opacity: isCollapsed ? 0 : 1
                  }}
                >
                  <div className="pb-[25px] px-2 lg:px-[40px] pt-0">
                    <div
                      className="grid gap-4 items-center px-[25px] py-[10px] mx-[-25px]"
                      style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 100px' : ''} 100px 100px 100px` }}
                    >
                      <div className="text-[14px] text-[#A5A5A5]">
                        {t('interface.viewNew.lessons', 'Lessons')}
                      </div>
                      {contentColumnConfigs.map((config) => (
                        <div key={config.key} />
                      ))}
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

                          const renderContentCell = (config: ContentColumnConfig, options?: { extraClasses?: string; keyPrefix?: string }) => {
                            const columnStatus = status[config.key];
                            const exists = Boolean(columnStatus?.exists && columnStatus?.productId);
                            const productIdForColumn = columnStatus?.productId;
                            const color = exists ? '#0F58F9' : '#E0E0E0';
                            const baseClasses = 'flex flex-col items-center justify-center gap-2 text-[8px] transition-colors';
                            const composedClasses = `${baseClasses} ${options?.extraClasses ?? ''}`;
                            const key = `${options?.keyPrefix ?? ''}${config.key}`;

                            if (exists && productIdForColumn) {
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleProductClick(productIdForColumn, config.contentType)}
                                  className={`${composedClasses} cursor-pointer hover:opacity-80`}
                                  style={{ color }}
                                >
                                  {renderContentIcon(config.key)}
                                  <span>{config.label}</span>
                                </button>
                              );
                            }

                            return (
                              <div
                                key={key}
                                className={`${composedClasses} cursor-default`}
                                style={{ color }}
                              >
                                {renderContentIcon(config.key)}
                                <span>{config.label}</span>
                              </div>
                            );
                          };

                          return (
                            <div
                              key={lesson?.id || lessonIndex}
                              className="flex flex-col gap-3 sm:grid sm:gap-4 sm:items-center pl-[16px] sm:pl-[24px] py-[16px] rounded-md"
                              style={{ gridTemplateColumns: `1fr${columnVideoLessonEnabled ? ' 100px' : ''} 100px 100px 100px`, border: '1px solid #E0E0E0' }}
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#171718] text-[16px] font-medium">{lessonIndex + 1}.</span>
                                  <span className="text-[#191D30] text-[16px] leading-[100%] font-medium">
                                    {lesson.title.replace(/^\d+\.\d*\.?\s*/, '')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 sm:hidden pt-2 flex-nowrap w-full">
                                {contentColumnConfigs.map((config) =>
                                  renderContentCell(config, {
                                    keyPrefix: 'mobile-',
                                    extraClasses: 'flex-1 min-w-0 py-2 px-2'
                                  })
                                )}
                              </div>

                              {contentColumnConfigs.map((config) =>
                                renderContentCell(config, {
                                  keyPrefix: 'desktop-',
                                  extraClasses: 'hidden sm:flex'
                                })
                              )}
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

      {showMetricsCard && (
        <div className="lg:col-span-1 flex flex-col gap-4">
          <CustomViewCard
            projectId={productId}
            sources={derivedSources}
            contentTypes={contentTypes}
            metrics={metricsWithFallback}
          />
        </div>
      )}
    </div>
  );
};

export default CourseDisplay;

