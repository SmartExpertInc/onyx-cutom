import React, { useState, useEffect, useRef } from 'react';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  autoFocus?: boolean;
  rows?: number;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  initialValue,
  onSave,
  onCancel,
  multiline = false,
  placeholder = '',
  className = '',
  style = {},
  maxLength,
  autoFocus = true,
  rows = 4
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

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

  const baseClasses = "inline-editor-base bg-yellow-50 border border-yellow-400 rounded text-black outline-none focus:ring-1 focus:ring-yellow-600 placeholder-gray-400 transition-all duration-200";

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`${baseClasses} ${className} p-3 resize-y min-h-[100px]`}
        style={style}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`${baseClasses} ${className} p-2`}
      style={style}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
};

export default InlineEditor; 