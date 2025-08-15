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
    <div className="h-screen bg-background flex flex-col p-2">
      {/* Header */}
      <VideoEditorHeader />

      {/* Toolbar */}
      <Toolbar />
      
      {/* Main Content Area - Horizontal layout under toolbar */}
      {/* Calculate available height: 100vh - header (68px) - toolbar (72px) = calc(100vh - 140px) */}
      <div className="flex gap-4 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Sidebar - 30% width, full height of available space */}
        <div className="w-[30%] h-full border border-gray-300">
          <Sidebar />
        </div>

        {/* Main Container - 70% width, full height of available space */}
        <div className="w-[70%] h-full flex flex-col gap-4 p-4">
          {/* Top Container - Takes 70% of main container height */}
          <div className="bg-gray-200 rounded-lg border border-gray-300 overflow-auto" style={{ height: '70%' }}>
          </div>

          {/* Bottom Container - Takes 30% of main container height */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto" style={{ height: '30%' }}>
          </div>
        </div>
      </div>
    </div>
  );
}
