import React from 'react';

interface VideoPreviewProps {
  aspectRatio: string;
}

export default function VideoPreview({ aspectRatio }: VideoPreviewProps) {
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

  return (
    <div className="bg-gray-200 rounded-md overflow-auto flex items-center justify-center" style={{ height: '75%' }}>
      {/* Video Container - White rectangle representing the video aspect ratio */}
      <div 
        className="bg-white rounded-md shadow-lg flex items-center justify-center"
        style={getVideoContainerStyles()}
      >
        <div className="text-gray-400 text-sm font-medium">
          {aspectRatio} Video Preview
        </div>
      </div>
    </div>
  );
}
