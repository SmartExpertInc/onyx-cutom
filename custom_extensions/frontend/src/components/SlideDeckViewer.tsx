import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock } from '@/types/pdfLesson';
import { PROFESSIONAL_TEMPLATES, TemplateKey } from './ProfessionalSlideTemplates';

interface SlideDeckViewerProps {
  deck: SlideDeckData;
  isEditable?: boolean;
  onSave?: (updatedDeck: SlideDeckData) => void;
}

// Professional slide templates metadata for template selector
const SLIDE_TEMPLATES = {
  title: {
    name: 'Title Slide',
    icon: '◯',
    description: 'Opening slide with title and subtitle',
    layout: 'title',
    blocks: [
      { type: 'headline', text: 'Presentation Title', level: 1 } as HeadlineBlock,
      { type: 'headline', text: 'Subtitle or Key Message', level: 2 } as HeadlineBlock
    ]
  },
  content: {
    name: 'Content',
    icon: '▫',
    description: 'Standard content with title and body text',
    layout: 'content',
    blocks: [
      { type: 'headline', text: 'Slide Title', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: 'Main content goes here. This is where you explain your key points in detail with comprehensive information.' } as ParagraphBlock
    ]
  },
  fourBullets: {
    name: '4 Key Points',
    icon: '▪',
    description: 'Title with exactly 4 bullet points in grid layout',
    layout: 'four-bullets',
    blocks: [
      { type: 'headline', text: 'Four Key Points', level: 1 } as HeadlineBlock,
      { type: 'bullet_list', items: ['First key point', 'Second key point', 'Third key point', 'Fourth key point'] } as BulletListBlock
    ]
  },
  sixBullets: {
    name: '6 Key Points',
    icon: '▫',
    description: 'Title with 6 bullet points in two-column layout',
    layout: 'six-bullets',
    blocks: [
      { type: 'headline', text: 'Six Key Points', level: 1 } as HeadlineBlock,
      { type: 'bullet_list', items: ['First point', 'Second point', 'Third point', 'Fourth point', 'Fifth point', 'Sixth point'] } as BulletListBlock
    ]
  },
  steps: {
    name: 'Process Steps',
    icon: '◐',
    description: 'Title with numbered process steps',
    layout: 'steps',
    blocks: [
      { type: 'headline', text: 'Process Steps', level: 1 } as HeadlineBlock,
      { type: 'numbered_list', items: ['First step', 'Second step', 'Third step', 'Fourth step'] } as NumberedListBlock
    ]
  },
  split: {
    name: 'Two Column',
    icon: '◑',
    description: 'Split layout with two equal content areas',
    layout: 'split',
    blocks: [
      { type: 'headline', text: 'Two Column Layout', level: 1 } as HeadlineBlock,
      { type: 'headline', text: 'Left Column', level: 2 } as HeadlineBlock,
      { type: 'paragraph', text: 'Left column content and information goes here.' } as ParagraphBlock,
      { type: 'headline', text: 'Right Column', level: 2 } as HeadlineBlock,
      { type: 'paragraph', text: 'Right column content and information goes here.' } as ParagraphBlock
    ]
  },
  comparison: {
    name: 'Comparison',
    icon: '◒',
    description: 'Before/after or comparison layout',
    layout: 'comparison',
    blocks: [
      { type: 'headline', text: 'Comparison Analysis', level: 1 } as HeadlineBlock,
      { type: 'headline', text: 'Before', level: 2 } as HeadlineBlock,
      { type: 'paragraph', text: 'Current situation or old approach' } as ParagraphBlock,
      { type: 'headline', text: 'After', level: 2 } as HeadlineBlock,
      { type: 'paragraph', text: 'Improved situation or new approach' } as ParagraphBlock
    ]
  },
  quote: {
    name: 'Quote/Highlight',
    icon: '◓',
    description: 'Prominent quote or key message highlight',
    layout: 'quote',
    blocks: [
      { type: 'headline', text: 'Key Quote or Message', level: 1 } as HeadlineBlock,
      { type: 'paragraph', text: '"This is an important quote or key message that needs to be highlighted prominently on the slide."' } as ParagraphBlock
    ]
  },
  agenda: {
    name: 'Agenda',
    icon: '◔',
    description: 'Meeting or presentation agenda layout',
    layout: 'agenda',
    blocks: [
      { type: 'headline', text: 'Agenda', level: 1 } as HeadlineBlock,
      { type: 'numbered_list', items: ['Welcome & Introductions', 'Main Presentation', 'Q&A Session', 'Next Steps'] } as NumberedListBlock
    ]
  },
  summary: {
    name: 'Summary',
    icon: '◕',
    description: 'Key takeaways and summary points',
    layout: 'summary',
    blocks: [
      { type: 'headline', text: 'Key Takeaways', level: 1 } as HeadlineBlock,
      { type: 'bullet_list', items: ['First key takeaway', 'Second key takeaway', 'Third key takeaway'] } as BulletListBlock,
      { type: 'paragraph', text: 'Thank you for your attention. Questions?' } as ParagraphBlock
    ]
  }
};

