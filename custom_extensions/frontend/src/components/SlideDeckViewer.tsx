import React, { useState, useEffect } from 'react';
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
  };

  const addNewSlide = () => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: DeckSlide = {
      slideId: newSlideId,
      slideNumber: currentDeck.slides.length + 1,
      slideTitle: 'New Slide',
      contentBlocks: [
        {
          type: 'paragraph',
          text: 'Click to edit this content...'
        }
      ]
    };

    const updatedDeck = {
      ...currentDeck,
      slides: [...currentDeck.slides, newSlide]
    };
    setCurrentDeck(updatedDeck);
  };

  const deleteSlide = (slideIndex: number) => {
    if (currentDeck.slides.length <= 1) return; // Don't delete the last slide

    const updatedDeck = {
      ...currentDeck,
      slides: currentDeck.slides.filter((_, index) => index !== slideIndex)
        .map((slide, index) => ({
          ...slide,
          slideNumber: index + 1
        }))
    };
    setCurrentDeck(updatedDeck);
  };

  const renderContentBlock = (block: AnyContentBlock, index: number): React.ReactNode => {
    switch (block.type) {
      case 'headline':
        const headlineBlock = block as any;
        const level = Math.min(Math.max(headlineBlock.level || 2, 1), 6);
        return React.createElement(
          `h${level}`,
          {
            key: index,
            className: `slide-heading level-${level} ${headlineBlock.isImportant ? 'important' : ''}`,
            style: {
              color: headlineBlock.textColor || '#2c3e50',
              backgroundColor: headlineBlock.backgroundColor || 'transparent',
              margin: '0.8em 0 0.5em 0',
              fontSize: level === 1 ? '2.2em' : level === 2 ? '1.8em' : level === 3 ? '1.4em' : '1.2em',
              fontWeight: level <= 2 ? '700' : '600',
              lineHeight: '1.3',
            }
          },
          headlineBlock.iconName && React.createElement('span', { 
            className: `icon icon-${headlineBlock.iconName}`,
            style: { marginRight: '0.5em' }
          }),
          headlineBlock.text
        );

      case 'paragraph':
        const paragraphBlock = block as any;
        return React.createElement('p', {
          key: index,
          className: `slide-paragraph ${paragraphBlock.isRecommendation ? 'recommendation' : ''}`,
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
          key: index,
          className: 'slide-bullet-list',
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
          key: index,
          className: 'slide-numbered-list',
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
          key: index,
          className: `slide-alert alert-${alertBlock.alertType}`,
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
          alertBlock.iconName && React.createElement('span', {
            key: 'icon',
            className: `alert-icon icon-${alertBlock.iconName}`,
            style: { marginRight: '0.5em', fontWeight: 'bold' }
          }),
          alertBlock.title && React.createElement('div', {
            key: 'title',
            className: 'alert-title',
            style: { fontWeight: 'bold', marginBottom: '0.3em' }
          }, alertBlock.title),
          React.createElement('div', {
            key: 'text',
            className: 'alert-text'
          }, alertBlock.text)
        ].filter(Boolean));

      case 'section_break':
        return React.createElement('hr', {
          key: index,
          className: 'slide-section-break',
          style: {
            border: 'none',
            borderTop: '2px solid #bdc3c7',
            margin: '1.5em 0',
            width: '50%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }
        });

      default:
        return React.createElement('div', {
          key: index,
          className: 'unknown-block',
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
  };

  return (
    <div className="slide-deck-viewer-vertical">
      {/* Header with controls */}
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
              <>
                <button onClick={addNewSlide} className="add-slide">
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

      {/* Vertical slides container */}
      <div className="slides-container-vertical">
        {isEditing ? (
          <SlideEditor
            deck={currentDeck}
            onSlideUpdate={handleSlideUpdate}
            onDeleteSlide={deleteSlide}
          />
        ) : (
          <div className="slides-presentation-view">
            {currentDeck.slides.map((slide, index) => (
              <div key={slide.slideId} className="slide-item-vertical">
                <div className="slide-number-badge">
                  {slide.slideNumber}
                </div>
                <div className="slide-content-vertical">
                  <h1 className="slide-title-vertical">
                    {slide.slideTitle}
                  </h1>
                  <div className="slide-body-vertical">
                    {slide.contentBlocks.map((block, idx) => renderContentBlock(block, idx))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Slide Editor Component
interface SlideEditorProps {
  deck: SlideDeckData;
  onSlideUpdate: (slideIndex: number, updatedSlide: DeckSlide) => void;
  onDeleteSlide: (index: number) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
  deck,
  onSlideUpdate,
  onDeleteSlide
}) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const currentSlide = deck.slides[selectedSlideIndex] || deck.slides[0];
  
  const updateSlideTitle = (newTitle: string) => {
    const updatedSlide = { ...currentSlide, slideTitle: newTitle };
    onSlideUpdate(selectedSlideIndex, updatedSlide);
  };

  const updateContentBlock = (blockIndex: number, updatedBlock: AnyContentBlock) => {
    const updatedSlide = {
      ...currentSlide,
      contentBlocks: currentSlide.contentBlocks.map((block, index) =>
        index === blockIndex ? updatedBlock : block
      )
    };
    onSlideUpdate(selectedSlideIndex, updatedSlide);
  };

  const addContentBlock = (type: AnyContentBlock['type']) => {
    let newBlock: AnyContentBlock;
    
    switch (type) {
      case 'headline':
        newBlock = { type: 'headline', text: 'New Headline', level: 2 };
        break;
      case 'paragraph':
        newBlock = { type: 'paragraph', text: 'New paragraph content...' };
        break;
      case 'bullet_list':
        newBlock = { type: 'bullet_list', items: ['First item', 'Second item'] };
        break;
      case 'numbered_list':
        newBlock = { type: 'numbered_list', items: ['First item', 'Second item'] };
        break;
      default:
        newBlock = { type: 'paragraph', text: 'New content...' };
    }

    const updatedSlide = {
      ...currentSlide,
      contentBlocks: [...currentSlide.contentBlocks, newBlock]
    };
    onSlideUpdate(selectedSlideIndex, updatedSlide);
  };

  const deleteContentBlock = (blockIndex: number) => {
    const updatedSlide = {
      ...currentSlide,
      contentBlocks: currentSlide.contentBlocks.filter((_, index) => index !== blockIndex)
    };
    onSlideUpdate(selectedSlideIndex, updatedSlide);
  };

  return (
    <div className="slide-editor">
      <div className="editor-sidebar">
        <h3>Slides</h3>
        {deck.slides.map((slide, index) => (
          <div
            key={slide.slideId}
            className={`slide-item ${index === selectedSlideIndex ? 'active' : ''}`}
            onClick={() => setSelectedSlideIndex(index)}
          >
            <span className="slide-number">{slide.slideNumber}</span>
            <span className="slide-title-preview">{slide.slideTitle}</span>
            {deck.slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(index);
                  if (selectedSlideIndex >= index && selectedSlideIndex > 0) {
                    setSelectedSlideIndex(selectedSlideIndex - 1);
                  }
                }}
                className="delete-slide"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="editor-main">
        <div className="slide-title-editor">
          <input
            type="text"
            value={currentSlide.slideTitle}
            onChange={(e) => updateSlideTitle(e.target.value)}
            className="title-input"
            placeholder="Slide title..."
          />
        </div>

        <div className="content-blocks">
          {currentSlide.contentBlocks.map((block, index) => (
            <ContentBlockEditor
              key={index}
              block={block}
              onUpdate={(updatedBlock) => updateContentBlock(index, updatedBlock)}
              onDelete={() => deleteContentBlock(index)}
            />
          ))}
        </div>

        <div className="add-content-controls">
          <h4>Add Content:</h4>
          <div className="content-type-buttons">
            <button onClick={() => addContentBlock('headline')}>+ Headline</button>
            <button onClick={() => addContentBlock('paragraph')}>+ Paragraph</button>
            <button onClick={() => addContentBlock('bullet_list')}>+ Bullet List</button>
            <button onClick={() => addContentBlock('numbered_list')}>+ Numbered List</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Block Editor Component
interface ContentBlockEditorProps {
  block: AnyContentBlock;
  onUpdate: (updatedBlock: AnyContentBlock) => void;
  onDelete: () => void;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({ block, onUpdate, onDelete }) => {
  const renderEditor = () => {
    switch (block.type) {
      case 'headline':
        const headlineBlock = block as any;
        return (
          <div className="headline-editor">
            <select
              value={headlineBlock.level || 2}
              onChange={(e) => onUpdate({ ...headlineBlock, level: parseInt(e.target.value) })}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
            <input
              type="text"
              value={headlineBlock.text}
              onChange={(e) => onUpdate({ ...headlineBlock, text: e.target.value })}
              placeholder="Headline text..."
            />
          </div>
        );

      case 'paragraph':
        const paragraphBlock = block as any;
        return (
          <textarea
            value={paragraphBlock.text}
            onChange={(e) => onUpdate({ ...paragraphBlock, text: e.target.value })}
            placeholder="Paragraph content..."
            rows={3}
          />
        );

      case 'bullet_list':
      case 'numbered_list':
        const listBlock = block as any;
        return (
          <div className="list-editor">
            {listBlock.items.map((item: string, index: number) => (
              <div key={index} className="list-item-editor">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...listBlock.items];
                    newItems[index] = e.target.value;
                    onUpdate({ ...listBlock, items: newItems });
                  }}
                  placeholder="List item..."
                />
                <button
                  onClick={() => {
                    const newItems = listBlock.items.filter((_: any, i: number) => i !== index);
                    onUpdate({ ...listBlock, items: newItems });
                  }}
                  className="delete-item"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...listBlock.items, 'New item'];
                onUpdate({ ...listBlock, items: newItems });
              }}
              className="add-item"
            >
              + Add Item
            </button>
          </div>
        );

      default:
        return <div>Unsupported block type: {block.type}</div>;
    }
  };

  return (
    <div className="content-block-editor">
      <div className="block-header">
        <span className="block-type">{block.type}</span>
        <button onClick={onDelete} className="delete-block">Delete</button>
      </div>
      <div className="block-content">
        {renderEditor()}
      </div>
    </div>
  );
};

export default SlideDeckViewer; 