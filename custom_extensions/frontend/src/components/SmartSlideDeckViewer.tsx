// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import FloatingAddSlideButton from './FloatingAddSlideButton';
import './FloatingAddSlideButton.css';

interface SmartSlideDeckViewerProps {
  /** The slide deck data - must be in component-based format */
  deck: ComponentBasedSlideDeck | any;
  
  /** Whether the deck is editable */
  isEditable?: boolean;
  
  /** Save callback for changes */
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  
  /** Show format detection info */
  showFormatInfo?: boolean;
  
  /** Theme ID for the slide deck (optional, uses deck.theme or default) */
  theme?: string;
}



export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave,
  showFormatInfo = false,
  theme
}) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

  // Process deck - expect component-based format only
  useEffect(() => {
    const processDeck = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!deck || !deck.slides || !Array.isArray(deck.slides)) {
          setError('Invalid slide deck format. Expected component-based slides.');
          return;
        }

        // Validate that slides have templateId and props (component-based format)
        const hasValidFormat = deck.slides.every((slide: any) => 
          slide.hasOwnProperty('templateId') && slide.hasOwnProperty('props')
        );

        if (!hasValidFormat) {
          console.error('❌ Invalid slide format detected:', {
            slideCount: deck.slides.length,
            slides: deck.slides.map((slide: any, index: number) => ({
              index,
              hasTemplateId: slide.hasOwnProperty('templateId'),
              hasProps: slide.hasOwnProperty('props'),
              slideKeys: Object.keys(slide),
              slideType: typeof slide
            }))
          });
          setError('Slides must be in component-based format with templateId and props.');
          return;
        }

        // 🔍 DETAILED LOGGING: Let's see what props are actually coming from backend
        console.log('🔍 RAW SLIDES DATA FROM BACKEND:');
        deck.slides.forEach((slide: any, index: number) => {
          console.log(`📄 Slide ${index + 1} (${slide.templateId}):`, {
            slideId: slide.slideId,
            templateId: slide.templateId,
            props: slide.props
          });
        });

        // Set theme on the deck
        const deckWithTheme = {
          ...deck,
          theme: theme || deck.theme || DEFAULT_SLIDE_THEME
        };

        setComponentDeck(deckWithTheme as ComponentBasedSlideDeck);
        
        console.log('✅ Component-based slides loaded with theme:', {
          slideCount: deck.slides.length,
          theme: deckWithTheme.theme,
          themeColors: currentTheme.colors,
          templates: deck.slides.map((s: any) => s.templateId)
          });
        
      } catch (err) {
        console.error('❌ Error processing slide deck:', err);
        setError(`Error processing slide deck: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (deck) {
      processDeck();
    } else {
      setIsLoading(false);
      setError('No slide deck provided');
    }
  }, [deck]);

  // Handle slide updates
  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    console.log('🔍 SmartSlideDeckViewer: handleSlideUpdate called with:', updatedSlide);
    
    if (componentDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...componentDeck,
        slides: componentDeck.slides.map((slide: ComponentBasedSlide) => 
          slide.slideId === updatedSlide.slideId ? updatedSlide : slide
        )
      };
      console.log('🔍 SmartSlideDeckViewer: Updated deck:', updatedDeck);
      setComponentDeck(updatedDeck);
      onSave?.(updatedDeck);
    } else {
      console.warn('🔍 SmartSlideDeckViewer: componentDeck is null');
    }
  };

  const handleTemplateChange = (slideId: string, newTemplateId: string) => {
    if (componentDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...componentDeck,
        slides: componentDeck.slides.map((slide: ComponentBasedSlide) => 
          slide.slideId === slideId 
            ? { ...slide, templateId: newTemplateId }
            : slide
        )
      };
      setComponentDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
  };

  // Add new slide
  const addSlide = (newSlide: ComponentBasedSlide) => {
    if (!componentDeck) return;

    // Validate the new slide structure
    if (!newSlide.templateId || !newSlide.props) {
      console.error('❌ Invalid new slide structure:', newSlide);
      return;
    }

    console.log('✅ Adding new slide with valid structure:', {
      slideId: newSlide.slideId,
      templateId: newSlide.templateId,
      propsKeys: Object.keys(newSlide.props),
      metadata: newSlide.metadata
    });

    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentDeck,
      slides: [...componentDeck.slides, newSlide]
    };

    console.log('🔍 SmartSlideDeckViewer: Updated deck before save:', {
      totalSlides: updatedDeck.slides.length,
      slides: updatedDeck.slides.map((slide, index) => ({
        index,
        slideId: slide.slideId,
        templateId: slide.templateId,
        hasProps: !!slide.props
      })),
      deckKeys: Object.keys(updatedDeck)
    });

    setComponentDeck(updatedDeck);
    
    // Ensure we're passing the correct data structure
    const deckToSave: ComponentBasedSlideDeck = {
      ...updatedDeck,
      slides: updatedDeck.slides.map(slide => ({
        ...slide,
        slideId: slide.slideId,
        templateId: slide.templateId,
        props: slide.props || {},
        metadata: slide.metadata || {}
      }))
    };
    
    console.log('🔍 SmartSlideDeckViewer: Final deck being saved:', {
      totalSlides: deckToSave.slides.length,
      slides: deckToSave.slides.map((slide, index) => ({
        index,
        slideId: slide.slideId,
        templateId: slide.templateId,
        propsKeys: Object.keys(slide.props || {})
      }))
    });
    
    onSave?.(deckToSave);
  };

  // Delete slide
  const deleteSlide = (slideId: string) => {
    if (!componentDeck || componentDeck.slides.length <= 1) return;

    const updatedDeck: ComponentBasedSlideDeck = {
      ...componentDeck,
      slides: componentDeck.slides.filter((s: ComponentBasedSlide) => s.slideId !== slideId)
    };

    // Update slide numbers
    updatedDeck.slides.forEach((slide: ComponentBasedSlide, index: number) => {
      slide.slideNumber = index + 1;
    });

    setComponentDeck(updatedDeck);
    
    // Slide deleted - no need to select next slide since navigation is removed
    
    onSave?.(updatedDeck);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
                 <div>
          <div style={{ marginBottom: '12px' }}>🔄 Loading slides...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          Error Loading Slides
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
      {/* Floating Add Slide Button - Only show when editable */}
      {isEditable && (
        <FloatingAddSlideButton
          onAddSlide={addSlide}
          disabled={false}
          currentSlideCount={componentDeck.slides.length}
        />
      )}

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


              {/* Component-based slide content */}
              <div className="slide-content">
        <ComponentBasedSlideDeckRenderer
                  slides={[slide]}
          isEditable={isEditable}
          onSlideUpdate={isEditable ? handleSlideUpdate : undefined}
          onTemplateChange={isEditable ? handleTemplateChange : undefined}
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