// ThemePicker Component
// Reusable theme picker with sliding panel UI matching the creation flow design

import React, { useEffect, useRef } from 'react';
import { X, Palette } from 'lucide-react';
import { THEME_OPTIONS, getThemeSvg } from '@/constants/themeConstants';
import { useLanguage } from '@/contexts/LanguageContext';

interface ThemePickerProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close the panel */
  onClose: () => void;
  /** Current selected theme ID */
  selectedTheme: string;
  /** Called when theme is selected */
  onThemeSelect: (themeId: string) => void;
  /** Whether theme change is in progress */
  isChanging?: boolean;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  isOpen,
  onClose,
  selectedTheme,
  onThemeSelect,
  isChanging = false
}) => {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <div ref={panelRef} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('interface.themePicker.title', 'Presentation Themes')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('interface.themePicker.description', 'Choose a theme to change the visual style of your presentation. Changes will be applied immediately.')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close theme picker"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = theme.id === selectedTheme;
              const ThemeSvgComponent = getThemeSvg(theme.id);
              
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeSelect(theme.id)}
                  disabled={isChanging}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                    ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Theme preview */}
                  <div className="w-full h-32 mb-3 rounded border border-gray-200 overflow-hidden">
                    <ThemeSvgComponent />
                  </div>

                  {/* Theme name */}
                  <div className="text-center">
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                      {theme.label}
                    </span>
                  </div>

                  {/* Loading indicator */}
                  {isChanging && isSelected && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-gray-600">
                          {t('interface.themePicker.applying', 'Applying...')}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {t('interface.themePicker.footerInfo', 'Theme preferences are saved automatically and will be restored when you return.')}
          </p>
        </div>
      </div>
    </div>
  );
};