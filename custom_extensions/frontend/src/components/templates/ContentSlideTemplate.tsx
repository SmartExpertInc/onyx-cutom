// custom_extensions/frontend/src/components/templates/ContentSlideTemplate.tsx

import React, { useState } from 'react';
import { ContentSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

// Inline Editor Component (копіюємо з SmartSlideDeckViewer.tsx)
interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
}

function InlineEditor({ initialValue, onSave, onCancel, multiline = false }: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  if (multiline) {
    return (
      <textarea
        className="inline-editor-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={4}
        style={{
          width: '100%',
          border: '2px solid #3b82f6',
          borderRadius: '4px',
          padding: '8px',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          outline: 'none',
          resize: 'vertical',
          minHeight: '100px'
        }}
      />
    );
  }

  return (
    <input
      className="inline-editor-input"
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        width: '100%',
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        padding: '8px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        outline: 'none'
      }}
    />
  );
}

export const ContentSlideTemplate: React.FC<ContentSlideProps & { 
  theme?: SlideTheme;
  onTextChange?: (slideId: string, fieldPath: string, newValue: any) => void;
  onAutoSave?: () => void;
}> = ({
  slideId,
  title,
  content,
  alignment = 'left',
  backgroundImage,
  isEditable = false,
  onUpdate,
  onTextChange,
  onAutoSave,
  theme
}) => {
  // State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);

  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
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

  // Inline editing handlers
  const handleFieldClick = (fieldPath: string) => {
    console.log('Field clicked:', fieldPath, 'isEditable:', isEditable);
    if (isEditable) {
      setEditingField(fieldPath);
    }
  };

  const handleFieldSave = (fieldPath: string, newValue: string) => {
    console.log('Field save:', fieldPath, 'newValue:', newValue);
    if (onTextChange) {
      onTextChange(slideId, fieldPath, newValue);
      if (onAutoSave) {
        onAutoSave();
      }
    }
    setEditingField(null);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
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
      {editingField === 'title' ? (
        <InlineEditor
          initialValue={title}
          onSave={(value) => handleFieldSave('title', value)}
          onCancel={handleFieldCancel}
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={() => handleFieldClick('title')}
          className={isEditable ? 'editable-field' : ''}
          title={isEditable ? 'Click to edit title' : ''}
        >
          {title}
        </h1>
      )}

      {/* Content */}
      {editingField === 'content' ? (
        <InlineEditor
          initialValue={content}
          onSave={(value) => handleFieldSave('content', value)}
          onCancel={handleFieldCancel}
          multiline={true}
        />
      ) : (
        <div 
          style={contentStyles}
          onClick={() => handleFieldClick('content')}
          className={isEditable ? 'editable-field' : ''}
          title={isEditable ? 'Click to edit content' : ''}
        >
          {parseContent(content)}
        </div>
      )}

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