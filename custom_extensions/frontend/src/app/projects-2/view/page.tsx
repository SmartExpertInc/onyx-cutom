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
        {/* Sidebar - 40% width */}
        <div className="w-[40%] h-full bg-white border border-gray-300">
          <Sidebar />
        </div>

        {/* Main Container - 60% width */}
        <div className="w-[60%] h-full flex flex-col gap-4 bg-gray-50 p-4">
          {/* Top Container - 80% height */}
          <div className="h-[80%] bg-gray-200 rounded-lg shadow-sm border border-gray-300 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Content Area (80% height)</h2>
            <p className="text-sm text-gray-600">This is the top container taking 80% of the main container's height.</p>
          </div>

          {/* Bottom Container - 20% height */}
          <div className="h-[20%] bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Bottom Content Area (20% height)</h2>
            <p className="text-sm text-gray-600">This is the bottom container taking 20% of the main container's height.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
