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
  const [selectedSlideTemplate, setSelectedSlideTemplate] = useState<string>('content');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

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

  // Helper function to determine slide layout based on slide number and content
  const getSlideLayout = (slideIndex: number, contentBlocks: AnyContentBlock[]) => {
    const layouts = ['left-aligned', 'right-aligned', 'center-aligned', 'split-layout', 'grid-layout'];
    return layouts[slideIndex % layouts.length];
  };

  // Helper function to determine list layout based on item count
  const getListLayout = (items: any[], slideIndex: number) => {
    const itemCount = items.length;
    if (itemCount <= 3) return 'single-column';
    if (itemCount === 4) return 'grid-2x2';
    if (itemCount === 6) return 'grid-3x2';
    if (itemCount <= 8) return 'grid-2x4';
    return 'multi-column';
  };

  // Enhanced slide preview generator for sidebar
  const generateSlidePreview = (slide: DeckSlide): React.ReactNode => {
    return (
      <div className="slide-preview-container">
        <div className="slide-preview-header">
          <div className="slide-preview-title">{slide.slideTitle}</div>
        </div>
        <div className="slide-preview-content">
          {slide.contentBlocks.slice(0, 3).map((block, index) => (
            <div key={index} className="slide-preview-block">
              {block.type === 'headline' && (
                <div className="preview-headline">
                  {typeof block === 'object' && 'text' in block ? block.text : 'Headline'}
                </div>
              )}
              {block.type === 'paragraph' && (
                                 <div className="preview-paragraph">
                   {typeof block === 'object' && 'text' in block ? 
                     (block.text as string).substring(0, 50) + ((block.text as string).length > 50 ? '...' : '') : 'Text'}
                 </div>
              )}
              {(block.type === 'bullet_list' || block.type === 'numbered_list') && (
                <div className="preview-list">
                  {Array.isArray((block as any).items) ? 
                    (block as any).items.slice(0, 2).map((item: any, idx: number) => (
                      <div key={idx} className="preview-list-item">• {typeof item === 'string' ? item.substring(0, 30) : 'Item'}</div>
                    )) : <div className="preview-list-item">• List item</div>
                  }
                </div>
              )}
              {block.type === 'alert' && (
                <div className={`preview-alert alert-${(block as any).alertType || 'info'}`}>
                  Alert: {typeof block === 'object' && 'text' in block ? 
                    (block.text as string).substring(0, 30) + '...' : 'Alert content'}
                </div>
              )}
            </div>
          ))}
          {slide.contentBlocks.length > 3 && (
            <div className="slide-preview-more">+{slide.contentBlocks.length - 3} more</div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced slide templates similar to DeckDeckGo
  const slideTemplates = {
    content: { name: 'Content', icon: '📄' },
    split: { name: 'Split', icon: '⚡' },
    title: { name: 'Title', icon: '🎯' },
    chart: { name: 'Chart', icon: '📊' },
    quote: { name: 'Quote', icon: '💬' },
    image: { name: 'Image', icon: '🖼️' },
    code: { name: 'Code', icon: '💻' },
    comparison: { name: 'Compare', icon: '⚖️' }
  };

  // Apply slide template
  const applySlideTemplate = (slideIndex: number, template: string) => {
    const slide = currentDeck.slides[slideIndex];
    let updatedSlide = { ...slide };

    switch (template) {
      case 'title':
        updatedSlide.contentBlocks = [
          { type: 'headline', text: slide.slideTitle, level: 1 },
          { type: 'paragraph', text: 'Subtitle or description' }
        ];
        break;
      case 'split':
        updatedSlide.contentBlocks = [
          { type: 'headline', text: 'Left Column', level: 2 },
          { type: 'paragraph', text: 'Content for left side' },
          { type: 'headline', text: 'Right Column', level: 2 },
          { type: 'paragraph', text: 'Content for right side' }
        ];
        break;
      case 'chart':
        updatedSlide.contentBlocks = [
          { type: 'headline', text: 'Data Analysis', level: 2 },
          { type: 'paragraph', text: 'Chart placeholder - add your data visualization here' },
          { type: 'bullet_list', items: ['Key insight 1', 'Key insight 2', 'Key insight 3'] }
        ];
        break;
      case 'quote':
        updatedSlide.contentBlocks = [
          { type: 'headline', text: '"Insert inspiring quote here"', level: 1 },
          { type: 'paragraph', text: '— Author Name' }
        ];
        break;
      case 'comparison':
        updatedSlide.contentBlocks = [
          { type: 'headline', text: 'Option A vs Option B', level: 2 },
          { type: 'bullet_list', items: ['Pro A1', 'Pro A2', 'Pro A3'] },
          { type: 'bullet_list', items: ['Pro B1', 'Pro B2', 'Pro B3'] }
        ];
        break;
      case 'code':
        updatedSlide.contentBlocks = [
          { type: 'headline', text: 'Code Example', level: 2 },
          { type: 'paragraph', text: 'Code block placeholder' },
          { type: 'bullet_list', items: ['Explanation point 1', 'Explanation point 2'] }
        ];
        break;
      default:
        // Keep existing content for 'content' template
        break;
    }

    handleSlideUpdate(slideIndex, updatedSlide);
    setShowTemplateSelector(false);
  };

  // Enhanced content block rendering with DeckDeckGo-inspired styling
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

    switch (block.type) {
      case 'headline':
        const headlineBlock = block as any;
        const level = Math.min(Math.max(headlineBlock.level || 2, 1), 6);
        
        // Enhanced headline styling with icons and gradients
        const headlineIcons = {
          1: '🎯', 2: '📌', 3: '✨', 4: '🔹', 5: '▪️', 6: '•'
        };
        
        return React.createElement(
          `h${level}`,
          {
            ...blockProps,
            key: blockIndex,
            className: `${blockProps.className} enhanced-headline level-${level}`,
            style: {
              background: level <= 2 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: level === 1 ? '1.8rem' : level === 2 ? '1.4rem' : level === 3 ? '1.2rem' : '1rem',
              fontWeight: level <= 2 ? '700' : '600',
              margin: '0.3rem 0',
              padding: '0.2rem 0.4rem',
              borderRadius: '6px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }
          },
          React.createElement('span', { 
            className: 'headline-icon',
            style: { 
              fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.2rem' : '1rem',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }
          }, headlineIcons[level as keyof typeof headlineIcons] || '📝'),
          headlineBlock.text
        );

      case 'paragraph':
        const paragraphBlock = block as any;
        return React.createElement('div', {
          ...blockProps,
          key: blockIndex,
          className: `${blockProps.className} enhanced-paragraph`,
          style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,242,247,0.6) 100%)',
            border: '1px solid rgba(226,232,240,0.8)',
            borderRadius: '8px',
            padding: '0.6rem 0.8rem',
            margin: '0.3rem 0',
            fontSize: '0.95rem',
            lineHeight: '1.4',
            color: '#2d3748',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'relative'
          }
        }, [
          React.createElement('div', {
            key: 'icon',
            className: 'paragraph-icon',
            style: {
              position: 'absolute',
              left: '0.5rem',
              top: '0.3rem',
              fontSize: '0.8rem',
              opacity: 0.6
            }
          }, '📝'),
          React.createElement('div', {
            key: 'text',
            style: { paddingLeft: '1.5rem' }
          }, paragraphBlock.text)
        ]);

      case 'bullet_list':
        const bulletBlock = block as any;
        const bulletListLayout = getListLayout(bulletBlock.items || [], slideIndex);
        
        return React.createElement('div', {
          ...blockProps,
          key: blockIndex,
          className: `${blockProps.className} enhanced-bullet-list`,
          style: {
            background: 'linear-gradient(135deg, rgba(245,247,250,0.8) 0%, rgba(237,242,247,0.6) 100%)',
            border: '1px solid rgba(203,213,224,0.6)',
            borderRadius: '10px',
            padding: '0.6rem',
            margin: '0.3rem 0',
            backdropFilter: 'blur(3px)'
          }
        }, React.createElement('ul', {
          className: `list-grid list-grid-${bulletListLayout} enhanced-list`,
          style: {
            margin: '0',
            padding: '0',
            listStyle: 'none',
            display: 'grid',
            gap: '0.4rem',
            gridTemplateColumns: bulletListLayout === 'grid-2x2' ? '1fr 1fr' : bulletListLayout === 'grid-3x2' ? '1fr 1fr 1fr' : '1fr'
          }
        }, (bulletBlock.items || []).map((item: any, itemIndex: number) => {
          const itemColors = ['#3182ce', '#38a169', '#ed8936', '#9f7aea', '#e53e3e', '#0bc5ea'];
          const itemColor = itemColors[itemIndex % itemColors.length];
          
          return React.createElement('li', {
            key: itemIndex,
            className: 'list-item-styled enhanced-list-item',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.6rem',
              background: `linear-gradient(135deg, ${itemColor}15 0%, ${itemColor}05 100%)`,
              border: `1px solid ${itemColor}30`,
              borderRadius: '6px',
              fontSize: '0.9rem',
              lineHeight: '1.3',
              transition: 'all 0.2s ease'
            }
          }, [
            React.createElement('div', {
              key: 'bullet',
              style: {
                width: '0.6rem',
                height: '0.6rem',
                backgroundColor: itemColor,
                borderRadius: '50%',
                flexShrink: 0,
                boxShadow: `0 0 0 2px ${itemColor}30`
              }
            }),
            React.createElement('span', {
              key: 'text',
              style: { color: '#2d3748', fontWeight: '500' }
            }, typeof item === 'string' ? item : JSON.stringify(item))
          ]);
        })));

      case 'numbered_list':
        const numberedBlock = block as any;
        const numberedListLayout = getListLayout(numberedBlock.items || [], slideIndex);
        
        return React.createElement('div', {
          ...blockProps,
          key: blockIndex,
          className: `${blockProps.className} enhanced-numbered-list`,
          style: {
            background: 'linear-gradient(135deg, rgba(237, 242, 247, 0.8) 0%, rgba(230, 244, 238, 0.6) 100%)',
            border: '1px solid rgba(160, 174, 192, 0.6)',
            borderRadius: '10px',
            padding: '0.6rem',
            margin: '0.3rem 0',
            backdropFilter: 'blur(3px)'
          }
        }, React.createElement('ol', {
          className: `list-grid list-grid-${numberedListLayout} enhanced-numbered-list-inner`,
          style: {
            margin: '0',
            padding: '0',
            listStyle: 'none',
            display: 'grid',
            gap: '0.4rem',
            gridTemplateColumns: numberedListLayout === 'grid-2x2' ? '1fr 1fr' : numberedListLayout === 'grid-3x2' ? '1fr 1fr 1fr' : '1fr'
          }
        }, (numberedBlock.items || []).map((item: any, itemIndex: number) => {
          const itemColors = ['#9f7aea', '#ed8936', '#38a169', '#4299e1', '#f56565', '#0bc5ea'];
          const itemColor = itemColors[itemIndex % itemColors.length];
          
          return React.createElement('li', {
            key: itemIndex,
            className: 'list-item-styled enhanced-numbered-item',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.6rem',
              background: `linear-gradient(135deg, ${itemColor}15 0%, ${itemColor}05 100%)`,
              border: `1px solid ${itemColor}30`,
              borderRadius: '6px',
              fontSize: '0.9rem',
              lineHeight: '1.3',
              transition: 'all 0.2s ease',
              position: 'relative'
            }
          }, [
            React.createElement('div', {
              key: 'number',
              style: {
                minWidth: '1.2rem',
                height: '1.2rem',
                backgroundColor: itemColor,
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 0 2px ${itemColor}30`
              }
            }, (itemIndex + 1).toString()),
            React.createElement('span', {
              key: 'text',
              style: { color: '#2d3748', fontWeight: '500' }
            }, typeof item === 'string' ? item : JSON.stringify(item))
          ]);
        })));

      case 'alert':
        const alertBlock = block as any;
        const alertStyles = {
          info: { bg: 'linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%)', border: '#3182ce', color: '#1a365d', icon: 'ℹ️' },
          warning: { bg: 'linear-gradient(135deg, #faf089 0%, #f6e05e 100%)', border: '#d69e2e', color: '#744210', icon: '⚠️' },
          danger: { bg: 'linear-gradient(135deg, #feb2b2 0%, #fc8181 100%)', border: '#e53e3e', color: '#742a2a', icon: '🚫' },
          success: { bg: 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)', border: '#38a169', color: '#1a202c', icon: '✅' },
        };
        const alertStyle = alertStyles[alertBlock.alertType as keyof typeof alertStyles] || alertStyles.info;
        
        return React.createElement('div', {
          ...blockProps,
          key: blockIndex,
          className: `${blockProps.className} enhanced-alert alert-${alertBlock.alertType}`,
          style: {
            background: alertBlock.backgroundColor || alertStyle.bg,
            border: `2px solid ${alertBlock.borderColor || alertStyle.border}`,
            borderRadius: '10px',
            color: alertBlock.textColor || alertStyle.color,
            padding: '1rem 1.2rem',
            margin: '0.5rem 0',
            fontSize: '0.95rem',
            lineHeight: '1.4',
            position: 'relative',
            boxShadow: `0 4px 8px ${alertStyle.border}20`,
            backdropFilter: 'blur(5px)'
          }
        }, [
          React.createElement('div', {
            key: 'header',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: alertBlock.title ? '0.5rem' : '0'
            }
          }, [
            React.createElement('span', {
              key: 'icon',
              style: {
                fontSize: '1.2rem',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }
            }, alertStyle.icon),
            alertBlock.title && React.createElement('div', {
              key: 'title',
              style: { 
                fontWeight: '700', 
                fontSize: '1.1rem',
                color: alertStyle.color
              }
            }, alertBlock.title)
          ]),
          React.createElement('div', {
            key: 'content',
            style: { 
              paddingLeft: alertBlock.title ? '1.7rem' : '0',
              fontWeight: '500'
            }
          }, alertBlock.text)
        ]);

      case 'section_break':
        return React.createElement('div', {
          ...blockProps,
          key: blockIndex,
          className: `${blockProps.className} enhanced-section-break`,
          style: {
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            gap: '1rem'
          }
        }, [
          React.createElement('div', {
            key: 'line1',
            style: {
              flex: 1,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #cbd5e0 50%, transparent 100%)'
            }
          }),
          React.createElement('div', {
            key: 'icon',
            style: {
              padding: '0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              color: 'white',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)'
            }
          }, '◇'),
          React.createElement('div', {
            key: 'line2',
            style: {
              flex: 1,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #cbd5e0 50%, transparent 100%)'
            }
          })
        ]);

      default:
        return React.createElement('div', {
          ...blockProps,
          key: blockIndex,
          className: `${blockProps.className} unknown-block`,
          style: {
            background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
            color: 'white',
            padding: '0.6rem',
            borderRadius: '8px',
            margin: '0.3rem 0',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500'
          }
        }, `⚠️ ${(block as any).type || 'Unknown'} Block`);
    }
  };

  return (
    <div className="slide-deck-viewer-with-sidebar">
      {/* Enhanced Vertical Sidebar with Previews */}
      <div className="slide-deck-sidebar enhanced-sidebar">
        <div className="sidebar-header">
          <h3>Slides</h3>
          {isEditable && (
            <div className="sidebar-controls">
              <button
                onClick={() => addNewSlide()}
                className="add-slide-sidebar"
                title="Add new slide"
              >
                +
              </button>
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="template-selector-btn"
                title="Slide templates"
              >
                🎨
              </button>
            </div>
          )}
        </div>

        {/* Template Selector */}
        {showTemplateSelector && (
          <div className="template-selector">
            <div className="template-selector-header">Choose Template</div>
            <div className="template-grid">
              {Object.entries(slideTemplates).map(([key, template]) => (
                <button
                  key={key}
                  className="template-option"
                  onClick={() => applySlideTemplate(0, key)}
                  title={template.name}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-slides">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className="sidebar-slide-item enhanced-slide-item"
              onClick={() => {
                const element = document.getElementById(`slide-${index}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div className="sidebar-slide-number">{slide.slideNumber}</div>
              <div className="sidebar-slide-preview">
                {generateSlidePreview(slide)}
              </div>
              <div className="sidebar-slide-title">{slide.slideTitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Main Content Area */}
      <div className="slide-deck-main enhanced-main">
        {/* Enhanced Header */}
        <div className="enhanced-header">
          <div className="deck-info">
                         <h1 className="deck-title">{(currentDeck as any).title || currentDeck.lessonTitle || 'Untitled Presentation'}</h1>
            <div className="deck-stats">
              {currentDeck.slides.length} slides • {isEditable ? 'Editing' : 'Viewing'} mode
            </div>
          </div>
          
          {isEditable && (
            <div className="edit-controls">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`edit-toggle ${isEditing ? 'active' : ''}`}
              >
                {isEditing ? '✓ Done' : '✏️ Edit'}
              </button>
              {isEditing && (
                <button onClick={handleSave} className="save-btn">
                  💾 Save
                </button>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Slides Container */}
        <div className="slides-container-full-height enhanced-slides-container">
          <div className="slides-presentation-view">
            {currentDeck.slides.map((slide, slideIndex) => (
              <div key={slide.slideId} id={`slide-${slideIndex}`} className="slide-item-vertical enhanced-slide">
                <div className="slide-number-badge enhanced-badge">
                  {slide.slideNumber}
                </div>
                
                {/* Enhanced slide controls */}
                {isEditable && isEditing && (
                  <div className="slide-controls enhanced-controls">
                    <button 
                      onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                      className="slide-control-btn template"
                      title="Change template"
                    >
                      🎨
                    </button>
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

                <div className={`slide-content-vertical enhanced-slide-content slide-layout-${getSlideLayout(slideIndex, slide.contentBlocks)}`}>
                  {/* Enhanced slide title */}
                  {editingTitle === slideIndex ? (
                    <input
                      type="text"
                      value={slide.slideTitle}
                      onChange={(e) => updateSlideTitle(slideIndex, e.target.value)}
                      onBlur={() => setEditingTitle(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(null)}
                      className="slide-title-input enhanced-title-input"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="slide-title enhanced-slide-title"
                      onClick={() => isEditable && setEditingTitle(slideIndex)}
                    >
                      <span className="title-icon">🎯</span>
                      {slide.slideTitle}
                    </h2>
                  )}

                  <div className="slide-body-vertical enhanced-slide-body">
                    {slide.contentBlocks.map((block, blockIndex) => 
                      renderContentBlock(block, slideIndex, blockIndex)
                    )}
                    
                    {/* Enhanced add content buttons */}
                    {isEditable && isEditing && (
                      <div className="add-content-zone enhanced-add-zone">
                        <div className="add-content-buttons enhanced-add-buttons">
                          <button onClick={() => addContentBlock(slideIndex, 'headline')} className="add-btn headline">
                            <span className="btn-icon">📝</span> Headline
                          </button>
                          <button onClick={() => addContentBlock(slideIndex, 'paragraph')} className="add-btn paragraph">
                            <span className="btn-icon">📄</span> Text
                          </button>
                          <button onClick={() => addContentBlock(slideIndex, 'bullet_list')} className="add-btn bullets">
                            <span className="btn-icon">📋</span> Bullets
                          </button>
                          <button onClick={() => addContentBlock(slideIndex, 'numbered_list')} className="add-btn numbers">
                            <span className="btn-icon">🔢</span> Numbers
                          </button>
                          <button onClick={() => addContentBlock(slideIndex, 'alert')} className="add-btn alert">
                            <span className="btn-icon">⚠️</span> Alert
                          </button>
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