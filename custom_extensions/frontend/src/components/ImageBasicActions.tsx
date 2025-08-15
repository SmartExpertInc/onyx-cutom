"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ImageBlock } from '@/types/textPresentation';
import { Settings, ChevronDown, Edit3, ZoomIn, Move, Palette, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageBasicActionsProps {
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  onOpenAdvancedSettings: () => void;
  imageRef?: React.RefObject<HTMLElement>;
}

const ImageBasicActions: React.FC<ImageBasicActionsProps> = ({
  imageBlock,
  onImageChange,
  onOpenAdvancedSettings,
  imageRef
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const updateImageProperty = (property: keyof ImageBlock, value: any) => {
    const updatedBlock = { ...imageBlock, [property]: value };
    onImageChange(updatedBlock);
  };

  const quickSizePresets = [
    { name: t('interface.imageSettings.small'), width: 200, height: 'auto' },
    { name: t('interface.imageSettings.medium'), width: 400, height: 'auto' },
    { name: t('interface.imageSettings.large'), width: 600, height: 'auto' },
    { name: t('interface.imageSettings.extraLarge'), width: 800, height: 'auto' }
  ];

  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: t('interface.imageSettings.left') },
    { value: 'center', icon: AlignCenter, label: t('interface.imageSettings.center') },
    { value: 'right', icon: AlignRight, label: t('interface.imageSettings.right') }
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}

        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="flex items-center gap-1 px-2 py-1 bg-white/90 hover:bg-white text-gray-700 text-xs rounded-md transition-colors shadow-sm border border-gray-200"
      >
        <Settings className="w-3 h-3" />
        <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Basic Actions Dropdown */}
      {showMenu && createPortal(
        <div 
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e: React.MouseEvent) => e.stopPropagation()}
          onMouseLeave={(e: React.MouseEvent) => e.stopPropagation()}
          className="fixed w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-96 overflow-y-auto"
          style={{
            left: (imageRef?.current?.getBoundingClientRect().right || 0) - 224, // 224px = 56 * 4 (w-56)
            top: (imageRef?.current?.getBoundingClientRect().top || 0) + 8,
            maxHeight: 'calc(100vh - 100px)'
          }}
        >
          <div className="py-1">
            {/* Header with Advanced Settings button */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('interface.imageSettings.quickSizeControls')}</div>
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAdvancedSettings();
                  setShowMenu(false);
                }}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
                title={t('interface.imageSettings.openAdvancedSettings')}
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
              </button> */}
            </div>

            {/* Quick Size Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-1">
                {quickSizePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Applying size preset: ${preset.name}, width: ${preset.width}`);
                      const updatedBlock = {
                        ...imageBlock,
                        width: preset.width,
                        height: preset.height
                      };
                      onImageChange(updatedBlock);
                      // Don't close menu automatically - let user make multiple changes
                    }}
                    className="w-full px-2 py-1 text-left text-xs hover:bg-blue-50 rounded flex items-center justify-between"
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('interface.imageSettings.alignment')}</div>
              <div className="flex gap-1">
                {alignmentOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateImageProperty('alignment', option.value);
                      // Don't close menu automatically
                    }}
                    className={`flex-1 px-2 py-1 text-xs rounded text-center transition-colors flex items-center justify-center gap-1 ${
                      imageBlock.alignment === option.value 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-blue-50'
                    }`}
                    title={option.label}
                  >
                    <option.icon className="w-3 h-3" />
                    {/* <span className="hidden sm:inline">{option.label}</span> */}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('interface.imageSettings.cornerRounding')}</div>
              <div className="space-y-1">
                {[
                  { value: '0px', label: t('interface.imageSettings.sharp') },
                  { value: '4px', label: t('interface.imageSettings.slightlyRounded') },
                  { value: '8px', label: t('interface.imageSettings.rounded') },
                  { value: '16px', label: t('interface.imageSettings.veryRounded') }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateImageProperty('borderRadius', option.value);
                      // Don't close menu automatically
                    }}
                    className={`w-full px-2 py-1 text-left text-xs rounded transition-colors ${
                      imageBlock.borderRadius === option.value 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ImageBasicActions;
