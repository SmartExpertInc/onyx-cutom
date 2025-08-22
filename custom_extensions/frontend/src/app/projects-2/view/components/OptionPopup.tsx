import React, { useEffect, useRef } from 'react';

interface OptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function OptionPopup({ isOpen, onClose, position }: OptionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  useEffect(() => {
    if (isOpen && popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = position.x;
      let newY = position.y;
      
      // Check if popup goes beyond right edge
      if (position.x + rect.width > viewportWidth) {
        newX = viewportWidth - rect.width - 10; // 10px margin
      }
      
      // Check if popup goes beyond bottom edge
      if (position.y + rect.height > viewportHeight) {
        newY = position.y - rect.height; // Show above the click point
      }
      
      // Ensure popup doesn't go beyond left edge
      if (newX < 10) {
        newX = 10;
      }
      
      // Ensure popup doesn't go beyond top edge
      if (newY < 10) {
        newY = 10;
      }
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  const handleCommandClick = (command: string) => {
    console.log('Command clicked:', command);
    onClose();
  };

  return (
    <div 
      ref={popupRef}
      className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 min-w-[200px] py-1"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Cut */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('cut')}
      >
        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.651 14.43a3.75 3.75 0 1 0-4.302 6.143a3.75 3.75 0 0 0 4.302-6.144m0 0l3.35-4.446m5.45-7.235l-3.82 5.069m1.718 6.611a3.75 3.75 0 1 1 4.302 6.144a3.75 3.75 0 0 1-4.302-6.144m0 0L12 9.984M6.55 2.749L12 9.984"/>
        </svg>
        Cut
      </button>

      {/* Copy */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('copy')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy
      </button>

      {/* Paste */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('paste')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Paste
      </button>

      {/* Duplicate */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('duplicate')}
      >
        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path fill="currentColor" d="M28 8h2V4a2.002 2.002 0 0 0-2-2h-4v2h4zM17 2h4v2h-4zm11 9h2v4h-2zm0 7v4h-4V10a2.002 2.002 0 0 0-2-2H10V4h4V2h-4a2.002 2.002 0 0 0-2 2v4H4a2.002 2.002 0 0 0-2 2v18a2.002 2.002 0 0 0 2 2h18a2.002 2.002 0 0 0 2-2v-4h4a2.002 2.002 0 0 0 2-2v-4zm-6 10H4V10h18z"/>
        </svg>
        Duplicate
      </button>

      {/* Delete */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('delete')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>

      {/* Lock */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('lock')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Lock
      </button>

      {/* Horizontal line */}
      <div className="border-t border-gray-200 my-1"></div>

      {/* Send Backward */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('sendBackward')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Send Backward
      </button>

      {/* Send to Back */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('sendToBack')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Send to Back
      </button>

      {/* Bring Forward */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('bringForward')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Bring Forward
      </button>

      {/* Bring to Front */}
      <button 
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => handleCommandClick('bringToFront')}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Bring to Front
      </button>
    </div>
  );
}
