// custom_extensions/frontend/src/components/editors/RichTextEditor.tsx

import React, { useState, useRef, useEffect } from 'react';

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  isBoldActive: boolean;
  isItalicActive: boolean;
  style?: React.CSSProperties;
}

function FormattingToolbar({ onBold, onItalic, isBoldActive, isItalicActive, style }: FormattingToolbarProps) {
  return (
    <div 
      className="formatting-toolbar"
      style={{
        position: 'absolute',
        top: '-45px',
        left: '0',
        display: 'flex',
        gap: '4px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '4px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        ...style
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBold();
        }}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: isBoldActive ? '#3b82f6' : 'white',
          color: isBoldActive ? 'white' : '#374151',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isBoldActive) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isBoldActive) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onItalic();
        }}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: isItalicActive ? '#3b82f6' : 'white',
          color: isItalicActive ? 'white' : '#374151',
          fontStyle: 'italic',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isItalicActive) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isItalicActive) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
        title="Italic (Ctrl+I)"
      >
        I
      </button>
    </div>
  );
}

export interface RichTextEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function RichTextEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: RichTextEditorProps) {
  // Convert HTML to plain text for editing, but preserve formatting info
  const htmlToPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Detect if initial value has formatting
  const detectInitialFormatting = (html: string) => {
    const hasBold = html.includes('<strong>') || html.includes('<b>');
    const hasItalic = html.includes('<em>') || html.includes('<i>');
    return { hasBold, hasItalic };
  };

  // Helper function to remove fontWeight and fontStyle from base styles
  // This prevents conflicts with our dynamic formatting
  const getCleanStyles = (baseStyles: React.CSSProperties): React.CSSProperties => {
    const { fontWeight, fontStyle, ...cleanStyles } = baseStyles;
    return cleanStyles;
  };

  // Initialize formatting states based on initial HTML
  const { hasBold, hasItalic } = detectInitialFormatting(initialValue);
  
  const [value, setValue] = useState(htmlToPlainText(initialValue));
  const [formattedValue, setFormattedValue] = useState(initialValue);
  const [isBoldActive, setIsBoldActive] = useState(hasBold);
  const [isItalicActive, setIsItalicActive] = useState(hasItalic);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const applyFormatting = () => {
    let formatted = value;
    if (isBoldActive && isItalicActive) {
      formatted = `<strong><em>${value}</em></strong>`;
    } else if (isBoldActive) {
      formatted = `<strong>${value}</strong>`;
    } else if (isItalicActive) {
      formatted = `<em>${value}</em>`;
    }
    setFormattedValue(formatted);
    return formatted;
  };

  const handleBold = () => {
    setIsBoldActive(!isBoldActive);
    // Return focus to input after clicking toolbar button
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleItalic = () => {
    setIsItalicActive(!isItalicActive);
    // Return focus to input after clicking toolbar button
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      const finalValue = applyFormatting();
      onSave(finalValue);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      const finalValue = applyFormatting();
      onSave(finalValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'b' && e.ctrlKey) {
      e.preventDefault();
      handleBold();
    } else if (e.key === 'i' && e.ctrlKey) {
      e.preventDefault();
      handleItalic();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focused element is inside our container (e.g., toolbar button)
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      // Click is on toolbar button - DO NOT close editor
      return;
    }
    
    // Click is outside the container - close editor and save
    // Small delay to allow any pending state updates
    setTimeout(() => {
      const finalValue = applyFormatting();
      onSave(finalValue);
    }, 100);
  };

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Apply formatting as user types
  useEffect(() => {
    applyFormatting();
  }, [isBoldActive, isItalicActive, value]);

  if (multiline) {
    return (
      <div 
        ref={containerRef}
        style={{ position: 'relative', width: '100%' }}
      >
        <FormattingToolbar
          onBold={handleBold}
          onItalic={handleItalic}
          isBoldActive={isBoldActive}
          isItalicActive={isItalicActive}
        />
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className={`inline-editor-textarea ${className}`}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            ...getCleanStyles(style),
            // Only override browser defaults, preserve all passed styles (except fontWeight/fontStyle)
            background: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
            resize: 'none',
            overflow: 'hidden',
            width: '100%',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            minHeight: '1.6em',
            boxSizing: 'border-box',
            display: 'block',
            padding: '8px',
            // Dynamic formatting controlled by state - this is the key fix!
            fontWeight: isBoldActive ? 'bold' : 'normal',
            fontStyle: isItalicActive ? 'italic' : 'normal'
          }}
          rows={1}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
    >
      <FormattingToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        isBoldActive={isBoldActive}
        isItalicActive={isItalicActive}
      />
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={`inline-editor-input ${className}`}
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...getCleanStyles(style),
          // Only override browser defaults, preserve all passed styles (except fontWeight/fontStyle)
          background: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          outline: 'none',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: '1.2',
          padding: '8px',
          // Dynamic formatting controlled by state - this is the key fix!
          fontWeight: isBoldActive ? 'bold' : 'normal',
          fontStyle: isItalicActive ? 'italic' : 'normal'
        }}
      />
    </div>
  );
}

export default RichTextEditor;
