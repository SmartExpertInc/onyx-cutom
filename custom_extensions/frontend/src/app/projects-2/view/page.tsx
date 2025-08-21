"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import VideoEditorHeader from './components/VideoEditorHeader';
import Toolbar from './components/Toolbar';
import Script from './components/Script';
import Background from './components/Background';
import Music from './components/Music';
import Transition from './components/Transition';
import Comments from './components/Comments';
import Media from './components/Media';
import TextPopup from './components/TextPopup';
import ShapesPopup from './components/ShapesPopup';
import InteractionPopup from './components/InteractionPopup';
import InteractionModal from './components/InteractionModal';
import AiPopup from './components/AiPopup';
import LanguageVariantModal from './components/LanguageVariantModal';

interface Scene {
  id: string;
  name: string;
  order: number;
}

export default function Projects2ViewPage() {
  const [activeComponent, setActiveComponent] = useState<string>('script');
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState<boolean>(false);
  const [isTextPopupOpen, setIsTextPopupOpen] = useState<boolean>(false);
  const [isShapesPopupOpen, setIsShapesPopupOpen] = useState<boolean>(false);
  const [isInteractionPopupOpen, setIsInteractionPopupOpen] = useState<boolean>(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState<boolean>(false);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState<boolean>(false);
  const [isLanguageVariantModalOpen, setIsLanguageVariantModalOpen] = useState<boolean>(false);
  const [textPopupPosition, setTextPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shapesPopupPosition, setShapesPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [interactionPopupPosition, setInteractionPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aiPopupPosition, setAiPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Scene management state
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 'scene-1', name: 'Scene 1', order: 1 }
  ]);
  const [openMenuSceneId, setOpenMenuSceneId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Function to add a new scene
  const handleAddScene = () => {
    const newSceneNumber = scenes.length + 1;
    const newScene: Scene = {
      id: `scene-${newSceneNumber}`,
      name: `Scene ${newSceneNumber}`,
      order: newSceneNumber
    };
    
    // Add the new scene after existing scenes (at the end)
    setScenes(prevScenes => [...prevScenes, newScene]);
  };

  // Function to handle three-dot menu click
  const handleMenuClick = (sceneId: string, event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    if (openMenuSceneId === sceneId) {
      setOpenMenuSceneId(null);
      setMenuPosition(null);
    } else {
      setOpenMenuSceneId(sceneId);
      setMenuPosition({
        x: rect.right - 180, // Align to right edge of button, minus popup width
        y: rect.top - 120 // Position above the button (popup height + some spacing)
      });
    }
  };

  // Function to close menu
  const closeMenu = () => {
    setOpenMenuSceneId(null);
    setMenuPosition(null);
  };

  // Function to handle menu actions
  const handleMenuAction = (action: string, sceneId: string) => {
    console.log(`${action} for ${sceneId}`);
    // TODO: Implement actual actions
    closeMenu();
  };

  // Function to delete scene
  const handleDeleteScene = (sceneId: string) => {
    if (sceneId === 'scene-1') return; // Prevent deletion of first scene
    setScenes(prevScenes => prevScenes.filter(scene => scene.id !== sceneId));
    closeMenu();
  };

  const handleActiveToolChange = (toolId: string) => {
    if (toolId === 'media') {
      setIsMediaPopupOpen(true);
    } else {
      setActiveComponent(toolId);
      setIsMediaPopupOpen(false);
    }
    // Close text, shapes, interaction, and AI popups when switching tools
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsInteractionPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleMusicButtonClick = () => {
    setActiveComponent('music');
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsInteractionPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleTransitionButtonClick = () => {
    setActiveComponent('transition');
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsInteractionPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleTextButtonClick = (position: { x: number; y: number }) => {
    setTextPopupPosition(position);
    setIsTextPopupOpen(true);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsInteractionPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleShapesButtonClick = (position: { x: number; y: number }) => {
    setShapesPopupPosition(position);
    setIsShapesPopupOpen(true);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsInteractionPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleInteractionButtonClick = (position: { x: number; y: number }) => {
    setInteractionPopupPosition(position);
    setIsInteractionPopupOpen(true);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleInteractionModalOpen = () => {
    setIsInteractionModalOpen(true);
    setIsInteractionPopupOpen(false);
  };

  const handleInteractionModalClose = () => {
    setIsInteractionModalOpen(false);
  };

  const handleLanguageVariantModalOpen = () => {
    setIsLanguageVariantModalOpen(true);
    // Note: We don't need to close any popup here since this is triggered from the toolbar
  };

  const handleLanguageVariantModalClose = () => {
    setIsLanguageVariantModalOpen(false);
  };

  const handleAiButtonClick = (position: { x: number; y: number }) => {
    setAiPopupPosition(position);
    setIsAiPopupOpen(true);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsInteractionPopupOpen(false);
  };

  const renderSidebarComponent = () => {
    switch (activeComponent) {
      case 'script':
        return <Script onAiButtonClick={handleAiButtonClick} />;
      case 'background':
        return <Background />;
      case 'music':
        return <Music />;
      case 'transition':
        return <Transition />;
      case 'comments':
        return <Comments />;
      default:
        return <Script onAiButtonClick={handleAiButtonClick} />;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col p-2 relative" onClick={closeMenu}>
      {/* Header */}
      <VideoEditorHeader />

      {/* Toolbar */}
      <div className="-mt-1">
        <Toolbar 
          onActiveToolChange={handleActiveToolChange} 
          onTextButtonClick={handleTextButtonClick}
          onShapesButtonClick={handleShapesButtonClick}
          onInteractionButtonClick={handleInteractionButtonClick}
          onMusicButtonClick={handleMusicButtonClick}
          onTransitionButtonClick={handleTransitionButtonClick}
          onLanguageVariantModalOpen={handleLanguageVariantModalOpen}
        />
      </div>
      
      {/* Main Content Area - Horizontal layout under toolbar */}
      {/* Calculate available height: 100vh - header (68px) - toolbar (72px) = calc(100vh - 140px) */}
      <div className="flex gap-4 mt-[5px] mx-4" style={{ height: 'calc(100vh - 145px)' }}>
        {/* Sidebar - 30% width, full height of available space */}
        <div className="w-[30%] h-full overflow-visible">
          {renderSidebarComponent()}
        </div>

        {/* Main Container - 70% width, full height of available space */}
        <div className="w-[70%] h-full flex flex-col gap-2 overflow-visible">
          {/* Top Container - Takes 70% of main container height */}
          <div className="bg-gray-200 rounded-md overflow-auto" style={{ height: '80%' }}>
          </div>

          {/* Bottom Container - Takes 30% of main container height */}
          <div className="bg-white rounded-md overflow-auto p-4" style={{ height: 'calc(20% + 10px)' }}>
            <div className="flex items-center gap-4">
              {/* Play Button with Time */}
              <div className="relative flex items-center justify-center h-16">
                <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                </button>
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-sm text-gray-600">00:00</span>
              </div>

              {/* Dynamic Scene Rectangles */}
              {scenes.map((scene, index) => (
                <React.Fragment key={scene.id}>
                  <div className="relative group">
                    <div className="w-24 h-16 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center relative">
                      <div className="w-8 h-8 bg-blue-500 rounded"></div>
                      
                      {/* Three-dot menu button - visible on hover */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(scene.id, e);
                          }}
                        >
                          <svg 
                            className="w-3 h-3 text-gray-600" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <circle cx="6" cy="12" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="18" cy="12" r="2"/>
                          </svg>
                        </button>
                      </div>

                    </div>
                    <div className="absolute top-full left-0 mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium">{scene.name}</span>
                      <svg 
                        className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Transition button - show between scenes (not after the last one) */}
                  {index < scenes.length - 1 && (
                    <div className="relative group">
                      <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
                        <svg 
                          className="w-4 h-4 text-gray-600" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h5v18zm7 0q-.425 0-.712-.288T11 20q0-.425.288-.712T12 19q.425 0 .713.288T13 20q0 .425-.288.713T12 21m0-4q-.425 0-.712-.288T11 16q0-.425.288-.712T12 15q.425 0 .713.288T13 16q0 .425-.288.713T12 17m0-4q-.425 0-.712-.288T11 12q0-.425.288-.712T12 11q.425 0 .713.288T13 12q0 .425-.288.713T12 13m0-4q-.425 0-.712-.288T11 8q0-.425.288-.712T12 7q.425 0 .713.288T13 8q0 .425-.288.713T12 9m0-4q-.425 0-.712-.288T11 4q0-.425.288-.712T12 3q.425 0 .713.288T13 4q0 .425-.288.713T12 5m2 14q-.425 0-.712-.288T13 18q0-.425.288-.712T14 17q.425 0 .713.288T15 18q0 .425-.288.713T14 19m0-4q-.425 0-.712-.288T13 14q0-.425.288-.712T14 13q.425 0 .713.288T15 14q0 .425-.288.713T14 15m0-4q-.425 0-.712-.288T13 10q0-.425.288-.712T14 9q.425 0 .713.288T15 10q0 .425-.288.713T14 11m0-4q-.425 0-.712-.288T13 6q0-.425.288-.712T14 5q.425 0 .713.288T15 6q0 .425-.288.713T14 7m2 14q-.425 0-.712-.288T15 20q0-.425.288-.712T16 19q.425 0 .713.288T17 20q0 .425-.288.713T16 21m0-4q-.425 0-.712-.288T15 16q0-.425.288-.712T16 15q.425 0 .713.288T17 16q0 .425-.288.713T16 17m0-4q-.425 0-.712-.288T15 12q0-.425.288-.712T16 11q.425 0 .713.288T17 12q0 .425-.288.713T16 13m0-4q-.425 0-.712-.288T15 8q0-.425.288-.712T16 7q.425 0 .713.288T17 8q0 .425-.288.713T16 9m0-4q-.425 0-.712-.288T15 4q0-.425.288-.712T16 3q.425 0 .713.288T17 4q0 .425-.288.713T16 5m2 14q-.425 0-.712-.288T17 18q0-.425.288-.712T18 17q.425 0 .713.288T19 18q0 .425-.288.713T18 19m0-4q-.425 0-.712-.288T17 14q0-.425.288-.712T18 13q.425 0 .713.288T19 14q0 .425-.288.713T18 15m0-4q-.425 0-.712-.288T17 10q0-.425.288-.712T18 9q.425 0 .713.288T19 10q0 .425-.288.713T18 11m0-4q-.425 0-.712-.288T17 6q0-.425.288-.712T18 5q.425 0 .713.288T19 6q0 .425-.288.713T18 7m2 14q-.425 0-.712-.288T19 20q0-.425.288-.712T20 19q.425 0 .713.288T21 20q0 .425-.288.713T20 21m0-4q-.425 0-.712-.288T19 16q0-.425.288-.712T20 15q.425 0 .713.288T21 16q0 .425-.288.713T20 17m0-4q-.425 0-.712-.288T19 12q0-.425.288-.712T20 11q.425 0 .713.288T21 12q0 .425-.288.713T20 13m0-4q-.425 0-.712-.288T19 8q0-.425.288-.712T20 7q.425 0 .713.288T21 8q0 .425-.288.713T20 9m0-4q-.425 0-.712-.288T19 4q0-.425.288-.712T20 3q.425 0 .713.288T21 4q0 .425-.288.713T20 5"/>
                        </svg>
                      </button>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Add transition
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Add Scene Rectangle */}
              <div 
                className="w-24 h-16 bg-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
                onClick={handleAddScene}
              >
                <svg 
                  className="w-8 h-8 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Popup */}
      <Media 
        isOpen={isMediaPopupOpen} 
        onClose={() => setIsMediaPopupOpen(false)} 
        title="Media Library"
        displayMode="popup"
        className="top-[150px] left-2 w-[800px] h-[400px]"
      />

      {/* Text Popup */}
      <TextPopup 
        isOpen={isTextPopupOpen} 
        onClose={() => setIsTextPopupOpen(false)} 
        position={textPopupPosition}
      />

      {/* Shapes Popup */}
      <ShapesPopup 
        isOpen={isShapesPopupOpen} 
        onClose={() => setIsShapesPopupOpen(false)} 
        position={shapesPopupPosition}
      />

      {/* Interaction Popup */}
      <InteractionPopup 
        isOpen={isInteractionPopupOpen} 
        onClose={() => setIsInteractionPopupOpen(false)} 
        position={interactionPopupPosition}
        onModalOpen={handleInteractionModalOpen}
      />

      {/* Interaction Modal */}
      <InteractionModal 
        isOpen={isInteractionModalOpen} 
        onClose={handleInteractionModalClose}
      />

      {/* AI Popup */}
      <AiPopup 
        isOpen={isAiPopupOpen} 
        onClose={() => setIsAiPopupOpen(false)} 
        position={aiPopupPosition}
      />

      {/* Language Variant Modal */}
      <LanguageVariantModal 
        isOpen={isLanguageVariantModalOpen}
        onClose={handleLanguageVariantModalClose}
      />

      {/* Portal Popup Menu */}
      {openMenuSceneId && menuPosition && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 min-w-[180px] py-1"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <button 
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            onClick={() => handleMenuAction('Save as Scene Layout', openMenuSceneId)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M7.558 3.75H7.25a3.5 3.5 0 0 0-3.5 3.5v9.827a3.173 3.173 0 0 0 3.173 3.173v0m.635-16.5v2.442a2 2 0 0 0 2 2h2.346a2 2 0 0 0 2-2V3.75m-6.346 0h6.346m0 0h.026a3 3 0 0 1 2.122.879l3.173 3.173a3.5 3.5 0 0 1 1.025 2.475v6.8a3.173 3.173 0 0 1-3.173 3.173v0m-10.154 0V15a3 3 0 0 1 3-3h4.154a3 3 0 0 1 3 3v5.25m-10.154 0h10.154"/>
            </svg>
            Save as Scene Layout
          </button>
          <button 
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            onClick={() => handleMenuAction('Duplicate Scene', openMenuSceneId)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
              <g>
                <path d="M19.4 20H9.6a.6.6 0 0 1-.6-.6V9.6a.6.6 0 0 1 .6-.6h9.8a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6Z"/>
                <path d="M15 9V4.6a.6.6 0 0 0-.6-.6H4.6a.6.6 0 0 0-.6.6v9.8a.6.6 0 0 0 .6.6H9"/>
              </g>
            </svg>
            Duplicate Scene
          </button>
          <button 
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            onClick={() => handleMenuAction('Insert Scene', openMenuSceneId)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z"/>
            </svg>
            Insert Scene
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button 
            className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
              openMenuSceneId === 'scene-1' 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleDeleteScene(openMenuSceneId)}
            disabled={openMenuSceneId === 'scene-1'}
          >
            <svg className="w-4 h-4" fill="currentColor" fillRule="evenodd" viewBox="0 0 16 16">
              <path d="M9 2H7a.5.5 0 0 0-.5.5V3h3v-.5A.5.5 0 0 0 9 2m2 1v-.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2V3H2.251a.75.75 0 0 0 0 1.5h.312l.317 7.625A3 3 0 0 0 5.878 15h4.245a3 3 0 0 0 2.997-2.875l.318-7.625h.312a.75.75 0 0 0 0-1.5zm.936 1.5H4.064l.315 7.562A1.5 1.5 0 0 0 5.878 13.5h4.245a1.5 1.5 0 0 0 1.498-1.438zm-6.186 2v5a.75.75 0 0 0 1.5 0v-5a.75.75 0 0 0-1.5 0m3.75-.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
            </svg>
            Delete Scene
          </button>
        </div>,
        document.body
      )}
      
    </div>
  );
}
