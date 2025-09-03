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
        className={`group w-full flex items-center p-4 border-2 rounded-xl transition-all duration-300 text-left ${
          isDisabled
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : `${colorClasses[type.color as keyof typeof colorClasses]} hover:shadow-lg cursor-pointer hover:border-opacity-80`
        }`}
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-110 ${
            isDisabled ? 'bg-gray-100' : iconColorClasses[type.color as keyof typeof iconColorClasses]
          }`}>
            {type.icon && React.isValidElement(type.icon) ?
              React.cloneElement(type.icon as React.ReactElement<any>, {
                className: `w-6 h-6 transition-all duration-200 ${isDisabled ? 'text-gray-400' : ''}`
              }) :
              <div className="w-6 h-6" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800">{type.label}</h3>

            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{type.description}</p>
          </div>
        </div>
        {!isDisabled && (
          <div className="text-gray-400 group-hover:text-gray-600 transition-all duration-200 group-hover:translate-x-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t('modals.createContent.allOptions', 'All content types')}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Content Types */}
        <div className="space-y-4 max-h-[60vh] overflow-auto">
          {contentTypes.map(renderTypeButton)}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-center">
            <button
              onClick={handleBackToRecommended}
              className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t('modals.createContent.backToRecommended', 'Back to recommended')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
