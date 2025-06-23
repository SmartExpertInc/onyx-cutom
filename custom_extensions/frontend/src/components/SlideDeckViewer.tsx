import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SlideDeckData, DeckSlide, AnyContentBlock } from '@/types/pdfLesson';

// Dynamic import to avoid SSR issues
const DynamicSlideDeck = dynamic(() => import('./DeckDeckGoRenderer'), {
  ssr: false,
  loading: () => <div className="loading-slides">Loading presentation...</div>
});

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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
    
    // Adjust current slide index if needed
    if (currentSlideIndex >= updatedDeck.slides.length) {
      setCurrentSlideIndex(updatedDeck.slides.length - 1);
    }
  };

  return (
    <div className="slide-deck-viewer">
      {/* Header with controls */}
      <div className="slide-deck-header">
        <div className="deck-title">
          <h1>{currentDeck.lessonTitle}</h1>
          <span className="slide-counter">
            {currentSlideIndex + 1} / {currentDeck.slides.length}
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

      {/* Main presentation area */}
      <div className="slide-deck-content">
        {isEditing ? (
          <SlideEditor
            deck={currentDeck}
            currentSlideIndex={currentSlideIndex}
            onSlideUpdate={handleSlideUpdate}
            onSlideChange={setCurrentSlideIndex}
            onDeleteSlide={deleteSlide}
          />
        ) : (
          <DynamicSlideDeck 
            deck={currentDeck}
            onSlideChange={setCurrentSlideIndex}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="slide-navigation">
        <button
          onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
          className="nav-button prev"
        >
          ← Previous
        </button>
        
        <div className="slide-thumbnails">
          {currentDeck.slides.map((slide, index) => (
            <div
              key={slide.slideId}
              className={`thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="thumbnail-number">{slide.slideNumber}</div>
              <div className="thumbnail-title">{slide.slideTitle}</div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentSlideIndex(Math.min(currentDeck.slides.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex === currentDeck.slides.length - 1}
          className="nav-button next"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Slide Editor Component
interface SlideEditorProps {
  deck: SlideDeckData;
  currentSlideIndex: number;
  onSlideUpdate: (slideIndex: number, updatedSlide: DeckSlide) => void;
  onSlideChange: (index: number) => void;
  onDeleteSlide: (index: number) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
  deck,
  currentSlideIndex,
  onSlideUpdate,
  onSlideChange,
  onDeleteSlide
}) => {
  const currentSlide = deck.slides[currentSlideIndex];
  
  const updateSlideTitle = (newTitle: string) => {
    const updatedSlide = { ...currentSlide, slideTitle: newTitle };
    onSlideUpdate(currentSlideIndex, updatedSlide);
  };

  const updateContentBlock = (blockIndex: number, updatedBlock: AnyContentBlock) => {
    const updatedSlide = {
      ...currentSlide,
      contentBlocks: currentSlide.contentBlocks.map((block, index) =>
        index === blockIndex ? updatedBlock : block
      )
    };
    onSlideUpdate(currentSlideIndex, updatedSlide);
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
    onSlideUpdate(currentSlideIndex, updatedSlide);
  };

  const deleteContentBlock = (blockIndex: number) => {
    const updatedSlide = {
      ...currentSlide,
      contentBlocks: currentSlide.contentBlocks.filter((_, index) => index !== blockIndex)
    };
    onSlideUpdate(currentSlideIndex, updatedSlide);
  };

  return (
    <div className="slide-editor">
      <div className="editor-sidebar">
        <h3>Slides</h3>
        {deck.slides.map((slide, index) => (
          <div
            key={slide.slideId}
            className={`slide-item ${index === currentSlideIndex ? 'active' : ''}`}
            onClick={() => onSlideChange(index)}
          >
            <span className="slide-number">{slide.slideNumber}</span>
            <span className="slide-title-preview">{slide.slideTitle}</span>
            {deck.slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(index);
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