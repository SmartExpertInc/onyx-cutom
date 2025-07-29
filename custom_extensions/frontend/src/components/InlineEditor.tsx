"import React, { useState, useEffect, useRef } from 'react';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  initialValue,
  onSave,
  onCancel,
  multiline = false
}) => {
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

  if (multiline) {
    return React.createElement('textarea', {
      ref: inputRef,
      className: 'inline-editor-textarea',
      value: value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      rows: 4
    });
  }

  return React.createElement('input', {
    ref: inputRef,
    className: 'inline-editor-input',
    type: 'text',
    value: value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur
  });
};

export default InlineEditor;" 