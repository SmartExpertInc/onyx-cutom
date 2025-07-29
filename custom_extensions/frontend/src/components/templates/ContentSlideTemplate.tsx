// custom_extensions/frontend/src/components/templates/ContentSlideTemplate.tsx

import React from 'react';
import { ContentSlideProps } from '@/types/slideTemplates';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export const ContentSlideTemplate: React.FC<ContentSlideProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  content,
  alignment = 'left',
  backgroundImage,
  onUpdate,
  theme
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSafeSlideTheme();
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
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
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: 700,
    color: titleColor,
    textAlign: alignment,
    marginBottom: '40px',
    lineHeight: 1.3,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    fontWeight: 400,
    color: contentColor,
    textAlign: alignment,
    lineHeight: 1.6,
    maxWidth: '800px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
  };

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
  };

  const handleContentChange = (newContent: string) => {
    if (onUpdate) {
      onUpdate({ content: newContent });
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
    <div className="content-slide-template" style={slideStyles}>
      {/* Title */}
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="slide-title-editable"
        />
      </h1>

      {/* Content */}
      <div style={contentStyles}>
        <SimpleInlineEditor
          value={content || ''}
          onSave={handleContentChange}
          multiline={true}
          placeholder="Enter slide content..."
          maxLength={2000}
          rows={8}
          className="slide-content-editable"
        />
      </div>
    </div>
  );
};

export default ContentSlideTemplate; 