import React, { useState, useEffect } from 'react';

interface AvatarPreviewProps {
  size?: 'small' | 'medium' | 'large';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  className?: string;
  avatarCode?: string; // e.g., 'gia.casual', 'dylan.casual', etc.
  showSelector?: boolean; // Whether to show avatar selection dropdown
  onAvatarChange?: (avatarCode: string) => void;
}

interface Avatar {
  code: string;
  name: string;
  gender: string;
  preview_url: string;
  description: string;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  size = 'medium',
  position = 'bottom-right',
  className = '',
  avatarCode = 'gia.casual', // Default to Gia avatar
  showSelector = false,
  onAvatarChange
}) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatarCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  // Fetch available avatars from API
  useEffect(() => {
    const fetchAvatars = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/custom/video-lesson/avatars');
        if (response.ok) {
          const data = await response.json();
          setAvatars(data.avatars || []);
        } else {
          setError('Failed to fetch avatars');
        }
      } catch (err) {
        setError('Network error fetching avatars');
        console.error('Error fetching avatars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  // Generate Elai avatar preview URL based on avatar code
  const getAvatarPreviewUrl = (code: string): string => {
    const [name, variant] = code.split('.');
    return `https://elai-avatars.s3.us-east-2.amazonaws.com/common/${name}/${variant}/${name}_${variant}.png`;
  };

  const avatarUrl = getAvatarPreviewUrl(selectedAvatar);
  const currentAvatar = avatars.find(avatar => avatar.code === selectedAvatar);

  const handleAvatarChange = (newAvatarCode: string) => {
    setSelectedAvatar(newAvatarCode);
    if (onAvatarChange) {
      onAvatarChange(newAvatarCode);
    }
  };

  return (
    <div className={`absolute ${positionClasses[position]} ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden shadow-lg border-2 border-white`}>
        <img 
          src={avatarUrl}
          alt={`AI Avatar ${selectedAvatar}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a default avatar if the image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDEyIDE2IDEwLjIxIDE2IDhDMTYgNS43OSAxNC4yMSA0IDEyIDRDOS43OSA0IDggNS43OSA4IDhDOCAxMC4yMSA5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAxOFYyMEgyMFYxOEMyMCAxNS4zNCAxOC42NyAxNCAxNiAxNFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
          }}
        />
        {/* Green checkmark indicator */}
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>

      {/* Avatar selector dropdown */}
      {showSelector && avatars.length > 0 && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
          <div className="p-2">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Select Avatar</h4>
            {avatars.map((avatar) => (
              <button
                key={avatar.code}
                onClick={() => handleAvatarChange(avatar.code)}
                className={`w-full flex items-center space-x-3 p-2 rounded-md text-left hover:bg-gray-50 transition-colors ${
                  selectedAvatar === avatar.code ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <img
                  src={avatar.preview_url}
                  alt={avatar.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDEyIDE2IDEwLjIxIDE2IDhDMTYgNS43OSAxNC4yMSA0IDEyIDRDOS43OSA0IDggNS43OSA4IDhDOCAxMC4yMSA5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAxOFYyMEgyMFYxOEMyMCAxNS4zNCAxOC42NyAxNCAxNiAxNFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{avatar.name}</p>
                  <p className="text-xs text-gray-500 truncate">{avatar.description}</p>
                </div>
                {selectedAvatar === avatar.code && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center rounded-full">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2zm0-8h2v6h-2z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default AvatarPreview;
