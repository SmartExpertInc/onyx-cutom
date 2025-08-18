import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal content */}
        {children}
      </div>
    </div>
  );
}

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
    <div className="h-full bg-white relative overflow-hidden w-full">
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
          className="w-full border border-gray-300 rounded-lg p-8 mb-6 flex flex-row items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <svg className="w-8 h-8 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium" style={{ color: '#494949' }}>Choose media</span>
        </div>

        {/* OR divider */}
        <div className="w-full flex justify-center mb-6">
          <div className="flex items-center">
            <div className="w-16 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 font-medium">OR</span>
            <div className="w-16 h-px bg-gray-300"></div>
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
            
            {/* Color rectangles for first column */}
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
            {/* Color rectangles for second column */}
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
      
      {/* Modal for media selection */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Choose Media"
      >
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-4">Upload your media files here</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Select Files
          </button>
        </div>
      </Modal>
    </div>
  );
}
