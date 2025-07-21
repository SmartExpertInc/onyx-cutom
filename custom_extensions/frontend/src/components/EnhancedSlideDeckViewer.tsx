// custom_extensions/frontend/src/components/EnhancedSlideDeckViewer.tsx

import React, { useState, useEffect } from 'react';
import { SlideDeckData } from '@/types/pdfLesson';
import { ComponentBasedSlideDeck, ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideDeckRenderer } from './ComponentBasedSlideRenderer';
import { migrateLegacySlideDeck, createNewComponentSlide } from '@/utils/slideMigration';
import { getAllTemplates, getTemplatesByCategory } from './templates/registry';

interface EnhancedSlideDeckViewerProps {
  // Can accept either legacy or new format
  deck?: SlideDeckData;
  componentDeck?: ComponentBasedSlideDeck;
  isEditable?: boolean;
  onSave?: (updatedDeck: ComponentBasedSlideDeck) => void;
  onLegacySave?: (updatedDeck: SlideDeckData) => void;
}

export const EnhancedSlideDeckViewer: React.FC<EnhancedSlideDeckViewerProps> = ({
  deck,
  componentDeck,
  isEditable = false,
  onSave,
  onLegacySave
}) => {
  const [localComponentDeck, setLocalComponentDeck] = useState<ComponentBasedSlideDeck | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'none' | 'available' | 'migrating' | 'completed'>('none');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');

  // Initialize component deck (either from prop or by migrating legacy deck)
  useEffect(() => {
    if (componentDeck) {
      setLocalComponentDeck(componentDeck);
      setSelectedSlideId(componentDeck.currentSlideId || componentDeck.slides[0]?.slideId || '');
      setMigrationStatus('completed');
    } else if (deck) {
      setMigrationStatus('available');
      setSelectedSlideId(deck.currentSlideId || deck.slides[0]?.slideId || '');
    }
  }, [deck, componentDeck]);

  // Migrate legacy deck
  const handleMigrateDeck = async () => {
    if (!deck) return;

    setMigrationStatus('migrating');
    
    try {
      const migrationResult = migrateLegacySlideDeck(deck);
      
      if (migrationResult.success && migrationResult.deck) {
        setLocalComponentDeck(migrationResult.deck);
        setMigrationStatus('completed');
        
        // Show migration results to user
        const warnings = migrationResult.results.flatMap(r => r.warnings || []);
        const errors = migrationResult.results.flatMap(r => r.errors || []);
        
        if (warnings.length > 0) {
          console.warn('Migration warnings:', warnings);
        }
        if (errors.length > 0) {
          console.error('Migration errors:', errors);
        }
        
        // Auto-save if callback provided
        if (onSave) {
          onSave(migrationResult.deck);
        }
      } else {
        console.error('Migration failed');
        setMigrationStatus('available');
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('available');
    }
  };

  // Handle slide updates
  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    if (!localComponentDeck) return;

    const updatedDeck = {
      ...localComponentDeck,
      slides: localComponentDeck.slides.map(slide => 
        slide.slideId === updatedSlide.slideId ? updatedSlide : slide
      )
    };

    setLocalComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Handle template changes
  const handleTemplateChange = (slideId: string, newTemplateId: string) => {
    if (!localComponentDeck) return;

    const slideIndex = localComponentDeck.slides.findIndex(s => s.slideId === slideId);
    if (slideIndex === -1) return;

    const oldSlide = localComponentDeck.slides[slideIndex];
    const newSlide = createNewComponentSlide(newTemplateId, oldSlide.slideNumber);
    
    // Preserve slide ID and number
    newSlide.slideId = oldSlide.slideId;
    newSlide.slideNumber = oldSlide.slideNumber;

    const updatedDeck = {
      ...localComponentDeck,
      slides: localComponentDeck.slides.map(slide => 
        slide.slideId === slideId ? newSlide : slide
      )
    };

    setLocalComponentDeck(updatedDeck);
    onSave?.(updatedDeck);
  };

  // Add new slide
  const handleAddSlide = (templateId: string) => {
    if (!localComponentDeck) return;

    const newSlide = createNewComponentSlide(templateId, localComponentDeck.slides.length + 1);
    const updatedDeck = {
      ...localComponentDeck,
      slides: [...localComponentDeck.slides, newSlide]
    };

    setLocalComponentDeck(updatedDeck);
    setSelectedSlideId(newSlide.slideId);
    onSave?.(updatedDeck);
    setShowTemplates(false);
  };

  // Delete slide
  const handleDeleteSlide = (slideId: string) => {
    if (!localComponentDeck || localComponentDeck.slides.length <= 1) return;

    const updatedSlides = localComponentDeck.slides
      .filter(s => s.slideId !== slideId)
      .map((slide, index) => ({ ...slide, slideNumber: index + 1 }));

    const deletedIndex = localComponentDeck.slides.findIndex(s => s.slideId === slideId);
    const nextSlide = updatedSlides[deletedIndex] || updatedSlides[deletedIndex - 1];

    const updatedDeck = {
      ...localComponentDeck,
      slides: updatedSlides
    };

    setLocalComponentDeck(updatedDeck);
    setSelectedSlideId(nextSlide?.slideId || '');
    onSave?.(updatedDeck);
  };

  // Get available templates
  const availableTemplates = selectedTemplateCategory === 'all' 
    ? getAllTemplates() 
    : getTemplatesByCategory(selectedTemplateCategory);

  // Render migration prompt if legacy deck needs migration
  if ((migrationStatus === 'available' || migrationStatus === 'migrating') && !localComponentDeck) {
    const isLoading = migrationStatus === 'migrating';
    
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
          🚀 Upgrade Available
        </div>
        <div style={{ fontSize: '16px', color: '#6c757d', marginBottom: '24px' }}>
          This presentation is using the legacy format. Migrate to the new component-based system
          for better editing, more templates, and enhanced features.
        </div>
        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '24px' }}>
          Current: {deck?.slides.length} slides with content blocks<br/>
          After migration: Component-based templates with full customization
        </div>
        <button
          onClick={handleMigrateDeck}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Migrating...' : 'Migrate Now'}
        </button>
      </div>
    );
  }

  // Render component-based deck
  if (localComponentDeck) {
    return (
      <div className="enhanced-slide-deck-viewer">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
              {localComponentDeck.lessonTitle}
            </h1>
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
              {localComponentDeck.slides.length} slides • Component-based v{localComponentDeck.templateVersion}
            </div>
          </div>
          
          {isEditable && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: showTemplates ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showTemplates ? 'Hide Templates' : 'Add Slide'}
              </button>
            </div>
          )}
        </div>

        {/* Template Selector */}
        {showTemplates && isEditable && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Choose a Template</h3>
              <select
                value={selectedTemplateCategory}
                onChange={(e) => setSelectedTemplateCategory(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #dee2e6' }}
              >
                <option value="all">All Templates</option>
                <option value="title">Title</option>
                <option value="content">Content</option>
                <option value="media">Media</option>
                <option value="layout">Layout</option>
                <option value="special">Special</option>
              </select>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {availableTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleAddSlide(template.id)}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#007bff';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,123,255,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{template.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {template.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide Navigation */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Sidebar */}
          <div style={{
            width: '200px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>Slides</h4>
            {localComponentDeck.slides.map((slide) => (
              <div
                key={slide.slideId}
                onClick={() => setSelectedSlideId(slide.slideId)}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: selectedSlideId === slide.slideId ? '#007bff' : 'white',
                  color: selectedSlideId === slide.slideId ? 'white' : '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Slide {slide.slideNumber}</div>
                  <div style={{ opacity: 0.8 }}>{slide.templateId}</div>
                </div>
                {isEditable && localComponentDeck.slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlide(slide.slideId);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '16px',
                      opacity: 0.6
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <ComponentBasedSlideDeckRenderer
              slides={localComponentDeck.slides}
              selectedSlideId={selectedSlideId}
              isEditable={isEditable}
              onSlideUpdate={handleSlideUpdate}
              onTemplateChange={handleTemplateChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div>Loading slide deck...</div>
    </div>
  );
};

export default EnhancedSlideDeckViewer; 