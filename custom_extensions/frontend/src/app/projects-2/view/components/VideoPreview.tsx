import React from 'react';

export function VideoPreview() {
  return (
    <div className="flex-1 bg-gray-200 relative overflow-hidden">
      {/* Background Image */}
      <img 
        src="https://api.builder.io/api/v1/image/assets/TEMP/f25704cfa163864e19a1bb3142414e7d7f8039a2?width=1184" 
        alt="Video background" 
        className="w-full h-full object-cover"
      />
      
      {/* Video Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent">
        {/* Main Content Area */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xs sm:max-w-lg lg:max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-xl">
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8 leading-tight">
              Enter video
              <br />
              title here...
            </h1>

            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="w-8 h-8 sm:w-10 h-10 lg:w-12 lg:h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-sm"></div>
              </div>
              <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-700">Logo</span>
            </div>
          </div>
        </div>
        
        {/* Video Controls - Top Right - Hidden on mobile */}
        <div className="hidden lg:block absolute top-4 lg:top-8 right-4 lg:right-8">
          <div className="w-10 lg:w-14 h-24 lg:h-36 bg-black/80 rounded-lg border border-gray-600 flex flex-col items-center justify-center">
            <div className="w-3 lg:w-4 h-16 lg:h-24 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}