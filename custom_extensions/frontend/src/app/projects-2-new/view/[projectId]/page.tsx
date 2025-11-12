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
import AvatarPopup from '../../../projects-2/view/components/AvatarPopup';
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
import AvatarDataProvider, { useAvatarData } from '../../../projects-2/view/components/AvatarDataService';
import { VoiceProvider } from '@/contexts/VoiceContext';
import VideoPresentationRightPanel from '../../view/components/VideoPresentationRightPanel';
import BrandKitRightPanel from '../../view/components/BrandKitRightPanel';
import AvatarRightPanel from '../components/AvatarRightPanel';
import ShapeRightPanel from '../components/ShapeRightPanel';
import ImageRightPanel from '../components/ImageRightPanel';
import VideoRightPanel from '../components/VideoRightPanel';
import MusicRightPanel from '../components/MusicRightPanel';
import TextRightPanel from '../components/TextRightPanel';
import TextEditingToolbar from '@/components/TextEditingToolbar';
import TariffPlanModal from '@/components/ui/tariff-plan-modal';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimateButton from '@/components/ui/animate-button';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

type MediaOption = 'library' | 'image' | 'video' | 'music' | 'icon' | 'aiImage';

function Projects2ViewPageContent() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { t } = useLanguage();
  const { avatarData } = useAvatarData();
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState<boolean>(false);
  const [isTextPopupOpen, setIsTextPopupOpen] = useState<boolean>(false);
  const [isShapesPopupOpen, setIsShapesPopupOpen] = useState<boolean>(false);
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState<boolean>(false);
  const [showAvatarRightPanel, setShowAvatarRightPanel] = useState<boolean>(false);
  const [showShapeRightPanel, setShowShapeRightPanel] = useState<boolean>(false);
  const [showImageRightPanel, setShowImageRightPanel] = useState<boolean>(false);
  const [showVideoRightPanel, setShowVideoRightPanel] = useState<boolean>(false);
  const [showMusicRightPanel, setShowMusicRightPanel] = useState<boolean>(false);
  const [selectedMediaOption, setSelectedMediaOption] = useState<MediaOption>('image');
  const [showTextRightPanel, setShowTextRightPanel] = useState<boolean>(false);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState<boolean>(false);
  const [isLanguageVariantModalOpen, setIsLanguageVariantModalOpen] = useState<boolean>(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isGenerationCompletedModalOpen, setIsGenerationCompletedModalOpen] = useState<boolean>(false);
