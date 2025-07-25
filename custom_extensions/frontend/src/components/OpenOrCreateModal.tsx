"use client";

import React from 'react';
import { X, ExternalLink, Play, Plus } from 'lucide-react';

interface OpenOrCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  hasLesson: boolean;
  hasQuiz: boolean;
  hasOnePager: boolean;
  onOpen: () => void;
  onCreate: () => void;
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
  onOpen,
  onCreate,
}) => {
  if (!isOpen) return null;

  const actionTypes = [
    {
      type: 'open' as const,
      icon: <Play className="w-6 h-6" />,
      label: "Open Existing",
      description: hasLesson && hasQuiz && hasOnePager
        ? "Open lesson, quiz, or one-pager" 
        : hasLesson && hasQuiz
        ? "Open lesson or quiz"
        : hasLesson && hasOnePager
        ? "Open lesson or one-pager"
        : hasQuiz && hasOnePager
        ? "Open quiz or one-pager"
        : hasLesson 
        ? "Open lesson" 
        : hasQuiz
        ? "Open quiz"
        : "Open one-pager",
      color: "blue",
      onClick: onOpen,
      disabled: !hasLesson && !hasQuiz && !hasOnePager
    },
    {
      type: 'create' as const,
      icon: <Plus className="w-6 h-6" />,
      label: "Create New",
      description: hasLesson && hasQuiz && hasOnePager
        ? "Create lesson, quiz, or one-pager" 
        : hasLesson && hasQuiz
        ? "Create lesson or quiz"
        : hasLesson && hasOnePager
        ? "Create lesson or one-pager"
        : hasQuiz && hasOnePager
        ? "Create quiz or one-pager"
        : hasLesson 
        ? "Create quiz or one-pager" 
        : hasQuiz 
        ? "Create lesson or one-pager" 
        : hasOnePager
        ? "Create lesson or quiz"
        : "Create lesson, quiz, or one-pager",
      color: "green",
      onClick: onCreate,
      disabled: false
    }
  ];

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
            <h2 className="text-2xl font-bold text-black mb-2">Choose Action</h2>
            <p className="text-black">
              Module: <span className="font-medium">{moduleName}</span> • Lesson {lessonNumber}
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
        
        {/* Action Types Grid */}
        <div className="space-y-4">
          {actionTypes.map((action) => {
            const colorClasses = {
              blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
              green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100'
            };
            
            const iconColorClasses = {
              blue: 'text-blue-600 bg-blue-100',
              green: 'text-green-600 bg-green-100'
            };

            const isDisabled = action.disabled;

            return (
              <button
                key={action.type}
                onClick={() => !isDisabled && action.onClick()}
                disabled={isDisabled}
                className={`w-full flex items-center p-6 border-2 rounded-xl transition-all duration-200 text-left ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : `${colorClasses[action.color as keyof typeof colorClasses]} hover:shadow-md cursor-pointer`
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    isDisabled ? 'bg-gray-100' : iconColorClasses[action.color as keyof typeof iconColorClasses]
                  }`}>
                    {React.cloneElement(action.icon, { 
                      className: `w-6 h-6 ${isDisabled ? 'text-gray-400' : ''}` 
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-black">{action.label}</h3>
                    </div>
                    <p className="text-sm text-black">{action.description}</p>
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
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-black text-center">
            Choose whether to open existing content or create new content for this lesson
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenOrCreateModal; 