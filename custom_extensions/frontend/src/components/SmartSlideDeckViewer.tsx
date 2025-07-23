// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';

interface SmartSlideDeckViewerProps {
  /** The slide deck data - must be in component-based format */
  deck: ComponentBasedSlideDeck | any;
  
  /** Whether the deck is editable */
  isEditable?: boolean;
  
  /** Save callback for changes */
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  
  /** Show format detection info */
  showFormatInfo?: boolean;
}

// Inline Editor Component
interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
}

function InlineEditor({ initialValue, onSave, onCancel, multiline = false }: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  if (multiline) {
    return React.createElement('textarea', {
      ref: inputRef as React.RefObject<HTMLTextAreaElement>,
      className: 'inline-editor-textarea',
      value: value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      rows: 4
    });
  }

  return React.createElement('input', {
    ref: inputRef as React.RefObject<HTMLInputElement>,
    className: 'inline-editor-input',
    type: 'text',
    value: value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur
  });
}

export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave,
  showFormatInfo = false
}) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

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

        // Update existing slides with new default colors if they don't have backgroundColor set
        const updatedSlides = deck.slides.map((slide: any) => {
          const updatedProps = { ...slide.props };
          
          // Force update background color to new default
          if (!updatedProps.backgroundColor || updatedProps.backgroundColor === '#ffffff' || updatedProps.backgroundColor === '#110c35') {
            updatedProps.backgroundColor = '#261c4e';
          }
          
          // Force update title color
          if (!updatedProps.titleColor || updatedProps.titleColor === '#1a1a1a') {
            updatedProps.titleColor = '#ffffff';
          }
          
          // Force update content/subtitle colors
          if (!updatedProps.contentColor || updatedProps.contentColor === '#333333') {
            updatedProps.contentColor = '#d9e1ff';
          }
          if (!updatedProps.subtitleColor || updatedProps.subtitleColor === '#666666' || updatedProps.subtitleColor === '#cccccc') {
            updatedProps.subtitleColor = '#d9e1ff';
          }
          
          return {
            ...slide,
            props: updatedProps
          };
        });

        const updatedDeck = {
          ...deck,
          slides: updatedSlides
        };

        setComponentDeck(updatedDeck as ComponentBasedSlideDeck);
        
        // Save the updated colors back to parent
        if (onSave && (JSON.stringify(updatedDeck) !== JSON.stringify(deck))) {
          onSave(updatedDeck as ComponentBasedSlideDeck);
        }
        
        console.log('✅ Component-based slides loaded and updated with new colors:', {
          slideCount: updatedDeck.slides.length,
          templates: updatedDeck.slides.map((s: any) => s.templateId)
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
    if (componentDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...componentDeck,
        slides: componentDeck.slides.map((slide: ComponentBasedSlide) => 
          slide.slideId === updatedSlide.slideId ? updatedSlide : slide
        )
      };
      setComponentDeck(updatedDeck);
      onSave?.(updatedDeck);
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
  const addSlide = () => {
    if (!componentDeck) return;

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}`,
      slideNumber: componentDeck.slides.length + 1,
      templateId: 'content-slide',
      props: {
        title: `Slide ${componentDeck.slides.length + 1}`,
        content: 'Add your content here...',
        backgroundColor: '#261c4e'
      },
      metadata: {}
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
      {/* Professional Header */}
      <div className="professional-header">
        <div className="header-content">
          <div className="presentation-info">
            <h1 className="presentation-title">{componentDeck.lessonTitle || 'Presentation'}</h1>
            <span className="slide-counter">{componentDeck.slides.length} slides</span>
          </div>
          
          {isEditable && (
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

        {/* Format Info (if enabled) */}
        {showFormatInfo && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            marginTop: '12px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            <span>📊 Slide Deck Info:</span> Component-based format • {componentDeck.slides.length} slides
          </div>
        )}
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
              {isEditable ? (
                <div 
                  className="slide-title-editable"
                  onClick={() => setEditingTitle(slide.slideId)}
                >
                  {editingTitle === slide.slideId ? (
                    <InlineEditor
                      initialValue={slide.props.title || `Slide ${slide.slideNumber}`}
                      onSave={(newTitle) => {
                        const updatedSlide: ComponentBasedSlide = {
                          ...slide,
                          props: { ...slide.props, title: newTitle }
                        };
                        handleSlideUpdate(updatedSlide);
                        setEditingTitle(null);
                      }}
                      onCancel={() => setEditingTitle(null)}
                    />
                  ) : (
                    <h2 className="slide-title-text">{slide.props.title || `Slide ${slide.slideNumber}`}</h2>
                  )}
                </div>
              ) : (
                <h2 className="slide-title-display">{slide.props.title || `Slide ${slide.slideNumber}`}</h2>
              )}

              {/* Component-based slide content */}
              <div className="slide-content">
                <ComponentBasedSlideDeckRenderer
                  slides={[slide]}
                  isEditable={isEditable}
                  onSlideUpdate={isEditable ? handleSlideUpdate : undefined}
                  onTemplateChange={isEditable ? handleTemplateChange : undefined}
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