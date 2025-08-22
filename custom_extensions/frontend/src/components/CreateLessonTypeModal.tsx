// custom_extensions/frontend/src/components/CreateLessonTypeModal.tsx
"use client";

import React from 'react';
import { Presentation, Video, Film, X, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateLessonTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;      // Added for context
  lessonNumber: number;    // Added for context
  sourceChatSessionId: string | null | undefined;
  detectedLanguage?: 'en' | 'ru' | 'uk';
}

const lessonTypes = [
  { 
    name: "lessonPresentation", 
    icon: <Presentation className="w-6 h-6" />, 
    disabled: false 
  },
  { 
    name: "quiz", 
    icon: <HelpCircle className="w-6 h-6" />, 
    disabled: false 
  },
  { 
    name: "videoLessonScript", 
    icon: <Video className="w-6 h-6" />, 
    disabled: false 
  },
  { 
    name: "videoLesson", 
    icon: <Film className="w-6 h-6" />, 
    disabled: true,
    tooltipKey: "comingSoon",
    soon: true
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

export const CreateLessonTypeModal = ({ 
  isOpen, 
  onClose, 
  lessonTitle, 
  moduleName,
  lessonNumber,
  sourceChatSessionId,
  detectedLanguage = 'en'
}: CreateLessonTypeModalProps) => {
  const { t } = useLanguage();

  const handleLessonCreate = (lessonType: string) => {
    if (lessonType === "quiz") {
      // For quiz creation, redirect to create page with quiz context
      const quizContext = {
        product: 'quiz',
        lessonType: 'quiz',
        lessonTitle: lessonTitle,
        moduleName: moduleName,
        lessonNumber: lessonNumber,
        timestamp: Date.now()
      };
      
      // Store quiz context in sessionStorage
      sessionStorage.setItem('lessonContext', JSON.stringify(quizContext));
      
      // Redirect to create page
      window.location.href = '/create';
      onClose();
      return;
    }

    // For other lesson types, use the existing chat flow
    if (!sourceChatSessionId) {
      alert(t('modals.createLesson.errorNoSessionId'));
      onClose();
      return;
    }

    const message = `Please create a ${lessonType} for the ${lessonTitle} (module: ${moduleName}, lesson: ${lessonNumber})`;
    
    const chatUrl = `/chat?chatId=${sourceChatSessionId}&user-prompt=${encodeURIComponent(message)}&send-on-load=true`;
    
    window.location.href = chatUrl;
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal title={t('modals.createLesson.title')} onClose={onClose}>
      <div className="px-6 pb-6">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-indigo-600 break-words">
            {lessonTitle}
          </p>
        </div>
        <div className="space-y-4">
          {lessonTypes.map((type) => (
            <StyledButton
              key={type.name}
              onClick={() => handleLessonCreate(type.name)}
              disabled={type.disabled}
              title={type.tooltipKey ? t(`modals.createLesson.${type.tooltipKey}`) : undefined}
            >
                <div className="w-1/4 flex justify-center items-center">
                    {type.icon}
                </div>
                <div className="w-3/4 text-left flex items-center gap-2">
                    {type.name === "quiz" ? t('modals.createTest.quiz') : t(`modals.createLesson.${type.name}`)}
                    {(type as any).soon && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                        {t('modals.createLesson.comingSoon')}
                      </span>
                    )}
                </div>
            </StyledButton>
          ))}
        </div>
      </div>
    </Modal>
  );
};
