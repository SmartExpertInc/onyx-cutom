// custom_extensions/frontend/src/components/AvatarSelectionModal.tsx

import React, { useState, useEffect } from 'react';
import { ElaiAvatar, ElaiAvatarVariant, SelectedAvatar } from '@/types/elaiTypes';
import { AvatarService } from '@/services/AvatarService';
import { X, Search, Filter, Clock, User, Users } from 'lucide-react';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedAvatar: SelectedAvatar) => void;
}

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [avatars, setAvatars] = useState<ElaiAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('business');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExtendedDurationOnly, setShowExtendedDurationOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvatars();
    }
  }, [isOpen]);

  const loadAvatars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AvatarService.fetchAvatars();
      
      if (response.success && response.data) {
        setAvatars(response.data);
      } else {
        setError(response.error || 'Failed to load avatars');
      }
    } catch (err) {
      setError('Error loading avatars');
      console.error('Error loading avatars:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableVariants = () => {
    return AvatarService.getAvailableVariantCodes(avatars);
  };

  const getFilteredAvatars = () => {
    let filtered = avatars;

    // Filter by variant
    filtered = AvatarService.filterAvatarsByVariant(filtered, selectedVariant);

    // Filter by extended duration if enabled
    if (showExtendedDurationOnly) {
      filtered = AvatarService.getExtendedDurationAvatars(filtered);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(avatar =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        avatar.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (avatar.ethnicity && avatar.ethnicity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const handleAvatarSelect = (avatar: ElaiAvatar) => {
    const variant = avatar.variants.find(v => v.code === selectedVariant);
    if (variant) {
      onSelect({
        avatar,
        selectedVariant: variant
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedVariant('business');
    setShowExtendedDurationOnly(false);
    onClose();
  };

  if (!isOpen) return null;

  const availableVariants = getAvailableVariants();
  const filteredAvatars = getFilteredAvatars();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Avatar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose an avatar for your video presentation
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search avatars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Variant Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableVariants.map(variant => (
                  <option key={variant} value={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Extended Duration Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExtendedDurationOnly}
                onChange={(e) => setShowExtendedDurationOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">5 min limit only</span>
              </div>
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading avatars...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={loadAvatars}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No avatars found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvatars.map(avatar => {
                const variant = avatar.variants.find(v => v.code === selectedVariant);
                if (!variant) return null;

                return (
                  <div
                    key={`${avatar.id}-${variant.code}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    {/* Avatar Image */}
                    <div className="relative mb-4">
                      <img
                        src={variant.thumbnail}
                        alt={avatar.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {avatar.limit === 300 && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock size={12} />
                          5 min
                        </div>
                      )}
                    </div>

                    {/* Avatar Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {avatar.name}
                      </h3>
                      <p className="text-sm text-gray-600">{variant.name}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          {avatar.gender}
                        </div>
                        {avatar.age && (
                          <span>{avatar.age} years</span>
                        )}
                        {avatar.ethnicity && (
                          <span>{avatar.ethnicity}</span>
                        )}
                      </div>

                      {/* Voice Info */}
                      {avatar.defaultVoice && (
                        <div className="text-xs text-gray-500">
                          Voice: {avatar.defaultVoice.includes('elevenlabs') ? 'ElevenLabs' : 'Azure'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredAvatars.length} avatar{filteredAvatars.length !== 1 ? 's' : ''} found
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
