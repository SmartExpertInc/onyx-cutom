"use client";

import React from 'react';
// import { TopNavigation } from '../components/TopNavigation';
// import { LeftSidebar } from '../components/LeftSidebar';
// import { VideoPreview } from '../components/VideoPreview';
// import { Timeline } from '../components/Timeline';
import VideoEditorHeader from './components/VideoEditorHeader';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';

export default function Projects2ViewPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <VideoEditorHeader />

      {/* Toolbar */}
      <Toolbar />
      
      {/* Main Content Area - Horizontal layout under toolbar */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar - 30% width */}
        <div className="w-[30%] h-full bg-white border border-gray-300">
          <Sidebar />
        </div>

        {/* Main Container - 70% width */}
        <div className="w-[70%] h-full flex flex-col gap-4 p-4">
          {/* Top Container - Fixed width and 80% height */}
          <div className="h-[80%] w-[800px] bg-gray-200 rounded-lg shadow-sm border border-gray-300 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Content Area (Fixed 800px width, 80% height)</h2>
            <p className="text-sm text-gray-600">This is the top container with a fixed width of 800px and 80% of the main container's height.</p>
          </div>

          {/* Bottom Container - Fixed width and 20% height */}
          <div className="h-[20%] w-[800px] bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Bottom Content Area (Fixed 800px width, 20% height)</h2>
            <p className="text-sm text-gray-600">This is the bottom container with a fixed width of 800px and 20% of the main container's height.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
