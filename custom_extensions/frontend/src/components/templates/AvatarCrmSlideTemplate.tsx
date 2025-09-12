// custom_extensions/frontend/src/components/templates/AvatarCrmSlideTemplate.tsx

import React, { useState } from 'react';
import { AvatarSlideProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import AvatarImageDisplay from '../AvatarImageDisplay';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const AvatarCrmSlideTemplate: React.FC<AvatarSlideProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  subtitle,
  content,
  avatarPath,
  avatarAlt,
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editingBanner, setEditingBanner] = useState(false);
  const [editingChecklistItems, setEditingChecklistItems] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleContentSave = (newContent: string) => {
    if (onUpdate) {
      onUpdate({ content: newContent });
    }
    setEditingContent(false);
  };

  const handleContentCancel = () => {
    setEditingContent(false);
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ avatarPath: newAvatarPath });
    }
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    minHeight: '100vh',
    backgroundColor,
    display: 'flex',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden'
  };

  const leftPanelStyles: React.CSSProperties = {
    width: '40%',
    height: '100vh',
    minHeight: '100vh',
    backgroundColor: backgroundColor,
    padding: '60px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative'
  };

  const rightPanelStyles: React.CSSProperties = {
    width: '60%',
    height: '100vh',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  };

  const avatarStyles: React.CSSProperties = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '30px',
    border: '4px solid rgba(255, 255, 255, 0.2)'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '20px',
    lineHeight: 1.3,
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    marginBottom: '40px',
    lineHeight: 1.5,
    opacity: 0.9
  };

  const bannerStyles: React.CSSProperties = {
    backgroundColor: titleColor,
    color: backgroundColor,
    padding: '12px 20px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '30px',
    display: 'inline-block',
    alignSelf: 'flex-start'
  };

  const checklistStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px'
  };

  const checklistItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    fontSize: '16px',
    color: contentColor,
    lineHeight: 1.4
  };

  const checkmarkStyles: React.CSSProperties = {
    color: titleColor,
    marginRight: '12px',
    fontSize: '18px',
    flexShrink: 0
  };

  // CRM Interface Styles
  const crmContainerStyles: React.CSSProperties = {
    flex: '1',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    margin: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  const crmHeaderStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const crmTitleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const crmCloseStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    color: '#666',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const crmSubtitleStyles: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '20px'
  };

  const searchBarStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '1rem',
    backgroundColor: '#f8f9fa'
  };

  const clientListStyles: React.CSSProperties = {
    flex: '1'
  };

  const clientItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  };

  const clientInfoStyles: React.CSSProperties = {
    flex: '1'
  };

  const clientNameStyles: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const clientEmailStyles: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#666'
  };

  // Image Placeholder Styles (full width of right panel, full height)
  const imagePlaceholderStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={slideStyles}>
      {/* Left Panel - Dark Promotional Section */}
      <div style={leftPanelStyles}>
        {/* Pink Banner */}
        <div style={bannerStyles}>
          {isEditable && editingBanner ? (
            <ImprovedInlineEditor
              initialValue={title || 'Личное отношение - залог следующих ВИЗИТОВ'}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter banner text..."
              className="inline-editor-banner"
              style={inline({
                ...bannerStyles,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                color: 'inherit',
                margin: '0',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              })}
            />
          ) : (
            <div 
              onClick={() => {
                if (isEditable) {
                  setEditingBanner(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-white hover:border-opacity-50' : ''}
            >
              {title || 'Личное отношение - залог следующих ВИЗИТОВ'}
            </div>
          )}
        </div>
        
        {/* Checklist */}
        <div style={checklistStyles}>
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            {isEditable && editingSubtitle ? (
              <ImprovedInlineEditor
                initialValue={subtitle || 'Помните детали'}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                multiline={false}
                placeholder="Enter checklist item..."
                className="inline-editor-checklist"
                style={inline({
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  boxSizing: 'border-box',
                  display: 'block',
                  color: 'inherit',
                  margin: '0',
                  padding: '0',
                  fontSize: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px'
                })}
              />
            ) : (
              <span 
                onClick={() => {
                  if (isEditable) {
                    setEditingSubtitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-white hover:border-opacity-50' : ''}
              >
                {subtitle || 'Помните детали'}
              </span>
            )}
          </div>
          
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            {isEditable && editingContent ? (
              <ImprovedInlineEditor
                initialValue={content || 'Интересуйтесь'}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={false}
                placeholder="Enter checklist item..."
                className="inline-editor-checklist"
                style={inline({
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  boxSizing: 'border-box',
                  display: 'block',
                  color: 'inherit',
                  margin: '0',
                  padding: '0',
                  fontSize: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px'
                })}
              />
            ) : (
              <span 
                onClick={() => {
                  if (isEditable) {
                    setEditingContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-white hover:border-opacity-50' : ''}
              >
                {content || 'Интересуйтесь'}
              </span>
            )}
          </div>
          
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            <span>Сохраняйте тёплый контакт</span>
          </div>
          
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            <span>Клиент это почувствует</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Image Only */}
      <div style={rightPanelStyles}>
        {/* Avatar Display - full width of right panel, full height */}
        <AvatarImageDisplay
          size="LARGE"
          position="CENTER"
          className="!h-screen !max-h-none !min-h-screen !w-full"
          style={inline({
            width: '100%',
            height: '100vh',
            minHeight: '100vh',
            maxHeight: '100vh',
            objectFit: 'cover',
            borderRadius: '0'
          })}
        />
      </div>
    </div>
  );
}; 