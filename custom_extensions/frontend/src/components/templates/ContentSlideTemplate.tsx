// custom_extensions/frontend/src/components/templates/ContentSlideTemplate.tsx

import React, { useState, useEffect } from 'react';
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
  // State for inline editing (копіюємо з TrainingPlanTable)
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Локальний стан для редагування
  const [editingTitle, setEditingTitle] = useState(title);
  const [editingContent, setEditingContent] = useState(content);
  
  // Прапорець для контролю синхронізації
  const [isEditing, setIsEditing] = useState(false);

  // Синхронізуємо локальний стан з пропсами (тільки коли не редагуємо)
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isEditing, title, content });
    if (!isEditing) {
      console.log('🔄 Syncing local state with props:', { title, content });
      setEditingTitle(title);
      setEditingContent(content);
    } else {
      console.log('🔄 Skipping sync - currently editing');
    }
  }, [title, content, isEditing]);

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

  // Helper functions (копіюємо з TrainingPlanTable)
  const startEditing = (fieldPath: string) => {
    console.log('🔄 startEditing called:', { fieldPath, isEditable, title, content });
    
    if (isEditable) {
      setEditingField(fieldPath);
      setIsEditing(true);
      // Синхронізуємо локальний стан з поточними пропсами
      if (fieldPath === 'title') {
        setEditingTitle(title);
        console.log('🔄 Set editingTitle to:', title);
      } else if (fieldPath === 'content') {
        setEditingContent(content);
        console.log('🔄 Set editingContent to:', content);
      }
    }
  };

  const stopEditing = () => {
    setEditingField(null);
    setIsEditing(false);
  };

  // Handle input changes (копіюємо з TrainingPlanTable)
  const handleInputChange = (fieldPath: string, value: string) => {
    // Оновлюємо локальний стан для плавного введення
    if (fieldPath === 'title') {
      setEditingTitle(value);
    } else if (fieldPath === 'content') {
      setEditingContent(value);
    }
  };

  // Handle input blur (копіюємо з TrainingPlanTable)
  const handleInputBlur = () => {
    console.log('🔄 handleInputBlur called:', {
      editingField,
      editingTitle,
      editingContent,
      originalTitle: title,
      originalContent: content
    });
    
    // Викликаємо onTextChange з поточним значенням локального стану
    if (onTextChange && editingField) {
      const currentValue = editingField === 'title' ? editingTitle : editingContent;
      console.log('🔄 Calling onTextChange with:', { slideId, editingField, currentValue });
      onTextChange(slideId, editingField, currentValue);
    }
    
    stopEditing();
    
    // Викликаємо автозбереження тільки при втраті фокусу
    if (onAutoSave) {
      console.log('🔄 Calling onAutoSave');
      onAutoSave();
    }
  };

  // Handle key down (копіюємо з TrainingPlanTable)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Викликаємо onTextChange з поточним значенням локального стану
      if (onTextChange && editingField) {
        const currentValue = editingField === 'title' ? editingTitle : editingContent;
        onTextChange(slideId, editingField, currentValue);
      }
      
      stopEditing();
      
      // Викликаємо автозбереження при натисканні Enter
      if (onAutoSave) {
        onAutoSave();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Скасовуємо зміни, повертаємо оригінальні значення
      setEditingTitle(title);
      setEditingContent(content);
      stopEditing();
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
      {editingField === 'title' ? (
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => handleInputChange('title', e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...titleStyles,
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            padding: '8px',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333'
          }}
          autoFocus
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={() => startEditing('title')}
          className={isEditable ? 'editable-field' : ''}
          title={isEditable ? 'Click to edit title' : ''}
        >
          {editingTitle}
        </h1>
      )}

      {/* Content */}
      {editingField === 'content' ? (
        <textarea
          value={editingContent}
          onChange={(e) => handleInputChange('content', e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...contentStyles,
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            padding: '8px',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            resize: 'vertical',
            minHeight: '200px',
            fontFamily: 'inherit'
          }}
          autoFocus
        />
      ) : (
        <div 
          style={contentStyles}
          onClick={() => startEditing('content')}
          className={isEditable ? 'editable-field' : ''}
          title={isEditable ? 'Click to edit content' : ''}
        >
          {parseContent(editingContent)}
        </div>
      )}
    </div>
  );
};

export default ContentSlideTemplate; 