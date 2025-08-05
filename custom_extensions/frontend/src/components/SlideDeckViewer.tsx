import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock } from '@/types/pdfLesson';
import { Plus, ChevronDown } from 'lucide-react';

interface SlideDeckViewerProps {
  deck: SlideDeckData;
  isEditable?: boolean;
  onSave?: (updatedDeck: SlideDeckData) => void;
}

// Professional slide templates based on industry best practices
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
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Determine slide layout based on content
  const getSlideLayout = (slide: DeckSlide): string => {
    // Check if slide has a specific layout property (for future use)
    if ('layout' in slide && typeof slide.layout === 'string') {
      return `layout-${slide.layout}`;
    }
    
    // Auto-detect layout based on content
    const blocks = slide.contentBlocks;
    if (blocks.length === 0) return 'layout-content';
    
    // Title slide: only headlines
    if (blocks.every(block => block.type === 'headline')) {
      return 'layout-title';
    }
    
    // Four bullets layout
    if (blocks.length === 2 && blocks[0].type === 'headline' && blocks[1].type === 'bullet_list') {
      const bulletBlock = blocks[1] as BulletListBlock;
      if (bulletBlock.items.length === 4) {
        return 'layout-four-bullets';
      }
      if (bulletBlock.items.length === 6) {
        return 'layout-six-bullets';
      }
    }
    
    // Process steps
    if (blocks.length === 2 && blocks[0].type === 'headline' && blocks[1].type === 'numbered_list') {
      return 'layout-steps';
    }
    
    // Split/comparison layout
    if (blocks.length >= 5 && blocks[0].type === 'headline') {
      const hasMultipleH2s = blocks.filter(block => block.type === 'headline' && (block as HeadlineBlock).level === 2).length >= 2;
      if (hasMultipleH2s) {
        return slide.slideTitle.toLowerCase().includes('comparison') ? 'layout-comparison' : 'layout-split';
      }
    }
    
    // Quote layout: title + single paragraph that looks like a quote
    if (blocks.length === 2 && blocks[0].type === 'headline' && blocks[1].type === 'paragraph') {
      const paragraphText = (blocks[1] as ParagraphBlock).text;
      if (paragraphText.includes('"') || paragraphText.includes('quote') || paragraphText.includes('message')) {
        return 'layout-quote';
      }
    }
    
    // Agenda layout
    if (slide.slideTitle.toLowerCase().includes('agenda') || slide.slideTitle.toLowerCase().includes('outline')) {
      return 'layout-agenda';
    }
    
    // Summary layout
    if (slide.slideTitle.toLowerCase().includes('summary') || slide.slideTitle.toLowerCase().includes('takeaway') || slide.slideTitle.toLowerCase().includes('conclusion')) {
      return 'layout-summary';
    }
    
    return 'layout-content';
  };

  // Update local deck when prop changes
  useEffect(() => {
    setLocalDeck(deck);
  }, [deck]);

  // Render content block with proper type handling
  const renderContentBlock = (block: AnyContentBlock, slideId: string, blockIndex: number): React.ReactNode => {
    const isEditing = editingBlock?.slideId === slideId && editingBlock?.blockIndex === blockIndex;

    if (isEditing && isEditable) {
      return renderInlineEditor(block, slideId, blockIndex);
    }

    switch (block.type) {
      case 'headline':
        const headlineBlock = block as HeadlineBlock;
        const HeadingTag = `h${headlineBlock.level}` as keyof JSX.IntrinsicElements;
        return (
          <div 
            className={`professional-headline level-${headlineBlock.level}`}
            onClick={() => isEditable && setEditingBlock({ slideId, blockIndex })}
          >
            <span className="heading-icon">
              {headlineBlock.level === 1 ? '○' : headlineBlock.level === 2 ? '◐' : headlineBlock.level === 3 ? '◑' : '◒'}
            </span>
            {React.createElement(HeadingTag, { className: 'heading-text' }, headlineBlock.text)}
          </div>
        );

      case 'paragraph':
        const paragraphBlock = block as ParagraphBlock;
        return (
          <div 
            className="professional-paragraph"
            onClick={() => isEditable && setEditingBlock({ slideId, blockIndex })}
          >
            <span className="paragraph-icon">▫</span>
            <p className="paragraph-text">{paragraphBlock.text}</p>
          </div>
        );

      case 'bullet_list':
        const bulletBlock = block as BulletListBlock;
        return (
          <div 
            className="professional-bullet-list"
            onClick={() => isEditable && setEditingBlock({ slideId, blockIndex })}
          >
            <ul className="bullet-items">
              {bulletBlock.items.map((item, index) => (
                <li key={index} className="professional-bullet-item">
                  <span className="bullet-indicator">•</span>  {/* Changed from ▪ to • for better visibility */}
                  <span className="bullet-text">{typeof item === 'string' ? item : 'Complex item'}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'numbered_list':
        const numberedBlock = block as NumberedListBlock;
        return (
          <div 
            className="professional-numbered-list"
            onClick={() => isEditable && setEditingBlock({ slideId, blockIndex })}
          >
            <ol className="numbered-items">
              {numberedBlock.items.map((item, index) => (
                <li key={index} className="professional-numbered-item">
                  <span className="number-badge">{index + 1}</span>
                  <span className="number-text">{typeof item === 'string' ? item : 'Complex item'}</span>
                </li>
              ))}
            </ol>
          </div>
        );

      case 'alert':
        const alertBlock = block as AlertBlock;
        return (
          <div 
            className={`professional-alert alert-${alertBlock.alertType}`}
            onClick={() => isEditable && setEditingBlock({ slideId, blockIndex })}
          >
            <span className="alert-icon">
              {alertBlock.alertType === 'info' ? 'ⓘ' : 
               alertBlock.alertType === 'warning' ? '⚠' : 
               alertBlock.alertType === 'success' ? '✓' : '✕'}
            </span>
            <div className="alert-content">
              {alertBlock.title && <div className="alert-title">{alertBlock.title}</div>}
              <div className="alert-text">{alertBlock.text}</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="professional-unknown">
            <span className="unknown-icon">?</span>
            <span>Unknown block type</span>
          </div>
        );
    }
  };

  // Render inline editor
  const renderInlineEditor = (block: AnyContentBlock, slideId: string, blockIndex: number): React.ReactNode => {
    const handleSave = (newValue: string) => {
      const updatedDeck = { ...localDeck };
      const slide = updatedDeck.slides.find(s => s.slideId === slideId);
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
    <div className="slide-deck-viewer">
      {/* Professional Header */}
      <div className="professional-header">
        <div className="header-content">
          <div className="presentation-info">
            <h1 className="presentation-title">{localDeck.lessonTitle}</h1>
            <span className="slide-counter">{localDeck.slides.length} slides</span>
          </div>
          
          {isEditable && (
            <div className="header-controls">
              <button 
                className="control-button template-button"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <span className="button-icon">⊞</span>
                Templates
              </button>
            </div>
          )}
        </div>

        {/* Template Selector */}
        {showTemplates && isEditable && (
          <div className="template-selector">
            <div className="template-grid">
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  className="template-card"
                  onClick={() => applyTemplate(selectedSlideId, key as keyof typeof SLIDE_TEMPLATES)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <div className="template-name">{template.name}</div>
                  <div className="template-description">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Professional Sidebar */}
        <div className="professional-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Slides</h3>
          </div>
          
          <div className="slide-thumbnails">
            {localDeck.slides.map((slide) => (
              <div
                key={slide.slideId}
                className={`slide-thumbnail ${selectedSlideId === slide.slideId ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSlideId(slide.slideId);
                  // Scroll to the slide
                  const slideElement = document.getElementById(`slide-${slide.slideId}`);
                  if (slideElement) {
                    slideElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <div className="thumbnail-number">{slide.slideNumber}</div>
                <div className="thumbnail-preview">
                  <div className="preview-title">
                    {slide.contentBlocks.find(block => block.type === 'headline')
                      ? (slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock).text
                      : slide.slideTitle}
                  </div>
                  <div className="preview-content">
                    {slide.contentBlocks.slice(1, 3).map((block, index) => (
                      <div key={index} className="preview-block">
                        {block.type === 'paragraph' ? (block as ParagraphBlock).text.substring(0, 30) + '...' :
                         block.type === 'bullet_list' ? '• List items...' :
                         block.type === 'numbered_list' ? '1. Numbered items...' :
                         'Content...'}
                      </div>
                    ))}
                  </div>
                </div>
                
                {isEditable && localDeck.slides.length > 1 && (
                  <button
                    className="delete-slide-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.slideId);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slides Container */}
        <div className="slides-container">
          {localDeck.slides.map((slide) => (
            <div
              key={slide.slideId}
              className={`professional-slide ${selectedSlideId === slide.slideId ? 'active' : ''}`}
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
                    <h2 className="slide-title-text">{slide.slideTitle}</h2>
                  )}
                </div>
              ) : (
                <h2 className="slide-title-display">{slide.slideTitle}</h2>
              )}

              {/* Content Blocks */}
              <div className={`slide-content ${getSlideLayout(slide)}`}>
                {slide.contentBlocks.map((block, blockIndex) => (
                  <div key={blockIndex} className="content-block">
                    {renderContentBlock(block, slide.slideId, blockIndex)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar - Add Slide Controls */}
        {isEditable && (
          <div className="right-sidebar">
            <div className="tools-panel">
              <div className="tool-section">
                                 <button
                   className="tool-button add-slide-btn"
                   onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                   title="Add new slide"
                 >
                   <Plus size={20} />
                 </button>
                
                {showTemplateDropdown && (
                  <div className="template-dropdown">
                    <div className="dropdown-header">
                      <span>Choose template</span>
                      <button 
                        onClick={() => setShowTemplateDropdown(false)}
                        className="close-dropdown"
                      >
                        ×
                      </button>
                    </div>
                    <div className="template-list">
                      {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          className="template-option"
                          onClick={() => {
                            applyTemplate(selectedSlideId, key as keyof typeof SLIDE_TEMPLATES);
                            setShowTemplateDropdown(false);
                          }}
                        >
                          <span className="template-icon-small">{template.icon}</span>
                          <div className="template-info">
                            <div className="template-name-small">{template.name}</div>
                            <div className="template-desc-small">{template.description}</div>
                          </div>
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
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className="inline-editor-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={4}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className="inline-editor-input"
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}

export { SlideDeckViewer };