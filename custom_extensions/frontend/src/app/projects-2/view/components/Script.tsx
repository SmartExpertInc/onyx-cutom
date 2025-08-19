"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, UserMinus, UserPlus } from 'lucide-react';
import VoicePicker from './VoicePicker';
import DictionaryModal from './DictionaryModal';

export default function Script() {
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState(false);
  const [isPausePopupOpen, setIsPausePopupOpen] = useState(false);
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [scriptContent, setScriptContent] = useState(
    `Create dynamic, powerful and informative videos with an avatar as your host. Instantly translate your video into over eighty languages, use engaging media to grab your audiences attention, or even simulate conversations between multiple avatars. All with an intuitive interface that anyone can use!`
  );
  const [cursorPosition, setCursorPosition] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aiPopupRef = useRef<HTMLDivElement>(null);
  const pausePopupRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
      if (aiPopupRef.current && !aiPopupRef.current.contains(event.target as Node)) {
        setIsAiPopupOpen(false);
      }
      if (pausePopupRef.current && !pausePopupRef.current.contains(event.target as Node)) {
        setIsPausePopupOpen(false);
      }
    };

    if (isAvatarDropdownOpen || isAiPopupOpen || isPausePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarDropdownOpen, isAiPopupOpen, isPausePopupOpen]);

  // Timer effect for play functionality
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = setInterval(() => {
        setPlayTime(prev => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  // Play handler
  const handlePlay = () => {
    setIsPlaying(true);
    setPlayTime(0);
  };

  // Stop handler
  const handleStop = () => {
    setIsPlaying(false);
    setPlayTime(0);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to insert move/animation marker at cursor position
  const insertMoveMarker = () => {
    if (textAreaRef.current) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      
      if (range) {
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
    }
  };
  return (
    <div className="h-full bg-white border border-gray-200 relative overflow-hidden w-full">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-start justify-start p-8 pb-20">

        {/* Top Section with Avatar Dropdown and Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 w-full">
          {/* Avatar Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User size={20} className="text-black" />
              <ChevronDown size={16} className="text-black" />
            </button>

            {/* Avatar Dropdown Popup */}
            {isAvatarDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {/* Row 1: Header */}
                  <div className="px-2 py-1">
                    <span className="text-xs text-gray-500">Avatars</span>
                  </div>
                  
                  {/* Row 2: Lisa - Office 4 */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <User size={16} className="text-black" />
                    <span className="text-sm text-black">Lisa - Office 4</span>
                  </button>
                  
                  {/* Row 3: Narration only */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-black">
                      <path fill="currentColor" d="M8.5 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0a5 5 0 0 1-10 0Zm17.073-1.352l.497.867a7 7 0 0 1-.002 6.975l-.499.867l-1.733-.997l.498-.867a5 5 0 0 0 .002-4.982l-.498-.867l1.735-.996ZM17.538 7.39l.497.868a3.5 3.5 0 0 1 0 3.487l-.5.867l-1.733-.997l.498-.867a1.499 1.499 0 0 0 0-1.495l-.497-.867l1.735-.996ZM0 19a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5v2h-2v-2a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v2H0v-2Z"/>
                    </svg>
                    <span className="text-sm text-black">Narration only</span>
                  </button>
                  
                  {/* Row 4: Horizontal line */}
                  <div className="my-1">
                    <hr className="border-gray-300" />
                  </div>
                  
                  {/* Row 5: Remove avatar */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <UserMinus size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-500">Remove avatar</span>
                  </button>
                  
                  {/* Row 6: Add new avatar */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <UserPlus size={16} className="text-black" />
                    <span className="text-sm text-black">Add new avatar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language/User Selector Button */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" className="text-black">
                <path fill="currentColor" d="M56 96v64a8 8 0 0 1-16 0V96a8 8 0 0 1 16 0Zm32-72a8 8 0 0 0-8 8v192a8 8 0 0 0 16 0V32a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v64a8 8 0 0 0 16 0V96a8 8 0 0 0-8-8Zm40-16a8 8 0 0 0-8 8v96a8 8 0 0 0 16 0V80a8 8 0 0 0-8-8Z"/>
              </svg>
              <span className="text-sm font-medium text-black">US - Leesa</span>
            </button>
          </div>
        </div>

        {/* Main Content Text */}
        <div className="w-full max-w-[615px] lg:max-w-[650px]">
          <div
            ref={textAreaRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full text-[#5F5F5F] text-sm leading-loose font-normal bg-transparent border-none outline-none h-[70vh] overflow-y-auto p-0"
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: scriptContent }}
          />
        </div>
      </div>

      {/* Voice Picker Modal */}
      <VoicePicker
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectVoice={(voice) => {
          console.log('Selected voice:', voice);
          // Handle voice selection here
        }}
      />

      {/* Dictionary Modal */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 px-6">
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg px-1.5 py-0.5">
        {!isPlaying ? (
          // Default toolbar with all buttons
          <>
        {/* AI Button */}
        <div className="relative group" ref={aiPopupRef}>
          <button 
            onClick={() => setIsAiPopupOpen(!isAiPopupOpen)}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Zm-1.365 11.852L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183l.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394l-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>
            </svg>
          </button>
          
          {/* AI Popup */}
          {isAiPopupOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-[99999]">
              <div className="p-4">
                {/* Row 1: Header */}
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="text-gray-500">
                      <defs>
                        <path id="arcticonsAiChat0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M16.63 29.522v4.224l-2.836 1.638a4.378 4.378 0 0 1-5.981-1.608l-.34-.589a4.369 4.369 0 0 1 1.608-5.971l2.896-1.668l3.535 2.047a2.227 2.227 0 0 1 1.118 1.927Zm6.252-14.699l-3.595-2.077V9.55a4.373 4.373 0 0 1 4.373-4.374h.69a4.37 4.37 0 0 1 4.363 4.374v3.196l-3.595 2.077c-.689.4-1.547.4-2.237 0ZM33.347 24l-3.915 2.257c-.449.26-.719.729-.719 1.238v4.724l-3.994-2.307h-.01c-.44-.26-.979-.26-1.418 0l-.01-.01l-3.994 2.307v-4.714c0-.51-.27-.978-.72-1.238L14.654 24l3.915-2.257c.45-.26.719-.729.719-1.238V15.79l3.994 2.307l.01-.01c.44.26.979.26 1.418 0l.01.01l3.994-2.307v4.714c0 .51.27.979.72 1.238L33.346 24Zm7.17 9.197l-.34.6a4.378 4.378 0 0 1-5.971 1.587l-2.836-1.638v-4.224c0-.799.43-1.528 1.118-1.927l3.535-2.047l2.896 1.668a4.375 4.375 0 0 1 1.598 5.981Z"/>
                      </defs>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M31.37 9.33v1.888l-2.657 1.528V9.55a4.37 4.37 0 0 0-4.364-4.374h-.689a4.373 4.373 0 0 0-4.373 4.374v10.955c0 .51-.27.979-.72 1.238L14.654 24l-2.676-1.548l3.535-2.037a2.244 2.244 0 0 0 1.118-1.937V9.34a6.844 6.844 0 0 1 6.84-6.84h1.07a6.827 6.827 0 0 1 6.83 6.83Zm-2.657 22.888v3.036l-3.595-2.077a2.288 2.288 0 0 0-2.236 0l-3.595 2.077l-2.657 1.528l-1.657.959a6.838 6.838 0 0 1-9.337-2.497l-.27-.47l-.27-.458a6.83 6.83 0 0 1 2.507-9.337l1.697-.98l2.677 1.549l-2.896 1.668a4.369 4.369 0 0 0-1.608 5.971l.34.59a4.378 4.378 0 0 0 5.981 1.607l2.836-1.638l2.657-1.538l3.994-2.306l.01.01c.44-.26.979-.26 1.418 0h.01l3.994 2.307Z"/>
                      <use href="#arcticonsAiChat0" strokeLinecap="round" strokeLinejoin="round"/>
                      <use href="#arcticonsAiChat0" strokeLinecap="round" strokeLinejoin="round"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M19.287 27.495v4.714l-2.657 1.537v-4.224c0-.799-.43-1.528-1.118-1.927l-3.535-2.047L9.3 24l-1.698-.979a6.83 6.83 0 0 1-2.506-9.336l.27-.46l.269-.47a6.838 6.838 0 0 1 9.337-2.496l1.657.959v3.036l-2.836-1.638a4.378 4.378 0 0 0-5.981 1.608l-.34.589a4.369 4.369 0 0 0 1.608 5.971l2.896 1.668L14.653 24l3.915 2.257c.45.26.719.729.719 1.238Z"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m15.512 20.415l-3.535 2.037l-2.896-1.668a4.369 4.369 0 0 1-1.608-5.971l.34-.59a4.378 4.378 0 0 1 5.981-1.607l2.836 1.638v4.224c0 .799-.43 1.537-1.118 1.937Zm20.511 5.133l-3.535 2.047a2.227 2.227 0 0 0-1.118 1.927v9.147a6.827 6.827 0 0 1-6.83 6.831h-1.07a6.844 6.844 0 0 1-6.84-6.84v-1.878l2.657-1.528v3.196a4.373 4.373 0 0 0 4.374 4.374h.689a4.37 4.37 0 0 0 4.363-4.374V27.495c0-.51.27-.978.72-1.238L33.346 24l2.676 1.548Z"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m25.118 33.177l3.595 2.077v3.196a4.37 4.37 0 0 1-4.364 4.374h-.689a4.373 4.373 0 0 1-4.373-4.374v-3.196l3.595-2.077a2.288 2.288 0 0 1 2.237 0Zm15.279-10.156L38.7 24l-2.677-1.548l2.896-1.668a4.375 4.375 0 0 0 1.598-5.981l-.34-.59a4.372 4.372 0 0 0-5.971-1.597l-2.836 1.638l-2.657 1.538l-3.994 2.306l-.01-.01c-.44.26-.979.26-1.418 0l-.01.01l-3.994-2.306v-3.046l3.595 2.077c.689.4 1.548.4 2.237 0l3.595-2.077l2.656-1.528l1.658-.959a6.838 6.838 0 0 1 9.337 2.497l.27.47l.269.459a6.83 6.83 0 0 1-2.507 9.337Z"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M29.432 21.743L33.347 24l-3.915 2.257c-.449.26-.719.729-.719 1.238v4.724l-3.994-2.307h-.01c-.44-.26-.979-.26-1.418 0l-.01-.01l-3.994 2.307v-4.714c0-.51-.27-.978-.72-1.238L14.654 24l3.915-2.257c.45-.26.719-.729.719-1.238V15.79l3.994 2.307l.01-.01c.44.26.979.26 1.418 0l.01.01l3.994-2.307v4.714c0 .51.27.979.72 1.238Zm9.488-.958l-2.897 1.667l-3.535-2.037a2.244 2.244 0 0 1-1.118-1.937v-4.224l2.836-1.638a4.372 4.372 0 0 1 5.971 1.598l.34.589a4.375 4.375 0 0 1-1.598 5.982Zm-22.29-6.531v4.224c0 .799-.43 1.537-1.118 1.937l-3.535 2.037l-2.896-1.668a4.369 4.369 0 0 1-1.608-5.971l.34-.59a4.378 4.378 0 0 1 5.981-1.607l2.836 1.638Zm12.083 21v3.196a4.37 4.37 0 0 1-4.364 4.374h-.689a4.373 4.373 0 0 1-4.373-4.374v-3.196l3.595-2.077a2.288 2.288 0 0 1 2.237 0l3.595 2.077Z"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m42.904 34.316l-.27.459l-.27.47a6.838 6.838 0 0 1-9.337 2.496l-1.657-.959v-3.036l2.836 1.638a4.378 4.378 0 0 0 5.971-1.588l.34-.599a4.375 4.375 0 0 0-1.598-5.981l-2.896-1.668L33.347 24l-3.915-2.257a1.426 1.426 0 0 1-.719-1.238V15.79l2.657-1.537v4.224c0 .799.43 1.537 1.118 1.937l3.535 2.037L38.7 24l1.698.979a6.83 6.83 0 0 1 2.506 9.336Z"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m33.347 24l-3.915 2.257c-.449.26-.719.729-.719 1.238v4.724l-3.994-2.307h-.01c-.44-.26-.979-.26-1.418 0l-.01-.01l-3.994 2.307v-4.714c0-.51-.27-.978-.72-1.238L14.654 24l3.915-2.257c.45-.26.719-.729.719-1.238V15.79l3.994 2.307l.01-.01c.44.26.979.26 1.418 0l.01.01l3.994-2.307v4.714c0 .51.27.979.72 1.238L33.346 24Zm5.573-3.215l-2.897 1.667l-3.535-2.037a2.244 2.244 0 0 1-1.118-1.937v-4.224l2.836-1.638a4.372 4.372 0 0 1 5.971 1.598l.34.589a4.375 4.375 0 0 1-1.598 5.982Z"/>
                      <circle cx="24" cy="24" r=".75" fill="currentColor"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Ask me anything, or choose an option below"
                    className="flex-1 text-sm text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none focus:outline-none"
                    autoFocus
                  />
                </div>
                
                {/* First horizontal line */}
                <div className="border-t border-gray-300 -mx-4 mb-3"></div>
                
                {/* Row 2: Correct grammar */}
                <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
                  Correct grammar
                </button>
                
                {/* Row 3: Soften tone */}
                <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
                  Soften tone
                </button>
                
                {/* Row 4: Strengthen tone */}
                <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
                  Strengthen tone
                </button>
                
                {/* Row 5: Brainstorm ideas */}
                <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
                  Brainstorm ideas
                </button>
                
                {/* Second horizontal line */}
                <div className="border-t border-gray-300 -mx-4 my-3"></div>
                
                {/* FAQ row */}
                <button className="w-full flex items-center gap-2 text-left text-sm text-gray-500 py-2 hover:bg-gray-50 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                    <g fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 14h1v9h1m12-7a13 13 0 1 1-26 0a13 13 0 0 1 26 0Z"/>
                      <path fill="currentColor" d="M17 9.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/>
                    </g>
                  </svg>
                  AI Assistant FAQ
                </button>
              </div>
            </div>
          )}
          
          {/* Tooltip (only show when popup is closed) */}
          {!isAiPopupOpen && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Use the AI assistant
            </div>
          )}
        </div>

        {/* Pause Button */}
        <div className="relative group" ref={pausePopupRef}>
          <button 
            onClick={() => setIsPausePopupOpen(!isPausePopupOpen)}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
            </svg>
          </button>
          
          {/* Pause Popup */}
          {isPausePopupOpen && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-2">
                {/* 0.5s pause */}
                <button 
                  onClick={() => setIsPausePopupOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
                  </svg>
                  <span className="text-sm text-black">0.5s pause</span>
                </button>
                
                {/* 1s pause */}
                <button 
                  onClick={() => setIsPausePopupOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
                  </svg>
                  <span className="text-sm text-black">1s pause</span>
                </button>
                
                {/* 2s pause */}
                <button 
                  onClick={() => setIsPausePopupOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
                  </svg>
                  <span className="text-sm text-black">2s pause</span>
                </button>
                
                {/* 5s pause */}
                <button 
                  onClick={() => setIsPausePopupOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
                  </svg>
                  <span className="text-sm text-black">5s pause</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Tooltip (only show when popup is closed) */}
          {!isPausePopupOpen && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Add a pause to the script
          </div>
          )}
        </div>

        {/* Move Button */}
        <div className="relative group">
          <button 
            onClick={insertMoveMarker}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
              <circle cx="18" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="3" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="3" y1="18" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Add animation marker to the script
          </div>
        </div>

        {/* Hand Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-400">
              <path fill="currentColor" d="M18.634 2.322a.75.75 0 0 1 1.044-.188c.808.561 1.478 1.544 1.898 2.627c.424 1.094.63 2.384.413 3.618a.75.75 0 1 1-1.478-.258c.16-.913.013-1.924-.334-2.818c-.35-.906-.869-1.6-1.355-1.937a.75.75 0 0 1-.188-1.044Zm-9.046.551a2.048 2.048 0 0 0-3.721 1.13a2.015 2.015 0 0 0-1.929 2.649l1.96 5.921a4.794 4.794 0 0 0-1.788.2a3.906 3.906 0 0 0-1.764 1.154a1.41 1.41 0 0 0-.271 1.42c.153.433.494.78.911.97c1.415.642 4.274 2.118 6.752 4.487c1.025.98 2.521 1.473 3.963 1.042l2.587-.775a2.665 2.665 0 0 0 1.892-2.183c.144-1.051.32-2.641.32-4.138c0-1.764-.456-3.708-1-5.41a37.425 37.425 0 0 0-1.625-4.151a2.051 2.051 0 0 0-2.277-1.142c-.29.058-.551.171-.778.326l-.155-.486a2 2 0 0 0-3.077-1.014Zm-1.156 1l.404 1.176c.01.033.02.066.032.1l1.673 4.846a.75.75 0 0 0 1.166.35l.016-.013a.75.75 0 0 0 .236-.827L10.272 4.61a.5.5 0 0 1 .964-.265l.724 2.267c.012.05.026.1.042.151l.87 2.703l.163.513a.75.75 0 1 0 1.43-.457l-.165-.513l-.89-2.786a.61.61 0 0 1 .482-.704a.552.552 0 0 1 .62.299c.41.889 1.037 2.346 1.559 3.98c.525 1.643.93 3.416.93 4.953c0 1.396-.166 2.91-.307 3.935c-.06.44-.381.813-.836.949l-2.588.774c-.844.253-1.796-.02-2.495-.688c-2.65-2.535-5.681-4.094-7.169-4.77a.279.279 0 0 1-.098-.072c.232-.255.572-.52 1.059-.676c.51-.163 1.233-.224 2.244.038a.75.75 0 0 0 .9-.962L5.362 6.181a.515.515 0 0 1 .979-.324l1.438 4.346l.258.785a.75.75 0 1 0 1.426-.474l-.259-.781l-1.81-5.51a.547.547 0 0 1 1.038-.35Zm9.867.366A.75.75 0 0 0 17.2 5.26c.418.449.799.99.799 1.99a.75.75 0 0 0 1.5 0c0-1.502-.623-2.391-1.201-3.012Z"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            No avatar selected
          </div>
        </div>

        {/* Translate Button */}
        <div className="relative group">
          <button 
            onClick={() => setIsDictionaryModalOpen(true)}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256">
              <path fill="currentColor" d="m239.15 212.42l-56-112a8 8 0 0 0-14.31 0l-21.71 43.43A88 88 0 0 1 100 126.93A103.65 103.65 0 0 0 127.69 64H152a8 8 0 0 0 0-16H96V32a8 8 0 0 0-16 0v16H24a8 8 0 0 0 0 16h87.63A87.76 87.76 0 0 1 88 116.35a87.74 87.74 0 0 1-19-31a8 8 0 1 0-15.08 5.34A103.63 103.63 0 0 0 76 127a87.55 87.55 0 0 1-52 17a8 8 0 0 0 0 16a103.46 103.46 0 0 0 64-22.08a104.18 104.18 0 0 0 51.44 21.31l-26.6 53.19a8 8 0 0 0 14.31 7.16L140.94 192h70.11l13.79 27.58A8 8 0 0 0 232 224a8 8 0 0 0 7.15-11.58ZM148.94 176L176 121.89L203.05 176Z"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Pronounciations
          </div>
        </div>

        {/* Grey Vertical Line */}
        <div className="h-6 w-px bg-gray-300 mx-0.5"></div>

        {/* Play Button */}
        <div className="relative group">
          <button 
            onClick={handlePlay}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path fill="currentColor" d="M4.608 3.063C4.345 2.895 4 3.089 4 3.418v9.167c0 .329.345.523.608.356l7.2-4.584a.426.426 0 0 0 0-.711zm.538-.844l7.2 4.583a1.426 1.426 0 0 1 0 2.399l-7.2 4.583C4.21 14.38 3 13.696 3 12.585V3.418C3 2.307 4.21 1.624 5.146 2.22"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Play audio
          </div>
        </div>
        </>
        ) : (
          // Playing state toolbar with timer and stop button
          <>
            {/* Timer Display */}
            <div className="text-sm text-gray-700 font-mono px-2">
              {formatTime(playTime)}
            </div>
            
            {/* Divider Line */}
            <div className="w-32 mx-4 h-px bg-gray-300"></div>
            
            {/* Stop Button */}
            <div className="relative group">
              <button 
                onClick={handleStop}
                className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors border-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                  <path fill="currentColor" fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16a8 8 0 0 0 0 16ZM8 7a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H8Z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}