"use client";

import React from 'react';
import { BookText, Video, HelpCircle, X, ExternalLink, FileText } from 'lucide-react';

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

  const contentTypes = [
    {
      type: 'lesson' as const,
      id: lessonId,
      hasContent: hasLesson,
      icon: <BookText className="w-6 h-6" />,
      label: "Lesson Presentation",
      description: "Open the lesson presentation",
      color: "blue",
      disabled: !hasLesson || !lessonId
    },
    {
      type: 'videoLesson' as const,
      id: videoLessonId,
      hasContent: hasVideoLesson,
      icon: <Video className="w-6 h-6" />,
      label: "Video Lesson",
      description: "Video lessons coming soon",
      color: "orange",
      disabled: true,
      soon: true
    },
    {
      type: 'quiz' as const,
      id: quizId,
      hasContent: hasQuiz,
      icon: <HelpCircle className="w-6 h-6" />,
      label: "Quiz",
      description: "Open the quiz",
      color: "green",
      disabled: !hasQuiz || !quizId
    },
    {
      type: 'onePager' as const,
      id: onePagerId,
      hasContent: hasOnePager,
      icon: <FileText className="w-6 h-6" />,
      label: "One-Pager",
      description: "Open the one-pager",
      color: "purple",
      disabled: !hasOnePager || !onePagerId
    }
  ];

  const availableContent = contentTypes.filter(content => content.hasContent && !content.disabled);

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
            <h2 className="text-2xl font-bold text-black mb-2">Open Content</h2>
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
        
        {/* Content Types Grid */}
        <div className="space-y-4">
          {contentTypes.map((content) => {
            const colorClasses = {
              blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
              purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100',
              green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100',
              orange: 'border-orange-200 bg-orange-50'
            };
            
            const iconColorClasses = {
              blue: 'text-blue-600 bg-blue-100',
              purple: 'text-purple-600 bg-purple-100',
              green: 'text-green-600 bg-green-100',
              orange: 'text-orange-600 bg-orange-100'
            };

            const isDisabled = content.disabled;

            return (
              <button
                key={content.type}
                onClick={() => !isDisabled && handleOpenContent(content.type, content.id)}
                disabled={isDisabled}
                className={`w-full flex items-center p-6 border-2 rounded-xl transition-all duration-200 text-left ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : `${colorClasses[content.color as keyof typeof colorClasses]} hover:shadow-md cursor-pointer`
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    isDisabled ? 'bg-gray-100' : iconColorClasses[content.color as keyof typeof iconColorClasses]
                  }`}>
                    {React.cloneElement(content.icon, { 
                      className: `w-6 h-6 ${isDisabled ? 'text-gray-400' : ''}` 
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-black">{content.label}</h3>
                      {content.soon && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-black">{content.description}</p>
                  </div>
                </div>
                {!isDisabled && (
                  <ExternalLink size={20} className="text-gray-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {availableContent.length === 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-black text-center">
              No content available to open for this lesson
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenContentModal; 