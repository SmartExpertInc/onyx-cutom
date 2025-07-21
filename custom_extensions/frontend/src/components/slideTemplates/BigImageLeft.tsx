import React from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';

export const BigImageLeft: React.FC<BigImageLeftProps> = ({ 
  slideId, 
  slideNumber, 
  title, 
  image, 
  content, 
  bulletPoints 
}) => {
  return (
    <div 
      className="big-image-left-template"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        padding: '3rem',
        alignItems: 'center',
        background: '#ffffff',
      }}
    >
      {/* Left side - Image */}
      <div 
        className="image-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {image.src ? (
          <img
            src={image.src}
            alt={image.alt || image.description || 'Slide image'}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '300px',
              backgroundColor: '#F3F4F6',
              border: '2px dashed #D1D5DB',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              fontSize: '1.1rem',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            {image.description || 'Image placeholder'}
          </div>
        )}
      </div>

      {/* Right side - Content */}
      <div className="content-section">
        {/* Slide number */}
        <div 
          style={{
            fontSize: '0.9rem',
            color: '#9CA3AF',
            marginBottom: '1rem',
            fontWeight: '500',
          }}
        >
          Slide {slideNumber}
        </div>

        {/* Title */}
        <h1 
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
          }}
        >
          {title.text}
        </h1>

        {/* Content */}
        <div 
          style={{
            fontSize: '1.1rem',
            color: '#374151',
            lineHeight: '1.6',
            marginBottom: bulletPoints ? '2rem' : '0',
          }}
        >
          {content.text}
        </div>

        {/* Bullet points */}
        {bulletPoints && bulletPoints.length > 0 && (
          <ul 
            style={{
              listStyle: 'none',
              padding: '0',
              margin: '0',
            }}
          >
            {bulletPoints.map((point, index) => (
              <li 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                  fontSize: '1rem',
                  color: '#374151',
                }}
              >
                <span 
                  style={{
                    color: '#3B82F6',
                    marginRight: '0.75rem',
                    fontSize: '1.2rem',
                    lineHeight: '1.4',
                  }}
                >
                  •
                </span>
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BigImageLeft; 