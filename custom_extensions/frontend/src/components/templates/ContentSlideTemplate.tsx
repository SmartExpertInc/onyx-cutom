// custom_extensions/frontend/src/components/templates/ContentSlideTemplate.tsx

import React from 'react';
import { ContentSlideProps } from '@/types/slideTemplates';

export const ContentSlideTemplate: React.FC<ContentSlideProps> = ({
  slideId,
  title,
  content,
  backgroundColor = '#261c4e',
  titleColor = '#ffffff',
  contentColor = '#d9e1ff',
  alignment = 'left',
  backgroundImage,
  isEditable = false,
  onUpdate
}) => {
  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    padding: '80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '45px',
    fontFamily: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 700,
    color: titleColor,
    textAlign: alignment,
    marginBottom: '40px',
    lineHeight: 1.3,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontFamily: "'Martian Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
    fontWeight: 400,
    color: contentColor,
    textAlign: alignment,
    lineHeight: 1.6,
    maxWidth: '800px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
  };

  const editOverlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    display: isEditable ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const handleClick = () => {
    if (isEditable && onUpdate) {
      onUpdate({ slideId });
    }
  };

  // Parse content as simple HTML or markdown-like formatting
  const parseContent = (text: string) => {
    // Simple parsing for basic formatting (this could be expanded)
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Handle bold text **text**
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle italic text *text*
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p 
          key={index} 
          style={{ marginBottom: '16px' }}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  return (
    <div className="content-slide-template" style={slideStyles} onClick={handleClick}>
      {/* Title */}
      <h1 style={titleStyles}>
        {title}
      </h1>

      {/* Content */}
      <div style={contentStyles}>
        {parseContent(content)}
      </div>

      {/* Edit Overlay */}
      <div style={editOverlayStyles}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Click to edit content slide
        </div>
      </div>
    </div>
  );
};

export default ContentSlideTemplate; 