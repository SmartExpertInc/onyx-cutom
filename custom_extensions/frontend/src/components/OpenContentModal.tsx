"use client";

import React from 'react';
import { BookText, Video, HelpCircle, X, ExternalLink } from 'lucide-react';

interface OpenContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  hasLesson: boolean;
  hasVideoLesson: boolean;
  hasQuiz: boolean;
  lessonId?: number;
  videoLessonId?: number;
  quizId?: number;
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
  lessonId,
  videoLessonId,
  quizId,
  parentProjectName,
}) => {
  if (!isOpen) return null;

  const handleOpenContent = (type: 'lesson' | 'videoLesson' | 'quiz', id?: number) => {
    if (id) {
      // Use the exact same URL pattern as the original lesson links
      const url = `/projects/view/${id}?parentProjectName=${encodeURIComponent(parentProjectName || "")}&lessonNumber=${lessonNumber}`;
      window.open(url, '_blank');
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Open Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Lesson: {lessonTitle}<br />
          Module: {moduleName} • Lesson {lessonNumber}
        </p>

        <div className="space-y-3">
          {/* Lesson Presentation */}
          {hasLesson && lessonId && (
            <button
              onClick={() => handleOpenContent('lesson', lessonId)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookText size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Lesson</h3>
                  <p className="text-sm text-gray-600">Open the lesson</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </button>
          )}

          {/* Video Lesson */}
          {hasVideoLesson && videoLessonId && (
            <button
              onClick={() => handleOpenContent('videoLesson', videoLessonId)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Video size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Video Lesson</h3>
                  <p className="text-sm text-gray-600">Open the video lesson</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </button>
          )}

          {/* Quiz */}
          {hasQuiz && quizId && (
            <button
              onClick={() => handleOpenContent('quiz', quizId)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HelpCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Quiz</h3>
                  <p className="text-sm text-gray-600">Open the quiz</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </button>
          )}

          {/* If no content is available */}
          {!hasLesson && !hasVideoLesson && !hasQuiz && (
            <div className="text-center py-8 text-gray-500">
              <p>No content available to open.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenContentModal; 