'use client';

import { useState, useEffect } from 'react';
import { Gem, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onGenerationStart?: () => void;
  generationStatus?: 'idle' | 'generating' | 'completed' | 'error';
  generationError?: string | null;
}

export default function GenerateModal({ 
  isOpen, 
  onClose, 
  title, 
  onGenerationStart,
  generationStatus = 'idle',
  generationError
}: GenerateModalProps) {
  const { t } = useLanguage();
  const [videoTitle, setVideoTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSubtitleDropdownOpen, setIsSubtitleDropdownOpen] = useState(false);
  const [selectedSubtitleOption, setSelectedSubtitleOption] = useState(t('modals.generate.selectSubtitle', 'Select subtitle option'));
  const [isResolutionDropdownOpen, setIsResolutionDropdownOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1080p HD');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSubtitleDropdownOpen) {
        const dropdownElement = document.querySelector('[data-subtitle-dropdown]');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setIsSubtitleDropdownOpen(false);
        }
      }
      if (isResolutionDropdownOpen) {
        const dropdownElement = document.querySelector('[data-resolution-dropdown]');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setIsResolutionDropdownOpen(false);
        }
      }
    };

    if (isSubtitleDropdownOpen || isResolutionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSubtitleDropdownOpen, isResolutionDropdownOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative shadow-xl w-[600px] max-w-[95vw] flex flex-col z-10" style={{ borderRadius: '12px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        {/* Header */}
        <div className="p-6 pb-3">
          <div className="flex justify-center items-center">
            <h2 className="text-lg font-semibold text-[#171718]">{t('modals.generate.title', 'Generate video')}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Title input */}
          <div>
            <label className="block text-[10px] text-[#878787]">{t('modals.generate.titleLabel', 'Title')}</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onFocus={() => setIsEditingTitle(true)}
              className="w-full text-xs bg-transparent border-none outline-none focus:ring-0 px-0 py-1 text-[#171718] placeholder-[#171718]"
              placeholder={t('modals.generate.titlePlaceholder', 'Enter video title')}
            />
          </div>
          
          {/* Horizontal line */}
          <div className="border-t-2 border-[#171718] mb-6"></div>
          
          {/* Subtitles */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-[#171718] font-medium">{t('modals.generate.subtitles', 'Subtitles')}</span>
            <div className="relative" data-subtitle-dropdown>
              <button 
                onClick={() => setIsSubtitleDropdownOpen(!isSubtitleDropdownOpen)}
                className="bg-white text-xs hover:text-gray-800 px-3 py-1.5 border rounded-md flex items-center gap-2 cursor-pointer"
                style={{ color: '#878787', borderColor: '#E0E0E0' }}
              >
                {selectedSubtitleOption}
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown popup */}
              {isSubtitleDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#E0E0E0] rounded-md shadow-lg z-50 w-80">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedSubtitleOption(t('modals.generate.optionalSubtitles', 'Optional subtitles (SRT/VTT)'));
                        setIsSubtitleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-medium" style={{ color: '#878787' }}>{t('modals.generate.optionalSubtitles', 'Optional subtitles (SRT/VTT)')}</div>
                      <div className="text-xs" style={{ color: '#878787' }}>{t('modals.generate.optionalSubtitlesDesc', 'Can be turned on by viewers on demand')}</div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubtitleOption(t('modals.generate.burntInSubtitles', 'Burnt-in subtitles'));
                        setIsSubtitleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-medium" style={{ color: '#878787' }}>{t('modals.generate.burntInSubtitles', 'Burnt-in subtitles')}</div>
                      <div className="text-xs" style={{ color: '#878787' }}>{t('modals.generate.burntInSubtitlesDesc', "Burnt into the video, can't be disabled")}</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Resolution */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-[#171718] font-medium">{t('modals.generate.resolution', 'Resolution')}</span>
            <div className="relative" data-resolution-dropdown>
              <button 
                onClick={() => setIsResolutionDropdownOpen(!isResolutionDropdownOpen)}
                className="bg-white text-xs hover:text-gray-800 px-3 py-1.5 border rounded-md flex items-center gap-2 cursor-pointer"
                style={{ color: '#878787', borderColor: '#E0E0E0' }}
              >
                {selectedResolution}
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown popup */}
              {isResolutionDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#E0E0E0] rounded-md shadow-lg z-50 w-48">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedResolution('720p');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      {selectedResolution === '720p' ? (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                      <span className="text-xs" style={{ color: '#878787' }}>720p</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResolution('1080p HD');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      {selectedResolution === '1080p HD' ? (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                      <span className="text-xs text-[#878787]">1080p HD</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResolution('1440p HD');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      {selectedResolution === '1440p HD' ? (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: '#878787' }}>1440p HD</span>
                        <Gem className="w-4 h-4 text-purple-700" />
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResolution('2160p 4K');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      {selectedResolution === '2160p 4K' ? (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: '#878787' }}>2160p 4K</span>
                        <Gem className="w-4 h-4 text-purple-700" />
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Location */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-[#171718] font-medium">{t('modals.generate.location', 'Location')}</span>
            <button className="bg-white text-xs hover:text-gray-800 px-3 py-1.5 border rounded-md flex items-center gap-2 cursor-pointer" style={{ color: '#878787', borderColor: '#E0E0E0' }}>
              {t('modals.generate.library', 'Library')}
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Bottom buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
              style={{ border: '1px solid #719AF5', color: '#719AF5' }}
            >
              {t('modals.generate.cancel', 'Cancel')}
            </button>
            <button 
              onClick={() => {
                console.log('🎬 [GENERATE_MODAL] Start generation button clicked');
                console.log('🎬 [GENERATE_MODAL] onGenerationStart callback:', onGenerationStart);
                console.log('🎬 [GENERATE_MODAL] Current generationStatus:', generationStatus);
                onGenerationStart?.();
              }}
              disabled={generationStatus === 'generating'}
              className={`px-4 py-2 rounded-md transition-colors font-medium text-xs flex items-center gap-2 ${
                generationStatus === 'generating'
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'text-white hover:bg-[#0D4CD4] cursor-pointer'
              }`}
              style={{ backgroundColor: generationStatus === 'generating' ? undefined : '#0F58F9' }}
              title={
                generationStatus === 'generating' 
                  ? t('modals.generate.generationInProgress', 'Generation in progress...') 
                  : t('modals.generate.startVideoGeneration', 'Start video generation')
              }
            >
              {generationStatus !== 'generating' && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5423 11.3905C11.1071 11.557 10.8704 11.7949 10.702 12.2294C10.5353 11.7949 10.297 11.5586 9.86183 11.3905C10.297 11.2241 10.5337 10.9877 10.702 10.5517C10.8688 10.9861 11.1071 11.2224 11.5423 11.3905ZM10.7628 4.58943C11.1399 3.18725 11.6552 2.67169 13.0612 2.29471C11.6568 1.91825 11.1404 1.40376 10.7628 0C10.3858 1.40218 9.87044 1.91774 8.46442 2.29471C9.86886 2.67118 10.3852 3.18567 10.7628 4.58943ZM11.1732 7.48356C11.1732 7.35145 11.1044 7.19195 10.9118 7.13825C9.33637 6.69842 8.34932 6.19628 7.61233 5.4611C6.8754 4.72536 6.37139 3.73983 5.93249 2.1669C5.8787 1.97464 5.71894 1.9059 5.58662 1.9059C5.4543 1.9059 5.29454 1.97464 5.24076 2.1669C4.80022 3.73983 4.29727 4.7253 3.56092 5.4611C2.82291 6.19793 1.83688 6.70005 0.261415 7.13825C0.0688515 7.19195 0 7.35146 0 7.48356C0 7.61567 0.0688515 7.77518 0.261415 7.82888C1.83688 8.26871 2.82393 8.77085 3.56092 9.50602C4.29892 10.2428 4.80186 11.2273 5.24076 12.8002C5.29455 12.9925 5.45431 13.0612 5.58662 13.0612C5.71895 13.0612 5.87871 12.9925 5.93249 12.8002C6.37303 11.2273 6.87598 10.2418 7.61233 9.50602C8.35034 8.7692 9.33637 8.26707 10.9118 7.82888C11.1044 7.77517 11.1732 7.61567 11.1732 7.48356Z" fill="white"/>
                </svg>
              )}
              {generationStatus === 'generating' ? t('modals.generate.startingGeneration', 'Starting generation...') : t('modals.generate.startGeneration', 'Start generation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
