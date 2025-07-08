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
  onOpen,
  onCreate,
}) => {
  if (!isOpen) return null;

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
          <h2 className="text-xl font-semibold text-gray-900">Lesson: {lessonTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Module: {moduleName} • Lesson {lessonNumber}
        </p>

        <div className="space-y-3">
          {/* Open existing content */}
          {(hasLesson || hasQuiz) && (
            <button
              onClick={onOpen}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Open Existing</h3>
                  <p className="text-sm text-gray-600">
                    {hasLesson && hasQuiz 
                      ? "Open lesson or quiz" 
                      : hasLesson 
                      ? "Open lesson" 
                      : "Open quiz"
                    }
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Create new content */}
          <button
            onClick={onCreate}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create New</h3>
                <p className="text-sm text-gray-600">
                  {hasLesson && hasQuiz 
                    ? "Create lesson or quiz" 
                    : hasLesson 
                    ? "Create quiz" 
                    : hasQuiz 
                    ? "Create lesson" 
                    : "Create lesson or quiz"
                  }
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenOrCreateModal; 