// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import VoiceoverPanel from './VoiceoverPanel';
import { getAllTemplates, getTemplate } from './templates/registry';
import { Plus, ChevronDown, X, Volume2} from 'lucide-react';

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
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

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

  // Success: Render component-based viewer with right sidebar add button
  return (
    <div className="slide-deck-viewer" style={{ position: 'relative', minHeight: '100vh', display: 'flex' }}>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* Format Detection Info */}
        {showFormatInfo && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px',
            fontSize: '14px',
            color: '#0c4a6e'
          }}>
            <strong>Format:</strong> Component-based slide deck detected. Using SmartSlideDeckViewer.
          </div>
        )}

        {/* Slide Content */}
        <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
          <ComponentBasedSlideDeckRenderer 
            slides={componentDeck.slides}
            isEditable={isEditable}
            onSlideUpdate={isEditable ? handleSlideUpdate : undefined}
            onTemplateChange={isEditable ? handleTemplateChange : undefined}
            theme={componentDeck.theme}
          />
          
          {/* Voiceover Panel */}
          {hasAnyVoiceover && (
            <div style={{ marginTop: '20px' }}>
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
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Add Slide Controls */}
      {isEditable && (
        <div 
          style={{
            width: '80px',
            background: 'white',
            borderLeft: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            gap: '24px',
            position: 'sticky',
            top: '0',
            height: '100vh',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: showTemplateDropdown ? '#e8f0fe' : 'transparent',
                  color: showTemplateDropdown ? '#1a73e8' : '#5f6368',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!showTemplateDropdown) {
                    e.currentTarget.style.backgroundColor = '#f1f3f4';
                    e.currentTarget.style.color = '#1a73e8';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!showTemplateDropdown) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#5f6368';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                title="Add new slide"
              >
                <Plus size={20} />
              </button>
              
              {/* Template Dropdown */}
              {showTemplateDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: '100%',
                    top: '0',
                    marginRight: '16px',
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
                          <span style={{ fontSize: '20px' }}>{template.icon}</span>
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

                    {/* Spacer */}
                    <div style={{ height: '8px' }} />

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
                        <span style={{ fontSize: '20px' }}>{template.icon}</span>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9ca3af' }}>
                          <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSlideDeckViewer; 