// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export const TwoColumnTemplate: React.FC<TwoColumnProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  leftTitle,
  leftContent,
  leftImagePath,
  leftImageAlt,
  rightTitle,
  rightContent,
  rightImagePath,
  rightImageAlt,
  theme,
  onUpdate,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingLeftTitle, setEditingLeftTitle] = useState(false);
  const [editingLeftContent, setEditingLeftContent] = useState(false);
  const [editingRightTitle, setEditingRightTitle] = useState(false);
  const [editingRightContent, setEditingRightContent] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle left title editing
  const handleLeftTitleSave = (newLeftTitle: string) => {
    if (onUpdate) {
      onUpdate({ leftTitle: newLeftTitle });
    }
    setEditingLeftTitle(false);
  };

  const handleLeftTitleCancel = () => {
    setEditingLeftTitle(false);
  };

  // Handle left content editing
  const handleLeftContentSave = (newLeftContent: string) => {
    if (onUpdate) {
      onUpdate({ leftContent: newLeftContent });
    }
    setEditingLeftContent(false);
  };

  const handleLeftContentCancel = () => {
    setEditingLeftContent(false);
  };

  // Handle right title editing
  const handleRightTitleSave = (newRightTitle: string) => {
    if (onUpdate) {
      onUpdate({ rightTitle: newRightTitle });
    }
    setEditingRightTitle(false);
  };

  const handleRightTitleCancel = () => {
    setEditingRightTitle(false);
  };

  // Handle right content editing
  const handleRightContentSave = (newRightContent: string) => {
    if (onUpdate) {
      onUpdate({ rightContent: newRightContent });
    }
    setEditingRightContent(false);
  };

  const handleRightContentCancel = () => {
    setEditingRightContent(false);
  };

  // Handle left image upload
  const handleLeftImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ leftImagePath: newImagePath });
    }
  };

  // Handle right image upload
  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ rightImagePath: newImagePath });
    }
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    background: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '60px 40px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const columnsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '0px',
    width: '100%',
    maxWidth: '1400px',
    height: '100%',
    position: 'relative',
    alignItems: 'stretch',
  };

  const columnStyles: React.CSSProperties = {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '40px 30px 20px 30px',
    borderRadius: '8px',
    position: 'relative'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3.1rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: 1.2,
    maxWidth: '375px',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)'
  };

  const subtitleStyles: React.CSSProperties = {
    width: '468px',
    fontSize: '1.4rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.subtitleColor,
    textAlign: 'center',
    marginBottom: '60px',
    marginTop: '0px',
    lineHeight: 1.4,
    maxWidth: '500px',
    wordWrap: 'break-word',
    opacity: 0.9,
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)'
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '497px',
    height: '290px',
    display: 'flex',
    marginTop: 'auto',
    marginBottom: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px'
  };

  const dividerLineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '0',
    bottom: '0',
    width: '1px',
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0),      /* верх — прозрачный */ rgba(255, 255, 255, 0.9) 50%,/* центр — ярко-белый */ rgba(255, 255, 255, 0)', // Полупрозрачная белая линия
    transform: 'translateX(-50%)',
    zIndex: 1
  };

  return (
    <div
      ref={slideContainerRef}
      style={slideStyles}
    >
      <div style={columnsContainerStyles}>
        {/* Divider Line */}
        <div style={dividerLineStyles}></div>
        
        {/* Left Column */}
        <div style={columnStyles}>
          {/* Left Title */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%', minHeight: '140px', marginBottom: '10px' }}>
            {isEditable && editingLeftTitle ? (
              <WysiwygEditor
                initialValue={leftTitle || 'Assess risks for the organization.'}
                onSave={handleLeftTitleSave}
                onCancel={handleLeftTitleCancel}
                placeholder="Enter left title..."
                className="inline-editor-left-title"
                style={{
                  ...titleStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              />
            ) : (
              <h1 
                style={titleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingLeftTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: leftTitle || 'Assess risks for the organization.' }}
              />
            )}
          </div>

          {/* Left Subtitle */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
            {isEditable && editingLeftContent ? (
              <WysiwygEditor
                initialValue={leftContent || 'Present with Canva like a professional using presenter mode.'}
                onSave={handleLeftContentSave}
                onCancel={handleLeftContentCancel}
                placeholder="Enter left subtitle..."
                className="inline-editor-left-content"
                style={{
                  ...subtitleStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.4'
                }}
              />
            ) : (
              <p 
                style={subtitleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingLeftContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: leftContent || 'Present with Canva like a professional using presenter mode.' }}
              />
            )}
          </div>

          {/* Left Image */}
          <div style={imageContainerStyles}>
            <ClickableImagePlaceholder
              imagePath={leftImagePath}
              onImageUploaded={handleLeftImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Click to upload image"
              prompt="relevant illustration for the left column"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px'
              }}
              elementId="left-image"
              cropMode="cover"
              slideContainerRef={slideContainerRef}
            />
          </div>
        </div>

        {/* Right Column */}
        <div style={columnStyles}>
          {/* Right Title */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%', minHeight: '140px', marginBottom: '10px' }}>
            {isEditable && editingRightTitle ? (
              <WysiwygEditor
                initialValue={rightTitle || 'Assess risks for the organization.'}
                onSave={handleRightTitleSave}
                onCancel={handleRightTitleCancel}
                placeholder="Enter right title..."
                className="inline-editor-right-title"
                style={{
                  ...titleStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              />
            ) : (
              <h1 
                style={titleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingRightTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: rightTitle || 'Assess risks for the organization.' }}
              />
            )}
          </div>

          {/* Right Subtitle */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
            {isEditable && editingRightContent ? (
              <WysiwygEditor
                initialValue={rightContent || 'Present with Canva like a professional using presenter mode.'}
                onSave={handleRightContentSave}
                onCancel={handleRightContentCancel}
                placeholder="Enter right subtitle..."
                className="inline-editor-right-content"
                style={{
                  ...subtitleStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.4'
                }}
              />
            ) : (
              <p 
                style={subtitleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingRightContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                dangerouslySetInnerHTML={{ __html: rightContent || 'Present with Canva like a professional using presenter mode.' }}
              />
            )}
          </div>

          {/* Right Image */}
          <div style={imageContainerStyles}>
            <ClickableImagePlaceholder
              imagePath={rightImagePath}
              onImageUploaded={handleRightImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Click to upload image"
              prompt="relevant illustration for the right column"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px'
              }}
              elementId="right-image"
              cropMode="cover"
              slideContainerRef={slideContainerRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;