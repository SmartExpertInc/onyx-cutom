"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';

// Avatar data interfaces
interface AvatarVariant {
  code: string;
  name: string;
  thumbnail: string;
  canvas: string;
}

interface AvatarData {
  id: string;
  code: string;
  name: string;
  gender: "male" | "female";
  age?: number;
  ethnicity?: string;
  thumbnail?: string;
  canvas?: string;
  variants: AvatarVariant[];
}

interface ProcessedAvatar {
  id: string;
  code: string;
  name: string;
  gender: "male" | "female";
  age?: number;
  ethnicity?: string;
  thumbnail: string;
  canvas: string;
  selectedVariant?: AvatarVariant;
  displayName: string;
  lookCategory: string;
}

interface AvatarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelect: (avatar: ProcessedAvatar, variant?: AvatarVariant) => void;
  avatarData: AvatarData[];
  title?: string;
  displayMode?: 'modal' | 'popup';
  className?: string;
  position?: { x: number; y: number };
}

export default function AvatarPopup({ 
  isOpen, 
  onClose, 
  onAvatarSelect,
  avatarData,
  title = "Choose Avatar", 
  displayMode = 'popup',
  className = '',
  position
}: AvatarPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [activeButton, setActiveButton] = useState<string>('button1');
  const [selectedFilters, setSelectedFilters] = useState({
    gender: 'View All',
    age: null as string | null,
    ethnicity: null as string | null,
    look: null as string | null
  });
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedAvatar, setSelectedAvatar] = useState<ProcessedAvatar | null>(null);

  // 🔍 **DEBUG LOGGING: Component Props Received**
  console.log('🎬 [AVATAR_POPUP] AvatarPopup component rendered with props:', {
    isOpen,
    title,
    displayMode,
    className,
    position,
    avatarDataCount: avatarData?.length || 0,
    avatarData: avatarData
  });

  // 🔍 **DEBUG LOGGING: Avatar Data Analysis**
  useEffect(() => {
    if (avatarData && avatarData.length > 0) {
      console.log('🎬 [AVATAR_POPUP] Avatar data received and analyzed:');
      console.log('🎬 [AVATAR_POPUP] Total avatars:', avatarData.length);
      
      avatarData.forEach((avatar, index) => {
        console.log(`🎬 [AVATAR_POPUP] Avatar ${index + 1}:`, {
          id: avatar.id,
          code: avatar.code,
          name: avatar.name,
          gender: avatar.gender,
          age: avatar.age,
          ethnicity: avatar.ethnicity,
          variantsCount: avatar.variants?.length || 0,
          variants: avatar.variants
        });
      });
    } else {
      console.warn('🎬 [AVATAR_POPUP] No avatar data received or empty array');
      console.log('🎬 [AVATAR_POPUP] avatarData value:', avatarData);
    }
  }, [avatarData]);

  // Handle click outside for popup mode
  useEffect(() => {
    if (!isOpen || displayMode !== 'popup') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, displayMode, onClose]);

  // Process avatar data to flatten variants
  const processedAvatars = useMemo(() => {
    console.log('🎬 [AVATAR_POPUP] Processing avatar data to flatten variants...');
    console.log('🎬 [AVATAR_POPUP] Input avatarData:', avatarData);
    
    const processed = avatarData.flatMap((avatar, avatarIndex) => {
      console.log(`🎬 [AVATAR_POPUP] Processing avatar ${avatarIndex + 1}:`, avatar);
      
      if (avatar.variants && avatar.variants.length > 0) {
        console.log(`🎬 [AVATAR_POPUP] Avatar ${avatarIndex + 1} has ${avatar.variants.length} variants`);
        
        // Create separate entry for each variant
        const variantEntries = avatar.variants.map((variant, variantIndex) => {
          const processedAvatar = {
            id: avatar.id,
            code: avatar.code,
            name: avatar.name,
            gender: avatar.gender,
            age: avatar.age,
            ethnicity: avatar.ethnicity,
            thumbnail: variant.thumbnail,
            canvas: variant.canvas,
            selectedVariant: variant,
            displayName: `${avatar.name}`,
            lookCategory: variant.name
          };
          
          console.log(`🎬 [AVATAR_POPUP] Created variant entry ${variantIndex + 1} for avatar ${avatarIndex + 1}:`, processedAvatar);
          return processedAvatar;
        });
        
        console.log(`🎬 [AVATAR_POPUP] Avatar ${avatarIndex + 1} generated ${variantEntries.length} variant entries`);
        return variantEntries;
      } else {
        console.log(`🎬 [AVATAR_POPUP] Avatar ${avatarIndex + 1} has no variants, creating default entry`);
        
        // Avatar without variants
        const defaultEntry = {
          id: avatar.id,
          code: avatar.code,
          name: avatar.name,
          gender: avatar.gender,
          age: avatar.age,
          ethnicity: avatar.ethnicity,
          thumbnail: avatar.thumbnail || avatar.canvas || '',
          canvas: avatar.canvas || '',
          displayName: avatar.name,
          lookCategory: 'Default'
        };
        
        console.log(`🎬 [AVATAR_POPUP] Created default entry for avatar ${avatarIndex + 1}:`, defaultEntry);
        return [defaultEntry];
      }
    });
    
    console.log('🎬 [AVATAR_POPUP] Avatar processing complete');
    console.log('🎬 [AVATAR_POPUP] Total processed avatars:', processed.length);
    console.log('🎬 [AVATAR_POPUP] Final processed avatars:', processed);
    
    return processed;
  }, [avatarData]);

  // Apply filters to avatars
  const filteredAvatars = useMemo(() => {
    console.log('🎬 [AVATAR_POPUP] Applying filters to avatars...');
    console.log('🎬 [AVATAR_POPUP] Current filters:', selectedFilters);
    console.log('🎬 [AVATAR_POPUP] Input processed avatars count:', processedAvatars.length);
    
    const filtered = processedAvatars.filter((avatar, index) => {
      console.log(`🎬 [AVATAR_POPUP] Filtering avatar ${index + 1}:`, {
        name: avatar.name,
        gender: avatar.gender,
        age: avatar.age,
        ethnicity: avatar.ethnicity,
        lookCategory: avatar.lookCategory
      });
      
      // Gender filter
      if (selectedFilters.gender !== 'View All' && avatar.gender !== selectedFilters.gender?.toLowerCase()) {
        console.log(`🎬 [AVATAR_POPUP] Avatar ${index + 1} filtered out by gender:`, {
          avatarGender: avatar.gender,
          filterGender: selectedFilters.gender,
          match: avatar.gender === selectedFilters.gender?.toLowerCase()
        });
        return false;
      }
      
      // Age filter
      if (selectedFilters.age && avatar.age) {
        const ageMatch = (
          (selectedFilters.age === 'Young' && avatar.age < 30) ||
          (selectedFilters.age === 'Middle-aged' && avatar.age >= 30 && avatar.age <= 50) ||
          (selectedFilters.age === 'Senior' && avatar.age > 50)
        );
        if (!ageMatch) {
          console.log(`🎬 [AVATAR_POPUP] Avatar ${index + 1} filtered out by age:`, {
            avatarAge: avatar.age,
            filterAge: selectedFilters.age,
            ageMatch
          });
          return false;
        }
      }
      
      // Ethnicity filter
      if (selectedFilters.ethnicity && avatar.ethnicity && 
          !avatar.ethnicity.toLowerCase().includes(selectedFilters.ethnicity.toLowerCase())) {
        console.log(`🎬 [AVATAR_POPUP] Avatar ${index + 1} filtered out by ethnicity:`, {
          avatarEthnicity: avatar.ethnicity,
          filterEthnicity: selectedFilters.ethnicity,
          match: avatar.ethnicity.toLowerCase().includes(selectedFilters.ethnicity.toLowerCase())
        });
        return false;
      }
      
      // Look filter (variant name)
      if (selectedFilters.look && avatar.lookCategory !== selectedFilters.look) {
        console.log(`🎬 [AVATAR_POPUP] Avatar ${index + 1} filtered out by look:`, {
          avatarLookCategory: avatar.lookCategory,
          filterLook: selectedFilters.look,
          match: avatar.lookCategory === selectedFilters.look
        });
        return false;
      }
      
      console.log(`🎬 [AVATAR_POPUP] Avatar ${index + 1} passed all filters`);
      return true;
    });
    
    console.log('🎬 [AVATAR_POPUP] Filtering complete');
    console.log('🎬 [AVATAR_POPUP] Filtered avatars count:', filtered.length);
    console.log('🎬 [AVATAR_POPUP] Final filtered avatars:', filtered);
    
    return filtered;
  }, [processedAvatars, selectedFilters]);

  if (!isOpen) return null;

  const handleFilterChange = (filterType: string, value: string | null) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAvatarClick = (avatar: ProcessedAvatar) => {
    console.log('🎬 [AVATAR_POPUP] Avatar clicked for preview:', {
      id: avatar.id,
      name: avatar.name,
      displayName: avatar.displayName,
      gender: avatar.gender,
      age: avatar.age,
      ethnicity: avatar.ethnicity,
      thumbnail: avatar.thumbnail,
      selectedVariant: avatar.selectedVariant
    });
    
    setSelectedAvatar(avatar);
    setPreviewMode(true);
    
    console.log('🎬 [AVATAR_POPUP] Preview mode activated for avatar:', avatar.displayName);
  };

  const handleBackClick = () => {
    console.log('🎬 [AVATAR_POPUP] Back button clicked, returning to avatar grid');
    setPreviewMode(false);
    setSelectedAvatar(null);
    console.log('🎬 [AVATAR_POPUP] Preview mode deactivated, avatar grid restored');
  };

  const handleAddToScene = () => {
    console.log('🎬 [AVATAR_POPUP] Add to Scene button clicked!');
    console.log('🎬 [AVATAR_POPUP] Selected avatar:', selectedAvatar);
    console.log('🎬 [AVATAR_POPUP] onAvatarSelect callback exists:', !!onAvatarSelect);
    
    if (selectedAvatar && onAvatarSelect) {
      console.log('🎬 [AVATAR_POPUP] Calling onAvatarSelect with:', {
        avatar: selectedAvatar,
        variant: selectedAvatar.selectedVariant
      });
      
      // Call the callback to update the avatar on the slide
      onAvatarSelect(selectedAvatar, selectedAvatar.selectedVariant);
      
      console.log('🎬 [AVATAR_POPUP] Avatar selection callback completed, closing popup');
      onClose();
    } else {
      console.error('🎬 [AVATAR_POPUP] Cannot add to scene:', {
        hasSelectedAvatar: !!selectedAvatar,
        hasCallback: !!onAvatarSelect
      });
    }
  };

  const resetFilters = () => {
    setSelectedFilters({
      gender: 'View All',
      age: null,
      ethnicity: null,
      look: null
    });
  };

  const content = (
    <div className="flex h-full">
      {!previewMode && (
        <>
          {/* Left sidebar */}
          <div className="w-64 bg-white px-6 py-4 flex flex-col">
            {/* Three buttons at the top */}
            <div className="mb-4 flex justify-center">
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-1 py-1" style={{ width: 'fit-content', height: '36px' }}>
                <button 
                  onClick={() => setActiveButton('button1')}
                  className={`px-2 rounded-md font-medium transition-colors h-7 text-sm ${
                    activeButton === 'button1' 
                      ? 'bg-gray-200 text-black' 
                      : 'bg-white text-gray-600'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveButton('button2')}
                  className={`px-2 rounded-md font-medium transition-colors h-7 text-sm ${
                    activeButton === 'button2' 
                      ? 'bg-gray-200 text-black' 
                      : 'bg-white text-gray-600'
                  }`}
                >
                  Custom
                </button>
                <button 
                  onClick={() => setActiveButton('button3')}
                  className={`px-2 rounded-md font-medium transition-colors h-7 text-sm ${
                    activeButton === 'button3' 
                      ? 'bg-gray-200 text-black' 
                      : 'bg-white text-gray-600'
                  }`}
                >
                  Stock
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pb-4">
              {/* Gender */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Gender</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer pl-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={selectedFilters.gender === 'Male'}
                      onChange={() => handleFilterChange('gender', 'Male')}
                      className="mr-2 border-gray-400 text-black focus:ring-0"
                    />
                    <span className="text-sm text-black">Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer pl-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={selectedFilters.gender === 'Female'}
                      onChange={() => handleFilterChange('gender', 'Female')}
                      className="mr-2 border-gray-400 text-black focus:ring-0"
                    />
                    <span className="text-sm text-black">Female</span>
                  </label>
                  <label className="flex items-center cursor-pointer pl-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={selectedFilters.gender === 'View All'}
                      onChange={() => handleFilterChange('gender', 'View All')}
                      className="mr-2 border-gray-400 text-black focus:ring-0"
                    />
                    <span className="text-sm text-black">View All</span>
                  </label>
                </div>
              </div>

              {/* Age */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Age</h4>
                <div className="space-y-2">
                  {['Young', 'Middle-aged', 'Senior'].map((age) => (
                    <label key={age} className="flex items-center cursor-pointer pl-2">
                      <input
                        type="radio"
                        name="age"
                        checked={selectedFilters.age === age}
                        onChange={() => handleFilterChange('age', age)}
                        className="mr-2 border-gray-400 text-black focus:ring-0"
                      />
                      <span className="text-sm text-black">{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ethnicity */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Ethnicity</h4>
                <div className="space-y-2">
                  {['Asian', 'Black', 'White / Caucasian', 'South Asian / Indian', 'Southeast Asian / Pacific Island', 'Black, Latino / Hispanic', 'Latino / Hispanic', 'Middle Eastern'].map((ethnicity) => (
                    <label key={ethnicity} className="flex items-center cursor-pointer pl-2">
                      <input
                        type="radio"
                        name="ethnicity"
                        checked={selectedFilters.ethnicity === ethnicity}
                        onChange={() => handleFilterChange('ethnicity', ethnicity)}
                        className="mr-2 border-gray-400 text-black focus:ring-0"
                      />
                      <span className="text-sm text-black">{ethnicity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Look (Avatar Variants) */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Look</h4>
                <div className="space-y-2">
                  {['Business', 'Casual', 'Call Centre', 'Doctor', 'Construction', 'Fitness', 'Chef', 'Thobe', 'Casual White'].map((look) => (
                    <label key={look} className="flex items-center cursor-pointer pl-2">
                      <input
                        type="radio"
                        name="look"
                        checked={selectedFilters.look === look}
                        onChange={() => handleFilterChange('look', look)}
                        className="mr-2 border-gray-400 text-black focus:ring-0"
                      />
                      <span className="text-sm text-black">{look}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer - appears when filters are applied */}
            {(selectedFilters.age || selectedFilters.ethnicity || selectedFilters.look || selectedFilters.gender !== 'View All') && (
              <div className="mt-4 pt-4 border-t border-gray-200 rounded-bl-lg -mx-6 flex justify-center">
                <button 
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  style={{ width: 'fit-content' }}
                >
                  <span className="text-base">×</span>
                  <span>Reset filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-gray-200"></div>
        </>
      )}

      {/* Right main area */}
      <div className={`flex flex-col p-4 ${previewMode ? 'w-full' : 'flex-1'}`}>
        {previewMode ? (
          // Preview mode content
          <>
            {/* Header with back button and avatar name */}
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
              <button 
                onClick={handleBackClick}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-medium text-black">{selectedAvatar?.displayName}</span>
            </div>

            {/* Main preview area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Big rectangle with avatar thumbnail */}
              <div className="relative w-full h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                {selectedAvatar?.thumbnail ? (
                  <img 
                    src={selectedAvatar.thumbnail} 
                    alt={selectedAvatar.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Avatar details below the image */}
              <div className="w-full text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedAvatar?.displayName}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span className="capitalize">{selectedAvatar?.gender}</span>
                  {selectedAvatar?.age && (
                    <span>{selectedAvatar.age} years</span>
                  )}
                  {selectedAvatar?.ethnicity && (
                    <span>{selectedAvatar.ethnicity}</span>
                  )}
                </div>
                {selectedAvatar?.selectedVariant && (
                  <p className="text-sm text-gray-500 mt-1">
                    Style: {selectedAvatar.selectedVariant.name}
                  </p>
                )}
              </div>
            </div>

            {/* Footer with Add to Scene button */}
            <div className="flex justify-center flex-shrink-0 border-t border-gray-200 pt-4 -mx-4">
              <button 
                onClick={handleAddToScene}
                className="px-6 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
              >
                + Add to scene
              </button>
            </div>
          </>
        ) : (
          // Normal mode content
          <>
            {/* Search bar and create button - fixed at top */}
            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
              {/* Search bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Black magnifying glass icon */}
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-0"
                  style={{ height: '36px' }}
                />
              </div>
              
              {/* Create button */}
              <button className="px-3 text-blue-600 rounded-lg hover:bg-blue-500 hover:bg-opacity-30 transition-colors font-medium text-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', height: '36px' }}>
                + Create
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto pb-4">
              {/* Avatar rectangles grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* 🔍 **DEBUG LOGGING: Avatar Grid Rendering** */}
                {(() => {
                  console.log('🎬 [AVATAR_POPUP] Rendering avatar grid...');
                  console.log('🎬 [AVATAR_POPUP] filteredAvatars to render:', filteredAvatars);
                  console.log('🎬 [AVATAR_POPUP] Grid will render', filteredAvatars.length, 'avatars');
                  
                  return filteredAvatars.map((avatar: ProcessedAvatar, index) => {
                    console.log(`🎬 [AVATAR_POPUP] Rendering avatar ${index + 1} in grid:`, {
                      id: avatar.id,
                      name: avatar.name,
                      displayName: avatar.displayName,
                      lookCategory: avatar.lookCategory,
                      thumbnail: avatar.thumbnail,
                      key: `${avatar.id}-${avatar.selectedVariant?.code || avatar.code}`
                    });
                    
                    return (
                    <div key={`${avatar.id}-${avatar.selectedVariant?.code || avatar.code}`} className="flex flex-col items-center">
                      {/* Avatar rectangle */}
                      <div 
                        className="relative w-full h-32 bg-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-300 transition-all duration-200 group overflow-hidden"
                        onClick={() => handleAvatarClick(avatar)}
                        style={{
                          backgroundImage: avatar.thumbnail ? `url(${avatar.thumbnail})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                        
                        {/* Avatar info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="text-white text-xs">
                            <div className="font-medium">{avatar.name}</div>
                            {avatar.selectedVariant && (
                              <div className="text-gray-300">{avatar.selectedVariant.name}</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Click indicator */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Avatar details below */}
                      <div className="text-center w-full">
                        <div className="text-sm text-black font-medium mb-1">{avatar.displayName}</div>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{avatar.gender}</span>
                          {avatar.age && <span>• {avatar.age}y</span>}
                          {avatar.selectedVariant && <span>• {avatar.selectedVariant.name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Modal display mode
  if (displayMode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Light background overlay */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          onClick={onClose}
        ></div>
        
        {/* Modal content */}
        <div 
          className={`relative bg-white shadow-xl w-full mx-4 z-10 h-[420px] overflow-hidden ${className}`}
          style={{ borderRadius: '12px', maxWidth: previewMode ? '500px' : '800px' }}
        >
          {/* Main content area with sidebar */}
          {content}
        </div>
      </div>
    );
  }

  // Popup display mode
  if (displayMode === 'popup') {
    return (
      <div 
        ref={popupRef}
        className={`fixed z-50 bg-white shadow-xl border border-gray-200 overflow-hidden ${className}`} 
        style={{ 
          borderRadius: '12px',
          left: position?.x || 0,
          top: position?.y || 0,
          width: previewMode ? '500px' : '800px',
          height: '420px'
        }}
      >
        {/* Main content area with sidebar */}
        {content}
      </div>
    );
  }

  return null;
}
