"use client";

import React, { useMemo, useState } from 'react';
import { BookText, Video, Film, X, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';

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
  parentProjectName?: string; // Add outline name for quiz creation
  recommendedContentTypes?: RecommendedContentTypes; // NEW
  existingContent?: ExistingContentFlags; // NEW
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
  existingContent
}: CreateContentTypeModalProps) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [showAllOptions, setShowAllOptions] = useState(false);

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
    const rec = recommendedContentTypes?.primary || [];
    if (!rec.length) return updatedContentTypes; // fallback to all
    const set = new Set(rec);
    return updatedContentTypes.filter(ct => set.has(ct.key));
  }, [recommendedContentTypes, updatedContentTypes]);

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
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">{t('modals.createContent.title')}</h2>
            <p className="text-black">
              {t('modals.openOrCreate.module')}: <span className="font-medium">{moduleName}</span> • {t('modals.openOrCreate.title')} {lessonNumber}
            </p>
            <p className="text-lg font-semibold text-black mt-1">{lessonTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Recommendations */}
        {recommendedContentTypes?.primary && recommendedContentTypes.primary.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 text-sm text-gray-600">
              <span className="font-medium">{t('modals.createContent.recommended', 'Recommended')}</span>
              {recommendedContentTypes.quality_tier_used && (
                <span className="ml-2 text-gray-400">({recommendedContentTypes.quality_tier_used})</span>
              )}
            </div>
            <div className="space-y-4">
              {recommendedOnly.map(renderTypeButton)}
            </div>
            {recommendedContentTypes.reasoning && (
              <p className="mt-3 text-xs text-gray-500">{recommendedContentTypes.reasoning}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAllOptions(true)}
                className="inline-flex items-center text-sm px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                <span className="mr-2">{t('modals.createContent.other', 'Other')}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
        
        {/* If no recommendations, show all */}
        {!recommendedContentTypes?.primary?.length && (
          <div className="space-y-4">
            {updatedContentTypes.map(renderTypeButton)}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-black text-center">
            {t('modals.createContent.chooseContentType')}
          </p>
        </div>
      </div>

      {/* All options modal */}
      {showAllOptions && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAllOptions(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('modals.createContent.allOptions', 'All content types')}</h3>
              <button onClick={() => setShowAllOptions(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-auto">
              {updatedContentTypes.map(renderTypeButton)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 