const [isTariffPlanModalOpen, setIsTariffPlanModalOpen] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [textPopupPosition, setTextPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shapesPopupPosition, setShapesPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [avatarPopupPosition, setAvatarPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
  const [isAnimateButtonVisible, setIsAnimateButtonVisible] = useState<boolean>(false);
  const [animateButtonPosition, setAnimateButtonPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateAnimateButtonPosition = () => {
      if (!isAnimateButtonVisible || !activeTextEditor) {
        return;
      }

      try {
        const editorElement = activeTextEditor?.view?.dom as HTMLElement | null;
        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          setAnimateButtonPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        }
      } catch (error) {
        console.warn('Failed to recalculate animate button position:', error);
      }
    };

    window.addEventListener('resize', updateAnimateButtonPosition);
    window.addEventListener('scroll', updateAnimateButtonPosition, true);

    updateAnimateButtonPosition();

    return () => {
      window.removeEventListener('resize', updateAnimateButtonPosition);
      window.removeEventListener('scroll', updateAnimateButtonPosition, true);
    };
  }, [isAnimateButtonVisible, activeTextEditor]);
  
  // NEW: Track active transition for Transition panel
  const [activeTransitionIndex, setActiveTransitionIndex] = useState<number | null>(null);

  // Music panel state
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [showMusicDropdown, setShowMusicDropdown] = useState<boolean>(false);
  const [selectedMusic, setSelectedMusic] = useState<string>('East London');
  const [musicVolume, setMusicVolume] = useState<number>(50);
  const [isPlayEverywhereEnabled, setIsPlayEverywhereEnabled] = useState<boolean>(true);

  // Avatar appearance state (separate from music)
  const [isAppearanceEnabled, setIsAppearanceEnabled] = useState<boolean>(true);
  const [showAppearanceDropdown, setShowAppearanceDropdown] = useState<boolean>(false);
  const [selectedAppearance, setSelectedAppearance] = useState<string>('Transparent');
  const [appearanceVolume, setAppearanceVolume] = useState<number>(50);

  // Background panel state
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState<boolean>(true);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [colorPalettePosition, setColorPalettePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mediaPopupPosition, setMediaPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [colorPaletteContext, setColorPaletteContext] = useState<string>('background');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  // Shape color state
  const [shapeColor, setShapeColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('');

  // Scene transition panel state
  const [isTransitionEnabled, setIsTransitionEnabled] = useState<boolean>(true);

  // Slide container scaling state
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
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
    // Close other panels
    setShowTextRightPanel(false);
    setShowShapeRightPanel(false);
    setShowAvatarRightPanel(false);
    setShowImageRightPanel(false);
    setShowVideoRightPanel(false);
    setShowMusicRightPanel(false);
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
    // Close other panels
    setShowTextRightPanel(false);
    setShowShapeRightPanel(false);
    setShowAvatarRightPanel(false);
    setShowImageRightPanel(false);
    setShowVideoRightPanel(false);
    setShowMusicRightPanel(false);
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
    
    const { applyToAll, ...transitionWithoutApplyFlag } = transitionData;

    // Check if "Apply to all" is enabled
    if (applyToAll) {
      // Apply the same transition to ALL transition slots
      for (let i = 0; i < transitions.length; i++) {
        transitions[i] = { ...transitionWithoutApplyFlag, applyToAll: false };
      }
    } else {
      // Update only the specific transition
      transitions[activeTransitionIndex] = { ...transitionWithoutApplyFlag, applyToAll: false };
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

  // Cleanup text editor blur listener on unmount
  useEffect(() => {
    return () => {
      if (activeTextEditor && (activeTextEditor as any).__cleanupBlur) {
        (activeTextEditor as any).__cleanupBlur();
      }
    };
  }, [activeTextEditor]);

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
  const handleMediaOptionSelect = (option: string) => {
    const mediaOption = option as MediaOption;
    setSelectedMediaOption(mediaOption);

    if (mediaOption === 'image' || mediaOption === 'icon') {
      setShowImageRightPanel(true);
      setShowVideoRightPanel(false);
      setShowMusicRightPanel(false);
      setShowShapeRightPanel(false);
      setShowAvatarRightPanel(false);
      setShowTextRightPanel(false);
    } else if (mediaOption === 'video') {
      setShowVideoRightPanel(true);
      setShowImageRightPanel(false);
      setShowMusicRightPanel(false);
      setShowShapeRightPanel(false);
      setShowAvatarRightPanel(false);
      setShowTextRightPanel(false);
    } else if (mediaOption === 'music') {
      setShowMusicRightPanel(true);
      setShowImageRightPanel(false);
      setShowVideoRightPanel(false);
      setShowShapeRightPanel(false);
      setShowAvatarRightPanel(false);
      setShowTextRightPanel(false);
    } else {
      setShowImageRightPanel(false);
      setShowMusicRightPanel(false);
      setShowVideoRightPanel(false);
    }
  };

  const handleSettingsButtonClick = (settingsType: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (settingsType === 'media' && event) {
      // Special handling for media button - open media popup centered under the button
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const modalWidth = 950;
      const modalHeight = 420;
      const gap = 10;
      
      // Calculate position centered under the button, shifted to the left
      let x = rect.left + (rect.width / 2) - (modalWidth / 2) - 110;
      let y = 70; // Fixed position below the header, matching other popups
      
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
      setShowImageRightPanel(true);
      setShowVideoRightPanel(false);
      setShowMusicRightPanel(false);
      setSelectedMediaOption('image');
      setShowShapeRightPanel(false);
      setShowAvatarRightPanel(false);
      setShowTextRightPanel(false);
      // Close other popups if open
      setIsTextPopupOpen(false);
      setIsShapesPopupOpen(false);
      setIsAvatarPopupOpen(false);
      setIsAiPopupOpen(false);
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
    setShowShapeRightPanel(true);
    setShowAvatarRightPanel(false); // Close avatar panel when opening shape panel
    setShowTextRightPanel(false); // Close text panel when opening shape panel
    setShowImageRightPanel(false);
    setShowMusicRightPanel(false);
    setShowVideoRightPanel(false);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsAvatarPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleTextButtonClick = (position: { x: number; y: number }) => {
    setTextPopupPosition(position);
    setIsTextPopupOpen(true);
    // Note: TextRightPanel is now only opened when text is actually focused/edited
    // setShowTextRightPanel(true); // REMOVED - panel opens automatically when text is clicked
    setShowShapeRightPanel(false); // Close shape panel when opening text popup
    setShowAvatarRightPanel(false); // Close avatar panel when opening text popup
    setShowImageRightPanel(false);
    setShowMusicRightPanel(false);
    setShowVideoRightPanel(false);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsShapesPopupOpen(false);
    setIsAvatarPopupOpen(false);
    setIsAiPopupOpen(false);
  };

  const handleAvatarButtonClick = (position: { x: number; y: number }) => {
    setAvatarPopupPosition(position);
    setIsAvatarPopupOpen(true);
    setShowAvatarRightPanel(true);
    setShowShapeRightPanel(false); // Close shape panel when opening avatar panel
    setShowTextRightPanel(false); // Close text panel when opening avatar panel
    setShowImageRightPanel(false);
    setShowMusicRightPanel(false);
    setShowVideoRightPanel(false);
    // Close other popups if open
    setIsMediaPopupOpen(false);
    setIsTextPopupOpen(false);
    setIsShapesPopupOpen(false);
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

  const renderSidebarComponent = () => (
    <Script 
      onAiButtonClick={handleAiButtonClick} 
      videoLessonData={isComponentBasedVideoLesson ? undefined : videoLessonData}
      componentBasedSlideDeck={isComponentBasedVideoLesson ? componentBasedSlideDeck : undefined}
      currentSlideId={currentSlideId}
      onTextChange={handleTextChange}
    />
  );

  return (
        <div 
          className="h-screen flex flex-col relative" 
          style={{ backgroundColor: '#F2F2F4' }} 
          onClick={(e) => {
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
              console.log('🔍 MAIN CONTAINER ONCLICK - CLOSING TOOLBAR AND COLOR PICKER', {
                targetClass: target.className,
                targetTag: target.tagName,
                targetId: target.id
              });
              setIsTextToolbarVisible(false);
              setIsTextColorPickerOpen(false);
              setIsAnimateButtonVisible(false);
            } else {
              console.log('🔍 MAIN CONTAINER ONCLICK - PROTECTED AREA, KEEPING OPEN', {
                isColorPalette: !!isColorPalette,
                isToolbar: !!isToolbar,
                isColorButton: !!isColorButton,
                targetElement: target.className
              });
            }
          }}
          onMouseDown={(e) => {
            // Also check on mouseDown to prevent toolbar closing
            const target = e.target as HTMLElement;
            const isColorPalette = target.closest('[data-color-palette-popup]');
            
            if (isColorPalette) {
              console.log('🔍 MAIN CONTAINER ONMOUSEDOWN - COLOR PALETTE CLICK, PREVENTING CLOSE');
              e.stopPropagation();
            }
          }}
        >
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
        onTextButtonClick={handleTextButtonClick}
        onAvatarButtonClick={handleAvatarButtonClick}
        onLanguageVariantModalOpen={handleLanguageVariantModalOpen}
        hideAiImproveButton={true}
        isMediaPopupOpen={isMediaPopupOpen}
        isTextPopupOpen={isTextPopupOpen}
        isShapesPopupOpen={isShapesPopupOpen}
        isAvatarPopupOpen={isAvatarPopupOpen}
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
                    console.log('✏️ EDITOR ACTIVE:', { field, hasEditor: !!editor, computedStyles });
                    
                    // Cleanup previous editor's blur listener if exists
                    if (activeTextEditor && (activeTextEditor as any).__cleanupBlur) {
                      (activeTextEditor as any).__cleanupBlur();
                    }
                    
                    if (editor) {
                      // Editor became active - open TextRightPanel
                      setActiveTextEditor(editor);
                      setComputedTextStyles(computedStyles || null);
                      
                      // Open TextRightPanel and close others
                      setShowTextRightPanel(true);
                      setShowShapeRightPanel(false);
                      setShowAvatarRightPanel(false);
                      setShowMusicRightPanel(false);
                      setShowVideoRightPanel(false);
                      
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

                      try {
                        const editorElement = editor?.view?.dom as HTMLElement | null;
                        if (editorElement) {
                          const rect = editorElement.getBoundingClientRect();
                          setAnimateButtonPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                          setIsAnimateButtonVisible(true);
                        } else {
                          setIsAnimateButtonVisible(false);
                        }
                      } catch (error) {
                        console.warn('Failed to calculate animate button position:', error);
                        setIsAnimateButtonVisible(false);
                      }
                      
                      // Listen for editor blur to close the panel
                      const handleBlur = () => {
                        console.log('✏️ EDITOR BLUR - Closing TextRightPanel');
                        // Small delay to allow clicking on panel controls
                        setTimeout(() => {
                          // Check if user is interacting with TextRightPanel
                          const activeElement = document.activeElement;
                          const isInteractingWithPanel = activeElement?.closest('[data-text-right-panel]');
                          
                          if (!isInteractingWithPanel) {
                            setShowTextRightPanel(false);
                            setActiveTextEditor(null);
                            setComputedTextStyles(null);
                            setIsAnimateButtonVisible(false);
                          }
                        }, 150);
                      };
                      
                      // Add blur listener
                      editor.on('blur', handleBlur);
                      
                      // Cleanup function stored on editor
                      (editor as any).__cleanupBlur = () => {
                        editor.off('blur', handleBlur);
                      };
                    } else {
                      // Editor became inactive - close TextRightPanel
                      console.log('✏️ EDITOR INACTIVE - Closing TextRightPanel');
                      setShowTextRightPanel(false);
                      setActiveTextEditor(null);
                      setComputedTextStyles(null);
                      setIsAnimateButtonVisible(false);
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
        <div ref={rightPanelRef} className="h-full flex flex-col overflow-y-auto overflow-x-hidden bg-white border border-[#E0E0E0] rounded-lg p-2" style={{ gridColumn: '11 / 13' }}>
          {activeSettingsPanel === 'templates' ? (
            <TemplateSelector 
              currentSlideCount={isComponentBasedVideoLesson ? (componentBasedSlideDeck?.slides?.length || 0) : (videoLessonData?.slides?.length || 0)}
              onAddSlide={handleAddSlide}
            />
          ) : activeSettingsPanel === 'transition' ? (
            <Transition 
              transitionIndex={activeTransitionIndex}
              currentTransition={componentBasedSlideDeck?.transitions?.[activeTransitionIndex || 0] || null}
              onTransitionChange={handleTransitionChange}
              onBack={() => setActiveSettingsPanel(null)}
            />
          ) : showShapeRightPanel ? (
            <ShapeRightPanel
              isAppearanceEnabled={isAppearanceEnabled}
              setIsAppearanceEnabled={setIsAppearanceEnabled}
              showAppearanceDropdown={showAppearanceDropdown}
              setShowAppearanceDropdown={setShowAppearanceDropdown}
              selectedAppearance={selectedAppearance}
              setSelectedAppearance={setSelectedAppearance}
              appearanceVolume={appearanceVolume}
              setAppearanceVolume={setAppearanceVolume}
              isBackgroundEnabled={isBackgroundEnabled}
              setIsBackgroundEnabled={setIsBackgroundEnabled}
              backgroundColor={backgroundColor}
              setMediaPopupPosition={setMediaPopupPosition}
              setIsMediaPopupOpen={setIsMediaPopupOpen}
              setColorPalettePosition={(pos) => {
                setColorPalettePosition(pos);
                setColorPaletteContext('shape');
              }}
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
              shapeColor={shapeColor}
              onShapeColorChange={setShapeColor}
              strokeColor={strokeColor}
              onStrokeColorChange={setStrokeColor}
              onColorPaletteContextChange={setColorPaletteContext}
              onClose={() => setShowShapeRightPanel(false)}
              rightPanelRef={rightPanelRef}
            />
          ) : showTextRightPanel ? (
            <TextRightPanel
              isAppearanceEnabled={isAppearanceEnabled}
              setIsAppearanceEnabled={setIsAppearanceEnabled}
              showAppearanceDropdown={showAppearanceDropdown}
              setShowAppearanceDropdown={setShowAppearanceDropdown}
              selectedAppearance={selectedAppearance}
              setSelectedAppearance={setSelectedAppearance}
              appearanceVolume={appearanceVolume}
              setAppearanceVolume={setAppearanceVolume}
              isBackgroundEnabled={isBackgroundEnabled}
              setIsBackgroundEnabled={setIsBackgroundEnabled}
              backgroundColor={backgroundColor}
              setMediaPopupPosition={setMediaPopupPosition}
              setIsMediaPopupOpen={setIsMediaPopupOpen}
              setColorPalettePosition={(pos) => {
                setColorPalettePosition(pos);
                setColorPaletteContext('shape');
              }}
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
              shapeColor={shapeColor}
              onShapeColorChange={setShapeColor}
              strokeColor={strokeColor}
              onStrokeColorChange={setStrokeColor}
              onColorPaletteContextChange={setColorPaletteContext}
              activeEditor={activeTextEditor}
              computedStyles={computedTextStyles}
              rightPanelRef={rightPanelRef}
            />
          ) : showAvatarRightPanel ? (
            <AvatarRightPanel
              isAppearanceEnabled={isAppearanceEnabled}
              setIsAppearanceEnabled={setIsAppearanceEnabled}
              showAppearanceDropdown={showAppearanceDropdown}
              setShowAppearanceDropdown={setShowAppearanceDropdown}
              selectedAppearance={selectedAppearance}
              setSelectedAppearance={setSelectedAppearance}
              appearanceVolume={appearanceVolume}
              setAppearanceVolume={setAppearanceVolume}
              isBackgroundEnabled={isBackgroundEnabled}
              setIsBackgroundEnabled={setIsBackgroundEnabled}
              backgroundColor={backgroundColor}
              setMediaPopupPosition={setMediaPopupPosition}
              setIsMediaPopupOpen={setIsMediaPopupOpen}
              setColorPalettePosition={(pos) => {
                setColorPalettePosition(pos);
                setColorPaletteContext('background');
              }}
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
              onClose={() => setShowAvatarRightPanel(false)}
            />
          ) : showMusicRightPanel ? (
            <MusicRightPanel
              isMusicEnabled={isMusicEnabled}
              setIsMusicEnabled={setIsMusicEnabled}
              showMusicDropdown={showMusicDropdown}
              setShowMusicDropdown={setShowMusicDropdown}
              selectedMusic={selectedMusic}
              setSelectedMusic={setSelectedMusic}
              musicVolume={musicVolume}
              setMusicVolume={setMusicVolume}
              isPlayEverywhereEnabled={isPlayEverywhereEnabled}
              setIsPlayEverywhereEnabled={setIsPlayEverywhereEnabled}
              onReplaceMusic={() => {
                if (typeof window !== 'undefined') {
                  const modalWidth = 950;
                  const modalHeight = 420;
                  const gap = 10;

                  let x = window.innerWidth / 2 - modalWidth / 2;
                  let y = 70;

                  if (x < gap) {
                    x = gap;
                  }

                  if (x + modalWidth > window.innerWidth - gap) {
                    x = window.innerWidth - modalWidth - gap;
                  }

                  if (y + modalHeight > window.innerHeight - gap) {
                    y = window.innerHeight - modalHeight - gap;
                  }

                  if (y < gap) {
                    y = gap;
                  }

                  setMediaPopupPosition({ x, y });
                }

                setSelectedMediaOption('music');
                setIsMediaPopupOpen(true);
                setShowImageRightPanel(false);
                setShowShapeRightPanel(false);
                setShowAvatarRightPanel(false);
                setShowTextRightPanel(false);
                setShowVideoRightPanel(false);
                setShowMusicRightPanel(true);
              }}
            />
          ) : showVideoRightPanel ? (
            <VideoRightPanel
              isAppearanceEnabled={isAppearanceEnabled}
              setIsAppearanceEnabled={setIsAppearanceEnabled}
              showAppearanceDropdown={showAppearanceDropdown}
              setShowAppearanceDropdown={setShowAppearanceDropdown}
              selectedAppearance={selectedAppearance}
              setSelectedAppearance={setSelectedAppearance}
              appearanceVolume={appearanceVolume}
              setAppearanceVolume={setAppearanceVolume}
              isBackgroundEnabled={isBackgroundEnabled}
              setIsBackgroundEnabled={setIsBackgroundEnabled}
              backgroundColor={backgroundColor}
              setMediaPopupPosition={setMediaPopupPosition}
              setIsMediaPopupOpen={setIsMediaPopupOpen}
              setColorPalettePosition={(pos) => {
                setColorPalettePosition(pos);
                setColorPaletteContext('shape');
              }}
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
              shapeColor={shapeColor}
              onShapeColorChange={setShapeColor}
              strokeColor={strokeColor}
              onStrokeColorChange={setStrokeColor}
              onColorPaletteContextChange={setColorPaletteContext}
              mediaType="video"
              rightPanelRef={rightPanelRef}
            />
          ) : showImageRightPanel ? (
            <ImageRightPanel
              isAppearanceEnabled={isAppearanceEnabled}
              setIsAppearanceEnabled={setIsAppearanceEnabled}
              showAppearanceDropdown={showAppearanceDropdown}
              setShowAppearanceDropdown={setShowAppearanceDropdown}
              selectedAppearance={selectedAppearance}
              setSelectedAppearance={setSelectedAppearance}
              appearanceVolume={appearanceVolume}
              setAppearanceVolume={setAppearanceVolume}
              isBackgroundEnabled={isBackgroundEnabled}
              setIsBackgroundEnabled={setIsBackgroundEnabled}
              backgroundColor={backgroundColor}
              setMediaPopupPosition={setMediaPopupPosition}
              setIsMediaPopupOpen={setIsMediaPopupOpen}
              setColorPalettePosition={(pos) => {
                setColorPalettePosition(pos);
                setColorPaletteContext('shape');
              }}
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
              shapeColor={shapeColor}
              onShapeColorChange={setShapeColor}
              strokeColor={strokeColor}
              onStrokeColorChange={setStrokeColor}
              onColorPaletteContextChange={setColorPaletteContext}
              mediaType={selectedMediaOption === 'icon' ? 'icon' : 'image'}
              rightPanelRef={rightPanelRef}
            />
          ) : (
            <BrandKitRightPanel
              setColorPalettePosition={(pos) => {
                setColorPalettePosition(pos);
                setColorPaletteContext('brand');
              }}
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
              rightPanelRef={rightPanelRef}
              onColorPaletteContextChange={(context) => setColorPaletteContext(context)}
              onUpgradeClick={() => setIsTariffPlanModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Media Popup */}
      {isMediaPopupOpen && (
        <div 
          style={{
            position: 'fixed',
            left: `${mediaPopupPosition.x}px`,
            top: `${mediaPopupPosition.y}px`,
            width: '950px',
            height: '450px',
            zIndex: 9999
          }}
        >
          <Media 
            isOpen={isMediaPopupOpen} 
            onClose={() => setIsMediaPopupOpen(false)} 
            title={t('videoEditor.mediaLibrary', 'Media Library')}
            displayMode="popup"
            className="w-full h-full"
            onOptionSelect={handleMediaOptionSelect}
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

      {/* Avatar Popup */}
      <AvatarPopup 
        isOpen={isAvatarPopupOpen} 
        onClose={() => {
          // Only close the popup, not the right panel
          setIsAvatarPopupOpen(false);
        }}
        position={avatarPopupPosition}
        onAvatarSelect={(avatar, variant) => {
          console.log('Avatar selected:', avatar, variant);
          // Only close the popup, not the right panel
          setIsAvatarPopupOpen(false);
          // TODO: Handle avatar selection - update video lesson data with selected avatar
        }}
        avatarData={avatarData}
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
          // If TextRightPanel is open and we're changing color, it's text color
          if (showTextRightPanel && activeTextEditor && !activeTextEditor.isDestroyed && activeTextEditor.view) {
            try {
              activeTextEditor.chain().focus().setColor(color).run();
              setCurrentTextColor(color);
            } catch (error) {
              console.warn('Text color change failed:', error);
            }
          } else if (colorPaletteContext === 'shape') {
            setShapeColor(color);
          } else if (colorPaletteContext === 'stroke') {
            setStrokeColor(color);
          } else if (
            colorPaletteContext === 'brand' ||
            (typeof colorPaletteContext === 'string' && colorPaletteContext.startsWith('brand-'))
          ) {
            window.dispatchEvent(
              new CustomEvent('brand-color-selected', {
                detail: { context: colorPaletteContext, color },
              })
            );
          } else {
            setBackgroundColor(color);
          }
          // Don't close the color picker - let user continue adjusting colors
        }}
        selectedColor={
          showTextRightPanel ? currentTextColor :
          colorPaletteContext === 'shape' ? shapeColor : 
          colorPaletteContext === 'stroke' ? strokeColor : 
          backgroundColor
        }
        position={colorPalettePosition}
        recentColors={recentColors}
        onRecentColorChange={setRecentColors}
      />

      <TariffPlanModal
        open={isTariffPlanModalOpen}
        onOpenChange={setIsTariffPlanModalOpen}
      />

      <AnimateButton
        isVisible={isAnimateButtonVisible}
        position={animateButtonPosition}
        onClick={() => {
          console.log('Animate button clicked', {
            activeEditorField: activeTextEditor ? activeTextEditor.storage?.fieldName : null,
          });
        }}
      />

      {/* Text Editing Toolbar - Hidden since we're using TextRightPanel instead */}
      {/* 
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
      */}

      {/* Text Color Picker - No longer needed, using ColorPalettePopup from TextRightPanel instead */}
      {/* 
      <ColorPalettePopup
        isOpen={isTextColorPickerOpen}
        onClose={() => {
          console.log('🎨 TEXT COLOR PICKER CLOSING VIA ONCLOSE');
          setIsTextColorPickerOpen(false);
        }}
        onColorChange={(color) => {
          setCurrentTextColor(color);
          
          if (activeTextEditor && !activeTextEditor.isDestroyed && activeTextEditor.view) {
            try {
              activeTextEditor.chain().focus().setColor(color).run();
              setIsTextColorPickerOpen(false);
            } catch (error) {
              console.error('❌ COLOR CHANGE FAILED:', error);
            }
          }
        }}
        selectedColor={currentTextColor}
        position={textColorPickerPosition}
        recentColors={textRecentColors}
        onRecentColorChange={setTextRecentColors}
      />
      */}
      </div>
      
        </div>
  );
}

export default function Projects2ViewPage() {
  return (
    <VoiceProvider>
      <AvatarDataProvider>
        <Projects2ViewPageContent />
      </AvatarDataProvider>
    </VoiceProvider>
  );
}
