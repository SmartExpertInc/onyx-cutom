// components/SmartSlideDeckViewer.tsx
// Component-based slide viewer with classic UX (sidebar, navigation, inline editing)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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
  showFormatInfo = false,
  theme
}) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [editableDeck, setEditableDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  
  // Inline editing state (копіюємо з page.tsx)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

  // Функція зміни тексту (копіюємо з page.tsx)
  const handleTextChange = useCallback((slideId: string, fieldPath: string, newValue: any) => {
    console.log('handleTextChange called with:', { slideId, fieldPath, newValue, currentEditableDeck: editableDeck });

    setEditableDeck(currentDeck => {
      if (currentDeck === null || currentDeck === undefined) {
        console.warn("Attempted to update null or undefined editableDeck");
        return null;
      }

      const newDeck = JSON.parse(JSON.stringify(currentDeck));
      const slideIndex = newDeck.slides.findIndex((slide: ComponentBasedSlide) => slide.slideId === slideId);
      
      if (slideIndex === -1) {
        console.warn("Slide not found:", slideId);
        return currentDeck;
      }

      // Оновлюємо конкретне поле в слайді
      newDeck.slides[slideIndex].props[fieldPath] = newValue;
      
      // Оновлюємо метадані
      newDeck.slides[slideIndex].metadata = {
        ...newDeck.slides[slideIndex].metadata,
        updatedAt: new Date().toISOString()
      };

      console.log('handleTextChange: Updated deck:', JSON.stringify(newDeck, null, 2));
      return newDeck;
    });

    // Автозбереження (копіюємо з page.tsx)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('Auto-save timeout triggered for slide:', slideId, 'field:', fieldPath);
      handleAutoSave();
    }, 2000);
  }, [editableDeck]);

  // Автозбереження (копіюємо з page.tsx)
  const handleAutoSave = async () => {
    console.log('Auto-save triggered');
    if (!editableDeck) {
      console.log('Auto-save: Missing editableDeck');
      return;
    }
    
    try {
      console.log('Auto-save: Sending data to onSave');
      onSave?.(editableDeck);
    } catch (err: any) {
      console.warn('Auto-save error:', err.message);
    }
  };

  // Cleanup effect для автозбереження (копіюємо з page.tsx)
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        console.log('Component unmounting - triggering pending auto-save');
        clearTimeout(autoSaveTimeoutRef.current);
        if (editableDeck) {
          handleAutoSave();
        }
      }
    };
  }, [editableDeck]);

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
    const currentDeck = editableDeck || componentDeck;
    if (currentDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...currentDeck,
        slides: currentDeck.slides.map((slide: ComponentBasedSlide) => 
          slide.slideId === updatedSlide.slideId ? updatedSlide : slide
        )
      };
      setEditableDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
  };

  const handleTemplateChange = (slideId: string, newTemplateId: string) => {
    const currentDeck = editableDeck || componentDeck;
    if (currentDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...currentDeck,
        slides: currentDeck.slides.map((slide: ComponentBasedSlide) => 
          slide.slideId === slideId 
            ? { ...slide, templateId: newTemplateId }
            : slide
        )
      };
      setEditableDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
  };

  // Add new slide
  const addSlide = () => {
    const currentDeck = editableDeck || componentDeck;
    if (!currentDeck) return;

    const newSlide: ComponentBasedSlide = {
      slideId: `slide-${Date.now()}`,
      slideNumber: currentDeck.slides.length + 1,
      templateId: 'content-slide',
      props: {
        title: `Slide ${currentDeck.slides.length + 1}`,
        content: 'Add your content here...'
        // Colors will be applied by theme, not props
      },
      metadata: {}
    };

    const updatedDeck: ComponentBasedSlideDeck = {
      ...currentDeck,
      slides: [...currentDeck.slides, newSlide]
    };

    setEditableDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Delete slide
  const deleteSlide = (slideId: string) => {
    const currentDeck = editableDeck || componentDeck;
    if (!currentDeck || currentDeck.slides.length <= 1) return;

    const updatedDeck: ComponentBasedSlideDeck = {
      ...currentDeck,
      slides: currentDeck.slides.filter((slide: ComponentBasedSlide) => slide.slideId !== slideId)
    };

    setEditableDeck(updatedDeck);
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
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Slides Container */}
        <div className="slides-container">
          {(editableDeck || componentDeck)?.slides.map((slide: ComponentBasedSlide) => (
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
                  onTextChange={handleTextChange}
                  onAutoSave={handleAutoSave}
                  onSlideUpdate={isEditable ? handleSlideUpdate : undefined}
                  onTemplateChange={isEditable ? handleTemplateChange : undefined}
                  theme={(editableDeck || componentDeck)?.theme}
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

// CSS стилі для inline editing (копіюємо з інструкції)
const styles = `
  .editable-field {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .editable-field:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  .inline-editor-input,
  .inline-editor-textarea {
    width: 100%;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    padding: 8px;
    font-size: inherit;
    font-family: inherit;
    outline: none;
  }

  .inline-editor-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .control-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .edit-button {
    background-color: #3b82f6;
    color: white;
  }

  .edit-button:hover {
    background-color: #2563eb;
  }

  .save-button {
    background-color: #10b981;
    color: white;
  }

  .save-button:hover {
    background-color: #059669;
  }

  .add-button {
    background-color: #8b5cf6;
    color: white;
  }

  .add-button:hover {
    background-color: #7c3aed;
  }
`;

// Додаємо стилі до head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 