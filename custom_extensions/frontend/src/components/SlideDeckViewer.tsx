import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, ContentBlockWithPosition, BlockPosition } from '@/types/pdfLesson';

interface SlideDeckViewerProps {
  deck: SlideDeckData;
  isEditable?: boolean;
  onSave?: (updatedDeck: SlideDeckData) => void;
}

// Smart formation logic for different content types
const getRandomFormation = (blockType: string, itemCount?: number): 'vertical' | 'grid-2x2' | 'grid-3x2' | 'grid-2x3' | 'horizontal' => {
  const formations = {
    bullet_list: itemCount && itemCount > 4 ? 
      ['vertical', 'grid-2x2', 'grid-3x2', 'grid-2x3'] as const : 
      ['vertical', 'horizontal'] as const,
    numbered_list: itemCount && itemCount > 4 ? 
      ['vertical', 'grid-2x2', 'grid-3x2'] as const : 
      ['vertical', 'horizontal'] as const,
    paragraph: ['vertical'] as const,
    headline: ['vertical'] as const,
    alert: ['vertical'] as const
  };
  
  const availableFormations = formations[blockType as keyof typeof formations] || ['vertical'] as const;
  return availableFormations[Math.floor(Math.random() * availableFormations.length)];
};

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave
}): React.ReactElement => {
  const [currentDeck, setCurrentDeck] = useState<SlideDeckData>(deck);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [draggedBlock, setDraggedBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [dragPosition, setDragPosition] = useState<{x: number, y: number} | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update deck when prop changes
  useEffect(() => {
    setCurrentDeck(deck);
  }, [deck]);

  // Handle scroll to update current slide
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const slideHeight = window.innerHeight;
      const newSlideIndex = Math.floor(scrollPosition / slideHeight);
      setCurrentSlideIndex(Math.min(newSlideIndex, currentDeck.slides.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentDeck.slides.length]);

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
    const newSlide: DeckSlide = {
      slideId: newSlideId,
      slideNumber: insertIndex + 1,
      slideTitle: 'Click to edit title',
      contentBlocks: [
        {
          type: 'paragraph',
          text: 'Click to add content',
          position: { x: 10, y: 20, width: 80, height: 15 }
        }
      ]
    };

    const updatedSlides = [...currentDeck.slides];
    updatedSlides.splice(insertIndex, 0, newSlide);
    
    const renumberedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    setCurrentDeck({
      ...currentDeck,
      slides: renumberedSlides
    });

    // Scroll to new slide
    setTimeout(() => {
      scrollToSlide(insertIndex);
    }, 100);
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

    if (currentSlideIndex >= slideIndex && currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
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

  const scrollToSlide = (slideIndex: number) => {
    const targetY = slideIndex * window.innerHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setCurrentSlideIndex(slideIndex);
  };

  const updateSlideTitle = (slideIndex: number, newTitle: string) => {
    const updatedSlide = { 
      ...currentDeck.slides[slideIndex], 
      slideTitle: newTitle 
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const updateContentBlock = (slideIndex: number, blockIndex: number, updatedBlock: ContentBlockWithPosition) => {
    const slide = currentDeck.slides[slideIndex];
    const updatedSlide = {
      ...slide,
      contentBlocks: slide.contentBlocks.map((block, index) =>
        index === blockIndex ? updatedBlock : block
      )
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const addContentBlock = (slideIndex: number, type: ContentBlockWithPosition['type'], x: number = 10, y: number = 30) => {
    const slide = currentDeck.slides[slideIndex];
    let newBlock: ContentBlockWithPosition;
    
    const defaultPosition: BlockPosition = { x, y, width: 40, height: 20 };
    
    switch (type) {
      case 'headline':
        newBlock = { 
          type: 'headline', 
          text: 'Click to edit headline', 
          level: 2,
          position: { ...defaultPosition, height: 15 }
        };
        break;
      case 'paragraph':
        newBlock = { 
          type: 'paragraph', 
          text: 'Click to edit paragraph',
          position: defaultPosition
        };
        break;
      case 'bullet_list':
        const bulletItems = ['Click to edit', 'Add more items', 'Drag to reposition'];
        newBlock = { 
          type: 'bullet_list', 
          items: bulletItems,
          position: { ...defaultPosition, height: 25 },
          formation: getRandomFormation('bullet_list', bulletItems.length)
        };
        break;
      case 'numbered_list':
        const numberedItems = ['First item', 'Second item', 'Third item', 'Fourth item'];
        newBlock = { 
          type: 'numbered_list', 
          items: numberedItems,
          position: { ...defaultPosition, height: 30 },
          formation: getRandomFormation('numbered_list', numberedItems.length)
        };
        break;
      case 'alert':
        newBlock = { 
          type: 'alert', 
          text: 'Click to edit alert',
          alertType: 'info',
          title: 'Alert Title',
          position: { ...defaultPosition, height: 25 }
        };
        break;
      default:
        newBlock = { 
          type: 'paragraph', 
          text: 'Click to edit',
          position: defaultPosition
        };
    }

    const updatedBlocks = [...slide.contentBlocks, newBlock];
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

  // Drag and drop for content blocks
  const handleBlockDragStart = (e: React.DragEvent, slideIndex: number, blockIndex: number) => {
    setDraggedBlock({ slideIndex, blockIndex });
    e.dataTransfer.effectAllowed = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('text/plain', JSON.stringify({ offsetX, offsetY }));
  };

  const handleSlideDrop = (e: React.DragEvent, slideIndex: number) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const slideElement = slideRefs.current[slideIndex];
    if (!slideElement) return;

    const slideRect = slideElement.getBoundingClientRect();
    const offsetData = JSON.parse(e.dataTransfer.getData('text/plain') || '{"offsetX":0,"offsetY":0}');
    
    // Calculate position as percentage
    const x = ((e.clientX - slideRect.left - offsetData.offsetX) / slideRect.width) * 100;
    const y = ((e.clientY - slideRect.top - offsetData.offsetY) / slideRect.height) * 100;

    const { slideIndex: sourceSlideIndex, blockIndex: sourceBlockIndex } = draggedBlock;
    const sourceSlide = currentDeck.slides[sourceSlideIndex];
    const blockToMove = { ...sourceSlide.contentBlocks[sourceBlockIndex] };

    // Update position
    blockToMove.position = {
      x: Math.max(0, Math.min(90, x)),
      y: Math.max(0, Math.min(85, y)),
      width: blockToMove.position?.width || 40,
      height: blockToMove.position?.height || 20
    };

    // Remove from source slide
    const updatedSourceBlocks = sourceSlide.contentBlocks.filter((_, index) => index !== sourceBlockIndex);
    
    // Add to target slide
    const targetSlide = currentDeck.slides[slideIndex];
    const updatedTargetBlocks = sourceSlideIndex === slideIndex ? 
      updatedSourceBlocks : [...targetSlide.contentBlocks];
    updatedTargetBlocks.push(blockToMove);

    // Update slides
    const updatedSlides = currentDeck.slides.map((slide, index) => {
      if (index === sourceSlideIndex) {
        return { ...slide, contentBlocks: sourceSlideIndex === slideIndex ? updatedTargetBlocks : updatedSourceBlocks };
      }
      if (index === slideIndex && sourceSlideIndex !== slideIndex) {
        return { ...slide, contentBlocks: updatedTargetBlocks };
      }
      return slide;
    });

    setCurrentDeck({
      ...currentDeck,
      slides: updatedSlides
    });

    setDraggedBlock(null);
  };

  const handleBlockResize = (slideIndex: number, blockIndex: number, newPosition: BlockPosition) => {
    const slide = currentDeck.slides[slideIndex];
    const block = slide.contentBlocks[blockIndex];
    const updatedBlock = {
      ...block,
      position: newPosition
    };
    updateContentBlock(slideIndex, blockIndex, updatedBlock);
  };

  const renderContentBlock = (block: ContentBlockWithPosition, slideIndex: number, blockIndex: number): React.ReactNode => {
    const isEditing = editingBlock?.slideIndex === slideIndex && editingBlock?.blockIndex === blockIndex;
    const isDragging = draggedBlock?.slideIndex === slideIndex && draggedBlock?.blockIndex === blockIndex;
    
    const position = block.position || { x: 10, y: 20, width: 40, height: 20 };
    
    const blockStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${position.x}%`,
      top: `${position.y}%`,
      width: `${position.width}%`,
      minHeight: `${position.height}%`,
      cursor: isEditable && !isEditing ? 'move' : 'pointer',
      opacity: isDragging ? 0.5 : 1,
      zIndex: isEditing ? 1000 : 1
    };

    if (isEditing) {
      return (
        <div key={blockIndex} style={blockStyle} className="content-block-gamma editing">
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

    const blockContent = (() => {
      switch (block.type) {
        case 'headline':
          const headlineBlock = block as any;
          const level = Math.min(Math.max(headlineBlock.level || 2, 1), 6);
          return React.createElement(
            `h${level}`,
            {
              className: `gamma-headline level-${level}`,
              style: {
                color: headlineBlock.textColor || '#1a202c',
                backgroundColor: headlineBlock.backgroundColor || 'transparent',
                margin: 0,
                fontSize: level === 1 ? '3rem' : level === 2 ? '2.5rem' : level === 3 ? '2rem' : '1.5rem',
                fontWeight: level <= 2 ? '700' : '600',
                lineHeight: 1.2
              }
            },
            headlineBlock.text
          );

        case 'paragraph':
          const paragraphBlock = block as any;
          return React.createElement('p', {
            className: 'gamma-paragraph',
            style: {
              margin: 0,
              fontSize: '1.2rem',
              lineHeight: 1.6,
              color: '#4a5568'
            }
          }, paragraphBlock.text);

        case 'bullet_list':
          const bulletBlock = block as any;
          const bulletFormation = block.formation || 'vertical';
          return React.createElement('ul', {
            className: `gamma-bullet-list formation-${bulletFormation}`,
            style: {
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: bulletFormation.includes('grid') ? 'grid' : 'flex',
              flexDirection: bulletFormation === 'horizontal' ? 'row' : 'column',
              gridTemplateColumns: bulletFormation === 'grid-2x2' ? 'repeat(2, 1fr)' :
                                   bulletFormation === 'grid-3x2' ? 'repeat(3, 1fr)' :
                                   bulletFormation === 'grid-2x3' ? 'repeat(2, 1fr)' : 'none',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }
          }, bulletBlock.items.map((item: any, itemIndex: number) => 
            React.createElement('li', {
              key: itemIndex,
              className: 'gamma-list-item',
              style: {
                position: 'relative',
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                lineHeight: 1.5,
                color: '#4a5568',
                marginBottom: bulletFormation === 'vertical' ? '0.5rem' : '0'
              }
            }, [
              React.createElement('span', {
                key: 'bullet',
                style: {
                  position: 'absolute',
                  left: '0',
                  top: '0.1rem',
                  width: '0.5rem',
                  height: '0.5rem',
                  backgroundColor: '#4299e1',
                  borderRadius: '50%'
                }
              }),
              typeof item === 'string' ? item : JSON.stringify(item)
            ])
          ));

        case 'numbered_list':
          const numberedBlock = block as any;
          const numberedFormation = block.formation || 'vertical';
          return React.createElement('ol', {
            className: `gamma-numbered-list formation-${numberedFormation}`,
            style: {
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: numberedFormation.includes('grid') ? 'grid' : 'flex',
              flexDirection: numberedFormation === 'horizontal' ? 'row' : 'column',
              gridTemplateColumns: numberedFormation === 'grid-2x2' ? 'repeat(2, 1fr)' :
                                   numberedFormation === 'grid-3x2' ? 'repeat(3, 1fr)' : 'none',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }
          }, numberedBlock.items.map((item: any, itemIndex: number) => 
            React.createElement('li', {
              key: itemIndex,
              className: 'gamma-numbered-item',
              style: {
                position: 'relative',
                paddingLeft: '2rem',
                fontSize: '1.1rem',
                lineHeight: 1.5,
                color: '#4a5568',
                marginBottom: numberedFormation === 'vertical' ? '0.5rem' : '0'
              }
            }, [
              React.createElement('span', {
                key: 'number',
                style: {
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }
              }, itemIndex + 1),
              typeof item === 'string' ? item : JSON.stringify(item)
            ])
          ));

        case 'alert':
          const alertBlock = block as any;
          const alertColors = {
            info: { bg: '#ebf8ff', border: '#3182ce', color: '#2a4365' },
            warning: { bg: '#fffbeb', border: '#d69e2e', color: '#744210' },
            danger: { bg: '#fed7d7', border: '#e53e3e', color: '#742a2a' },
            success: { bg: '#f0fff4', border: '#38a169', color: '#22543d' }
          };
          const alertStyle = alertColors[alertBlock.alertType as keyof typeof alertColors] || alertColors.info;
          
          return React.createElement('div', {
            className: `gamma-alert alert-${alertBlock.alertType}`,
            style: {
              backgroundColor: alertStyle.bg,
              borderLeft: `4px solid ${alertStyle.border}`,
              color: alertStyle.color,
              padding: '1rem',
              borderRadius: '8px',
              margin: 0
            }
          }, [
            alertBlock.title && React.createElement('div', {
              key: 'title',
              style: { fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }
            }, alertBlock.title),
            React.createElement('div', {
              key: 'text',
              style: { lineHeight: 1.5 }
            }, alertBlock.text)
          ].filter(Boolean));

        default:
          return React.createElement('div', {
            className: 'gamma-unknown',
            style: {
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#6c757d'
            }
          }, `Unsupported block type: ${(block as any).type}`);
      }
    })();

    return (
      <div 
        key={blockIndex} 
        style={blockStyle}
        className={`content-block-gamma ${isEditable ? 'editable' : ''}`}
        draggable={isEditable && !isEditing}
        onDragStart={(e) => handleBlockDragStart(e, slideIndex, blockIndex)}
        onClick={() => {
          if (isEditable && !isEditing) {
            setEditingBlock({ slideIndex, blockIndex });
          }
        }}
      >
        {blockContent}
        {isEditable && !isEditing && (
          <div className="block-controls-gamma">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteContentBlock(slideIndex, blockIndex);
              }}
              className="control-btn delete"
              title="Delete"
            >
              ×
            </button>
            <div className="drag-handle-gamma" title="Drag to move">
              ⋮⋮
            </div>
          </div>
        )}
        {isEditable && !isEditing && (
          <div className="resize-handles">
            <div className="resize-handle bottom-right"></div>
          </div>
        )}
      </div>
    );
  };

  // Generate slide preview for sidebar
  const generateSlidePreview = (slide: DeckSlide, slideIndex: number) => {
    return (
      <div className="slide-preview-canvas">
        <div className="preview-title">{slide.slideTitle}</div>
        <div className="preview-content">
          {slide.contentBlocks.slice(0, 3).map((block, idx) => {
            const blockPos = block.position || { x: 10, y: 30, width: 80, height: 20 };
            return (
              <div 
                key={idx} 
                className={`preview-block ${block.type}`}
                style={{
                  position: 'absolute',
                  left: `${blockPos.x * 0.8}%`,
                  top: `${blockPos.y * 0.8 + 20}%`,
                  width: `${blockPos.width * 0.8}%`,
                  height: `${blockPos.height * 0.6}%`,
                  fontSize: '0.6rem',
                  overflow: 'hidden'
                }}
              >
                {block.type === 'headline' ? '■' : 
                 block.type === 'bullet_list' ? '• • •' :
                 block.type === 'numbered_list' ? '1 2 3' :
                 block.type === 'alert' ? '⚠' : '—'}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="gamma-presentation-container">
      {/* Fixed Sidebar */}
      <div className="gamma-sidebar">
        <div className="sidebar-header">
          <h3>{currentDeck.lessonTitle}</h3>
          <span className="slide-count">{currentDeck.slides.length} slides</span>
        </div>
        
        <div className="slides-thumbnails">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => scrollToSlide(index)}
            >
              <div className="thumbnail-number">{slide.slideNumber}</div>
              {generateSlidePreview(slide, index)}
              
              {isEditable && isEditing && (
                <div className="thumbnail-controls">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewSlide(index);
                    }}
                    className="thumb-btn add"
                    title="Add slide after"
                  >
                    +
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="thumb-btn duplicate"
                    title="Duplicate slide"
                  >
                    ⧉
                  </button>
                  {currentDeck.slides.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="thumb-btn delete"
                      title="Delete slide"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {isEditable && (
          <div className="sidebar-controls">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`edit-toggle ${isEditing ? 'active' : ''}`}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            {isEditing && (
              <>
                <button onClick={() => addNewSlide()} className="add-slide">
                  + Add Slide
                </button>
                <button onClick={handleSave} className="save-deck">
                  Save Changes
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Fixed Top Bar */}
      {isEditing && (
        <div className="gamma-top-bar">
          <div className="content-tools">
            <button onClick={() => addContentBlock(currentSlideIndex, 'headline')}>+ Headline</button>
            <button onClick={() => addContentBlock(currentSlideIndex, 'paragraph')}>+ Text</button>
            <button onClick={() => addContentBlock(currentSlideIndex, 'bullet_list')}>+ Bullets</button>
            <button onClick={() => addContentBlock(currentSlideIndex, 'numbered_list')}>+ Numbers</button>
            <button onClick={() => addContentBlock(currentSlideIndex, 'alert')}>+ Alert</button>
          </div>
        </div>
      )}

      {/* Full-Screen Slides */}
      <div className="gamma-slides-container">
        {currentDeck.slides.map((slide, slideIndex) => (
          <div 
            key={slide.slideId} 
            ref={(el) => { slideRefs.current[slideIndex] = el; }}
            className="gamma-slide"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleSlideDrop(e, slideIndex)}
          >
            {/* Editable title */}
            {editingTitle === slideIndex ? (
              <input
                type="text"
                value={slide.slideTitle}
                onChange={(e) => updateSlideTitle(slideIndex, e.target.value)}
                onBlur={() => setEditingTitle(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(null);
                }}
                className="gamma-title-input"
                autoFocus
              />
            ) : (
              <h1 
                className="gamma-slide-title"
                onClick={() => {
                  if (isEditable && isEditing) {
                    setEditingTitle(slideIndex);
                  }
                }}
              >
                {slide.slideTitle}
              </h1>
            )}
            
            {/* Content blocks with absolute positioning */}
            <div className="gamma-slide-content">
              {slide.contentBlocks.map((block, blockIndex) => 
                renderContentBlock(block, slideIndex, blockIndex)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simplified Inline Content Editor
interface InlineContentEditorProps {
  block: ContentBlockWithPosition;
  onSave: (updatedBlock: ContentBlockWithPosition) => void;
  onCancel: () => void;
}

const InlineContentEditor: React.FC<InlineContentEditorProps> = ({ block, onSave, onCancel }) => {
  const [editedBlock, setEditedBlock] = useState<ContentBlockWithPosition>(block);

  const handleSave = () => {
    onSave(editedBlock);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  switch (block.type) {
    case 'headline':
      const headlineBlock = editedBlock as any;
      return (
        <div className="gamma-inline-editor headline-editor">
          <select
            value={headlineBlock.level || 2}
            onChange={(e) => setEditedBlock({ ...headlineBlock, level: parseInt(e.target.value) })}
            className="level-selector"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
          <input
            type="text"
            value={headlineBlock.text}
            onChange={(e) => setEditedBlock({ ...headlineBlock, text: e.target.value })}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Enter headline..."
            className="headline-input"
            autoFocus
          />
        </div>
      );

    case 'paragraph':
      const paragraphBlock = editedBlock as any;
      return (
        <div className="gamma-inline-editor paragraph-editor">
          <textarea
            value={paragraphBlock.text}
            onChange={(e) => setEditedBlock({ ...paragraphBlock, text: e.target.value })}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Enter text..."
            className="paragraph-textarea"
            autoFocus
            rows={3}
          />
        </div>
      );

    case 'bullet_list':
    case 'numbered_list':
      const listBlock = editedBlock as any;
      return (
        <div className="gamma-inline-editor list-editor">
          <div className="formation-selector">
            <select
              value={listBlock.formation || 'vertical'}
              onChange={(e) => setEditedBlock({ ...listBlock, formation: e.target.value })}
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="grid-2x2">2×2 Grid</option>
              <option value="grid-3x2">3×2 Grid</option>
              <option value="grid-2x3">2×3 Grid</option>
            </select>
          </div>
          <div className="list-items-editor">
            {listBlock.items.map((item: string, index: number) => (
              <div key={index} className="list-item-editor">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...listBlock.items];
                    newItems[index] = e.target.value;
                    setEditedBlock({ ...listBlock, items: newItems });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newItems = [...listBlock.items];
                      newItems.splice(index + 1, 0, '');
                      setEditedBlock({ ...listBlock, items: newItems });
                    } else if (e.key === 'Backspace' && item === '' && listBlock.items.length > 1) {
                      const newItems = listBlock.items.filter((_: any, i: number) => i !== index);
                      setEditedBlock({ ...listBlock, items: newItems });
                    }
                  }}
                  onBlur={handleBlur}
                  placeholder="List item..."
                  className="list-item-input"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case 'alert':
      const alertBlock = editedBlock as any;
      return (
        <div className="gamma-inline-editor alert-editor">
          <select
            value={alertBlock.alertType || 'info'}
            onChange={(e) => setEditedBlock({ ...alertBlock, alertType: e.target.value })}
            className="alert-type-selector"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="success">Success</option>
          </select>
          <input
            type="text"
            value={alertBlock.title || ''}
            onChange={(e) => setEditedBlock({ ...alertBlock, title: e.target.value })}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Alert title..."
            className="alert-title-input"
          />
          <textarea
            value={alertBlock.text}
            onChange={(e) => setEditedBlock({ ...alertBlock, text: e.target.value })}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Alert message..."
            className="alert-text-textarea"
            rows={2}
          />
        </div>
      );

    default:
      return (
        <div className="gamma-inline-editor">
          <input
            type="text"
            value="Unsupported content type"
            onBlur={onCancel}
            readOnly
          />
        </div>
      );
  }
};

export default SlideDeckViewer; 