// custom_extensions/frontend/src/components/AvatarPlaceholder.tsx

import React, { useState } from 'react';
import { User, Plus, Edit3, X } from 'lucide-react';
import { SelectedAvatar } from '@/types/elaiTypes';
import { AvatarSelectionModal } from './AvatarSelectionModal';

interface AvatarPlaceholderProps {
  slideIndex: number;
  onAvatarSelect: (slideIndex: number, avatar: SelectedAvatar | null) => void;
  selectedAvatar: SelectedAvatar | null;
  className?: string;
}

export const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({
  slideIndex,
  onAvatarSelect,
  selectedAvatar,
  className = ''
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarSelect = (avatar: SelectedAvatar) => {
    onAvatarSelect(slideIndex, avatar);
    setShowAvatarModal(false);
  };

  const handleRemoveAvatar = () => {
    onAvatarSelect(slideIndex, null);
  };

  const handleOpenAvatarModal = () => {
    setShowAvatarModal(true);
  };

  return (
    <>
      <div className={`avatar-placeholder-enhanced ${className}`}>
        {selectedAvatar ? (
          <div className="avatar-preview bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Selected Avatar</h4>
              <button
                onClick={handleRemoveAvatar}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove avatar"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={selectedAvatar.selectedVariant.thumbnail}
                  alt={selectedAvatar.avatar.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                {selectedAvatar.avatar.limit === 300 && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full">
                    5m
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-gray-900 truncate">
                  {selectedAvatar.avatar.name}
                </h5>
                <p className="text-xs text-gray-500 truncate">
                  {selectedAvatar.selectedVariant.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 capitalize">
                    {selectedAvatar.avatar.gender}
                  </span>
                  {selectedAvatar.avatar.age && (
                    <span className="text-xs text-gray-400">
                      {selectedAvatar.avatar.age} years
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleOpenAvatarModal}
              className="mt-3 w-full px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
            >
              <Edit3 size={12} />
              Change Avatar
            </button>
          </div>
        ) : (
          <div className="avatar-selector bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={24} className="text-gray-400" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Select Avatar
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Choose an AI avatar for this slide
                </p>
              </div>
              
              <button
                onClick={handleOpenAvatarModal}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Choose Avatar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
      />
    </>
  );
};

// Enhanced version with more features
export const AvatarPlaceholderEnhanced: React.FC<AvatarPlaceholderProps & {
  showPreview?: boolean;
  onPreviewClick?: () => void;
}> = ({
  slideIndex,
  onAvatarSelect,
  selectedAvatar,
  className = '',
  showPreview = false,
  onPreviewClick
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarSelect = (avatar: SelectedAvatar) => {
    onAvatarSelect(slideIndex, avatar);
    setShowAvatarModal(false);
  };

  const handleRemoveAvatar = () => {
    onAvatarSelect(slideIndex, null);
  };

  const handleOpenAvatarModal = () => {
    setShowAvatarModal(true);
  };

  return (
    <>
      <div className={`avatar-placeholder-enhanced ${className}`}>
        {selectedAvatar ? (
          <div className="avatar-preview bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Slide {slideIndex + 1} Avatar</h4>
              <div className="flex items-center gap-2">
                {showPreview && (
                  <button
                    onClick={onPreviewClick}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Preview avatar"
                  >
                    <User size={16} />
                  </button>
                )}
                <button
                  onClick={handleRemoveAvatar}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove avatar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={selectedAvatar.selectedVariant.thumbnail}
                  alt={selectedAvatar.avatar.name}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                {selectedAvatar.avatar.limit === 300 && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    5m
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-semibold text-gray-900 truncate">
                  {selectedAvatar.avatar.name}
                </h5>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {selectedAvatar.selectedVariant.name}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                    {selectedAvatar.avatar.gender}
                  </span>
                  {selectedAvatar.avatar.age && (
                    <span className="text-xs text-gray-500">
                      {selectedAvatar.avatar.age} years
                    </span>
                  )}
                </div>
                {selectedAvatar.avatar.defaultVoice && (
                  <div className="text-xs text-gray-400 mt-1">
                    Voice: {selectedAvatar.avatar.defaultVoice.includes('elevenlabs') ? 'ElevenLabs' : 'Azure'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleOpenAvatarModal}
                className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
              >
                <Edit3 size={12} />
                Change
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="avatar-selector bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-300 hover:from-blue-50 hover:to-blue-100 transition-all cursor-pointer group"
            onClick={handleOpenAvatarModal}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <User size={32} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Add AI Avatar
                </h4>
                <p className="text-sm text-gray-600 mb-4 max-w-xs">
                  Select an AI avatar to present this slide with voiceover
                </p>
              </div>
              
              <button className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <Plus size={18} />
                Choose Avatar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
      />
    </>
  );
};
