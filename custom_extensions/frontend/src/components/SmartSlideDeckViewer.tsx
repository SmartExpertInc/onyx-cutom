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
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

  // Check if any slide has voiceover text
  const hasAnyVoiceover = hasVoiceover && componentDeck?.slides?.some((slide: ComponentBasedSlide) => 
    slide.voiceoverText || slide.props?.voiceoverText
  );

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

  // Synchronized scrolling with voiceover panel
  useEffect(() => {
    if (!isVoiceoverPanelOpen || !slidesContainerRef.current) return;

    const handlePanelScroll = () => {
      const panelContent = document.querySelector('.panel-content');
      const slidesContainer = slidesContainerRef.current;
      
      if (panelContent && slidesContainer) {
        const panelScrollTop = panelContent.scrollTop;
        const panelScrollHeight = panelContent.scrollHeight;
        const panelClientHeight = panelContent.clientHeight;
        const slidesScrollHeight = slidesContainer.scrollHeight;
        const slidesClientHeight = slidesContainer.clientHeight;
        
        // Calculate scroll percentage and apply to slides
        const scrollPercentage = panelScrollTop / (panelScrollHeight - panelClientHeight);
        const slidesScrollTop = scrollPercentage * (slidesScrollHeight - slidesClientHeight);
        
        slidesContainer.scrollTop = slidesScrollTop;
      }
    };

    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.addEventListener('scroll', handlePanelScroll);
      return () => panelContent.removeEventListener('scroll', handlePanelScroll);
    }
  }, [isVoiceoverPanelOpen]);

  // Handle slides scroll to sync with panel
  const handleSlidesScroll = () => {
    if (!isVoiceoverPanelOpen) return;

    const slidesContainer = slidesContainerRef.current;
    const panelContent = document.querySelector('.panel-content');
    
    if (slidesContainer && panelContent) {
      const slidesScrollTop = slidesContainer.scrollTop;
      const slidesScrollHeight = slidesContainer.scrollHeight;
      const slidesClientHeight = slidesContainer.clientHeight;
      const panelScrollHeight = panelContent.scrollHeight;
      const panelClientHeight = panelContent.clientHeight;
      
      // Calculate scroll percentage and apply to panel
      const scrollPercentage = slidesScrollTop / (slidesScrollHeight - slidesClientHeight);
      const panelScrollTop = scrollPercentage * (panelScrollHeight - panelClientHeight);
      
      panelContent.scrollTop = panelScrollTop;
    }
  };

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

  const handleVoiceoverUpdate = async (slideId: string, newVoiceoverText: string) => {
    if (!componentDeck) return;

    const updatedSlides = componentDeck.slides.map((slide: ComponentBasedSlide) =>
      slide.slideId === slideId 
        ? { 
            ...slide, 
            voiceoverText: newVoiceoverText,
            props: {
              ...slide.props,
              voiceoverText: newVoiceoverText
            }
          }
        : slide
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
          </div>
        </div>
      </div>

      {/* Main Content Area - Static white container */}
      <div 
        className="main-content"
        style={{
          width: '100%',
          position: 'relative',
          zIndex: 5,
          backgroundColor: '#f8f9fa',
          minHeight: 'calc(100vh - 80px)', // Adjust based on header height
          transformOrigin: 'center center',
          overflow: 'hidden', // Prevent container scroll
          display: 'flex',
          justifyContent: 'flex-end', // Align slides to the right
          alignItems: 'flex-start' // Align to top
        }}
      >
        {/* Slides Container - Scrollable and scalable */}
        <div 
          ref={slidesContainerRef}
          className="slides-container"
          style={{
            transform: isVoiceoverPanelOpen ? 'scale(0.7)' : 'scale(1)', // 30% smaller
            transition: 'transform 0.3s ease-in-out',
            transformOrigin: 'top right', // Changed to top right to stick to right side
            position: 'relative',
            width: '100%',
            height: '100%',
            overflowY: 'auto', // Make slides scrollable
            overflowX: 'hidden'
          }}
          onScroll={handleSlidesScroll}
        >
          {componentDeck.slides.map((slide: ComponentBasedSlide) => (
            <div
              key={slide.slideId}
              className="professional-slide relative"
              id={`slide-${slide.slideId}`}
              style={{
                // Ensure slides maintain their exact position
                position: 'relative',
                transform: 'none', // Prevent any additional transforms
                transition: 'none', // Prevent slide-specific transitions
                marginBottom: '20px' // Add spacing between slides
              }}
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

      {/* White Vertical Panel on the Right (when voiceover panel is closed) */}
      {hasAnyVoiceover && !isVoiceoverPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '48px',
            height: '100vh',
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            gap: '16px'
          }}
        >
          {/* Voiceover Button */}
          <button
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => setIsVoiceoverPanelOpen(true)}
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
            <Volume2 className="w-4 h-4 text-white" />
          </button>

          {/* Future buttons can be added here */}
          {/* Example:
          <button
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#6b7280',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            title="Another Action"
          >
            <SomeIcon className="w-4 h-4 text-white" />
          </button>
          */}
        </div>
      )}

      {/* Voiceover Panel */}
      {hasAnyVoiceover && (
        <VoiceoverPanel
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
          onVoiceoverUpdate={handleVoiceoverUpdate}
        />
      )}
    </div>
  );
};

export default SmartSlideDeckViewer; 