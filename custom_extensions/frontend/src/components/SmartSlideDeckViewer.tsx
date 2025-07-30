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
  
  /** Project ID for direct server saving */
  projectId?: string;
}

export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave,
  showFormatInfo = false,
  theme,
  projectId
}) => {
  const [componentDeck, setComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [editableDeck, setEditableDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inline editing state (копіюємо з page.tsx)
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the current theme
  const currentTheme = getSlideTheme(theme || deck?.theme || DEFAULT_SLIDE_THEME);

  // Функція зміни тексту (копіюємо з page.tsx)
  const handleTextChange = useCallback((slideId: string, fieldPath: string, newValue: any) => {
    console.log('handleTextChange called with:', { slideId, fieldPath, newValue });

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
      console.log('handleTextChange: Updated slide title:', newDeck.slides[slideIndex].props[fieldPath]);
      return newDeck;
    });

    // Автозбереження (копіюємо з page.tsx)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Зберігаємо значення для використання в timeout
    const saveValue = newValue;
    const saveSlideId = slideId;
    const saveFieldPath = fieldPath;
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('Auto-save timeout triggered for slide:', saveSlideId, 'field:', saveFieldPath, 'value:', saveValue);
      // Використовуємо функцію, яка отримає поточний стан
      setEditableDeck(currentDeck => {
        if (currentDeck) {
          // Оновлюємо title в поточному стані перед збереженням
          const updatedDeck = JSON.parse(JSON.stringify(currentDeck));
          const slideIndex = updatedDeck.slides.findIndex((slide: ComponentBasedSlide) => slide.slideId === saveSlideId);
          if (slideIndex !== -1) {
            updatedDeck.slides[slideIndex].props[saveFieldPath] = saveValue;
            updatedDeck.slides[slideIndex].metadata = {
              ...updatedDeck.slides[slideIndex].metadata,
              updatedAt: new Date().toISOString()
            };
            console.log('Auto-save: Updated deck before saving:', {
              slideId: saveSlideId,
              fieldPath: saveFieldPath,
              newValue: saveValue,
              updatedTitle: updatedDeck.slides[slideIndex].props[saveFieldPath]
            });
            handleAutoSaveWithDeck(updatedDeck);
          } else {
            handleAutoSaveWithDeck(currentDeck);
          }
        }
        return currentDeck;
      });
    }, 2000);
  }, []); // Прибрали залежність від editableDeck

  // Автозбереження з переданим deck (для використання в timeout)
  const handleAutoSaveWithDeck = async (deckToSave: ComponentBasedSlideDeck) => {
    console.log('Auto-save triggered with deck');
    if (!deckToSave) {
      console.log('Auto-save: Missing deckToSave');
      return;
    }
    
    console.log('Auto-save: Current deck state:', {
      slideCount: deckToSave.slides?.length,
      firstSlideTitle: deckToSave.slides?.[0]?.props?.title,
      slide4Title: deckToSave.slides?.[3]?.props?.title, // slide_4_communication
      slide4Content: deckToSave.slides?.[3]?.props?.content?.substring(0, 50) + '...'
    });
    
    // Якщо є projectId, зберігаємо безпосередньо на сервер
    if (projectId) {
      try {
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        const saveOperationHeaders: HeadersInit = { 'Content-Type': 'application/json' };
        const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") || "dummy-onyx-user-id-for-testing" : "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === 'development') {
          saveOperationHeaders['X-Dev-Onyx-User-ID'] = devUserId;
        }

        const payload = { microProductContent: deckToSave };
        console.log('Auto-save: Payload being sent:', JSON.stringify(payload, null, 2));
        console.log('Auto-save: Sending request to', `${CUSTOM_BACKEND_URL}/projects/update/${projectId}`);
        
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
          method: 'PUT', 
          headers: saveOperationHeaders, 
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          console.warn('Auto-save failed:', response.status);
          const errorText = await response.text();
          console.warn('Auto-save error details:', errorText);
        } else {
          console.log('Auto-save successful');
          const responseData = await response.json();
          console.log('Auto-save response data:', JSON.stringify(responseData, null, 2));
        }
      } catch (err: any) {
        console.warn('Auto-save error:', err.message);
      }
    } else {
      // Якщо немає projectId, використовуємо onSave callback
      try {
        console.log('Auto-save: Sending data to onSave callback');
        onSave?.(deckToSave);
      } catch (err: any) {
        console.warn('Auto-save error:', err.message);
      }
    }
  };

  // Автозбереження (копіюємо з page.tsx) - для використання в cleanup
  const handleAutoSave = async () => {
    if (!editableDeck) {
      console.log('Auto-save: Missing editableDeck');
      return;
    }
    await handleAutoSaveWithDeck(editableDeck);
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
        
        // Синхронізуємо editableDeck з новим deck
        setEditableDeck(deckWithTheme as ComponentBasedSlideDeck);
        
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
  }, [deck, theme]);

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