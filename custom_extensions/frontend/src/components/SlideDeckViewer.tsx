import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock, ContentLayout } from '@/types/pdfLesson';

interface SlideDeckViewerProps {
  deck: SlideDeckData;
  isEditable?: boolean;
  onSave?: (updatedDeck: SlideDeckData) => void;
}

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({
  deck,
  isEditable = false,
  onSave
}) => {
  const [currentDeck, setCurrentDeck] = useState<SlideDeckData>(deck);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [draggedSlide, setDraggedSlide] = useState<number | null>(null);
  const [dragOverSlide, setDragOverSlide] = useState<number | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<{slideIndex: number, blockIndex: number, position: 'top' | 'bottom' | 'left' | 'right'} | null>(null);
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
    const newSlide: DeckSlide = {
      slideId: newSlideId,
      slideNumber: insertIndex + 1,
      slideTitle: 'Click to edit title',
      contentBlocks: [
        {
          type: 'paragraph',
          text: 'Click to add content',
          layout: { position: 'center', width: 'full' }
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

    if (selectedSlide >= slideIndex && selectedSlide > 0) {
      setSelectedSlide(selectedSlide - 1);
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

  // Slide drag and drop
  const handleSlideDragStart = (e: React.DragEvent, slideIndex: number) => {
    setDraggedSlide(slideIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlideDragOver = (e: React.DragEvent, slideIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlide(slideIndex);
  };

  const handleSlideDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSlide === null || draggedSlide === targetIndex) {
      setDraggedSlide(null);
      setDragOverSlide(null);
      return;
    }

    const slides = [...currentDeck.slides];
    const draggedSlideData = slides[draggedSlide];
    
    // Remove dragged slide
    slides.splice(draggedSlide, 1);
    
    // Insert at new position
    const insertIndex = draggedSlide < targetIndex ? targetIndex - 1 : targetIndex;
    slides.splice(insertIndex, 0, draggedSlideData);
    
    // Renumber slides
    const renumberedSlides = slides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    setCurrentDeck({
      ...currentDeck,
      slides: renumberedSlides
    });

    setSelectedSlide(insertIndex);
    setDraggedSlide(null);
    setDragOverSlide(null);
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

  const addContentBlock = (slideIndex: number, type: AnyContentBlock['type'], position?: 'left' | 'right' | 'center', afterIndex?: number) => {
    const slide = currentDeck.slides[slideIndex];
    let newBlock: AnyContentBlock;
    
    const layout: ContentLayout = {
      position: position || 'center',
      width: (position === 'left' || position === 'right' ? 'half' : 'full') as 'full' | 'half'
    };
    
    switch (type) {
      case 'headline':
        newBlock = { 
          type: 'headline', 
          text: 'Click to edit headline', 
          level: 2,
          layout 
        };
        break;
      case 'paragraph':
        newBlock = { 
          type: 'paragraph', 
          text: 'Click to edit paragraph',
          layout 
        };
        break;
      case 'bullet_list':
        newBlock = { 
          type: 'bullet_list', 
          items: ['Click to edit'],
          layout 
        };
        break;
      case 'numbered_list':
        newBlock = { 
          type: 'numbered_list', 
          items: ['Click to edit'],
          layout 
        };
        break;
      case 'alert':
        newBlock = { 
          type: 'alert', 
          text: 'Click to edit alert',
          alertType: 'info',
          title: 'Alert Title',
          layout 
        };
        break;
      default:
        newBlock = { 
          type: 'paragraph', 
          text: 'Click to edit',
          layout 
        };
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
    
    // Ensure layout has proper defaults
    const defaultLayout: ContentLayout = { position: 'center', width: 'full' };
    const blockLayout = (blockToDuplicate as any).layout || defaultLayout;
    
    updatedBlocks.splice(blockIndex + 1, 0, { 
      ...blockToDuplicate,
      layout: { 
        position: blockLayout.position || 'center',
        width: blockLayout.width || 'full'
      } as ContentLayout
    });

    const updatedSlide = {
      ...slide,
      contentBlocks: updatedBlocks
    };
    handleSlideUpdate(slideIndex, updatedSlide);
  };

  const moveBlockToPosition = (slideIndex: number, blockIndex: number, newPosition: 'left' | 'right' | 'center') => {
    const slide = currentDeck.slides[slideIndex];
    const block = slide.contentBlocks[blockIndex];
    const updatedBlock = {
      ...block,
      layout: {
        position: newPosition,
        width: (newPosition === 'center' ? 'full' : 'half') as 'full' | 'half'
      } as ContentLayout
    };
    updateContentBlock(slideIndex, blockIndex, updatedBlock);
  };

  // Content block drag and drop with positioning
  const handleBlockDragStart = (e: React.DragEvent, slideIndex: number, blockIndex: number) => {
    setDraggedBlock({ slideIndex, blockIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (e: React.DragEvent, slideIndex: number, blockIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    
    let position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    
    if (y < height * 0.25) position = 'top';
    else if (y > height * 0.75) position = 'bottom';
    else if (x < width * 0.5) position = 'left';
    else position = 'right';
    
    setDragOverBlock({ slideIndex, blockIndex, position });
  };

  const handleBlockDrop = (e: React.DragEvent, targetSlideIndex: number, targetBlockIndex: number) => {
    e.preventDefault();
    if (!draggedBlock || !dragOverBlock) return;

    const { slideIndex: sourceSlideIndex, blockIndex: sourceBlockIndex } = draggedBlock;
    const { position } = dragOverBlock;
    
    if (sourceSlideIndex === targetSlideIndex && sourceBlockIndex === targetBlockIndex) {
      setDraggedBlock(null);
      setDragOverBlock(null);
      return;
    }

    // Get the block being moved
    const sourceSlide = currentDeck.slides[sourceSlideIndex];
    const blockToMove = { ...sourceSlide.contentBlocks[sourceBlockIndex] };

    // Update layout based on drop position
    if (position === 'left' || position === 'right') {
      blockToMove.layout = {
        position: position,
        width: 'half'
      } as ContentLayout;
    }

    // Remove from source
    const updatedSourceBlocks = sourceSlide.contentBlocks.filter((_, index) => index !== sourceBlockIndex);
    
    // Add to target
    const targetSlide = currentDeck.slides[targetSlideIndex];
    const updatedTargetBlocks = [...(sourceSlideIndex === targetSlideIndex ? updatedSourceBlocks : targetSlide.contentBlocks)];
    
    let insertIndex = targetBlockIndex;
    if (position === 'bottom') insertIndex = targetBlockIndex + 1;
    if (sourceSlideIndex === targetSlideIndex && sourceBlockIndex < targetBlockIndex) {
      insertIndex = insertIndex - 1;
    }
    
    updatedTargetBlocks.splice(insertIndex, 0, blockToMove);

    // Update slides
    const updatedSlides = currentDeck.slides.map((slide, index) => {
      if (index === sourceSlideIndex) {
        return { ...slide, contentBlocks: sourceSlideIndex === targetSlideIndex ? updatedTargetBlocks : updatedSourceBlocks };
      }
      if (index === targetSlideIndex && sourceSlideIndex !== targetSlideIndex) {
        return { ...slide, contentBlocks: updatedTargetBlocks };
      }
      return slide;
    });

    setCurrentDeck({
      ...currentDeck,
      slides: updatedSlides
    });

    setDraggedBlock(null);
    setDragOverBlock(null);
  };

  const renderContentBlock = (block: AnyContentBlock, slideIndex: number, blockIndex: number): React.ReactNode => {
    const isEditing = editingBlock?.slideIndex === slideIndex && editingBlock?.blockIndex === blockIndex;
    const isDragOver = dragOverBlock?.slideIndex === slideIndex && dragOverBlock?.blockIndex === blockIndex;
    const isDragging = draggedBlock?.slideIndex === slideIndex && draggedBlock?.blockIndex === blockIndex;
    
    const layout = (block as any).layout || { position: 'center', width: 'full' };
    
    const blockClasses = [
      'content-block-smart',
      `position-${layout.position}`,
      `width-${layout.width}`,
      isDragOver ? `drag-over-${dragOverBlock?.position}` : '',
      isDragging ? 'dragging' : '',
      isEditable ? 'editable' : ''
    ].filter(Boolean).join(' ');

    if (isEditing) {
      return (
        <div key={blockIndex} className={blockClasses}>
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
              className: `smart-headline level-${level}`,
              style: {
                color: headlineBlock.textColor || '#2c3e50',
                backgroundColor: headlineBlock.backgroundColor || 'transparent',
              }
            },
            headlineBlock.text
          );

        case 'paragraph':
          const paragraphBlock = block as any;
          return React.createElement('p', {
            className: 'smart-paragraph'
          }, paragraphBlock.text);

        case 'bullet_list':
          const bulletBlock = block as any;
          return React.createElement('ul', {
            className: 'smart-bullet-list'
          }, bulletBlock.items.map((item: any, itemIndex: number) => 
            React.createElement('li', {
              key: itemIndex,
              className: 'smart-list-item'
            }, typeof item === 'string' ? item : JSON.stringify(item))
          ));

        case 'numbered_list':
          const numberedBlock = block as any;
          return React.createElement('ol', {
            className: 'smart-numbered-list'
          }, numberedBlock.items.map((item: any, itemIndex: number) => 
            React.createElement('li', {
              key: itemIndex,
              className: 'smart-list-item'
            }, typeof item === 'string' ? item : JSON.stringify(item))
          ));

        case 'alert':
          const alertBlock = block as any;
          return React.createElement('div', {
            className: `smart-alert alert-${alertBlock.alertType}`
          }, [
            alertBlock.title && React.createElement('div', {
              key: 'title',
              className: 'alert-title'
            }, alertBlock.title),
            React.createElement('div', {
              key: 'text',
              className: 'alert-text'
            }, alertBlock.text)
          ].filter(Boolean));

        default:
          return React.createElement('div', {
            className: 'unknown-block'
          }, `Unsupported block type: ${(block as any).type}`);
      }
    })();

    return (
      <div 
        key={blockIndex} 
        className={blockClasses}
        draggable={isEditable && !isEditing}
        onDragStart={(e) => handleBlockDragStart(e, slideIndex, blockIndex)}
        onDragOver={(e) => handleBlockDragOver(e, slideIndex, blockIndex)}
        onDragLeave={() => setDragOverBlock(null)}
        onDrop={(e) => handleBlockDrop(e, slideIndex, blockIndex)}
        onClick={() => {
          if (isEditable && isEditing && editingBlock?.slideIndex !== slideIndex || editingBlock?.blockIndex !== blockIndex) {
            setEditingBlock({ slideIndex, blockIndex });
          }
        }}
      >
        {blockContent}
        {isEditable && isEditing && (
          <div className="block-controls">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                moveBlockToPosition(slideIndex, blockIndex, 'left');
              }}
              className="position-btn left"
              title="Move left"
            >
              ←
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                moveBlockToPosition(slideIndex, blockIndex, 'center');
              }}
              className="position-btn center"
              title="Center"
            >
              ↕
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                moveBlockToPosition(slideIndex, blockIndex, 'right');
              }}
              className="position-btn right"
              title="Move right"
            >
              →
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                duplicateContentBlock(slideIndex, blockIndex);
              }}
              className="block-control-btn duplicate"
              title="Duplicate"
            >
              ⧉
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteContentBlock(slideIndex, blockIndex);
              }}
              className="block-control-btn delete"
              title="Delete"
            >
              ×
            </button>
            <div className="drag-handle" title="Drag to reorder">
              ⋮⋮
            </div>
          </div>
        )}
      </div>
    );
  };

  const scrollToSlide = (slideIndex: number) => {
    const slideElement = document.getElementById(`slide-${slideIndex}`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setSelectedSlide(slideIndex);
  };

  return (
    <div className="slide-deck-gamma-layout">
      {/* Left Sidebar Menu */}
      <div className="slides-sidebar">
        <div className="sidebar-header">
          <h3>{currentDeck.lessonTitle}</h3>
          <span className="slide-count">{currentDeck.slides.length} slides</span>
        </div>
        
        <div className="slides-menu">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className={`slide-menu-item ${index === selectedSlide ? 'active' : ''} ${draggedSlide === index ? 'dragging' : ''} ${dragOverSlide === index ? 'drag-over' : ''}`}
              draggable={isEditable && isEditing}
              onDragStart={(e) => handleSlideDragStart(e, index)}
              onDragOver={(e) => handleSlideDragOver(e, index)}
              onDragLeave={() => setDragOverSlide(null)}
              onDrop={(e) => handleSlideDrop(e, index)}
              onClick={() => scrollToSlide(index)}
            >
              <div className="slide-thumbnail">
                <div className="slide-number">{slide.slideNumber}</div>
                <div className="slide-preview">
                  <div className="slide-title-preview">{slide.slideTitle}</div>
                  <div className="slide-content-preview">
                    {slide.contentBlocks.slice(0, 2).map((block, idx) => (
                      <div key={idx} className={`preview-block ${block.type}`}>
                        {block.type === 'headline' ? '■' : 
                         block.type === 'bullet_list' ? '• • •' :
                         block.type === 'numbered_list' ? '1 2 3' :
                         '—'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {isEditable && isEditing && (
                <div className="slide-menu-controls">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewSlide(index);
                    }}
                    className="menu-btn add"
                    title="Add slide after"
                  >
                    +
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="menu-btn duplicate"
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
                      className="menu-btn delete"
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

      {/* Main Content Area */}
      <div className="slides-main-content">
        <div className="slides-container-smart">
          {currentDeck.slides.map((slide, slideIndex) => (
            <div 
              key={slide.slideId} 
              id={`slide-${slideIndex}`}
              className="slide-item-smart"
              onClick={() => setSelectedSlide(slideIndex)}
            >
              <div className="slide-content-smart">
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
                    className="slide-title-input-smart"
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="slide-title-smart"
                    onClick={() => {
                      if (isEditable && isEditing) {
                        setEditingTitle(slideIndex);
                      }
                    }}
                  >
                    {slide.slideTitle}
                  </h1>
                )}
                
                <div className="slide-body-smart">
                  {slide.contentBlocks.map((block, blockIndex) => 
                    renderContentBlock(block, slideIndex, blockIndex)
                  )}
                  
                  {/* Add content zone */}
                  {isEditable && isEditing && (
                    <div className="add-content-zone-smart">
                      <div className="add-content-grid">
                        <button onClick={() => addContentBlock(slideIndex, 'headline')}>+ Headline</button>
                        <button onClick={() => addContentBlock(slideIndex, 'paragraph')}>+ Text</button>
                        <button onClick={() => addContentBlock(slideIndex, 'bullet_list')}>+ Bullets</button>
                        <button onClick={() => addContentBlock(slideIndex, 'numbered_list')}>+ Numbers</button>
                        <button onClick={() => addContentBlock(slideIndex, 'alert')}>+ Alert</button>
                        <button onClick={() => addContentBlock(slideIndex, 'paragraph', 'left')}>+ Left Text</button>
                        <button onClick={() => addContentBlock(slideIndex, 'paragraph', 'right')}>+ Right Text</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simplified Inline Content Editor (no save/cancel buttons)
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
        <div className="inline-editor-smart headline-editor">
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
        <div className="inline-editor-smart paragraph-editor">
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
        <div className="inline-editor-smart list-editor">
          <div className="list-items-smart">
            {listBlock.items.map((item: string, index: number) => (
              <div key={index} className="list-item-editor-smart">
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
        <div className="inline-editor-smart alert-editor">
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
        <div className="inline-editor-smart">
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