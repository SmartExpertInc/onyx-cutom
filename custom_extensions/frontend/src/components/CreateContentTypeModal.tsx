"use client";

import React from 'react';
import { BookText, Film, CheckSquare, X } from 'lucide-react';
import { locales } from '@/locales';
import { useRouter } from 'next/navigation';

interface CreateContentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  sourceChatSessionId: string | null | undefined;
  detectedLanguage?: 'en' | 'ru' | 'uk';
}

const lessonTypes = [
  { 
    name: "lessonPresentation", 
    icon: <BookText className="w-6 h-6" />, 
    disabled: false,
    category: "lesson"
  },
  { 
    name: "videoLesson", 
    icon: <Film className="w-6 h-6" />, 
    disabled: true,
    tooltipKey: "comingSoon",
    category: "lesson"
  },
];

const quizTypes = [
  { 
    name: "Quiz", 
    icon: <CheckSquare className="w-6 h-6" />, 
    disabled: false,
    tooltip: "Create a quiz for this lesson",
    category: "quiz"
  },
];

// A self-contained, Tailwind-styled Modal to avoid cross-project imports.
const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
        >
            <X size={24} />
        </button>

        <div className="pt-10 pb-4 text-center">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        
        {children}
      </div>
    </div>
);

// A self-contained, Tailwind-styled Button to match the UI.
const StyledButton = ({ children, onClick, disabled, title, className = '' }: { children: React.ReactNode, onClick: () => void, disabled?: boolean, title?: string, className?: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex items-center w-full px-5 py-3
        rounded-xl
        text-md font-semibold text-slate-700 bg-slate-100
        hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:bg-slate-50 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        ${className}
      `}
    >
      {children}
    </button>
);

export const CreateContentTypeModal = ({ 
  isOpen, 
  onClose, 
  lessonTitle, 
  moduleName,
  lessonNumber,
  sourceChatSessionId,
  detectedLanguage = 'en'
}: CreateContentTypeModalProps) => {
  const router = useRouter();
  const localized = locales[detectedLanguage as keyof typeof locales].modals.createLesson;
  const contentLocalized = locales[detectedLanguage as keyof typeof locales].modals.createContent;

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
    
    router.push(`/create?${params.toString()}`);
    onClose();
  };



  if (!isOpen) {
    return null;
  }

  return (
    <Modal title={contentLocalized.title} onClose={onClose}>
      <div className="px-6 pb-6">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-indigo-600 break-words">
            {lessonTitle}
          </p>
        </div>
        
        {/* Lesson Types Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{contentLocalized.lessonTypes}</h3>
          <div className="space-y-3">
            {lessonTypes.map((type) => (
              <StyledButton
                key={type.name}
                onClick={() => handleLessonCreate(localized[type.name as keyof typeof localized])}
                disabled={type.disabled}
                title={type.tooltipKey ? localized[type.tooltipKey as keyof typeof localized] : undefined}
              >
                <div className="w-1/4 flex justify-center items-center">
                  {type.icon}
                </div>
                <div className="w-3/4 text-left">
                  {type.name === "lessonPresentation" ? "Lesson" : localized[type.name as keyof typeof localized]}
                </div>
              </StyledButton>
            ))}
            

          </div>
        </div>

        {/* Quiz Types Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{contentLocalized.assessmentTypes}</h3>
          <div className="space-y-3">
            {quizTypes.map((type) => (
              <StyledButton
                key={type.name}
                onClick={() => handleQuizCreate(type.name)}
                disabled={type.disabled}
                title={type.tooltip}
              >
                <div className="w-1/4 flex justify-center items-center">
                  {type.icon}
                </div>
                <div className="w-3/4 text-left">
                  {type.name}
                </div>
              </StyledButton>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}; 