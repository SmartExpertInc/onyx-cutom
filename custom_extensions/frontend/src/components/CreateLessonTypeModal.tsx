// custom_extensions/frontend/src/components/CreateLessonTypeModal.tsx
"use client";

import React from 'react';
import { BookText, Video, Film, X } from 'lucide-react';
import { locales } from '@/locales';

interface CreateLessonTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  moduleName: string;      // Added for context
  lessonNumber: number;    // Added for context
  sourceChatSessionId: string | null | undefined;
  outlineProjectId: number | string | undefined; // NEW: id of the Training Plan project
  detectedLanguage?: 'en' | 'ru' | 'uk';
}

// List of selectable lesson types in the modal.
// NOTE: "Video Lesson Script" is disabled for now as per requirements.
const lessonTypes = [
  {
    name: "lessonPresentation",
    icon: <BookText className="w-6 h-6" />,
    disabled: false,
  },
  {
    name: "videoLessonScript",
    icon: <Video className="w-6 h-6" />,
    disabled: true, // Disabled per request
    tooltipKey: "comingSoon",
  },
  {
    name: "videoLesson",
    icon: <Film className="w-6 h-6" />,
    disabled: true,
    tooltipKey: "comingSoon",
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
  outlineProjectId,
  detectedLanguage = 'en'
}: CreateLessonTypeModalProps) => {
  const localized = locales[detectedLanguage as keyof typeof locales].modals.createLesson;

  const handleLessonCreate = (typeKey: string) => {
    // If user selects Lesson Presentation we redirect to generator with pre-selected params
    if (typeKey === "lessonPresentation") {
      const params = new URLSearchParams();
      params.set("product", "lessonPresentation");
      if (outlineProjectId !== undefined) params.set("outlineId", String(outlineProjectId));
      params.set("lesson", lessonTitle);
      window.location.href = `/create/generate?${params.toString()}`;
      onClose();
      return;
    }

    // Fallback – existing behaviour (chat) for other types still enabled
    if (!sourceChatSessionId) {
      alert(localized.errorNoSessionId);
      onClose();
      return;
    }

    const message = `Please create a ${typeKey} for the ${lessonTitle} (module: ${moduleName}, lesson: ${lessonNumber})`;
    const chatUrl = `/chat?chatId=${sourceChatSessionId}&user-prompt=${encodeURIComponent(message)}&send-on-load=true`;
    window.location.href = chatUrl;
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal title={localized.title} onClose={onClose}>
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
              title={type.tooltipKey ? localized[type.tooltipKey as keyof typeof localized] : undefined}
            >
                <div className="w-1/4 flex justify-center items-center">
                    {type.icon}
                </div>
                <div className="w-3/4 text-left">
                    {localized[type.name as keyof typeof localized]}
                </div>
            </StyledButton>
          ))}
        </div>
      </div>
    </Modal>
  );
};
