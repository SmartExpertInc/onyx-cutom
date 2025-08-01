"use client";

import React, { useState } from 'react';
import { Image, Upload, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';

interface ClickableImagePlaceholderProps {
  imagePath?: string;
  onImageUploaded: (imagePath: string) => void;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  size = 'MEDIUM',
  position = 'CENTER',
  description = 'Click to upload image',
  prompt = 'relevant illustration',
  isEditable = true,
  className = '',
  style = {}
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const sizeClasses = {
    'LARGE': 'h-48 md:h-64',
    'MEDIUM': 'h-32 md:h-40', 
    'SMALL': 'h-24 md:h-32'
  };

  const positionClasses = {
    'LEFT': 'float-left mr-6 mb-4',
    'RIGHT': 'float-right ml-6 mb-4',
    'CENTER': 'mx-auto mb-6',
    'BACKGROUND': 'absolute inset-0 z-0'
  };

  const handleClick = () => {
    if (isEditable) {
      setShowUploadModal(true);
    }
  };

  const handleImageUploaded = (newImagePath: string) => {
    onImageUploaded(newImagePath);
  };

  // If we have an image, display it with replace overlay
  if (imagePath) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${positionClasses[position]} 
          rounded-lg overflow-hidden relative
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${className}
        `}
        style={style}
      >
        <img 
          src={imagePath} 
          alt={description}
          className="w-full h-full object-cover"
          style={{ cursor: isEditable ? 'pointer' : 'default' }}
        />
        {isEditable && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer z-10"
            onClick={handleClick}
            title="Click to replace image"
            style={{
              pointerEvents: 'auto',
              zIndex: 10
            }}
          >
            <div className="text-center text-white">
              <Replace className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">Replace</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise show placeholder
  return (
    <>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${positionClasses[position]} 
          bg-gradient-to-br from-blue-100 to-purple-100 
          border-2 border-dashed border-gray-300 
          rounded-lg flex items-center justify-center 
          text-gray-500 text-sm
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${isEditable ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200' : ''}
          ${className}
        `}
        style={style}
        onClick={handleClick}
      >
        <div className="text-center p-4">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-medium">{size} Image</div>
          <div className="text-xs mt-1 opacity-75">{description}</div>
          {prompt && (
            <div className="text-xs mt-1 opacity-60 italic">
              "{prompt}"
            </div>
          )}
          {isEditable && (
            <div className="text-xs mt-2 text-blue-600 font-medium">
              Click to upload
            </div>
          )}
        </div>
      </div>

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={handleImageUploaded}
        title="Upload Presentation Image"
      />
    </>
  );
};

export default ClickableImagePlaceholder; 