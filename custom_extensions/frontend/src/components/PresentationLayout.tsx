"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ChevronLeft, ChevronRight, Plus, FileText, Clipboard, ChevronDown } from 'lucide-react';
import { ComponentBasedSlideRenderer } from './ComponentBasedSlideRenderer';
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

  // Initialize with first slide
  useEffect(() => {
    if (deck?.slides?.length > 0 && !selectedSlideId) {
      setSelectedSlideId(deck.slides[0].slideId);
      setActiveSlideIndex(0);
    }
  }, [deck, selectedSlideId]);

  const currentSlide = deck?.slides?.find(slide => slide.slideId === selectedSlideId) || deck?.slides?.[0];

  const handleSlideSelect = (slideId: string, index: number) => {
    setSelectedSlideId(slideId);
    setActiveSlideIndex(index);
    
    // Scroll to the selected slide in the main container
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.scrollWidth / deck.slides.length;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
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

  const getSlidePreviewContent = (slide: ComponentBasedSlide) => {
    // For component-based slides, extract title and content from props
    const title = slide.props?.title || slide.props?.headline || `Slide ${slide.slideNumber}`;
    
    // Extract content from props (look for common content fields)
    const contentFields = ['content', 'description', 'subtitle', 'text'];
    let content = '';
    
    for (const field of contentFields) {
      if (slide.props?.[field]) {
        const fieldContent = slide.props[field];
        if (typeof fieldContent === 'string') {
          content = fieldContent.substring(0, 100) + '...';
          break;
        } else if (Array.isArray(fieldContent)) {
          content = fieldContent.slice(0, 2).join(' • ') + '...';
          break;
        }
      }
    }
    
    if (!content) {
      content = 'Slide content...';
    }

    return { title, content };
  };

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
      <div className="w-80 bg-[#EEEEEE] border-r border-gray-200 flex flex-col">
          {/* Add New Slide Button */}
          <button className="w-full flex items-center justify-center gap-2 bg-white text-[#71717A] text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>Add new card</span>
            <ChevronDown size={16} />
          </button>

        {/* Slide Thumbnails */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 sidebar-scroll">
          {deck.slides.map((slide, index) => {
            const previewContent = getSlidePreviewContent(slide);
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
                <div className="absolute bottom-2 left-2 text-[#71717A] text-2xl font-bold w-10 h-10 rounded-[10px] flex items-center justify-center z-10 slide-number-badge">
                  {index + 1}
                </div>
                
                {/* Slide Preview Card */}
                <div className={`slide-preview-card rounded-sm overflow-hidden transition-all duration-200 ${
                  isActive ? 'active' : ''
                }`}>
                  
                  {/* Slide content preview */}
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">
                        {previewContent.title}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {previewContent.content}
                      </div>
                    </div>
                    
                    {/* Template indicator */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">
                        {slide.templateId?.replace('-slide', '') || 'Template'}
                      </span>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Slides Container */}
        <div 
          className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory slides-horizontal-scroll"
          ref={scrollContainerRef}
          onScroll={(e) => {
            const container = e.currentTarget;
            const slideWidth = container.scrollWidth / deck.slides.length;
            const newIndex = Math.round(container.scrollLeft / slideWidth);
            if (newIndex !== activeSlideIndex) {
              setActiveSlideIndex(newIndex);
              setSelectedSlideId(deck.slides[newIndex].slideId);
            }
          }}
        >
          <div className="flex h-full" style={{ width: `${deck.slides.length * 100}%` }}>
            {deck.slides.map((slide, index) => (
              <div
                key={slide.slideId}
                className="snap-center flex items-center justify-center p-6"
                style={{ width: `${100 / deck.slides.length}%` }}
              >
                <div className="w-full max-w-7xl">
                  <div className="main-slide-container rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
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
        
        {/* Slide Counter */}
        <div className="flex items-center justify-center py-4 bg-gray-50">
          <div className="slide-counter px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-gray-600">
              Slide {activeSlideIndex + 1} of {deck.slides.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationLayout;
