"use client";

import React from 'react';
// import { TopNavigation } from '../components/TopNavigation';
// import { LeftSidebar } from '../components/LeftSidebar';
// import { VideoPreview } from '../components/VideoPreview';
// import { Timeline } from '../components/Timeline';
import VideoEditorHeader from './components/VideoEditorHeader';
import Toolbar from './components/Toolbar';

export default function Projects2ViewPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <VideoEditorHeader />

      {/* Toolbar */}
      <Toolbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Hidden on mobile, shown on desktop */}
        {/* <div className="hidden lg:block">
          <LeftSidebar />
        </div> */}

        {/* Main Video Area */}
        {/* <div className="flex-1 flex flex-col min-h-0">
          <VideoPreview />
          <Timeline />
        </div> */}
      </div>
    </div>
  );
}
