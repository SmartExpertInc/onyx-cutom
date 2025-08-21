"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareText, 
  User, 
  Sparkles, 
  Shapes, 
  Type, 
  Music, 
  Layers, 
  Zap, 
  MessageCircle, 
  Flag,
  ChevronDown,
  LucideIcon,
  FileImage,
  Plus
} from 'lucide-react';
import AvatarPopup from './AvatarPopup';
import LanguageVariantModal from './LanguageVariantModal';

interface ToolbarProps {
  onActiveToolChange?: (toolId: string) => void;
  onTextButtonClick?: (position: { x: number; y: number }) => void;
  onShapesButtonClick?: (position: { x: number; y: number }) => void;
  onInteractionButtonClick?: (position: { x: number; y: number }) => void;
  onMusicButtonClick?: () => void;
  onTransitionButtonClick?: () => void;
}

interface Tool {
  id: string;
  label: string;
  icon: LucideIcon | 'custom-flag' | 'custom-background';
  chevron?: LucideIcon;
}

export default function Toolbar({ onActiveToolChange, onTextButtonClick, onShapesButtonClick, onInteractionButtonClick, onMusicButtonClick, onTransitionButtonClick }: ToolbarProps) {
  const [activeToolId, setActiveToolId] = useState<string>('script');
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState<boolean>(false);
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState<boolean>(false);
  const [isLanguageVariantModalOpen, setIsLanguageVariantModalOpen] = useState<boolean>(false);
  const textButtonRef = useRef<HTMLDivElement>(null);
  const shapesButtonRef = useRef<HTMLDivElement>(null);
  const interactionButtonRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLDivElement>(null);
  const defaultButtonRef = useRef<HTMLDivElement>(null);

  // Custom flag icon with EN text
  const renderCustomFlag = () => (
    <div className="relative inline-block">
      <Flag size={18} className="text-gray-700" />
      <span 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[7px] font-bold leading-none"
      >
        EN
      </span>
    </div>
  );

  // Custom background icon from user's SVG
  const renderCustomBackground = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24"
      className="text-gray-700"
    >
      <path 
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="m4 8l4-4m6 0L4 14m0 6L20 4m0 6L10 20m10-4l-4 4"
      />
    </svg>
  );

  const tools: Tool[] = [
    {
      id: 'script',
      label: 'Script',
      icon: MessageSquareText
    },
    {
      id: 'avatar',
      label: 'Avatar',
      icon: User
    },
    {
      id: 'background',
      label: 'Background',
      icon: 'custom-background'
    },
    {
      id: 'shapes',
      label: 'Shapes',
      icon: Shapes
    },
    {
      id: 'media',
      label: 'Media',
      icon: FileImage
    },
    {
      id: 'text',
      label: 'Text',
      icon: Type
    },
    {
      id: 'music',
      label: 'Music',
      icon: Music
    },
    {
      id: 'transition',
      label: 'Transition',
      icon: Layers
    },
    {
      id: 'interaction',
      label: 'Interaction',
      icon: Zap
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageCircle
    },
    {
      id: 'default',
      label: 'Default',
      icon: 'custom-flag',
      chevron: ChevronDown
    }
  ];

  const handleToolClick = (toolId: string, event?: React.MouseEvent<HTMLDivElement>) => {
    // Always set the active tool ID first
    setActiveToolId(toolId);
    
    if (toolId === 'text' && onTextButtonClick && textButtonRef.current) {
      const rect = textButtonRef.current.getBoundingClientRect();
      const position = {
        x: rect.left + (rect.width / 2) - 100, // Center popup (assuming 200px popup width)
        y: rect.bottom + 5 // Position popup 5px below the button
      };
      onTextButtonClick(position);
      return;
    }
    
    if (toolId === 'shapes' && onShapesButtonClick && shapesButtonRef.current) {
      const rect = shapesButtonRef.current.getBoundingClientRect();
      const position = {
        x: 8, // Position popup close to the left side of the page (8px from left border)
        y: rect.bottom + 8 // Position popup 8px below the button
      };
      onShapesButtonClick(position);
      return;
    }
    
    if (toolId === 'interaction' && onInteractionButtonClick && interactionButtonRef.current) {
      const rect = interactionButtonRef.current.getBoundingClientRect();
      const position = {
        x: rect.left + (rect.width / 2) - 250, // Center popup horizontally (assuming 500px popup width)
        y: rect.bottom + 8 // Position popup 8px below the button
      };
      onInteractionButtonClick(position);
      return;
    }
    
    if (toolId === 'music' && onMusicButtonClick) {
      onMusicButtonClick();
      return;
    }
    
    if (toolId === 'transition' && onTransitionButtonClick) {
      onTransitionButtonClick();
      return;
    }
    
    if (toolId === 'avatar' && avatarButtonRef.current) {
      const rect = avatarButtonRef.current.getBoundingClientRect();
      const popupWidth = 800; // Updated popup width
      const viewportWidth = window.innerWidth;
      
      // Calculate the ideal center position
      let x = rect.left + (rect.width / 2) - (popupWidth / 2);
      
      // Ensure popup doesn't go beyond left viewport (minimum 20px from left edge)
      if (x < 20) {
        x = 20;
      }
      
      // Ensure popup doesn't go beyond right viewport (minimum 20px from right edge)
      if (x + popupWidth > viewportWidth - 20) {
        x = viewportWidth - popupWidth - 20;
      }
      
      const position = {
        x: x,
        y: rect.bottom + 8 // Position popup 8px below the button
      };
      setIsAvatarPopupOpen(true);
      return;
    }
    
    onActiveToolChange?.(toolId);
  };

  const handleChevronClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation(); // Prevent the default button click
    setIsLanguagePopupOpen(!isLanguagePopupOpen);
  };

  const handleAddNewLanguageVariant = () => {
    setIsLanguagePopupOpen(false);
    setIsLanguageVariantModalOpen(true);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (defaultButtonRef.current && !defaultButtonRef.current.contains(event.target as Node)) {
        setIsLanguagePopupOpen(false);
      }
    };

    if (isLanguagePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguagePopupOpen]);

  return (
    <div className="w-full bg-white px-2 py-3" style={{ height: '72px' }}>
      {/* Toolbar container */}
      <div className="flex items-start justify-between max-w-full h-full">
            {/* Left side - all tools except Default */}
            <div className="flex items-start gap-2">
              {tools.filter(tool => tool.id !== 'default').map((tool) => {

                return (
                  <div
                    key={tool.id}
                    ref={tool.id === 'text' ? textButtonRef : tool.id === 'shapes' ? shapesButtonRef : tool.id === 'interaction' ? interactionButtonRef : tool.id === 'avatar' ? avatarButtonRef : undefined}
                    onClick={(event) => handleToolClick(tool.id, event)}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 ${
                      activeToolId === tool.id ? 'bg-gray-200 rounded-lg' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-3 w-4 h-4">
                      {tool.icon === 'custom-flag' 
                        ? renderCustomFlag()
                        : tool.icon === 'custom-background'
                        ? renderCustomBackground()
                        : React.createElement(tool.icon, {
                            size: 18,
                            className: tool.id === 'transition' ? "text-gray-700 -rotate-[90deg]" : "text-gray-700"
                          })
                      }
                    </div>

                    {/* Label with exact font styling */}
                    <span
                        className="font-normal whitespace-nowrap"
                        style={{
                          color: '#000000',
                          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '12px',

                          lineHeight: 'normal'
                        }}
                    >
                      {tool.label}
                    </span>

                  </div>
                );
              })}
            </div>
            
            {/* Right side - Default button */}
            <div className="flex items-start relative">
              {tools.filter(tool => tool.id === 'default').map((tool) => (
                <div key={tool.id} className="relative">
                  <div
                    ref={defaultButtonRef}
                    onClick={handleChevronClick}
                    className={`flex items-center gap-1 cursor-pointer transition-all duration-200 px-2 py-2 ${
                      activeToolId === tool.id ? 'bg-gray-200 rounded-lg' : ''
                    }`}
                  >
                    {/* Left side - Black flag with Default text under it */}
                    <div className="flex flex-col items-center">
                      {/* Black Flag Icon */}
                      <div className="flex items-center justify-center mb-1">
                        <Flag size={18} className="text-black" />
                      </div>
                      {/* Default text */}
                      <span
                        className="font-normal whitespace-nowrap text-center"
                        style={{
                          color: '#000000',
                          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '12px',
                          lineHeight: 'normal'
                        }}
                      >
                        {tool.label}
                      </span>
                    </div>

                    {/* Right side - Chevron */}
                    {tool.chevron && (
                      <div className="flex items-center justify-center">
                        {React.createElement(tool.chevron, {
                          size: 16,
                          className: "text-gray-600"
                        })}
                      </div>
                    )}
                  </div>

                  {/* Language Variants Popup */}
                  {isLanguagePopupOpen && (
                    <div 
                      className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[380px] z-50"
                      style={{ marginRight: '10px' }} // Keep popup within page boundaries
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span 
                          className="font-semibold text-gray-400"
                          style={{
                            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '12px',
                            letterSpacing: '0.05em'
                          }}
                        >
                          LANGUAGE VARIANTS
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 32 32"
                          className="text-gray-400"
                        >
                          <path 
                            fill="currentColor" 
                            d="M16 1.466C7.973 1.466 1.466 7.973 1.466 16c0 8.027 6.507 14.534 14.534 14.534c8.027 0 14.534-6.507 14.534-14.534c0-8.027-6.507-14.534-14.534-14.534zM14.757 8h2.42v2.574h-2.42V8zm4.005 15.622H16.1c-1.034 0-1.475-.44-1.475-1.496V15.26c0-.33-.176-.483-.484-.483h-.88V12.4h2.663c1.035 0 1.474.462 1.474 1.496v6.887c0 .31.176.484.484.484h.88v2.355z"
                          />
                        </svg>
                      </div>

                      {/* English Language Row */}
                      <div className="flex items-center gap-3 bg-gray-50 p-2">
                        {/* Tick Icon */}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 15 15"
                          className="text-gray-500"
                        >
                          <path 
                            fill="none" 
                            stroke="currentColor" 
                            strokeLinecap="square" 
                            d="m1 7l4.5 4.5L14 3"
                          />
                        </svg>

                        {/* English Text */}
                        <span 
                          className="text-black font-normal"
                          style={{
                            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '14px'
                          }}
                        >
                          English
                        </span>

                        {/* Default Badge */}
                        <span 
                          className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-normal"
                          style={{
                            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '12px',
                            letterSpacing: '0.05em'
                          }}
                        >
                          DEFAULT
                        </span>
                      </div>

                      {/* Horizontal Line */}
                      <div className="border-t border-gray-300 my-2 -mx-4"></div>

                      {/* Add New Language Variant Row */}
                      <div 
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                        onClick={handleAddNewLanguageVariant}
                      >
                        {/* Plus Icon */}
                        <Plus size={14} className="text-gray-500" />

                        {/* Add new language variant text */}
                        <span 
                          className="text-gray-600 font-normal"
                          style={{
                            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '14px'
                          }}
                        >
                          Add new language variant
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
      </div>
      
      {/* Avatar Popup */}
      {isAvatarPopupOpen && (
        <AvatarPopup 
          isOpen={isAvatarPopupOpen}
          onClose={() => setIsAvatarPopupOpen(false)}
          displayMode="popup"
          position={{
            x: avatarButtonRef.current ? (() => {
              const rect = avatarButtonRef.current!.getBoundingClientRect();
              const popupWidth = 800;
              const viewportWidth = window.innerWidth;
              
              let x = rect.left + (rect.width / 2) - (popupWidth / 2);
              
              if (x < 20) {
                x = 20;
              }
              
              if (x + popupWidth > viewportWidth - 20) {
                x = viewportWidth - popupWidth - 20;
              }
              
              return x;
            })() : 0,
            y: avatarButtonRef.current ? avatarButtonRef.current.getBoundingClientRect().bottom + 8 : 0
          }}
        />
      )}

      {/* Language Variant Modal */}
      <LanguageVariantModal 
        isOpen={isLanguageVariantModalOpen}
        onClose={() => setIsLanguageVariantModalOpen(false)}
      />
    </div>
  );
}
