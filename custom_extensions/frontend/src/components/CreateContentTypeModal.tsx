"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { BookText, Video, Film, X, HelpCircle, FileText, ChevronRight, Settings, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { AllContentTypesModal } from './AllContentTypesModal';
import useFeaturePermission from "../hooks/useFeaturePermission";

interface RecommendedContentTypes {
  primary: string[];
  reasoning?: string;
  last_updated?: string;
  quality_tier_used?: string;
}

interface ExistingContentFlags {
  hasLesson: boolean;
  hasQuiz: boolean;
  hasOnePager: boolean;
  hasVideoLesson: boolean;
}

interface CreateContentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  sourceChatSessionId?: string | null;
  detectedLanguage?: 'en' | 'ru' | 'uk';
  hasLesson?: boolean;
  hasQuiz?: boolean;
  hasOnePager?: boolean;
  parentProjectName?: string;
  outlineProjectId?: number; // NEW: ID of the parent outline project
  lessonRecommendations?: string[]; // NEW: Actual recommended products for this lesson
  recommendedContentTypes?: RecommendedContentTypes;
  existingContent?: ExistingContentFlags;
  onUpdateRecommendations?: (newPrimary: string[]) => void; // NEW
  onOpenAllContentTypes?: () => void; // NEW: callback to open AllContentTypesModal
  hasLessonPlan?: boolean; // NEW: whether lesson plan exists for this lesson
  lessonPlanId?: number; // NEW: id to open
  onOpenLessonPlan?: () => void; // NEW: open handler
  onRefreshLessonPlan?: () => void; // NEW: refresh handler
  isRefreshingLessonPlan?: boolean; // NEW: spinner state
}

