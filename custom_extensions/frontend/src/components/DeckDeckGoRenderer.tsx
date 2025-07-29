import React, { useEffect, useRef, useState } from 'react';
import { SlideDeckData, AnyContentBlock } from '@/types/pdfLesson';

interface DeckDeckGoRendererProps {
  deck: SlideDeckData;
  onSlideChange?: (slideIndex: number) => void;
}

const DeckDeckGoRenderer: React.FC<DeckDeckGoRendererProps> = ({ deck, onSlideChange }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentSlideIndex);
    }
  }, [currentSlideIndex, onSlideChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isFullscreen, currentSlideIndex]);

  const nextSlide = () => {
    setCurrentSlideIndex(prev => 
      prev < deck.slides.length - 1 ? prev + 1 : prev
    );
  };

  const prevSlide = () => {
    setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(Math.max(0, Math.min(index, deck.slides.length - 1)));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
              fontSize: level === 1 ? '2.5em' : level === 2 ? '2em' : level === 3 ? '1.5em' : '1.2em',
              fontWeight: level <= 2 ? '700' : '600',
              lineHeight: '1.2',
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
            lineHeight: '1.7',
            fontSize: '1.3em',
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
            paddingLeft: '2em',
            fontSize: '1.2em',
            lineHeight: '1.6',
            color: '#34495e',
          }
        }, bulletBlock.items.map((item: any, itemIndex: number) => 
          React.createElement('li', {
            key: itemIndex,
            style: { 
              margin: '0.6em 0',
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
            paddingLeft: '2em',
            fontSize: '1.2em',
            lineHeight: '1.6',
            color: '#34495e',
          }
        }, numberedBlock.items.map((item: any, itemIndex: number) => 
          React.createElement('li', {
            key: itemIndex,
            style: { 
              margin: '0.6em 0',
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
            borderLeft: `5px solid ${alertBlock.borderColor || alertStyle.border}`,
            color: alertBlock.textColor || alertStyle.color,
            padding: '1.2em',
            margin: '1em 0',
            borderRadius: '6px',
            fontSize: '1.1em',
            lineHeight: '1.5',
          }
        }, [
          alertBlock.iconName && React.createElement('span', {
            key: 'icon',
            className: `alert-icon icon-${alertBlock.iconName}`,
            style: { marginRight: '0.7em', fontWeight: 'bold', fontSize: '1.2em' }
          }),
          alertBlock.title && React.createElement('div', {
            key: 'title',
            className: 'alert-title',
            style: { fontWeight: 'bold', marginBottom: '0.5em', fontSize: '1.1em' }
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
            borderTop: '3px solid #bdc3c7',
            margin: '2em 0',
            width: '60%',
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
            padding: '1em',
            border: '2px dashed #dee2e6',
            margin: '1em 0',
            borderRadius: '6px',
            fontSize: '1em',
            color: '#6c757d',
          }
        }, `Unsupported block type: ${(block as any).type}`);
    }
  };

  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '500px',
        backgroundColor: '#f8f9fa',
        border: '3px dashed #dee2e6',
        borderRadius: '12px',
        fontSize: '1.4em',
        color: '#6c757d',
        fontWeight: '500',
      }}>
        No slides to display
      </div>
    );
  }

  const currentSlide = deck.slides[currentSlideIndex];
  const containerClass = isFullscreen ? 'slide-deck-fullscreen' : 'slide-deck-embedded';

  return (
    <div 
      ref={deckRef}
      className={`slide-deck-container ${containerClass}`}
      style={{
        width: '100%',
        height: isFullscreen ? '100vh' : '700px',
        backgroundColor: '#ffffff',
        border: isFullscreen ? 'none' : '2px solid #e9ecef',
        borderRadius: isFullscreen ? '0' : '12px',
        boxShadow: isFullscreen ? 'none' : '0 8px 25px rgba(0, 0, 0, 0.15)',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? '0' : 'auto',
        left: isFullscreen ? '0' : 'auto',
        zIndex: isFullscreen ? '9999' : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Slide Content */}
      <div 
        className="slide-content-area"
        style={{
          flex: '1',
          padding: '3em 4em',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '0',
        }}
      >
        {/* Slide Title */}
        <h1 style={{
          fontSize: '3em',
          fontWeight: '700',
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '1.5em',
          lineHeight: '1.2',
          borderBottom: '3px solid #3498db',
          paddingBottom: '0.5em',
        }}>
          {currentSlide.slideTitle}
        </h1>

        {/* Slide Content */}
        <div style={{
          fontSize: '1.1em',
          lineHeight: '1.7',
          color: '#34495e',
          maxWidth: '100%',
          margin: '0 auto',
        }}>
          {currentSlide.contentBlocks.map((block, idx) => renderContentBlock(block, idx))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div 
        className="slide-navigation-controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5em 2em',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          borderRadius: isFullscreen ? '0' : '0 0 12px 12px',
        }}
      >
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          style={{
            padding: '0.8em 1.5em',
            fontSize: '1em',
            fontWeight: '600',
            border: '2px solid #007bff',
            borderRadius: '8px',
            backgroundColor: currentSlideIndex === 0 ? '#e9ecef' : '#007bff',
            color: currentSlideIndex === 0 ? '#6c757d' : '#ffffff',
            cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '120px',
          }}
          onMouseEnter={(e) => {
            if (currentSlideIndex > 0) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={(e) => {
            if (currentSlideIndex > 0) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          ← Previous
        </button>

        {/* Slide Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1em',
          fontSize: '1.1em',
          fontWeight: '500',
          color: '#495057',
        }}>
          <span>{currentSlideIndex + 1} / {deck.slides.length}</span>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '0.5em',
              border: '1px solid #6c757d',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#6c757d',
              cursor: 'pointer',
              fontSize: '0.9em',
              transition: 'all 0.3s ease',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '⏹' : '⛶'}
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === deck.slides.length - 1}
          style={{
            padding: '0.8em 1.5em',
            fontSize: '1em',
            fontWeight: '600',
            border: '2px solid #007bff',
            borderRadius: '8px',
            backgroundColor: currentSlideIndex === deck.slides.length - 1 ? '#e9ecef' : '#007bff',
            color: currentSlideIndex === deck.slides.length - 1 ? '#6c757d' : '#ffffff',
            cursor: currentSlideIndex === deck.slides.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '120px',
          }}
          onMouseEnter={(e) => {
            if (currentSlideIndex < deck.slides.length - 1) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={(e) => {
            if (currentSlideIndex < deck.slides.length - 1) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          Next →
        </button>
      </div>

      {/* Slide Thumbnails */}
      <div style={{
        display: 'flex',
        gap: '0.8em',
        padding: '1em 2em',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #dee2e6',
        overflowX: 'auto',
        justifyContent: 'center',
      }}>
        {deck.slides.map((slide, index) => (
          <div
            key={slide.slideId}
            onClick={() => goToSlide(index)}
            style={{
              minWidth: '120px',
              padding: '0.8em',
              border: `2px solid ${index === currentSlideIndex ? '#007bff' : '#dee2e6'}`,
              borderRadius: '8px',
              backgroundColor: index === currentSlideIndex ? '#f8f9ff' : '#ffffff',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              boxShadow: index === currentSlideIndex ? '0 4px 8px rgba(0, 123, 255, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{
              fontSize: '0.8em',
              fontWeight: '600',
              color: index === currentSlideIndex ? '#007bff' : '#6c757d',
              marginBottom: '0.3em',
            }}>
              {slide.slideNumber}
            </div>
            <div style={{
              fontSize: '0.75em',
              color: '#495057',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {slide.slideTitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckDeckGoRenderer; 