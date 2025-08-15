import React from 'react';
import { Button } from './ui/button';

export function LeftSidebar() {
  return (
    <div className="w-72 lg:w-80 bg-background border-r border-border flex flex-col flex-shrink-0">
      {/* Avatar Selection */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-20 h-11 bg-accent rounded-lg flex items-center justify-center relative">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/25754df26bea4537d5d743978026d0a6812e4ed7?width=72" 
              alt="Avatar" 
              className="w-9 h-9 rounded-lg object-cover"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs text-text-light">
              2
            </div>
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/ad3b604e583b1053aaa9cb6aa8eae3d12ad5b9be?width=40" 
              alt="Flag" 
              className="w-5 h-5"
            />
            <span>US-Leesa</span>
          </Button>
        </div>
      </div>
      
      {/* Content Description */}
      <div className="flex-1 p-4 lg:p-6">
        <p className="text-sm lg:text-base text-text-light leading-relaxed">
          Create dynamic, powerful and informative videos with an
          avatar as your host. Instantly translate your video into over
          eighty languages, use engaging media to grab your
          audiences attention, or even simulate conversations between
          multiple avatars. All with an intuitive interface that anyone
          can use!
        </p>
      </div>
    </div>
  );
}