export const CreateContentTypeModal = ({
  isOpen,
  onClose,
  lessonTitle,
  moduleName,
  lessonNumber,
  sourceChatSessionId,
  detectedLanguage = 'en',
  hasLesson = false,
  hasQuiz = false,
  hasOnePager = false,
  parentProjectName,
  outlineProjectId,
  lessonRecommendations,
  recommendedContentTypes,
  existingContent,
  onUpdateRecommendations,
  onOpenAllContentTypes,
  hasLessonPlan,
  lessonPlanId,
  onOpenLessonPlan,
  onRefreshLessonPlan,
  isRefreshingLessonPlan
}: CreateContentTypeModalProps) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // NEW: track if showing settings instead of recommendations
  const [isGeneratingLessonPlan, setIsGeneratingLessonPlan] = useState(false);
  // isRefreshingLessonPlan and errorMessage come from props/parent when applicable

  const { isEnabled: lessonDraftEnabled } = useFeaturePermission('lesson_draft');
  const { isEnabled: videoLessonEnabled } = useFeaturePermission('video_lesson');

  // Local recommended state (so UI updates immediately)
  const [recommendedState, setRecommendedState] = useState<RecommendedContentTypes | undefined>(recommendedContentTypes);
  useEffect(() => {
    setRecommendedState(recommendedContentTypes);
  }, [recommendedContentTypes]);

  const contentTypes = [
    {
      name: "lessonPresentation",
      key: "presentation",
      icon: <BookText className="w-6 h-6" />,
      label: t('modals.createContent.presentation'),
      description: t('modals.createContent.presentationDescription'),
      color: "blue",
      disabled: false
    },
    {
      name: "textPresentation",
      key: "one-pager",
      icon: <FileText className="w-6 h-6" />,
      label: t('modals.createContent.onePager'),
      description: t('modals.createContent.onePagerDescription'),
      color: "purple",
      disabled: false
    },
    {
      name: "multiple-choice",
      key: "quiz",
      icon: <HelpCircle className="w-6 h-6" />,
      label: t('modals.createContent.quiz'),
      description: t('modals.createContent.quizDescription'),
      color: "green",
      disabled: false
    },
    {
      name: "videoLesson",
      key: "video-lesson",
      icon: <Video className="w-6 h-6" />,
      label: t('modals.createContent.videoLesson'),
      description: t('modals.createContent.videoLessonDescription'),
      color: "orange",
      disabled: false
    },
  ];

  const existingFlags: ExistingContentFlags = useMemo(() => ({
    hasLesson: existingContent?.hasLesson ?? hasLesson,
    hasQuiz: existingContent?.hasQuiz ?? hasQuiz,
    hasOnePager: existingContent?.hasOnePager ?? hasOnePager,
    hasVideoLesson: existingContent?.hasVideoLesson ?? false,
  }), [existingContent, hasLesson, hasOnePager, hasQuiz]);

  // Update disabled states based on what already exists
  const updatedContentTypes = contentTypes.map(type => ({
    ...type,
    disabled: (type.name === "lessonPresentation" && existingFlags.hasLesson) ||
      (type.name === "textPresentation" && existingFlags.hasOnePager) ||
      (type.name === "multiple-choice" && existingFlags.hasQuiz) ||
      (type.name === "videoLesson" && existingFlags.hasVideoLesson) ||
      type.disabled
  }));

  const recommendedOnly = useMemo(() => {
    const primary = recommendedState?.primary || recommendedContentTypes?.primary || [];
    if (!primary.length) return updatedContentTypes; // fallback to all
    const set = new Set(primary);
    return updatedContentTypes.filter(ct => set.has(ct.key));
  }, [recommendedState, recommendedContentTypes, updatedContentTypes]);

  const handleContentCreate = (contentType: string) => {
    // Prevent Video Lesson creation if the feature is disabled
    if (contentType === 'videoLesson' && !videoLessonEnabled) {
      return;
    }

    let product = '';
    let lessonType = '';

    switch (contentType) {
      case 'lessonPresentation':
        product = 'lesson';
        lessonType = contentType;
        break;
      case 'textPresentation':
        product = 'text-presentation';
        lessonType = contentType;
        break;
      case 'multiple-choice':
        product = 'quiz';
        lessonType = contentType;
        break;
      case 'videoLesson':
        product = 'video-lesson';
        lessonType = contentType;
        break;
      case 'lessonPlan':
        product = 'lesson-plan';
        lessonType = contentType;
        break;
    }

    const params = new URLSearchParams({
      product: product,
      lessonType: lessonType,
      lessonTitle: lessonTitle,
      moduleName: moduleName,
      lessonNumber: String(lessonNumber)
    });
    if (parentProjectName) {
      params.set('courseName', parentProjectName);
    }
    router.push(`/create?${params.toString()}`);
    onClose();
  };

  const handleLessonPlanGeneration = async () => {
    if (!parentProjectName) {
      console.error('No parent project name available for lesson plan generation');
      return;
    }

    if (!outlineProjectId) {
      console.error('No outline project ID available for lesson plan generation');
      alert('Unable to generate lesson plan: No outline project ID found');
      return;
    }

    setIsGeneratingLessonPlan(true);
    
    try {
      // Use the outlineProjectId prop directly

      const response = await fetch('/api/custom-projects-backend/lesson-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outlineProjectId,
          lessonTitle,
          moduleName,
          lessonNumber,
          recommendedProducts: lessonRecommendations && lessonRecommendations.length > 0 ? lessonRecommendations : ['lesson', 'quiz', 'one-pager', 'video-lesson'] // Use actual recommendations or fallback to defaults
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate lesson plan');
      }

      const result = await response.json();
      
      if (result.success) {
        // Redirect to the newly created lesson plan
        router.push(`/projects/view/${result.project_id}`);
        onClose();
      } else {
        throw new Error(result.message || 'Lesson plan generation failed');
      }
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate lesson plan: ${errorMessage}`);
    } finally {
      setIsGeneratingLessonPlan(false);
    }
  };

  // Preferences state
  const allKeys = ["presentation", "one-pager", "quiz", "video-lesson"];
  const [selectedPrefs, setSelectedPrefs] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const prim = recommendedState?.primary || recommendedContentTypes?.primary || [];
    const next: Record<string, boolean> = {};
    allKeys.forEach(k => {
      // Only check options that are actually in the recommended list
      next[k] = prim.includes(k);
    });
    setSelectedPrefs(next);
  }, [recommendedState, recommendedContentTypes]);

  const handlePrefToggle = (key: string) => {
    setSelectedPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrefSave = () => {
    const newPrimary = allKeys.filter(k => selectedPrefs[k]);
    if (!newPrimary.length) return; // require at least one selection
    const next: RecommendedContentTypes = {
      ...(recommendedState || {}),
      primary: newPrimary,
      last_updated: new Date().toISOString(),
      quality_tier_used: recommendedState?.quality_tier_used || recommendedContentTypes?.quality_tier_used,
      reasoning: 'manual'
    };
    setRecommendedState(next);
    if (onUpdateRecommendations) onUpdateRecommendations(newPrimary);
    setShowSettings(false); // Return to recommendations view
  };

  const handleClose = () => {
    if (showSettings) {
      setShowSettings(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
    purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100',
    green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100',
    orange: 'border-orange-200 bg-orange-50'
  } as const;

  const iconColorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100'
  } as const;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-2 sm:mb-3 justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{t('modals.createContent.title')}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        <div className="mb-1 sm:mb-2">
          {lessonDraftEnabled && hasLessonPlan ? (
            <div className="group">
              <div className="relative">
                <button
                  onClick={onOpenLessonPlan}
                  className="w-full flex items-center p-3 lg:p-4 border-2 rounded-xl border-amber-200 hover:border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-[1.02] pr-16"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                      <FileText className="text-amber-700" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-amber-900">Lesson Draft</span>
                        <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">Already created</span>
                      </div>
                      <p className="text-xs text-amber-800">View lesson draft with objectives and materials</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={onRefreshLessonPlan}
                  disabled={!!isRefreshingLessonPlan}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg border border-amber-300 transition-all duration-300 ${isRefreshingLessonPlan ? 'bg-amber-200 cursor-not-allowed' : 'bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 hover:shadow-md'}`}
                  title="Generate new lesson draft"
                >
                  {isRefreshingLessonPlan ? (
                    <Loader2 size={18} className="animate-spin text-amber-700" />
                  ) : (
                    <RefreshCw size={18} className="text-amber-700 group-hover:scale-110 transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Visual Separator */}
        <div className="mb-1 sm:mb-2 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-2 sm:px-3 text-xs text-gray-500 font-medium">Content Creation Options</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Combined Content Types View */}
        <div className="mb-1 sm:mb-2">

          {/* All Content Types with Checkboxes */}
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            {updatedContentTypes.map((type) => {
              const isDisabled = type.disabled;
              const isAlreadyCreated = (type.name === "lessonPresentation" && existingFlags.hasLesson) ||
                (type.name === "textPresentation" && existingFlags.hasOnePager) ||
          (type.name === "multiple-choice" && existingFlags.hasQuiz) ||
          (type.name === "videoLesson" && existingFlags.hasVideoLesson);

              // Check if this type is recommended
              const isRecommended = recommendedState?.primary?.includes(type.key) || recommendedContentTypes?.primary?.includes(type.key);
              const isSelected = selectedPrefs[type.key] || false;
              
              // Check if Video Lesson is disabled by feature flag
              const isVideoLessonDisabledByFlag = type.name === "videoLesson" && !videoLessonEnabled;

              return (
                <div
                  key={type.name}
                  className={`group w-full flex items-center p-2 sm:p-3 lg:p-4 border-2 rounded-xl transition-all duration-300 text-left transform hover:scale-[1.02] ${
                    isDisabled || isVideoLessonDisabledByFlag
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : isSelected
                      ? `${colorClasses[type.color as keyof typeof colorClasses]} hover:shadow-lg cursor-pointer hover:border-opacity-80`
                        : isRecommended
                          ? 'border-blue-200 bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 hover:border-blue-300 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  onClick={(e: React.MouseEvent) => {
                    console.log('Content type clicked:', {
                      typeName: type.name,
                      isDisabled,
                      isVideoLessonDisabledByFlag,
                      isSelected,
                      isRecommended,
                      canClick: !isDisabled && !isVideoLessonDisabledByFlag && (isSelected || isRecommended)
                    });
                    
                    // Allow clicking on recommended products regardless of checkbox state
                    // Only allow clicking if not disabled and either selected or recommended
                    if (!isDisabled && !isVideoLessonDisabledByFlag && (isSelected || isRecommended)) {
                      handleContentCreate(type.name);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <div 
                    className="mr-2 sm:mr-3 lg:mr-4"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={isSelected}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.stopPropagation();
                        handlePrefToggle(type.key);
                      }}
                      disabled={isDisabled}
                    />
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-2 lg:space-x-3 flex-1">
                    <div className={`p-2 sm:p-2 lg:p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
                      isDisabled || isVideoLessonDisabledByFlag
                        ? 'bg-gray-100' 
                        : isSelected 
                          ? iconColorClasses[type.color as keyof typeof iconColorClasses]
                          : isRecommended
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                      }`}>
                      {React.cloneElement(type.icon, {
                        className: `w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                          isDisabled || isVideoLessonDisabledByFlag
                            ? 'text-gray-400' 
                            : isSelected 
                              ? '' 
                              : isRecommended
                                ? 'text-blue-600'
                                : 'text-gray-400'
                        }`
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1">
                        <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${
                          isDisabled || isVideoLessonDisabledByFlag
                            ? 'text-gray-400'
                            : isSelected 
                              ? 'text-gray-900 group-hover:text-gray-800' 
                              : isRecommended
                                ? 'text-blue-900 group-hover:text-blue-800'
                                : 'text-gray-400'
                        }`}>
                          {type.label}
                        </h3>

                        {isAlreadyCreated && (
                          <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">
                            ✓ {t('modals.createContent.alreadyCreated')}
                          </span>
                        )}
                        {isRecommended && (
                          <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-200">
                            {t('modals.createContent.recommended', 'Recommended')}
                          </span>
                        )}
                        {isVideoLessonDisabledByFlag && (
                          <span className="text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium border border-amber-200">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDisabled || isVideoLessonDisabledByFlag
                          ? 'text-gray-400'
                          : isSelected 
                            ? 'text-gray-600' 
                            : isRecommended
                              ? 'text-blue-600'
                              : 'text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  {(isSelected || isRecommended) && !isDisabled && !isVideoLessonDisabledByFlag && (
                    <div className={`transition-all duration-200 group-hover:translate-x-1 ${
                      isSelected 
                        ? 'text-gray-400 group-hover:text-gray-600' 
                        : 'text-blue-400 group-hover:text-blue-600'
                    }`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-1 sm:mt-2 flex justify-between items-center pt-2 sm:pt-2 lg:pt-3 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm sm:text-base">{t('actions.cancel')}</span>
          </button>
          <button
            onClick={handlePrefSave}
            disabled={!Object.values(selectedPrefs).some(Boolean)}
            className={`px-4 sm:px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${!Object.values(selectedPrefs).some(Boolean)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-xl'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm sm:text-base">{t('actions.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
