// ThemePicker Component
// Reusable theme picker with sliding panel UI matching the creation flow design

import React, { useEffect } from 'react';
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('interface.themes.title', 'Presentation Themes')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isChanging}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Description */}
          <p className="text-gray-600 text-sm mb-6">
            {t('interface.themes.description', 'Choose a theme to change the visual style of your presentation. Changes will be applied immediately.')}
          </p>

          {/* Theme Grid */}
          <div className="space-y-4">
            {THEME_OPTIONS.map((themeOption) => {
              const SvgComponent = getThemeSvg(themeOption.id);
              const isSelected = selectedTheme === themeOption.id;
              
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => onThemeSelect(themeOption.id)}
                  disabled={isChanging}
                  className={`
                    w-full flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-200 p-3 gap-3
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Theme Preview */}
                  <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded">
                    <div className="w-full h-full max-w-[214px] max-h-[116px]">
                      <SvgComponent />
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`w-4 h-4 flex items-center justify-center text-blue-600 ${
                          isSelected ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        ✓
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {themeOption.label}
                      </span>
                    </div>
                    
                    {isChanging && isSelected && (
                      <div className="text-xs text-blue-600">
                        {t('interface.themes.applying', 'Applying...')}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              {t('interface.themes.footerInfo', 'Theme changes are automatically saved and will be applied to your PDF downloads.')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};