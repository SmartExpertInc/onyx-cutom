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
import TemplateSelector from '../components/TemplateSelector';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';
import AvatarDataProvider from '../components/AvatarDataService';
import { VoiceProvider } from '@/contexts/VoiceContext';

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
  
  // NEW: Settings panel state for video lesson buttons
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<string | null>(null);
  
  // NEW: Track active text editor for TextSettings control
  const [activeTextEditor, setActiveTextEditor] = useState<any | null>(null);
  const [computedTextStyles, setComputedTextStyles] = useState<any | null>(null);
  
  // NEW: Track active transition for Transition panel
  const [activeTransitionIndex, setActiveTransitionIndex] = useState<number | null>(null);

  // NEW: Function to add new slide (called by SlideAddButton)
  const handleAddSlide = (newSlide: ComponentBasedSlide) => {
    console.log('🔍 handleAddSlide called with:', {
      newSlide,
      isComponentBasedVideoLesson,
      hasVideoLessonData: !!videoLessonData,
      hasComponentBasedSlideDeck: !!componentBasedSlideDeck
    });

    if (isComponentBasedVideoLesson && componentBasedSlideDeck) {
      // 🔧 CRITICAL FIX: Ensure slide has slideTitle for backend compatibility
      // This matches the golden reference implementation in SmartSlideDeckViewer
      const slideWithBackendCompat: any = {
        ...newSlide,
        slideTitle: (typeof newSlide.props?.title === 'string' ? newSlide.props.title : '') || `Slide ${componentBasedSlideDeck.slides.length + 1}`, // ← CRITICAL: Backend expects this
        slideNumber: componentBasedSlideDeck.slides.length + 1
      };

      // Handle component-based slide deck (new structure)
      const updatedSlides = [...componentBasedSlideDeck.slides, slideWithBackendCompat];
      const updatedDeck: ComponentBasedSlideDeck = {
        ...componentBasedSlideDeck,
        slides: updatedSlides,
        currentSlideId: newSlide.slideId
      };

      console.log('🔍 Adding slide to component-based deck with backend compatibility:', {
        originalSlideCount: componentBasedSlideDeck.slides.length,
        newSlideCount: updatedSlides.length,
        newSlideId: newSlide.slideId,
        hasSlideTitle: !!slideWithBackendCompat.slideTitle,
        slideTitle: slideWithBackendCompat.slideTitle
      });

      setComponentBasedSlideDeck(updatedDeck);
      setCurrentSlideId(newSlide.slideId);
      
      // Save to backend
      saveVideoLessonData(updatedDeck);
      
      // Switch back to script view after adding slide
      setActiveComponent('script');
    } else if (videoLessonData) {
      // Handle old video lesson structure (legacy)
      const videoLessonSlide: VideoLessonSlideData = {
        slideId: newSlide.slideId,
        slideNumber: videoLessonData.slides.length + 1,
        slideTitle: (typeof newSlide.props?.title === 'string' ? newSlide.props.title : '') || `Slide ${videoLessonData.slides.length + 1}`,
        displayedText: (typeof newSlide.props?.content === 'string' ? newSlide.props.content : '') || '',
        displayedPictureDescription: '',
        displayedVideoDescription: '',
        voiceoverText: ''
      };

      const updatedData = {
        ...videoLessonData,
        slides: [...videoLessonData.slides, videoLessonSlide]
      };

      console.log('🔍 Adding slide to legacy video lesson:', {
        originalSlideCount: videoLessonData.slides.length,
        newSlideCount: updatedData.slides.length,
        newSlideId: videoLessonSlide.slideId
      });

      setVideoLessonData(updatedData);
      setCurrentSlideId(videoLessonSlide.slideId);
      
      // Save to backend
      saveVideoLessonData(updatedData);
      
      // Switch back to script view after adding slide
      setActiveComponent('script');
    } else {
      console.error('❌ handleAddSlide: No valid data structure found!', {
        isComponentBasedVideoLesson,
        hasVideoLessonData: !!videoLessonData,
        hasComponentBasedSlideDeck: !!componentBasedSlideDeck
      });
    }
  };

  // NEW: Function to save Video Lesson data
  const saveVideoLessonData = async (data: VideoLessonData | ComponentBasedSlideDeck) => {
    try {
      if (!projectId) {
        console.error('❌ saveVideoLessonData: No projectId provided');
        return;
      }
      
      console.log('💾 Saving video lesson data:', {
        projectId,
        dataType: data.constructor.name,
        slideCount: 'slides' in data ? data.slides.length : 'N/A'
      });

      // 🔧 CRITICAL FIX: Add dev user header to match old UI's golden reference pattern
      const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
        method: 'PUT',
        headers: saveOperationHeaders,
        body: JSON.stringify({ microProductContent: data })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save video lesson data:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
      }
      
      console.log('✅ Video lesson data saved successfully');
    } catch (error) {
      console.error('❌ Error saving video lesson data:', error);
      // TODO: Show user notification for save errors
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

  // Function to open template selector panel
  const handleOpenTemplateSelector = () => {
    setActiveComponent('templates');
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

  // NEW: Handle transition button click
  const handleTransitionClick = (transitionIndex: number) => {
    console.log('🎬 Transition clicked:', transitionIndex);
    setActiveTransitionIndex(transitionIndex);
    setActiveSettingsPanel('transition');
  };

  // NEW: Handle transition change
  const handleTransitionChange = (transitionData: any) => {
    if (!isComponentBasedVideoLesson || !componentBasedSlideDeck || activeTransitionIndex === null) return;
    
    console.log('🎬 Transition change:', { transitionIndex: activeTransitionIndex, transitionData });
    
    // Initialize transitions array if it doesn't exist
    const transitions = componentBasedSlideDeck.transitions || [];
    
    // Ensure array is large enough (should be slides.length - 1)
    const requiredLength = componentBasedSlideDeck.slides.length - 1;
    while (transitions.length < requiredLength) {
      transitions.push({ type: 'none', duration: 1.0, variant: 'circle', applyToAll: false });
    }
    
    // Check if "Apply to all" is enabled
    if (transitionData.applyToAll) {
      // Apply the same transition to ALL transition slots
      for (let i = 0; i < transitions.length; i++) {
        transitions[i] = { ...transitionData };
      }
    } else {
      // Update only the specific transition
      transitions[activeTransitionIndex] = { ...transitionData };
    }
    
    // Update the deck with new transitions
    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentBasedSlideDeck,
      transitions: [...transitions]
    };
    
    setComponentBasedSlideDeck(updatedDeck);
    saveVideoLessonData(updatedDeck);
  };

  // NEW: Function to delete slide (following old interface pattern)
  const handleDeleteSlide = (slideId: string) => {
    console.log('🗑️ handleDeleteSlide called with:', {
      slideId,
      isComponentBasedVideoLesson,
      hasVideoLessonData: !!videoLessonData,
      hasComponentBasedSlideDeck: !!componentBasedSlideDeck
    });

    if (isComponentBasedVideoLesson && componentBasedSlideDeck) {
      // Handle component-based slide deck (new structure)
      if (componentBasedSlideDeck.slides.length <= 1) {
        console.log('⚠️ Cannot delete slide: only one slide remaining');
        return;
      }

      const updatedSlides = componentBasedSlideDeck.slides.filter(slide => slide.slideId !== slideId);
      const updatedDeck: ComponentBasedSlideDeck = {
        ...componentBasedSlideDeck,
        slides: updatedSlides,
        currentSlideId: currentSlideId === slideId ? updatedSlides[0]?.slideId : currentSlideId
      };

      console.log('🗑️ Deleting slide from component-based deck:', {
        originalSlideCount: componentBasedSlideDeck.slides.length,
        newSlideCount: updatedSlides.length,
        deletedSlideId: slideId
      });

      setComponentBasedSlideDeck(updatedDeck);
      setCurrentSlideId(updatedDeck.currentSlideId || undefined);
      
      // Save to backend
      saveVideoLessonData(updatedDeck);
    } else if (videoLessonData) {
      // Handle old video lesson structure (legacy)
      if (videoLessonData.slides.length <= 1) {
        console.log('⚠️ Cannot delete slide: only one slide remaining');
        return;
      }
      
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

      console.log('🗑️ Deleting slide from legacy video lesson:', {
        originalSlideCount: videoLessonData.slides.length,
        newSlideCount: updatedSlides.length,
        deletedSlideId: slideId
      });

      setVideoLessonData(updatedData);
      setCurrentSlideId(newCurrentSlideId);
      
      // Save to backend
      saveVideoLessonData(updatedData);
    } else {
      console.error('❌ handleDeleteSlide: No valid data structure found!', {
        isComponentBasedVideoLesson,
        hasVideoLessonData: !!videoLessonData,
        hasComponentBasedSlideDeck: !!componentBasedSlideDeck
      });
    }
  };

  // NEW: Load Video Lesson data on component mount
  useEffect(() => {
    const loadVideoLessonData = async () => {
      if (!projectId) {
        return;
      }
      
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/view/${projectId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin'
        });
        
        if (response.ok) {
          const instanceData = await response.json();
          
          // Check if this is a generated Video Product (different from editable Video Lesson)
          const isVideoProduct = instanceData.component_name === 'VideoProductDisplay';
          
          // Check if this is a Video Lesson project (editable)
          const isVideoLesson = instanceData.component_name === 'VideoLessonPresentationDisplay' ||
                               instanceData.component_name === 'VideoLesson' ||
                               instanceData.component_name === 'video_lesson_presentation';
          
          const isComponentBasedVideoLesson = instanceData.component_name === 'VideoLessonPresentationDisplay';
          
          if (isVideoProduct) {
            // Redirect to proper video product view (not the editor)
            console.log('🎬 [VIDEO_PRODUCT] Detected VideoProductDisplay, redirecting to video player view');
            // For now, just navigate to the old projects view which handles VideoProductDisplay
            window.location.href = `/projects/view/${projectId}`;
            return;
          }
          
          if (isVideoLesson) {
            setIsVideoLessonMode(true);
            setIsComponentBasedVideoLesson(isComponentBasedVideoLesson);
            
            // Load Video Lesson data from details
            if (instanceData.details) {
              if (isComponentBasedVideoLesson) {
                // Handle component-based video lesson structure
                const componentData = instanceData.details as ComponentBasedSlideDeck;
                setComponentBasedSlideDeck(componentData);
                setCurrentSlideId(componentData.currentSlideId || componentData.slides[0]?.slideId);
              } else {
                // Handle old video lesson structure
                const videoData = instanceData.details as VideoLessonData;
                setVideoLessonData(videoData);
                setCurrentSlideId(videoData.currentSlideId || videoData.slides[0]?.slideId);
              }
            } else {
              if (isComponentBasedVideoLesson) {
                // Create empty component-based Video Lesson data
                const emptyComponentData: ComponentBasedSlideDeck = {
                  lessonTitle: instanceData.name || 'Untitled Video Lesson',
                  slides: [],
                  detectedLanguage: instanceData.detectedLanguage || 'en',
                  hasVoiceover: true,
                  templateVersion: 'v2' // Set v2 for new presentations
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
            // TEMPORARY: Force Video Lesson mode for testing
            setIsVideoLessonMode(true);
            setIsComponentBasedVideoLesson(true);
            const testComponentData: ComponentBasedSlideDeck = {
              lessonTitle: 'Test Video Lesson',
              templateVersion: 'v2', // Set v2 for new presentations
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
        }
      } catch (error) {
        // Handle error silently or with user notification
      }
    };

    loadVideoLessonData();
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
    
    if (action === 'delete' && isVideoLessonMode) {
      handleDeleteSlide(sceneId);
    } else {
      // TODO: Implement other actions for regular scenes
    }
    
    closeMenu();
  };

  // Function to handle element selection in presentation
  const handleElementSelect = (elementType: string | null) => {
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

  // NEW: Handler for video lesson settings buttons
  const handleSettingsButtonClick = (settingsType: string) => {
    setActiveSettingsPanel(settingsType);
  };

  // NEW: Handler to close settings panel
  const handleCloseSettingsPanel = () => {
    setActiveSettingsPanel(null);
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
    // If video lesson settings panel is active, show the corresponding settings
    if (activeSettingsPanel) {
      switch (activeSettingsPanel) {
        case 'text':
          return <TextSettings activeEditor={activeTextEditor} computedStyles={computedTextStyles} />;
        case 'image':
          return <ImageSettings />;
        case 'avatar':
          return <AvatarSettings />;
        case 'shape':
          return <ShapeSettings />;
        default:
          break;
      }
    }

    // If an element is selected, show its settings
    if (selectedElement) {
      switch (selectedElement) {
        case 'text':
          return <TextSettings activeEditor={activeTextEditor} computedStyles={computedTextStyles} />;
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
      case 'templates':
        return <TemplateSelector 
          currentSlideCount={isComponentBasedVideoLesson ? (componentBasedSlideDeck?.slides?.length || 0) : (videoLessonData?.slides?.length || 0)}
          onAddSlide={handleAddSlide}
        />;
      case 'background':
        return <Background />;
      case 'music':
        return <Music />;
      case 'transition':
        const currentTransition = componentBasedSlideDeck?.transitions?.[activeTransitionIndex || 0] || null;
        return (
          <Transition 
            transitionIndex={activeTransitionIndex}
            currentTransition={currentTransition}
            onTransitionChange={handleTransitionChange}
          />
        );
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
    <VoiceProvider>
      <AvatarDataProvider>
        <div className="h-screen bg-white flex flex-col p-2 relative" onClick={() => {
          closeMenu();
        }}>
      {/* Header */}
      <VideoEditorHeader 
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        videoLessonData={videoLessonData}
        componentBasedSlideDeck={componentBasedSlideDeck}
        currentSlideId={currentSlideId}
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
          {/* Top Container - Takes 80% of main container height (increased from 75%) */}
          <div className="h-[80%] bg-gray-200 rounded-md overflow-auto flex items-center justify-center relative">
            {/* Settings Buttons - Top Left Corner */}
            {isComponentBasedVideoLesson && componentBasedSlideDeck && (
              <div className="absolute top-2 left-2 z-10 flex gap-1">
                <button
                  onClick={() => handleSettingsButtonClick('text')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors shadow-sm ${
                    activeSettingsPanel === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => handleSettingsButtonClick('shape')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors shadow-sm ${
                    activeSettingsPanel === 'shape'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Shape
                </button>
                <button
                  onClick={() => handleSettingsButtonClick('image')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors shadow-sm ${
                    activeSettingsPanel === 'image'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => handleSettingsButtonClick('avatar')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors shadow-sm ${
                    activeSettingsPanel === 'avatar'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Avatar
                </button>
              </div>
            )}

            {/* Click handler to close settings panel */}
            <div 
              className="absolute inset-0 z-0"
              onClick={handleCloseSettingsPanel}
            />

            {isComponentBasedVideoLesson && componentBasedSlideDeck ? (
              <div 
                className="bg-white rounded-md shadow-lg relative overflow-hidden flex items-center justify-center"
                style={{
                  width: 'fit-content',
                  height: 'fit-content',
                  margin: 'auto'
                }}
              >
                {/* Slide Container - Keeps original size */}
                <div
                  style={{
                    position: 'relative',
                    pointerEvents: 'auto',
                    userSelect: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                <div
                  className="professional-slide relative bg-white overflow-hidden"
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                      width: aspectRatio === '16:9' ? '900px' 
                      : aspectRatio === '9:16' ? '400px'
                      : '800px',
                      height: aspectRatio === '16:9' ? '506px' 
                        : aspectRatio === '9:16' ? '711px'
                        : '800px',
                    }}
                  >
                    {/* Apply zoom to content INSIDE the slide container */}
                    <div style={{ 
                      width: '100%', 
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: '5%', // Push content down slightly to show top properly
                    }}>
                    <div style={{
                      zoom: 0.6, // Scale content inside while keeping slide box size (60% of original)
                      width: '100%',
                      height: '100%',
                    }}>
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
                      onEditorActive={(editor, field, computedStyles) => {
                        console.log('✏️ Editor active:', { field, hasEditor: !!editor, computedStyles });
                        setActiveTextEditor(editor);
                        setComputedTextStyles(computedStyles || null);
                        setActiveSettingsPanel('text');
                      }}
                      theme="default"
                      isVideoMode={true}
                    />
                      </div>
                    </div>
                  </div>
                </div>
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

          {/* Bottom Container - Takes 20% of main container height (reduced from 30% due to top container increase) */}
          <SceneTimeline 
            scenes={[]} // Commented out regular scenes for now
            aspectRatio={aspectRatio}
            onAddScene={() => {}} // Disabled for now
            onMenuClick={handleMenuClick}
            videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
            componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
            onSlideSelect={handleSlideSelect}
            currentSlideId={currentSlideId}
            onAddSlide={handleAddSlide}
            onOpenTemplateSelector={handleOpenTemplateSelector}
            onTransitionClick={handleTransitionClick}
            activeTransitionIndex={activeTransitionIndex}
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
      </AvatarDataProvider>
    </VoiceProvider>
  );
}
