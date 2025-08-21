// custom_extensions/frontend/src/components/AvatarImageDisplay.tsx

import React from 'react';
import { User, Loader } from 'lucide-react';
import { useAvatarDisplay } from './AvatarDisplayManager';

interface AvatarImageDisplayProps {
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  className?: string;
  style?: React.CSSProperties;
}

const AvatarImageDisplay: React.FC<AvatarImageDisplayProps> = ({
  size = 'MEDIUM',
  position = 'CENTER',
  className = '',
  style = {}
}) => {
  const { defaultAvatar, isLoading, error } = useAvatarDisplay();

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

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${positionClasses[position]} 
          bg-gradient-to-br from-blue-100 to-purple-100 
          border-2 border-dashed border-gray-300 
          rounded-lg flex items-center justify-center 
          text-gray-500 text-sm
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${className}
        `}
        style={style}
      >
        <div className="text-center p-4">
          <Loader className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
          <div className="font-medium">Loading Avatar...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !defaultAvatar) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${positionClasses[position]} 
          bg-gradient-to-br from-red-100 to-pink-100 
          border-2 border-dashed border-red-300 
          rounded-lg flex items-center justify-center 
          text-red-500 text-sm
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${className}
        `}
        style={style}
      >
        <div className="text-center p-4">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-medium">Avatar Unavailable</div>
          <div className="text-xs mt-1 opacity-75">
            {error || 'No avatar selected'}
          </div>
        </div>
      </div>
    );
  }

  // Success state - display avatar image
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
        src={defaultAvatar.selectedVariant.thumbnail} 
        alt={`${defaultAvatar.avatar.name} - ${defaultAvatar.selectedVariant.name}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('🎭 [AVATAR_DISPLAY] Failed to load avatar image:', defaultAvatar.selectedVariant.thumbnail);
          // Fallback to a placeholder if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback placeholder (hidden by default) */}
      <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-gray-500">
        <div className="text-center p-4">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-medium">{defaultAvatar.avatar.name}</div>
          <div className="text-xs mt-1 opacity-75">{defaultAvatar.selectedVariant.name}</div>
        </div>
      </div>

      {/* Avatar info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
        <div className="font-medium">{defaultAvatar.avatar.name}</div>
        <div className="opacity-75">{defaultAvatar.selectedVariant.name}</div>
      </div>
    </div>
  );
};

export default AvatarImageDisplay;
