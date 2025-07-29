import React, { useState, useEffect, useRef } from 'react';

interface SimpleInlineEditorProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  rows?: number;
}

export const SimpleInlineEditor: React.FC<SimpleInlineEditorProps> = ({
  value,
  onSave,
  multiline = false,
  placeholder = '',
  className = '',
  style = {},
  maxLength,
  rows = 4
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`w-full border border-blue-400 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          style={style}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full border border-blue-400 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors duration-200 ${className}`}
      style={style}
      title="Click to edit"
    >
      {value || placeholder}
    </div>
  );
};

export default SimpleInlineEditor; 