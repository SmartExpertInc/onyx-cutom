// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { getAllTemplates, getTemplate } from './templates/registry';
import { Plus, ChevronDown, X } from 'lucide-react';

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
}: SmartSlideDeckViewerProps) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Template dropdown state
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

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

    const updatedDeck: ComponentBasedSlideDeck = {
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

  // Success: Render component-based viewer with fixed-position add button
  return (
    <div className="slide-deck-viewer" style={{ position: 'relative' }}>
      {/* Fixed Position Add Slide Button - IMPROVED VERSION */}
      {isEditable && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {/* Main Add Button */}
          <button
            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease',
              marginBottom: '8px'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Add new slide"
          >
            <Plus size={24} />
          </button>

          {/* Template Dropdown */}
          {showTemplateDropdown && (
            <div
              style={{
                position: 'absolute',
                left: '70px',
                top: '0',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                padding: '8px 0',
                minWidth: '280px',
                maxHeight: '400px',
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
        </div>
      )}

      {/* Professional Header */}
      <div className="professional-header">
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
      </div>

      {/* Main Content Area - IMPROVED SPACING */}
      <div className="main-content" style={{ 
        marginLeft: isEditable ? '100px' : '0',
        paddingTop: '20px'
      }}>
        {/* Slides Container */}
        <div className="slides-container">
          {componentDeck.slides.map((slide: ComponentBasedSlide) => (
            <div
              key={slide.slideId}
              className="professional-slide"
              id={`slide-${slide.slideId}`}
              style={{
                marginBottom: '40px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              {/* Slide Header with Template Info and Delete Button */}
              {isEditable && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      backgroundColor: '#e5e7eb',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {getTemplate(slide.templateId)?.name || slide.templateId}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      Slide {slide.slideNumber}
                    </span>
                  </div>
                  {componentDeck.slides.length > 1 && (
                    <button
                      onClick={() => deleteSlide(slide.slideId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#ef4444',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Delete slide"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

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