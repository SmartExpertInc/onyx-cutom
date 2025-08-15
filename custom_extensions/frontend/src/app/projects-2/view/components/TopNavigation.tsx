import React from 'react';
import { Button } from './ui/button';
import { MobileNavDrawer } from './MobileNavDrawer';

export function TopNavigation() {
  return (
    <div className="h-16 lg:h-20 bg-toolbar-bg border-b border-border px-2 lg:px-4 flex items-center justify-between overflow-x-auto">
      {/* Left Section */}
      <div className="flex items-center space-x-2 lg:space-x-8 flex-shrink-0">
        {/* Mobile Menu */}
        <MobileNavDrawer />

        {/* Logo */}
        <div className="w-12 h-10 bg-primary rounded flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
        </div>
        
        {/* Undo/Redo */}
        <div className="flex items-center space-x-2">
          <button className="w-5 h-4 opacity-50">
            <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
              <path d="M2 7.5L7.5 2v3h8v5h-8v3L2 7.5z" fill="currentColor"/>
            </svg>
          </button>
          <button className="w-5 h-4 opacity-50">
            <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
              <path d="M18 7.5L12.5 2v3h-8v5h8v3L18 7.5z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        {/* Vertical Separator */}
        <div className="w-0.5 h-5 bg-border"></div>
        
        {/* Resize */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-4 opacity-60">
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              <rect x="1" y="2" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="6" y="6" width="10" height="4" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <span className="text-sm text-text-light">Resize</span>
        </div>
        
        {/* Vertical Separator */}
        <div className="w-0.5 h-5 bg-border"></div>
        
        {/* Grid */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-5 opacity-60">
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
              <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="13" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="1" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="13" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span className="text-sm text-text-light">Grid</span>
        </div>
        
        {/* Vertical Separator */}
        <div className="w-0.5 h-5 bg-border"></div>
        
        {/* Upgrade Button */}
        <Button variant="outline" className="bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100">
          <span className="w-5 h-4 mr-2">⭐</span>
          Upgrade
        </Button>
      </div>
      
      {/* Center Section - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="flex items-center space-x-4">
          <span className="text-lg text-text-light">Create your first AI video</span>
          <div className="w-5 h-5 opacity-60">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
              <circle cx="10.5" cy="10.5" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M8 10.5l2.5 2.5L16 7.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
        {/* Save/Export Icons */}
        <div className="flex items-center space-x-3">
          <button className="w-4 h-5 opacity-60">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path d="M1 19v-6l7-7 7 7v6H1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </button>
          <div className="w-0.5 h-5 bg-border"></div>
        </div>
        
        {/* Share Button - Text hidden on mobile */}
        <Button variant="outline" className="bg-background border-border text-text-light hover:bg-accent">
          <span className="hidden sm:inline">Share</span>
          <span className="sm:hidden">S</span>
        </Button>

        {/* Generate Button - Text hidden on mobile */}
        <Button className="bg-video-overlay text-gray-300 hover:bg-gray-700">
          <span className="hidden sm:inline">Generate</span>
          <span className="sm:hidden">G</span>
        </Button>
        
        {/* Settings */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-light">Default</span>
          <div className="w-4 h-2 opacity-60">
            <svg width="15" height="9" viewBox="0 0 15 9" fill="none">
              <path d="M1 1l6.5 6.5L14 1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
