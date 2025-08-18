import { useState } from 'react';
import Media from './Media';

export default function Background() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to darken a hex color
  const darkenColor = (hex: string, amount: number = 0.3) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  // Generate color styles and names for the rectangles with IDs
  const rectangleData = [
    { id: 'custom', color: '#F5F5F5', name: 'Custom', isCustomButton: true },
    { id: 'green-screen', color: '#A0BD86', name: 'Green screen' },
    { id: 'off-white', color: '#F1F1F1', name: 'Off-white' }, 
    { id: 'dark-gray', color: '#616F70', name: 'Dark gray' },
    { id: 'light-pink', color: '#EBE7EA', name: 'Light pink' },
    { id: 'dark-pink', color: '#B3A3AC', name: 'Dark pink' },
    { id: 'light-blue', color: '#E4E7EC', name: 'Light blue' },
    { id: 'dark-blue', color: '#A0ACC4', name: 'Dark blue' },
    { id: 'light-gold', color: '#F0E6DD', name: 'Light gold' },
    { id: 'dark-gold', color: '#DDBA92', name: 'Dark gold' }
  ];

  return (
    <div className="h-full bg-white relative w-full border-0 overflow-y-auto">
      <div className="relative z-10 flex flex-col items-start justify-start w-full px-2 py-4">
        
        {/* Selected color preview */}
        {selectedColor && (
          <div className="w-full bg-gray-100 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-md"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <span className="font-medium" style={{ color: '#616161' }}>Color</span>
            </div>
            <button 
              onClick={() => setSelectedColor(null)}
              className="p-2 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Media upload section */}
        <div 
          className="w-full border border-gray-300 rounded-lg p-6 mb-6 flex flex-row items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-black">Choose media</span>
        </div>

        {/* OR divider */}
        <div className="w-full flex justify-center mb-6">
          <div className="flex items-center">
            <div className="w-24 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 font-medium">OR</span>
            <div className="w-24 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* Color options in rows using flexbox */}
        <div className="w-full flex flex-col space-y-4">
          {/* Create rows of 2 items each */}
          {Array.from({ length: Math.ceil(rectangleData.length / 2) }, (_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex flex-row gap-4">
              {/* First item in row */}
              {rectangleData[rowIndex * 2] && (
                <div className="flex-1 flex flex-col items-center">
                  {rectangleData[rowIndex * 2].isCustomButton ? (
                    // Custom button
                    <>
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center cursor-not-allowed opacity-50 mb-2">
                        <span className="text-4xl text-gray-400 font-light">+</span>
                      </div>
                      <span className="text-sm text-center" style={{ color: '#616161' }}>
                        {rectangleData[rowIndex * 2].name}
                      </span>
                    </>
                  ) : (
                    // Color rectangle
                    <>
                      <div
                        className="w-full h-20 rounded-lg cursor-pointer hover:opacity-80 transition-all mb-2"
                        style={{ 
                          backgroundColor: rectangleData[rowIndex * 2].color,
                          border: selectedColor === rectangleData[rowIndex * 2].color ? `5px solid ${darkenColor(rectangleData[rowIndex * 2].color)}` : 'none'
                        }}
                        onClick={() => setSelectedColor(rectangleData[rowIndex * 2].color)}
                      ></div>
                      <span className="text-sm text-center" style={{ color: '#616161' }}>
                        {rectangleData[rowIndex * 2].name}
                      </span>
                    </>
                  )}
                </div>
              )}
              
              {/* Second item in row */}
              {rectangleData[rowIndex * 2 + 1] && (
                <div className="flex-1 flex flex-col items-center">
                  {rectangleData[rowIndex * 2 + 1].isCustomButton ? (
                    // Custom button
                    <>
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center cursor-not-allowed opacity-50 mb-2">
                        <span className="text-4xl text-gray-400 font-light">+</span>
                      </div>
                      <span className="text-sm text-center" style={{ color: '#616161' }}>
                        {rectangleData[rowIndex * 2 + 1].name}
                      </span>
                    </>
                  ) : (
                    // Color rectangle
                    <>
                      <div
                        className="w-full h-20 rounded-lg cursor-pointer hover:opacity-80 transition-all mb-2"
                        style={{ 
                          backgroundColor: rectangleData[rowIndex * 2 + 1].color,
                          border: selectedColor === rectangleData[rowIndex * 2 + 1].color ? `5px solid ${darkenColor(rectangleData[rowIndex * 2 + 1].color)}` : 'none'
                        }}
                        onClick={() => setSelectedColor(rectangleData[rowIndex * 2 + 1].color)}
                      ></div>
                      <span className="text-sm text-center" style={{ color: '#616161' }}>
                        {rectangleData[rowIndex * 2 + 1].name}
                      </span>
                    </>
                  )}
                </div>
              )}
              
              {/* Empty space if odd number of items in last row */}
              {!rectangleData[rowIndex * 2 + 1] && (
                <div className="flex-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Media component for modal selection */}
      <Media 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Choose Media"
        displayMode="modal"
      />
    </div>
  );
}
