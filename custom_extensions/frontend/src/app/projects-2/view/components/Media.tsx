import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MediaProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  displayMode?: 'modal' | 'popup';
  className?: string;
}

export default function Media({ 
  isOpen, 
  onClose, 
  title, 
  displayMode = 'modal',
  className = ''
}: MediaProps) {
  const { t } = useLanguage();
  const defaultTitle = t('panels.media.chooseMedia', 'Choose Media');
  const popupRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<string>('image');
  const [isLocationsExpanded, setIsLocationsExpanded] = useState<boolean>(false);

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

  if (!isOpen) return null;

  const content = (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white p-[18px] flex flex-col">
        {/* My assets section */}
        <div className="mb-5">
          <h4 className="font-medium text-[#878787] mb-2" style={{ fontSize: '10px' }}>{t('panels.media.myAssets', 'My assets')}</h4>
          <div 
            onClick={() => setSelectedOption('library')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer transition-colors border" 
            style={selectedOption === 'library' ? { backgroundColor: '#E6E6E6', borderColor: '#E6E6E6' } : { borderColor: '#E6E6E6' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.33301 5.33464V12.668C1.33301 13.4013 1.93301 14.0013 2.66634 14.0013H11.9997M5.33301 11.3346H13.333C13.6866 11.3346 14.0258 11.1942 14.2758 10.9441C14.5259 10.6941 14.6663 10.3549 14.6663 10.0013V6.0013C14.6663 5.64768 14.5259 5.30854 14.2758 5.05849C14.0258 4.80844 13.6866 4.66797 13.333 4.66797H10.713C10.4934 4.66683 10.2775 4.61147 10.0844 4.5068C9.89134 4.40212 9.72712 4.25138 9.60634 4.06797L9.05967 3.26797C8.93889 3.08455 8.77467 2.93381 8.58161 2.82914C8.38855 2.72447 8.17262 2.6691 7.95301 2.66797H5.33301C4.97939 2.66797 4.64025 2.80844 4.3902 3.05849C4.14015 3.30854 3.99967 3.64768 3.99967 4.0013V10.0013C3.99967 10.7346 4.59967 11.3346 5.33301 11.3346Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs text-black">{t('panels.media.library', 'Library')}</span>
          </div>
        </div>

        {/* Stock assets section */}
        <div className="mb-6 flex-1">
          <h4 className="font-medium text-[#878787] mb-2" style={{ fontSize: '10px' }}>{t('panels.media.stockAssets', 'Stock assets')}</h4>
          
          <div className="flex flex-col gap-2">
            {/* Image option */}
            <div 
              onClick={() => setSelectedOption('image')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer transition-colors border" 
            style={selectedOption === 'image' ? { backgroundColor: '#E6E6E6', borderColor: '#E6E6E6' } : { borderColor: '#E6E6E6' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 10L11.9427 7.94267C11.6926 7.69271 11.3536 7.55229 11 7.55229C10.6464 7.55229 10.3074 7.69271 10.0573 7.94267L4 14M3.33333 2H12.6667C13.403 2 14 2.59695 14 3.33333V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2ZM7.33333 6C7.33333 6.73638 6.73638 7.33333 6 7.33333C5.26362 7.33333 4.66667 6.73638 4.66667 6C4.66667 5.26362 5.26362 4.66667 6 4.66667C6.73638 4.66667 7.33333 5.26362 7.33333 6Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs text-black">{t('panels.media.image', 'Image')}</span>
            </div>

            {/* Video option */}
            <div 
              onClick={() => setSelectedOption('video')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer transition-colors border" 
              style={selectedOption === 'video' ? { backgroundColor: '#E6E6E6', borderColor: '#E6E6E6' } : { borderColor: '#E6E6E6' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6663 5.33333L10.6663 8L14.6663 10.6667V5.33333Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.33301 4H2.66634C1.92996 4 1.33301 4.59695 1.33301 5.33333V10.6667C1.33301 11.403 1.92996 12 2.66634 12H9.33301C10.0694 12 10.6663 11.403 10.6663 10.6667V5.33333C10.6663 4.59695 10.0694 4 9.33301 4Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-black">{t('panels.media.video', 'Video')}</span>
            </div>

            {/* Music option */}
            <div 
              onClick={() => setSelectedOption('music')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer transition-colors border" 
              style={selectedOption === 'music' ? { backgroundColor: '#E6E6E6', borderColor: '#E6E6E6' } : { borderColor: '#E6E6E6' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-black">{t('panels.media.music', 'Music')}</span>
            </div>

            {/* Icon option */}
            <div 
              onClick={() => setSelectedOption('icon')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer transition-colors border" 
              style={selectedOption === 'icon' ? { backgroundColor: '#E6E6E6', borderColor: '#E6E6E6' } : { borderColor: '#E6E6E6' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.99967 1.33203L10.0597 5.50536L14.6663 6.1787L11.333 9.42537L12.1197 14.012L7.99967 11.8454L3.87967 14.012L4.66634 9.42537L1.33301 6.1787L5.93967 5.50536L7.99967 1.33203Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs text-black">{t('panels.media.icon', 'Icon')}</span>
            </div>

            {/* AI image option */}
            <div 
              onClick={() => setSelectedOption('aiImage')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer transition-colors border" 
              style={selectedOption === 'aiImage' ? { backgroundColor: '#E6E6E6', borderColor: '#E6E6E6' } : { borderColor: '#E6E6E6' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.58594 2.75586C6.00911 4.12151 6.51585 5.07368 7.25879 5.81543C8.00135 6.55616 8.95431 7.06019 10.3203 7.4834C8.95426 7.90548 8.00221 8.41012 7.25879 9.15234C6.51626 9.89434 6.01008 10.8462 5.58594 12.2119C5.19223 10.941 4.72808 10.0286 4.06543 9.30957L3.91406 9.15234L3.75684 9.00098C3.0379 8.34124 2.1246 7.87724 0.853516 7.4834C2.21905 7.06141 3.1708 6.55738 3.91406 5.81543V5.81445C4.65643 5.07263 5.16185 4.12104 5.58594 2.75586ZM10.7627 1.35254C10.8794 1.54881 11.0138 1.72706 11.1738 1.88672C11.3327 2.0453 11.5101 2.17805 11.7051 2.29395C11.5093 2.41021 11.3322 2.54494 11.1729 2.7041C11.0136 2.86321 10.879 3.04001 10.7627 3.23535C10.6461 3.03958 10.5112 2.86245 10.3516 2.70312C10.1924 2.54428 10.0157 2.40997 9.82031 2.29395C10.0158 2.1778 10.1934 2.04467 10.3525 1.88574C10.5122 1.72632 10.6462 1.54833 10.7627 1.35254Z" stroke="#171718"/>
              </svg>
              <span className="text-xs text-black">{t('panels.media.aiImage', 'AI image')}</span>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="space-y-3">
          {/* Upload button */}
          <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 5.33333L8 2M8 2L4.66667 5.33333M8 2V10" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm" style={{ color: '#171718' }}>{t('panels.media.upload', 'Upload')}</span>
          </button>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-gray-200"></div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Search bar and upload button */}
        <div className="flex items-center gap-6 pb-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Magnifying glass icon */}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 10.5L8.11111 8.11111M9.38889 4.94444C9.38889 7.39904 7.39904 9.38889 4.94444 9.38889C2.48985 9.38889 0.5 7.39904 0.5 4.94444C0.5 2.48985 2.48985 0.5 4.94444 0.5C7.39904 0.5 9.38889 2.48985 9.38889 4.94444Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('panels.media.searchPlaceholder', 'Search media library')}
              className="w-full pl-[30px] pr-4 py-1.5 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                borderColor: '#E0E0E0',
                boxShadow: '0px 1px 2px 0px #0000000D',
                color: '#171718'
              }}
            />
            <style jsx>{`
              input::placeholder {
                color: #878787;
                font-size: 12px;
              }
            `}</style>
          </div>
          
          {/* Upload to Library button - only show when Library is selected */}
          {selectedOption === 'library' && (
            <button className="flex items-center px-4 py-1.5 bg-white rounded-md hover:bg-gray-50 transition-colors border" style={{ borderColor: '#171718' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 5.33333L8 2M8 2L4.66667 5.33333M8 2V10" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.media.uploadToLibrary', 'Upload to Library')}</span>
            </button>
          )}
        </div>
        
        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-2">
          {selectedOption === 'library' ? (
            /* Library view - Simple grid of 18 rectangles */
            <div className="grid grid-cols-3 gap-3 pb-4">
              {Array.from({ length: 18 }).map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-md w-full" style={{ aspectRatio: '16/9' }}></div>
              ))}
            </div>
          ) : selectedOption === 'image' ? (
            /* Image view - Categorized groups */
            <div className="flex flex-col gap-5 pb-4">
              {/* Locations Group */}
              <div>
                <h3 className="text-xs font-medium text-[#171718] mb-2.5">{t('panels.media.locations', 'Locations')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* First 2 rectangles */}
                  <div className="bg-gray-200 rounded-md w-full" style={{ aspectRatio: '16/9' }}></div>
                  <div className="bg-gray-200 rounded-md w-full" style={{ aspectRatio: '16/9' }}></div>
                  
                  {/* Last rectangle - clickable with "+ 6" or more rectangles when expanded */}
                  {!isLocationsExpanded ? (
                    <div 
                      onClick={() => setIsLocationsExpanded(true)}
                      className="bg-gray-200 rounded-md w-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors" 
                      style={{ aspectRatio: '16/9' }}
                    >
                      <span className="text-base font-semibold text-[#171718]">+ 6</span>
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-md w-full" style={{ aspectRatio: '16/9' }}></div>
                  )}
                </div>
                
                {/* Additional rows when expanded */}
                {isLocationsExpanded && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="bg-gray-200 rounded-md w-full" style={{ aspectRatio: '16/9' }}></div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Images Group */}
              <div>
                <h3 className="text-xs font-medium text-[#171718] mb-2.5">{t('panels.media.allImages', 'All images')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* 4 rows of 3 rectangles = 12 rectangles */}
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-md w-full" style={{ aspectRatio: '16/9' }}></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Empty view for other options (Video, Music, Icon, AI image) */
            <div className="flex items-center justify-center h-full">
              {/* Empty for now */}
            </div>
          )}
        </div>
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
          className={`relative bg-white shadow-xl max-w-4xl w-full mx-4 z-10 h-[500px] overflow-hidden rounded-md ${className}`}
        >
          {/* Header */}
          <div className="border-b border-gray-200">
          </div>
          
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
        className={`absolute z-50 bg-white shadow-xl border border-gray-200 overflow-hidden rounded-md ${className}`}
      >
        {/* Main content area with sidebar */}
        {content}
      </div>
    );
  }

  return null;
}
