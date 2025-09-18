// custom_extensions/frontend/src/components/SimpleRichTextEditor.tsx

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface SimpleRichTextEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  allowFormatting?: boolean;
}

export function SimpleRichTextEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {},
  allowFormatting = true
}: SimpleRichTextEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

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
    } else if (e.key === 'b' && e.ctrlKey && allowFormatting) {
      e.preventDefault();
      toggleBold();
    } else if (e.key === 'i' && e.ctrlKey && allowFormatting) {
      e.preventDefault();
      toggleItalic();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Проверяем, что фокус не перешел на кнопки форматирования
    if (!editorRef.current?.contains(e.relatedTarget as Node)) {
      onSave(value);
    }
  };

  const toggleBold = () => {
    setIsBold(!isBold);
    setShowFormatting(true);
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
    setShowFormatting(true);
  };

  const getTextStyle = (): React.CSSProperties => {
    const baseStyle = {
      ...style,
      fontWeight: isBold ? 'bold' : (style.fontWeight || 'normal'),
      fontStyle: isItalic ? 'italic' : (style.fontStyle || 'normal'),
    };
    return baseStyle;
  };

  // Функция для автоподгонки высоты textarea
  const adjustTextareaHeight = () => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      
      if (style.minHeight === 'auto') {
        return;
      }
      
      const currentHeight = textarea.style.height;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      
      const minHeight = style.minHeight ? parseInt(String(style.minHeight)) : 20;
      const maxHeight = style.maxHeight ? parseInt(String(style.maxHeight)) : scrollHeight;
      
      const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
      textarea.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, multiline]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [multiline]);

  // Создаем безопасные стили для editor'а
  const editorStyles: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    resize: 'none',
    overflow: multiline ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    margin: '0',
    padding: '0',
    display: 'block',
    width: (style && typeof style.width !== 'undefined') ? style.width : '100%',
    ...getTextStyle(),
  };

  const formattingButtonsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-35px',
    left: '0',
    display: 'flex',
    gap: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '5px',
    borderRadius: '4px',
    zIndex: 1000,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    backgroundColor: 'transparent',
    color: 'white',
    minWidth: '24px',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  };

  if (multiline) {
    return (
      <div ref={editorRef} style={{ position: 'relative' }}>
        {allowFormatting && showFormatting && (
          <div style={formattingButtonsStyle}>
            <button
              type="button"
              style={isBold ? activeButtonStyle : buttonStyle}
              onClick={toggleBold}
              title="Жирный (Ctrl+B)"
            >
              <span style={{ fontWeight: 'bold' }}>B</span>
            </button>
            <button
              type="button"
              style={isItalic ? activeButtonStyle : buttonStyle}
              onClick={toggleItalic}
              title="Курсив (Ctrl+I)"
            >
              <span style={{ fontStyle: 'italic' }}>I</span>
            </button>
          </div>
        )}
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className={`simple-rich-text-editor-textarea ${className}`}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => allowFormatting && setShowFormatting(true)}
          placeholder={placeholder}
          style={{
            ...editorStyles,
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            minHeight: style.minHeight === 'auto' ? 'auto' : (style.minHeight || '1.6em'),
            height: style.minHeight === 'auto' ? 'auto' : undefined,
          }}
          rows={1}
        />
      </div>
    );
  }

  return (
    <div ref={editorRef} style={{ position: 'relative' }}>
      {allowFormatting && showFormatting && (
        <div style={formattingButtonsStyle}>
          <button
            type="button"
            style={isBold ? activeButtonStyle : buttonStyle}
            onClick={toggleBold}
            title="Жирный (Ctrl+B)"
          >
            <span style={{ fontWeight: 'bold' }}>B</span>
          </button>
          <button
            type="button"
            style={isItalic ? activeButtonStyle : buttonStyle}
            onClick={toggleItalic}
            title="Курсив (Ctrl+I)"
          >
            <span style={{ fontStyle: 'italic' }}>I</span>
          </button>
        </div>
      )}
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={`simple-rich-text-editor-input ${className}`}
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => allowFormatting && setShowFormatting(true)}
        placeholder={placeholder}
        style={editorStyles}
      />
    </div>
  );
}

export default SimpleRichTextEditor;