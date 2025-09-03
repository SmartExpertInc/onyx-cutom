"use client";

import React from 'react';
import { X, ExternalLink, Play, Plus, FileText, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OpenOrCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  hasLesson: boolean;
  hasQuiz: boolean;
  hasOnePager: boolean;
  hasLessonPlan: boolean;
  lessonPlanId?: number;
  onOpen: () => void;
  onCreate: () => void;
  onOpenLessonPlan?: () => void;
  onRefreshLessonPlan?: () => void;
}

const OpenOrCreateModal: React.FC<OpenOrCreateModalProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  moduleName,
  lessonNumber,
  hasLesson,
  hasQuiz,
  hasOnePager,
  hasLessonPlan,
  lessonPlanId,
  onOpen,
  onCreate,
  onOpenLessonPlan,
  onRefreshLessonPlan,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('modals.openOrCreate.title')}</h2>
                <p className="text-lg font-semibold text-gray-700 mt-1">{lessonTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Context info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">{t('modals.openOrCreate.module')}:</span>
              <span>{moduleName}</span>
              <span className="text-gray-400">•</span>
              <span className="font-medium">{t('modals.openOrCreate.title')} {lessonNumber}</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Open existing content */}
          {(hasLesson || hasQuiz || hasOnePager) && (
            <div className="group">
              <button
                onClick={onOpen}
                className="w-full flex items-center p-6 border-2 rounded-xl border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-3 rounded-xl text-blue-600 bg-blue-100 group-hover:scale-110 transition-transform duration-200">
                    <Play size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-blue-900">{t('modals.openOrCreate.openExisting')}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {(hasLesson ? 1 : 0) + (hasQuiz ? 1 : 0) + (hasOnePager ? 1 : 0)} {(hasLesson ? 1 : 0) + (hasQuiz ? 1 : 0) + (hasOnePager ? 1 : 0) === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {hasLesson && hasQuiz && hasOnePager
                        ? t('modals.openOrCreate.openAll')
                        : hasLesson && hasQuiz
                        ? t('modals.openOrCreate.openPresentationAndQuiz')
                        : hasLesson && hasOnePager
                        ? t('modals.openOrCreate.openPresentationAndOnePager')
                        : hasQuiz && hasOnePager
                        ? t('modals.openOrCreate.openQuizAndOnePager')
                        : hasLesson
                        ? t('modals.openOrCreate.openPresentation')
                        : hasQuiz
                        ? t('modals.openOrCreate.openQuiz')
                        : t('modals.openOrCreate.openOnePager')
                      }
                    </p>
                  </div>
                </div>
                <div className="text-blue-400 group-hover:text-blue-600 transition-all duration-200 group-hover:translate-x-1">
                  <ExternalLink size={20} />
                </div>
              </button>
            </div>
          )}

          {/* Create new content */}
          <div className="group">
            <button
              onClick={onCreate}
              className="w-full flex items-center p-6 border-2 rounded-xl border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 rounded-xl text-green-600 bg-green-100 group-hover:scale-110 transition-transform duration-200">
                  <Plus size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-green-900">{t('modals.openOrCreate.createNew')}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      New content
                    </span>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed">
                    {hasLesson && hasQuiz && hasOnePager
                      ? t('modals.openOrCreate.createAll')
                      : hasLesson && hasQuiz
                      ? t('modals.openOrCreate.createOnePager')
                      : hasLesson && hasOnePager
                      ? t('modals.openOrCreate.createQuiz')
                      : hasQuiz && hasOnePager
                      ? t('modals.openOrCreate.createPresentation')
                      : hasLesson
                      ? t('modals.openOrCreate.createQuizAndOnePager')
                      : hasQuiz
                      ? t('modals.openOrCreate.createPresentationAndOnePager')
                      : hasOnePager
                      ? t('modals.openOrCreate.createPresentationAndQuiz')
                      : t('modals.openOrCreate.createAll')
                    }
                  </p>
                </div>
              </div>
              <div className="text-green-400 group-hover:text-green-600 transition-all duration-200 group-hover:translate-x-1">
                <Plus size={20} />
              </div>
            </button>
          </div>

          {/* Lesson Plan Option */}
          {hasLessonPlan && (
            <div className="group">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenLessonPlan}
                  className="flex-1 flex items-center p-6 border-2 rounded-xl border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 rounded-xl text-purple-600 bg-purple-100 group-hover:scale-110 transition-transform duration-200">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-purple-900">Lesson Plan</h3>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          Available
                        </span>
                      </div>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        View your generated lesson plan with objectives, materials, and prompts
                      </p>
                    </div>
                  </div>
                  <div className="text-purple-400 group-hover:text-purple-600 transition-all duration-200 group-hover:translate-x-1">
                    <ExternalLink size={20} />
                  </div>
                </button>
                
                {/* Refresh Button */}
                <button
                  onClick={onRefreshLessonPlan}
                  className="p-6 border-2 rounded-xl border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
                  title="Generate new lesson plan"
                >
                  <div className="p-3 rounded-xl text-purple-600 bg-purple-100 group-hover:scale-110 transition-transform duration-200">
                    <RefreshCw size={24} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Choose an option to continue with your lesson content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenOrCreateModal;
