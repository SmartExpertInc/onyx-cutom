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
  // Generate color styles and names for the rectangles
  const rectangleData = [
    { color: '#A0BD86', name: 'Green screen' },
    { color: '#F1F1F1', name: 'Off-white' }, 
    { color: '#616F70', name: 'Dark gray' },
    { color: '#EBE7EA', name: 'Light pink' },
    { color: '#B3A3AC', name: 'Dark pink' },
    { color: '#E4E7EC', name: 'Light blue' },
    { color: '#A0ACC4', name: 'Dark blue' },
    { color: '#F0E6DD', name: 'Light gold' },
    { color: '#DDBA92', name: 'Dark gold' }
  ];

  return (
    <div className="h-full bg-white relative w-full border-0 overflow-y-auto">
      <div className="relative z-10 flex flex-col items-start justify-start w-full p-4">
        
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
          className="w-full border border-gray-300 rounded-lg p-4 mb-6 flex flex-row items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer"
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

        {/* Two columns with color options */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* First column */}
          <div className="flex flex-col space-y-4">
            {/* Inactive + button with label */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center cursor-not-allowed opacity-50 mb-2">
                <span className="text-2xl text-gray-400 font-light">+</span>
              </div>
              <span className="text-sm text-center" style={{ color: '#616161' }}>Custom</span>
            </div>
            
            {/* Color rectangles for first column - first half of items */}
            {rectangleData.slice(0, Math.ceil(rectangleData.length / 2)).map((item, index) => (
              <div key={`col1-${index}`} className="flex flex-col items-center">
                <div
                  className="w-full h-12 rounded-lg cursor-pointer hover:opacity-80 transition-all mb-2"
                  style={{ 
                    backgroundColor: item.color,
                    border: selectedColor === item.color ? `5px solid ${darkenColor(item.color)}` : 'none'
                  }}
                  onClick={() => setSelectedColor(item.color)}
                ></div>
                <span className="text-sm text-center" style={{ color: '#616161' }}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Second column */}
          <div className="flex flex-col space-y-4">
            {/* Color rectangles for second column - second half of items */}
            {rectangleData.slice(Math.ceil(rectangleData.length / 2)).map((item, index) => (
              <div key={`col2-${index}`} className="flex flex-col items-center">
                <div
                  className="w-full h-12 rounded-lg cursor-pointer hover:opacity-80 transition-all mb-2"
                  style={{ 
                    backgroundColor: item.color,
                    border: selectedColor === item.color ? `5px solid ${darkenColor(item.color)}` : 'none'
                  }}
                  onClick={() => setSelectedColor(item.color)}
                ></div>
                <span className="text-sm text-center" style={{ color: '#616161' }}>{item.name}</span>
              </div>
            ))}
          </div>
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
