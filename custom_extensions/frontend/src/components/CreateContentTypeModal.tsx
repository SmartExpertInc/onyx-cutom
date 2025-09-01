"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { BookText, Video, Film, X, HelpCircle, FileText, ChevronRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { AllContentTypesModal } from './AllContentTypesModal';

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
  recommendedContentTypes?: RecommendedContentTypes;
  existingContent?: ExistingContentFlags;
  onUpdateRecommendations?: (newPrimary: string[]) => void; // NEW
  onOpenAllContentTypes?: () => void; // NEW: callback to open AllContentTypesModal
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
  recommendedContentTypes,
  existingContent,
  onUpdateRecommendations,
  onOpenAllContentTypes
}: CreateContentTypeModalProps) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // NEW: track if showing settings instead of recommendations

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
      disabled: true,
      soon: true
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
      type.disabled
  }));

  const recommendedOnly = useMemo(() => {
    const primary = recommendedState?.primary || recommendedContentTypes?.primary || [];
    if (!primary.length) return updatedContentTypes; // fallback to all
    const set = new Set(primary);
    return updatedContentTypes.filter(ct => set.has(ct.key));
  }, [recommendedState, recommendedContentTypes, updatedContentTypes]);

  const handleContentCreate = (contentType: string) => {
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t('modals.createContent.title')}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <button
            onClick={() => handleContentCreate('lessonPlan')}
            className="w-full bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 hover:shadow-md transition-all duration-200 flex items-center justify-between group transform hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-base font-semibold text-amber-900">Lesson Plan</span>
                </div>
                <p className="text-sm text-amber-700 leading-relaxed">Technical specification with lesson objectives</p>
              </div>
            </div>
            <div className="text-amber-500 group-hover:text-amber-600 transition-colors ml-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Visual Separator */}
        <div className="mb-3 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-xs text-gray-500 font-medium">Content Creation Options</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Combined Content Types View */}
        <div className="mb-2">

          {/* All Content Types with Checkboxes */}
          <div className="space-y-2">
            {updatedContentTypes.map((type) => {
              const isDisabled = type.disabled;
              const isAlreadyCreated = (type.name === "lessonPresentation" && existingFlags.hasLesson) ||
                (type.name === "textPresentation" && existingFlags.hasOnePager) ||
                (type.name === "multiple-choice" && existingFlags.hasQuiz);

              // Check if this type is recommended
              const isRecommended = recommendedState?.primary?.includes(type.key) || recommendedContentTypes?.primary?.includes(type.key);
              const isSelected = selectedPrefs[type.key] || false;

              return (
                <div
                  key={type.name}
                  className={`group w-full flex items-center p-6 border-2 rounded-xl transition-all duration-300 text-left transform hover:scale-[1.02] ${isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : isSelected
                      ? `${colorClasses[type.color as keyof typeof colorClasses]} hover:shadow-lg cursor-pointer hover:border-opacity-80`
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  onClick={(e: React.MouseEvent) => {
                    if (!isDisabled && isSelected && e.target === e.currentTarget) {
                      handleContentCreate(type.name);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <div className="mr-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handlePrefToggle(type.key);
                      }}
                      disabled={isDisabled}
                    />
                  </div>

                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${isDisabled || !isSelected ? 'bg-gray-100' : iconColorClasses[type.color as keyof typeof iconColorClasses]
                      }`}>
                      {React.cloneElement(type.icon, {
                        className: `w-6 h-6 transition-all duration-200 ${isDisabled || !isSelected ? 'text-gray-400' : ''}`
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-bold ${isSelected ? 'text-gray-900 group-hover:text-gray-800' : 'text-gray-400'}`}>
                          {type.label}
                        </h3>
                        {type.soon && (
                          <span className="text-xs bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 px-2 py-1 rounded-full font-medium border border-orange-200">
                            {t('modals.createContent.soon')}
                          </span>
                        )}
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
                      </div>
                      <p className={`text-sm leading-relaxed ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && !isDisabled && (
                    <div className="text-gray-400 group-hover:text-gray-600 transition-all duration-200 group-hover:translate-x-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 flex items-center space-x-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{t('actions.cancel')}</span>
          </button>
          <button
            onClick={handlePrefSave}
            disabled={!Object.values(selectedPrefs).some(Boolean)}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${!Object.values(selectedPrefs).some(Boolean)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-xl'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('actions.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
