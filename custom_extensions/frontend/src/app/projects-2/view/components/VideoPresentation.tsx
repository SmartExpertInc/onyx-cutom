import React from 'react';

interface VideoPresentationProps {
  aspectRatio: string;
  onElementSelect: (elementType: string | null) => void;
  selectedElement: string | null;
}

export default function VideoPresentation({ aspectRatio, onElementSelect, selectedElement }: VideoPresentationProps) {
  // Function to get video container styles based on aspect ratio
  const getVideoContainerStyles = () => {
    switch (aspectRatio) {
      case '16:9':
        return {
          width: '80%',
          height: '80%',
          maxWidth: 'calc((100vh - 145px) * 0.8 * 0.8 * 16 / 9)',
          maxHeight: 'calc((100vh - 145px) * 0.8 * 0.8)',
        };
      case '9:16':
        return {
          width: '80%',
          height: '80%',
          maxWidth: 'calc((100vh - 145px) * 0.8 * 0.8 * 9 / 16)',
          maxHeight: 'calc((100vh - 145px) * 0.8 * 0.8)',
        };
      case '1:1':
        return {
          width: '80%',
          height: '80%',
          maxWidth: 'calc((100vh - 145px) * 0.8 * 0.8)',
          maxHeight: 'calc((100vh - 145px) * 0.8 * 0.8)',
        };
      default:
        return {
          width: '80%',
          height: '80%',
          maxWidth: 'calc((100vh - 145px) * 0.8 * 0.8 * 16 / 9)',
          maxHeight: 'calc((100vh - 145px) * 0.8 * 0.8)',
        };
    }
  };

  const handleElementClick = (elementType: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onElementSelect(elementType);
  };

  const handleBackgroundClick = () => {
    onElementSelect(null);
  };

  return (
    <div 
      className="bg-gray-200 rounded-md overflow-auto flex items-center justify-center" 
      style={{ height: '75%' }}
      onClick={handleBackgroundClick}
    >
      {/* Video Container - White rectangle representing the video aspect ratio */}
      <div 
        className="bg-white rounded-md shadow-lg relative"
        style={getVideoContainerStyles()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Text Element */}
        <div 
          className={`absolute top-4 left-4 p-3 bg-blue-100 border-2 rounded cursor-pointer transition-all ${
            selectedElement === 'text' ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-blue-300'
          }`}
          onClick={(e) => handleElementClick('text', e)}
        >
          <div className="text-sm font-medium text-blue-800">Sample Text</div>
        </div>

        {/* Image Element */}
        <div 
          className={`absolute top-4 right-4 w-16 h-16 bg-gray-300 border-2 rounded cursor-pointer transition-all flex items-center justify-center ${
            selectedElement === 'image' ? 'border-green-500 shadow-lg' : 'border-transparent hover:border-green-300'
          }`}
          onClick={(e) => handleElementClick('image', e)}
        >
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Avatar Element */}
        <div 
          className={`absolute bottom-4 left-4 w-12 h-12 bg-purple-300 border-2 rounded-full cursor-pointer transition-all flex items-center justify-center ${
            selectedElement === 'avatar' ? 'border-purple-500 shadow-lg' : 'border-transparent hover:border-purple-300'
          }`}
          onClick={(e) => handleElementClick('avatar', e)}
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Center placeholder text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-sm font-medium">
            {aspectRatio} Presentation
          </div>
        </div>
      </div>
    </div>
  );
}
