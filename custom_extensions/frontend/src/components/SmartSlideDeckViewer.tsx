// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Plus, ChevronDown, X } from 'lucide-react';
import { ComponentBasedSlideDeck, ComponentBasedSlide, TemplateComponentInfo } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import VoiceoverPanel from './VoiceoverPanel';
import { getAllTemplates, getTemplate } from './templates/registry';

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
  deck: initialDeck,
  isEditable = false,
  onSave,
  showFormatInfo = false,
  theme,
  hasVoiceover = false
}: SmartSlideDeckViewerProps) => {
  const [isVoiceoverPanelOpen, setIsVoiceoverPanelOpen] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [currentSlideId, setCurrentSlideId] = useState<string | undefined>(initialDeck?.slides[0]?.slideId);
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck>(initialDeck);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const availableTemplates = getAllTemplates();

  // Check if any slide has voiceover
  const hasAnyVoiceover = componentDeck?.slides.some(
    (slide: ComponentBasedSlide) => slide.voiceoverText || slide.props?.voiceoverText
  );

  // Add new slide with template selection
  const handleAddSlide = (templateId: string) => {
    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: componentDeck.slides.length + 1,
      templateId: templateId,
      props: {
        ...template.defaultProps,
        title: template.defaultProps.title || `Slide ${componentDeck.slides.length + 1}`,
        content: template.defaultProps.content || 'Add your content here...'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const updatedDeck = {
      ...componentDeck,
      slides: [...componentDeck.slides, newSlide]
    };

    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
    setShowTemplateDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Process deck - expect component-based format only
  useEffect(() => {
    const processDeck = async () => {
      // setIsLoading(true); // Removed as per new_code
      // setError(null); // Removed as per new_code

      try {
        if (!initialDeck || !initialDeck.slides || !Array.isArray(initialDeck.slides)) {
          // setError('Invalid slide deck format. Expected component-based slides.'); // Removed as per new_code
          return;
        }

        // Validate that slides have templateId and props (component-based format)
        const hasValidFormat = initialDeck.slides.every((slide: any) => 
          slide.hasOwnProperty('templateId') && slide.hasOwnProperty('props')
        );

        if (!hasValidFormat) {
          // setError('Slides must be in component-based format with templateId and props.'); // Removed as per new_code
          return;
        }

        // 🔍 DETAILED LOGGING: Let's see what props are actually coming from backend
        console.log('🔍 RAW SLIDES DATA FROM BACKEND:');
        initialDeck.slides.forEach((slide: any, index: number) => {
          console.log(`📄 Slide ${index + 1} (${slide.templateId}):`, {
            slideId: slide.slideId,
            templateId: slide.templateId,
            props: slide.props
          });
        });

        // Set theme on the deck
        const deckWithTheme = {
          ...initialDeck,
          theme: theme || initialDeck.theme || DEFAULT_SLIDE_THEME
        };

        setComponentDeck(deckWithTheme as ComponentBasedSlideDeck);
        
        console.log('✅ Component-based slides loaded with theme:', {
          slideCount: initialDeck.slides.length,
          theme: deckWithTheme.theme,
          themeColors: getSlideTheme(theme || initialDeck.theme || DEFAULT_SLIDE_THEME).colors,
          templates: initialDeck.slides.map((s: any) => s.templateId)
          });
        
      } catch (err) {
        console.error('❌ Error processing slide deck:', err);
        // setError('Failed to process slide deck data.'); // Removed as per new_code
      } finally {
        // setIsLoading(false); // Removed as per new_code
      }
    };

    processDeck();
  }, [initialDeck, theme]); // Removed currentTheme.colors as per new_code

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

  // Loading state
  // if (isLoading) { // Removed as per new_code
  //   return ( // Removed as per new_code
  //     <div style={{ // Removed as per new_code
  //       display: 'flex', // Removed as per new_code
  //       justifyContent: 'center', // Removed as per new_code
  //       alignItems: 'center', // Removed as per new_code
  //       minHeight: '400px', // Removed as per new_code
  //       fontSize: '16px', // Removed as per new_code
  //       color: '#6b7280' // Removed as per new_code
  //     }}> // Removed as per new_code
  //       <div> // Removed as per new_code
  //         <div style={{ marginBottom: '12px' }}>🔄 Loading slides...</div> // Removed as per new_code
  //       </div> // Removed as per new_code
  //     </div> // Removed as per new_code
  //   ); // Removed as per new_code
  // } // Removed as per new_code

  // Error state
  // if (error) { // Removed as per new_code
  //   return ( // Removed as per new_code
  //     <div style={{ // Removed as per new_code
  //       padding: '40px', // Removed as per new_code
  //       textAlign: 'center', // Removed as per new_code
  //       backgroundColor: '#fef2f2', // Removed as per new_code
  //       border: '1px solid #fecaca', // Removed as per new_code
  //       borderRadius: '8px', // Removed as per new_code
  //       color: '#dc2626' // Removed as per new_code
  //     }}> // Removed as per new_code
  //       <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️</div> // Removed as per new_code
  //       <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}> // Removed as per new_code
  //         Error Loading Slides // Removed as per new_code
  //       </div> // Removed as per new_code
  //       <div style={{ fontSize: '14px' }}>{error}</div> // Removed as per new_code
  //       {showFormatInfo && ( // Removed as per new_code
  //         <div style={{  // Removed as per new_code
  //           marginTop: '16px',  // Removed as per new_code
  //           padding: '12px',  // Removed as per new_code
  //           backgroundColor: '#f9fafb', // Removed as per new_code
  //           border: '1px solid #e5e7eb', // Removed as per new_code
  //           borderRadius: '6px', // Removed as per new_code
  //           fontSize: '12px', // Removed as per new_code
  //           color: '#6b7280' // Removed as per new_code
  //         }}> // Removed as per new_code
  //           Debug Info: Expected component-based format with templateId and props // Removed as per new_code
  //         </div> // Removed as per new_code
  //       )} // Removed as per new_code
  //     </div> // Removed as per new_code
  //   ); // Removed as per new_code
  // } // Removed as per new_code

  // if (!componentDeck) { // Removed as per new_code
  //   return ( // Removed as per new_code
  //     <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}> // Removed as per new_code
  //       No slide deck available // Removed as per new_code
  //     </div> // Removed as per new_code
  //   ); // Removed as per new_code
  // } // Removed as per new_code

  // Success: Render component-based viewer
  return (
    <div className="slide-deck-viewer" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* White Vertical Panel on the Right */}
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
        {/* Add Slide Button (if editable) */}
        {isEditable && (
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
            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
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
            title="Add new slide"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Voiceover Button (only if has voiceover) */}
        {hasAnyVoiceover && (
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
        )}

        {/* Future buttons can be added here */}
      </div>

      {/* Template Dropdown */}
      {showTemplateDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            right: '60px', // Position to the left of the right menu
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            zIndex: 1001,
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '300px'
          }}
        >
          {/* Template options */}
          {Object.entries(availableTemplates).map(([id, template]: [string, TemplateComponentInfo]) => (
            <button
              key={id}
              onClick={() => handleAddSlide(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                width: '100%',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ marginRight: '12px' }}>{template.icon}</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{template.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{template.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <ComponentBasedSlideDeckRenderer
          slides={componentDeck.slides}
          isEditable={isEditable}
          onSlideUpdate={handleSlideUpdate}
          onTemplateChange={handleTemplateChange}
          theme={theme || componentDeck.theme}
        />
      </div>

      {/* Voiceover Panel */}
      {hasAnyVoiceover && (
        <VoiceoverPanel
          isOpen={isVoiceoverPanelOpen}
          onClose={() => setIsVoiceoverPanelOpen(false)}
          slides={componentDeck.slides.map((slide: ComponentBasedSlide) => ({
            slideId: slide.slideId,
            slideNumber: slide.slideNumber || 0,
            slideTitle: slide.props?.title || `Slide ${slide.slideNumber || 0}`,
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
          onVoiceoverUpdate={(slideId, newVoiceoverText) => {
            const updatedDeck = {
              ...componentDeck,
              slides: componentDeck.slides.map((slide: ComponentBasedSlide) =>
                slide.slideId === slideId
                  ? { ...slide, voiceoverText: newVoiceoverText }
                  : slide
              )
            };
            setComponentDeck(updatedDeck);
            onSave?.(updatedDeck);
          }}
        />
      )}
    </div>
  );
};

export default SmartSlideDeckViewer; 