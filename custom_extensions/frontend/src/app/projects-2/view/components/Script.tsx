"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, UserMinus, UserPlus } from 'lucide-react';
import VoicePicker from './VoicePicker';
import DictionaryModal from './DictionaryModal';
// NEW: Import Video Lesson types
import { VideoLessonData } from '@/types/videoLessonTypes';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
// Import Voice Context
import { useVoice } from '@/contexts/VoiceContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScriptProps {
  onAiButtonClick: (position: { x: number; y: number }) => void;
  // NEW: Video Lesson specific props
  videoLessonData?: VideoLessonData;
  componentBasedSlideDeck?: ComponentBasedSlideDeck;
  currentSlideId?: string;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  showReady?: boolean;
}

export default function Script({ onAiButtonClick, videoLessonData, componentBasedSlideDeck, currentSlideId, onTextChange, showReady }: ScriptProps) {
  const { t } = useLanguage();
  const [openDropdownSlideId, setOpenDropdownSlideId] = useState<string | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  
  // Get selected voice from context
  const { selectedVoice } = useVoice();
  
  // Get all slides from either structure
  const allSlides = componentBasedSlideDeck?.slides || videoLessonData?.slides || [];
  
  // Use voiceover text from current slide or fallback to placeholder
  const defaultPlaceholder = t('panels.script.defaultPlaceholder', 'Create dynamic, powerful and informative videos with an avatar as your host. Instantly translate your video into over eighty languages, use engaging media to grab your audiences attention, or even simulate conversations between multiple avatars. All with an intuitive interface that anyone can use!');
  
  // Function to handle script content changes for a specific slide
  const handleScriptContentChange = (slideId: string, newContent: string) => {
    if (onTextChange) {
      if (componentBasedSlideDeck?.slides) {
        const slideIndex = componentBasedSlideDeck.slides.findIndex(s => s.slideId === slideId);
        if (slideIndex !== -1) {
          onTextChange(['slides', slideIndex, 'voiceoverText'], newContent);
        }
      } else if (videoLessonData?.slides) {
        const slideIndex = videoLessonData.slides.findIndex(s => s.slideId === slideId);
        if (slideIndex !== -1) {
          onTextChange(['slides', slideIndex, 'voiceoverText'], newContent);
        }
      }
    }
  };
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownSlideId(null);
      }
    };

    if (openDropdownSlideId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownSlideId]);

  // Scroll to selected card when currentSlideId changes
  useEffect(() => {
    if (selectedCardRef.current && currentSlideId) {
      selectedCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentSlideId]);

  // Debug logging
  console.log('Script - videoLessonData:', videoLessonData);
  console.log('Script - componentBasedSlideDeck:', componentBasedSlideDeck);
  console.log('Script - currentSlideId:', currentSlideId);
  console.log('Script - allSlides:', allSlides);

  // Format time as MM:SS
  // const formatTime = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  // };

  // Function to handle AI button click and calculate position
  // const handleAiButtonClick = () => {
  //   if (aiButtonRef.current) {
  //     const rect = aiButtonRef.current.getBoundingClientRect();
  //     const position = {
  //       x: rect.left + rect.width / 2, // Center horizontally
  //       y: rect.top, // Position above the button
  //     };
  //     onAiButtonClick(position);
  //   }
  // };

  // Function to insert move/animation marker at cursor position
  /* const insertMoveMarker = () => {
    if (textAreaRef.current) {
      // Focus the textarea first to ensure cursor is positioned within it
      textAreaRef.current.focus();
      
      const selection = window.getSelection();
      let range: Range;
      
      // Check if there's a valid selection within the textarea
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        
        // Verify the range is within the textarea
        if (!textAreaRef.current.contains(range.commonAncestorContainer)) {
          // If not within textarea, create a new range at the end of textarea
          range = document.createRange();
          range.selectNodeContents(textAreaRef.current);
          range.collapse(false); // Collapse to end
        }
      } else {
        // No selection, create range at the end of textarea
        range = document.createRange();
        range.selectNodeContents(textAreaRef.current);
        range.collapse(false); // Collapse to end
      }
      
      // Create the SVG icon element
      const iconElement = document.createElement('span');
      iconElement.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" style="display: inline; vertical-align: middle; margin: 0 2px;"><circle cx="18" cy="12" r="4" stroke="currentColor" stroke-width="2"/><line x1="3" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="3" y1="12" x2="11" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="3" y1="18" x2="9" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      iconElement.setAttribute('contenteditable', 'false');
      iconElement.style.backgroundColor = '#f3f4f6';
      iconElement.style.borderRadius = '4px';
      iconElement.style.padding = '2px 4px';
      iconElement.style.color = '#666';
      
      // Insert at cursor position
      range.deleteContents();
      range.insertNode(iconElement);
      
      // Move cursor after the icon
      range.setStartAfter(iconElement);
      range.setEndAfter(iconElement);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }; */
  return (
    <div className="h-full bg-white relative w-full script-container overflow-y-auto">
      <style>{`
        .script-container button {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
      
      {/* Scrollable Content Container */}
      <div className="relative z-10 flex flex-col gap-4 p-3">
        {/* Map through all slides and create a card for each */}
        {allSlides.map((slide, index) => {
          const isSelected = slide.slideId === currentSlideId;
          
          return (
            <div
              key={slide.slideId}
              ref={isSelected ? selectedCardRef : null}
              className={`p-3 rounded-lg ${
                isSelected 
                  ? 'shadow-lg' 
                  : ''
              }`}
              style={{
                backgroundColor: isSelected ? '#CCDBFC' : 'transparent',
                border: isSelected ? '1px solid #E0E0E0' : 'none',
              }}
            >
              {/* Top Section with Avatar Dropdown and Voice Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 mb-4 w-full">
          {/* Card Number Circle */}
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-gray-200 flex-shrink-0">
            <span className="text-xs font-medium" style={{ color: '#E0E0E0' }}>{index + 1}</span>
          </div>
          
          {/* Avatar Dropdown */}
                <div className="relative flex-shrink-0">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
              }}
              onClick={() => {
                if (showReady) return;
                      setOpenDropdownSlideId(
                        openDropdownSlideId === slide.slideId ? null : slide.slideId
                      );
              }}
              disabled={showReady}
              title={showReady ? 'Soon' : undefined}
                    className={`flex items-center gap-1 px-2 py-1 h-8 bg-white border rounded-lg transition-colors cursor-pointer ${showReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              style={{ 
                userSelect: 'none',
                borderColor: openDropdownSlideId === slide.slideId ? '#A5A5A5' : '#E0E0E0'
              }}
            >
              <User size={20} className="text-gray-700" />
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Avatar Dropdown Popup */}
                  {openDropdownSlideId === slide.slideId && (
                    <div 
                      ref={dropdownRef}
                      className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
                      style={{ borderColor: '#A5A5A5' }}
                    >
                <div className="p-2">
                        {/* Row 1: Lisa */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <User size={16} className="text-gray-700" />
                          <span className="text-xs text-gray-700">{t('panels.script.avatarLisa', 'Lisa')}</span>
                  </button>
                  
                  {/* Row 3: Narration only */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-700">
                      <path fill="currentColor" d="M8.5 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0a5 5 0 0 1-10 0Zm17.073-1.352l.497.867a7 7 0 0 1-.002 6.975l-.499.867l-1.733-.997l.498-.867a5 5 0 0 0 .002-4.982l-.498-.867l1.735-.996ZM17.538 7.39l.497.868a3.5 3.5 0 0 1 0 3.487l-.5.867l-1.733-.997l.498-.867a1.499 1.499 0 0 0 0-1.495l-.497-.867l1.735-.996ZM0 19a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5v2h-2v-2a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v2H0v-2Z"/>
                    </svg>
                    <span className="text-xs text-gray-700">{t('panels.script.narrationOnly', 'Narration only')}</span>
                  </button>
                  
                  {/* Row 4: Horizontal line */}
                  <div className="my-1">
                    <hr className="border-gray-300" />
                  </div>
                  
                  {/* Row 5: Remove avatar */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <UserMinus size={16} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{t('panels.script.removeAvatar', 'Remove avatar')}</span>
                  </button>
                  
                  {/* Row 6: Add new avatar */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <UserPlus size={16} className="text-gray-700" />
                    <span className="text-xs text-gray-700">{t('panels.script.addNewAvatar', 'Add new avatar')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Selector Button */}
          <div className="relative w-full sm:w-auto">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
              }}
              onClick={() => {
                setIsLanguageModalOpen(true);
              }}
                    className="flex items-center gap-1 px-2 py-1 h-8 bg-white border border-[#E0E0E0] rounded-lg hover:bg-gray-50 transition-colors w-auto cursor-pointer"
              style={{ userSelect: 'none' }}
            >
                    <span className="text-xs" style={{ color: '#878787' }}>
                      {t('panels.script.lisaNarration', 'Lisa narration')}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <g fill="none" stroke="#878787" stroke-width="1.5">
                        <path d="M1 13.857v-3.714a2 2 0 0 1 2-2h2.9a1 1 0 0 0 .55-.165l6-3.956a1 1 0 0 1 1.55.835v14.286a1 1 0 0 1-1.55.835l-6-3.956a1 1 0 0 0-.55-.165H3a2 2 0 0 1-2-2Z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.5 7.5S19 9 19 11.5s-1.5 4-1.5 4m3-11S23 7 23 11.5s-2.5 7-2.5 7"/>
                      </g>
                    </svg>
            </button>
          </div>
        </div>

              {/* Script Text Area */}
        <div className="w-full max-w-[615px] lg:max-w-[650px]">
          <div
            contentEditable
            suppressContentEditableWarning
                  className="w-full text-xs leading-loose font-normal bg-transparent border-none outline-none overflow-y-auto p-0"
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    minHeight: '100px',
                    color: isSelected ? '#171718' : '#434343'
                  }}
                  onInput={(e) => handleScriptContentChange(slide.slideId, e.currentTarget.textContent || '')}
                  dangerouslySetInnerHTML={{ __html: slide.voiceoverText || defaultPlaceholder }}
          />
        </div>
            </div>
          );
        })}
      </div>

      {/* Voice Picker Modal */}
      <VoicePicker
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectVoice={(voice) => {
          console.log('Selected voice:', voice);
          // Handle voice selection here
        }}
        showReady={showReady}
      />

      {/* Dictionary Modal */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
      />
    </div>
  );
}