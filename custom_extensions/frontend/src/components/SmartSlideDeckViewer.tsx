// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import VoiceoverPanel from './VoiceoverPanel';
import { ThemePicker } from './theme/ThemePicker';
import { useTheme } from '@/hooks/useTheme';
import { getAllTemplates, getTemplate } from './templates/registry';
import { Plus, ChevronDown, X, Volume2, Palette} from 'lucide-react';


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

  /** Project ID for theme persistence */
  projectId?: string;
}

export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave,
  showFormatInfo = false,
  theme,
  hasVoiceover = false,
  projectId
}: SmartSlideDeckViewerProps) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceoverPanelOpen, setIsVoiceoverPanelOpen] = useState(false);
  const [currentSlideId, setCurrentSlideId] = useState<string | undefined>(undefined);
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  
  // Template dropdown state
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Theme picker state
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Scroll synchronization state
  const [isScrollingSlidesFromPanel, setIsScrollingSlidesFromPanel] = useState(false);
  const [isScrollingPanelFromSlides, setIsScrollingPanelFromSlides] = useState(false);

  // Theme management for slide decks
  const { currentTheme, changeTheme, isChangingTheme } = useTheme({
    initialTheme: deck?.theme || theme,
    slideDeck: componentDeck || undefined,
    projectId: projectId,
    enablePersistence: true,
    onThemeChange: (newTheme, updatedDeck) => {
      console.log('🎨 Theme changed:', { newTheme, updatedDeck });
      
      // Update the component deck with new theme
      if (updatedDeck) {
        setComponentDeck(updatedDeck);
        
        // Call the parent's onSave callback
        onSave?.(updatedDeck);
      }
    }
  });
  
  // Get the current theme data
  const currentThemeData = getSlideTheme(currentTheme || DEFAULT_SLIDE_THEME);

  // Check if any slide has voiceover text
  const hasAnyVoiceover = hasVoiceover && componentDeck?.slides?.some((slide: ComponentBasedSlide) => 
    slide.voiceoverText || slide.props?.voiceoverText
  );

  // Get available templates
  const availableTemplates = getAllTemplates();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
        setShowThemePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ensure body scrolling remains enabled
  useEffect(() => {
    // Make sure document body scrolling is never disabled by this component
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
    }
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
        
        // Expose slide data to window object for video generation
        (window as any).currentSlideData = {
          deck: deckWithTheme
        };
        
        console.log('✅ Component-based slides loaded with theme:', {
          slideCount: deck.slides.length,
          theme: deckWithTheme.theme,
          themeColors: currentThemeData.colors,
          templates: deck.slides.map((s: any) => s.templateId)
          });
        
        console.log('🎬 Exposed slide data to window for video generation:', (window as any).currentSlideData);
        
      } catch (err) {
        console.error('❌ Error processing slide deck:', err);
        setError('Failed to process slide deck data.');
      } finally {
        setIsLoading(false);
      }
    };

      processDeck();
  }, [deck, theme, currentThemeData.colors]);

  // Improved synchronized scrolling with voiceover panel
  useEffect(() => {
    if (!isVoiceoverPanelOpen || !slidesContainerRef.current) return;

    const handlePanelScroll = () => {
      if (isScrollingPanelFromSlides) return; // Prevent circular updates
      
      const panelContent = document.querySelector('.panel-content');
      const slidesContainer = slidesContainerRef.current;
      
      if (panelContent && slidesContainer) {
        setIsScrollingSlidesFromPanel(true);
        
        const panelScrollTop = panelContent.scrollTop;
        const panelScrollHeight = panelContent.scrollHeight;
        const panelClientHeight = panelContent.clientHeight;
        const slidesScrollHeight = slidesContainer.scrollHeight;
        const slidesClientHeight = slidesContainer.clientHeight;
        
        // Calculate scroll percentage and apply to slides
        const scrollPercentage = panelScrollTop / (panelScrollHeight - panelClientHeight);
        const slidesScrollTop = scrollPercentage * (slidesScrollHeight - slidesClientHeight);
        
        slidesContainer.scrollTop = slidesScrollTop;
        
        // Reset flag after a short delay
        setTimeout(() => setIsScrollingSlidesFromPanel(false), 50);
      }
    };

    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.addEventListener('scroll', handlePanelScroll);
      return () => panelContent.removeEventListener('scroll', handlePanelScroll);
    }
  }, [isVoiceoverPanelOpen, isScrollingPanelFromSlides]);

  // Handle slides scroll to sync with panel
  const handleSlidesScroll = () => {
    if (!isVoiceoverPanelOpen || isScrollingSlidesFromPanel) return; // Prevent circular updates

    const slidesContainer = slidesContainerRef.current;
    const panelContent = document.querySelector('.panel-content');
    
    if (slidesContainer && panelContent) {
      setIsScrollingPanelFromSlides(true);
      
      const slidesScrollTop = slidesContainer.scrollTop;
      const slidesScrollHeight = slidesContainer.scrollHeight;
      const slidesClientHeight = slidesContainer.clientHeight;
      const panelScrollHeight = panelContent.scrollHeight;
      const panelClientHeight = panelContent.clientHeight;
      
      // Calculate scroll percentage and apply to panel
      const scrollPercentage = slidesScrollTop / (slidesScrollHeight - slidesClientHeight);
      const panelScrollTop = scrollPercentage * (panelScrollHeight - panelClientHeight);
      
      panelContent.scrollTop = panelScrollTop;
      
      // Reset flag after a short delay
      setTimeout(() => setIsScrollingPanelFromSlides(false), 50);
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

  // Add new slide with template selection - FIXED VERSION
  const addSlide = (templateId: string = 'content-slide') => {
    if (!componentDeck) return;

    const template = getTemplate(templateId);
    if (!template) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    // Generate slide title from template props
    const slideTitle = template.defaultProps.title || `Slide ${componentDeck.slides.length + 1}`;

    // Create new slide with BOTH frontend and backend compatible structure
    const newSlide: ComponentBasedSlide & { slideTitle?: string } = {
      slideId: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slideNumber: componentDeck.slides.length + 1,
      slideTitle: slideTitle, // ← CRITICAL: Add slideTitle for backend compatibility
      templateId: templateId,
      props: {
        ...template.defaultProps,
        title: slideTitle, // ← Keep title in props for frontend template rendering
        content: template.defaultProps.content || 'Add your content here...'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Add empty voiceover text for video lesson presentations
    if (hasAnyVoiceover) {
      newSlide.voiceoverText = '';
      if (newSlide.props) {
        newSlide.props.voiceoverText = '';
      }
    }

    const updatedDeck = {
      ...componentDeck,
      slides: [...componentDeck.slides, newSlide as ComponentBasedSlide]
    };

    console.log('🔍 SmartSlideDeckViewer: Adding new slide with backend compatibility:', {
      templateId,
      template,
      slideTitle,
      newSlide,
      hasSlideTitle: !!newSlide.slideTitle,
      hasTitleInProps: !!newSlide.props.title,
      hasVoiceover: hasAnyVoiceover,
      voiceoverText: newSlide.voiceoverText,
      updatedDeck
    });

    // Use the SAME save mechanism as inline editing
    setComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
    setShowTemplateDropdown(false);
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

  // Success: Render component-based viewer with right-side menu
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
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            {componentDeck.lessonTitle || 'Slide Deck'}
          </h1>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            {componentDeck.slides.length} slide{componentDeck.slides.length !== 1 ? 's' : ''}
          </div>
        </div>
        <h1>Hello22</h1>
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
          alignItems: 'flex-start', // Align to top
          pointerEvents: 'auto', // Ensure pointer events work
          userSelect: 'auto' // Ensure text selection works
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
            overflowX: 'hidden',
            pointerEvents: 'auto', // Ensure pointer events are enabled
            userSelect: 'auto', // Ensure text selection works
            touchAction: 'auto' // Ensure touch scrolling works on mobile
          }}
          onScroll={handleSlidesScroll}
        >
          {componentDeck.slides.map((slide: ComponentBasedSlide) => (
            <div
              key={slide.slideId}
              style={{
                marginBottom: '40px',
                position: 'relative'
              }}
            >
              {/* Delete Button - positioned above the slide */}
              {isEditable && componentDeck.slides.length > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '8px'
                }}>
                  <button
                    onClick={() => deleteSlide(slide.slideId)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                    title="Delete slide"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Slide Container */}
              <div
                className="professional-slide relative"
                id={`slide-${slide.slideId}`}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  transform: 'none', // Prevent any additional transforms
                  transition: 'none', // Prevent slide-specific transitions
                }}
              >
                {/* Component-based slide content */}
                <div className="slide-content">
                  <ComponentBasedSlideDeckRenderer
                    slides={[slide]}
                    isEditable={isEditable}
                    onSlideUpdate={isEditable ? handleSlideUpdate : undefined}
                    onTemplateChange={isEditable ? handleTemplateChange : undefined}
                    theme={currentTheme}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right-side Vertical Panel - Always visible */}
      {!showThemePicker && (hasAnyVoiceover || !isVoiceoverPanelOpen) && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: '50%',
            right: '0',
            width: '48px',
            height: '400px',
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            gap: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transform: 'translateY(-50%)'
          }}
        >
          {/* Add Slide Button - moved from left side */}
          {isEditable && (
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
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
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              title="Add new slide"
            >
              <Plus size={16} />
            </button>
          )}

          {/* Theme Button */}
          <button
            onClick={() => setShowThemePicker(true)}
            disabled={isChangingTheme}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: isChangingTheme ? '#9ca3af' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isChangingTheme ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              opacity: isChangingTheme ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isChangingTheme) {
                e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isChangingTheme) {
                e.currentTarget.style.backgroundColor = '#6b7280';
              e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
            title={isChangingTheme ? "Changing theme..." : "Change presentation theme"}
          >
            <Palette size={16} className="text-white" />
          </button>

          {/* Template Dropdown */}
          {isEditable && showTemplateDropdown && (
            <div
              style={{
                position: 'absolute',
                right: '52px',
                top: '20px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                padding: '8px 0',
                minWidth: '280px',
                maxHeight: '420px',
                overflowY: 'auto',
                zIndex: 1001
              }}
            >
              {/* Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Choose Template
                </h3>
                <button
                  onClick={() => setShowTemplateDropdown(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    color: '#6b7280'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Template List - IMPROVED WITH CATEGORIES */}
              <div style={{ padding: '8px 0', maxHeight: '350px', overflowY: 'auto' }}>
                {/* Popular Templates Section */}
                <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Popular Templates
                </div>
                {availableTemplates
                  .filter(template => ['content-slide', 'bullet-points', 'two-column', 'title-slide'].includes(template.id))
                  .map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addSlide(template.id)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'left',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{template.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '2px'
                        }}>
                          {template.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.3'
                        }}>
                          {template.description}
                        </div>
                      </div>
                    </button>
                  ))}

                {/* Divider */}
                <div style={{ margin: '8px 16px', height: '1px', backgroundColor: '#e5e7eb' }}></div>

                {/* All Templates Section */}
                <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  All Templates
                </div>
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => addSlide(template.id)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textAlign: 'left',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{template.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {template.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
        </div>
      )}

          {/* Voiceover Button - Only show for video lessons */}
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
              onClick={() => setIsVoiceoverPanelOpen(!isVoiceoverPanelOpen)}
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
              title={isVoiceoverPanelOpen ? "Close Voiceover Panel" : "Open Voiceover Panel"}
                    >
              <Volume2 className="w-4 h-4 text-white" />
                    </button>
                  )}
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

      {/* Theme Picker Panel */}
      <ThemePicker
        isOpen={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        selectedTheme={currentTheme}
        onThemeSelect={changeTheme}
        isChanging={isChangingTheme}
      />
    </div>
  );
};

export default SmartSlideDeckViewer; 