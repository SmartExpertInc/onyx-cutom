import React from 'react';

export function Timeline() {
  return (
    <div className="h-48 sm:h-56 lg:h-64 bg-timeline-bg border-t border-border flex flex-col">
      {/* Top Toolbar */}
      <div className="h-16 lg:h-20 bg-toolbar-bg border-b border-border px-2 lg:px-6 flex items-center justify-between overflow-x-auto">
        {/* Left Tools */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 flex-shrink-0">
          {/* Script (Active) */}
          <div className="flex flex-col items-center space-y-1 lg:space-y-2 p-2 lg:p-3 bg-accent rounded-lg border-2 border-purple-accent">
            <div className="w-5 h-4 lg:w-7 lg:h-6">
              <svg width="20" height="16" viewBox="0 0 27 25" fill="none" className="w-full h-full">
                <rect x="2" y="2" width="23" height="21" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M6 8h15M6 12h12M6 16h8" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-xs lg:text-sm text-text-light hidden sm:block">Script</span>
          </div>
          
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-5 h-7">
              <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
                <circle cx="10" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 25c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Avatar</span>
          </div>
          
          {/* Background */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6">
              <svg width="24" height="23" viewBox="0 0 24 23" fill="none">
                <rect x="1" y="1" width="22" height="21" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M16 15l-4-4-4 4v6h8v-6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Background</span>
          </div>
          
          {/* Shapes */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-7 h-7">
              <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <polygon points="13.5,15 18,25 9,25" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Shapes</span>
          </div>
          
          {/* Media */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <polygon points="10,8 16,12 10,16" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Media</span>
          </div>
          
          {/* Text */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-7 h-5">
              <svg width="27" height="21" viewBox="0 0 27 21" fill="none">
                <path d="M2 4h23M8 4v15M19 4v15M5 19h6M16 19h6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Text</span>
          </div>
          
          {/* Music */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6">
              <svg width="23" height="25" viewBox="0 0 23 25" fill="none">
                <path d="M7 20a3 3 0 100-6 3 3 0 000 6zM21 18a3 3 0 100-6 3 3 0 000 6zM21 12V3l-14 4v11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Music</span>
          </div>
        </div>
        
        {/* Right Tools - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-8">
          {/* Transition */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-7 h-6">
              <svg width="27" height="23" viewBox="0 0 27 23" fill="none">
                <rect x="2" y="2" width="8" height="19" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <rect x="17" y="2" width="8" height="19" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M12 8l3 3-3 3M12 11h3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Transition</span>
          </div>
          
          {/* Interaction */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-5 h-7">
              <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
                <path d="M9 1v24M4 6l5-5 5 5M4 20l5 5 5-5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Interaction</span>
          </div>
          
          {/* Comments */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-7 h-7">
              <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
                <rect x="2" y="2" width="25" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M7 14l4 4 4-4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-sm text-text-light">Comments</span>
          </div>
        </div>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 p-2 lg:p-4 flex items-center space-x-2 lg:space-x-4 overflow-x-auto min-h-0">
        {/* Timeline Ruler */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gray-400 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 lg:w-5 lg:h-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <polygon points="8,5 12,10 8,15" fill="white"/>
              </svg>
            </div>
          </div>
          <span className="text-xs lg:text-sm text-text-light">00:22</span>
        </div>

        {/* Scene Preview */}
        <div className="relative flex-shrink-0">
          <div className="w-48 h-24 sm:w-52 sm:h-28 lg:w-60 lg:h-36 bg-gray-300 rounded border-2 border-purple-accent overflow-hidden">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/a074f439078468298188cf5e050225513d5642e2?width=218"
              alt="Scene preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 lg:bottom-2 left-1 lg:left-2">
              <span className="text-xs text-gray-600">Enter vie...</span>
            </div>
            <div className="absolute bottom-1 lg:bottom-2 left-4 lg:left-6">
              <div className="w-5 h-2 lg:w-7 lg:h-3 bg-gray-400 rounded"></div>
            </div>
          </div>
        </div>

        {/* Add Scene */}
        <div className="w-48 h-24 sm:w-52 sm:h-28 lg:w-60 lg:h-36 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center flex-shrink-0">
          <div className="w-4 h-4 lg:w-5 lg:h-5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Scene Label */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-sm lg:text-lg text-text-light">Scene 1</span>
          <div className="w-4 h-4 lg:w-5 lg:h-5">
            <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
              <circle cx="10" cy="9.5" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M7 9.5l2.5 2.5L15 6.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
        
        {/* Bottom Control Bar - Only on desktop */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-16 bg-background border-t border-border px-6">
          <div className="flex items-center justify-between h-full">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-6 h-6 opacity-60">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="1" y="1" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
              ))}
              <div className="w-0.5 h-5 bg-border"></div>
              <div className="w-6 h-5">
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                  <rect x="1" y="2" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div className="w-0.5 h-5 bg-border"></div>
              <div className="w-4 h-5">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path d="M1 19v-6l7-7 7 7v6H1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}