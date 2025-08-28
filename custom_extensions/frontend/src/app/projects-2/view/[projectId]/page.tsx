"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import VideoEditorHeader from '../components/VideoEditorHeader';
import Toolbar from '../components/Toolbar';
import Script from '../components/Script';
import Background from '../components/Background';
import Music from '../components/Music';
import Transition from '../components/Transition';
import Comments from '../components/Comments';
import Media from '../components/Media';
import TextPopup from '../components/TextPopup';
import ShapesPopup from '../components/ShapesPopup';
import InteractionPopup from '../components/InteractionPopup';
import InteractionModal from '../components/InteractionModal';
import AiPopup from '../components/AiPopup';
import LanguageVariantModal from '../components/LanguageVariantModal';
import VideoLessonDisplay from '@/components/VideoLessonDisplay';
import { ComponentBasedSlideDeckRenderer } from '@/components/ComponentBasedSlideRenderer';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import SceneTimeline from '../components/SceneTimeline';
import TextSettings from '../components/TextSettings';
import ImageSettings from '../components/ImageSettings';
import AvatarSettings from '../components/AvatarSettings';
import ShapeSettings from '../components/ShapeSettings';
import OptionPopup from '../components/OptionPopup';
// NEW: Import SlideAddButton and types
import { SlideAddButton } from '@/components/SlideAddButton';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';

interface Scene {
  id: string;
  name: string;
  order: number;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export default function Projects2ViewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
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
  
