// custom_extensions/frontend/src/components/templates/BigImageLeftTemplate.tsx

import React, { useState } from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const BigImageLeftTemplate: React.FC<BigImageLeftProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  imagePrompt,
  imageSize = 'large',
  slideId,
  onUpdate,
  theme,
  isEditable = false,
  imagePath
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
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
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    alignItems: 'stretch'
    // Removed overflow: 'hidden' to allow natural content expansion
  };

  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small': return { width: '300px', height: '200px' };
      case 'medium': return { width: '400px', height: '300px' };
      case 'large': 
      default: return { width: '100%', maxWidth: '500px', height: '350px' };
    }
  };

  const imageDimensions = getImageDimensions();

  const imageContainerStyles: React.CSSProperties = {
    flex: '0 0 40%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColor,
    position: 'relative',
    minWidth: 0, // для flexbox overflow
  };

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    margin: '0 auto'
  };

  const contentContainerStyles: React.CSSProperties = {
    flex: '1 1 60%',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '24px',
    lineHeight: '1.2',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
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

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  // Use imagePrompt if provided, otherwise fallback to imageAlt or default
  const displayPrompt = imagePrompt || imageAlt || "man sitting on a chair";

  return (
    <div style={slideStyles}>
      {/* Left side - Clickable Image Placeholder */}
      <div style={imageContainerStyles}>
        <ClickableImagePlaceholder
          imagePath={imagePath}
          onImageUploaded={handleImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Click to upload image"
          prompt={displayPrompt}
          isEditable={isEditable}
          style={placeholderStyles}
        />
      </div>

      {/* Right side - Content */}
      <div style={contentContainerStyles}>
        {/* Title */}
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter slide title..."
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
            {title || 'Click to add title'}
          </h1>
        )}

        {/* Subtitle */}
        {isEditable && editingSubtitle ? (
          <ImprovedInlineEditor
            initialValue={subtitle || ''}
            onSave={handleSubtitleSave}
            onCancel={handleSubtitleCancel}
            multiline={true}
            placeholder="Enter slide content..."
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
            {subtitle || 'Click to add content'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BigImageLeftTemplate; 