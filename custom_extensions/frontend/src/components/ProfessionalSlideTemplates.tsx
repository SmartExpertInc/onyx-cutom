import React from 'react';
import { DeckSlide, AnyContentBlock, HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock } from '@/types/pdfLesson';

interface SlideTemplateProps {
  slide: DeckSlide;
  isEditable?: boolean;
  onBlockClick?: (blockIndex: number) => void;
  editingBlock?: number | null;
  renderInlineEditor?: (block: AnyContentBlock, blockIndex: number) => React.ReactNode;
}

// Professional color scheme
const colors = {
  primary: '#1e3a8a',      // Deep navy
  secondary: '#3b82f6',    // Professional blue
  accent: '#0891b2',       // Modern teal
  success: '#059669',      // Success green
  warning: '#d97706',      // Warning amber
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  darkGray: '#374151'
};

// Helper function to render content blocks
const renderContentBlock = (
  block: AnyContentBlock, 
  blockIndex: number, 
  props: SlideTemplateProps
): React.ReactNode => {
  const { isEditable, onBlockClick, editingBlock, renderInlineEditor } = props;
  const isEditing = editingBlock === blockIndex;

  if (isEditing && renderInlineEditor) {
    return renderInlineEditor(block, blockIndex);
  }

  const handleClick = () => {
    if (isEditable && onBlockClick) {
      onBlockClick(blockIndex);
    }
  };

  switch (block.type) {
    case 'headline':
      const headlineBlock = block as HeadlineBlock;
      const HeadingTag = `h${headlineBlock.level}` as keyof JSX.IntrinsicElements;
      return (
        <div onClick={handleClick} className="cursor-pointer">
          {React.createElement(HeadingTag, {
            className: `professional-headline level-${headlineBlock.level}`,
            style: {
              color: headlineBlock.level === 1 ? colors.primary : colors.secondary,
              fontWeight: 'bold',
              marginBottom: headlineBlock.level === 1 ? '0.5rem' : '0.375rem',
              fontSize: headlineBlock.level === 1 ? '1.25rem' : headlineBlock.level === 2 ? '1.125rem' : '1rem',
              lineHeight: '1.2'
            }
          }, headlineBlock.text)}
        </div>
      );

    case 'paragraph':
      const paragraphBlock = block as ParagraphBlock;
      return (
        <p 
          onClick={handleClick}
          className="cursor-pointer professional-paragraph"
          style={{
            color: colors.darkGray,
            fontSize: '0.875rem',
            lineHeight: '1.4',
            marginBottom: '0.5rem'
          }}
        >
          {paragraphBlock.text}
        </p>
      );

    case 'bullet_list':
      const bulletBlock = block as BulletListBlock;
      return (
        <ul 
          onClick={handleClick}
          className="cursor-pointer professional-bullet-list"
          style={{ listStyle: 'none', padding: 0 }}
        >
          {bulletBlock.items.map((item, index) => (
            <li 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.375rem',
                fontSize: '0.875rem',
                lineHeight: '1.3'
              }}
            >
              <span 
                style={{
                  color: colors.accent,
                  marginRight: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  marginTop: '0.05rem'
                }}
              >
                •
              </span>
              <span style={{ color: colors.darkGray }}>
                {typeof item === 'string' ? item : 'Complex item'}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'numbered_list':
      const numberedBlock = block as NumberedListBlock;
      return (
        <ol 
          onClick={handleClick}
          className="cursor-pointer professional-numbered-list"
          style={{ listStyle: 'none', padding: 0 }}
        >
          {numberedBlock.items.map((item, index) => (
            <li 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.375rem',
                fontSize: '0.875rem',
                lineHeight: '1.3'
              }}
            >
              <span 
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: '50%',
                  width: '1.25rem',
                  height: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                {index + 1}
              </span>
              <span style={{ color: colors.darkGray }}>
                {typeof item === 'string' ? item : 'Complex item'}
              </span>
            </li>
          ))}
        </ol>
      );

    case 'alert':
      const alertBlock = block as AlertBlock;
      const alertColors = {
        info: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        danger: '#dc2626'
      };
      return (
        <div 
          onClick={handleClick}
          className="cursor-pointer professional-alert"
          style={{
            backgroundColor: `${alertColors[alertBlock.alertType]}15`,
            border: `2px solid ${alertColors[alertBlock.alertType]}`,
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '0.5rem'
          }}
        >
          {alertBlock.title && (
            <div style={{
              fontWeight: 'bold',
              color: alertColors[alertBlock.alertType],
              marginBottom: '0.25rem',
              fontSize: '0.875rem'
            }}>
              {alertBlock.title}
            </div>
          )}
          <div style={{ color: colors.darkGray, fontSize: '0.875rem' }}>
            {alertBlock.text}
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Title Template
export const TitleTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  
  return (
    <div 
      className="slide-template title-template"
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        color: colors.white,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}
    >
      {slide.contentBlocks.map((block, index) => (
        <div key={index} style={{ marginBottom: index === 0 ? '1rem' : '0' }}>
          {renderContentBlock(block, index, { ...props, slide })}
        </div>
      ))}
    </div>
  );
};

// Content Template
export const ContentTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  
  return (
    <div 
      className="slide-template content-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {slide.contentBlocks.map((block, index) => (
        <div key={index} style={{ marginBottom: '0.75rem' }}>
          {renderContentBlock(block, index, { ...props, slide })}
        </div>
      ))}
    </div>
  );
};

