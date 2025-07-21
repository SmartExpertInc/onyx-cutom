import React from 'react';
import { QuoteCenterProps } from '@/types/slideTemplates';

export const QuoteCenter: React.FC<QuoteCenterProps> = ({ 
  slideId, 
  slideNumber, 
  quote, 
  author, 
  backgroundImage 
}) => {
  const backgroundStyle = backgroundImage?.src ? {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {};

  return (
    <div 
      className="quote-center-template"
      style={{
        ...backgroundStyle,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        position: 'relative',
        background: backgroundImage?.src ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Slide number */}
      <div 
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '0.5rem 1rem',
          borderRadius: '1rem',
          fontSize: '0.9rem',
          color: 'white',
          fontWeight: '500',
        }}
      >
        {slideNumber}
      </div>

      {/* Quote mark */}
      <div 
        style={{
          fontSize: '4rem',
          color: 'rgba(255, 255, 255, 0.3)',
          lineHeight: '1',
          marginBottom: '1rem',
        }}
      >
        "
      </div>

      {/* Quote text */}
      <blockquote 
        style={{
          fontSize: 'clamp(1.5rem, 5vw, 3rem)',
          fontWeight: '300',
          color: 'white',
          maxWidth: '80%',
          lineHeight: '1.3',
          marginBottom: '2rem',
          fontStyle: 'italic',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {quote.text}
      </blockquote>

      {/* Author */}
      {author && (
        <cite 
          style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontStyle: 'normal',
            fontWeight: '500',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          — {author.text}
        </cite>
      )}

      {/* Decorative elements */}
      <div 
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '3rem',
        }}
      >
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.4)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default QuoteCenter; 