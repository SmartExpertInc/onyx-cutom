"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ChevronLeft, ChevronRight, Plus, FileText, Clipboard, ChevronDown, X, Sparkles, ChevronDown as ArrowDown, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { ComponentBasedSlideRenderer } from './ComponentBasedSlideRenderer';
import { getAllTemplates, getTemplate } from './templates/registry';
import AIImageGenerationModal from './AIImageGenerationModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import './PresentationLayout.css';

const VIEW_MODE_MAX_WIDTH = 1152; // Tailwind max-w-6xl (72rem)
const VIEW_MODE_MIN_WIDTH = 320;
const VIEW_MODE_SIDEBAR_WIDTH = 400;
const VIEW_MODE_HORIZONTAL_GAP = 32; // px allowance when sidebar is beside slides
const DEFAULT_SLIDE_WIDTH = VIEW_MODE_MAX_WIDTH;
const DEFAULT_SLIDE_HEIGHT = Math.round(DEFAULT_SLIDE_WIDTH * (9 / 16));

interface PresentationLayoutProps {
  deck: ComponentBasedSlideDeck;
  isEditable?: boolean;
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  theme?: string;
  projectId?: string;
  mode?: 'edit' | 'view';
  rightSidebar?: React.ReactNode;
  rightSidebarContainerClassName?: string;
  viewModeSidebarWidth?: number;
}

