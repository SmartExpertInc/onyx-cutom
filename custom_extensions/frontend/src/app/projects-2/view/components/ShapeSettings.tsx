import React, { useState, useEffect, useRef } from 'react';
import AdvancedSettings from './AdvancedSettings';
import ColorPalettePopup from './ColorPalettePopup';
import Tooltip from './Tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ShapeSettings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'format' | 'animate'>('format');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Format states
  const [fillColor, setFillColor] = useState('#3B82F6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const contentRef = useRef<HTMLDivElement>(null);

  // Color picker states
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const [fillColorPickerPosition, setFillColorPickerPosition] = useState({ x: 0, y: 0 });
  const [strokeColorPickerPosition, setStrokeColorPickerPosition] = useState({ x: 0, y: 0 });
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Advanced settings states
  const [rotation, setRotation] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  const strokeWidthOptions = [
    { value: '0px', label: '0px' },
    { value: '1px', label: '1px' },
    { value: '2px', label: '2px' },
    { value: '4px', label: '4px' },
    { value: '8px', label: '8px' }
  ];

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close dropdowns if color pickers are open
      if (showFillColorPicker || showStrokeColorPicker) {
        return;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFillColorPicker, showStrokeColorPicker]);

  // Handle fill color button click
  const handleFillColorClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 280; // Width of the color picker popup
    const popupHeight = 280; // Approximate height of the color picker popup
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate position to upper right of button
    let x = rect.right + 8; // 8px gap to the right
    let y = rect.top - popupHeight - 8; // 8px gap above
    
    // Ensure popup stays within viewport
    if (x + popupWidth > viewportWidth) {
      x = rect.left - popupWidth - 8; // Position to the left if not enough space on right
    }
    if (y < 0) {
      y = rect.bottom + 8; // Position below if not enough space above
    }
    
    setFillColorPickerPosition({ x, y });
    setShowFillColorPicker(true);
    setShowStrokeColorPicker(false);
  };

  // Handle stroke color button click
  const handleStrokeColorClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 280; // Width of the color picker popup
    const popupHeight = 280; // Approximate height of the color picker popup
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate position to upper right of button
    let x = rect.right + 8; // 8px gap to the right
    let y = rect.top - popupHeight - 8; // 8px gap above
    
    // Ensure popup stays within viewport
    if (x + popupWidth > viewportWidth) {
      x = rect.left - popupWidth - 8; // Position to the left if not enough space on right
    }
    if (y < 0) {
      y = rect.bottom + 8; // Position below if not enough space above
    }
    
    setStrokeColorPickerPosition({ x, y });
    setShowStrokeColorPicker(true);
    setShowFillColorPicker(false);
  };


  return (
    <>
      <div className="bg-white h-full flex flex-col">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          {/* Shape icon */}
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Shape name */}
          <span className="text-xs font-medium text-gray-700">{t('panels.shape.shapeName', 'Shape name')}</span>
        </div>
        
        {/* Remove button */}
        <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:border-gray-400 transition-colors">
          {t('panels.shape.remove', 'Remove')}
        </button>
      </div>
      
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('format')}
          className={`flex-1 py-3 px-4 text-xs font-medium transition-all ${
            activeTab === 'format'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('panels.shape.format', 'Format')}
        </button>
        <button
          onClick={() => setActiveTab('animate')}
          className={`flex-1 py-3 px-4 text-xs font-medium transition-all ${
            activeTab === 'animate'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('panels.shape.animate', 'Animate')}
        </button>
      </div>
      
      {/* Content area */}
      <div ref={contentRef} className="p-4">
        {activeTab === 'format' ? (
          <div className="space-y-4">
            {/* Fill section */}
            <div className="space-y-3">
              {/* Fill header with Remove button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 pl-2">{t('panels.shape.fill', 'Fill')}</span>
                <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:border-gray-400 transition-colors">
                  {t('panels.shape.remove', 'Remove')}
                </button>
              </div>
              
              {/* Fill Color */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-xs text-gray-600">{t('panels.shape.color', 'Color')}</span>
                <button
                  className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: fillColor }}
                  title={`${t('panels.shape.fillColor', 'Fill color')}: ${fillColor}`}
                  onClick={handleFillColorClick}
                >
                  {/* Add a subtle pattern for better color visibility */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10"></div>
                </button>
              </div>
            </div>

            {/* Stroke section */}
            <div className="space-y-3">
              {/* Stroke header with Remove button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{t('panels.shape.stroke', 'Stroke')}</span>
                <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:border-gray-400 transition-colors">
                  {t('panels.shape.remove', 'Remove')}
                </button>
              </div>
              
              {/* Stroke Color */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-xs text-gray-600">{t('panels.shape.strokeColor', 'Stroke color')}</span>
                <button
                  className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: strokeColor }}
                  title={`${t('panels.shape.strokeColor', 'Stroke color')}: ${strokeColor}`}
                  onClick={handleStrokeColorClick}
                >
                  {/* Add a subtle pattern for better color visibility */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10"></div>
                </button>
              </div>

              {/* Stroke Width with Range Slider */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-xs text-gray-600">{t('panels.shape.strokeWidth', 'Stroke width')}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-gray-500 min-w-[2rem]">{strokeWidth}</span>
                  <div className="relative w-32 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={strokeWidth}
                      onChange={(e) => {
                        const value = e.target.value;
                        setStrokeWidth(parseInt(value));
                        const percentage = value + '%';
                        e.target.style.background = `linear-gradient(to right, #000000 0%, #000000 ${percentage}, #e5e7eb ${percentage}, #e5e7eb 100%)`;
                      }}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      title={`${t('panels.shape.strokeWidth', 'Stroke width')}: ${strokeWidth}`}
                      style={{
                        background: `linear-gradient(to right, #000000 0%, #000000 ${strokeWidth}%, #e5e7eb ${strokeWidth}%, #e5e7eb 100%)`
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #000000;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                      }
                      
                      input[type="range"]::-moz-range-thumb {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #000000;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                      }
                      
                      input[type="range"]::-webkit-slider-track {
                        appearance: none;
                        background: transparent;
                      }
                      
                      input[type="range"]::-moz-range-track {
                        background: transparent;
                        border: none;
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            </div>

            {/* Stroke section */}
            <div className="space-y-3">
              {/* Stroke header with Remove button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{t('panels.shape.stroke', 'Stroke')}</span>
                <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:border-gray-400 transition-colors">
                  {t('panels.shape.remove', 'Remove')}
                </button>
              </div>
              
              {/* Stroke Color */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-xs text-gray-600">{t('panels.shape.strokeColor', 'Stroke color')}</span>
                <button
                  className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: strokeColor }}
                  title={`${t('panels.shape.strokeColor', 'Stroke color')}: ${strokeColor}`}
                  onClick={handleStrokeColorClick}
                >
                  {/* Add a subtle pattern for better color visibility */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10"></div>
                </button>
              </div>

              {/* Stroke Width with Range Slider */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-xs text-gray-600">{t('panels.shape.strokeWidth', 'Stroke width')}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-gray-500 min-w-[2rem]">{strokeWidth}</span>
                  <div className="relative w-32 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={strokeWidth}
                      onChange={(e) => {
                        const value = e.target.value;
                        setStrokeWidth(parseInt(value));
                        const percentage = value + '%';
                        e.target.style.background = `linear-gradient(to right, #000000 0%, #000000 ${percentage}, #e5e7eb ${percentage}, #e5e7eb 100%)`;
                      }}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      title={`${t('panels.shape.strokeWidth', 'Stroke width')}: ${strokeWidth}`}
                      style={{
                        background: `linear-gradient(to right, #000000 0%, #000000 ${strokeWidth}%, #e5e7eb ${strokeWidth}%, #e5e7eb 100%)`
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #000000;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                      }
                      
                      input[type="range"]::-moz-range-thumb {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #000000;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                      }
                      
                      input[type="range"]::-webkit-slider-track {
                        appearance: none;
                        background: transparent;
                      }
                      
                      input[type="range"]::-moz-range-track {
                        background: transparent;
                        border: none;
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            </div>

              {/* Advanced Settings Content */}
              <div className="pt-4">
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
        ) : (
          <div className="space-y-4">
            {/* Animation type */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{t('panels.shape.animationType', 'Animation type')}</span>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                >
                                          <span className="text-gray-700">{t('panels.shape.animationNone', 'None')}</span>
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {[
                      { key: 'none', label: t('panels.shape.animationNone', 'None') },
                      { key: 'fade', label: t('panels.shape.animationFade', 'Fade') },
                      { key: 'slide', label: t('panels.shape.animationSlide', 'Slide') },
                      { key: 'grow', label: t('panels.shape.animationGrow', 'Grow') }
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center"
                      >
                        {option.key === 'none' ? (
                          <svg className="w-4 h-4 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mr-2"></div>
                        )}
                        <span className="text-gray-700">{option.label}</span>
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

    {/* Fill Color Picker Popup */}
    <ColorPalettePopup
      isOpen={showFillColorPicker}
      onClose={() => setShowFillColorPicker(false)}
      onColorChange={setFillColor}
      selectedColor={fillColor}
      position={fillColorPickerPosition}
      recentColors={recentColors}
      onRecentColorChange={setRecentColors}
    />

    {/* Stroke Color Picker Popup */}
    <ColorPalettePopup
      isOpen={showStrokeColorPicker}
      onClose={() => setShowStrokeColorPicker(false)}
      onColorChange={setStrokeColor}
      selectedColor={strokeColor}
      position={strokeColorPickerPosition}
      recentColors={recentColors}
      onRecentColorChange={setRecentColors}
    />
    </>
  );
}
