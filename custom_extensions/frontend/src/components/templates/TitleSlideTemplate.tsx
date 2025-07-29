// custom_extensions/frontend/src/components/templates/TitleSlideTemplate.tsx

import React from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export const TitleSlideTemplate: React.FC<TitleSlideProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  subtitle,
  author,
  date,
  backgroundImage,
  onUpdate,
  theme
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSafeSlideTheme();
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    if (onUpdate) { onUpdate({ subtitle: newSubtitle }); }
  };

  const handleAuthorChange = (newAuthor: string) => {
    if (onUpdate) { onUpdate({ author: newAuthor }); }
  };

  const handleDateChange = (newDate: string) => {
    if (onUpdate) { onUpdate({ date: newDate }); }
  };

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: `${parseInt(currentTheme.fonts.contentSize) + 8}px`,
    fontFamily: currentTheme.fonts.contentFont,
    color: subtitleColor,
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: 1.4,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
  };

  const metadataStyles: React.CSSProperties = {
    display: 'flex',
    gap: '32px',
    fontSize: '1rem',
    color: subtitleColor,
    textAlign: 'center',
    opacity: 0.8
  };

  const metadataItemStyles: React.CSSProperties = {
  };

  return (
    <div className="title-slide-template" style={slideStyles}>
      {/* Main Title */}
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter presentation title..."
          maxLength={100}
          className="title-slide-title-editable"
        />
      </h1>

      {/* Subtitle */}
      <div style={subtitleStyles}>
        <SimpleInlineEditor
          value={subtitle || ''}
          onSave={handleSubtitleChange}
          placeholder="Enter subtitle..."
          maxLength={200}
          className="title-slide-subtitle-editable"
        />
      </div>

      {/* Metadata */}
      <div style={metadataStyles}>
        <div style={metadataItemStyles}>
          <SimpleInlineEditor
            value={author || ''}
            onSave={handleAuthorChange}
            placeholder="Author name"
            maxLength={50}
            className="title-slide-author-editable"
          />
        </div>
        <div style={metadataItemStyles}>
          <SimpleInlineEditor
            value={date || ''}
            onSave={handleDateChange}
            placeholder="Date"
            maxLength={50}
            className="title-slide-date-editable"
          />
        </div>
      </div>
    </div>
  );
};

export default TitleSlideTemplate; 