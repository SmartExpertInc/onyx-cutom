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

  // Get current slide
  const currentSlide = localDeck.slides.find(slide => slide.slideId === selectedSlideId);
  if (!currentSlide) return null;

  // Get template component
  const templateKey = detectSlideTemplate(currentSlide);
  const TemplateComponent = PROFESSIONAL_TEMPLATES[templateKey];

  return (
    <div className="slide-deck-viewer" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Professional Header */}
      <div style={{
        backgroundColor: '#1e3a8a',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>
              {localDeck.lessonTitle}
            </h1>
            <span style={{ fontSize: '1rem', opacity: 0.8 }}>
              {localDeck.slides.length} slides • Professional Templates
            </span>
          </div>
          
          {isEditable && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
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
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
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
            marginTop: '2rem',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#374151'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Choose Template
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(selectedSlideId, key as keyof typeof SLIDE_TEMPLATES)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem',
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
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {template.icon}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', minHeight: '600px' }}>
        {/* Professional Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
            Slides
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {localDeck.slides.map((slide) => (
              <div
                key={slide.slideId}
                onClick={() => setSelectedSlideId(slide.slideId)}
                style={{
                  backgroundColor: selectedSlideId === slide.slideId ? '#3b82f6' : 'white',
                  color: selectedSlideId === slide.slideId ? 'white' : '#374151',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedSlideId === slide.slideId ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedSlideId !== slide.slideId) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSlideId !== slide.slideId) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    backgroundColor: selectedSlideId === slide.slideId ? 'rgba(255,255,255,0.2)' : '#3b82f6',
                    color: selectedSlideId === slide.slideId ? 'white' : 'white',
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {slide.slideNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.2' }}>
                      {slide.slideTitle}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.7,
                      marginTop: '0.25rem'
                    }}>
                      {detectSlideTemplate(slide).charAt(0).toUpperCase() + detectSlideTemplate(slide).slice(1)} Template
                    </div>
                  </div>
                  {isEditable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(slide.slideId);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: selectedSlideId === slide.slideId ? 'white' : '#dc2626',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Slide Content */}
        <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc' }}>
          <TemplateComponent
            slide={currentSlide}
            isEditable={isEditable}
            onBlockClick={(blockIndex) => {
              if (isEditable) {
                setEditingBlock({ slideId: currentSlide.slideId, blockIndex });
              }
            }}
            editingBlock={editingBlock?.slideId === currentSlide.slideId ? editingBlock.blockIndex : null}
            renderInlineEditor={renderInlineEditor}
          />
        </div>
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
      padding: '0.5rem',
      border: '2px solid #3b82f6',
      borderRadius: '4px',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      backgroundColor: 'white',
      outline: 'none'
    }
  };

  return multiline ? (
    <textarea {...commonProps} rows={4} />
  ) : (
    <input {...commonProps} type="text" />
  );
}
export { SlideDeckViewer };