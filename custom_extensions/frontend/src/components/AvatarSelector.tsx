import React, { useState, useEffect } from 'react';
import { ChevronDown, User, Loader } from 'lucide-react';

export interface Avatar {
  id: string;
  code: string;
  name: string;
  gender: string;
  thumbnail?: string;
  canvas?: string;
  variants?: AvatarVariant[];
}

export interface AvatarVariant {
  code: string;
  id: string;
  name: string;
  thumbnail?: string;
  canvas?: string;
}

interface AvatarSelectorProps {
  onAvatarSelect: (avatar: Avatar, variant?: AvatarVariant) => void;
  selectedAvatar?: Avatar;
  selectedVariant?: AvatarVariant;
  className?: string;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  onAvatarSelect,
  selectedAvatar,
  selectedVariant,
  className = ''
}) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/video/avatars`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAvatars(data.avatars || []);
        console.log('🎬 [AVATAR_SELECTOR] Fetched avatars:', data.avatars?.length || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch avatars');
      }
    } catch (err) {
      console.error('🎬 [AVATAR_SELECTOR] Error fetching avatars:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch avatars');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatar: Avatar, variant?: AvatarVariant) => {
    onAvatarSelect(avatar, variant);
    setIsOpen(false);
  };

  const getDisplayName = (avatar: Avatar, variant?: AvatarVariant) => {
    if (variant) {
      return `${avatar.name} - ${variant.name}`;
    }
    return avatar.name;
  };

  const getDisplayImage = (avatar: Avatar, variant?: AvatarVariant) => {
    if (variant?.thumbnail) {
      return variant.thumbnail;
    }
    if (variant?.canvas) {
      return variant.canvas;
    }
    if (avatar.thumbnail) {
      return avatar.thumbnail;
    }
    if (avatar.canvas) {
      return avatar.canvas;
    }
    return null;
  };

  const getSelectedDisplay = () => {
    if (!selectedAvatar) {
      return 'Select an Avatar';
    }

    const displayName = getDisplayName(selectedAvatar, selectedVariant);
    const displayImage = getDisplayImage(selectedAvatar, selectedVariant);

    return (
      <div className="flex items-center space-x-2">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <User size={16} className="text-gray-500" />
        )}
        <span className="truncate">{displayName}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <Loader size={16} className="animate-spin mr-2" />
          <span className="text-sm text-gray-500">Loading avatars...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center px-3 py-2 border border-red-300 rounded-md bg-red-50">
          <span className="text-sm text-red-600">Error: {error}</span>
          <button
            onClick={fetchAvatars}
            className="ml-2 text-xs text-red-700 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {getSelectedDisplay()}
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {avatars.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No avatars available
            </div>
          ) : (
            <div className="py-1">
              {avatars.map((avatar) => (
                <div key={avatar.id}>
                  {/* Main avatar option */}
                  <button
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 ${
                      selectedAvatar?.id === avatar.id && !selectedVariant ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {getDisplayImage(avatar) ? (
                      <img 
                        src={getDisplayImage(avatar)} 
                        alt={avatar.name}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={16} className="text-gray-500" />
                    )}
                    <span className="text-sm">{avatar.name}</span>
                    {avatar.gender && (
                      <span className="text-xs text-gray-400">({avatar.gender})</span>
                    )}
                  </button>

                  {/* Avatar variants */}
                  {avatar.variants && avatar.variants.length > 0 && (
                    <div className="ml-4">
                      {avatar.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleAvatarSelect(avatar, variant)}
                          className={`w-full flex items-center space-x-2 px-3 py-1 text-left hover:bg-gray-100 text-xs ${
                            selectedAvatar?.id === avatar.id && selectedVariant?.id === variant.id ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          {getDisplayImage(avatar, variant) ? (
                            <img 
                              src={getDisplayImage(avatar, variant)} 
                              alt={getDisplayName(avatar, variant)}
                              className="w-4 h-4 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <User size={12} className="text-gray-400" />
                          )}
                          <span>• {variant.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;