  // Scene management state (commented out for now - focusing on Video Lessons)
  // const [scenes, setScenes] = useState<Scene[]>([
  //   { id: 'scene-1', name: 'Scene 1', order: 1 }
  // ]);
  const [openMenuSceneId, setOpenMenuSceneId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Aspect ratio state
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  
  // Selected element state for presentation
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // Options popup state
  const [isOptionPopupOpen, setIsOptionPopupOpen] = useState<boolean>(false);
  const [optionPopupPosition, setOptionPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // NEW: Video Lesson slide management state
  const [videoLessonData, setVideoLessonData] = useState<VideoLessonData | undefined>(undefined);
  const [componentBasedSlideDeck, setComponentBasedSlideDeck] = useState<ComponentBasedSlideDeck | undefined>(undefined);
  const [currentSlideId, setCurrentSlideId] = useState<string | undefined>(undefined);
  const [isVideoLessonMode, setIsVideoLessonMode] = useState<boolean>(false);
  const [isComponentBasedVideoLesson, setIsComponentBasedVideoLesson] = useState<boolean>(false);

  // Function to add a new scene (commented out for now - focusing on Video Lessons)
  // const handleAddScene = () => {
  //   const newSceneNumber = scenes.length + 1;
  //   const newScene: Scene = {
  //     id: `scene-${newSceneNumber}`,
  //     name: `Scene ${newSceneNumber}`,
  //     order: newSceneNumber
  //   };
  //   
  //   // Add the new scene after existing scenes (at the end)
  //   setScenes(prevScenes => [...prevScenes, newScene]);
  // };

  // NEW: Function to add new slide (called by SlideAddButton)
  const handleAddSlide = (newSlide: ComponentBasedSlide) => {
    if (!videoLessonData) return;

    // Convert ComponentBasedSlide to VideoLessonSlideData
    const videoLessonSlide: VideoLessonSlideData = {
      slideId: newSlide.slideId,
      slideNumber: videoLessonData.slides.length + 1,
      slideTitle: newSlide.props?.title || `Slide ${videoLessonData.slides.length + 1}`,
      displayedText: newSlide.props?.content || '',
      displayedPictureDescription: '',
      displayedVideoDescription: '',
      voiceoverText: ''
    };

    const updatedData = {
      ...videoLessonData,
      slides: [...videoLessonData.slides, videoLessonSlide]
    };

    setVideoLessonData(updatedData);
    setCurrentSlideId(videoLessonSlide.slideId);
    
    // Save to backend
    saveVideoLessonData(updatedData);
  };

  // NEW: Function to save Video Lesson data
  const saveVideoLessonData = async (data: VideoLessonData | ComponentBasedSlideDeck) => {
    try {
      if (!projectId) {
        console.error('No project ID available');
        return;
      }
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ microProductContent: data })
      });
      if (!response.ok) {
        console.error('Error saving video lesson data');
      }
    } catch (error) {
      console.error('Error saving video lesson data:', error);
    }
  };

  // NEW: Function to handle slide selection
  const handleSlideSelect = (slideId: string) => {
    setCurrentSlideId(slideId);
    if (videoLessonData) {
      const updatedData = { ...videoLessonData, currentSlideId: slideId };
      setVideoLessonData(updatedData);
      saveVideoLessonData(updatedData);
    }
  };

  // NEW: Function to handle text changes (for Script component)
  const handleTextChange = (path: (string | number)[], newValue: string | number | boolean) => {
    if (isComponentBasedVideoLesson && componentBasedSlideDeck) {
      // Handle component-based slide deck updates
      const updatedDeck = { ...componentBasedSlideDeck };
      
      if (path.length === 1 && path[0] === 'lessonTitle') {
        updatedDeck.lessonTitle = newValue as string;
      } else if (path.length === 1 && path[0] === 'currentSlideId') {
        updatedDeck.currentSlideId = newValue as string;
      } else if (path.length === 3 && path[0] === 'slides' && typeof path[1] === 'number' && path[2] === 'voiceoverText') {
        const slideIndex = path[1];
        if (updatedDeck.slides[slideIndex]) {
          updatedDeck.slides[slideIndex].voiceoverText = newValue as string;
        }
      }
      
      setComponentBasedSlideDeck(updatedDeck);
      saveVideoLessonData(updatedDeck);
    } else if (videoLessonData) {
      // Handle old video lesson data updates
      const updatedData = { ...videoLessonData };
      
      // Handle specific cases for VideoLessonData structure
      if (path.length === 1 && path[0] === 'mainPresentationTitle') {
        updatedData.mainPresentationTitle = newValue as string;
      } else if (path.length === 1 && path[0] === 'currentSlideId') {
        updatedData.currentSlideId = newValue as string;
      } else if (path.length === 3 && path[0] === 'slides' && typeof path[1] === 'number' && path[2] === 'voiceoverText') {
        const slideIndex = path[1];
        if (updatedData.slides[slideIndex]) {
          updatedData.slides[slideIndex].voiceoverText = newValue as string;
        }
      } else if (path.length === 3 && path[0] === 'slides' && typeof path[1] === 'number' && path[2] === 'slideTitle') {
        const slideIndex = path[1];
        if (updatedData.slides[slideIndex]) {
          updatedData.slides[slideIndex].slideTitle = newValue as string;
        }
      } else if (path.length === 3 && path[0] === 'slides' && typeof path[1] === 'number' && path[2] === 'displayedText') {
        const slideIndex = path[1];
        if (updatedData.slides[slideIndex]) {
          updatedData.slides[slideIndex].displayedText = newValue as string;
        }
      } else if (path.length === 3 && path[0] === 'slides' && typeof path[1] === 'number' && path[2] === 'displayedPictureDescription') {
        const slideIndex = path[1];
        if (updatedData.slides[slideIndex]) {
          updatedData.slides[slideIndex].displayedPictureDescription = newValue as string;
        }
      } else if (path.length === 3 && path[0] === 'slides' && typeof path[1] === 'number' && path[2] === 'displayedVideoDescription') {
        const slideIndex = path[1];
        if (updatedData.slides[slideIndex]) {
          updatedData.slides[slideIndex].displayedVideoDescription = newValue as string;
        }
      }
      
      setVideoLessonData(updatedData);
      saveVideoLessonData(updatedData);
    }
  };

  // NEW: Function to delete slide (following old interface pattern)
  const handleDeleteSlide = (slideId: string) => {
    if (!videoLessonData || videoLessonData.slides.length <= 1) {
      console.log('Cannot delete slide: no data or only one slide remaining');
      return;
    }

    console.log('Deleting slide:', slideId);
    
    // Filter out the deleted slide and renumber remaining slides
    const updatedSlides = videoLessonData.slides
      .filter(slide => slide.slideId !== slideId)
      .map((slide, index) => ({
        ...slide,
        slideNumber: index + 1
      }));

    const updatedData = {
      ...videoLessonData,
      slides: updatedSlides
    };

    // Handle current slide selection after deletion
    let newCurrentSlideId = currentSlideId;
    if (currentSlideId === slideId) {
      // If we deleted the current slide, select the next one or previous one
      const deletedIndex = videoLessonData.slides.findIndex(s => s.slideId === slideId);
      const nextSlide = updatedSlides[deletedIndex] || updatedSlides[deletedIndex - 1];
      newCurrentSlideId = nextSlide?.slideId;
    }

    setVideoLessonData(updatedData);
    setCurrentSlideId(newCurrentSlideId);
    
    // Save to backend
    saveVideoLessonData(updatedData);
    
    console.log('Slide deleted successfully. New current slide:', newCurrentSlideId);
  };

  // NEW: Load Video Lesson data on component mount
  useEffect(() => {
    console.log('useEffect triggered with projectId:', projectId);
    
    const loadVideoLessonData = async () => {
      if (!projectId) {
        console.log('No projectId available, returning');
        return;
      }
      
      console.log('Loading Video Lesson data for projectId:', projectId);
      
      try {
        console.log('Making fetch request to:', `${CUSTOM_BACKEND_URL}/projects/view/${projectId}`);
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${projectId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin'
        });
        
        console.log('Fetch response status:', response.status);
        
        if (response.ok) {
          const instanceData = await response.json();
          console.log('Project data loaded:', instanceData);
          console.log('Project component name:', instanceData.component_name);
          
          // Check if this is a Video Lesson project
          const isVideoLesson = instanceData.component_name === 'VideoLessonPresentationDisplay' ||
                               instanceData.component_name === 'VideoLesson' ||
                               instanceData.component_name === 'video_lesson_presentation';
          
          const isComponentBasedVideoLesson = instanceData.component_name === 'VideoLessonPresentationDisplay';
          
          if (isVideoLesson) {
            console.log('Detected Video Lesson project');
            setIsVideoLessonMode(true);
            setIsComponentBasedVideoLesson(isComponentBasedVideoLesson);
            
            // Load Video Lesson data from details
            if (instanceData.details) {
              console.log('Found details:', instanceData.details);
              
              if (isComponentBasedVideoLesson) {
                // Handle component-based video lesson structure
                const componentData = instanceData.details as ComponentBasedSlideDeck;
                setComponentBasedSlideDeck(componentData);
                setCurrentSlideId(componentData.currentSlideId || componentData.slides[0]?.slideId);
                console.log('Set Component-Based Video Lesson data:', componentData);
                console.log('Current slide ID:', componentData.currentSlideId || componentData.slides[0]?.slideId);
              } else {
                // Handle old video lesson structure
                const videoData = instanceData.details as VideoLessonData;
                setVideoLessonData(videoData);
                setCurrentSlideId(videoData.currentSlideId || videoData.slides[0]?.slideId);
                console.log('Set Video Lesson data:', videoData);
                console.log('Current slide ID:', videoData.currentSlideId || videoData.slides[0]?.slideId);
              }
            } else {
              console.log('No details found, creating empty Video Lesson data');
              if (isComponentBasedVideoLesson) {
                // Create empty component-based Video Lesson data
                const emptyComponentData: ComponentBasedSlideDeck = {
                  lessonTitle: instanceData.name || 'Untitled Video Lesson',
                  slides: [],
                  detectedLanguage: instanceData.detectedLanguage || 'en',
                  hasVoiceover: true
                };
                setComponentBasedSlideDeck(emptyComponentData);
              } else {
                // Create empty old Video Lesson data
                const emptyVideoData: VideoLessonData = {
                  mainPresentationTitle: instanceData.name || 'Untitled Video Lesson',
                  slides: [],
                  detectedLanguage: instanceData.detectedLanguage || 'en'
                };
                setVideoLessonData(emptyVideoData);
              }
            }
          } else {
            console.log('Not a Video Lesson project, component_name:', instanceData.component_name);
            // TEMPORARY: Force Video Lesson mode for testing
            console.log('TEMPORARY: Forcing Video Lesson mode for testing');
            setIsVideoLessonMode(true);
            setIsComponentBasedVideoLesson(true);
            const testComponentData: ComponentBasedSlideDeck = {
              lessonTitle: 'Test Video Lesson',
              slides: [
                {
                  slideId: 'slide-1',
                  slideNumber: 1,
                  templateId: 'title-slide',
                  props: {
                    title: 'Introduction',
                    subtitle: 'Welcome to this video lesson!'
                  },
                  voiceoverText: 'Welcome to this video lesson!'
                }
              ],
              detectedLanguage: 'en',
              hasVoiceover: true
            };
            setComponentBasedSlideDeck(testComponentData);
            setCurrentSlideId('slide-1');
          }
        } else {
          console.error('Failed to load project data:', response.status);
        }
      } catch (error) {
        console.error('Error loading Video Lesson data:', error);
        console.error('Error details:', error);
      }
    };

    console.log('Calling loadVideoLessonData...');
    loadVideoLessonData();
    console.log('loadVideoLessonData called');
  }, [projectId]);



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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuSceneId && menuPosition) {
        const target = event.target as HTMLElement;
        // Check if click is outside the menu popup
        if (!target.closest('[data-menu-popup]')) {
          closeMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuSceneId, menuPosition]);

  // Function to handle menu actions
  const handleMenuAction = (action: string, sceneId: string) => {
    console.log(`${action} for ${sceneId}`);
    
    if (action === 'delete' && isVideoLessonMode) {
      handleDeleteSlide(sceneId);
    } else {
      // TODO: Implement other actions for regular scenes
      console.log(`Action ${action} not implemented yet`);
    }
    
    closeMenu();
  };

  // Function to delete scene (commented out for now - focusing on Video Lessons)
  // const handleDeleteScene = (sceneId: string) => {
  //   if (sceneId === 'scene-1') return; // Prevent deletion of first scene
  //   setScenes(prevScenes => prevScenes.filter(scene => scene.id !== sceneId));
  //   closeMenu();
  // };

  // Function to handle element selection in presentation
  const handleElementSelect = (elementType: string | null) => {
    console.log('handleElementSelect called with:', elementType);
    setSelectedElement(elementType);
  };

  // Function to handle right-click on presentation area
  const handleRightClick = (position: { x: number; y: number }) => {
    setOptionPopupPosition(position);
    setIsOptionPopupOpen(true);
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
    // Clear selected element when switching tools
    setSelectedElement(null);
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
    // If an element is selected, show its settings
    if (selectedElement) {
      switch (selectedElement) {
        case 'text':
          return <TextSettings />;
        case 'image':
          return <ImageSettings />;
        case 'avatar':
          return <AvatarSettings />;
        case 'shape':
          return <ShapeSettings />;
        default:
          return <Script 
            onAiButtonClick={handleAiButtonClick} 
            videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
            componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
            currentSlideId={currentSlideId}
            onTextChange={handleTextChange}
          />;
      }
    }

    // Otherwise show the active component
    switch (activeComponent) {
      case 'script':
        return <Script 
          onAiButtonClick={handleAiButtonClick} 
          videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
          componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
          currentSlideId={currentSlideId}
          onTextChange={handleTextChange}
        />;
      case 'background':
        return <Background />;
      case 'music':
        return <Music />;
      case 'transition':
        return <Transition />;
      case 'comments':
        return <Comments />;
      default:
        return <Script 
          onAiButtonClick={handleAiButtonClick} 
          videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
          componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
          currentSlideId={currentSlideId}
          onTextChange={handleTextChange}
        />;
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col p-2 relative" onClick={() => {
      closeMenu();
    }}>
      {/* Header */}
      <VideoEditorHeader 
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />

      {/* Toolbar */}
      <div className="-mt-1">
        <Toolbar 
          onActiveToolChange={handleActiveToolChange} 
          onTextButtonClick={handleTextButtonClick}
          onShapesButtonClick={handleShapesButtonClick}
          onInteractionButtonClick={handleInteractionButtonClick}
          onLanguageVariantModalOpen={handleLanguageVariantModalOpen}
        />
      </div>
      
      {/* Main Content Area - Horizontal layout under toolbar */}
      {/* Calculate available height: 100vh - header (68px) - toolbar (72px) = calc(100vh - 140px) */}
      <div className="flex gap-4 mt-[5px] mx-4 mb-[5px]" style={{ height: 'calc(100vh - 145px)' }}>
        {/* Sidebar - 30% width, full height of available space */}
        <div className="w-[30%] h-full overflow-y-auto overflow-x-hidden">
          {renderSidebarComponent()}
        </div>

        {/* Main Container - 70% width, full height of available space */}
        <div className="w-[70%] h-full flex flex-col gap-2 overflow-visible">
          {/* Top Container - Takes 75% of main container height (matching VideoPresentation) */}
          <div className="h-[75%] bg-gray-200 rounded-md overflow-auto flex items-center justify-center">
            {isComponentBasedVideoLesson && componentBasedSlideDeck ? (
              <div 
                className="bg-white rounded-md shadow-lg relative overflow-hidden"
                style={{
                  width: '80%',
                  height: '80%',
                  maxWidth: aspectRatio === '16:9' 
                    ? 'calc((100vh - 145px) * 0.8 * 0.8 * 16 / 9)'
                    : aspectRatio === '9:16'
                    ? 'calc((100vh - 145px) * 0.8 * 0.8 * 9 / 16)'
                    : 'calc((100vh - 145px) * 0.8 * 0.8)',
                  maxHeight: 'calc((100vh - 145px) * 0.8 * 0.8)'
                }}
              >
                <ComponentBasedSlideDeckRenderer
                  slides={componentBasedSlideDeck.slides}
                  selectedSlideId={currentSlideId}
                  isEditable={true}
                  onSlideUpdate={(updatedSlide) => {
                    // Handle slide updates for component-based slides
                    if (componentBasedSlideDeck) {
                      const updatedSlides = componentBasedSlideDeck.slides.map(slide =>
                        slide.slideId === updatedSlide.slideId ? updatedSlide : slide
                      );
                      const updatedDeck = { ...componentBasedSlideDeck, slides: updatedSlides };
                      setComponentBasedSlideDeck(updatedDeck);
                      // Save to backend
                      saveVideoLessonData(updatedDeck);
                    }
                  }}
                  theme="default"
                />
              </div>
            ) : (
              <VideoLessonDisplay 
                dataToDisplay={videoLessonData || null}
                isEditing={true}
                className="h-full"
                onTextChange={handleTextChange}
              />
            )}
          </div>

          {/* Bottom Container - Takes 30% of main container height */}
          <SceneTimeline 
            scenes={[]} // Commented out regular scenes for now
            aspectRatio={aspectRatio}
            onAddScene={() => console.log('Regular scene add - disabled for now')} // Commented out for now
            onMenuClick={handleMenuClick}
            videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
            componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
            onSlideSelect={handleSlideSelect}
            currentSlideId={currentSlideId}
            onAddSlide={handleAddSlide}
          />
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
          data-menu-popup
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
              (isVideoLessonMode && videoLessonData && videoLessonData.slides.length <= 1) || 
              (!isVideoLessonMode && openMenuSceneId === 'scene-1')
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleMenuAction('delete', openMenuSceneId)}
            disabled={
              (isVideoLessonMode && videoLessonData && videoLessonData.slides.length <= 1) || 
              (!isVideoLessonMode && openMenuSceneId === 'scene-1')
            }
          >
            <svg className="w-4 h-4" fill="currentColor" fillRule="evenodd" viewBox="0 0 16 16">
              <path d="M9 2H7a.5.5 0 0 0-.5.5V3h3v-.5A.5.5 0 0 0 9 2m2 1v-.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2V3H2.251a.75.75 0 0 0 0 1.5h.312l.317 7.625A3 3 0 0 0 5.878 15h4.245a3 3 0 0 0 2.997-2.875l.318-7.625h.312a.75.75 0 0 0 0-1.5zm.936 1.5H4.064l.315 7.562A1.5 1.5 0 0 0 5.878 13.5h4.245a1.5 1.5 0 0 0 1.498-1.438zm-6.186 2v5a.75.75 0 0 0 1.5 0v-5a.75.75 0 0 0-1.5 0m3.75-.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75" clipRule="evenodd"/>
            </svg>
            {isVideoLessonMode ? 'Delete Slide' : 'Delete Scene'}
          </button>
        </div>,
        document.body
      )}

      {/* Options Popup */}
      <OptionPopup 
        isOpen={isOptionPopupOpen} 
        onClose={() => setIsOptionPopupOpen(false)} 
        position={optionPopupPosition}
      />
      
    </div>
  );
}
