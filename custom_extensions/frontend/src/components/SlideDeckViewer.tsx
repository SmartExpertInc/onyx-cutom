import React, { useState, useEffect, useRef } from 'react';
import { SlideDeckData, DeckSlide, AnyContentBlock, BlockPosition } from '@/types/pdfLesson';

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
  const [draggedBlock, setDraggedBlock] = useState<{slideIndex: number, blockIndex: number} | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Update deck when prop changes
  useEffect(() => {
    setCurrentDeck(deck);
  }, [deck]);

  const handleSave = () => {
    if (onSave) {
      onSave(currentDeck);
    }
    setIsEditing(false);
    setEditingBlock(null);
  };

  const addNewSlide = (afterIndex?: number) => {
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : currentDeck.slides.length;
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: DeckSlide = {
      slideId: newSlideId,
      slideNumber: insertIndex + 1,
      contentBlocks: [
        {
          type: 'headline',
          text: 'Click to edit title',
          level: 2,
          position: { x: 50, y: 20 }
        },
        {
          type: 'paragraph',
          text: 'Click to add content',
          position: { x: 30, y: 50 }
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

  const updateContentBlock = (slideIndex: number, blockIndex: number, updatedBlock: AnyContentBlock) => {
    const slide = currentDeck.slides[slideIndex];
    const updatedSlide = {
      ...slide,
      contentBlocks: slide.contentBlocks.map((block, index) =>
        index === blockIndex ? updatedBlock : block
      )
    };
    
    const updatedDeck = {
      ...currentDeck,
      slides: currentDeck.slides.map((s, index) =>
        index === slideIndex ? updatedSlide : s
      )
    };
    setCurrentDeck(updatedDeck);
  };

  const updateBlockPosition = (slideIndex: number, blockIndex: number, position: BlockPosition) => {
    const slide = currentDeck.slides[slideIndex];
    const updatedBlock = {
      ...slide.contentBlocks[blockIndex],
      position
    };
    updateContentBlock(slideIndex, blockIndex, updatedBlock);
  };

  const addContentBlock = (slideIndex: number, type: AnyContentBlock['type'], position?: BlockPosition) => {
    const slide = currentDeck.slides[slideIndex];
    let newBlock: AnyContentBlock;
    
    const defaultPosition = position || { 
      x: Math.random() * 60 + 20, // Random position between 20-80%
      y: Math.random() * 60 + 20 
    };
    
    switch (type) {
      case 'headline':
        newBlock = { 
          type: 'headline', 
          text: 'Click to edit headline', 
          level: 2,
          position: defaultPosition
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
        newBlock = { 
          type: 'bullet_list', 
          items: ['Click to edit'],
          position: defaultPosition
        };
        break;
      case 'numbered_list':
        newBlock = { 
          type: 'numbered_list', 
          items: ['Click to edit'],
          position: defaultPosition
        };
        break;
      case 'alert':
        newBlock = { 
          type: 'alert', 
          text: 'Click to edit alert',
          alertType: 'info',
          title: 'Alert Title',
          position: defaultPosition
        };
        break;
      default:
        newBlock = { 
          type: 'paragraph', 
          text: 'Click to edit',
          position: defaultPosition
        };
    }

    const updatedSlide = {
      ...slide,
      contentBlocks: [...slide.contentBlocks, newBlock]
    };
    
    const updatedDeck = {
      ...currentDeck,
      slides: currentDeck.slides.map((s, index) =>
        index === slideIndex ? updatedSlide : s
      )
    };
    setCurrentDeck(updatedDeck);
  };

  const deleteContentBlock = (slideIndex: number, blockIndex: number) => {
    const slide = currentDeck.slides[slideIndex];
    const updatedSlide = {
      ...slide,
      contentBlocks: slide.contentBlocks.filter((_, index) => index !== blockIndex)
    };
    
    const updatedDeck = {
      ...currentDeck,
      slides: currentDeck.slides.map((s, index) =>
        index === slideIndex ? updatedSlide : s
      )
    };
    setCurrentDeck(updatedDeck);
  };

  // Drag and Drop handlers for free positioning
  const handleBlockMouseDown = (e: React.MouseEvent, slideIndex: number, blockIndex: number) => {
    if (!isEditable || !isEditing) return;
    
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const slideRect = (e.currentTarget as HTMLElement).closest('.slide-canvas')?.getBoundingClientRect();
    
    if (!slideRect) return;
    
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedBlock({ slideIndex, blockIndex });
    setDragOffset({ x: offsetX, y: offsetY });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!slideRect) return;
      
      const x = ((e.clientX - slideRect.left - offsetX) / slideRect.width) * 100;
      const y = ((e.clientY - slideRect.top - offsetY) / slideRect.height) * 100;
      
      // Constrain to slide bounds
      const constrainedX = Math.max(0, Math.min(90, x)); // Leave some margin
      const constrainedY = Math.max(0, Math.min(90, y));
      
      updateBlockPosition(slideIndex, blockIndex, { x: constrainedX, y: constrainedY });
    };
    
    const handleMouseUp = () => {
      setDraggedBlock(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderContentBlock = (block: AnyContentBlock, slideIndex: number, blockIndex: number): React.ReactNode => {
    const position = block.position || { x: 20, y: 20 };
    const isCurrentlyEditing = editingBlock?.slideIndex === slideIndex && editingBlock?.blockIndex === blockIndex;
    
    const blockStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${position.x}%`,
      top: `${position.y}%`,
      cursor: isEditable && isEditing ? 'move' : 'default',
      zIndex: draggedBlock?.slideIndex === slideIndex && draggedBlock?.blockIndex === blockIndex ? 1000 : 1,
      maxWidth: '300px',
      minWidth: '150px'
    };

    const handleBlockClick = () => {
      if (isEditable && isEditing && !isCurrentlyEditing) {
        setEditingBlock({ slideIndex, blockIndex });
      }
    };

    const handleBlockSave = (updatedBlock: AnyContentBlock) => {
      updateContentBlock(slideIndex, blockIndex, { ...updatedBlock, position });
      setEditingBlock(null);
    };

    const blockContent = (() => {
      switch (block.type) {
        case 'headline':
          return (
            <div className="block-content headline-block">
              {isCurrentlyEditing ? (
                <InlineContentEditor 
                  block={block} 
                  onSave={handleBlockSave}
                  onCancel={() => setEditingBlock(null)}
                />
              ) : (
                <h2 
                  className="slide-headline"
                  style={{ fontSize: `${2.5 - block.level * 0.3}rem` }}
                  onClick={handleBlockClick}
                >
                  {block.text}
                </h2>
              )}
            </div>
          );
          
        case 'paragraph':
          return (
            <div className="block-content paragraph-block">
              {isCurrentlyEditing ? (
                <InlineContentEditor 
                  block={block} 
                  onSave={handleBlockSave}
                  onCancel={() => setEditingBlock(null)}
                />
              ) : (
                <p className="slide-paragraph" onClick={handleBlockClick}>
                  {block.text}
                </p>
              )}
            </div>
          );
          
        case 'bullet_list':
          return (
            <div className="block-content list-block">
              {isCurrentlyEditing ? (
                <InlineContentEditor 
                  block={block} 
                  onSave={handleBlockSave}
                  onCancel={() => setEditingBlock(null)}
                />
              ) : (
                <ul className="slide-list" onClick={handleBlockClick}>
                  {block.items.map((item, idx) => (
                    <li key={idx} className="slide-list-item">
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
          
        case 'numbered_list':
          return (
            <div className="block-content list-block">
              {isCurrentlyEditing ? (
                <InlineContentEditor 
                  block={block} 
                  onSave={handleBlockSave}
                  onCancel={() => setEditingBlock(null)}
                />
              ) : (
                <ol className="slide-list" onClick={handleBlockClick}>
                  {block.items.map((item, idx) => (
                    <li key={idx} className="slide-list-item">
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
          
        case 'alert':
          return (
            <div className="block-content alert-block">
              {isCurrentlyEditing ? (
                <InlineContentEditor 
                  block={block} 
                  onSave={handleBlockSave}
                  onCancel={() => setEditingBlock(null)}
                />
              ) : (
                <div 
                  className={`slide-alert alert-${block.alertType}`}
                  onClick={handleBlockClick}
                >
                  {block.title && <h4>{block.title}</h4>}
                  <p>{block.text}</p>
                </div>
              )}
            </div>
          );
          
        default:
          return (
            <div className="block-content" onClick={handleBlockClick}>
              <p>Unknown block type</p>
            </div>
          );
      }
    })();

    return (
      <div
        key={`${slideIndex}-${blockIndex}`}
        className={`slide-block ${isCurrentlyEditing ? 'editing' : ''}`}
        style={blockStyle}
        onMouseDown={(e) => handleBlockMouseDown(e, slideIndex, blockIndex)}
      >
        {blockContent}
        {isEditable && isEditing && !isCurrentlyEditing && (
          <div className="block-controls">
            <button 
              className="block-control-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteContentBlock(slideIndex, blockIndex);
              }}
              title="Delete block"
            >
              ×
            </button>
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
  };

  const getSlideTitle = (slide: DeckSlide): string => {
    // Find the first headline block to use as title
    const titleBlock = slide.contentBlocks.find(block => block.type === 'headline');
    return titleBlock?.type === 'headline' ? titleBlock.text : `Slide ${slide.slideNumber}`;
  };

  return (
    <div className="slide-deck-viewer-with-sidebar">
      {/* Sidebar */}
      <div className="slide-deck-sidebar">
        <div className="sidebar-header">
          <h3>{currentDeck.lessonTitle}</h3>
          {isEditable && (
            <button
              className="add-slide-sidebar"
              onClick={() => addNewSlide()}
              title="Add new slide"
            >
              + Add Slide
            </button>
          )}
        </div>
        
        <div className="sidebar-slides">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className="sidebar-slide-item"
              onClick={() => scrollToSlide(index)}
            >
              <div className="sidebar-slide-number">{slide.slideNumber}</div>
              <div className="sidebar-slide-title">{getSlideTitle(slide)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="slide-deck-main">
        {/* Header */}
        <div className="slide-deck-header">
          <div className="deck-title">
            <h1>{currentDeck.lessonTitle}</h1>
            <span className="slide-counter">
              {currentDeck.slides.length} slide{currentDeck.slides.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="deck-controls">
            {isEditable && (
              <>
                <button
                  className={`edit-toggle ${isEditing ? 'active' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </button>
                {isEditing && (
                  <button
                    className="save-deck"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Slides */}
        <div className="slides-container-full-height">
          {currentDeck.slides.map((slide, slideIndex) => (
            <div
              key={slide.slideId}
              id={`slide-${slideIndex}`}
              className="slide-item-vertical"
            >
              <div className="slide-number-badge">{slide.slideNumber}</div>
              
              {/* Slide Canvas - Free positioning area */}
              <div className="slide-canvas">
                {slide.contentBlocks.map((block, blockIndex) =>
                  renderContentBlock(block, slideIndex, blockIndex)
                )}
                
                {/* Add content zone */}
                {isEditable && isEditing && (
                  <div className="add-content-zone">
                    <div className="add-content-buttons">
                      <button onClick={() => addContentBlock(slideIndex, 'headline')}>+ Headline</button>
                      <button onClick={() => addContentBlock(slideIndex, 'paragraph')}>+ Paragraph</button>
                      <button onClick={() => addContentBlock(slideIndex, 'bullet_list')}>+ Bullet List</button>
                      <button onClick={() => addContentBlock(slideIndex, 'numbered_list')}>+ Numbered List</button>
                      <button onClick={() => addContentBlock(slideIndex, 'alert')}>+ Alert</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Controls */}
              {isEditable && isEditing && (
                <div className="slide-controls">
                  <button
                    className="slide-control-btn add"
                    onClick={() => addNewSlide(slideIndex)}
                    title="Add slide after this one"
                  >
                    + Add
                  </button>
                  <button
                    className="slide-control-btn duplicate"
                    onClick={() => duplicateSlide(slideIndex)}
                    title="Duplicate slide"
                  >
                    ⧉ Duplicate
                  </button>
                  {currentDeck.slides.length > 1 && (
                    <button
                      className="slide-control-btn delete"
                      onClick={() => deleteSlide(slideIndex)}
                      title="Delete slide"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
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

  const renderEditor = () => {
    switch (block.type) {
      case 'headline':
        return (
          <div className="inline-editor">
            <input
              type="text"
              value={editedBlock.type === 'headline' ? editedBlock.text : ''}
              onChange={(e) => setEditedBlock({ ...editedBlock, text: e.target.value } as AnyContentBlock)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
              placeholder="Enter headline..."
            />
          </div>
        );

      case 'paragraph':
        return (
          <div className="inline-editor">
            <textarea
              value={editedBlock.type === 'paragraph' ? editedBlock.text : ''}
              onChange={(e) => setEditedBlock({ ...editedBlock, text: e.target.value } as AnyContentBlock)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
              placeholder="Enter paragraph text..."
              rows={3}
            />
          </div>
        );

      case 'bullet_list':
      case 'numbered_list':
        const listBlock = editedBlock as any; // Type assertion for list blocks
        return (
          <div className="inline-editor list-editor">
            <div className="list-items">
              {listBlock.items.map((item: any, index: number) => (
                <div key={index} className="list-item-editor">
                  <input
                    type="text"
                    value={typeof item === 'string' ? item : ''}
                    onChange={(e) => {
                      const newItems = [...listBlock.items];
                      newItems[index] = e.target.value;
                      setEditedBlock({ ...listBlock, items: newItems });
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Item ${index + 1}...`}
                  />
                  <button
                    className="remove-item"
                    onClick={() => {
                      const newItems = listBlock.items.filter((_: any, i: number) => i !== index);
                      setEditedBlock({ ...listBlock, items: newItems });
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-item"
              onClick={() => {
                const newItems = [...listBlock.items, ''];
                setEditedBlock({ ...listBlock, items: newItems });
              }}
            >
              + Add Item
            </button>
          </div>
        );

      case 'alert':
        return (
          <div className="inline-editor alert-editor">
            <input
              type="text"
              value={editedBlock.type === 'alert' ? (editedBlock.title || '') : ''}
              onChange={(e) => setEditedBlock({ ...editedBlock, title: e.target.value } as AnyContentBlock)}
              onKeyDown={handleKeyDown}
              placeholder="Alert title..."
            />
            <textarea
              value={editedBlock.type === 'alert' ? editedBlock.text : ''}
              onChange={(e) => setEditedBlock({ ...editedBlock, text: e.target.value } as AnyContentBlock)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="Alert text..."
              rows={2}
            />
          </div>
        );

      default:
        return <div>Unsupported block type for editing</div>;
    }
  };

  return renderEditor();
};

export default SlideDeckViewer; 