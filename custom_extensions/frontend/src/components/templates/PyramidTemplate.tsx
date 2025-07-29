import React from 'react';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export interface PyramidItem {
  heading: string;
  description: string;
}

export interface PyramidTemplateProps {
  slideId: string;
  title: string;
  subtitle: string;
  items: PyramidItem[];
  theme?: SlideTheme;
  onUpdate?: (updates: Record<string, unknown>) => void;
}

export const PyramidTemplate: React.FC<PyramidTemplateProps> = ({
  slideId,
  title,
  subtitle,
  items = [],
  theme,
  onUpdate,
}: PyramidTemplateProps) => {
  const currentTheme = theme && theme.colors ? theme : getSafeSlideTheme();
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    if (onUpdate) { onUpdate({ subtitle: newSubtitle }); }
  };

  const handleItemChange = (index: number, field: keyof PyramidItem, value: string) => {
    if (!onUpdate || !Array.isArray(items)) return;
    
    const newItems = [...items];
    if (!newItems[index]) {
      newItems[index] = { heading: '', description: '' };
    }
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate({ items: newItems });
  };

  const slideStyles: React.CSSProperties = {
    backgroundColor,
    padding: '64px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: currentTheme.fonts.contentFont,
    minHeight: '600px',
    width: '100%',
  };

  const titleStyles: React.CSSProperties = {
    color: titleColor,
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    marginBottom: '16px',
    textAlign: 'left',
  };

  const subtitleStyles: React.CSSProperties = {
    color: contentColor,
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    marginBottom: '48px',
    maxWidth: '80%',
    lineHeight: 1.6,
    textAlign: 'left',
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    gap: '48px',
  };

  const pyramidContainerStyles: React.CSSProperties = {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px', // Remove gap between pyramid segments
    justifyContent: 'center',
  };

  const itemsContainerStyles: React.CSSProperties = {
    flex: '1 1 55%',
    position: 'relative', // Add this for absolute positioning
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '400px',
  };

  const itemWrapperStyles = (level: number): React.CSSProperties => {
    const topPositions = ['16.7%', '50%', '83.3%'];
    const leftOffsets = ['-250px', '-190px', '-120px'];
    return {
      position: 'absolute',
      width: '100%',
      top: topPositions[level],
      left: leftOffsets[level],
      transform: 'translateY(-50%)',
    };
  };
  
  const separatorLineStyles = (level: number): React.CSSProperties => {
      const topPositions = ['33.3%', '66.6%'];
      const leftOffsets = ['-250px', '-190px'];
      return {
          position: 'absolute',
          left: leftOffsets[level],
          right: 0,
          top: topPositions[level],
          height: '1px',
          background: 'rgba(255,255,255,0.2)',
      };
  };

  const itemStyles: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: '300px',
  };

  const itemHeadingStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: contentColor,
    fontFamily: currentTheme.fonts.titleFont,
    marginBottom: '8px',
  };

  const itemDescriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.4,
  };

  const PyramidSVG1 = () => {
    return (
      <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 20L180 100H20L100 20Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      </svg>
    );
  };

  const PyramidSVG2 = () => {
    return (
      <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 20L140 80H20L80 20Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      </svg>
    );
  };

  const PyramidSVG3 = () => {
    return (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 20L100 60H20L60 20Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
      </svg>
    );
  };

  return (
    <div className="pyramid-template" style={slideStyles}>
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="pyramid-title-editable"
        />
      </h1>
      <div style={subtitleStyles}>
        <SimpleInlineEditor
          value={subtitle || ''}
          onSave={handleSubtitleChange}
          multiline={true}
          placeholder="Enter slide subtitle..."
          maxLength={300}
          rows={3}
          className="pyramid-subtitle-editable"
        />
      </div>
      <div style={mainContentStyles}>
        <div style={pyramidContainerStyles}>
          <PyramidSVG1 />
          <PyramidSVG2 />
          <PyramidSVG3 />
        </div>
        <div style={itemsContainerStyles}>
          {Array.isArray(items) && items.slice(0, 3).map((item, index) => (
            <div key={index} style={itemWrapperStyles(index)}>
              <div style={itemStyles}>
                <div style={itemHeadingStyles}>
                  <SimpleInlineEditor
                    value={item.heading || ''}
                    onSave={(value) => handleItemChange(index, 'heading', value)}
                    placeholder={`Level ${index + 1} heading`}
                    maxLength={50}
                    className="pyramid-heading-editable"
                  />
                </div>
                <div style={itemDescriptionStyles}>
                  <SimpleInlineEditor
                    value={item.description || ''}
                    onSave={(value) => handleItemChange(index, 'description', value)}
                    multiline={true}
                    placeholder={`Level ${index + 1} description`}
                    maxLength={200}
                    rows={3}
                    className="pyramid-description-editable"
                  />
                </div>
              </div>
            </div>
          ))}
          <div style={separatorLineStyles(0)} />
          <div style={separatorLineStyles(1)} />
        </div>
      </div>
    </div>
  );
};

export default PyramidTemplate; 