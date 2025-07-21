import React from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';

export const TwoColumn: React.FC<TwoColumnProps> = ({ 
  slideId, 
  slideNumber, 
  title, 
  leftColumn, 
  rightColumn 
}) => {
  return (
    <div 
      className="two-column-template"
      style={{
        minHeight: '100vh',
        padding: '3rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1 
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0',
          }}
        >
          {title.text}
        </h1>
        
        <div 
          style={{
            fontSize: '1rem',
            color: '#6B7280',
            fontWeight: '500',
          }}
        >
          Slide {slideNumber}
        </div>
      </div>

      {/* Two columns container */}
      <div 
        style={{
          flex: '1',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column */}
        <div 
          style={{
            padding: '2rem',
            background: '#F8FAFC',
            borderRadius: '1rem',
            border: '1px solid #E2E8F0',
          }}
        >
          {leftColumn.heading && (
            <h2 
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '1.5rem',
                margin: '0 0 1.5rem 0',
              }}
            >
              {leftColumn.heading.text}
            </h2>
          )}

          {leftColumn.image?.src && (
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={leftColumn.image.src}
                alt={leftColumn.image.alt || leftColumn.image.description || 'Left column image'}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  maxHeight: '200px',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          <div 
            style={{
              fontSize: '1.1rem',
              color: '#374151',
              lineHeight: '1.6',
            }}
          >
            {leftColumn.content.text}
          </div>
        </div>

        {/* Right Column */}
        <div 
          style={{
            padding: '2rem',
            background: '#FEF7F0',
            borderRadius: '1rem',
            border: '1px solid #FED7AA',
          }}
        >
          {rightColumn.heading && (
            <h2 
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '1.5rem',
                margin: '0 0 1.5rem 0',
              }}
            >
              {rightColumn.heading.text}
            </h2>
          )}

          {rightColumn.image?.src && (
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={rightColumn.image.src}
                alt={rightColumn.image.alt || rightColumn.image.description || 'Right column image'}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '0.5rem',
                  maxHeight: '200px',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          <div 
            style={{
              fontSize: '1.1rem',
              color: '#374151',
              lineHeight: '1.6',
            }}
          >
            {rightColumn.content.text}
          </div>
        </div>
      </div>

      {/* Footer decoration */}
      <div 
        style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <div 
          style={{
            width: '2rem',
            height: '4px',
            background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
            borderRadius: '2px',
          }}
        />
        <div 
          style={{
            width: '2rem',
            height: '4px',
            background: 'linear-gradient(90deg, #F59E0B, #D97706)',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
};

export default TwoColumn; 