"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TextPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function TextPopup({ isOpen, onClose, position }: TextPopupProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop to close popup when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 min-w-[200px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="space-y-0">
          {/* Title */}
          <div className="cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded transition-colors">
            <span 
              className="font-bold"
              style={{
                fontSize: '20px',
                lineHeight: '1.2',
                color: '#000000',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              {t('textPopup.options.title', 'Title')}
            </span>
          </div>

          {/* Subtitle */}
          <div className="cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded transition-colors">
            <span 
              className="font-semibold"
              style={{
                fontSize: '16px',
                lineHeight: '1.3',
                color: '#333333',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              {t('textPopup.options.subtitle', 'Subtitle')}
            </span>
          </div>

          {/* Body Text */}
          <div className="cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded transition-colors">
            <span 
              className="font-normal"
              style={{
                fontSize: '12px',
                lineHeight: '1.4',
                color: '#666666',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              {t('textPopup.options.body', 'Body text')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
