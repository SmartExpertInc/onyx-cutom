"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAvatarDisplay } from '@/components/AvatarDisplayManager';

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
  const genderDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    gender: 'All',
    age: [] as string[],
    ethnicity: [] as string[],
    look: [] as string[]
  });
  const [selectedAvatar, setSelectedAvatar] = useState<ProcessedAvatar | null>(null);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  
  // Integrate with global avatar system
  const { updateSelectedAvatar } = useAvatarDisplay();

  // 🔍 **DEBUG LOGGING: Component Props Received**
  console.log('🎬 [AVATAR_POPUP] AvatarPopup component rendered with props:', {
    isOpen,
    title,
    displayMode,
    avatarDataCount: avatarData?.length || 0
  });

  // 🔍 **DEBUG LOGGING: Avatar Data Analysis**
  useEffect(() => {
    if (avatarData && avatarData.length > 0) {
      console.log('🎬 [AVATAR_POPUP] Avatar data received, total avatars:', avatarData.length);
    } else {
      console.warn('🎬 [AVATAR_POPUP] No avatar data received or empty array');
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

  // Handle click outside for gender dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target as Node)) {
        setIsGenderDropdownOpen(false);
      }
    };

    if (isGenderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGenderDropdownOpen]);

  // Process avatar data to flatten variants
  const processedAvatars = useMemo(() => {
    if (!avatarData || avatarData.length === 0) {
      return [];
    }
    
    const processed = avatarData.flatMap((avatar, avatarIndex) => {
      if (avatar.variants && avatar.variants.length > 0) {
        // Create separate entry for each variant
        const variantEntries = avatar.variants.map((variant, variantIndex) => {
          const processedAvatar = {
            id: `${avatar.id}-${variant.code}`, // Unique ID for each variant
            code: avatar.code,
            name: avatar.name,
            gender: avatar.gender,
            age: avatar.age,
            ethnicity: avatar.ethnicity,
            thumbnail: variant.thumbnail || variant.canvas || '',
            canvas: variant.canvas || '',
            selectedVariant: variant,
            displayName: `${avatar.name} - ${variant.name}`,
            lookCategory: variant.name
          };
          
          return processedAvatar;
        });
        
        return variantEntries;
      } else {
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
        
        return [defaultEntry];
      }
    });
    
    console.log('🎬 [AVATAR_POPUP] Avatar processing complete, total:', processed.length);
    return processed;
  }, [avatarData]);

  // Apply filters to avatars
  const filteredAvatars = useMemo(() => {
    const filtered = processedAvatars.filter((avatar) => {
      // Gender filter
      if (selectedFilters.gender !== 'All' && avatar.gender !== selectedFilters.gender?.toLowerCase()) {
        return false;
      }
      
      // Age filter
      if (selectedFilters.age.length > 0 && avatar.age) {
        const ageMatch = selectedFilters.age.some(ageFilter => (
          (ageFilter === 'Young' && avatar.age! < 30) ||
          (ageFilter === 'Middle-aged' && avatar.age! >= 30 && avatar.age! <= 50) ||
          (ageFilter === 'Senior' && avatar.age! > 50)
        ));
        if (!ageMatch) {
          return false;
        }
      }
      
      // Ethnicity filter
      if (selectedFilters.ethnicity.length > 0 && avatar.ethnicity) {
        const ethnicityMatch = selectedFilters.ethnicity.some(ethnicityFilter =>
          avatar.ethnicity?.toLowerCase().includes(ethnicityFilter.toLowerCase())
        );
        if (!ethnicityMatch) {
          return false;
        }
      }
      
      // Look filter (variant name)
      if (selectedFilters.look.length > 0) {
        if (!selectedFilters.look.includes(avatar.lookCategory)) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log('🎬 [AVATAR_POPUP] Filtering complete, filtered:', filtered.length, 'from:', processedAvatars.length);
    return filtered;
  }, [processedAvatars, selectedFilters]);

  if (!isOpen) return null;

  const handleFilterChange = (filterType: string, value: string | null) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCheckboxChange = (filterType: 'age' | 'ethnicity' | 'look', value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [filterType]: newValues
      };
    });
  };

  const handleAvatarClick = (avatar: ProcessedAvatar) => {
    console.log('🎬 [AVATAR_POPUP] Avatar clicked:', {
      id: avatar.id,
      name: avatar.name,
      displayName: avatar.displayName,
      gender: avatar.gender,
      age: avatar.age,
      ethnicity: avatar.ethnicity,
      thumbnail: avatar.thumbnail,
      selectedVariant: avatar.selectedVariant
    });
    
    // Directly add to scene without preview mode
    setSelectedAvatar(avatar);
    handleAddToSceneDirectly(avatar);
  };

  const handleAddToSceneDirectly = (avatar: ProcessedAvatar) => {
    console.log('🎬 [AVATAR_POPUP] Adding avatar to scene directly');
    
    if (avatar && onAvatarSelect) {
      console.log('🎬 [AVATAR_POPUP] Calling onAvatarSelect with:', {
        avatar: avatar,
        variant: avatar.selectedVariant
      });
      
      // Call the callback to update the avatar on the slide
      onAvatarSelect(avatar, avatar.selectedVariant);
      
      // Update the global avatar system (same as AvatarSelector does)
      if (avatar.selectedVariant) {
        const elaiAvatar = {
          id: avatar.id,
          code: avatar.code,
          name: avatar.name,
          type: null,
          status: 1,
          accountId: '',
          gender: avatar.gender,
          thumbnail: avatar.thumbnail,
          canvas: avatar.canvas,
          age: avatar.age,
          ethnicity: avatar.ethnicity,
          variants: [{
            code: avatar.selectedVariant.code,
            id: avatar.selectedVariant.code,
            name: avatar.selectedVariant.name,
            thumbnail: avatar.selectedVariant.thumbnail,
            canvas: avatar.selectedVariant.canvas
          }]
        };
        
        const elaiVariant = {
          code: avatar.selectedVariant.code,
          id: avatar.selectedVariant.code,
          name: avatar.selectedVariant.name,
          thumbnail: avatar.selectedVariant.thumbnail,
          canvas: avatar.selectedVariant.canvas
        };
        
        updateSelectedAvatar(elaiAvatar, elaiVariant);
        console.log('🎬 [AVATAR_POPUP] Global avatar context updated:', {
          avatar: avatar.name,
          variant: avatar.selectedVariant.name
        });
      }
      
      console.log('🎬 [AVATAR_POPUP] Avatar selection callback completed, closing popup');
      onClose();
    } else {
      console.error('🎬 [AVATAR_POPUP] Cannot add to scene:', {
        hasSelectedAvatar: !!avatar,
        hasCallback: !!onAvatarSelect
      });
    }
  };

  const content = (
    <div className="flex h-full p-3">
          {/* Left sidebar */}
          <div className="w-56 bg-white px-3 py-4 flex flex-col border rounded-md border-[#E0E0E0]">
            {/* Search bar at the top */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Black magnifying glass icon */}
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 h-9 border border-[#E0E0E0] rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pb-4">
              {/* Gender */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Gender</h4>
                <div className="relative" ref={genderDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md text-sm text-[#878787] bg-white focus:outline-none text-left flex items-center justify-between"
                  >
                    <span>{selectedFilters.gender}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isGenderDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isGenderDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#E0E0E0] rounded-md shadow-lg">
                      {['All', 'Female', 'Male'].map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            handleFilterChange('gender', option);
                            setIsGenderDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-[#171718] flex items-center justify-between ${
                            selectedFilters.gender === option ? 'bg-gray-50' : ''
                          } ${option === 'All' ? 'rounded-t-md' : ''} ${option === 'Male' ? 'rounded-b-md' : ''}`}
                        >
                          <span>{option}</span>
                          {selectedFilters.gender === option && (
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.22461 0.527344C8.3016 0.577768 8.32278 0.68085 8.27246 0.757812L3.73926 7.69141C3.71263 7.73204 3.66962 7.75942 3.62109 7.76562C3.57295 7.77178 3.52442 7.75629 3.48828 7.72363L0.554688 5.05664C0.486645 4.99478 0.481227 4.88941 0.542969 4.82129C0.604886 4.75318 0.71022 4.74865 0.77832 4.81055L3.13379 6.95117L3.56738 7.3457L3.88867 6.85449L7.99414 0.575195C8.04461 0.49844 8.1477 0.47706 8.22461 0.527344Z" fill="#171718" stroke="#171718"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Age */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Age</h4>
                <div className="border border-[#E0E0E0] rounded-md p-2 space-y-2">
                  {['Young', 'Middle-aged', 'Senior'].map((age) => (
                    <label key={age} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.age.includes(age)}
                        onChange={() => handleCheckboxChange('age', age)}
                        className="mr-2 w-4 h-4 rounded-md border border-[#878787] bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none"
                        style={{
                          backgroundImage: selectedFilters.age.includes(age) 
                            ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMuMzMzMyA0TDYgMTEuMzMzM0wyLjY2NjY3IDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')" 
                            : 'none',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="text-sm text-black">{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ethnicity */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Ethnicity</h4>
                <div className="border border-[#E0E0E0] rounded-md p-2 space-y-2">
                  {['Asian', 'Black', 'White / Caucasian', 'South Asian / Indian', 'Southeast Asian / Pacific Island', 'Black, Latino / Hispanic', 'Latino / Hispanic', 'Middle Eastern'].map((ethnicity) => (
                    <label key={ethnicity} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.ethnicity.includes(ethnicity)}
                        onChange={() => handleCheckboxChange('ethnicity', ethnicity)}
                        className="mr-2 w-4 h-4 rounded-md border border-[#878787] bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none"
                        style={{
                          backgroundImage: selectedFilters.ethnicity.includes(ethnicity) 
                            ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMuMzMzMyA0TDYgMTEuMzMzM0wyLjY2NjY3IDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')" 
                            : 'none',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="text-sm text-black">{ethnicity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Look (Avatar Variants) */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Look</h4>
                <div className="border border-[#E0E0E0] rounded-md p-2 space-y-2">
                  {['Business', 'Casual', 'Call Centre', 'Doctor', 'Construction', 'Fitness', 'Chef', 'Thobe', 'Casual White'].map((look) => (
                    <label key={look} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.look.includes(look)}
                        onChange={() => handleCheckboxChange('look', look)}
                        className="mr-2 w-4 h-4 rounded-md border border-[#878787] bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none"
                        style={{
                          backgroundImage: selectedFilters.look.includes(look) 
                            ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMuMzMzMyA0TDYgMTEuMzMzM0wyLjY2NjY3IDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')" 
                            : 'none',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <span className="text-sm text-black">{look}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

      {/* Right main area */}
      <div className="flex flex-col px-4 flex-1">
          {/* Avatar grid - always show */}
          <>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto pb-4">
              {/* Avatar rectangles grid */}
              <div className="grid grid-cols-3 gap-[18px]">
                 {filteredAvatars.map((avatar: ProcessedAvatar, index) => (
                   <div key={`${avatar.id}-${avatar.selectedVariant?.code || avatar.code}`} className="flex flex-col items-center">
                    {/* Avatar rectangle */}
                    <div 
                      className="relative w-full h-[136px] rounded-md mb-2 cursor-pointer transition-all duration-200 group overflow-hidden flex items-center justify-center border border-[#E0E0E0]"
                      onClick={() => handleAvatarClick(avatar)}
                      >
                        {avatar.thumbnail ? (
                          <img 
                            src={avatar.thumbnail} 
                            alt={avatar.displayName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                        
                        {/* Avatar info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="text-white text-xs">
                            <div className="font-medium">{avatar.name}</div>
                            {avatar.selectedVariant && (
                              <div className="text-gray-300">{avatar.selectedVariant.name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Avatar name only */}
                      <div className="text-center w-full">
                        <div className="text-sm text-black font-medium">{avatar.displayName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
      </div>
    </div>
  );

  // Modal display mode
  if (displayMode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Light background overlay */}
        <div 
          className="absolute inset-0 bg-black/20"
          onClick={onClose}
        ></div>
        
        {/* Modal content */}
        <div 
          className={`relative bg-white shadow-xl w-full mx-4 z-10 h-[570px] max-w-[880px] rounded-md overflow-hidden ${className}`}
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
        className={`fixed z-50 bg-white shadow-xl border border-gray-200 w-[880px] h-[570px] rounded-md overflow-hidden ${className}`} 
        style={{
          left: position?.x || 0,
          top: position?.y || 0
        }}
      >
        {/* Main content area with sidebar */}
        {content}
      </div>
    );
  }

  return null;
}
