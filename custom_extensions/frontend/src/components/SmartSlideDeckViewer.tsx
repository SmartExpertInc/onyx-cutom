// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useCallback } from 'react';
import { ComponentBasedSlide, ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { ComponentBasedSlideRenderer } from './ComponentBasedSlideRenderer';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from './SimpleInlineEditor';

interface SmartSlideDeckViewerProps {
  /** The slide deck data - must be in component-based format */
  deck: ComponentBasedSlideDeck | unknown;
  
  /** Save callback for changes */
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  
  /** Show format detection info */
  showFormatInfo?: boolean;
  
  /** Theme ID for the slide deck (optional, uses deck.theme or default) */
  theme?: string;
}

export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  onSave,
  showFormatInfo = false,
  theme
}) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  // Process the deck data to ensure it's in component-based format
  useEffect(() => {
    const processDeck = async () => {
      try {
        // Reset error state
        setError(null);

        // Type guard to check if deck is already in component-based format
        const typedDeck = deck as ComponentBasedSlideDeck;
        
        if (!typedDeck || !typedDeck.slides || !Array.isArray(typedDeck.slides)) {
          setError('Invalid slide deck format. Expected component-based slides.');
          return;
        }

        // Validate each slide has required properties
        const validSlides = typedDeck.slides.every(slide => 
          slide && 
          typeof slide === 'object' && 
          'slideId' in slide && 
          'templateId' in slide && 
          'props' in slide
        );

        if (!validSlides) {
          setError('Invalid slide structure. Each slide must have slideId, templateId, and props.');
          return;
        }

        // Ensure slides have slideNumber for display
        const processedSlides = typedDeck.slides.map((slide, index) => ({
          ...slide,
          slideNumber: index + 1
        }));

        // Set the processed deck
        setComponentDeck({
          ...typedDeck,
          slides: processedSlides,
          theme: theme || typedDeck.theme || DEFAULT_SLIDE_THEME
        });

      } catch (err) {
        console.error('Error processing slide deck:', err);
        setError(`Failed to process slide deck: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    processDeck();
  }, [deck, theme]);

  // Handle slide updates
  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    if (!componentDeck) return;

    const updatedSlides = componentDeck.slides.map(slide => 
      slide.slideId === updatedSlide.slideId ? updatedSlide : slide
    );

    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentDeck,
      slides: updatedSlides
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Handle template changes
  const handleTemplateChange = (slideId: string, newTemplateId: string) => {
    if (!componentDeck) return;

    const updatedSlides = componentDeck.slides.map(slide => 
      slide.slideId === slideId 
        ? { ...slide, templateId: newTemplateId }
        : slide
    );

    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentDeck,
      slides: updatedSlides
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Add new slide
  const addSlide = () => {
    if (!componentDeck) return;

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}`,
      templateId: 'content-slide',
      slideNumber: componentDeck.slides.length + 1,
      props: {
        title: 'New Slide',
        content: 'Add your content here...'
      }
    };

    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentDeck,
      slides: [...componentDeck.slides, newSlide]
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Delete slide
  const deleteSlide = (slideId: string) => {
    if (!componentDeck) return;

    const updatedSlides = componentDeck.slides
      .filter(slide => slide.slideId !== slideId)
      .map((slide, index) => ({
        ...slide,
        slideNumber: index + 1
      }));

    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentDeck,
      slides: updatedSlides
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Slide Deck Error
        </div>
        <div style={{ fontSize: '14px' }}>{error}</div>
        {showFormatInfo && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Debug Info: Expected component-based format with templateId and props
          </div>
        )}
      </div>
    );
  }

  if (!componentDeck) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        No slide deck available
      </div>
    );
  }

  // Success: Render component-based viewer with classic UX and sidebar navigation
  return (
    <div className="slide-deck-viewer">
      {/* Professional Header */}
      <div className="professional-header">
        <div className="header-content">
          { (
            <div className="header-controls">
              <button 
                className="control-button add-button"
                onClick={addSlide}
              >
                <span className="button-icon">+</span>
                Add Slide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Slides Container */}
        <div className="slides-container">
          {componentDeck.slides.map((slide: ComponentBasedSlide) => (
            <div
              key={slide.slideId}
              className="professional-slide"
              id={`slide-${slide.slideId}`}
            >
              {/* Editable Slide Title */}
              <div className="slide-title-editable">
                <SimpleInlineEditor
                  value={(slide.props.title as string) || `Slide ${slide.slideNumber}`}
                  onSave={(newTitle) => {
                    const updatedSlide: ComponentBasedSlide = {
                      ...slide,
                      props: { ...slide.props, title: newTitle }
                    };
                    handleSlideUpdate(updatedSlide);
                  }}
                  placeholder={`Slide ${slide.slideNumber}`}
                  maxLength={100}
                  className="slide-title-text"
                />
              </div>

              {/* Component-based slide content */}
              <div className="slide-content">
                <ComponentBasedSlideRenderer
                  slides={[slide]}
                  onSlideUpdate={handleSlideUpdate}
                  onTemplateChange={handleTemplateChange}
                  theme={componentDeck.theme}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartSlideDeckViewer; 