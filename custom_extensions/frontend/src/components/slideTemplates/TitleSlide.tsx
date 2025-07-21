import React from 'react';
import { TitleSlideProps, TextProps } from '@/types/slideTemplates';

// Helper function to render styled text
const renderText = (textProps: TextProps, className?: string): React.ReactNode => {
  const style: React.CSSProperties = {
    color: textProps.color || 'inherit',
    fontWeight: textProps.style === 'bold' ? 'bold' : 'normal',
    fontStyle: textProps.style === 'italic' ? 'italic' : 'normal',
  };

  if (textProps.style === 'emphasis') {
    style.fontWeight = '600';
    style.fontSize = '1.1em';
  }

  return (
    <span style={style} className={className}>
      {textProps.text}
    </span>
  );
};

// Helper function to render background image
const renderBackgroundImage = (imageProps?: { src?: string; alt?: string }): React.CSSProperties => {
  if (!imageProps?.src) return {};
  
  return {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${imageProps.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
};

export const TitleSlide: React.FC<TitleSlideProps> = ({ 
  slideId, 
  slideNumber, 
  title, 
  subtitle, 
  backgroundImage 
}) => {
  const backgroundStyle = renderBackgroundImage(backgroundImage);
  
  return (
    <div 
      className="title-slide-template"
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
      }}
    >
      {/* Slide number indicator */}
      <div 
        className="slide-number"
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '0.5rem 1rem',
          borderRadius: '1rem',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151',
        }}
      >
        {slideNumber}
      </div>

      {/* Main title */}
      <h1 
        className="title-slide-title"
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: '700',
          marginBottom: '1.5rem',
          lineHeight: '1.1',
          maxWidth: '90%',
          color: backgroundImage?.src ? 'white' : '#1F2937',
          textShadow: backgroundImage?.src ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {renderText(title)}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <h2 
          className="title-slide-subtitle"
          style={{
            fontSize: 'clamp(1.25rem, 4vw, 2rem)',
            fontWeight: '400',
            color: backgroundImage?.src ? 'rgba(255,255,255,0.9)' : '#6B7280',
            maxWidth: '80%',
            lineHeight: '1.4',
            textShadow: backgroundImage?.src ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {renderText(subtitle)}
        </h2>
      )}

      {/* Decorative element */}
      <div 
        className="title-decoration"
        style={{
          width: '4rem',
          height: '4px',
          background: backgroundImage?.src 
            ? 'rgba(255,255,255,0.8)' 
            : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
          marginTop: '2rem',
          borderRadius: '2px',
        }}
      />
    </div>
  );
};

export default TitleSlide; 