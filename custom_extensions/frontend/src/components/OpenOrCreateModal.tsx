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

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-black mb-2">Lesson: {lessonTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-black mb-6">
          <span className="font-semibold">Module:</span> {moduleName} • Lesson {lessonNumber}
        </p>

        <div className="space-y-4">
          {/* Open existing content */}
          {(hasLesson || hasQuiz || hasOnePager) && (
            <button
              onClick={onOpen}
              className="w-full flex items-center p-6 border-2 rounded-xl border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 rounded-lg text-blue-600 bg-blue-100">
                  <Play size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-black">Open Existing</h3>
                  </div>
                  <p className="text-sm text-black">
                    {hasLesson && hasQuiz && hasOnePager
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
                      : "Open one-pager"
                    }
                  </p>
                </div>
              </div>
              <ExternalLink size={20} className="text-gray-400" />
            </button>
          )}

          {/* Create new content */}
          <button
            onClick={onCreate}
            className="w-full flex items-center p-6 border-2 rounded-xl border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="p-3 rounded-lg text-green-600 bg-green-100">
                <Plus size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-black">Create New</h3>
                </div>
                <p className="text-sm text-black">
                  {hasLesson && hasQuiz && hasOnePager
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
                    : "Create lesson, quiz, or one-pager"
                  }
                </p>
              </div>
            </div>
            <ExternalLink size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenOrCreateModal; 