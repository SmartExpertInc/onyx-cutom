"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface LanguageVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ru', name: 'Russian' }
];

export default function LanguageVariantModal({ isOpen, onClose }: LanguageVariantModalProps) {
  
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close modal when clicking outside
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={handleBackdropClick}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl w-[400px] max-w-[95vw] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        {/* Content */}
        <div className="px-6 py-8">
          
          {/* Row 1: Language variant title */}
          <div className="mb-4">
            <h3 
              className="text-sm font-medium text-gray-500"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '12px',
                letterSpacing: '0.05em'
              }}
            >
              LANGUAGE VARIANT
            </h3>
          </div>

          {/* Row 2: Default language */}
          <div className="flex justify-between items-center mb-4">
            <span 
              className="text-gray-600 font-normal"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px'
              }}
            >
              Default language
            </span>
            <span 
              className="text-black font-normal"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px'
              }}
            >
              English
            </span>
          </div>

          {/* Row 3: Translate to dropdown */}
          <div className="flex justify-between items-center mb-4">
            <span 
              className="text-gray-600 font-normal"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px'
              }}
            >
              Translate to
            </span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span 
                  className="text-black font-normal"
                  style={{
                    fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px'
                  }}
                >
                  {selectedLanguage}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {/* Dropdown popup */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px] z-10">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setSelectedLanguage(language.name);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span 
                        className="text-black font-normal"
                        style={{
                          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '14px'
                        }}
                      >
                        {language.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Warning text */}
          <div className="mb-6">
            <p 
              className="text-gray-500 font-normal"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px'
              }}
            >
              Text tracks may distort and overrun based on the language you choose.
            </p>
          </div>

          {/* Row 5: Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle create variant logic here
                onClose();
              }}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Create variant
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return modalContent;
}
