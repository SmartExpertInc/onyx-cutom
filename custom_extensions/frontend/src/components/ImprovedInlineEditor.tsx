// custom_extensions/frontend/src/components/ImprovedInlineEditor.tsx

import React, { useState, useRef, useEffect } from 'react';

interface ImprovedInlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImprovedInlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: ImprovedInlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

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
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  // Функция для автоподгонки высоты textarea
  const adjustTextareaHeight = () => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // Сохраняем текущую высоту для предотвращения скачков
      const currentHeight = textarea.style.height;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      
      // Учитываем минимальную и максимальную высоту из стилей
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
    // Сохраняем все важные стили из исходного элемента
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`improved-inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...editorStyles,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: style.minHeight || '1.6em',
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`improved-inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={editorStyles}
    />
  );
}

export default ImprovedInlineEditor;