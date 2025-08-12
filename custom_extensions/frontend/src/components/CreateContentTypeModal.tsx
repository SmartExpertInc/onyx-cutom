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
    allKeys.forEach(k => { next[k] = prim.includes(k); });
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
        className={`w-full flex items-center p-6 border-2 rounded-xl transition-all duration-200 text-left ${
          isDisabled
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : `${colorClasses[type.color as keyof typeof colorClasses]} hover:shadow-md cursor-pointer`
        }`}
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-3 rounded-lg ${
            isDisabled ? 'bg-gray-100' : iconColorClasses[type.color as keyof typeof iconColorClasses]
          }`}>
            {React.cloneElement(type.icon, { 
              className: `w-6 h-6 ${isDisabled ? 'text-gray-400' : ''}` 
            })}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-black">{type.label}</h3>
              {type.soon && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                  {t('modals.createContent.soon')}
                </span>
              )}
              {isAlreadyCreated && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {t('modals.createContent.alreadyCreated')}
                </span>
              )}
            </div>
            <p className="text-sm text-black">{type.description}</p>
          </div>
        </div>
        {!isDisabled && (
          <div className="text-gray-400 group-hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-black">{t('modals.createContent.title')}</h2>
            <button
              onClick={handleClose}
              className="text-black hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-black">
            {t('modals.openOrCreate.module')}: <span className="font-medium">{moduleName}</span> • {t('modals.openOrCreate.title')} {lessonNumber}
          </p>
          <p className="text-lg font-semibold text-black mt-1">{lessonTitle}</p>
        </div>
        
        {/* Recommendations or Settings */}
        { (recommendedState?.primary?.length || recommendedContentTypes?.primary?.length) ? (
          <div className="mb-6">
            {!showSettings ? (
              // Recommendations view
              <>
                <div className="mb-2 text-sm text-gray-600 flex items-center">
                  <span className="font-medium">{t('modals.createContent.recommended')}</span>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="ml-2 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    aria-label="Customize recommendations"
                    title="Customize"
                  >
                    <Settings size={16} />
                  </button>
                  { (recommendedState?.quality_tier_used || recommendedContentTypes?.quality_tier_used) && (
                    <span className="ml-2 text-gray-400">({recommendedState?.quality_tier_used || recommendedContentTypes?.quality_tier_used})</span>
                  )}
                </div>
                <div className="space-y-4">
                  {recommendedOnly.map(renderTypeButton)}
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      onClose(); // Close this modal
                      if (onOpenAllContentTypes) {
                        onOpenAllContentTypes(); // Open AllContentTypesModal
                      }
                    }}
                    className="px-4 py-2 text-sm rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    {t('modals.createContent.seeAllContentTypes', 'See all content types')}
                  </button>
                </div>
              </>
            ) : (
              // Settings view
              <>
                <p className="text-sm text-gray-600 mb-4">{t('modals.createContent.selectRecommendedProducts')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'presentation', label: t('modals.createContent.presentation'), color: 'blue' },
                    { key: 'one-pager', label: t('modals.createContent.onePager'), color: 'purple' },
                    { key: 'quiz', label: t('modals.createContent.quiz'), color: 'green' },
                    { key: 'video-lesson', label: t('modals.createContent.videoLesson'), color: 'gray' },
                  ].map(opt => {
                    const colorClasses = {
                      blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
                      green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100',
                      purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100',
                      gray: 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                    };
                    
                    const defaultColorClasses = {
                      blue: 'border-blue-100 hover:border-blue-200 bg-blue-25 hover:bg-blue-50',
                      green: 'border-green-100 hover:border-green-200 bg-green-25 hover:bg-green-50',
                      purple: 'border-purple-100 hover:border-purple-200 bg-purple-25 hover:bg-purple-50',
                      gray: 'border-gray-100 hover:border-gray-200 bg-gray-25 hover:bg-gray-50'
                    };
                    
                    return (
                      <label 
                        key={opt.key} 
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedPrefs[opt.key] 
                            ? colorClasses[opt.color as keyof typeof colorClasses]
                            : defaultColorClasses[opt.color as keyof typeof defaultColorClasses]
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-600"
                          checked={!!selectedPrefs[opt.key]}
                          onChange={() => handlePrefToggle(opt.key)}
                        />
                        <span className="text-sm text-gray-800">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
                  >
                    {t('actions.cancel')}
                  </button>
                  <button
                    onClick={handlePrefSave}
                    disabled={!Object.values(selectedPrefs).some(Boolean)}
                    className={`px-4 py-2 text-sm rounded-lg text-white ${Object.values(selectedPrefs).some(Boolean) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {t('actions.save')}
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
          <div className="mt-4 pt-6 border-t border-gray-100">
            <p className="text-sm text-black text-center">
              {t('modals.createContent.chooseContentType')}
            </p>
          </div>
        )}
      </div>


    </div>
  );
}; 