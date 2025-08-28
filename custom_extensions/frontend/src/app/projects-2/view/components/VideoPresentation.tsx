import React from 'react';
// NEW: Import Video Lesson types
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';

interface VideoPresentationProps {
  aspectRatio: string;
  onElementSelect: (elementType: string | null) => void;
  selectedElement: string | null;
  onRightClick: (position: { x: number; y: number }) => void;
  // NEW: Video Lesson specific props
  videoLessonData?: VideoLessonData;
  currentSlideId?: string;
  onSlideChange?: (slideId: string) => void;
}

export default function VideoPresentation({ 
  aspectRatio, 
  onElementSelect, 
  selectedElement, 
  onRightClick,
  videoLessonData,
  currentSlideId,
  onSlideChange
}: VideoPresentationProps) {
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
    console.log('Element clicked:', elementType);
    event.stopPropagation();
    onElementSelect(elementType);
  };

  const handleBackgroundClick = () => {
    console.log('Background clicked');
    onElementSelect(null);
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Right click on presentation area');
    onRightClick({ x: event.clientX, y: event.clientY });
  };

  const handleElementRightClick = (elementType: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Right click on element:', elementType);
    onRightClick({ x: event.clientX, y: event.clientY });
  };

  // Get current slide data
  const currentSlide = videoLessonData?.slides.find(s => s.slideId === currentSlideId);

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
        onContextMenu={handleRightClick}
      >
        {currentSlide ? (
          /* Video Lesson Slide Content */
          <div className="absolute inset-0 p-8">
            {/* Slide Title */}
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {currentSlide.slideTitle}
            </div>
            
            {/* Displayed Text */}
            {currentSlide.displayedText && (
              <div className="text-lg text-gray-700 mb-4 p-4 bg-blue-50 rounded-lg">
                {currentSlide.displayedText}
              </div>
            )}
            
            {/* Image Description */}
            {currentSlide.displayedPictureDescription && (
              <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <strong>Image:</strong> {currentSlide.displayedPictureDescription}
              </div>
            )}
            
            {/* Video Description */}
            {currentSlide.displayedVideoDescription && (
              <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <strong>Video:</strong> {currentSlide.displayedVideoDescription}
              </div>
            )}
            
            {/* Voiceover Text */}
            {currentSlide.voiceoverText && (
              <div className="text-sm text-gray-500 mt-auto p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <strong>Voiceover:</strong> {currentSlide.voiceoverText}
              </div>
            )}
          </div>
        ) : (
          /* Default placeholder content */
          <>
            {/* Text Element */}
            <div 
              className={`absolute top-8 left-8 p-4 bg-blue-100 border-2 rounded cursor-pointer transition-all z-20 hover:bg-blue-200 ${
                selectedElement === 'text' ? 'border-blue-500 shadow-lg bg-blue-200' : 'border-blue-300 hover:border-blue-400'
              }`}
              onClick={(e) => handleElementClick('text', e)}
              onContextMenu={(e) => handleElementRightClick('text', e)}
              style={{ minWidth: '100px', minHeight: '50px' }}
            >
              <div className="text-sm font-medium text-blue-800">Sample Text</div>
            </div>

            {/* Image Element */}
            <div 
              className={`absolute top-8 right-8 w-20 h-20 bg-gray-300 border-2 rounded cursor-pointer transition-all flex items-center justify-center z-20 hover:bg-gray-400 ${
                selectedElement === 'image' ? 'border-green-500 shadow-lg bg-gray-400' : 'border-green-300 hover:border-green-400'
              }`}
              onClick={(e) => handleElementClick('image', e)}
              onContextMenu={(e) => handleElementRightClick('image', e)}
            >
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Avatar Element */}
            <div 
              className={`absolute bottom-8 left-8 w-16 h-16 bg-purple-300 border-2 rounded-full cursor-pointer transition-all flex items-center justify-center z-20 hover:bg-purple-400 ${
                selectedElement === 'avatar' ? 'border-purple-500 shadow-lg bg-purple-400' : 'border-purple-300 hover:border-purple-400'
              }`}
              onClick={(e) => handleElementClick('avatar', e)}
              onContextMenu={(e) => handleElementRightClick('avatar', e)}
            >
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Shape Element */}
            <div 
              className={`absolute bottom-8 right-8 w-16 h-16 bg-orange-300 border-2 rounded cursor-pointer transition-all flex items-center justify-center z-20 hover:bg-orange-400 ${
                selectedElement === 'shape' ? 'border-orange-500 shadow-lg bg-orange-400' : 'border-orange-300 hover:border-orange-400'
              }`}
              onClick={(e) => handleElementClick('shape', e)}
              onContextMenu={(e) => handleElementRightClick('shape', e)}
            >
              <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        )}

        {/* Center placeholder text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-gray-400 text-sm font-medium">
            {videoLessonData ? `${aspectRatio} Video Lesson` : `${aspectRatio} Presentation`}
          </div>
        </div>
      </div>
    </div>
  );
}
