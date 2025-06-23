import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';

interface SlideDeckViewerProps {
  deck: SlideDeckData;
  isEditable?: boolean;
  onSave?: (updatedDeck: SlideDeckData) => void;
}

// Professional slide templates with modern layouts
const SLIDE_TEMPLATES = {
  content: {
    name: 'Content',
    icon: '📄',
    description: 'Standard content with title and body',
    blocks: [
      { type: 'headline', text: 'Your Title Here', level: 1 },
      { type: 'paragraph', text: 'Add your content here. Click to edit and start writing your presentation content.' }
    ]
  },
  split: {
    name: 'Split',
    icon: '⚡',
    description: 'Two-column layout for comparisons',
    blocks: [
      { type: 'headline', text: 'Split Layout', level: 1 },
      { type: 'paragraph', text: 'Left column content goes here.' },
      { type: 'paragraph', text: 'Right column content goes here.' }
    ]
  },
  title: {
    name: 'Title',
    icon: '🎯',
    description: 'Title slide for presentations',
    blocks: [
      { type: 'headline', text: 'Presentation Title', level: 1 },
      { type: 'headline', text: 'Subtitle or description', level: 2 },
      { type: 'paragraph', text: 'Present by: Your Name' }
    ]
  },
  chart: {
    name: 'Chart',
    icon: '📊',
    description: 'Data visualization layout',
    blocks: [
      { type: 'headline', text: 'Data & Insights', level: 1 },
      { type: 'bullet_list', items: ['Key metric #1', 'Key metric #2', 'Key metric #3'] },
      { type: 'paragraph', text: 'Chart placeholder - Add your visualization here' }
    ]
  },
  quote: {
    name: 'Quote',
    icon: '💬',
    description: 'Highlight important quotes',
    blocks: [
      { type: 'headline', text: '"Quote text goes here"', level: 2 },
      { type: 'paragraph', text: '— Attribution' },
      { type: 'paragraph', text: 'Additional context or commentary about the quote.' }
    ]
  },
  image: {
    name: 'Image',
    icon: '🖼️',
    description: 'Image-focused layout',
    blocks: [
      { type: 'headline', text: 'Visual Story', level: 1 },
      { type: 'paragraph', text: '[Image placeholder - Add your image here]' },
      { type: 'paragraph', text: 'Image caption or description goes here.' }
    ]
  },
  code: {
    name: 'Code',
    icon: '💻',
    description: 'Code examples and technical content',
    blocks: [
      { type: 'headline', text: 'Code Example', level: 1 },
      { type: 'paragraph', text: '```\n// Your code here\nfunction example() {\n  return "Hello World";\n}\n```' },
      { type: 'bullet_list', items: ['Code explanation point 1', 'Code explanation point 2'] }
    ]
  },
  comparison: {
    name: 'Comparison',
    icon: '⚖️',
    description: 'Compare two or more items',
    blocks: [
      { type: 'headline', text: 'Comparison', level: 1 },
      { type: 'bullet_list', items: ['Option A: Advantage 1', 'Option A: Advantage 2'] },
      { type: 'bullet_list', items: ['Option B: Advantage 1', 'Option B: Advantage 2'] }
    ]
  }
};

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave
}) => {
  const [currentDeck, setCurrentDeck] = useState<SlideDeckData>(deck);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [selectedSlideTemplate, setSelectedSlideTemplate] = useState<string>('content');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<number>(0);

  // Update deck when prop changes
  useEffect(() => {
    setCurrentDeck(deck);
  }, [deck]);

  const handleSlideUpdate = (slideIndex: number, updatedSlide: DeckSlide) => {
    const updatedDeck = {
      ...currentDeck,
      slides: currentDeck.slides.map((slide, index) =>
        index === slideIndex ? updatedSlide : slide
      )
    };
    setCurrentDeck(updatedDeck);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(currentDeck);
    }
    setIsEditing(false);
    setEditingBlock(null);
    setEditingTitle(null);
  };

  const addNewSlide = (afterIndex?: number) => {
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : currentDeck.slides.length;
    const newSlideId = `slide-${Date.now()}`;
    const template = SLIDE_TEMPLATES[selectedSlideTemplate as keyof typeof SLIDE_TEMPLATES] || SLIDE_TEMPLATES.content;
    
    const newSlide: DeckSlide = {
      slideId: newSlideId,
      slideNumber: insertIndex + 1,
      slideTitle: template.blocks[0]?.type === 'headline' ? (template.blocks[0] as any).text : 'New Slide',
      contentBlocks: template.blocks as AnyContentBlock[]
    };

    const updatedSlides = [...currentDeck.slides];
    updatedSlides.splice(insertIndex, 0, newSlide);
    
    // Renumber slides
    const renumberedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    setCurrentDeck({
      ...currentDeck,
      slides: renumberedSlides
    });
    
    setSelectedSlide(insertIndex);
  };

  const deleteSlide = (slideIndex: number) => {
    if (currentDeck.slides.length <= 1) return;

    const updatedSlides = currentDeck.slides.filter((_, index) => index !== slideIndex)
      .map((slide, index) => ({
        ...slide,
        slideNumber: index + 1
      }));

    setCurrentDeck({
      ...currentDeck,
      slides: updatedSlides
    });
    
    if (selectedSlide >= updatedSlides.length) {
      setSelectedSlide(updatedSlides.length - 1);
    }
  };

  const duplicateSlide = (slideIndex: number) => {
    const slideToDuplicate = currentDeck.slides[slideIndex];
    const newSlide: DeckSlide = {
      ...slideToDuplicate,
      slideId: `slide-${Date.now()}`,
      slideNumber: slideIndex + 2,
      slideTitle: `${slideToDuplicate.slideTitle} (Copy)`
    };

    const updatedSlides = [...currentDeck.slides];
    updatedSlides.splice(slideIndex + 1, 0, newSlide);
    
    const renumberedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    setCurrentDeck({
      ...currentDeck,
      slides: renumberedSlides
    });
  };

  const updateSlideTitle = (slideIndex: number, newTitle: string) => {
    const updatedSlide = { 
      ...currentDeck.slides[slideIndex], 
      slideTitle: newTitle 
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const updateContentBlock = (slideIndex: number, blockIndex: number, updatedBlock: AnyContentBlock) => {
    const slide = currentDeck.slides[slideIndex];
    const updatedSlide = {
      ...slide,
      contentBlocks: slide.contentBlocks.map((block, index) =>
        index === blockIndex ? updatedBlock : block
      )
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const addContentBlock = (slideIndex: number, type: AnyContentBlock['type'], afterIndex?: number) => {
    const slide = currentDeck.slides[slideIndex];
    let newBlock: AnyContentBlock;
    
    switch (type) {
      case 'headline':
        newBlock = { type: 'headline', text: 'New Headline', level: 2 };
        break;
      case 'paragraph':
        newBlock = { type: 'paragraph', text: 'New paragraph content...' };
        break;
      case 'bullet_list':
        newBlock = { type: 'bullet_list', items: ['First item', 'Second item', 'Third item'] };
        break;
      case 'numbered_list':
        newBlock = { type: 'numbered_list', items: ['First step', 'Second step', 'Third step'] };
        break;
      case 'alert':
        newBlock = { 
          type: 'alert', 
          text: 'Important information or call-to-action',
          alertType: 'info',
          title: 'Note'
        };
        break;
      default:
        newBlock = { type: 'paragraph', text: 'New content...' };
    }

    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : slide.contentBlocks.length;
    const updatedBlocks = [...slide.contentBlocks];
    updatedBlocks.splice(insertIndex, 0, newBlock);

    const updatedSlide = {
      ...slide,
      contentBlocks: updatedBlocks
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const deleteContentBlock = (slideIndex: number, blockIndex: number) => {
    const slide = currentDeck.slides[slideIndex];
    const updatedSlide = {
      ...slide,
      contentBlocks: slide.contentBlocks.filter((_, index) => index !== blockIndex)
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const duplicateContentBlock = (slideIndex: number, blockIndex: number) => {
    const slide = currentDeck.slides[slideIndex];
    const blockToDuplicate = slide.contentBlocks[blockIndex];
    const updatedBlocks = [...slide.contentBlocks];
    updatedBlocks.splice(blockIndex + 1, 0, { ...blockToDuplicate });

    const updatedSlide = {
      ...slide,
      contentBlocks: updatedBlocks
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, slideIndex: number, blockIndex: number) => {
    setDraggedBlock({ slideIndex, blockIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slideIndex: number, blockIndex: number) => {
    e.preventDefault();
    setDragOverBlock({ slideIndex, blockIndex });
  };

  const handleDragLeave = () => {
    setDragOverBlock(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlideIndex: number, targetBlockIndex: number) => {
    e.preventDefault();
    
    if (!draggedBlock) return;
    
    const { slideIndex: sourceSlideIndex, blockIndex: sourceBlockIndex } = draggedBlock;
    
    if (sourceSlideIndex === targetSlideIndex && sourceBlockIndex === targetBlockIndex) {
      setDraggedBlock(null);
      setDragOverBlock(null);
      return;
    }

    const sourceSlide = currentDeck.slides[sourceSlideIndex];
    const targetSlide = currentDeck.slides[targetSlideIndex];
    const blockToMove = sourceSlide.contentBlocks[sourceBlockIndex];

    let updatedSlides = [...currentDeck.slides];

    if (sourceSlideIndex === targetSlideIndex) {
      // Moving within the same slide
      const updatedBlocks = [...sourceSlide.contentBlocks];
      updatedBlocks.splice(sourceBlockIndex, 1);
      
      let insertIndex = targetBlockIndex;
      if (sourceBlockIndex < targetBlockIndex) {
        insertIndex = targetBlockIndex - 1;
      }
      
      updatedBlocks.splice(insertIndex, 0, blockToMove);
      
      updatedSlides[sourceSlideIndex] = {
        ...sourceSlide,
        contentBlocks: updatedBlocks
      };
    } else {
      // Moving between different slides
      const updatedSourceBlocks = sourceSlide.contentBlocks.filter((_, index) => index !== sourceBlockIndex);
      const updatedTargetBlocks = [...targetSlide.contentBlocks];
      updatedTargetBlocks.splice(targetBlockIndex, 0, blockToMove);

      updatedSlides[sourceSlideIndex] = {
        ...sourceSlide,
        contentBlocks: updatedSourceBlocks
      };
      
      updatedSlides[targetSlideIndex] = {
        ...targetSlide,
        contentBlocks: updatedTargetBlocks
      };
    }

    setCurrentDeck({
      ...currentDeck,
      slides: updatedSlides
    });

    setDraggedBlock(null);
    setDragOverBlock(null);
  };

  // Generate slide preview for sidebar
  const generateSlidePreview = (slide: DeckSlide): React.ReactNode => {
    const previewBlocks = slide.contentBlocks.slice(0, 3);
    
    return (
      <div className="modern-slide-preview">
        <div className="preview-header">
          <div className="preview-title">{slide.slideTitle}</div>
        </div>
        <div className="preview-content">
          {previewBlocks.map((block, index) => (
            <div key={index} className={`preview-block preview-${block.type}`}>
              {block.type === 'headline' && (
                <div className="preview-headline">{(block as any).text}</div>
              )}
              {block.type === 'paragraph' && (
                <div className="preview-paragraph">{(block as any).text.slice(0, 50)}...</div>
              )}
              {block.type === 'bullet_list' && (
                <div className="preview-list">
                  {(block as any).items.slice(0, 2).map((item: string, i: number) => (
                    <div key={i} className="preview-list-item">• {item}</div>
                  ))}
                </div>
              )}
              {block.type === 'numbered_list' && (
                <div className="preview-list">
                  {(block as any).items.slice(0, 2).map((item: string, i: number) => (
                    <div key={i} className="preview-list-item">{i + 1}. {item}</div>
                  ))}
                </div>
              )}
              {block.type === 'alert' && (
                <div className={`preview-alert alert-${(block as any).alertType}`}>
                  {(block as any).title}: {(block as any).text}
                </div>
              )}
            </div>
          ))}
          {slide.contentBlocks.length > 3 && (
            <div className="preview-more">+{slide.contentBlocks.length - 3} more</div>
          )}
        </div>
      </div>
    );
  };

  const applySlideTemplate = (slideIndex: number, template: string) => {
    const templateData = SLIDE_TEMPLATES[template as keyof typeof SLIDE_TEMPLATES];
    if (!templateData) return;

    const slide = currentDeck.slides[slideIndex];
    const updatedSlide = {
      ...slide,
      contentBlocks: templateData.blocks as AnyContentBlock[]
    };
    
    handleSlideUpdate(slideIndex, updatedSlide);
    setShowTemplateSelector(false);
  };

  // Professional content block renderer with modern styling
  const renderContentBlock = (block: AnyContentBlock, slideIndex: number, blockIndex: number): React.ReactNode => {
    const isEditingThis = editingBlock?.slideIndex === slideIndex && editingBlock?.blockIndex === blockIndex;
    const isDraggedOver = dragOverBlock?.slideIndex === slideIndex && dragOverBlock?.blockIndex === blockIndex;
    const isDragging = draggedBlock?.slideIndex === slideIndex && draggedBlock?.blockIndex === blockIndex;

    if (isEditingThis) {
      return (
        <div className="modern-inline-editor">
          <InlineContentEditor
            block={block}
            onSave={(updatedBlock) => {
              updateContentBlock(slideIndex, blockIndex, updatedBlock);
              setEditingBlock(null);
            }}
            onCancel={() => setEditingBlock(null)}
          />
        </div>
      );
    }

    const blockElement = (
      <div
        className={`modern-content-block ${block.type} ${isDraggedOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''}`}
        draggable={isEditable}
        onDragStart={(e) => handleDragStart(e, slideIndex, blockIndex)}
        onDragOver={(e) => handleDragOver(e, slideIndex, blockIndex)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slideIndex, blockIndex)}
        onClick={() => isEditable && setEditingBlock({ slideIndex, blockIndex })}
      >
        {isEditable && (
          <div className="modern-block-controls">
            <button
              className="modern-control-btn drag-handle"
              title="Drag to reorder"
            >
              <span className="btn-icon">⋮⋮</span>
            </button>
            <button
              className="modern-control-btn duplicate"
              onClick={(e) => {
                e.stopPropagation();
                duplicateContentBlock(slideIndex, blockIndex);
              }}
              title="Duplicate block"
            >
              <span className="btn-icon">📋</span>
            </button>
            <button
              className="modern-control-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteContentBlock(slideIndex, blockIndex);
              }}
              title="Delete block"
            >
              <span className="btn-icon">🗑️</span>
            </button>
          </div>
        )}

        {renderBlockContent(block)}
      </div>
    );

    return blockElement;
  };

  const renderBlockContent = (block: AnyContentBlock): React.ReactNode => {
    switch (block.type) {
      case 'headline':
        const headlineBlock = block as any;
        const HeadingTag = `h${headlineBlock.level}` as keyof JSX.IntrinsicElements;
        const headingIcon = headlineBlock.level === 1 ? '🎯' : headlineBlock.level === 2 ? '📌' : headlineBlock.level === 3 ? '✨' : '🔹';
        
        return React.createElement(HeadingTag, {
          className: `modern-headline level-${headlineBlock.level}`
        }, [
          React.createElement('span', { key: 'icon', className: 'heading-icon' }, headingIcon),
          React.createElement('span', { key: 'text', className: 'heading-text' }, headlineBlock.text)
        ]);

      case 'paragraph':
        const paragraphBlock = block as any;
        return (
          <div className="modern-paragraph">
            <span className="paragraph-icon">📄</span>
            <p className="paragraph-text">{paragraphBlock.text}</p>
          </div>
        );

      case 'bullet_list':
        const bulletBlock = block as any;
        return (
          <div className="modern-bullet-list">
            <div className="list-header">
              <span className="list-icon">📋</span>
              <span className="list-title">Key Points</span>
            </div>
            <ul className="bullet-items">
              {(bulletBlock.items || []).map((item: string, index: number) => (
                <li key={index} className="modern-bullet-item">
                  <span className="bullet-indicator">●</span>
                  <span className="bullet-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'numbered_list':
        const numberedBlock = block as any;
        return (
          <div className="modern-numbered-list">
            <div className="list-header">
              <span className="list-icon">🔢</span>
              <span className="list-title">Steps</span>
            </div>
            <ol className="numbered-items">
              {(numberedBlock.items || []).map((item: string, index: number) => (
                <li key={index} className="modern-numbered-item">
                  <span className="number-badge">{index + 1}</span>
                  <span className="numbered-text">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        );

      case 'alert':
        const alertBlock = block as any;
        const alertIcons = {
          info: 'ℹ️',
          warning: '⚠️',
          danger: '🚫',
          success: '✅'
        };
        
        return (
          <div className={`modern-alert alert-${alertBlock.alertType}`}>
            <div className="alert-header">
              <span className="alert-icon">{alertIcons[alertBlock.alertType as keyof typeof alertIcons]}</span>
              <span className="alert-title">{alertBlock.title}</span>
            </div>
            <div className="alert-content">{alertBlock.text}</div>
          </div>
        );

      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div className="modern-slide-deck-viewer">
      {/* Professional Sidebar */}
      <div className="modern-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="sidebar-icon">📊</span>
            <span>Slides</span>
          </div>
          <div className="sidebar-controls">
            <button
              className="modern-btn template-btn"
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              title="Choose Template"
            >
              <span className="btn-icon">🎨</span>
            </button>
            <button
              className="modern-btn add-slide-btn"
              onClick={() => addNewSlide()}
              title="Add New Slide"
            >
              <span className="btn-icon">➕</span>
            </button>
          </div>
        </div>

        {/* Template Selector */}
        {showTemplateSelector && (
          <div className="modern-template-selector">
            <div className="template-header">
              <h3>Choose Template</h3>
              <button
                className="close-btn"
                onClick={() => setShowTemplateSelector(false)}
              >
                ✕
              </button>
            </div>
            <div className="template-grid">
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className={`template-option ${selectedSlideTemplate === key ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSlideTemplate(key);
                    setShowTemplateSelector(false);
                  }}
                >
                  <div className="template-icon">{template.icon}</div>
                  <div className="template-name">{template.name}</div>
                  <div className="template-description">{template.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide List */}
        <div className="sidebar-slides">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className={`modern-slide-item ${selectedSlide === index ? 'selected' : ''}`}
              onClick={() => setSelectedSlide(index)}
            >
              <div className="slide-number-badge">{index + 1}</div>
              {generateSlidePreview(slide)}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="modern-main-content">
        {/* Professional Header */}
        <div className="modern-header">
          <div className="header-left">
            <div className="deck-info">
                             <h1 className="deck-title">{(currentDeck as any).title || 'Untitled Presentation'}</h1>
              <div className="deck-stats">
                <span className="stat">
                  <span className="stat-icon">📄</span>
                  {currentDeck.slides.length} slides
                </span>
                <span className="stat">
                  <span className="stat-icon">⏱️</span>
                  Editing mode
                </span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="edit-controls">
              <button
                className={`modern-btn edit-toggle ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <span className="btn-icon">✏️</span>
                {isEditing ? 'Exit Edit' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  className="modern-btn save-btn primary"
                  onClick={handleSave}
                >
                  <span className="btn-icon">💾</span>
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Slides Container */}
        <div className="modern-slides-container">
          {currentDeck.slides.map((slide, slideIndex) => (
            <div key={slide.slideId} className="modern-slide-wrapper">
              <div className="modern-slide">
                <div className="slide-header">
                  <div className="slide-badge">
                    <span className="slide-number">{slideIndex + 1}</span>
                  </div>
                  {isEditable && (
                    <div className="slide-controls">
                      <button
                        className="modern-control-btn template"
                        onClick={() => {
                          setSelectedSlide(slideIndex);
                          setShowTemplateSelector(true);
                        }}
                        title="Apply Template"
                      >
                        <span className="btn-icon">🎨</span>
                      </button>
                      <button
                        className="modern-control-btn add"
                        onClick={() => addNewSlide(slideIndex)}
                        title="Add Slide After"
                      >
                        <span className="btn-icon">➕</span>
                      </button>
                      <button
                        className="modern-control-btn duplicate"
                        onClick={() => duplicateSlide(slideIndex)}
                        title="Duplicate Slide"
                      >
                        <span className="btn-icon">📋</span>
                      </button>
                      <button
                        className="modern-control-btn delete"
                        onClick={() => deleteSlide(slideIndex)}
                        title="Delete Slide"
                      >
                        <span className="btn-icon">🗑️</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="slide-content">
                  {/* Slide Title */}
                  <div className="modern-slide-title">
                    {editingTitle === slideIndex ? (
                      <input
                        className="modern-title-input"
                        value={slide.slideTitle}
                        onChange={(e) => updateSlideTitle(slideIndex, e.target.value)}
                        onBlur={() => setEditingTitle(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            setEditingTitle(null);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <h2
                        className="slide-title-display"
                        onClick={() => isEditable && setEditingTitle(slideIndex)}
                      >
                        <span className="title-icon">🎯</span>
                        {slide.slideTitle}
                      </h2>
                    )}
                  </div>

                  {/* Slide Body */}
                  <div className="modern-slide-body">
                    {slide.contentBlocks.map((block, blockIndex) => (
                      <div key={blockIndex}>
                        {renderContentBlock(block, slideIndex, blockIndex)}
                        {isEditable && (
                          <div className="modern-add-zone">
                            <button
                              className="add-zone-trigger"
                              onClick={() => setEditingBlock({ slideIndex, blockIndex: blockIndex + 1 })}
                            >
                              <span className="add-icon">➕</span>
                              <span className="add-text">Add content</span>
                            </button>
                            <div className="modern-add-buttons">
                              <button
                                className="modern-add-btn headline"
                                onClick={() => addContentBlock(slideIndex, 'headline', blockIndex)}
                                title="Add Headline"
                              >
                                <span className="btn-icon">📝</span>
                                Headline
                              </button>
                              <button
                                className="modern-add-btn paragraph"
                                onClick={() => addContentBlock(slideIndex, 'paragraph', blockIndex)}
                                title="Add Paragraph"
                              >
                                <span className="btn-icon">📄</span>
                                Text
                              </button>
                              <button
                                className="modern-add-btn bullets"
                                onClick={() => addContentBlock(slideIndex, 'bullet_list', blockIndex)}
                                title="Add Bullet List"
                              >
                                <span className="btn-icon">📋</span>
                                Bullets
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add content zone at the end */}
                    {isEditable && slide.contentBlocks.length === 0 && (
                      <div className="modern-add-zone empty-slide">
                        <div className="empty-slide-message">
                          <span className="empty-icon">📝</span>
                          <h3>Start adding content</h3>
                          <p>Click any button below to add your first content block</p>
                        </div>
                        <div className="modern-add-buttons">
                          <button
                            className="modern-add-btn headline"
                            onClick={() => addContentBlock(slideIndex, 'headline')}
                          >
                            <span className="btn-icon">📝</span>
                            Headline
                          </button>
                          <button
                            className="modern-add-btn paragraph"
                            onClick={() => addContentBlock(slideIndex, 'paragraph')}
                          >
                            <span className="btn-icon">📄</span>
                            Text
                          </button>
                          <button
                            className="modern-add-btn bullets"
                            onClick={() => addContentBlock(slideIndex, 'bullet_list')}
                          >
                            <span className="btn-icon">📋</span>
                            Bullets
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section break between slides */}
              {slideIndex < currentDeck.slides.length - 1 && (
                <div className="modern-section-break">
                  <div className="section-line"></div>
                  <div className="section-indicator">
                    <span className="section-text">Slide {slideIndex + 2}</span>
                  </div>
                  <div className="section-line"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Inline Content Editor Component
interface InlineContentEditorProps {
  block: AnyContentBlock;
  onSave: (updatedBlock: AnyContentBlock) => void;
  onCancel: () => void;
}

const InlineContentEditor: React.FC<InlineContentEditorProps> = ({ block, onSave, onCancel }) => {
  const [editedBlock, setEditedBlock] = useState<AnyContentBlock>(block);

  const handleSave = () => {
    onSave(editedBlock);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'headline':
        const headlineBlock = editedBlock as any;
        return (
          <div className="modern-editor-group">
            <div className="editor-header">
              <span className="editor-icon">📝</span>
              <span className="editor-title">Edit Headline</span>
              <select
                value={headlineBlock.level}
                onChange={(e) => setEditedBlock({ ...headlineBlock, level: parseInt(e.target.value) })}
                className="level-selector"
              >
                <option value={1}>H1 - Main Title</option>
                <option value={2}>H2 - Section</option>
                <option value={3}>H3 - Subsection</option>
                <option value={4}>H4 - Detail</option>
              </select>
            </div>
            <input
              type="text"
              value={headlineBlock.text}
              onChange={(e) => setEditedBlock({ ...headlineBlock, text: e.target.value })}
              onKeyDown={handleKeyDown}
              className="modern-text-input"
              placeholder="Enter headline text..."
              autoFocus
            />
          </div>
        );

      case 'paragraph':
        const paragraphBlock = editedBlock as any;
        return (
          <div className="modern-editor-group">
            <div className="editor-header">
              <span className="editor-icon">📄</span>
              <span className="editor-title">Edit Paragraph</span>
            </div>
            <textarea
              value={paragraphBlock.text}
              onChange={(e) => setEditedBlock({ ...paragraphBlock, text: e.target.value })}
              onKeyDown={handleKeyDown}
              className="modern-textarea"
              placeholder="Enter paragraph text..."
              rows={4}
              autoFocus
            />
          </div>
        );

      case 'bullet_list':
      case 'numbered_list':
        const listBlock = editedBlock as any;
        return (
          <div className="modern-editor-group">
            <div className="editor-header">
              <span className="editor-icon">{block.type === 'bullet_list' ? '📋' : '🔢'}</span>
              <span className="editor-title">Edit {block.type === 'bullet_list' ? 'Bullet' : 'Numbered'} List</span>
            </div>
            <div className="list-editor">
              {(listBlock.items || []).map((item: string, index: number) => (
                <div key={index} className="list-item-editor">
                  <span className="item-number">{block.type === 'bullet_list' ? '•' : `${index + 1}.`}</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(listBlock.items || [])];
                      newItems[index] = e.target.value;
                      setEditedBlock({ ...listBlock, items: newItems });
                    }}
                    className="list-item-input"
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = (listBlock.items || []).filter((_: any, i: number) => i !== index);
                      setEditedBlock({ ...listBlock, items: newItems });
                    }}
                    className="remove-item-btn"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newItems = [...(listBlock.items || []), 'New item'];
                  setEditedBlock({ ...listBlock, items: newItems });
                }}
                className="add-item-btn"
              >
                <span className="btn-icon">➕</span>
                Add Item
              </button>
            </div>
          </div>
        );

      case 'alert':
        const alertBlock = editedBlock as any;
        return (
          <div className="modern-editor-group">
            <div className="editor-header">
              <span className="editor-icon">⚠️</span>
              <span className="editor-title">Edit Alert</span>
              <select
                value={alertBlock.alertType}
                onChange={(e) => setEditedBlock({ ...alertBlock, alertType: e.target.value })}
                className="alert-type-selector"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
              </select>
            </div>
            <input
              type="text"
              value={alertBlock.title || ''}
              onChange={(e) => setEditedBlock({ ...alertBlock, title: e.target.value })}
              className="modern-text-input"
              placeholder="Alert title..."
            />
            <textarea
              value={alertBlock.text}
              onChange={(e) => setEditedBlock({ ...alertBlock, text: e.target.value })}
              onKeyDown={handleKeyDown}
              className="modern-textarea"
              placeholder="Alert content..."
              rows={3}
            />
          </div>
        );

      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div className="modern-inline-editor-container">
      {renderEditor()}
      <div className="editor-actions">
        <button
          onClick={handleSave}
          className="modern-btn save-btn primary"
        >
          <span className="btn-icon">✅</span>
          Save
        </button>
        <button
          onClick={onCancel}
          className="modern-btn cancel-btn"
        >
          <span className="btn-icon">❌</span>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SlideDeckViewer; 