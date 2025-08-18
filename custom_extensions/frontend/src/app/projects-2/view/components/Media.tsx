import { useState, useRef, useEffect } from 'react';

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
  title = "Choose Media", 
  displayMode = 'modal',
  className = ''
}: MediaProps) {
  const popupRef = useRef<HTMLDivElement>(null);

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
      <div className="w-64 bg-white p-4 flex flex-col" style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
        {/* My assets section */}
        <div className="mb-3 pt-6">
          <h4 className="text-sm font-medium text-black mb-1 px-3">My assets</h4>
          <div className="flex items-center px-3 py-2 bg-gray-200 rounded-lg cursor-pointer transition-colors">
            {/* Folder icon */}
            <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm text-black">Library</span>
          </div>
        </div>

        {/* Stock assets section */}
        <div className="mb-6 flex-1">
          <h4 className="text-sm font-medium text-black mb-1 px-3">Stock assets</h4>
          
          {/* Image option */}
          <div className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors mb-2">
            <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-black">Image</span>
          </div>

          {/* Video option */}
          <div className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors mb-2">
            <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="4" ry="4" strokeWidth="2" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" />
            </svg>
            <span className="text-sm text-black">Video</span>
          </div>

          {/* AI image option */}
          <div className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <svg className="w-5 h-5 text-black mr-3" fill="currentColor" viewBox="0 0 24 24">
              {/* Main sparkle - 4-pointed star */}
              <path d="M12 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
              {/* Small sparkle - top right */}
              <path d="M18 5l1 2 2 0-1.5 1.5 0.5 2-1.5-1-1.5 1 0.5-2-1.5-1.5 2 0z" opacity="0.6" />
              {/* Tiny sparkle - bottom left */}
              <circle cx="6" cy="18" r="1" opacity="0.4" />
              {/* Cross sparkle - top left */}
              <path d="M5 8v-2M5 8v2M3 8h2M7 8h-2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
            </svg>
            <span className="text-sm text-black">AI image</span>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="space-y-3">
          {/* Upload button */}
          <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8l0 8M8 12l4-4 4 4" />
            </svg>
            <span className="text-sm text-gray-700">Upload</span>
          </button>

          {/* Record button */}
          <button className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="white" stroke="#ef4444" strokeWidth="1" />
              <circle cx="12" cy="12" r="6" fill="#ef4444" />
            </svg>
            <span className="text-sm text-gray-700">Record</span>
          </button>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-gray-200"></div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="relative border-b border-gray-200">
          <div className="flex px-6 pt-6">
            <button className="relative px-4 py-2 text-sm font-medium text-gray-900 mr-8">
              Media library
              {/* Active tab indicator */}
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-black"></div>
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Brand kit
            </button>
          </div>
        </div>
        
        {/* Search bar and upload button */}
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Magnifying glass icon */}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search media library"
              className="w-full pl-10 pr-4 py-1.5 border border-gray-400 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Upload button */}
          <button className="flex items-center px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8l0 8M8 12l4-4 4 4" />
            </svg>
            <span className="text-sm font-medium">Upload to Library</span>
          </button>
        </div>
        
        {/* Tab content */}
        <div className="flex-1 p-6 pb-8 overflow-y-auto">
          {/* Demo rectangles in three columns */}
          <div className="grid grid-cols-3 gap-4 pb-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="bg-gray-200 rounded-lg h-32"></div>
              <div className="bg-gray-200 rounded-lg h-24"></div>
              <div className="bg-gray-200 rounded-lg h-40"></div>
              <div className="bg-gray-200 rounded-lg h-28"></div>
              <div className="bg-gray-200 rounded-lg h-36"></div>
              <div className="bg-gray-200 rounded-lg h-32"></div>
              <div className="bg-gray-200 rounded-lg h-44"></div>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-4">
              <div className="bg-gray-200 rounded-lg h-36"></div>
              <div className="bg-gray-200 rounded-lg h-32"></div>
              <div className="bg-gray-200 rounded-lg h-20"></div>
              <div className="bg-gray-200 rounded-lg h-44"></div>
              <div className="bg-gray-200 rounded-lg h-28"></div>
              <div className="bg-gray-200 rounded-lg h-40"></div>
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
            
            {/* Column 3 */}
            <div className="space-y-4">
              <div className="bg-gray-200 rounded-lg h-28"></div>
              <div className="bg-gray-200 rounded-lg h-36"></div>
              <div className="bg-gray-200 rounded-lg h-24"></div>
              <div className="bg-gray-200 rounded-lg h-32"></div>
              <div className="bg-gray-200 rounded-lg h-40"></div>
              <div className="bg-gray-200 rounded-lg h-28"></div>
              <div className="bg-gray-200 rounded-lg h-36"></div>
            </div>
          </div>
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
          className={`relative bg-white shadow-xl max-w-4xl w-full mx-4 z-10 h-[500px] ${className}`}
          style={{ borderRadius: '12px' }}
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
        className={`absolute z-50 bg-white shadow-xl border border-gray-200 ${className}`} 
        style={{ borderRadius: '12px' }}
      >
        {/* Main content area with sidebar */}
        {content}
      </div>
    );
  }

  return null;
}