const PresentationLayout: React.FC<PresentationLayoutProps> = ({
  deck,
  isEditable = false,
  onSave,
  theme = 'default',
  projectId,
  mode = 'edit',
  rightSidebar,
  rightSidebarContainerClassName,
  viewModeSidebarWidth = 0
}) => {
  // Apply a background color on the html/body while this layout is mounted
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.classList.add('presentation-html-bg');
    return () => {
      htmlEl.classList.remove('presentation-html-bg');
    };
  }, []);

  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewModeSlideWidth, setViewModeSlideWidth] = useState(VIEW_MODE_MAX_WIDTH);

  const isViewMode = mode === 'view';
  const editingEnabled = !isViewMode && isEditable;
  const shouldCenterView = isViewMode && !rightSidebar && viewModeSidebarWidth <= 0;
  
  // Template dropdown state
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

  // AI generation modal
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Slide hover menu state
  const [hoveredSlideId, setHoveredSlideId] = useState<string | null>(null);
  const [showSlideMenu, setShowSlideMenu] = useState<string | null>(null);
  const slideMenuRef = useRef<HTMLDivElement>(null);
  
  // Get available templates
  const availableTemplates = (() => {
    const all = getAllTemplates();
    const cutoff = all.findIndex(t => t.id === 'avatar-service-slide');
    if (cutoff === -1) return all;
    return all.slice(0, cutoff);
  })();

  // Compute slide width in view mode based on viewport size
  useEffect(() => {
    if (!isViewMode || typeof window === 'undefined') {
      return;
    }

    const computeWidth = () => {
      const viewportWidth = window.innerWidth;
      const baseAllowance = VIEW_MODE_HORIZONTAL_GAP;
      const sidebarSpace =
        viewportWidth >= 1024
          ? (viewModeSidebarWidth > 0
              ? viewModeSidebarWidth
              : rightSidebar
                ? VIEW_MODE_SIDEBAR_WIDTH
                : 0)
          : 0;
      const availableWidth = Math.max(VIEW_MODE_MIN_WIDTH, viewportWidth - baseAllowance - sidebarSpace);
      const nextWidth = Math.min(VIEW_MODE_MAX_WIDTH, availableWidth);
      setViewModeSlideWidth(nextWidth);
    };

    computeWidth();
    window.addEventListener('resize', computeWidth);
    return () => window.removeEventListener('resize', computeWidth);
  }, [isViewMode, rightSidebar, viewModeSidebarWidth]);

  const getSlideBaseDimensions = (slide: ComponentBasedSlide) => {
    const baseWidth = slide.canvasConfig?.width || DEFAULT_SLIDE_WIDTH;
    const baseHeight =
      slide.canvasConfig?.height ||
      (slide.canvasConfig?.width ? slide.canvasConfig.width * (9 / 16) : DEFAULT_SLIDE_HEIGHT);
    return { baseWidth, baseHeight };
  };

  const getViewModeSizing = (slide: ComponentBasedSlide) => {
    const { baseWidth, baseHeight } = getSlideBaseDimensions(slide);
    const effectiveWidth = isViewMode ? viewModeSlideWidth : baseWidth;
    const scale = Math.min(1, effectiveWidth / baseWidth);
    const scaledHeight = baseHeight * scale;
    return { baseWidth, baseHeight, scale, scaledHeight };
  };

  // Initialize with first slide
  useEffect(() => {
    if (deck?.slides?.length > 0 && !selectedSlideId) {
      setSelectedSlideId(deck.slides[0].slideId);
      setActiveSlideIndex(0);
    }
  }, [deck, selectedSlideId]);

  // Detect active slide on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const slides = container.querySelectorAll('[data-slide-index]');
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let closestSlideIndex = activeSlideIndex;
      let minDistance = Infinity;

      slides.forEach((slideElement) => {
        const slideRect = slideElement.getBoundingClientRect();
        const slideCenter = slideRect.top + slideRect.height / 2;
        const distance = Math.abs(slideCenter - centerY);

        if (distance < minDistance) {
          minDistance = distance;
          closestSlideIndex = parseInt(slideElement.getAttribute('data-slide-index') || '0');
        }
      });

      if (closestSlideIndex !== activeSlideIndex) {
        setActiveSlideIndex(closestSlideIndex);
        setSelectedSlideId(deck.slides[closestSlideIndex].slideId);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [deck, activeSlideIndex]);

  const currentSlide = deck?.slides?.find(slide => slide.slideId === selectedSlideId) || deck?.slides?.[0];

  const handleSlideSelect = (slideId: string, index: number) => {
    setSelectedSlideId(slideId);
    setActiveSlideIndex(index);
    
    // Scroll to the selected slide in the main container (vertical scroll)
    if (scrollContainerRef.current) {
      const slideElement = scrollContainerRef.current.querySelector(`[data-slide-index="${index}"]`) as HTMLElement;
      if (slideElement) {
        slideElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    if (!deck || !onSave || !editingEnabled) return;

    const updatedSlides = deck.slides.map((slide: ComponentBasedSlide) =>
      slide.slideId === updatedSlide.slideId ? updatedSlide : slide
    );

    const updatedDeck = {
      ...deck,
      slides: updatedSlides
    };

    onSave(updatedDeck);
  };

  // Add new slide with template
  const addSlide = (templateId: string = 'content-slide', insertAfterIndex?: number) => {
    if (!deck || !onSave || !editingEnabled) return;

    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    // Determine insertion position
    const insertIndex = insertAfterIndex !== undefined ? insertAfterIndex + 1 : deck.slides.length;
    const slideTitle = (typeof template.defaultProps.title === 'string' ? template.defaultProps.title : null) || `Slide ${insertIndex + 1}`;

    const newSlide: ComponentBasedSlide & { slideTitle?: string } = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: insertIndex + 1,
      slideTitle: slideTitle,
      templateId: templateId,
      props: {
        ...template.defaultProps,
        title: slideTitle,
        content: template.defaultProps.content || 'Add your content here...'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Insert slide at the specified position
    const updatedSlides = [...deck.slides];
    updatedSlides.splice(insertIndex, 0, newSlide);

    // Update slide numbers for all slides after the insertion point
    updatedSlides.forEach((slide, index) => {
      slide.slideNumber = index + 1;
    });

    const updatedDeck = {
      ...deck,
      slides: updatedSlides
    };

    onSave(updatedDeck);
    setShowTemplateDropdown(false);
    setInsertAfterIndex(null); // Reset insertion index
    
    // Select the new slide
    setTimeout(() => {
      setSelectedSlideId(newSlide.slideId);
      setActiveSlideIndex(insertIndex);
    }, 100);
  };

  // Add slide between specific slides (for between-slides action bar)
  const addSlideBetween = (templateId: string, afterIndex: number) => {
    addSlide(templateId, afterIndex);
  };

  // Duplicate slide
  const duplicateSlide = (slideId: string) => {
    if (!deck || !onSave || !editingEnabled) return;

    const slideToDuplicate = deck.slides.find(slide => slide.slideId === slideId);
    if (!slideToDuplicate) return;

    const slideIndex = deck.slides.findIndex(slide => slide.slideId === slideId);
    
    const duplicatedSlide: ComponentBasedSlide = {
      ...slideToDuplicate,
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: slideIndex + 2, // Insert after current slide
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Insert the duplicated slide after the original
    const updatedSlides = [...deck.slides];
    updatedSlides.splice(slideIndex + 1, 0, duplicatedSlide);

    // Update slide numbers for all slides after the insertion point
    updatedSlides.forEach((slide, index) => {
      slide.slideNumber = index + 1;
    });

    const updatedDeck = {
      ...deck,
      slides: updatedSlides
    };

    onSave(updatedDeck);
    setShowSlideMenu(null);
    
    // Select the duplicated slide
    setTimeout(() => {
      setSelectedSlideId(duplicatedSlide.slideId);
      setActiveSlideIndex(slideIndex + 1);
    }, 100);
  };

  // Delete slide
  const deleteSlide = (slideId: string) => {
    if (!deck || !onSave || !editingEnabled) return;

    const slideIndex = deck.slides.findIndex(slide => slide.slideId === slideId);
    if (slideIndex === -1) return;

    const updatedSlides = deck.slides.filter(slide => slide.slideId !== slideId);
    
    // Update slide numbers
    updatedSlides.forEach((slide, index) => {
      slide.slideNumber = index + 1;
    });

    const updatedDeck = {
      ...deck,
      slides: updatedSlides
    };

    onSave(updatedDeck);
    setShowSlideMenu(null);
    
    // Select the next slide or previous slide if we deleted the last one
    if (updatedSlides.length > 0) {
      const nextSlideIndex = Math.min(slideIndex, updatedSlides.length - 1);
      setSelectedSlideId(updatedSlides[nextSlideIndex].slideId);
      setActiveSlideIndex(nextSlideIndex);
    } else {
      setSelectedSlideId(null);
      setActiveSlideIndex(0);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
      if (slideMenuRef.current && !slideMenuRef.current.contains(event.target as Node)) {
        setShowSlideMenu(null);
      }
    };

    if (!isViewMode && (showTemplateDropdown || showSlideMenu)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTemplateDropdown, showSlideMenu, isViewMode]);


  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-[#F2F2F4] rounded-xl">
        <div className="text-gray-500">No slides available</div>
      </div>
    );
  }

  return (
    <>
    <div
      className={[
        'flex min-h-screen bg-[#F2F2F4] presentation-layout',
        shouldCenterView ? 'justify-center' : '',
        isViewMode ? 'presentation-view items-start' : '',
        rightSidebar
          ? (rightSidebarContainerClassName ?? 'flex-col lg:flex-row gap-6 lg:gap-10')
          : isViewMode
            ? 'flex-col gap-6'
            : ''
      ].filter(Boolean).join(' ')}
      style={
        isViewMode
          ? ({ '--slide-width': `${viewModeSlideWidth}px` } as React.CSSProperties)
          : undefined
      }
    >
      {/* Left Sidebar - Slide Thumbnails */}
      {!isViewMode && (
      <div className="w-90 min-h-full bg-[#F9F9F9] border border-[#CCCCCC] flex flex-col relative rounded-md">
          {/* Add New Slide Button */}
          <div className="pt-4 px-4">
            <button 
              onClick={() => {
                setInsertAfterIndex(null); // Reset to add at end
                setShowTemplateDropdown(!showTemplateDropdown);
              }}
              className="w-full flex items-center bg-white text-[#A5A5A5] text-sm rounded-lg hover:bg-gray-100 transition-colors border border-[#CCCCCC]"
            >
              <div className="flex items-center justify-center gap-2 py-2 flex-1">
                <Plus size={16} />
                <span>Add new card</span>
              </div>
              <div className="flex items-center justify-center px-3 py-2 border-l border-[#CCCCCC]">
                <ChevronDown size={16} strokeWidth={3} />
              </div>
            </button>
          </div>

          {/* Template Dropdown */}
          {showTemplateDropdown && (
            <div
              ref={dropdownRef}
              className="absolute -right-100 top-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 template-popover-scroll"
              style={{
                width: '400px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {/* Popular Templates */}
              <div className="p-3">
                <div className="px-1 pb-2 text-xs font-bold text-gray-900">
                  Popular
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableTemplates
                    .filter(template => ['content-slide', 'bullet-points', 'two-column', 'title-slide'].includes(template.id))
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() => addSlide(template.id, insertAfterIndex || undefined)}
                        className="group h-full w-full rounded-xl border border-[#CCCCCC] hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors text-left bg-white"
                      >
                        <div className="aspect-[5/3] w-full rounded-t-xl flex items-center justify-center">
                          <div 
                            dangerouslySetInnerHTML={{ __html: template.icon }}
                          />
                        </div>
                        <div className="px-3 text-center pb-5 pt-1">
                          <div className="text-[10px] font-semibold text-gray-900 truncate">{template.name}</div>
                          {/* <div className="text-xs text-gray-500 line-clamp-2">{template.description}</div> */}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* All Templates */}
              <div className="p-3 border-t border-gray-100">
                <div className="px-1 pb-2 text-xs font-bold text-gray-900">
                  Basic
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addSlide(template.id, insertAfterIndex || undefined)}
                      className="group h-full w-full rounded-xl border border-[#CCCCCC] hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors text-left bg-white"
                    >
                      <div className="aspect-[5/3] w-full rounded-t-xl flex items-center justify-center">
                        <div 
                          dangerouslySetInnerHTML={{ __html: template.icon }}
                        />
                      </div>
                      <div className="px-3 text-center pb-5 pt-1">
                        <div className="text-[10px] font-semibold text-gray-900 truncate">{template.name}</div>
                        {/* <div className="text-xs text-gray-500 line-clamp-2">{template.description}</div> */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        {/* Slide Thumbnails */}
        <div className="flex-1 p-4 space-y-4 bg-[#F9F9F9] rounded-md overflow-y-auto custom-scrollbar">
          {deck.slides.map((slide, index) => {
            const isActive = slide.slideId === selectedSlideId;
            const isHovered = hoveredSlideId === slide.slideId;
            const showMenu = showSlideMenu === slide.slideId;
            
            return (
              <div
                key={slide.slideId}
                className={`relative cursor-pointer slide-thumbnail-card rounded-lg group ${
                  isActive ? 'active' : ''
                }`}
                onClick={() => handleSlideSelect(slide.slideId, index)}
                onMouseEnter={() => setHoveredSlideId(slide.slideId)}
                onMouseLeave={() => setHoveredSlideId(null)}
              >
                {/* Slide Number Badge */}
                <div className="absolute bottom-2 left-2 text-[#E0E0E0] border-2 border-[#E0E0E0] text-[27px] font-semibold w-10 h-10 rounded-[8px] flex items-center justify-center z-30 slide-number-badge">
                  {index + 1}
                </div>
                
                
                {/* Slide Preview Card with actual slide rendering */}
                <div className={`slide-preview-card rounded-sm overflow-hidden transition-all duration-200 ${
                  isActive ? 'active' : ''
                }`}>
                  {/* Mini slide rendering */}
                  <div className="slide-mini-preview" style={{ aspectRatio: '16/9', minHeight: '120px' }}>
                    <div style={{ 
                        width: '400%', 
                        height: '400%', 
                        transform: 'scale(0.25)', 
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundColor: '#F2F2F4'
                    }}>
                      <ComponentBasedSlideRenderer
                        slide={slide}
                        isEditable={false}
                        onSlideUpdate={() => {}}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col bg-[#F2F2F4] ${shouldCenterView ? 'items-center' : ''}`}>
        {/* Scrollable Slides Container - Vertical scroll for big slides */}
        <div 
          className={`flex-1 bg-[#F2F2F4] ${shouldCenterView ? 'w-full flex justify-center' : ''}`}
          ref={scrollContainerRef}
        >
          <div className={`space-y-8 ${isViewMode ? 'px-0 w-full flex flex-col items-center pb-4' : 'px-6 pb-4'}`}>
            {deck.slides.map((slide, index) => {
              const isActive = slide.slideId === selectedSlideId;
              const isHovered = editingEnabled && hoveredSlideId === slide.slideId;
              const showMenu = editingEnabled && showSlideMenu === slide.slideId;
              
              return (
                <div key={slide.slideId}>
                  <div
                    className={`flex items-center justify-center relative ${isViewMode ? 'w-full max-w-6xl' : ''}`}
                    data-slide-index={index}
                    onMouseEnter={editingEnabled ? () => setHoveredSlideId(slide.slideId) : undefined}
                    onMouseLeave={editingEnabled ? () => setHoveredSlideId(null) : undefined}
                  >
                    <div className="w-full max-w-6xl">
                      <div className={`border border-[#CCCCCC] rounded-md relative ${isViewMode ? 'bg-[#F2F2F4]' : ''}`}>
                        {/* Three dots menu button - appears on hover at top left */}
                        {editingEnabled && isHovered && (
                          <div className="absolute top-2 left-2 z-40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSlideMenu(showMenu ? null : slide.slideId);
                              }}
                              className="w-5 h-8 bg-white hover:bg-white rounded-md flex items-center justify-center shadow-sm border border-[#CCCCCC] transition-all duration-200"
                            >
                              <MoreVertical size={16} className="text-[#CCCCCC]" />
                            </button>
                          </div>
                        )}

                        {/* Slide menu dropdown */}
                        {editingEnabled && showMenu && (
                          <div
                            ref={slideMenuRef}
                            className="flex flex-row absolute top-10 left-2 z-50 bg-white border border-gray-200 rounded-sm shadow-xl min-w-[60px]"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSlide(slide.slideId);
                              }}
                              className="w-full px-1 py-2 text-left text-sm text-[#3C3838] hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAIModal(true);
                                setShowSlideMenu(null);
                              }}
                              className="w-full px-1 py-2 text-left text-sm text-[#3C3838] hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Sparkles size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSlide(slide.slideId);
                              }}
                              className="w-full px-1 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        )}
                        {isViewMode ? (
                          (() => {
                            const sizing = getViewModeSizing(slide);
                            return (
                              <div
                                className="presentation-viewer-slide rounded-lg"
                                style={{
                                  width: '100%',
                                  maxWidth: `${viewModeSlideWidth}px`,
                                  minHeight: `${sizing.scaledHeight}px`,
                                  height: `${sizing.scaledHeight}px`
                                }}
                              >
                                <div
                                  className="presentation-viewer-slide-inner"
                                  style={{
                                    width: `${sizing.baseWidth}px`,
                                    minHeight: `${sizing.baseHeight}px`,
                                    transform: `scale(${sizing.scale})`,
                                    transformOrigin: 'top center'
                                  }}
                                >
                                  <ComponentBasedSlideRenderer
                                    slide={slide}
                                    isEditable={false}
                                    theme={theme}
                                    forceHybridView
                                  />
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <ComponentBasedSlideRenderer
                            slide={slide}
                            isEditable={editingEnabled}
                            onSlideUpdate={handleSlideUpdate}
                            theme={theme}
                          />
                        )}
                      </div>
                    </div>
              </div>
              
                  {/* Between-slides action bar */}
                  {!isViewMode && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center bg-white rounded-md shadow-sm">
                      <button
                        onClick={() => addSlide('title-slide', index)}
                        title="Add new slide"
                        className="w-8 h-8 rounded-l-md bg-white flex items-center justify-center border border-[#E0E0E0] hover:bg-gray-100 text-[#A5A5A5]"
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        onClick={() => setShowAIModal(true)}
                        title="Generate with AI"
                        className="w-8 h-8 flex items-center bg-white justify-center border border-[#E0E0E0] !bg-[#CCDBFC] hover:bg-blue-100 text-[#0F58F9]"
                      >
                        <Sparkles strokeWidth={1} size={15} />
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            title="More"
                            className="w-8 h-8 rounded-r-md flex bg-white items-center justify-center border border-[#E0E0E0] hover:bg-gray-100 text-[#A5A5A5]"
                          >
                            <ArrowDown strokeWidth={3} size={15} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[410px] max-h-[400px] bg-white overflow-y-auto p-0 template-popover-scroll"
                          align="center"
                          sideOffset={8}
                        >
                          {/* Popular Templates */}
                          <div className="p-3">
                            <div className="px-1 pb-2 text-xs font-bold text-gray-900">
                              Popular
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {availableTemplates
                                .filter(template => ['content-slide', 'bullet-points', 'two-column', 'title-slide'].includes(template.id))
                                .map((template) => (
                                  <button
                                    key={template.id}
                                    onClick={() => addSlide(template.id, index)}
                                    className="group h-full w-full rounded-xl border border-[#CCCCCC] hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors text-left bg-white"
                                  >
                                    <div className="aspect-[5/3] w-full rounded-t-xl flex items-center justify-center">
                                      <div 
                                        dangerouslySetInnerHTML={{ __html: template.icon }}
                                      />
                                    </div>
                                    <div className="px-3 text-center pb-5 pt-1">
                                      <div className="text-[10px] font-semibold text-gray-900 truncate">{template.name}</div>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* All Templates */}
                          <div className="p-3 border-t border-gray-100">
                            <div className="px-1 pb-2 text-xs font-bold text-gray-900">
                              Basic
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {availableTemplates.map((template) => (
                                <button
                                  key={template.id}
                                  onClick={() => addSlide(template.id, index)}
                                  className="group h-full w-full rounded-xl border border-[#CCCCCC] hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors text-left bg-white"
                                >
                                  <div className="aspect-[5/3] w-full rounded-t-xl flex items-center justify-center">
                                    <div 
                                      dangerouslySetInnerHTML={{ __html: template.icon }}
                                    />
                                  </div>
                                  <div className="px-3 text-center pb-5 pt-1">
                                    <div className="text-[10px] font-semibold text-gray-900 truncate">{template.name}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {rightSidebar && (
        <div
          className="w-full lg:w-[400px] flex-shrink-0 overflow-y-auto"
          style={{ height: '550px', minHeight: '550px' }}
        >
          {rightSidebar}
        </div>
      )}
    </div>
    {!isViewMode && (
    <AIImageGenerationModal
      isOpen={showAIModal}
      onClose={() => setShowAIModal(false)}
      onImageGenerated={() => {}}
      onGenerationStarted={() => {}}
      title="Generate with AI"
    />
    )}
    </>
  );
};

export default PresentationLayout;
