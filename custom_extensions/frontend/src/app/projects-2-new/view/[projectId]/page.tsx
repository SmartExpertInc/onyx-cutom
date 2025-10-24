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
import VideoPresentationRightPanel from '../components/VideoPresentationRightPanel';
import TextEditingToolbar from '@/components/TextEditingToolbar';
import { useLanguage } from '@/contexts/LanguageContext';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

export default function Projects2ViewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { t } = useLanguage();
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
  
  // NEW: Text editing toolbar state
  const [isTextToolbarVisible, setIsTextToolbarVisible] = useState<boolean>(false);
  const [textToolbarPosition, setTextToolbarPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // NEW: Text toolbar color picker state
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState<boolean>(false);
  const [textColorPickerPosition, setTextColorPickerPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [textRecentColors, setTextRecentColors] = useState<string[]>([]);
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
  
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

  const handleVideoGeneration = async (debugMode: boolean = false) => {
    console.log(`🎬 Video generation started - Debug mode: ${debugMode}`);
    
    if (debugMode) {
      console.log('🐛 [DEBUG_MODE] Generating slide-only video (no avatar) with 10s duration');
    } else {
      console.log('🎬 [STANDARD_MODE] Generating full video with avatar and 30s duration');
    }
    
    // Close the generate modal
    setIsGenerateModalOpen(false);
    
    // For now, show completion modal immediately
    // TODO: Implement actual video generation API call here
    setIsGenerationCompletedModalOpen(true);
    setGenerationStatus('completed');
    
    // The actual implementation would be:
    // 1. Prepare video data (slides, transitions, voiceover, etc.)
    // 2. Call backend API with debugMode flag
    // 3. Poll for completion
    // 4. Show completion modal when done
  };

  const handleDebugClick = () => {
    console.log('🐛 Debug render started - skipping modal, going directly to debug generation');
    // Close the generate modal if it's open
    setIsGenerateModalOpen(false);
    // Start debug video generation directly (like the Debug button inside the modal in projects-2)
    handleVideoGeneration(true);
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
        <div className="h-screen flex flex-col relative" style={{ backgroundColor: '#F2F2F4' }} onClick={(e) => {
          closeMenu();
          // Hide text toolbar and color picker when clicking outside
          const target = e.target as HTMLElement;
          
          // Check if clicking inside any protected areas
          const isTextSettingsPanel = target.closest('[data-textsettings-panel]');
          const isProseMirror = target.closest('.ProseMirror');
          const isToolbar = target.closest('.text-editing-toolbar');
          const isColorPalette = target.closest('[data-color-palette-popup]');
          const isColorButton = target.closest('[data-color-picker-button]');
          
          const isProtectedArea = isTextSettingsPanel || isProseMirror || isToolbar || isColorPalette || isColorButton;
          
          if (!isProtectedArea) {
            console.log('🔍 Main container click - closing toolbar and color picker');
            setIsTextToolbarVisible(false);
            setIsTextColorPickerOpen(false);
          }
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
                    // setActiveSettingsPanel('text'); // Disabled - only show toolbar
                    
                    // Update current text color
                    const inlineColor = editor?.getAttributes?.('textStyle')?.color;
                    const rawColor = inlineColor || computedStyles?.color || '#000000';
                    // Convert RGB to hex if needed
                    let hexColor = rawColor;
                    if (rawColor.startsWith('rgb')) {
                      const match = rawColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                      if (match) {
                        const r = parseInt(match[1]).toString(16).padStart(2, '0');
                        const g = parseInt(match[2]).toString(16).padStart(2, '0');
                        const b = parseInt(match[3]).toString(16).padStart(2, '0');
                        hexColor = `#${r}${g}${b}`;
                      }
                    }
                    setCurrentTextColor(hexColor);
                    
                    // Calculate toolbar position above the text element
                    if (editor && editor.view && editor.view.dom) {
                      const editorElement = editor.view.dom as HTMLElement;
                      const rect = editorElement.getBoundingClientRect();
                      const toolbarHeight = 50; // Approximate toolbar height
                      const toolbarWidth = 500; // Approximate toolbar width
                      
                      // Position above the text element, centered
                      let x = rect.left + (rect.width / 2) - (toolbarWidth / 2);
                      let y = rect.top - toolbarHeight - 10; // 10px gap
                      
                      // Keep within viewport
                      if (x < 10) x = 10;
                      if (x + toolbarWidth > window.innerWidth - 10) {
                        x = window.innerWidth - toolbarWidth - 10;
                      }
                      if (y < 10) {
                        y = rect.bottom + 10; // Position below if not enough space above
                      }
                      
                      setTextToolbarPosition({ x, y });
                      setIsTextToolbarVisible(true);
                    }
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
        <VideoPresentationRightPanel
          isMusicEnabled={isMusicEnabled}
          setIsMusicEnabled={setIsMusicEnabled}
          showMusicDropdown={showMusicDropdown}
          setShowMusicDropdown={setShowMusicDropdown}
          selectedMusic={selectedMusic}
          setSelectedMusic={setSelectedMusic}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          isBackgroundEnabled={isBackgroundEnabled}
          setIsBackgroundEnabled={setIsBackgroundEnabled}
          backgroundColor={backgroundColor}
          setMediaPopupPosition={setMediaPopupPosition}
          setIsMediaPopupOpen={setIsMediaPopupOpen}
          setColorPalettePosition={setColorPalettePosition}
          setIsColorPaletteOpen={setIsColorPaletteOpen}
          isTransitionEnabled={isTransitionEnabled}
          setIsTransitionEnabled={setIsTransitionEnabled}
          showTransitionDropdown={showTransitionDropdown}
          setShowTransitionDropdown={setShowTransitionDropdown}
          selectedTransition={selectedTransition}
          setSelectedTransition={setSelectedTransition}
          activeSettingsPanel={activeSettingsPanel}
          setActiveSettingsPanel={setActiveSettingsPanel}
          componentBasedSlideDeck={componentBasedSlideDeck}
          setActiveTransitionIndex={setActiveTransitionIndex}
        />
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
            title={t('videoEditor.mediaLibrary', 'Media Library')}
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
        title={projectData?.name || t('videoEditor.videoPreview', 'Video Preview')}
      />

      {/* Generate Modal */}
      <GenerateModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
        title={projectData?.name || t('videoEditor.video', 'Video')}
        onGenerationStart={handleVideoGeneration}
        generationStatus={generationStatus}
        generationError={generationError}
      />

      {/* Generation Completed Modal */}
      <GenerationCompletedModal 
        isOpen={isGenerationCompletedModalOpen} 
        onClose={() => setIsGenerationCompletedModalOpen(false)} 
        videoTitle={projectData?.name || t('videoEditor.video', 'Video')}
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
            {t('videoEditor.menu.saveAsSceneLayout', 'Save as Scene Layout')}
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
            {t('videoEditor.menu.duplicateScene', 'Duplicate Scene')}
          </button>
          <button 
            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            onClick={() => handleMenuAction('Insert Scene', openMenuSceneId)}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z"/>
            </svg>
            {t('videoEditor.menu.insertScene', 'Insert Scene')}
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
            {isVideoLessonMode ? t('videoEditor.menu.deleteSlide', 'Delete Slide') : t('videoEditor.menu.deleteScene', 'Delete Scene')}
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

      {/* Text Editing Toolbar */}
      <TextEditingToolbar
        activeEditor={activeTextEditor}
        computedStyles={computedTextStyles}
        position={textToolbarPosition}
        isVisible={isTextToolbarVisible}
        currentColor={currentTextColor}
        onColorPickerOpen={(pos) => {
          setTextColorPickerPosition(pos);
          setIsTextColorPickerOpen(true);
        }}
        onColorPickerClose={() => setIsTextColorPickerOpen(false)}
      />

      {/* Text Color Picker - Rendered at page level */}
      <ColorPalettePopup
        isOpen={isTextColorPickerOpen}
        onClose={() => {
          console.log('🎨 Text color picker closing');
          setIsTextColorPickerOpen(false);
        }}
        onColorChange={(color) => {
          console.log('🎨 Text color change:', color);
          console.log('🎨 Active editor status:', {
            exists: !!activeTextEditor,
            isDestroyed: activeTextEditor?.isDestroyed,
            hasView: !!activeTextEditor?.view
          });
          
          setCurrentTextColor(color);
          
          if (activeTextEditor && !activeTextEditor.isDestroyed && activeTextEditor.view) {
            try {
              // Apply color using TipTap's color command
              activeTextEditor.chain().focus().setColor(color).run();
              console.log('✅ Color applied to editor:', color);
              
              // Close color picker after applying color
              setTimeout(() => {
                setIsTextColorPickerOpen(false);
              }, 100);
            } catch (error) {
              console.warn('❌ Color change failed:', error);
            }
          } else {
            console.warn('❌ No active editor available', {
              activeTextEditor,
              isDestroyed: activeTextEditor?.isDestroyed
            });
          }
        }}
        selectedColor={currentTextColor}
        position={textColorPickerPosition}
        recentColors={textRecentColors}
        onRecentColorChange={setTextRecentColors}
      />
      </div>
      
        </div>
      </AvatarDataProvider>
    </VoiceProvider>
  );
}

