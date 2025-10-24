"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { ProductViewHeader } from '@/components/ProductViewHeader';
import Script from '../../../projects-2/view/components/Script';
import Background from '../../../projects-2/view/components/Background';
import Music from '../../../projects-2/view/components/Music';
import Transition from '../../../projects-2/view/components/Transition';
import Media from '../../../projects-2/view/components/Media';
import TextPopup from '../../../projects-2/view/components/TextPopup';
import ShapesPopup from '../../../projects-2/view/components/ShapesPopup';
import AiPopup from '../../../projects-2/view/components/AiPopup';
import LanguageVariantModal from '../../../projects-2/view/components/LanguageVariantModal';
import PlayModal from '../../../projects-2/view/components/PlayModal';
import GenerateModal from '../../../projects-2/view/components/GenerateModal';
import GenerationCompletedModal from '../../../projects-2/view/components/GenerationCompletedModal';
import VideoLessonDisplay from '@/components/VideoLessonDisplay';
import { ComponentBasedSlideDeckRenderer } from '@/components/ComponentBasedSlideRenderer';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import SceneTimeline from '../../../projects-2/view/components/SceneTimeline';
import TextSettings from '../../../projects-2/view/components/TextSettings';
import ImageSettings from '../../../projects-2/view/components/ImageSettings';
import AvatarSettings from '../../../projects-2/view/components/AvatarSettings';
import ShapeSettings from '../../../projects-2/view/components/ShapeSettings';
import OptionPopup from '../../../projects-2/view/components/OptionPopup';
import TemplateSelector from '../../../projects-2/view/components/TemplateSelector';
import ColorPalettePopup from '../../../projects-2/view/components/ColorPalettePopup';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { VideoLessonData, VideoLessonSlideData } from '@/types/videoLessonTypes';
import AvatarDataProvider from '../../../projects-2/view/components/AvatarDataService';
import { VoiceProvider } from '@/contexts/VoiceContext';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export default function Projects2ViewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState<boolean>(false);
  const [isTextPopupOpen, setIsTextPopupOpen] = useState<boolean>(false);
  const [isShapesPopupOpen, setIsShapesPopupOpen] = useState<boolean>(false);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState<boolean>(false);
  const [isLanguageVariantModalOpen, setIsLanguageVariantModalOpen] = useState<boolean>(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isGenerationCompletedModalOpen, setIsGenerationCompletedModalOpen] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [textPopupPosition, setTextPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shapesPopupPosition, setShapesPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aiPopupPosition, setAiPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [openMenuSceneId, setOpenMenuSceneId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Selected element state for presentation
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // ProductViewHeader state
  const [showSmartEditor, setShowSmartEditor] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<any>(null);
  
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
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<string | null>('script');
  
  // NEW: Track active text editor for TextSettings control
  const [activeTextEditor, setActiveTextEditor] = useState<any | null>(null);
  const [computedTextStyles, setComputedTextStyles] = useState<any | null>(null);
  
  // NEW: Track active transition for Transition panel
  const [activeTransitionIndex, setActiveTransitionIndex] = useState<number | null>(null);

  // Music panel state
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [showMusicDropdown, setShowMusicDropdown] = useState<boolean>(false);
  const [selectedMusic, setSelectedMusic] = useState<string>('East London');
  const [musicVolume, setMusicVolume] = useState<number>(50);

  // Background panel state
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState<boolean>(true);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [colorPalettePosition, setColorPalettePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mediaPopupPosition, setMediaPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Scene transition panel state
  const [isTransitionEnabled, setIsTransitionEnabled] = useState<boolean>(true);

  // Slide container scaling state
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [slideScale, setSlideScale] = useState<number>(0.45);
  const [showTransitionDropdown, setShowTransitionDropdown] = useState<boolean>(false);
  const [selectedTransition, setSelectedTransition] = useState<string>('None');

  // Refs for click outside detection
  const musicDropdownRef = useRef<HTMLDivElement>(null);
  const transitionDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (musicDropdownRef.current && !musicDropdownRef.current.contains(event.target as Node)) {
        setShowMusicDropdown(false);
      }
      if (transitionDropdownRef.current && !transitionDropdownRef.current.contains(event.target as Node)) {
        setShowTransitionDropdown(false);
      }
    }

    if (showMusicDropdown || showTransitionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMusicDropdown, showTransitionDropdown]);

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
      setActiveSettingsPanel('script');
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
      setActiveSettingsPanel('script');
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
    setActiveSettingsPanel('templates');
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
          
          // Store project data for ProductViewHeader
          setProjectData(instanceData);
          
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

  // Calculate responsive slide scale based on container width
  useEffect(() => {
    const calculateScale = () => {
      if (slideContainerRef.current) {
        const containerWidth = slideContainerRef.current.offsetWidth;
        // Original slide width is 1200px, we want it to fill the container with some padding
        const targetWidth = containerWidth * 0.95; // 95% of container width for some margin
        const scale = targetWidth / 1200;
        setSlideScale(scale);
      }
    };

    // Calculate on mount and window resize
    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

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



  // NEW: Handler for video lesson settings buttons
  const handleSettingsButtonClick = (settingsType: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (settingsType === 'media' && event) {
      // Special handling for media button - open media popup positioned to the left of the button
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const modalWidth = 800;
      const modalHeight = 400;
      const gap = 10;
      
      // Calculate position to the left of the button
      let x = rect.left - modalWidth - gap;
      let y = rect.bottom + gap;
      
      // Check if modal would go off the left edge
      if (x < 0) {
        x = gap; // Position at the left edge with some padding
      }
      
      // Check if modal would go off the right edge
      if (x + modalWidth > window.innerWidth) {
        x = window.innerWidth - modalWidth - gap;
      }
      
      // Check if modal would go off the bottom edge
      if (y + modalHeight > window.innerHeight) {
        y = window.innerHeight - modalHeight - gap;
      }
      
      // Check if modal would go off the top edge
      if (y < 0) {
        y = gap;
      }
      
      setMediaPopupPosition({ x, y });
      setIsMediaPopupOpen(true);
    } else {
      setActiveSettingsPanel(settingsType);
    }
  };

  // NEW: Handler to close settings panel
  const handleCloseSettingsPanel = () => {
    setActiveSettingsPanel(null);
  };

  // Simple translation function for ProductViewHeader
  const t = (key: string, fallback: string) => fallback;

  const handleShapesButtonClick = (position: { x: number; y: number }) => {
    setShapesPopupPosition(position);
    setIsShapesPopupOpen(true);
    // Also open ShapeSettings in the left panel
    setActiveSettingsPanel('shape');
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleLanguageVariantModalOpen = () => {
    setIsLanguageVariantModalOpen(true);
  };

  const handleLanguageVariantModalClose = () => {
    setIsLanguageVariantModalOpen(false);
  };

  const handlePreviewClick = () => {
    setIsPlayModalOpen(true);
  };

  const handleGenerateClick = () => {
    setIsGenerateModalOpen(true);
  };

  const handleVideoGeneration = async () => {
    // For now, just close the generate modal and open the completion modal
    // The actual generation logic can be implemented later if needed
    console.log('Video generation started');
    setIsGenerateModalOpen(false);
    setIsGenerationCompletedModalOpen(true);
    setGenerationStatus('completed');
  };

  const handleDebugClick = () => {
    console.log('Debug render started');
    // Open the generation modal in debug mode or handle differently
    setIsGenerateModalOpen(true);
    // You can add a debug mode state if needed to differentiate behavior
  };

  const handleAiButtonClick = (position: { x: number; y: number }) => {
    setAiPopupPosition(position);
    setIsAiPopupOpen(true);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
  };

  const renderSidebarComponent = () => {
    // If video lesson settings panel is active, show the corresponding settings
    if (activeSettingsPanel) {
      switch (activeSettingsPanel) {
        case 'script':
          return (
            <Script 
              onAiButtonClick={handleAiButtonClick} 
              videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
              componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
              currentSlideId={currentSlideId}
              onTextChange={handleTextChange}
            />
          );
        case 'text':
          return <TextSettings activeEditor={activeTextEditor} computedStyles={computedTextStyles} />;
        case 'image':
          return <ImageSettings />;
        case 'avatar':
          return <AvatarSettings />;
        case 'shape':
          return <ShapeSettings />;
        case 'media':
          return <ImageSettings />;
        case 'music':
          return (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-3">
              <Music />
            </div>
          );
        case 'background':
          return (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-3">
              <Background />
            </div>
          );
        case 'transition':
          const currentTransition = componentBasedSlideDeck?.transitions?.[activeTransitionIndex || 0] || null;
          return (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-3">
              <Transition 
                transitionIndex={activeTransitionIndex}
                currentTransition={currentTransition}
                onTransitionChange={handleTransitionChange}
              />
            </div>
          );
        case 'templates':
          return <TemplateSelector 
            currentSlideCount={isComponentBasedVideoLesson ? (componentBasedSlideDeck?.slides?.length || 0) : (videoLessonData?.slides?.length || 0)}
            onAddSlide={handleAddSlide}
          />;
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
          break;
      }
    }

    // Default to script panel
    return <Script 
      onAiButtonClick={handleAiButtonClick} 
      videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
      componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
      currentSlideId={currentSlideId}
      onTextChange={handleTextChange}
    />;
  };

  return (
    <VoiceProvider>
      <AvatarDataProvider>
        <div className="h-screen flex flex-col relative" style={{ backgroundColor: '#F2F2F4' }} onClick={() => {
          closeMenu();
        }}>
      {/* Product View Header */}
      <ProductViewHeader
        projectData={projectData}
        editableData={null}
        productId={projectId}
        showSmartEditor={showSmartEditor}
        setShowSmartEditor={setShowSmartEditor}
        scormEnabled={false}
        componentName="VideoLessonPresentationDisplay"
        t={t}
        showVideoEditorTools={true}
        activeSettingsPanel={activeSettingsPanel}
        onSettingsButtonClick={handleSettingsButtonClick}
        onShapesButtonClick={handleShapesButtonClick}
        onLanguageVariantModalOpen={handleLanguageVariantModalOpen}
        hideAiImproveButton={true}
        showVideoEditorActions={true}
        onPreviewClick={handlePreviewClick}
        onDebugClick={handleDebugClick}
        onGenerateClick={handleGenerateClick}
      />
      
      <div className="p-2" style={{ backgroundColor: '#F2F2F4' }}>
      {/* Main Content Area - Horizontal layout */}
      {/* Calculate available height: 100vh - ProductViewHeader (64px) - padding */}
      {/* Grid container for 1440px screens: 12 columns × 96.67px, 24px gutters, 16px horizontal padding (8px each side from p-2) */}
      <div 
        className="flex gap-4 mt-[5px] mx-auto mb-[5px]" 
        style={{ 
          height: 'calc(100vh - 85px)',
          maxWidth: '1440px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 96.67px)',
          gap: '24px'
        }}
      >
        {/* Left Sidebar - spans columns 1-3, full height of available space */}
        <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden bg-white border border-[#E0E0E0] rounded-lg" style={{ gridColumn: '1 / 4' }}>
          {renderSidebarComponent()}
        </div>

        {/* Main Container - spans columns 4-10, full height of available space */}
        <div className="h-full flex flex-col gap-2 overflow-visible" style={{ gridColumn: '4 / 11' }}>
          {/* Slide Container - Takes 80% of main container height */}
          <div 
            ref={slideContainerRef}
            className="h-[80%] rounded-md flex items-center justify-center relative overflow-visible"
          >
            {isComponentBasedVideoLesson && componentBasedSlideDeck ? (
              <div style={{
                zoom: slideScale,
                width: '1200px',
                height: '675px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                position: 'relative',
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
            ) : (
              <VideoLessonDisplay 
                dataToDisplay={videoLessonData || null}
                isEditing={true}
                className="h-full"
                onTextChange={handleTextChange}
              />
            )}
          </div>

          {/* Bottom Container - Takes 20% of main container height */}
          <SceneTimeline 
            scenes={[]} // Commented out regular scenes for now
            aspectRatio="16:9"
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

        {/* Right Panel - spans columns 11-12, full height of available space */}
        <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden bg-white border border-[#E0E0E0] rounded-lg p-3" style={{ gridColumn: '11 / 13' }}>
          {/* Music Section */}
          <div className="space-y-3 flex-shrink-0">
            {/* Music Title and Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium" style={{ color: '#171718' }}>Music</h3>
              <button
                onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{ backgroundColor: isMusicEnabled ? '#0F58F9' : '#E0E0E0' }}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isMusicEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Music Dropdown */}
            <div ref={musicDropdownRef} className={`relative ${!isMusicEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <button
                onClick={() => setShowMusicDropdown(!showMusicDropdown)}
                disabled={!isMusicEnabled}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E0E0E0' }}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#848485' }}>{selectedMusic}</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${showMusicDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="#848485" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showMusicDropdown && isMusicEnabled && (
                <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10" style={{ borderColor: '#E0E0E0' }}>
                  <button
                    onClick={() => {
                      setSelectedMusic('East London');
                      setShowMusicDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ color: '#848485' }}>East London</span>
                    </div>
                    {selectedMusic === 'East London' && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Volume Section */}
            <div className={`space-y-2 ${!isMusicEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Volume Label and Percentage */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#848485' }}>Volume</span>
                <span className="text-xs" style={{ color: '#848485' }}>{musicVolume}%</span>
              </div>

              {/* Volume Slider */}
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  disabled={!isMusicEnabled}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setMusicVolume(value);
                    const percentage = value + '%';
                    e.target.style.background = `linear-gradient(to right, #1058F9 0%, #1058F9 ${percentage}, #18181B33 ${percentage}, #18181B33 100%)`;
                  }}
                  className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  title={`Volume: ${musicVolume}%`}
                  style={{
                    background: `linear-gradient(to right, #1058F9 0%, #1058F9 ${musicVolume}%, #18181B33 ${musicVolume}%, #18181B33 100%)`
                  }}
                />
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: 1px solid #18181B80;
                  }

                  input[type="range"]::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: 1px solid #18181B80;
                  }

                  input[type="range"]:focus {
                    outline: none;
                  }

                  input[type="range"]:focus::-webkit-slider-thumb {
                    box-shadow: 0 0 0 2px rgba(16, 88, 249, 0.2);
                  }

                  input[type="range"]:focus::-moz-range-thumb {
                    box-shadow: 0 0 0 2px rgba(16, 88, 249, 0.2);
                  }
                `}</style>
              </div>
            </div>

            {/* Background Section */}
            <div className="space-y-3 flex-shrink-0">
              {/* Background Title and Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium" style={{ color: '#171718' }}>Background</h3>
                <button
                  onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: isBackgroundEnabled ? '#0F58F9' : '#E0E0E0' }}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isBackgroundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Background Buttons */}
              <div className={`space-y-2 ${!isBackgroundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Image Button */}
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    const modalWidth = 800;
                    const modalHeight = 400;
                    const gap = 10;
                    
                    // Calculate position to the left of the button
                    let x = rect.left - modalWidth - gap;
                    let y = rect.top;
                    
                    // Check if modal would go off the left edge
                    if (x < 0) {
                      x = gap;
                    }
                    
                    // Check if modal would go off the right edge
                    if (x + modalWidth > window.innerWidth) {
                      x = window.innerWidth - modalWidth - gap;
                    }
                    
                    // Check if modal would go off the bottom edge
                    if (y + modalHeight > window.innerHeight) {
                      y = window.innerHeight - modalHeight - gap;
                    }
                    
                    // Check if modal would go off the top edge
                    if (y < 0) {
                      y = gap;
                    }
                    
                    setMediaPopupPosition({ x, y });
                    setIsMediaPopupOpen(true);
                  }}
                  disabled={!isBackgroundEnabled}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 10L11.9427 7.94267C11.6926 7.69271 11.3536 7.55229 11 7.55229C10.6464 7.55229 10.3074 7.69271 10.0573 7.94267L4 14M3.33333 2H12.6667C13.403 2 14 2.59695 14 3.33333V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2ZM7.33333 6C7.33333 6.73638 6.73638 7.33333 6 7.33333C5.26362 7.33333 4.66667 6.73638 4.66667 6C4.66667 5.26362 5.26362 4.66667 6 4.66667C6.73638 4.66667 7.33333 5.26362 7.33333 6Z" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ color: '#848485' }}>None</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3V17M3 10H17" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Color Button */}
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    setColorPalettePosition({
                      x: rect.left,
                      y: rect.bottom + 5
                    });
                    setIsColorPaletteOpen(true);
                  }}
                  disabled={!isBackgroundEnabled}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ 
                      backgroundColor: backgroundColor,
                      borderColor: '#848485'
                    }}
                  />
                  <span style={{ color: '#848485' }}>{backgroundColor.replace('#', '')}</span>
                </button>
              </div>
            </div>

            {/* Scene Transition Section */}
            <div className="space-y-3 flex-shrink-0">
              {/* Scene Transition Title and Toggle */}
              <div className="flex items-center justify-between">
                <h3 
                  className="text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors" 
                  style={{ color: activeSettingsPanel === 'transition' ? '#0F58F9' : '#171718' }}
                  onClick={() => {
                    // Set the first transition as active (between slide 0 and 1)
                    if (componentBasedSlideDeck && componentBasedSlideDeck.slides.length > 1) {
                      setActiveTransitionIndex(0);
                      setActiveSettingsPanel('transition');
                    }
                  }}
                  title="Click to edit transitions"
                >
                  Scene transition
                </h3>
                <button
                  onClick={() => setIsTransitionEnabled(!isTransitionEnabled)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: isTransitionEnabled ? '#0F58F9' : '#E0E0E0' }}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isTransitionEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Transition Dropdown */}
              <div ref={transitionDropdownRef} className={`relative ${!isTransitionEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setShowTransitionDropdown(!showTransitionDropdown)}
                  disabled={!isTransitionEnabled}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.9388 8.09891C11.0849 8.2452 11.085 8.48237 10.9388 8.62862L6.36642 13.201C6.22016 13.3471 5.98296 13.3471 5.83671 13.201L1.26437 8.62862C1.11812 8.48237 1.11818 8.2452 1.26437 8.09891L5.83671 3.52657C5.98298 3.3803 6.22014 3.3803 6.36642 3.52657L10.9388 8.09891ZM2.05893 8.36377L6.10156 12.4064L10.1442 8.36377L6.10156 4.32113L2.05893 8.36377Z" fill="#848485"/>
                      <path d="M8.27148 3.79297L12.7662 8.28768L8.27148 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.5195 3.79297L15.0142 8.28768L10.5195 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ color: '#848485' }}>{selectedTransition}</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showTransitionDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="#848485" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showTransitionDropdown && isTransitionEnabled && (
                  <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-64 overflow-y-auto" style={{ borderColor: '#E0E0E0' }}>
                    {['None', 'Fade', 'Close', 'Crop', 'Blur', 'Open', 'Slide', 'Wipe', 'Smooth wipe'].map((transition) => (
                      <button
                        key={transition}
                        onClick={() => {
                          setSelectedTransition(transition);
                          setShowTransitionDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.9388 8.09891C11.0849 8.2452 11.085 8.48237 10.9388 8.62862L6.36642 13.201C6.22016 13.3471 5.98296 13.3471 5.83671 13.201L1.26437 8.62862C1.11812 8.48237 1.11818 8.2452 1.26437 8.09891L5.83671 3.52657C5.98298 3.3803 6.22014 3.3803 6.36642 3.52657L10.9388 8.09891ZM2.05893 8.36377L6.10156 12.4064L10.1442 8.36377L6.10156 4.32113L2.05893 8.36377Z" fill="#848485"/>
                            <path d="M8.27148 3.79297L12.7662 8.28768L8.27148 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.5195 3.79297L15.0142 8.28768L10.5195 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{ color: '#848485' }}>{transition}</span>
                        </div>
                        {selectedTransition === transition && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Popup */}
      {isMediaPopupOpen && (
        <div 
          style={{
            position: 'fixed',
            left: `${mediaPopupPosition.x}px`,
            top: `${mediaPopupPosition.y}px`,
            width: '800px',
            height: '400px',
            zIndex: 9999
          }}
        >
          <Media 
            isOpen={isMediaPopupOpen} 
            onClose={() => setIsMediaPopupOpen(false)} 
            title="Media Library"
            displayMode="popup"
            className="w-full h-full"
          />
        </div>
      )}

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

      {/* Play Modal */}
      <PlayModal 
        isOpen={isPlayModalOpen} 
        onClose={() => setIsPlayModalOpen(false)} 
        title={projectData?.name || 'Video Preview'}
      />

      {/* Generate Modal */}
      <GenerateModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
        title={projectData?.name || 'Video'}
        onGenerationStart={handleVideoGeneration}
        generationStatus={generationStatus}
        generationError={generationError}
      />

      {/* Generation Completed Modal */}
      <GenerationCompletedModal 
        isOpen={isGenerationCompletedModalOpen} 
        onClose={() => setIsGenerationCompletedModalOpen(false)} 
        videoTitle={projectData?.name || 'Video'}
      />

      {/* Portal Popup Menu */}
      {openMenuSceneId && menuPosition && typeof window !== 'undefined' && createPortal(
        <div 
          data-menu-popup
          className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 min-w-[140px] py-1"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <button 
            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            onClick={() => handleMenuAction('Save as Scene Layout', openMenuSceneId)}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M7.558 3.75H7.25a3.5 3.5 0 0 0-3.5 3.5v9.827a3.173 3.173 0 0 0 3.173 3.173v0m.635-16.5v2.442a2 2 0 0 0 2 2h2.346a2 2 0 0 0 2-2V3.75m-6.346 0h6.346m0 0h.026a3 3 0 0 1 2.122.879l3.173 3.173a3.5 3.5 0 0 1 1.025 2.475v6.8a3.173 3.173 0 0 1-3.173 3.173v0m-10.154 0V15a3 3 0 0 1 3-3h4.154a3 3 0 0 1 3 3v5.25m-10.154 0h10.154"/>
            </svg>
            Save as Scene Layout
          </button>
          <button 
            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            onClick={() => handleMenuAction('Duplicate Scene', openMenuSceneId)}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
              <g>
                <path d="M19.4 20H9.6a.6.6 0 0 1-.6-.6V9.6a.6.6 0 0 1 .6-.6h9.8a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6Z"/>
                <path d="M15 9V4.6a.6.6 0 0 0-.6-.6H4.6a.6.6 0 0 0-.6.6v9.8a.6.6 0 0 0 .6.6H9"/>
              </g>
            </svg>
            Duplicate Scene
          </button>
          <button 
            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            onClick={() => handleMenuAction('Insert Scene', openMenuSceneId)}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z"/>
            </svg>
            Insert Scene
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button 
            className={`w-full px-2 py-1.5 text-left text-xs transition-colors flex items-center gap-1.5 ${
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
            <svg className="w-3 h-3" fill="currentColor" fillRule="evenodd" viewBox="0 0 16 16">
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

      {/* Color Palette Popup */}
      <ColorPalettePopup
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onColorChange={(color) => {
          setBackgroundColor(color);
          setIsColorPaletteOpen(false);
        }}
        selectedColor={backgroundColor}
        position={colorPalettePosition}
      />
      </div>
      
        </div>
      </AvatarDataProvider>
    </VoiceProvider>
  );
}

