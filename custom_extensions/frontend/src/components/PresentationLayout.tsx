"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ChevronLeft, ChevronRight, Plus, FileText, Clipboard, ChevronDown, X } from 'lucide-react';
import { ComponentBasedSlideRenderer } from './ComponentBasedSlideRenderer';
import { getAllTemplates, getTemplate } from './templates/registry';
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
  const addSlide = (templateId: string = 'content-slide') => {
    if (!deck || !onSave) return;

    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    const slideTitle = template.defaultProps.title || `Slide ${deck.slides.length + 1}`;

    const newSlide: ComponentBasedSlide & { slideTitle?: string } = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: deck.slides.length + 1,
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

    const updatedDeck = {
      ...deck,
      slides: [...deck.slides, newSlide]
    };

    onSave(updatedDeck);
    setShowTemplateDropdown(false);
    
    // Select the new slide
    setTimeout(() => {
      setSelectedSlideId(newSlide.slideId);
      setActiveSlideIndex(deck.slides.length);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };

    if (showTemplateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTemplateDropdown]);

  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-gray-500">No slides available</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 presentation-layout">
      {/* Left Sidebar - Slide Thumbnails */}
      <div className="w-100 bg-[#EEEEEE] border-r border-gray-200 flex flex-col relative">
          {/* Add New Slide Button */}
          <div className="p-4">
            <button 
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#71717A] text-sm px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
              className="absolute -right-20 top-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
              style={{
                width: 'calc(100% - 32px)',
                maxHeight: '420px',
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
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular Templates
                </div>
                {availableTemplates
                  .filter(template => ['content-slide', 'bullet-points', 'two-column', 'title-slide'].includes(template.id))
                  .map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addSlide(template.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-lg">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500 truncate">{template.description}</div>
                      </div>
                    </button>
                  ))}
              </div>

              {/* All Templates */}
              <div className="p-2 border-t border-gray-100">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  All Templates
                </div>
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => addSlide(template.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500 truncate">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        {/* Slide Thumbnails */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 sidebar-scroll">
          {deck.slides.map((slide, index) => {
            const isActive = slide.slideId === selectedSlideId;
            
            return (
              <div
                key={slide.slideId}
                className={`relative cursor-pointer slide-thumbnail-card group ${
                  isActive ? 'active' : ''
                }`}
                onClick={() => handleSlideSelect(slide.slideId, index)}
              >
                {/* Slide Number Badge */}
                <div className="absolute bottom-2 left-2 text-[#71717A] border-2 border-[#E5E0DF] text-[27px] font-semibold w-10 h-10 rounded-[8px] flex items-center justify-center z-10 slide-number-badge">
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
          <div className="space-y-8 p-6">
            {deck.slides.map((slide, index) => (
              <div
                key={slide.slideId}
                className="flex items-center justify-center"
                data-slide-index={index}
              >
                <div className="w-full max-w-10xl">
                  <div className="main-slide-container rounded-lg" style={{ aspectRatio: '16/9' }}>
                    <ComponentBasedSlideRenderer
                      slide={slide}
                      isEditable={isEditable}
                      onSlideUpdate={handleSlideUpdate}
                      theme={theme}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationLayout;
