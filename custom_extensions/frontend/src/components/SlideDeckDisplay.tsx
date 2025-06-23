"use client";

import React, { useState, useEffect } from 'react';
import { SlideDeckData, DeckSlide, ContentBlockWithPosition } from '../types/pdfLesson';
import '../styles/slideDeck.css';

interface SlideDeckDisplayProps {
  data: SlideDeckData;
  onUpdate?: (updatedData: SlideDeckData) => void;
}

const SlideDeckDisplay: React.FC<SlideDeckDisplayProps> = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{ blockIndex: number; slideId: string } | null>(null);
  const [draggedSlide, setDraggedSlide] = useState<string | null>(null);
  const [currentSlideId, setCurrentSlideId] = useState<string>(data.slides[0]?.slideId || '');
  const [slides, setSlides] = useState<DeckSlide[]>(data.slides);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  // Initialize content blocks with proper positioning
  useEffect(() => {
    const updatedSlides = slides.map(slide => ({
      ...slide,
      contentBlocks: slide.contentBlocks.map((block, index) => ({
        ...block,
        position: block.position || {
          x: 50 + (index % 3) * 250,
          y: 50 + Math.floor(index / 3) * 150,
          width: 200,
          height: 120
        }
      }))
    }));
    setSlides(updatedSlides);
  }, []);

  const updateSlides = (newSlides: DeckSlide[]) => {
    setSlides(newSlides);
    if (onUpdate) {
      onUpdate({
        ...data,
        slides: newSlides,
        currentSlideId: currentSlideId
      });
    }
  };

  const addSlide = (afterSlideId?: string) => {
    const newSlideId = `slide-${Date.now()}`;
    const insertIndex = afterSlideId 
      ? slides.findIndex(s => s.slideId === afterSlideId) + 1 
      : slides.length;
    
    const newSlide: DeckSlide = {
      slideId: newSlideId,
      slideNumber: insertIndex + 1,
      slideTitle: `New Slide ${insertIndex + 1}`,
      contentBlocks: []
    };

    const newSlides = [...slides];
    newSlides.splice(insertIndex, 0, newSlide);
    
    // Renumber slides
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    updateSlides(renumberedSlides);
    setCurrentSlideId(newSlideId);
  };

  const duplicateSlide = (slideId: string) => {
    const slideIndex = slides.findIndex(s => s.slideId === slideId);
    if (slideIndex === -1) return;

    const originalSlide = slides[slideIndex];
    const newSlideId = `slide-${Date.now()}`;
    const duplicatedSlide: DeckSlide = {
      ...originalSlide,
      slideId: newSlideId,
      slideNumber: slideIndex + 2,
      slideTitle: `${originalSlide.slideTitle} (Copy)`,
      contentBlocks: originalSlide.contentBlocks.map((block) => ({
        ...block,
        position: block.position ? {
          ...block.position,
          x: block.position.x + 10,
          y: block.position.y + 10
        } : undefined
      }))
    };

    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide);
    
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    updateSlides(renumberedSlides);
  };

  const deleteSlide = (slideId: string) => {
    if (slides.length <= 1) return;
    
    const newSlides = slides.filter(s => s.slideId !== slideId);
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));

    updateSlides(renumberedSlides);
    
    if (currentSlideId === slideId) {
      setCurrentSlideId(renumberedSlides[0]?.slideId || '');
    }
  };

  const updateSlideTitle = (slideId: string, newTitle: string) => {
    const newSlides = slides.map(slide =>
      slide.slideId === slideId
        ? { ...slide, slideTitle: newTitle }
        : slide
    );
    updateSlides(newSlides);
  };

  const addContentBlock = (slideId: string, type: ContentBlockWithPosition['type']) => {
    const slide = slides.find(s => s.slideId === slideId);
    if (!slide) return;

    const existingBlocks = slide.contentBlocks.length;
    
    const newBlock: ContentBlockWithPosition = {
      type,
      position: {
        x: 50 + (existingBlocks % 3) * 250,
        y: 50 + Math.floor(existingBlocks / 3) * 150,
        width: 200,
        height: 120
      },
      ...getDefaultContentByType(type)
    };

    const newSlides = slides.map(s =>
      s.slideId === slideId
        ? { ...s, contentBlocks: [...s.contentBlocks, newBlock] }
        : s
    );

    updateSlides(newSlides);
    setEditingBlock(`${slideId}-${existingBlocks}`);
  };

  const getDefaultContentByType = (type: ContentBlockWithPosition['type']) => {
    switch (type) {
      case 'headline':
        return { text: 'New Headline', level: 2 as const };
      case 'paragraph':
        return { text: 'New paragraph content...' };
      case 'bullet_list':
        return { items: ['New bullet point'], formation: 'vertical' as const };
      case 'numbered_list':
        return { items: ['New numbered point'], formation: 'vertical' as const };
      case 'alert':
        return { 
          alertType: 'info' as const, 
          title: 'Alert Title', 
          text: 'Alert message...' 
        };
      default:
        return {};
    }
  };

  const updateContentBlock = (slideId: string, blockIndex: number, updates: Partial<ContentBlockWithPosition>) => {
    const newSlides = slides.map(slide =>
      slide.slideId === slideId
        ? {
            ...slide,
            contentBlocks: slide.contentBlocks.map((block, index) =>
              index === blockIndex ? { ...block, ...updates } : block
            )
          }
        : slide
    );
    updateSlides(newSlides);
  };

  const deleteContentBlock = (slideId: string, blockIndex: number) => {
    const newSlides = slides.map(slide =>
      slide.slideId === slideId
        ? {
            ...slide,
            contentBlocks: slide.contentBlocks.filter((_, index) => index !== blockIndex)
          }
        : slide
    );
    updateSlides(newSlides);
  };

  const moveContentBlock = (
    fromSlideId: string,
    toSlideId: string,
    blockIndex: number,
    newPosition: { x: number; y: number }
  ) => {
    const fromSlide = slides.find(s => s.slideId === fromSlideId);
    const block = fromSlide?.contentBlocks[blockIndex];
    
    if (!block || !block.position) return;

    const updatedBlock: ContentBlockWithPosition = {
      ...block,
      position: {
        ...block.position,
        x: Math.max(0, Math.min(700, newPosition.x)),
        y: Math.max(0, Math.min(300, newPosition.y))
      }
    };

    const newSlides = slides.map(slide => {
      if (slide.slideId === fromSlideId) {
        return {
          ...slide,
          contentBlocks: slide.contentBlocks.filter((_, index) => index !== blockIndex)
        };
      }
      if (slide.slideId === toSlideId) {
        return {
          ...slide,
          contentBlocks: [...slide.contentBlocks, updatedBlock]
        };
      }
      return slide;
    });

    updateSlides(newSlides);
  };

  // Drag and Drop Handlers
  const handleBlockDragStart = (e: React.DragEvent, blockIndex: number, slideId: string) => {
    setDraggedBlock({ blockIndex, slideId });
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlock(null);
  };

  const handleSlideDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSlideDrop = (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();
    
    if (!draggedBlock) return;
    
    const slideElement = e.currentTarget as HTMLElement;
    const contentElement = slideElement.querySelector('.slide-content') as HTMLElement;
    
    if (contentElement) {
      const contentRect = contentElement.getBoundingClientRect();
      const x = e.clientX - contentRect.left - 100; // Offset for better positioning
      const y = e.clientY - contentRect.top - 60;
      
      moveContentBlock(
        draggedBlock.slideId,
        targetSlideId,
        draggedBlock.blockIndex,
        { x: Math.max(0, x), y: Math.max(0, y) }
      );
    }
    
    setDraggedBlock(null);
  };

  const handleSlideDragStart = (e: React.DragEvent, slideId: string) => {
    setDraggedSlide(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlideDragEnd = () => {
    setDraggedSlide(null);
  };

  const handleThumbnailDrop = (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();
    
    if (!draggedSlide || draggedSlide === targetSlideId) return;
    
    const draggedIndex = slides.findIndex(s => s.slideId === draggedSlide);
    const targetIndex = slides.findIndex(s => s.slideId === targetSlideId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newSlides = [...slides];
    const [draggedSlideData] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedSlideData);
    
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1
    }));
    
    updateSlides(renumberedSlides);
    setDraggedSlide(null);
  };

  const renderContentBlock = (block: ContentBlockWithPosition, slideId: string, blockIndex: number) => {
    const isCurrentlyEditing = editingBlock === `${slideId}-${blockIndex}`;
    const isDragging = draggedBlock?.blockIndex === blockIndex && draggedBlock?.slideId === slideId;
    
    const blockStyle: React.CSSProperties = {
      left: `${block.position?.x || 0}px`,
      top: `${block.position?.y || 0}px`,
      width: `${block.position?.width || 200}px`,
      minHeight: `${block.position?.height || 120}px`,
    };

    if (isCurrentlyEditing) {
      return (
        <div 
          className="content-block editing"
          style={blockStyle}
          key={blockIndex}
        >
          {renderInlineEditor(block, slideId, blockIndex)}
        </div>
      );
    }

    return (
      <div
        key={blockIndex}
        className={`content-block ${isEditing ? 'editable' : ''} ${isDragging ? 'dragging' : ''}`}
        style={blockStyle}
        draggable={isEditing}
        onDragStart={(e) => handleBlockDragStart(e, blockIndex, slideId)}
        onDragEnd={handleBlockDragEnd}
        onClick={() => isEditing && setEditingBlock(`${slideId}-${blockIndex}`)}
      >
        {renderBlockContent(block)}
        
        {isEditing && (
          <div className="block-controls">
            <button
              className="control-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteContentBlock(slideId, blockIndex);
              }}
            >
              ×
            </button>
            <div 
              className="drag-handle"
              onMouseDown={() => setEditingBlock(`${slideId}-${blockIndex}`)}
            >
              ⋮⋮
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBlockContent = (block: ContentBlockWithPosition) => {
    switch (block.type) {
      case 'headline':
        return (
          <h1 className={`block-headline level-${block.level || 2}`}>
            {block.text}
          </h1>
        );
      case 'paragraph':
        return <p className="block-paragraph">{block.text}</p>;
      case 'bullet_list':
        return (
          <ul className={`block-list formation-${block.formation || 'vertical'}`}>
            {block.items?.map((item, index) => (
              <li key={index} className="block-list-item">
                • {typeof item === 'string' ? item : 'Complex item'}
              </li>
            ))}
          </ul>
        );
      case 'numbered_list':
        return (
          <ol className={`block-list formation-${block.formation || 'vertical'}`}>
            {block.items?.map((item, index) => (
              <li key={index} className="block-list-item">
                {index + 1}. {typeof item === 'string' ? item : 'Complex item'}
              </li>
            ))}
          </ol>
        );
      case 'alert':
        return (
          <div className={`block-alert alert-${block.alertType || 'info'}`}>
            <div className="block-alert-title">{block.title}</div>
            <div className="block-alert-text">{block.text}</div>
          </div>
        );
      default:
        return <div>Unknown content type</div>;
    }
  };

  const renderInlineEditor = (block: ContentBlockWithPosition, slideId: string, blockIndex: number) => {
    const handleSave = (updates: Partial<ContentBlockWithPosition>) => {
      updateContentBlock(slideId, blockIndex, updates);
      setEditingBlock(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingBlock(null);
      }
    };

    switch (block.type) {
      case 'headline':
        return (
          <div className="inline-editor" onKeyDown={handleKeyDown}>
            <div className="headline-editor">
              <select
                className="level-selector"
                value={block.level || 2}
                onChange={(e) => handleSave({ level: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
              </select>
              <input
                className="headline-input"
                type="text"
                value={block.text || ''}
                onChange={(e) => handleSave({ text: e.target.value })}
                onBlur={() => setEditingBlock(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingBlock(null);
                  }
                }}
                autoFocus
                placeholder="Enter headline..."
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="inline-editor" onKeyDown={handleKeyDown}>
            <textarea
              className="paragraph-textarea"
              value={block.text || ''}
              onChange={(e) => handleSave({ text: e.target.value })}
              onBlur={() => setEditingBlock(null)}
              autoFocus
              placeholder="Enter paragraph text..."
            />
          </div>
        );

      case 'bullet_list':
      case 'numbered_list':
        return (
          <div className="inline-editor" onKeyDown={handleKeyDown}>
            <div className="formation-selector">
              <select
                value={block.formation || 'vertical'}
                onChange={(e) => handleSave({ formation: e.target.value as any })}
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="grid-2x2">Grid 2x2</option>
                <option value="grid-3x2">Grid 3x2</option>
                <option value="grid-2x3">Grid 2x3</option>
              </select>
            </div>
            <div className="list-items-editor">
              {(block.items || []).map((item, index) => (
                <div key={index} className="list-item-editor">
                  <input
                    className="list-item-input"
                    type="text"
                    value={typeof item === 'string' ? item : ''}
                    onChange={(e) => {
                      const newItems = [...(block.items || [])];
                      newItems[index] = e.target.value;
                      handleSave({ items: newItems });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const newItems = [...(block.items || [])];
                        newItems.splice(index + 1, 0, '');
                        handleSave({ items: newItems });
                      } else if (e.key === 'Backspace' && typeof item === 'string' && item === '' && (block.items || []).length > 1) {
                        const newItems = [...(block.items || [])];
                        newItems.splice(index, 1);
                        handleSave({ items: newItems });
                      }
                    }}
                    placeholder={`Item ${index + 1}`}
                  />
                </div>
              ))}
              <button
                onClick={() => handleSave({ items: [...(block.items || []), ''] })}
                style={{ padding: '8px', marginTop: '8px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Add Item
              </button>
            </div>
          </div>
        );

      case 'alert':
        return (
          <div className="inline-editor" onKeyDown={handleKeyDown}>
            <div className="alert-editor">
              <select
                className="alert-type-selector"
                value={block.alertType || 'info'}
                onChange={(e) => handleSave({ alertType: e.target.value as 'info' | 'warning' | 'success' | 'danger' })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
              </select>
              <input
                className="alert-title-input"
                type="text"
                value={block.title || ''}
                onChange={(e) => handleSave({ title: e.target.value })}
                placeholder="Alert title..."
              />
              <textarea
                className="alert-text-textarea"
                value={block.text || ''}
                onChange={(e) => handleSave({ text: e.target.value })}
                onBlur={() => setEditingBlock(null)}
                placeholder="Alert message..."
              />
            </div>
          </div>
        );

      default:
        return <div>Unknown content type</div>;
    }
  };

  const renderSlidePreview = (slide: DeckSlide) => {
    return (
      <div className="slide-preview-canvas">
        <div className="preview-title">{slide.slideTitle}</div>
        <div className="preview-content">
          {slide.contentBlocks.slice(0, 3).map((block, index) => (
            <div
              key={index}
              className={`preview-block ${block.type}`}
              style={{
                position: 'absolute',
                left: `${10 + (index % 2) * 45}%`,
                top: `${30 + Math.floor(index / 2) * 30}%`,
                width: '40%',
                height: '20%',
                fontSize: '8px'
              }}
            >
              {block.type}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="slide-deck-container">
      {/* Left Sidebar */}
      <div className="slide-deck-sidebar">
        <div className="sidebar-header">
          <h3>{data.lessonTitle}</h3>
          <div className="slide-count">{slides.length} slides</div>
        </div>

        <div className="slides-thumbnails">
          {slides.map((slide) => (
            <div
              key={slide.slideId}
              className={`slide-thumbnail ${currentSlideId === slide.slideId ? 'active' : ''}`}
              draggable
              onDragStart={(e) => handleSlideDragStart(e, slide.slideId)}
              onDragEnd={handleSlideDragEnd}
              onDragOver={handleSlideDragOver}
              onDrop={(e) => handleThumbnailDrop(e, slide.slideId)}
              onClick={() => setCurrentSlideId(slide.slideId)}
            >
              <div className="thumbnail-number">{slide.slideNumber}</div>
              {renderSlidePreview(slide)}
              
              <div className="thumbnail-controls">
                <button
                  className="thumb-btn add"
                  onClick={(e) => {
                    e.stopPropagation();
                    addSlide(slide.slideId);
                  }}
                >
                  +
                </button>
                <button
                  className="thumb-btn duplicate"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSlide(slide.slideId);
                  }}
                >
                  ⧉
                </button>
                <button
                  className="thumb-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(slide.slideId);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-controls">
          <button
            className={`edit-toggle ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          
          <button
            className="add-slide"
            onClick={() => addSlide()}
          >
            Add Slide
          </button>
          
          <button
            className="save-deck"
            onClick={() => onUpdate && onUpdate({ ...data, slides, currentSlideId })}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="slide-deck-main">
        {/* Top Toolbar */}
        {isEditing && (
          <div className="slide-deck-toolbar">
            <div className="content-tools">
              <button onClick={() => addContentBlock(currentSlideId, 'headline')}>
                Add Headline
              </button>
              <button onClick={() => addContentBlock(currentSlideId, 'paragraph')}>
                Add Paragraph
              </button>
              <button onClick={() => addContentBlock(currentSlideId, 'bullet_list')}>
                Add Bullet List
              </button>
              <button onClick={() => addContentBlock(currentSlideId, 'numbered_list')}>
                Add Numbered List
              </button>
              <button onClick={() => addContentBlock(currentSlideId, 'alert')}>
                Add Alert
              </button>
            </div>
          </div>
        )}

        {/* Slides Container */}
        <div className="slides-container">
          {slides.map((slide) => (
            <div
              key={slide.slideId}
              className={`slide-item ${draggedBlock ? 'drag-over' : ''}`}
              onDragOver={handleSlideDragOver}
              onDrop={(e) => handleSlideDrop(e, slide.slideId)}
            >
              {/* Slide Header */}
              <div className="slide-header">
                <div className="slide-number-badge">{slide.slideNumber}</div>
                
                {editingTitle === slide.slideId ? (
                  <input
                    className="slide-title-input"
                    type="text"
                    value={slide.slideTitle}
                    onChange={(e) => updateSlideTitle(slide.slideId, e.target.value)}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingTitle(null);
                      if (e.key === 'Escape') setEditingTitle(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <h1
                    className="slide-title"
                    onClick={() => isEditing && setEditingTitle(slide.slideId)}
                  >
                    {slide.slideTitle}
                  </h1>
                )}
              </div>

              {/* Slide Content */}
              <div className="slide-content">
                {slide.contentBlocks.map((block, index) => renderContentBlock(block, slide.slideId, index))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlideDeckDisplay; 