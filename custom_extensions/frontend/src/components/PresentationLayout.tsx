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
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Slides</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FileText size={16} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Clipboard size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Add New Slide Button */}
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>Add new card</span>
            <ChevronDown size={16} />
          </button>
        </div>

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
                <div className="absolute -top-2 -left-2 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center z-10 slide-number-badge">
                  {index + 1}
                </div>
                
                {/* Slide Preview Card */}
                <div className={`slide-preview-card rounded-xl overflow-hidden transition-all duration-200 ${
                  isActive ? 'active' : ''
                }`}>
                  {/* Card Header with gradient */}
                  <div className="h-2 gradient-header"></div>
                  
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
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {deck.lessonTitle || 'Presentation'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>16:9</span>
                <span>•</span>
                <span>{deck.slides.length} slides</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <span>AI Improve</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Slide Display */}
        <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
          <div className="w-full max-w-7xl">
            {/* Slide Container with Professional Styling */}
            <div className="relative">
              <div className="main-slide-container rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {currentSlide && (
                  <ComponentBasedSlideRenderer
                    slide={currentSlide}
                    isEditable={isEditable}
                    onSlideUpdate={handleSlideUpdate}
                    theme={theme}
                  />
                )}
              </div>
              
              {/* Slide Navigation Controls */}
              <div className="flex items-center justify-center mt-8 gap-6">
                <button
                  onClick={() => {
                    const prevIndex = (activeSlideIndex - 1 + deck.slides.length) % deck.slides.length;
                    const prevSlide = deck.slides[prevIndex];
                    handleSlideSelect(prevSlide.slideId, prevIndex);
                  }}
                  disabled={deck.slides.length <= 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl navigation-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Previous</span>
                </button>
                
                {/* Slide Dots Indicator */}
                <div className="flex items-center gap-3 px-6 py-3 rounded-full slide-dots-container">
                  {deck.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const slide = deck.slides[index];
                        handleSlideSelect(slide.slideId, index);
                      }}
                      className={`w-3 h-3 rounded-full slide-dot ${
                        index === activeSlideIndex ? 'active bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const nextIndex = (activeSlideIndex + 1) % deck.slides.length;
                    const nextSlide = deck.slides[nextIndex];
                    handleSlideSelect(nextSlide.slideId, nextIndex);
                  }}
                  disabled={deck.slides.length <= 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl navigation-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-medium text-gray-700">Next</span>
                  <ChevronRight size={18} className="text-gray-700" />
                </button>
              </div>
              
              {/* Slide Counter */}
              <div className="flex items-center justify-center mt-4">
                <div className="slide-counter px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-gray-600">
                    Slide {activeSlideIndex + 1} of {deck.slides.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationLayout;