export default function SlideDeckViewer({ deck, isEditable = false, onSave }: SlideDeckViewerProps) {
  const [localDeck, setLocalDeck] = useState<SlideDeckData>(deck);
  const [selectedSlideId, setSelectedSlideId] = useState<string>(deck.slides[0]?.slideId || '');
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{ slideId: string; blockIndex: number } | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  // Automatic template detection based on content
  const detectSlideTemplate = (slide: DeckSlide): TemplateKey => {
    // If slide already has a layout specified, use it
    if (slide.layout && slide.layout in PROFESSIONAL_TEMPLATES) {
      return slide.layout as TemplateKey;
    }
    
    // Auto-detect layout based on content
    const blocks = slide.contentBlocks;
    if (blocks.length === 0) return 'content';
    
    // Title slide: only headlines
    if (blocks.every(block => block.type === 'headline')) {
      return 'title';
    }
    
    // Check for specific keywords in slide title
    const titleLower = slide.slideTitle.toLowerCase();
    if (titleLower.includes('agenda') || titleLower.includes('outline') || titleLower.includes('overview')) {
      return 'agenda';
    }
    if (titleLower.includes('summary') || titleLower.includes('takeaway') || titleLower.includes('conclusion')) {
      return 'summary';
    }
    if (titleLower.includes('comparison') || titleLower.includes('versus') || titleLower.includes('vs') || titleLower.includes('before')) {
      return 'comparison';
    }
    if (titleLower.includes('quote') || titleLower.includes('key message') || titleLower.includes('important')) {
      return 'quote';
    }
    if (titleLower.includes('steps') || titleLower.includes('process') || titleLower.includes('procedure')) {
      return 'steps';
    }
    
    // Four bullets layout
    if (blocks.length === 2 && blocks[0].type === 'headline' && blocks[1].type === 'bullet_list') {
      const bulletBlock = blocks[1] as BulletListBlock;
      if (bulletBlock.items.length === 4) {
        return 'four-bullets';
      }
      if (bulletBlock.items.length === 6) {
        return 'six-bullets';
      }
    }
    
    // Process steps
    if (blocks.length === 2 && blocks[0].type === 'headline' && blocks[1].type === 'numbered_list') {
      const numberedBlock = blocks[1] as NumberedListBlock;
      if (numberedBlock.items.length >= 4) {
        return 'steps';
      }
    }
    
    // Split/comparison layout
    if (blocks.length >= 5 && blocks[0].type === 'headline') {
      const hasMultipleH2s = blocks.filter(block => block.type === 'headline' && (block as HeadlineBlock).level === 2).length >= 2;
      if (hasMultipleH2s) {
        return 'split';
      }
    }
    
    // Quote layout: title + single paragraph that looks like a quote
    if (blocks.length === 2 && blocks[0].type === 'headline' && blocks[1].type === 'paragraph') {
      const paragraphText = (blocks[1] as ParagraphBlock).text;
      if (paragraphText.includes('"') || paragraphText.includes('quote') || paragraphText.includes('message')) {
        return 'quote';
      }
    }
    
    return 'content';
  };

  // Update local deck when prop changes
  useEffect(() => {
    setLocalDeck(deck);
  }, [deck]);

  // Render inline editor
  const renderInlineEditor = (block: AnyContentBlock, blockIndex: number): React.ReactNode => {
    const handleSave = (newValue: string) => {
      const updatedDeck = { ...localDeck };
      const slide = updatedDeck.slides.find(s => s.slideId === editingBlock?.slideId);
      if (slide) {
        const updatedBlock = { ...block };
        
        // Update based on block type
        switch (block.type) {
          case 'headline':
            (updatedBlock as HeadlineBlock).text = newValue;
            break;
          case 'paragraph':
            (updatedBlock as ParagraphBlock).text = newValue;
            break;
          case 'alert':
            (updatedBlock as AlertBlock).text = newValue;
            break;
          case 'bullet_list':
            (updatedBlock as BulletListBlock).items = newValue.split('\n').filter(item => item.trim());
            break;
          case 'numbered_list':
            (updatedBlock as NumberedListBlock).items = newValue.split('\n').filter(item => item.trim());
            break;
        }
        
        slide.contentBlocks[blockIndex] = updatedBlock;
        setLocalDeck(updatedDeck);
        onSave?.(updatedDeck);
      }
      setEditingBlock(null);
    };

    const handleCancel = () => {
      setEditingBlock(null);
    };

    const getCurrentValue = (): string => {
      switch (block.type) {
        case 'headline':
          return (block as HeadlineBlock).text;
        case 'paragraph':
          return (block as ParagraphBlock).text;
        case 'alert':
          return (block as AlertBlock).text;
        case 'bullet_list':
          return (block as BulletListBlock).items
            .map(item => typeof item === 'string' ? item : 'Complex item')
            .join('\n');
        case 'numbered_list':
          return (block as NumberedListBlock).items
            .map(item => typeof item === 'string' ? item : 'Complex item')
            .join('\n');
        default:
          return '';
      }
    };

    return (
      <InlineEditor
        initialValue={getCurrentValue()}
        onSave={handleSave}
        onCancel={handleCancel}
        multiline={block.type === 'bullet_list' || block.type === 'numbered_list'}
      />
    );
  };

  // Apply template to slide
  const applyTemplate = (slideId: string, templateKey: keyof typeof SLIDE_TEMPLATES) => {
    const template = SLIDE_TEMPLATES[templateKey];
    const updatedDeck = { ...localDeck };
    const slide = updatedDeck.slides.find(s => s.slideId === slideId);
    
    if (slide) {
      slide.contentBlocks = [...template.blocks];
      slide.layout = template.layout;
      setLocalDeck(updatedDeck);
      onSave?.(updatedDeck);
    }
    setShowTemplates(false);
  };

  // Add new slide
  const addSlide = () => {
    const newSlide: DeckSlide = {
      slideId: `slide-${Date.now()}`,
      slideNumber: localDeck.slides.length + 1,
      slideTitle: `Slide ${localDeck.slides.length + 1}`,
      layout: 'content',
      contentBlocks: [
        { type: 'headline', text: 'New Slide Title', level: 1 } as HeadlineBlock,
        { type: 'paragraph', text: 'Add your content here...' } as ParagraphBlock
      ]
    };

    const updatedDeck = {
      ...localDeck,
      slides: [...localDeck.slides, newSlide]
    };

    setLocalDeck(updatedDeck);
    setSelectedSlideId(newSlide.slideId);
    onSave?.(updatedDeck);
  };

  // Delete slide
  const deleteSlide = (slideId: string) => {
    if (localDeck.slides.length <= 1) return;

    const updatedDeck = {
      ...localDeck,
      slides: localDeck.slides.filter(s => s.slideId !== slideId)
    };

    // Update slide numbers
    updatedDeck.slides.forEach((slide, index) => {
      slide.slideNumber = index + 1;
    });

    setLocalDeck(updatedDeck);
    
    // Select next slide or previous if last was deleted
    const deletedIndex = localDeck.slides.findIndex(s => s.slideId === slideId);
    const nextSlide = updatedDeck.slides[deletedIndex] || updatedDeck.slides[deletedIndex - 1];
    setSelectedSlideId(nextSlide?.slideId || '');
    
    onSave?.(updatedDeck);
  };

  return (
    <div className="slide-deck-viewer" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Professional Header */}
      <div style={{
        backgroundColor: '#1e3a8a',
        color: 'white',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {isEditable && editingTitle === 'main' ? (
              <InlineEditor
                initialValue={localDeck.lessonTitle}
                onSave={(newTitle) => {
                  const updatedDeck = { ...localDeck, lessonTitle: newTitle };
                  setLocalDeck(updatedDeck);
                  onSave?.(updatedDeck);
                  setEditingTitle(null);
                }}
                onCancel={() => setEditingTitle(null)}
              />
            ) : (
              <h1 
                style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', cursor: isEditable ? 'pointer' : 'default' }}
                onClick={() => isEditable && setEditingTitle('main')}
              >
                {localDeck.lessonTitle}
              </h1>
            )}
            <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              {localDeck.slides.length} slides • Professional Templates
            </span>
          </div>
          
          {isEditable && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                <span>⊞</span>
                Templates
              </button>
              <button 
                onClick={addSlide}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#047857';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
              >
                <span>+</span>
                Add Slide
              </button>
            </div>
          )}
        </div>

        {/* Template Selector */}
        {showTemplates && isEditable && (
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '6px',
            color: '#374151'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold' }}>
              Choose Template
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem'
            }}>
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(selectedSlideId, key as keyof typeof SLIDE_TEMPLATES)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    {template.icon}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.125rem' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slides Container - Stacked Vertically */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        {localDeck.slides.map((slide, slideIndex) => {
          const templateKey = detectSlideTemplate(slide);
          const TemplateComponent = PROFESSIONAL_TEMPLATES[templateKey];
          
          return (
            <div key={slide.slideId} style={{ position: 'relative' }}>
              {/* Slide Number Badge */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '20px',
                backgroundColor: '#1e3a8a',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                zIndex: 5
              }}>
                {slide.slideNumber}
              </div>

              {/* Editable Slide Title */}
              <div style={{
                backgroundColor: 'white',
                padding: '1rem 1.5rem 0.5rem',
                borderRadius: '8px 8px 0 0',
                borderBottom: '2px solid #e5e7eb'
              }}>
                {isEditable && editingTitle === slide.slideId ? (
                  <InlineEditor
                    initialValue={slide.slideTitle}
                    onSave={(newTitle) => {
                      const updatedDeck = { ...localDeck };
                      const targetSlide = updatedDeck.slides.find(s => s.slideId === slide.slideId);
                      if (targetSlide) {
                        targetSlide.slideTitle = newTitle;
                        setLocalDeck(updatedDeck);
                        onSave?.(updatedDeck);
                      }
                      setEditingTitle(null);
                    }}
                    onCancel={() => setEditingTitle(null)}
                  />
                ) : (
                  <h2 
                    style={{ 
                      margin: 0, 
                      fontSize: '1.125rem', 
                      fontWeight: 'bold', 
                      color: '#1f2937',
                      cursor: isEditable ? 'pointer' : 'default'
                    }}
                    onClick={() => isEditable && setEditingTitle(slide.slideId)}
                  >
                    {slide.slideTitle}
                  </h2>
                )}
              </div>

              {/* Slide Content */}
              <div style={{ position: 'relative' }}>
                <TemplateComponent
                  slide={slide}
                  isEditable={isEditable}
                  onBlockClick={(blockIndex) => {
                    if (isEditable) {
                      setEditingBlock({ slideId: slide.slideId, blockIndex });
                    }
                  }}
                  editingBlock={editingBlock?.slideId === slide.slideId ? editingBlock.blockIndex : null}
                  renderInlineEditor={renderInlineEditor}
                />

                {/* Delete Button */}
                {isEditable && localDeck.slides.length > 1 && (
                  <button
                    onClick={() => deleteSlide(slide.slideId)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 5
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  const commonProps = {
    ref: inputRef as any,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    style: {
      width: '100%',
      padding: '0.375rem',
      border: '2px solid #3b82f6',
      borderRadius: '4px',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      backgroundColor: 'white',
      outline: 'none'
    }
  };

  return multiline ? (
    <textarea {...commonProps} rows={3} />
  ) : (
    <input {...commonProps} type="text" />
  );
}

export { SlideDeckViewer };