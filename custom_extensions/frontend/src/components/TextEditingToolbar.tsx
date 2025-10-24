import React, { useState, useEffect, useRef } from 'react';
import ColorPalettePopup from '@/app/projects-2/view/components/ColorPalettePopup';

interface TextEditingToolbarProps {
  activeEditor?: any | null;
  computedStyles?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    textAlign?: string;
  } | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

export default function TextEditingToolbar({ 
  activeEditor, 
  computedStyles,
  position,
  isVisible 
}: TextEditingToolbarProps) {
  // Format states
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const [fontSize, setFontSize] = useState('16px');
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontColor, setFontColor] = useState('#000000');

  // Color picker states
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [fontColorPickerPosition, setFontColorPickerPosition] = useState({ x: 0, y: 0 });
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Refs
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fontFamilyDropdownRef = useRef<HTMLDivElement>(null);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to convert RGB color to hex
  const rgbToHex = (color: string): string => {
    if (!color) return '#000000';
    
    // If already hex, return it
    if (color.startsWith('#')) return color;
    
    // Parse rgb() or rgba()
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    
    return '#000000';
  };

  // Sync formatting state with active editor
  useEffect(() => {
    if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
      try {
        // Get current text color from inline styles
        const inlineColor = activeEditor.getAttributes('textStyle').color;
        const rawColor = inlineColor || computedStyles?.color || '#000000';
        const currentColor = rgbToHex(rawColor);
        setFontColor(currentColor);
        
        // Get current font family - prefer inline, fallback to computed
        const inlineFontFamily = activeEditor.getAttributes('textStyle').fontFamily;
        const currentFontFamily = inlineFontFamily || computedStyles?.fontFamily || 'Arial, sans-serif';
        setFontFamily(currentFontFamily);
        
        // Get current font size - prefer inline, fallback to computed
        const inlineFontSize = activeEditor.getAttributes('textStyle').fontSize;
        const currentFontSize = inlineFontSize || computedStyles?.fontSize || '16px';
        setFontSize(currentFontSize);
        
        // Get current text alignment
        if (activeEditor.isActive({ textAlign: 'left' })) {
          setTextAlign('left');
        } else if (activeEditor.isActive({ textAlign: 'center' })) {
          setTextAlign('center');
        } else if (activeEditor.isActive({ textAlign: 'right' })) {
          setTextAlign('right');
        } else {
          const computedAlign = computedStyles?.textAlign || 'left';
          setTextAlign(computedAlign as 'left' | 'center' | 'right');
        }
      } catch (error) {
        console.warn('Editor sync failed:', error);
      }
    }
  }, [activeEditor, computedStyles]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Close font family dropdown if clicking outside
      if (fontFamilyDropdownRef.current && !fontFamilyDropdownRef.current.contains(target)) {
        setShowFontFamilyDropdown(false);
      }
      
      // Close font size dropdown if clicking outside
      if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(target)) {
        setShowFontSizeDropdown(false);
      }
      
      // Close color picker if clicking outside (but not on toolbar or color palette)
      const isToolbarClick = toolbarRef.current?.contains(target);
      const isColorPaletteClick = (target as HTMLElement).closest?.('[data-color-palette-popup]');
      
      if (showFontColorPicker && !isToolbarClick && !isColorPaletteClick) {
        console.log('🎨 Closing color picker - clicked outside', {
          isToolbarClick,
          isColorPaletteClick,
          targetElement: (target as HTMLElement).className
        });
        setShowFontColorPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontColorPicker]);

  // Handle font color button click
  const handleFontColorClick = (event: React.MouseEvent) => {
    // Close other dropdowns
    setShowFontFamilyDropdown(false);
    setShowFontSizeDropdown(false);
    
    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 280;
    const popupHeight = 280;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = rect.right + 8;
    let y = rect.top - popupHeight - 8;
    
    if (x + popupWidth > viewportWidth) {
      x = rect.left - popupWidth - 8;
    }
    if (y < 0) {
      y = rect.bottom + 8;
    }
    
    setFontColorPickerPosition({ x, y });
    setShowFontColorPicker(true);
  };

  // Font options
  const fontFamilyOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
    { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Courier New", Courier, monospace', label: 'Courier New' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
    { value: '"Trebuchet MS", Helvetica, sans-serif', label: 'Trebuchet MS' },
    { value: 'Impact, Charcoal, sans-serif', label: 'Impact' },
    { value: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', label: 'Inter' }
  ];

  const fontSizeOptions = [
    { value: '10px', label: '10' },
    { value: '12px', label: '12' },
    { value: '14px', label: '14' },
    { value: '16px', label: '16' },
    { value: '18px', label: '18' },
    { value: '20px', label: '20' },
    { value: '24px', label: '24' },
    { value: '28px', label: '28' },
    { value: '32px', label: '32' },
    { value: '36px', label: '36' },
    { value: '42px', label: '42' },
    { value: '48px', label: '48' },
    { value: '56px', label: '56' },
    { value: '64px', label: '64' },
    { value: '72px', label: '72' }
  ];

  if (!isVisible || !activeEditor) {
    return null;
  }

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-[10000] bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 text-editing-toolbar"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Font Color */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFontColorClick(e);
          }}
          data-color-palette-popup
          className="w-7 h-7 rounded-md border border-gray-300 hover:border-gray-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          style={{ backgroundColor: fontColor }}
          title={`Font color: ${fontColor}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10"></div>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Font Family Dropdown */}
        <div className="relative" ref={fontFamilyDropdownRef}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontFamilyDropdown(!showFontFamilyDropdown);
              setShowFontSizeDropdown(false); // Close font size dropdown
              setShowFontColorPicker(false); // Close color picker
            }}
            className="flex items-center space-x-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none min-w-[100px]"
          >
            <span className="text-gray-700 truncate flex-1 text-left">
              {fontFamilyOptions.find(opt => opt.value === fontFamily)?.label || 'Arial'}
            </span>
            <svg className="w-3 h-3 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFontFamilyDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
              {fontFamilyOptions.map((option) => (
                <button
                  key={option.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                      try {
                        activeEditor.chain().focus().setMark('textStyle', { fontFamily: option.value }).run();
                        setFontFamily(option.value);
                        setShowFontFamilyDropdown(false);
                      } catch (error) {
                        console.warn('Font family change failed:', error);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50"
                  style={{ 
                    fontFamily: option.label,
                    backgroundColor: fontFamily === option.value ? '#CCDBFC' : 'transparent'
                  }}
                >
                  <span className="text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative" ref={fontSizeDropdownRef}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontSizeDropdown(!showFontSizeDropdown);
              setShowFontFamilyDropdown(false); // Close font family dropdown
              setShowFontColorPicker(false); // Close color picker
            }}
            className="flex items-center space-x-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none min-w-[60px]"
          >
            <span className="text-gray-700 flex-1 text-left">{fontSizeOptions.find(opt => opt.value === fontSize)?.label || fontSize}</span>
            <svg className="w-3 h-3 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFontSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                      try {
                        activeEditor.chain().focus().setMark('textStyle', { fontSize: option.value }).run();
                        setFontSize(option.value);
                        setShowFontSizeDropdown(false);
                      } catch (error) {
                        console.warn('Font size change failed:', error);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center justify-between"
                  style={{ backgroundColor: fontSize === option.value ? '#CCDBFC' : 'transparent' }}
                >
                  <span className="text-gray-700">{option.label}</span>
                  <span className="text-[10px] text-gray-400">px</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Font Style Buttons */}
        <div className="flex gap-1">
          <button
            onMouseDown={(e) => e.preventDefault()} 
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().toggleBold().run();
                } catch (error) {
                  console.warn('Bold toggle failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              activeEditor?.isActive?.('bold') ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={activeEditor?.isActive?.('bold') ? { backgroundColor: '#0F58F9' } : {}}
            title="Bold"
          >
            <span className="font-bold text-xs">B</span>
          </button>
          
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().toggleItalic().run();
                } catch (error) {
                  console.warn('Italic toggle failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              activeEditor?.isActive?.('italic') ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={activeEditor?.isActive?.('italic') ? { backgroundColor: '#0F58F9' } : {}}
            title="Italic"
          >
            <span className="italic text-xs">I</span>
          </button>
          
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().toggleUnderline().run();
                } catch (error) {
                  console.warn('Underline toggle failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              activeEditor?.isActive?.('underline') ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={activeEditor?.isActive?.('underline') ? { backgroundColor: '#0F58F9' } : {}}
            title="Underline"
          >
            <span className="underline text-xs">U</span>
          </button>
          
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().toggleStrike().run();
                } catch (error) {
                  console.warn('Strike toggle failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              activeEditor?.isActive?.('strike') ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={activeEditor?.isActive?.('strike') ? { backgroundColor: '#0F58F9' } : {}}
            title="Strikethrough"
          >
            <span className="line-through text-xs">S</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Align Buttons */}
        <div className="flex gap-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().setTextAlign('left').run();
                  setTextAlign('left');
                } catch (error) {
                  console.warn('Text align left failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              textAlign === 'left' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={textAlign === 'left' ? { backgroundColor: '#0F58F9' } : {}}
            title="Align left"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7h18c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm0 4h14c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm18 2H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm-4 4H3c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1z"/>
            </svg>
          </button>
          
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().setTextAlign('center').run();
                  setTextAlign('center');
                } catch (error) {
                  console.warn('Text align center failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              textAlign === 'center' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={textAlign === 'center' ? { backgroundColor: '#0F58F9' } : {}}
            title="Align center"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 19H7c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1-.4 1-1s-.4-1-1-1zM3 5h18c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm18 10H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm0-4H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm0-4H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1z"/>
            </svg>
          </button>
          
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowFontColorPicker(false); // Close color picker
              if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
                try {
                  activeEditor.chain().focus().setTextAlign('right').run();
                  setTextAlign('right');
                } catch (error) {
                  console.warn('Text align right failed:', error);
                }
              }
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              textAlign === 'right' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={textAlign === 'right' ? { backgroundColor: '#0F58F9' } : {}}
            title="Align right"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7h18c.6 0 1-.4 1-1s-.4-1-1-1H3c-.6 0-1 .4-1 1s.4 1 1 1zm18 2H7c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1zm0 4H3c-.6 0-1 .4-1 1s.4 1 1 1h18c.6 0 1-.4 1-1s-.4-1-1-1zm0 4H7c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1z"/>
            </svg>
          </button>
        </div>

      </div>

      {/* Font Color Picker Popup */}
      <ColorPalettePopup
        isOpen={showFontColorPicker}
        onClose={() => {
          console.log('🎨 ColorPalettePopup onClose called');
          setShowFontColorPicker(false);
        }}
        onColorChange={(color) => {
          console.log('🎨 ColorPalettePopup onColorChange:', color);
          setFontColor(color);
          if (activeEditor && !activeEditor.isDestroyed && activeEditor.view) {
            try {
              activeEditor.chain().focus().setColor(color).run();
              console.log('✅ Color applied to editor:', color);
            } catch (error) {
              console.warn('Color change failed:', error);
            }
          }
        }}
        selectedColor={fontColor}
        position={fontColorPickerPosition}
        recentColors={recentColors}
        onRecentColorChange={setRecentColors}
      />
    </>
  );
}

