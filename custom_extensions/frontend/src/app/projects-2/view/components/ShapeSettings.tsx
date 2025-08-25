import React, { useState, useEffect, useRef } from 'react';
import AdvancedSettings from './AdvancedSettings';
import ColorPalettePopup from './ColorPalettePopup';

export default function ShapeSettings() {
  const [activeTab, setActiveTab] = useState<'format' | 'animate'>('format');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Format states
  const [fillColor, setFillColor] = useState('#3B82F6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showStrokeWidthDropdown, setShowStrokeWidthDropdown] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

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
      
      if (showStrokeWidthDropdown) {
        setShowStrokeWidthDropdown(false);
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
      <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          {/* Shape icon */}
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Shape name */}
          <span className="text-sm font-medium text-gray-700">Shape name</span>
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
            {/* Fill section */}
            <div className="space-y-3">
              {/* Fill header with Remove button */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 pl-2">Fill</span>
                <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors">
                  Remove
                </button>
              </div>
              
              {/* Fill Color */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-sm text-gray-600">Color</span>
                <button
                  className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: fillColor }}
                  title={`Fill color: ${fillColor}`}
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
                <span className="text-sm font-medium text-gray-700">Stroke</span>
                <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors">
                  Remove
                </button>
              </div>
              
              {/* Stroke Color */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-sm text-gray-600">Stroke color</span>
                <button
                  className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: strokeColor }}
                  title={`Stroke color: ${strokeColor}`}
                  onClick={handleStrokeColorClick}
                >
                  {/* Add a subtle pattern for better color visibility */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10"></div>
                </button>
              </div>

              {/* Stroke Width with Range Slider */}
              <div className="flex items-center justify-between pl-4">
                <span className="text-sm text-gray-600">Stroke width</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 min-w-[2rem]">{strokeWidth}</span>
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
                      title={`Stroke width: ${strokeWidth}`}
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

            {/* Order */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Order</span>
              <div className="flex space-x-2">
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send shape to back"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5V6H9.5A3.5 3.5 0 0 0 6 9.5V13H4.5A2.5 2.5 0 0 1 2 10.5v-6ZM9.5 7A2.5 2.5 0 0 0 7 9.5v6A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7h-6ZM8 9.5A1.5 1.5 0 0 1 9.5 8h6A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5v-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send shape to back
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send shape backward"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v6A2.5 2.5 0 0 0 4.5 13H6v-1.707L5.293 12H4.5c-.232 0-.45-.053-.647-.146L6 9.707V9.5c0-.571.137-1.11.38-1.586l-3.234 3.233A1.495 1.495 0 0 1 3 10.5v-.94L9.56 3h.94c.232 0 .45.052.647.146L7.914 6.38A3.485 3.485 0 0 1 9.5 6h.207l2.147-2.147c.094.196.146.415.146.647v.793L11.293 6H13V4.5A2.5 2.5 0 0 0 10.5 2h-6ZM3 4.5A1.5 1.5 0 0 1 4.5 3h.647L3 5.147V4.5Zm0 2.06L6.56 3h1.587L3 8.147V6.56ZM7 9.5A2.5 2.5 0 0 1 9.5 7h6A2.5 2.5 0 0 1 18 9.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 7 15.5v-6ZM9.5 8A1.5 1.5 0 0 0 8 9.5v6A1.5 1.5 0 0 0 9.5 17h6a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 15.5 8h-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send shape backward
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Bring shape forward"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6ZM4.5 3A1.5 1.5 0 0 0 3 4.5v.647L5.147 3H4.5Zm2.06 0L3 6.56v1.587L8.147 3H6.56ZM3 10.5c0 .232.052.45.146.647l8-8A1.495 1.495 0 0 0 10.5 3h-.94L3 9.56v.94ZM4.5 12h.793L12 5.293V4.5c0-.232-.053-.45-.146-.647l-8 8c.195.095.414.147.646.147Zm5.207 0h.793a1.5 1.5 0 0 0 1.5-1.5v-.793L9.707 12Zm-1.414 0L12 8.293V6.707L6.707 12h1.586Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Bring shape forward
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send shape to front"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send shape to front
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className={`flex flex-col items-center justify-center py-2 ${!showAdvancedSettings ? '-mb-4 mb-[2px]' : ''}`}>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="text-xs text-gray-500">
                  {showAdvancedSettings ? 'Collapse advanced settings' : 'Show advanced settings'}
                </span>
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
            <div className={`transition-all duration-300 ease-in-out ${
              showAdvancedSettings ? 'h-48' : 'h-0'
            } overflow-hidden`}>
              <div className={`px-4 transition-all duration-300 ease-in-out ${
                showAdvancedSettings ? 'pt-4 pb-4' : 'pt-0 pb-0'
              }`}>
                <div className={`transition-all duration-300 ${showAdvancedSettings ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
        ) : (
          <div className="space-y-4">
            {/* Animation type */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Animation type</span>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span>None</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {['None', 'Fade', 'Slide', 'Grow'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
                      >
                        {option === 'None' ? (
                          <svg className="w-4 h-4 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mr-2"></div>
                        )}
                        <span>{option}</span>
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
    <div className="h-[5px]"></div>

    {/* Fill Color Picker Popup */}
    <ColorPalettePopup
      isOpen={showFillColorPicker}
      onClose={() => setShowFillColorPicker(false)}
      onColorChange={setFillColor}
      initialColor={fillColor}
      position={fillColorPickerPosition}
      recentColors={recentColors}
      onRecentColorChange={setRecentColors}
    />

    {/* Stroke Color Picker Popup */}
    <ColorPalettePopup
      isOpen={showStrokeColorPicker}
      onClose={() => setShowStrokeColorPicker(false)}
      onColorChange={setStrokeColor}
      initialColor={strokeColor}
      position={strokeColorPickerPosition}
      recentColors={recentColors}
      onRecentColorChange={setRecentColors}
    />
    </>
  );
}
