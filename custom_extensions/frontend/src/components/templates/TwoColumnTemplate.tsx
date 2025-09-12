// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React, { useState } from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
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

export const TwoColumnTemplate: React.FC<TwoColumnProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  leftTitle,
  leftContent,
  leftImageAlt,
  leftImagePrompt,
  leftImagePath,
  rightTitle,
  rightContent,
  rightImageAlt,
  rightImagePrompt,
  rightImagePath,
  columnRatio,
  theme,
  onUpdate,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLeftTitle, setEditingLeftTitle] = useState(false);
  const [editingLeftContent, setEditingLeftContent] = useState(false);
  const [editingRightTitle, setEditingRightTitle] = useState(false);
  const [editingRightContent, setEditingRightContent] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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

  // AI prompt logic
  const leftDisplayPrompt = leftImagePrompt || leftImageAlt || 'relevant illustration for the left column';
  const rightDisplayPrompt = rightImagePrompt || rightImageAlt || 'relevant illustration for the right column';

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    maxHeight: '200px',
    margin: '0',
    marginBottom: '24px'
  };

  const titleStyles: React.CSSProperties = {
    textAlign: 'left',
    marginBottom: '40px',
    fontWeight: '700',
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: currentTheme.fonts.titleSize,
    color: currentTheme.colors.titleColor,
    wordWrap: 'break-word'
  };

  const columnTitleStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: '27px',
    color: currentTheme.colors.titleColor,
    margin: '16px 0 16px 0',
    alignSelf: 'flex-start',
    wordWrap: 'break-word'
  };

  const columnContentStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.contentFont,
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    margin: 0,
    alignSelf: 'flex-start',
    lineHeight: 1.6,
    overflowWrap: 'anywhere'
  };

  return (
    <div
      style={inline({
        padding: '40px',
        minHeight: '600px',
        backgroundColor: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      })}
    >
      {/* Main Title */}
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
            margin: '0',
            padding: '0',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box',
            display: 'block'
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
          className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
        >
          {title || 'Click to add title'}
        </h1>
      )}

      <div
        style={inline({
          display: 'flex',
          gap: '40px',
        })}
      >
        <div style={inline({ flex: 1, display: 'flex', flexDirection: 'column' })}>
          {/* Left Clickable Image Placeholder */}
          <ClickableImagePlaceholder
            imagePath={leftImagePath}
            onImageUploaded={handleLeftImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Click to upload image"
            prompt={leftDisplayPrompt}
            isEditable={isEditable}
            style={placeholderStyles}
          />
          {/* Left Mini title */}
          {isEditable && editingLeftTitle ? (
            <ImprovedInlineEditor
              initialValue={leftTitle || ''}
              onSave={handleLeftTitleSave}
              onCancel={handleLeftTitleCancel}
              multiline={true}
              placeholder="Enter left column title..."
              className="inline-editor-left-title"
              style={inline({
                ...columnTitleStyles,
                // Ensure title behaves exactly like h2 element
                margin: '0',
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              })}
            />
          ) : (
            <h2 
              style={columnTitleStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingLeftTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {leftTitle || 'Click to add left title'}
            </h2>
          )}
          {/* Left Main text */}
          {isEditable && editingLeftContent ? (
            <ImprovedInlineEditor
              initialValue={leftContent || ''}
              onSave={handleLeftContentSave}
              onCancel={handleLeftContentCancel}
              multiline={true}
              placeholder="Enter left column content..."
              className="inline-editor-left-content"
              style={inline({
                ...columnContentStyles,
                // Ensure content behaves exactly like p element
                margin: '0',
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              })}
            />
          ) : (
            <p 
              style={columnContentStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingLeftContent(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {leftContent || 'Click to add left content'}
            </p>
          )}
        </div>
        <div style={inline({ flex: 1, display: 'flex', flexDirection: 'column'})}>
          {/* Right Clickable Image Placeholder */}
          <ClickableImagePlaceholder
            imagePath={rightImagePath}
            onImageUploaded={handleRightImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Click to upload image"
            prompt={rightDisplayPrompt}
            isEditable={isEditable}
            style={placeholderStyles}
          />
          {/* Right Mini title */}
          {isEditable && editingRightTitle ? (
            <ImprovedInlineEditor
              initialValue={rightTitle || ''}
              onSave={handleRightTitleSave}
              onCancel={handleRightTitleCancel}
              multiline={true}
              placeholder="Enter right column title..."
              className="inline-editor-right-title"
              style={inline({
                ...columnTitleStyles,
                // Ensure title behaves exactly like h2 element
                margin: '0',
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              })}
            />
          ) : (
            <h2 
              style={columnTitleStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingRightTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {rightTitle || 'Click to add right title'}
            </h2>
          )}
          {/* Right Main text */}
          {isEditable && editingRightContent ? (
            <ImprovedInlineEditor
              initialValue={rightContent || ''}
              onSave={handleRightContentSave}
              onCancel={handleRightContentCancel}
              multiline={true}
              placeholder="Enter right column content..."
              className="inline-editor-right-content"
              style={inline({
                ...columnContentStyles,
                // Ensure content behaves exactly like p element
                margin: '0',
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
              })}
            />
          ) : (
            <p 
              style={columnContentStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingRightContent(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {rightContent || 'Click to add right content'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;