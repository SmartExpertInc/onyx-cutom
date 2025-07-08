"use client";

import React from 'react';
import { BookText, Video, Film, X, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  parentProjectName?: string; // Add outline name for quiz creation
}

const lessonTypes = [
  { 
    name: "lessonPresentation", 
    icon: <BookText className="w-6 h-6" />, 
    label: "Lesson",
    disabled: false 
  },
  { 
    name: "videoLesson", 
    icon: <Video className="w-6 h-6" />, 
    label: "Video Lesson",
    disabled: false 
  },
];

const quizTypes = [
  { 
    name: "multiple-choice", 
    icon: <HelpCircle className="w-6 h-6" />, 
    label: "Quiz",
    disabled: false 
  },
];

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
  parentProjectName
}: CreateContentTypeModalProps) => {
  const router = useRouter();

  // Update disabled states based on what already exists
  const updatedLessonTypes = lessonTypes.map(type => ({
    ...type,
    disabled: hasLesson
  }));

  const updatedQuizTypes = quizTypes.map(type => ({
    ...type,
    disabled: hasQuiz
  }));

  const handleLessonCreate = (lessonType: string) => {
    // Redirect to create page with pre-selected product and context
    const params = new URLSearchParams({
      product: 'lesson',
      lessonType: lessonType,
      lessonTitle: lessonTitle,
      moduleName: moduleName,
      lessonNumber: String(lessonNumber)
    });
    
    router.push(`/create?${params.toString()}`);
    onClose();
  };

  const handleQuizCreate = (quizType: string) => {
    // Redirect to create page with pre-selected product and context
    const params = new URLSearchParams({
      product: 'quiz',
      lessonType: quizType,
      lessonTitle: lessonTitle,
      moduleName: moduleName,
      lessonNumber: String(lessonNumber)
    });
    
    // Add course name (outline name) for proper quiz naming
    if (parentProjectName) {
      params.set('courseName', parentProjectName);
    }
    
    router.push(`/create?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create Content for: {lessonTitle}</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lesson Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BookText className="w-5 h-5 text-blue-600" />
              Lesson
              {hasLesson && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Already created
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {updatedLessonTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => !type.disabled && handleLessonCreate(type.name)}
                  disabled={type.disabled}
                  className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors text-left ${
                    type.disabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      type.disabled ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      {React.cloneElement(type.icon, { 
                        className: `w-5 h-5 ${type.disabled ? 'text-gray-400' : 'text-blue-600'}` 
                      })}
                    </div>
                    <div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-sm text-gray-600">
                        {type.name === "lessonPresentation" 
                          ? "Create a slide-based lesson" 
                          : "Create a video lesson with narration"
                        }
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-600" />
              Quiz
              {hasQuiz && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Already created
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {updatedQuizTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => !type.disabled && handleQuizCreate(type.name)}
                  disabled={type.disabled}
                  className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors text-left ${
                    type.disabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-green-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      type.disabled ? 'bg-gray-100' : 'bg-green-100'
                    }`}>
                      {React.cloneElement(type.icon, { 
                        className: `w-5 h-5 ${type.disabled ? 'text-gray-400' : 'text-green-600'}` 
                      })}
                    </div>
                    <div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-sm text-gray-600">
                        {type.name === "multiple-choice" 
                          ? "Create an interactive quiz" 
                          : "Create a quiz with various question types"
                        }
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 