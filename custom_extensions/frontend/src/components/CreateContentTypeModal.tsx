"use client";

import React from 'react';
import { BookText, Video, Film, X, HelpCircle, FileText } from 'lucide-react';
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
  hasOnePager?: boolean;
  parentProjectName?: string; // Add outline name for quiz creation
}

const contentTypes = [
  { 
    name: "lessonPresentation", 
    icon: <BookText className="w-6 h-6" />, 
    label: "Presentation",
    description: "Create a slide-based presentation with interactive content",
    color: "blue",
    disabled: false 
  },
  { 
    name: "textPresentation", 
    icon: <FileText className="w-6 h-6" />, 
    label: "One-Pager",
    description: "Create a comprehensive text-based summary document",
    color: "purple",
    disabled: false 
  },
  { 
    name: "multiple-choice", 
    icon: <HelpCircle className="w-6 h-6" />, 
    label: "Quiz",
    description: "Create an interactive quiz to test knowledge",
    color: "green",
    disabled: false 
  },
  { 
    name: "videoLesson", 
    icon: <Video className="w-6 h-6" />, 
    label: "Video Lesson",
    description: "Create a video lesson with narration and visuals",
    color: "orange",
    disabled: true,
    soon: true
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
  hasOnePager = false,
  parentProjectName
}: CreateContentTypeModalProps) => {
  const router = useRouter();

  // Update disabled states based on what already exists
  const updatedContentTypes = contentTypes.map(type => ({
    ...type,
    disabled: (type.name === "lessonPresentation" && hasLesson) ||
              (type.name === "textPresentation" && hasOnePager) ||
              (type.name === "multiple-choice" && hasQuiz) ||
              type.disabled
  }));

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

    // Redirect to generate page for one-pager, others to /create
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
    if (product === 'text-presentation') {
      router.push(`/create/generate?${params.toString()}`);
    } else {
      router.push(`/create?${params.toString()}`);
    }
    onClose();
  };

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Create Content</h2>
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
          {updatedContentTypes.map((type) => {
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

            const isDisabled = type.disabled;
            const isAlreadyCreated = (type.name === "lessonPresentation" && hasLesson) ||
                                   (type.name === "textPresentation" && hasOnePager) ||
                                   (type.name === "multiple-choice" && hasQuiz);

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
                          Soon
                        </span>
                      )}
                      {isAlreadyCreated && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Already created
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
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-black text-center">
            Choose the type of content you'd like to create for this lesson
          </p>
        </div>
      </div>
    </div>
  );
}; 