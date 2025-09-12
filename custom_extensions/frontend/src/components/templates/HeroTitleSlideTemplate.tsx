// custom_extensions/frontend/src/components/templates/HeroTitleSlideTemplate.tsx

import React, { useState } from 'react';
import { HeroTitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const HeroTitleSlideTemplate: React.FC<HeroTitleSlideProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  subtitle,
  showAccent = true,
  accentPosition = 'left',
  backgroundImage,
  textAlign = 'center',
  titleSize = 'xlarge',
  subtitleSize = 'medium',
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor, accentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: '80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden'
  };

  const getTitleFontSize = (size: string): string => {
    // Use theme font size as base, but allow size variations
    const baseSize = parseInt(currentTheme.fonts.titleSize);
    switch (size) {
      case 'small': return `${baseSize - 10}px`;
      case 'medium': return `${baseSize - 5}px`;
      case 'large': return `${baseSize}px`;
      case 'xlarge': return `${baseSize + 5}px`;
      default: return currentTheme.fonts.titleSize;
    }
  };

  const getSubtitleFontSize = (size: string): string => {
    // Use theme content font size as base for subtitles
    const baseSize = parseInt(currentTheme.fonts.contentSize);
    switch (size) {
      case 'small': return `${baseSize}px`;
      case 'medium': return `${baseSize + 4}px`;
      case 'large': return `${baseSize + 8}px`;
      default: return `${baseSize + 4}px`;
    }
  };

  const titleStyles: React.CSSProperties = {
    fontSize: getTitleFontSize(titleSize),
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: 700,
    color: titleColor,
    textAlign: textAlign as any,
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    zIndex: 2,
    position: 'relative',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: getSubtitleFontSize(subtitleSize),
    fontFamily: currentTheme.fonts.contentFont,
    fontWeight: 400,
    color: subtitleColor,
    textAlign: textAlign as any,
    lineHeight: 1.6,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
    zIndex: 2,
    position: 'relative',
    wordWrap: 'break-word'
  };

  const getAccentStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: accentColor,
      zIndex: 1
    };

    switch (accentPosition) {
      case 'left':
        return {
          ...baseStyles,
          left: 0,
          top: 0,
          bottom: 0,
          width: '8px'
        };
      case 'right':
        return {
          ...baseStyles,
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px'
        };
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          height: '8px'
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px'
        };
      default:
        return baseStyles;
    }
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  return (
    <div className="hero-title-slide-template" style={slideStyles}>
      {/* Accent Element */}
      {showAccent && <div style={getAccentStyles()}></div>}

      {/* Content Container */}
      <div style={inline({
        display: 'flex',
        flexDirection: 'column',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        zIndex: 2,
        position: 'relative',
        width: '100%'
      })}>
        {/* Main Title */}
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter hero title..."
            className="inline-editor-title"
            style={inline({
              ...titleStyles,
              // Ensure title behaves exactly like h1 element
              padding: '0',
              border: 'none',
              outline: 'none',
              resize: 'none',
              overflow: 'hidden',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
              display: 'block',
              lineHeight: '1.2'
            })}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={() => {
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {title || 'Click to add hero title'}
          </h1>
        )}

        {/* Subtitle */}
        {isEditable && editingSubtitle ? (
          <ImprovedInlineEditor
            initialValue={subtitle || ''}
            onSave={handleSubtitleSave}
            onCancel={handleSubtitleCancel}
            multiline={true}
            placeholder="Enter subtitle..."
            className="inline-editor-subtitle"
            style={inline({
              ...subtitleStyles,
              // Ensure subtitle behaves exactly like div element
              margin: '0',
              padding: '0',
              border: 'none',
              outline: 'none',
              resize: 'none',
              overflow: 'hidden',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
              display: 'block',
              lineHeight: '1.6'
            })}
          />
        ) : (
          <div 
            style={subtitleStyles}
            onClick={() => {
              if (isEditable) {
                setEditingSubtitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {subtitle || 'Click to add subtitle'}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroTitleSlideTemplate; 