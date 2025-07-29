import React from 'react';
import {
  SlideDeckData,
  AnyContentBlock,
  BulletListBlock,
  NumberedListBlock,
  HeadlineBlock,
  ParagraphBlock,
  AlertBlock,
} from '@/types/pdfLesson';

/* -------- Render individual list items (handles nested structures) ---------- */
const renderListItem = (item: unknown, index: number): React.ReactNode => {
  if (typeof item === 'string') {
    return <span key={index}>{item}</span>;
  }
  
  if (typeof item === 'object' && item.type) {
    switch (item.type) {
      case 'bullet_list':
        return (
          <ul key={index} className="nested-bullet-list">
            {item.items.map((subItem: unknown, subIndex: number) => (
              <li key={subIndex}>{renderListItem(subItem, subIndex)}</li>
            ))}
          </ul>
        );
      case 'numbered_list':
        return (
          <ol key={index} className="nested-numbered-list">
            {item.items.map((subItem: unknown, subIndex: number) => (
              <li key={subIndex}>{renderListItem(subItem, subIndex)}</li>
            ))}
          </ol>
        );
      default:
        return <span key={index}>{String(item)}</span>;
    }
  }
  
  return <span key={index}>{String(item)}</span>;
};

/* -------- Render one content block to JSX ---------- */
const renderBlock = (blk: AnyContentBlock, index: number) => {
  switch (blk.type) {
    case 'headline':
      const headlineBlock = blk as HeadlineBlock;
      const level = Math.min(Math.max(headlineBlock.level, 1), 6); // Ensure valid heading level
      return React.createElement(
        `h${level}`,
        {
          key: index,
          className: `slide-heading level-${level} ${headlineBlock.isImportant ? 'important' : ''}`,
          style: {
            color: headlineBlock.textColor || undefined,
            backgroundColor: headlineBlock.backgroundColor || undefined,
          }
        },
        headlineBlock.iconName && React.createElement('span', { className: `icon icon-${headlineBlock.iconName}` }),
        headlineBlock.text
      );
      
    case 'paragraph':
      const paragraphBlock = blk as ParagraphBlock;
      return (
        <p 
          key={index}
          className={`slide-paragraph ${paragraphBlock.isRecommendation ? 'recommendation' : ''}`}
        >
          {paragraphBlock.text}
        </p>
      );
      
    case 'bullet_list':
      const bulletBlock = blk as BulletListBlock;
      return (
        <ul key={index} className="slide-bullet-list">
          {bulletBlock.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderListItem(item, itemIndex)}</li>
          ))}
        </ul>
      );
      
    case 'numbered_list':
      const numberedBlock = blk as NumberedListBlock;
      return (
        <ol key={index} className="slide-numbered-list">
          {numberedBlock.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderListItem(item, itemIndex)}</li>
          ))}
        </ol>
      );
      
    case 'alert':
      const alertBlock = blk as AlertBlock;
      return (
        <div 
          key={index}
          className={`slide-alert alert-${alertBlock.alertType}`}
          style={{
            backgroundColor: alertBlock.backgroundColor || undefined,
            borderColor: alertBlock.borderColor || undefined,
            color: alertBlock.textColor || undefined,
          }}
        >
          {alertBlock.iconName && <span className={`alert-icon icon-${alertBlock.iconName}`} />}
          {alertBlock.title && <div className="alert-title">{alertBlock.title}</div>}
          <div className="alert-text">{alertBlock.text}</div>
        </div>
      );
      
    case 'section_break':
      return <hr key={index} className="slide-section-break" />;
      
    default:
      return <div key={index} className="unknown-block">{JSON.stringify(blk)}</div>;
  }
};

/* -------- Determine slide template based on content ------------- */
const getSlideTemplate = (contentBlocks: AnyContentBlock[]) => {
  // Use split template if we have a good mix of content
  const hasHeadlines = contentBlocks.some(block => block.type === 'headline');
  const hasLists = contentBlocks.some(block => block.type === 'bullet_list' || block.type === 'numbered_list');
  
  if (hasHeadlines && hasLists && contentBlocks.length >= 3) {
    return 'split';
  }
  
  return 'content';
};

/* -------- Produce full deck JSX ------------- */
export const deckgoFromJson = (deck: SlideDeckData) => {
  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div className="no-slides-message">
        <p>No slides to display</p>
      </div>
    );
  }

  return (
    <div className="deckgo-deck" data-embedded data-keyboard data-navigation>
      {deck.slides.map(slide => {
        const template = getSlideTemplate(slide.contentBlocks);
        
        if (template === 'split') {
          // Split content into two columns for better visual balance
          const midPoint = Math.ceil(slide.contentBlocks.length / 2);
          const leftBlocks = slide.contentBlocks.slice(0, midPoint);
          const rightBlocks = slide.contentBlocks.slice(midPoint);
          
          return (
            <div key={slide.slideId} className="deckgo-slide-split">
              <h1 className="slide-title">{slide.slideTitle}</h1>
              <div className="slide-column slide-start">
                {leftBlocks.map((blk, idx) => renderBlock(blk, idx))}
              </div>
              <div className="slide-column slide-end">
                {rightBlocks.map((blk, idx) => renderBlock(blk, idx + midPoint))}
              </div>
            </div>
          );
        }
        
        // Default content template
        return (
          <div key={slide.slideId} className="deckgo-slide-content">
            <h1 className="slide-title">{slide.slideTitle}</h1>
            <div className="slide-content">
              {slide.contentBlocks.map((blk, idx) => renderBlock(blk, idx))}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 