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

  const renderTypeButton = (type: typeof updatedContentTypes[number]) => {
    const isDisabled = type.disabled;
    const isAlreadyCreated = (type.name === "lessonPresentation" && existingFlags.hasLesson) ||
                             (type.name === "textPresentation" && existingFlags.hasOnePager) ||
                             (type.name === "multiple-choice" && existingFlags.hasQuiz);

    return (
      <button
        key={type.name}
        onClick={() => !isDisabled && handleContentCreate(type.name)}
        disabled={isDisabled}
        className={`group w-full flex items-center p-6 border-2 rounded-xl transition-all duration-300 text-left transform hover:scale-[1.02] ${
          isDisabled
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : `${colorClasses[type.color as keyof typeof colorClasses]} hover:shadow-lg cursor-pointer hover:border-opacity-80`
        }`}
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
            isDisabled ? 'bg-gray-100' : iconColorClasses[type.color as keyof typeof iconColorClasses]
          }`}>
            {React.cloneElement(type.icon, {
              className: `w-6 h-6 transition-all duration-200 ${isDisabled ? 'text-gray-400' : ''}`
            })}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800">{type.label}</h3>
              {type.soon && (
                <span className="text-xs bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 px-3 py-1 rounded-full font-medium border border-orange-200">
                  {t('modals.createContent.soon')}
                </span>
              )}
              {isAlreadyCreated && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">
                  ✓ {t('modals.createContent.alreadyCreated')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{type.description}</p>
          </div>
        </div>
        {!isDisabled && (
          <div className="text-gray-400 group-hover:text-gray-600 transition-all duration-200 group-hover:translate-x-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </button>
    );
  };

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
        <div className="mb-6">
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
        
        {/* Recommendations or Settings */}
        { (recommendedState?.primary?.length || recommendedContentTypes?.primary?.length) ? (
          <div className="mb-6">
            {!showSettings ? (
              // Recommendations view
              <>
                <div className="mb-6">
                  {/* Recommended Section Header */}
                  <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.329-1.253l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {t('modals.createContent.recommended', 'Recommended')}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {t('modals.createContent.recommendedDescription', 'AI-suggested content types perfect for this lesson')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200 group"
                        aria-label="Customize recommendations"
                        title="Customize recommendations"
                      >
                        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>

                  {/* Recommended Content Cards */}
                  <div className="space-y-3">
                    {recommendedOnly.map(renderTypeButton)}
                  </div>
                </div>

                {/* Divider and See All Button */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      {t('modals.createContent.orExploreMore', 'or explore more options')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      onClose(); // Close this modal
                      if (onOpenAllContentTypes) {
                        onOpenAllContentTypes(); // Open AllContentTypesModal
                      }
                    }}
                    className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 flex items-center space-x-2"
                  >
                    <span>{t('modals.createContent.seeAllContentTypes', 'See all content types')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              // Settings view
              <>
                <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Settings size={16} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {t('modals.createContent.customizeRecommendations', 'Customize Recommendations')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('modals.createContent.selectRecommendedProducts', 'Select which products should be shown as recommended for this lesson.')}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'presentation', label: t('modals.createContent.presentation'), icon: <BookText className="w-5 h-5" />, color: 'blue' },
                    { key: 'one-pager', label: t('modals.createContent.onePager'), icon: <FileText className="w-5 h-5" />, color: 'purple' },
                    { key: 'quiz', label: t('modals.createContent.quiz'), icon: <HelpCircle className="w-5 h-5" />, color: 'green' },
                    { key: 'video-lesson', label: t('modals.createContent.videoLesson'), icon: <Video className="w-5 h-5" />, color: 'orange' },
                  ].map(opt => {
                    const isSelected = !!selectedPrefs[opt.key];

                    const colorClasses = {
                      blue: {
                        border: isSelected ? 'border-blue-300' : 'border-gray-200 hover:border-blue-200',
                        bg: isSelected ? 'bg-blue-50' : 'bg-white hover:bg-blue-50',
                        iconBg: 'bg-blue-100',
                        iconColor: 'text-blue-600'
                      },
                      purple: {
                        border: isSelected ? 'border-purple-300' : 'border-gray-200 hover:border-purple-200',
                        bg: isSelected ? 'bg-purple-50' : 'bg-white hover:bg-purple-50',
                        iconBg: 'bg-purple-100',
                        iconColor: 'text-purple-600'
                      },
                      green: {
                        border: isSelected ? 'border-green-300' : 'border-gray-200 hover:border-green-200',
                        bg: isSelected ? 'bg-green-50' : 'bg-white hover:bg-green-50',
                        iconBg: 'bg-green-100',
                        iconColor: 'text-green-600'
                      },
                      orange: {
                        border: isSelected ? 'border-orange-300' : 'border-gray-200 hover:border-orange-200',
                        bg: isSelected ? 'bg-orange-50' : 'bg-white hover:bg-orange-50',
                        iconBg: 'bg-orange-100',
                        iconColor: 'text-orange-600'
                      }
                    };

                    const colors = colorClasses[opt.color as keyof typeof colorClasses];

                    return (
                      <label
                        key={opt.key}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${colors.border} ${colors.bg}`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={isSelected}
                          onChange={() => handlePrefToggle(opt.key)}
                        />
                        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                          {React.cloneElement(opt.icon, {
                            className: `w-5 h-5 ${colors.iconColor}`
                          })}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-all duration-200 flex items-center space-x-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t('actions.cancel')}</span>
                  </button>
                  <button
                    onClick={handlePrefSave}
                    disabled={!Object.values(selectedPrefs).some(Boolean)}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                      !Object.values(selectedPrefs).some(Boolean)
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
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {updatedContentTypes.map(renderTypeButton)}
          </div>
        )}

        {/* Footer */}
        {!showSettings && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{t('modals.createContent.chooseContentType')}</p>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};
