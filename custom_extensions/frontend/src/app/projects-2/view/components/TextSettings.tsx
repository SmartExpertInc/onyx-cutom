import React, { useState, useEffect, useRef } from 'react';
import AdvancedSettings from './AdvancedSettings';

export default function TextSettings() {
  const [activeTab, setActiveTab] = useState<'format' | 'animate'>('format');
  const [animationType, setAnimationType] = useState<'none' | 'fade' | 'slide' | 'grow'>('fade');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Format states
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const [fontSize, setFontSize] = useState('16px');
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isParagraph, setIsParagraph] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontColor, setFontColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Advanced settings states
  const [rotation, setRotation] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  // Refs for dropdowns
  const fontFamilyDropdownRef = useRef<HTMLDivElement>(null);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);
  const animationDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontFamilyDropdownRef.current && !fontFamilyDropdownRef.current.contains(event.target as Node)) {
        setShowFontFamilyDropdown(false);
      }
      if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(event.target as Node)) {
        setShowFontSizeDropdown(false);
      }
      if (animationDropdownRef.current && !animationDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const animationOptions = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'grow', label: 'Grow' }
  ];

  const fontFamilyOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Helvetica', label: 'Helvetica' }
  ];

  const fontSizeOptions = [
    { value: '12px', label: '12px' },
    { value: '16px', label: '16px' },
    { value: '24px', label: '24px' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-[5px]">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          {/* Text icon */}
          <div className="w-5 h-5 text-gray-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 2h6v2H7V6zm0 4h6v2H7v-2zm0 4h4v2H7v-2z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Text name */}
          <span className="text-sm font-medium text-gray-700">Text</span>
        </div>
        
        {/* Remove button */}
        <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors">
          Remove
        </button>
      </div>
      
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('format')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'format'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Format
        </button>
        <button
          onClick={() => setActiveTab('animate')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'animate'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Animate
        </button>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {activeTab === 'format' ? (
          <div className="space-y-4">
            {/* Font Family */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Font family</span>
              <div className="relative" ref={fontFamilyDropdownRef}>
                <button
                  onClick={() => setShowFontFamilyDropdown(!showFontFamilyDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span>{fontFamily}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showFontFamilyDropdown && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {fontFamilyOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFontFamily(option.value);
                          setShowFontFamilyDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
                      >
                        {fontFamily === option.value ? (
                          <svg className="w-4 h-4 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mr-2"></div>
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Font Style */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Font style</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors group relative ${
                    isBold ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title="Bold"
                >
                  <span className="font-bold text-sm">B</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Bold
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors group relative ${
                    isItalic ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title="Italic"
                >
                  <span className="italic text-sm">I</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Italic
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors group relative ${
                    isUnderline ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title="Underline"
                >
                  <span className="underline text-sm">U</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Underline
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  onClick={() => setIsStrikethrough(!isStrikethrough)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors group relative ${
                    isStrikethrough ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title="Strikethrough"
                >
                  <span className="line-through text-sm">S</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Strikethrough
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  onClick={() => setIsParagraph(!isParagraph)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors group relative ${
                    isParagraph ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title="Paragraph"
                >
                  <span className="text-sm">P</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Paragraph
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Font size</span>
              <div className="relative" ref={fontSizeDropdownRef}>
                <button
                  onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span>{fontSize}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showFontSizeDropdown && (
                  <div className="absolute right-0 mt-1 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {fontSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFontSize(option.value);
                          setShowFontSizeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
                      >
                        {fontSize === option.value ? (
                          <svg className="w-4 h-4 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mr-2"></div>
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Text Align */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Text align</span>
              <div className="bg-gray-100 rounded-full p-1 flex space-x-1">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors group relative ${
                    textAlign === 'left' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Align left"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 7h18c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm0 4h14c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm18 2H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm-4 4H3c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Align left
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors group relative ${
                    textAlign === 'center' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Align center"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17 19H7c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1-.4 1-1s-.4-1-1-1zM3 5h18c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm18 10H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm0-4H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm0-4H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Align center
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors group relative ${
                    textAlign === 'right' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Align right"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 7h18c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm18 2H7c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1zm0 4H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm0 4H7c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Align right
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Font Color */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Font color</span>
              <button
                className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: fontColor }}
                title="Font color"
              />
            </div>

            {/* Background Color */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Background color</span>
              <button
                className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: backgroundColor }}
                title="Background color"
              />
            </div>

            {/* Order */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Order</span>
              <div className="flex space-x-2">
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send text to back"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5V6H9.5A3.5 3.5 0 0 0 6 9.5V13H4.5A2.5 2.5 0 0 1 2 10.5v-6ZM9.5 7A2.5 2.5 0 0 0 7 9.5v6A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7h-6ZM8 9.5A1.5 1.5 0 0 1 9.5 8h6A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5v-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send text to back
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send text backward"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v6A2.5 2.5 0 0 0 4.5 13H6v-1.707L5.293 12H4.5c-.232 0-.45-.053-.647-.146L6 9.707V9.5c0-.571.137-1.11.38-1.586l-3.234 3.233A1.495 1.495 0 0 1 3 10.5v-.94L9.56 3h.94c.232 0 .45.052.647.146L7.914 6.38A3.485 3.485 0 0 1 9.5 6h.207l2.147-2.147c.094.196.146.415.146.647v.793L11.293 6H13V4.5A2.5 2.5 0 0 0 10.5 2h-6ZM3 4.5A1.5 1.5 0 0 1 4.5 3h.647L3 5.147V4.5Zm0 2.06L6.56 3h1.587L3 8.147V6.56ZM7 9.5A2.5 2.5 0 0 1 9.5 7h6A2.5 2.5 0 0 1 18 9.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 7 15.5v-6ZM9.5 8A1.5 1.5 0 0 0 8 9.5v6A1.5 1.5 0 0 0 9.5 17h6a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 15.5 8h-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send text backward
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Bring text forward"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6ZM4.5 3A1.5 1.5 0 0 0 3 4.5v.647L5.147 3H4.5Zm2.06 0L3 6.56v1.587L8.147 3H6.56ZM3 10.5c0 .232.052.45.146.647l8-8A1.495 1.495 0 0 0 10.5 3h-.94L3 9.56v.94ZM4.5 12h.793L12 5.293V4.5c0-.232-.053-.45-.146-.647l-8 8c.195.095.414.147.646.147Zm5.207 0h.793a1.5 1.5 0 0 0 1.5-1.5v-.793L9.707 12Zm-1.414 0L12 8.293V6.707L6.707 12h1.586Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Bring text forward
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send text to front"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send text to front
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {showAdvancedSettings ? 'Collapse advanced settings' : 'Show advanced settings'}
              </span>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Advanced Settings Content */}
            <div 
              className={`border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
                showAdvancedSettings ? 'max-h-96 opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0'
              }`}
            >
              <div className="px-4 pb-[5px]">
                <AdvancedSettings
                  rotation={rotation}
                  onRotationChange={setRotation}
                  positionX={positionX}
                  onPositionXChange={setPositionX}
                  positionY={positionY}
                  onPositionYChange={setPositionY}
                  width={width}
                  onWidthChange={setWidth}
                  height={height}
                  onHeightChange={setHeight}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Animate content */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Animation type</span>
              <div className="relative" ref={animationDropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span>{animationOptions.find(opt => opt.value === animationType)?.label}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {animationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setAnimationType(option.value as 'none' | 'fade' | 'slide' | 'grow');
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
                      >
                        {animationType === option.value ? (
                          <svg className="w-4 h-4 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mr-2"></div>
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
