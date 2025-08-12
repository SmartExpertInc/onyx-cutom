"use client";

import React from 'react';
import { X, BookText, Video, HelpCircle, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ContentType {
  name: string;
  key: string;
  icon: React.ReactElement;
  label: string;
  description: string;
  color: string;
  disabled: boolean;
  soon?: boolean;
}

interface AllContentTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTypes: ContentType[];
  onContentCreate: (contentType: string) => void;
  onBackToRecommended?: () => void; // NEW: callback to reopen CreateContentTypeModal
}

export const AllContentTypesModal = ({ 
  isOpen, 
  onClose, 
  contentTypes, 
  onContentCreate,
  onBackToRecommended
}: AllContentTypesModalProps) => {
  const { t } = useLanguage();

  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
    purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100',
    green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100',
    orange: 'border-orange-200 bg-orange-50'
  } as const;

  const iconColorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100'
  } as const;

  const renderTypeButton = (type: ContentType) => {
    const isDisabled = type.disabled;

    return (
      <button
        key={type.name}
        onClick={() => !isDisabled && onContentCreate(type.name)}
        disabled={isDisabled}
        className={`w-full flex items-center p-4 border-2 rounded-lg transition-all duration-200 text-left ${
          isDisabled
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : `${colorClasses[type.color as keyof typeof colorClasses]} hover:shadow-md cursor-pointer`
        }`}
      >
                  <div className="flex items-center space-x-3 flex-1">
          <div className={`p-2 rounded-md ${
            isDisabled ? 'bg-gray-100' : iconColorClasses[type.color as keyof typeof iconColorClasses]
          }`}>
            {type.icon && React.isValidElement(type.icon) ? 
              React.cloneElement(type.icon as React.ReactElement<any>, { 
                className: `w-5 h-5 ${isDisabled ? 'text-gray-400' : ''}` 
              }) : 
              <div className="w-5 h-5" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-black">{type.label}</h3>
              {type.soon && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                  {t('modals.createContent.soon')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600">{type.description}</p>
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
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackToRecommended = () => {
    onClose(); // Close this modal
    if (onBackToRecommended) {
      onBackToRecommended(); // Reopen CreateContentTypeModal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('modals.createContent.allOptions', 'All content types')}</h3>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-auto">
          {contentTypes.map(renderTypeButton)}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleBackToRecommended}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            Back to recommended
          </button>
        </div>
      </div>
    </div>
  );
};
