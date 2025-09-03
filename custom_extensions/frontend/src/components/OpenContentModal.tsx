"use client";

import React from 'react';
import { Presentation, Video, HelpCircle, X, ExternalLink, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OpenContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  hasLesson: boolean;
  hasVideoLesson: boolean;
  hasQuiz: boolean;
  hasOnePager: boolean;
  lessonId?: number;
  videoLessonId?: number;
  quizId?: number;
  onePagerId?: number;
  parentProjectName?: string;
}

const OpenContentModal: React.FC<OpenContentModalProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  moduleName,
  lessonNumber,
  hasLesson,
  hasVideoLesson,
  hasQuiz,
  hasOnePager,
  lessonId,
  videoLessonId,
  quizId,
  onePagerId,
  parentProjectName,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleOpenContent = (type: 'lesson' | 'videoLesson' | 'quiz' | 'onePager', id?: number) => {
    if (id) {
      // Redirect to the lesson's view page using only the lesson ID
      // Include the /custom-projects-ui prefix for proper routing
      const url = `/custom-projects-ui/projects/view/${id}`;
      window.location.href = url;
    }
    onClose();
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">{t('modals.openContent.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-black mb-6">
          <span className="font-semibold">{t('modals.openContent.lesson')}:</span> {lessonTitle}<br />
          <span className="font-semibold">{t('modals.openContent.module')}:</span> {moduleName} • {t('modals.openContent.lesson')} {lessonNumber}
        </p>

        <div className="space-y-4">
          {/* Lesson Presentation */}
          {hasLesson && lessonId && (
            <button
              onClick={() => handleOpenContent('lesson', lessonId)}
              className="w-full flex items-center p-6 border-2 rounded-xl border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 rounded-lg text-blue-600 bg-blue-100">
                  <Presentation size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-black">{t('modals.openContent.presentation')}</h3>
                  </div>
                  <p className="text-sm text-black">{t('modals.openContent.openPresentation')}</p>
                </div>
              </div>
              <ExternalLink size={20} className="text-gray-400" />
            </button>
          )}

          {/* Video Lesson */}
          {hasVideoLesson && videoLessonId && (
            <button
              disabled={true}
              className="w-full flex items-center p-6 border-2 rounded-xl border-orange-200 bg-orange-50 text-gray-400 cursor-not-allowed text-left"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 rounded-lg text-orange-600 bg-orange-100">
                  <Video size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-black">
                      {t('modals.openContent.videoLesson')}
                    </h3>
                  </div>
                  <p className="text-sm text-black">{t('modals.openContent.openVideoLesson')}</p>
                </div>
              </div>
              <ExternalLink size={20} className="text-gray-300" />
            </button>
          )}

          {/* Quiz */}
          {hasQuiz && quizId && (
            <button
              onClick={() => handleOpenContent('quiz', quizId)}
              className="w-full flex items-center p-6 border-2 rounded-xl border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 rounded-lg text-green-600 bg-green-100">
                  <HelpCircle size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-black">{t('modals.openContent.quiz')}</h3>
                  </div>
                  <p className="text-sm text-black">{t('modals.openContent.openQuiz')}</p>
                </div>
              </div>
              <ExternalLink size={20} className="text-gray-400" />
            </button>
          )}

          {/* One-Pager */}
          {hasOnePager && onePagerId && (
            <button
              onClick={() => handleOpenContent('onePager', onePagerId)}
              className="w-full flex items-center p-6 border-2 rounded-xl border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 rounded-lg text-purple-600 bg-purple-100">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-black">{t('modals.openContent.onePager')}</h3>
                  </div>
                  <p className="text-sm text-black">{t('modals.openContent.openOnePager')}</p>
                </div>
              </div>
              <ExternalLink size={20} className="text-gray-400" />
            </button>
          )}

          {/* If no content is available */}
          {!hasLesson && !hasVideoLesson && !hasQuiz && !hasOnePager && (
            <div className="text-center py-8 text-black">
              <p>{t('modals.openContent.noContentAvailable')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenContentModal; 