// components/SmartSlideDeckViewer.tsx
// Smart viewer that handles both legacy and component-based slides

import React, { useState, useEffect, useMemo } from 'react';
import { SlideDeckData } from '@/types/pdfLesson';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { detectSlideDeckFormat, adaptLegacySlideDeck } from '@/utils/legacySlideAdapter';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { SlideDeckViewer } from './SlideDeckViewer';

interface SmartSlideDeckViewerProps {
  /** The slide deck data - can be legacy or component-based format */
  deck: SlideDeckData | ComponentBasedSlideDeck | any;
  
  /** Whether the deck is editable */
  isEditable?: boolean;
  
  /** Save callback for changes */
  onSave?: (updatedDeck: SlideDeckData | ComponentBasedSlideDeck) => void;
  
  /** Force a specific rendering mode */
  forceMode?: 'auto' | 'legacy' | 'component';
  
  /** Show format detection info */
  showFormatInfo?: boolean;
}

export const SmartSlideDeckViewer: React.FC<SmartSlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave,
  forceMode = 'auto',
  showFormatInfo = false
}) => {
  const [adaptedDeck, setAdaptedDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect deck format
  const deckFormat = useMemo(() => {
    if (forceMode !== 'auto') {
      return forceMode;
    }
    return detectSlideDeckFormat(deck);
  }, [deck, forceMode]);

  // Process deck based on format
  useEffect(() => {
    const processDeck = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (deckFormat === 'component') {
          // Already in component format
          setAdaptedDeck(deck as ComponentBasedSlideDeck);
        } else if (deckFormat === 'legacy') {
          // Convert legacy format to component format
          console.log('🔄 Converting legacy slides to component-based format...');
          const converted = adaptLegacySlideDeck(deck as SlideDeckData);
          setAdaptedDeck(converted);
          console.log('✅ Legacy slides converted successfully:', {
            originalSlides: (deck as SlideDeckData).slides?.length || 0,
            convertedSlides: converted.slides.length,
            templates: converted.slides.map(s => s.templateId)
          });
        } else {
          // Unknown format or error
          setError(`Unknown slide deck format detected. Cannot render slides.`);
        }
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
  }, [deck, deckFormat]);

  // Handle save for component-based decks
  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    if (adaptedDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...adaptedDeck,
        slides: adaptedDeck.slides.map(slide => 
          slide.slideId === updatedSlide.slideId ? updatedSlide : slide
        )
      };
      setAdaptedDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
  };

  const handleTemplateChange = (slideId: string, newTemplateId: string) => {
    if (adaptedDeck) {
      const updatedDeck: ComponentBasedSlideDeck = {
        ...adaptedDeck,
        slides: adaptedDeck.slides.map(slide => 
          slide.slideId === slideId 
            ? { ...slide, templateId: newTemplateId }
            : slide
        )
      };
      setAdaptedDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
  };

  // Handle save for legacy decks (fallback)
  const handleLegacySave = (updatedDeck: SlideDeckData) => {
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
           <div style={{ marginBottom: '12px' }}>🔄 Processing slide deck...</div>
           {forceMode !== 'auto' && (
             <div style={{ fontSize: '14px', color: '#9ca3af' }}>
               Format: {deckFormat}
             </div>
           )}
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
                         Debug Info:
             Detected Format: {deckFormat}
             Has Slides: {deck?.slides ? 'Yes' : 'No'}
             Slide Count: {deck?.slides?.length || 0}
          </div>
        )}
      </div>
    );
  }

  // Success: Render appropriate viewer
  return (
    <div>
      {/* Format Info (if enabled) */}
      {showFormatInfo && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#0369a1'
        }}>
          <strong>📊 Slide Deck Info:</strong> {deckFormat} format • {adaptedDeck?.slides.length || 0} slides
          {deckFormat === 'legacy' && ' • Automatically converted to component-based'}
        </div>
      )}

      {/* Component-based rendering (preferred) */}
      {deckFormat === 'component' || (deckFormat === 'legacy' && adaptedDeck) ? (
        adaptedDeck && adaptedDeck.slides && adaptedDeck.slides.length > 0 ? (
          <ComponentBasedSlideDeckRenderer
            slides={adaptedDeck.slides}
            selectedSlideId={adaptedDeck.currentSlideId || undefined}
            isEditable={isEditable}
            onSlideUpdate={isEditable ? handleSlideUpdate : undefined}
            onTemplateChange={isEditable ? handleTemplateChange : undefined}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No slides available in this presentation
          </div>
        )
      ) : deckFormat === 'legacy' ? (
        /* Legacy fallback (should rarely be used now) */
        <SlideDeckViewer
          deck={deck as SlideDeckData}
          isEditable={isEditable}
          onSave={isEditable ? handleLegacySave : undefined}
        />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          No slides to display
        </div>
      )}
    </div>
  );
};

export default SmartSlideDeckViewer; 