import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';

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
  const [draggedBlock, setDraggedBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);

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
          text: 'Click to add content'
        }
      ]
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
        newBlock = { type: 'headline', text: 'Click to edit headline', level: 2 };
        break;
      case 'paragraph':
        newBlock = { type: 'paragraph', text: 'Click to edit paragraph' };
        break;
      case 'bullet_list':
        newBlock = { type: 'bullet_list', items: ['Click to edit'] };
        break;
      case 'numbered_list':
        newBlock = { type: 'numbered_list', items: ['Click to edit'] };
        break;
      case 'alert':
        newBlock = { 
          type: 'alert', 
          text: 'Click to edit alert',
          alertType: 'info',
          title: 'Alert Title'
        };
        break;
      default:
        newBlock = { type: 'paragraph', text: 'Click to edit' };
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
    e.dataTransfer.dropEffect = 'move';
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

    // Get the block being moved
    const sourceSlide = currentDeck.slides[sourceSlideIndex];
    const blockToMove = sourceSlide.contentBlocks[sourceBlockIndex];

    // Remove from source
    const updatedSourceBlocks = sourceSlide.contentBlocks.filter((_, index) => index !== sourceBlockIndex);
    
    // Add to target
    const targetSlide = currentDeck.slides[targetSlideIndex];
    const updatedTargetBlocks = [...(sourceSlideIndex === targetSlideIndex ? updatedSourceBlocks : targetSlide.contentBlocks)];
    
    const insertIndex = sourceSlideIndex === targetSlideIndex && sourceBlockIndex < targetBlockIndex 
      ? targetBlockIndex - 1 
      : targetBlockIndex;
    
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

    const blockProps = {
      className: `content-block-editable ${isDragOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''}`,
      draggable: isEditable && !isEditing,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, slideIndex, blockIndex),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, slideIndex, blockIndex),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, slideIndex, blockIndex),
      onClick: () => {
        if (isEditable) {
          setEditingBlock({ slideIndex, blockIndex });
        }
      }
    };

    if (isEditing) {
      return (
        <div key={blockIndex} className="content-block-editor">
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
              style: {
                color: headlineBlock.textColor || '#2c3e50',
                backgroundColor: headlineBlock.backgroundColor || 'transparent',
                margin: '0.8em 0 0.5em 0',
                fontSize: level === 1 ? '2.2em' : level === 2 ? '1.8em' : level === 3 ? '1.4em' : '1.2em',
                fontWeight: level <= 2 ? '700' : '600',
                lineHeight: '1.3',
              }
            },
            headlineBlock.text
          );

        case 'paragraph':
          const paragraphBlock = block as any;
          return React.createElement('p', {
            style: {
              margin: '0.8em 0',
              lineHeight: '1.6',
              fontSize: '1.1em',
              color: '#34495e',
              textAlign: 'left',
            }
          }, paragraphBlock.text);

        case 'bullet_list':
          const bulletBlock = block as any;
          return React.createElement('ul', {
            style: {
              margin: '1em 0',
              paddingLeft: '1.5em',
              fontSize: '1.05em',
              lineHeight: '1.5',
              color: '#34495e',
            }
          }, bulletBlock.items.map((item: any, itemIndex: number) => 
            React.createElement('li', {
              key: itemIndex,
              style: { 
                margin: '0.4em 0',
                listStyleType: 'disc',
              }
            }, typeof item === 'string' ? item : JSON.stringify(item))
          ));

        case 'numbered_list':
          const numberedBlock = block as any;
          return React.createElement('ol', {
            style: {
              margin: '1em 0',
              paddingLeft: '1.5em',
              fontSize: '1.05em',
              lineHeight: '1.5',
              color: '#34495e',
            }
          }, numberedBlock.items.map((item: any, itemIndex: number) => 
            React.createElement('li', {
              key: itemIndex,
              style: { 
                margin: '0.4em 0',
                listStyleType: 'decimal',
              }
            }, typeof item === 'string' ? item : JSON.stringify(item))
          ));

        case 'alert':
          const alertBlock = block as any;
          const alertStyles = {
            info: { bg: '#e7f3ff', border: '#007bff', color: '#004085' },
            warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
            danger: { bg: '#f8d7da', border: '#dc3545', color: '#721c24' },
            success: { bg: '#d4edda', border: '#28a745', color: '#155724' },
          };
          const alertStyle = alertStyles[alertBlock.alertType as keyof typeof alertStyles] || alertStyles.info;
          
          return React.createElement('div', {
            style: {
              backgroundColor: alertBlock.backgroundColor || alertStyle.bg,
              borderLeft: `4px solid ${alertBlock.borderColor || alertStyle.border}`,
              color: alertBlock.textColor || alertStyle.color,
              padding: '1em',
              margin: '1em 0',
              borderRadius: '4px',
              fontSize: '1em',
              lineHeight: '1.4',
            }
          }, [
            alertBlock.title && React.createElement('div', {
              key: 'title',
              style: { fontWeight: 'bold', marginBottom: '0.3em' }
            }, alertBlock.title),
            React.createElement('div', {
              key: 'text'
            }, alertBlock.text)
          ].filter(Boolean));

        default:
          return React.createElement('div', {
            style: {
              backgroundColor: '#f8f9fa',
              padding: '0.8em',
              border: '2px dashed #dee2e6',
              margin: '0.8em 0',
              borderRadius: '4px',
              fontSize: '0.9em',
              color: '#6c757d',
            }
          }, `Unsupported block type: ${(block as any).type}`);
      }
    })();

    return (
      <div key={blockIndex} {...blockProps}>
        {blockContent}
        {isEditable && (
          <div className="block-controls">
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

  return (
    <div className="slide-deck-viewer-with-sidebar">
      {/* Vertical Menu Bar */}
      <div className="slide-deck-sidebar">
        <div className="sidebar-header">
          <h3>Slides</h3>
          {isEditable && (
            <button
              onClick={() => addNewSlide()}
              className="add-slide-sidebar"
              title="Add new slide"
            >
              +
            </button>
          )}
        </div>
        <div className="sidebar-slides">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className="sidebar-slide-item"
              onClick={() => {
                const element = document.getElementById(`slide-${index}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div className="sidebar-slide-number">{slide.slideNumber}</div>
              <div className="sidebar-slide-title">{slide.slideTitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="slide-deck-main">
        {/* Header */}
        <div className="slide-deck-header">
          <div className="deck-title">
            <h1>{currentDeck.lessonTitle}</h1>
            <span className="slide-counter">
              {currentDeck.slides.length} slide{currentDeck.slides.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {isEditable && (
            <div className="deck-controls">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`edit-toggle ${isEditing ? 'active' : ''}`}
              >
                {isEditing ? 'Preview' : 'Edit'}
              </button>
              {isEditing && (
                <button onClick={handleSave} className="save-deck">
                  Save Changes
                </button>
              )}
            </div>
          )}
        </div>

        {/* Full-height slides container */}
        <div className="slides-container-full-height">
          <div className="slides-presentation-view">
            {currentDeck.slides.map((slide, slideIndex) => (
              <div key={slide.slideId} id={`slide-${slideIndex}`} className="slide-item-vertical">
                <div className="slide-number-badge">
                  {slide.slideNumber}
                </div>
                
                {/* Slide controls */}
                {isEditable && isEditing && (
                  <div className="slide-controls">
                    <button 
                      onClick={() => addNewSlide(slideIndex)}
                      className="slide-control-btn add"
                      title="Add slide after"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => duplicateSlide(slideIndex)}
                      className="slide-control-btn duplicate"
                      title="Duplicate slide"
                    >
                      ⧉
                    </button>
                    {currentDeck.slides.length > 1 && (
                      <button 
                        onClick={() => deleteSlide(slideIndex)}
                        className="slide-control-btn delete"
                        title="Delete slide"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

                <div className="slide-content-vertical">
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
                      className="slide-title-editor-input"
                      autoFocus
                    />
                  ) : (
                    <h1 
                      className="slide-title-vertical"
                      onClick={() => {
                        if (isEditable && isEditing) {
                          setEditingTitle(slideIndex);
                        }
                      }}
                    >
                      {slide.slideTitle}
                    </h1>
                  )}
                  
                  <div className="slide-body-vertical">
                    {slide.contentBlocks.map((block, blockIndex) => 
                      renderContentBlock(block, slideIndex, blockIndex)
                    )}
                    
                    {/* Add content buttons */}
                    {isEditable && isEditing && (
                      <div className="add-content-zone">
                        <div className="add-content-buttons">
                          <button onClick={() => addContentBlock(slideIndex, 'headline')}>+ Headline</button>
                          <button onClick={() => addContentBlock(slideIndex, 'paragraph')}>+ Text</button>
                          <button onClick={() => addContentBlock(slideIndex, 'bullet_list')}>+ Bullets</button>
                          <button onClick={() => addContentBlock(slideIndex, 'numbered_list')}>+ Numbers</button>
                          <button onClick={() => addContentBlock(slideIndex, 'alert')}>+ Alert</button>
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
    </div>
  );
};

// Inline Content Editor Component
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

  switch (block.type) {
    case 'headline':
      const headlineBlock = editedBlock as any;
      return (
        <div className="inline-editor headline-editor">
          <div className="editor-controls">
            <select
              value={headlineBlock.level || 2}
              onChange={(e) => setEditedBlock({ ...headlineBlock, level: parseInt(e.target.value) })}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
          </div>
          <input
            type="text"
            value={headlineBlock.text}
            onChange={(e) => setEditedBlock({ ...headlineBlock, text: e.target.value })}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter headline..."
            autoFocus
          />
        </div>
      );

    case 'paragraph':
      const paragraphBlock = editedBlock as any;
      return (
        <div className="inline-editor paragraph-editor">
          <textarea
            value={paragraphBlock.text}
            onChange={(e) => setEditedBlock({ ...paragraphBlock, text: e.target.value })}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter text..."
            autoFocus
            rows={3}
          />
        </div>
      );

    case 'bullet_list':
    case 'numbered_list':
      const listBlock = editedBlock as any;
      return (
        <div className="inline-editor list-editor">
          <div className="list-items">
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
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  placeholder="List item..."
                />
                <button
                  onClick={() => {
                    const newItems = listBlock.items.filter((_: any, i: number) => i !== index);
                    setEditedBlock({ ...listBlock, items: newItems });
                  }}
                  className="remove-item"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...listBlock.items, ''];
                setEditedBlock({ ...listBlock, items: newItems });
              }}
              className="add-item"
            >
              + Add item
            </button>
          </div>
        </div>
      );

    case 'alert':
      const alertBlock = editedBlock as any;
      return (
        <div className="inline-editor alert-editor">
          <div className="editor-controls">
            <select
              value={alertBlock.alertType || 'info'}
              onChange={(e) => setEditedBlock({ ...alertBlock, alertType: e.target.value })}
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
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Alert title..."
          />
          <textarea
            value={alertBlock.text}
            onChange={(e) => setEditedBlock({ ...alertBlock, text: e.target.value })}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Alert message..."
            rows={2}
          />
        </div>
      );

    default:
      return (
        <div className="inline-editor">
          <button onClick={onCancel}>Cancel</button>
        </div>
      );
  }
};

export default SlideDeckViewer; 