// Four Bullets Template - Exact match to attached image
export const FourBulletsTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const headline = slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const bulletList = slide.contentBlocks.find(block => block.type === 'bullet_list') as BulletListBlock;
  
  // Icons matching the attached image
  const icons = ['💉', '🌦️', '❄️', '🍃']; // syringe, weather, snowflake, leaf
  
  return (
    <div 
      className="slide-template four-bullets-template"
      style={{
        backgroundColor: colors.white,
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {headline && (
        <div 
          onClick={() => props.isEditable && props.onBlockClick && props.onBlockClick(0)}
          style={{ 
            marginBottom: '2rem', 
            textAlign: 'left',
            cursor: props.isEditable ? 'pointer' : 'default'
          }}
        >
          {props.editingBlock === 0 && props.renderInlineEditor ? 
            props.renderInlineEditor(headline, 0) :
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {headline.text}
            </h1>
          }
        </div>
      )}
      
      {bulletList && (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            alignItems: 'start'
          }}
        >
          {bulletList.items.slice(0, 4).map((item, index) => (
            <div 
              key={index}
              onClick={() => props.isEditable && props.onBlockClick && props.onBlockClick(1)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: props.isEditable ? 'pointer' : 'default'
              }}
            >
              <div 
                style={{
                  fontSize: '2rem',
                  flexShrink: 0,
                  lineHeight: '1'
                }}
              >
                {icons[index] || '•'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                  lineHeight: '1.3'
                }}>
                  {typeof item === 'string' ? item.split(' ').slice(0, 2).join(' ') : 'Title'}
                </h3>
                {props.editingBlock === 1 && props.renderInlineEditor ? 
                  props.renderInlineEditor(bulletList, 1) :
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {typeof item === 'string' ? item : 'Description text goes here'}
                  </p>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Six Bullets Template
export const SixBulletsTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const headline = slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const bulletList = slide.contentBlocks.find(block => block.type === 'bullet_list') as BulletListBlock;
  
  return (
    <div 
      className="slide-template six-bullets-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {headline && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {renderContentBlock(headline, 0, { ...props, slide })}
        </div>
      )}
      
      {bulletList && (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            alignItems: 'start'
          }}
        >
          {bulletList.items.slice(0, 6).map((item, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: colors.lightGray,
                padding: '1rem',
                borderRadius: '6px',
                border: `2px solid ${colors.secondary}`,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.white,
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {index + 1}
              </div>
              <div style={{ 
                color: colors.darkGray, 
                fontSize: '0.875rem', 
                fontWeight: '500',
                lineHeight: '1.3'
              }}>
                {typeof item === 'string' ? item : 'Complex item'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Steps Template
export const StepsTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const headline = slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const numberedList = slide.contentBlocks.find(block => block.type === 'numbered_list') as NumberedListBlock;
  
  return (
    <div 
      className="slide-template steps-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {headline && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {renderContentBlock(headline, 0, { ...props, slide })}
        </div>
      )}
      
      {numberedList && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {numberedList.items.map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: index % 2 === 0 ? colors.lightGray : colors.white,
                padding: '1rem',
                borderRadius: '6px',
                border: `2px solid ${colors.accent}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(2px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                {index + 1}
              </div>
              <div style={{ 
                color: colors.darkGray, 
                fontSize: '0.875rem', 
                fontWeight: '500',
                lineHeight: '1.3',
                flex: 1
              }}>
                {typeof item === 'string' ? item : 'Complex item'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Split Template
export const SplitTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const mainHeadline = slide.contentBlocks.find(block => block.type === 'headline' && (block as HeadlineBlock).level === 1) as HeadlineBlock;
  const subHeadlines = slide.contentBlocks.filter(block => block.type === 'headline' && (block as HeadlineBlock).level === 2) as HeadlineBlock[];
  const paragraphs = slide.contentBlocks.filter(block => block.type === 'paragraph') as ParagraphBlock[];
  
  return (
    <div 
      className="slide-template split-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {mainHeadline && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {renderContentBlock(mainHeadline, 0, { ...props, slide })}
        </div>
      )}
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column */}
        <div 
          style={{
            backgroundColor: colors.lightGray,
            padding: '1.25rem',
            borderRadius: '6px',
            border: `3px solid ${colors.secondary}`
          }}
        >
          {subHeadlines[0] && renderContentBlock(subHeadlines[0], 1, { ...props, slide })}
          {paragraphs[0] && (
            <div style={{ marginTop: '0.5rem' }}>
              {renderContentBlock(paragraphs[0], 2, { ...props, slide })}
            </div>
          )}
        </div>
        
        {/* Right Column */}
        <div 
          style={{
            backgroundColor: colors.lightGray,
            padding: '1.25rem',
            borderRadius: '6px',
            border: `3px solid ${colors.accent}`
          }}
        >
          {subHeadlines[1] && renderContentBlock(subHeadlines[1], 3, { ...props, slide })}
          {paragraphs[1] && (
            <div style={{ marginTop: '0.5rem' }}>
              {renderContentBlock(paragraphs[1], 4, { ...props, slide })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Comparison Template
export const ComparisonTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const mainHeadline = slide.contentBlocks.find(block => block.type === 'headline' && (block as HeadlineBlock).level === 1) as HeadlineBlock;
  const subHeadlines = slide.contentBlocks.filter(block => block.type === 'headline' && (block as HeadlineBlock).level === 2) as HeadlineBlock[];
  const paragraphs = slide.contentBlocks.filter(block => block.type === 'paragraph') as ParagraphBlock[];
  
  return (
    <div 
      className="slide-template comparison-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {mainHeadline && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {renderContentBlock(mainHeadline, 0, { ...props, slide })}
        </div>
      )}
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Before Column */}
        <div 
          style={{
            backgroundColor: '#fef2f2',
            padding: '1.25rem',
            borderRadius: '6px',
            border: '3px solid #dc2626',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#dc2626',
              color: colors.white,
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            BEFORE
          </div>
          {subHeadlines[0] && renderContentBlock(subHeadlines[0], 1, { ...props, slide })}
          {paragraphs[0] && (
            <div style={{ marginTop: '0.5rem' }}>
              {renderContentBlock(paragraphs[0], 2, { ...props, slide })}
            </div>
          )}
        </div>
        
        {/* After Column */}
        <div 
          style={{
            backgroundColor: '#f0fdf4',
            padding: '1.25rem',
            borderRadius: '6px',
            border: `3px solid ${colors.success}`,
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: colors.success,
              color: colors.white,
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            AFTER
          </div>
          {subHeadlines[1] && renderContentBlock(subHeadlines[1], 3, { ...props, slide })}
          {paragraphs[1] && (
            <div style={{ marginTop: '0.5rem' }}>
              {renderContentBlock(paragraphs[1], 4, { ...props, slide })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quote Template
export const QuoteTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const headline = slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const paragraph = slide.contentBlocks.find(block => block.type === 'paragraph') as ParagraphBlock;
  
  return (
    <div 
      className="slide-template quote-template"
      style={{
        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%)`,
        color: colors.white,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        marginBottom: '1rem'
      }}
    >
      <div 
        style={{
          fontSize: '3rem',
          opacity: 0.3,
          position: 'absolute',
          top: '0.5rem',
          left: '1rem'
        }}
      >
        "
      </div>
      
      {paragraph && (
        <div style={{ 
          fontSize: '1.125rem', 
          fontStyle: 'italic', 
          lineHeight: '1.4',
          marginBottom: '1rem',
          maxWidth: '80%'
        }}>
          {renderContentBlock(paragraph, 1, { ...props, slide })}
        </div>
      )}
      
      {headline && (
        <div style={{ fontSize: '1rem', fontWeight: 'bold', opacity: 0.9 }}>
          {renderContentBlock(headline, 0, { ...props, slide })}
        </div>
      )}
      
      <div 
        style={{
          fontSize: '3rem',
          opacity: 0.3,
          position: 'absolute',
          bottom: '0.5rem',
          right: '1rem'
        }}
      >
        "
      </div>
    </div>
  );
};

// Agenda Template
export const AgendaTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const headline = slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const numberedList = slide.contentBlocks.find(block => block.type === 'numbered_list') as NumberedListBlock;
  
  return (
    <div 
      className="slide-template agenda-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {headline && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div 
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              display: 'inline-block',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}
          >
            📋 {(headline as HeadlineBlock).text}
          </div>
        </div>
      )}
      
      {numberedList && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {numberedList.items.map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.lightGray,
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '0.75rem',
                border: `2px solid ${colors.secondary}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary + '15';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.lightGray;
              }}
            >
              <div 
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.white,
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                {index + 1}
              </div>
              <div style={{ 
                color: colors.darkGray, 
                fontSize: '0.875rem', 
                fontWeight: '500',
                flex: 1
              }}>
                {typeof item === 'string' ? item : 'Complex item'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Summary Template
export const SummaryTemplate: React.FC<SlideTemplateProps> = (props) => {
  const { slide } = props;
  const headline = slide.contentBlocks.find(block => block.type === 'headline') as HeadlineBlock;
  const bulletList = slide.contentBlocks.find(block => block.type === 'bullet_list') as BulletListBlock;
  const paragraph = slide.contentBlocks.find(block => block.type === 'paragraph') as ParagraphBlock;
  
  return (
    <div 
      className="slide-template summary-template"
      style={{
        backgroundColor: colors.white,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.lightGray}`,
        minHeight: '300px',
        marginBottom: '1rem'
      }}
    >
      {headline && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div 
            style={{
              backgroundColor: colors.success,
              color: colors.white,
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              display: 'inline-block',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}
          >
            ✓ {(headline as HeadlineBlock).text}
          </div>
        </div>
      )}
      
      {bulletList && (
        <div style={{ marginBottom: '1rem' }}>
          {bulletList.items.map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.lightGray,
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                border: `2px solid ${colors.success}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.success + '15';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.lightGray;
              }}
            >
              <div 
                style={{
                  color: colors.success,
                  marginRight: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                ✓
              </div>
              <div style={{ 
                color: colors.darkGray, 
                fontSize: '0.875rem', 
                fontWeight: '500',
                flex: 1
              }}>
                {typeof item === 'string' ? item : 'Complex item'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {paragraph && (
        <div 
          style={{
            backgroundColor: colors.primary,
            color: colors.white,
            padding: '1.25rem',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: '500',
            lineHeight: '1.4'
          }}
        >
          {renderContentBlock(paragraph, slide.contentBlocks.length - 1, { ...props, slide })}
        </div>
      )}
    </div>
  );
};

// Template mapping
export const PROFESSIONAL_TEMPLATES = {
  title: TitleTemplate,
  content: ContentTemplate,
  'four-bullets': FourBulletsTemplate,
  'six-bullets': SixBulletsTemplate,
  steps: StepsTemplate,
  split: SplitTemplate,
  comparison: ComparisonTemplate,
  quote: QuoteTemplate,
  agenda: AgendaTemplate,
  summary: SummaryTemplate
} as const;

export type TemplateKey = keyof typeof PROFESSIONAL_TEMPLATES; 