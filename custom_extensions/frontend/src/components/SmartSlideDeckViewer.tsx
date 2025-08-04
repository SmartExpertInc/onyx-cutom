// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import VoiceoverPanel from './VoiceoverPanel';
import { Volume2 } from 'lucide-react';

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
  
  /** Whether to enable voiceover features */
  hasVoiceover?: boolean;
}

export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave,
  showFormatInfo = false,
  theme,
  hasVoiceover = false
}) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceoverPanelOpen, setIsVoiceoverPanelOpen] = useState(false);
  const [currentSlideId, setCurrentSlideId] = useState<string | undefined>(undefined);
  
  // Refs for synchronized scrolling
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const voiceoverPanelRef = useRef<HTMLDivElement>(null);
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

  // Check if any slide has voiceover text
  const hasAnyVoiceover = hasVoiceover && componentDeck?.slides?.some((slide: ComponentBasedSlide) => 
    slide.voiceoverText || slide.props?.voiceoverText
  );

  // Synchronized scrolling effect
  useEffect(() => {
    if (!isVoiceoverPanelOpen || !slidesContainerRef.current || !voiceoverPanelRef.current) return;

    const slidesContainer = slidesContainerRef.current;
    const voiceoverPanel = voiceoverPanelRef.current;

    const handleSlidesScroll = () => {
      if (voiceoverPanel) {
        const scrollPercentage = slidesContainer.scrollTop / (slidesContainer.scrollHeight - slidesContainer.clientHeight);
        const maxScroll = voiceoverPanel.scrollHeight - voiceoverPanel.clientHeight;
        voiceoverPanel.scrollTop = scrollPercentage * maxScroll;
      }
    };

    const handleVoiceoverScroll = () => {
      if (slidesContainer) {
        const scrollPercentage = voiceoverPanel.scrollTop / (voiceoverPanel.scrollHeight - voiceoverPanel.clientHeight);
        const maxScroll = slidesContainer.scrollHeight - slidesContainer.clientHeight;
        slidesContainer.scrollTop = scrollPercentage * maxScroll;
      }
    };

    slidesContainer.addEventListener('scroll', handleSlidesScroll, { passive: true });
    voiceoverPanel.addEventListener('scroll', handleVoiceoverScroll, { passive: true });

    return () => {
      slidesContainer.removeEventListener('scroll', handleSlidesScroll);
      voiceoverPanel.removeEventListener('scroll', handleVoiceoverScroll);
    };
  }, [isVoiceoverPanelOpen]);

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
        setError('Failed to process slide deck data.');
      } finally {
        setIsLoading(false);
      }
    };

    processDeck();
  }, [deck, theme, currentTheme.colors]);

  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    if (!componentDeck) return;

    const updatedSlides = componentDeck.slides.map((slide: ComponentBasedSlide) =>
      slide.slideId === updatedSlide.slideId ? updatedSlide : slide
    );

    const updatedDeck = {
      ...componentDeck,
      slides: updatedSlides
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  const handleTemplateChange = (slideId: string, newTemplateId: string) => {
    if (!componentDeck) return;

    const updatedSlides = componentDeck.slides.map((slide: ComponentBasedSlide) =>
      slide.slideId === slideId ? { ...slide, templateId: newTemplateId } : slide
    );

    const updatedDeck = {
      ...componentDeck,
      slides: updatedSlides
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  const addSlide = () => {
    if (!componentDeck) return;

    const newSlideNumber = componentDeck.slides.length + 1;
    const newSlide: ComponentBasedSlide = {
      slideId: `slide_${newSlideNumber}_new`,
      slideNumber: newSlideNumber,
      templateId: 'content-slide',
      props: {
        title: `New Slide ${newSlideNumber}`,
        content: 'Add your content here...'
      }
    };

    const updatedDeck = {
      ...componentDeck,
      slides: [...componentDeck.slides, newSlide]
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  const deleteSlide = (slideId: string) => {
    if (!componentDeck || componentDeck.slides.length <= 1) return;

    const updatedSlides = componentDeck.slides
      .filter((slide: ComponentBasedSlide) => slide.slideId !== slideId)
      .map((slide: ComponentBasedSlide, index: number) => ({
        ...slide,
        slideNumber: index + 1
      }));

    const updatedDeck = {
      ...componentDeck,
      slides: updatedSlides
    };

    setComponentDeck(updatedDeck);
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
    <div className="slide-deck-viewer" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Professional Header */}
      <div 
        className="professional-header"
        style={{
          transform: isVoiceoverPanelOpen ? 'translateX(384px)' : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out',
          width: '100%',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div className="header-content">
          <div className="header-controls">
            {isEditable && (
              <button 
                className="control-button add-button"
                onClick={addSlide}
              >
                <span className="button-icon">+</span>
                Add Slide
              </button>
            )}
            {/* Voiceover button removed from header - only on right panel */}
          </div>
        </div>
      </div>

      {/* Main Content Area - Smaller to match slide size */}
      <div 
        className="main-content"
        style={{
          transform: isVoiceoverPanelOpen ? 'translateX(384px)' : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out',
          width: '100%',
          position: 'relative',
          zIndex: 5,
          backgroundColor: 'white',
          minHeight: 'calc(100vh - 80px)', // Adjust based on header height
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '20px',
          maxHeight: 'calc(100vh - 80px)', // Limit height to match slide size
          overflow: 'hidden' // Prevent scrolling on main container
        }}
      >
        {/* Slides Container - 30% smaller with scroll */}
        <div 
          ref={slidesContainerRef}
          className="slides-container"
          style={{
            transform: 'scale(0.7)', // 30% smaller (70% of original size)
            transformOrigin: 'top center',
            width: '100%',
            maxWidth: '1200px',
            height: '100%',
            overflowY: 'auto', // Enable scrolling
            overflowX: 'hidden'
          }}
        >
          {componentDeck.slides.map((slide: ComponentBasedSlide) => (
            <div
              key={slide.slideId}
              className="professional-slide relative"
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

      {/* Small White Vertical Panel on the Right - 2x bigger height */}
      {hasAnyVoiceover && !isVoiceoverPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            right: '0',
            transform: 'translateY(-50%)',
            width: '60px',
            height: '400px', // 2x bigger (was 200px)
            backgroundColor: 'white',
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 8px'
          }}
        >
          {/* Voiceover Button */}
          <button
            onClick={() => setIsVoiceoverPanelOpen(true)}
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            title="Open Voiceover Panel"
          >
            <Volume2 className="w-5 h-5 text-white" />
          </button>
          
          {/* Future buttons can be added here */}
          {/* Example:
          <button
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Another Action"
          >
            <SomeIcon className="w-5 h-5 text-gray-600" />
          </button>
          */}
        </div>
      )}

      {/* Voiceover Panel with synchronized scrolling */}
      {hasAnyVoiceover && (
        <VoiceoverPanel
          ref={voiceoverPanelRef}
          isOpen={isVoiceoverPanelOpen}
          onClose={() => setIsVoiceoverPanelOpen(false)}
          slides={componentDeck.slides.map((slide: ComponentBasedSlide) => ({
            slideId: slide.slideId,
            slideNumber: slide.slideNumber || 0,
            slideTitle: (slide as any).slideTitle || `Slide ${slide.slideNumber || 0}`,
            voiceoverText: slide.voiceoverText || slide.props?.voiceoverText
          }))}
          currentSlideId={currentSlideId}
          onSlideSelect={(slideId) => {
            setCurrentSlideId(slideId);
            // Scroll to the selected slide
            const slideElement = document.getElementById(`slide-${slideId}`);
            if (slideElement && slidesContainerRef.current) {
              slideElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      )}
    </div>
  );
};

export default SmartSlideDeckViewer; 