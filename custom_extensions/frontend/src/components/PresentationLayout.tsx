"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ChevronLeft, ChevronRight, Plus, FileText, Clipboard, ChevronDown, X, Sparkles, ChevronDown as ArrowDown, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { ComponentBasedSlideRenderer } from './ComponentBasedSlideRenderer';
import { getAllTemplates, getTemplate } from './templates/registry';
import AIImageGenerationModal from './AIImageGenerationModal';
import './PresentationLayout.css';

interface PresentationLayoutProps {
  deck: ComponentBasedSlideDeck;
  isEditable?: boolean;
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  theme?: string;
  projectId?: string;
}

const PresentationLayout: React.FC<PresentationLayoutProps> = ({
  deck,
  isEditable = false,
  onSave,
  theme = 'default',
  projectId
}) => {
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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
    if (!deck || !onSave) return;

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
    if (!deck || !onSave) return;

    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    // Determine insertion position
    const insertIndex = insertAfterIndex !== undefined ? insertAfterIndex + 1 : deck.slides.length;
    const slideTitle = template.defaultProps.title || `Slide ${insertIndex + 1}`;

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
    if (!deck || !onSave) return;

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
    if (!deck || !onSave) return;

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

    if (showTemplateDropdown || showSlideMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTemplateDropdown, showSlideMenu]);


  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-gray-500">No slides available</div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen bg-gray-50 presentation-layout">
      {/* Left Sidebar - Slide Thumbnails */}
      <div className="w-90 bg-[#EEEEEE] border-r border-gray-200 flex flex-col relative">
          {/* Add New Slide Button */}
          <div className="p-4">
            <button 
              onClick={() => {
                setInsertAfterIndex(null); // Reset to add at end
                setShowTemplateDropdown(!showTemplateDropdown);
              }}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#71717A] text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
            <Plus size={16} />
            <span>Add new card</span>
            <ChevronDown size={16} />
          </button>
          </div>

          {/* Template Dropdown */}
          {showTemplateDropdown && (
            <div
              ref={dropdownRef}
              className="absolute -right-95 top-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
              style={{
                width: 'calc(100% + 45px)',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Choose Template</h3>
                <button
                  onClick={() => setShowTemplateDropdown(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Popular Templates */}
              <div className="p-3">
                <div className="px-1 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableTemplates
                    .filter(template => ['content-slide', 'bullet-points', 'two-column', 'title-slide'].includes(template.id))
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() => addSlide(template.id, insertAfterIndex || undefined)}
                        className="group h-full w-full rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors text-left bg-white"
                      >
                        <div className="aspect-[4/3] w-full rounded-t-xl bg-gray-50 flex items-center justify-center">
                          <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">{template.icon}</span>
                        </div>
                        <div className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900 truncate">{template.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">{template.description}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* All Templates */}
              <div className="p-3 border-t border-gray-100">
                <div className="px-1 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Basic
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addSlide(template.id, insertAfterIndex || undefined)}
                      className="group h-full w-full rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors text-left bg-white"
                    >
                      <div className="aspect-[4/3] w-full rounded-t-xl bg-gray-50 flex items-center justify-center">
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">{template.icon}</span>
                      </div>
                      <div className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate">{template.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{template.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        {/* Slide Thumbnails */}
        <div className="flex-1 p-4 space-y-4">
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
                <div className="absolute bottom-2 left-2 text-[#71717A] border-2 border-[#E5E0DF] text-[27px] font-semibold w-10 h-10 rounded-[8px] flex items-center justify-center z-30 slide-number-badge">
                  {index + 1}
                </div>
                
                
                {/* Slide Preview Card with actual slide rendering */}
                <div className={`slide-preview-card rounded-sm overflow-hidden transition-all duration-200 ${
                  isActive ? 'active' : ''
                }`}>
                  {/* Mini slide rendering */}
                  <div className="slide-mini-preview" style={{ aspectRatio: '16/9' }}>
                    <ComponentBasedSlideRenderer
                      slide={slide}
                      isEditable={false}
                      onSlideUpdate={() => {}}
                      theme={theme}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Scrollable Slides Container - Vertical scroll for big slides */}
        <div 
          className="flex-1 bg-white"
          ref={scrollContainerRef}
        >
          <div className="space-y-8 px-6">
            {deck.slides.map((slide, index) => {
              const isActive = slide.slideId === selectedSlideId;
              const isHovered = hoveredSlideId === slide.slideId;
              const showMenu = showSlideMenu === slide.slideId;
              
              return (
                <div key={slide.slideId}>
                  <div
                    className="flex items-center justify-center relative"
                    data-slide-index={index}
                    onMouseEnter={() => setHoveredSlideId(slide.slideId)}
                    onMouseLeave={() => setHoveredSlideId(null)}
                  >
                    <div className="w-full max-w-10xl">
                      <div className="main-slide-container rounded-lg relative" style={{ aspectRatio: '16/9' }}>
                        {/* Three dots menu button - appears on hover at top left */}
                        {isHovered && (
                          <div className="absolute top-2 left-2 z-40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSlideMenu(showMenu ? null : slide.slideId);
                              }}
                              className="w-8 h-8 bg-white/90 hover:bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200 transition-all duration-200"
                            >
                              <MoreVertical size={16} className="text-gray-600" />
                            </button>
                          </div>
                        )}

                        {/* Slide menu dropdown */}
                        {showMenu && (
                          <div
                            ref={slideMenuRef}
                            className="absolute top-10 left-2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[140px]"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSlide(slide.slideId);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy size={14} className="text-gray-500" />
                              Copy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAIModal(true);
                                setShowSlideMenu(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Sparkles size={14} className="text-blue-500" />
                              AI Improve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSlide(slide.slideId);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} className="text-red-500" />
                              Delete
                            </button>
                          </div>
                        )}

                        <ComponentBasedSlideRenderer
                          slide={slide}
                          isEditable={isEditable}
                          onSlideUpdate={handleSlideUpdate}
                          theme={theme}
                        />
                      </div>
                    </div>
                  </div>
              
                  {/* Between-slides action bar */}
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-sm px-1 py-1">
                      <button
                        onClick={() => {
                          setInsertAfterIndex(index);
                          setShowTemplateDropdown(!showTemplateDropdown);
                        }}
                        title="Add new slide"
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-700"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => setShowAIModal(true)}
                        title="Generate with AI"
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 text-blue-600"
                      >
                        <Sparkles size={16} />
                      </button>
                      <button
                        onClick={() => {}}
                        title="More"
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-700"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    <AIImageGenerationModal
      isOpen={showAIModal}
      onClose={() => setShowAIModal(false)}
      onImageGenerated={() => {}}
      onGenerationStarted={() => {}}
      title="Generate with AI"
    />
    </>
  );
};

export default PresentationLayout;
