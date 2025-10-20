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
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-[#71717A] text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={16} />
                <span>Add new card</span>
                <ChevronDown size={16} />
            </button>
          </div>
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
                <div className="absolute bottom-2 left-2 text-[#71717A] text-xl font-bold w-8 h-8 rounded-[8px] flex items-center justify-center z-10 slide-number-badge">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Slides Container */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden snap-x snap-mandatory slides-horizontal-scroll"
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
      </div>
    </div>
  );
};

export default PresentationLayout;
