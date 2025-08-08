import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface BigNumberItem {
  value: string;
  label: string;
  description: string;
}

export interface BigNumbersTemplateProps {
  slideId: string;
  title: string;
  items: BigNumberItem[];
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
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

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Set initial height for textarea to match content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // Set initial height based on content
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          // Only override browser defaults, preserve all passed styles
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: '1.6'
        }}
        rows={1}
      />
    );
  }

  return (
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
        ...style,
        // Only override browser defaults, preserve all passed styles
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const BigNumbersTemplate: React.FC<BigNumbersTemplateProps> = ({
  slideId,
  title,
  items,
  theme,
  onUpdate,
  isEditable = false
}: BigNumbersTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingItemValues, setEditingItemValues] = useState<number[]>([]);
  const [editingItemLabels, setEditingItemLabels] = useState<number[]>([]);
  const [editingItemDescriptions, setEditingItemDescriptions] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '64px',
    fontFamily: currentTheme.fonts.contentFont,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: 'left',
    marginBottom: '56px',
    width: '100%',
    wordWrap: 'break-word'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 16px',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '4.5rem',
    color: contentColor,
    marginBottom: '16px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word'
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    color: contentColor,
    marginBottom: '10px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.5,
    wordWrap: 'break-word'
  };

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

  // Handle item value editing
  const handleItemValueSave = (index: number, newValue: string) => {
    if (onUpdate && items) {
      const updatedItems = [...items];
      updatedItems[index] = { ...updatedItems[index], value: newValue };
      onUpdate({ items: updatedItems });
    }
    setEditingItemValues(editingItemValues.filter(i => i !== index));
  };

  const handleItemValueCancel = (index: number) => {
    setEditingItemValues(editingItemValues.filter((i: number) => i !== index));
  };

  // Handle item label editing
  const handleItemLabelSave = (index: number, newLabel: string) => {
    if (onUpdate && items) {
      const updatedItems = [...items];
      updatedItems[index] = { ...updatedItems[index], label: newLabel };
      onUpdate({ items: updatedItems });
    }
    setEditingItemLabels(editingItemLabels.filter((i: number) => i !== index));
  };

  const handleItemLabelCancel = (index: number) => {
    setEditingItemLabels(editingItemLabels.filter((i: number) => i !== index));
  };

  // Handle item description editing
  const handleItemDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate && items) {
      const updatedItems = [...items];
      updatedItems[index] = { ...updatedItems[index], description: newDescription };
      onUpdate({ items: updatedItems });
    }
    setEditingItemDescriptions(editingItemDescriptions.filter((i: number) => i !== index));
  };

  const handleItemDescriptionCancel = (index: number) => {
    setEditingItemDescriptions(editingItemDescriptions.filter((i: number) => i !== index));
  };

  const startEditingItemValue = (index: number) => {
    setEditingItemValues([...editingItemValues, index]);
  };

  const startEditingItemLabel = (index: number) => {
    setEditingItemLabels([...editingItemLabels, index]);
  };

  const startEditingItemDescription = (index: number) => {
    setEditingItemDescriptions([...editingItemDescriptions, index]);
  };

  return (
    <div className="big-numbers-template" style={slideStyles}>
      {/* Title - wrapped */}
      <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
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
            }}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={(e) => {
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {title || 'Click to add title'}
          </h1>
        )}
      </div>

      <div style={gridStyles}>
        {Array.isArray(items) && items.length >= 3 ? (
          items.slice(0, 3).map((item: BigNumberItem, idx: number) => (
            <div key={idx} style={itemStyles}>
              {/* Item Value */}
              <div data-draggable="true" style={{ width: '100%' }}>
                {isEditable && editingItemValues.includes(idx) ? (
                  <InlineEditor
                    initialValue={item.value || ''}
                    onSave={(newValue) => handleItemValueSave(idx, newValue)}
                    onCancel={() => handleItemValueCancel(idx)}
                    multiline={false}
                    placeholder="Enter value..."
                    className="inline-editor-item-value"
                    style={{
                      ...valueStyles,
                      // Ensure value behaves exactly like div element
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
                    }}
                  />
                ) : (
                  <div 
                    style={valueStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingItemValue(idx);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {item.value || 'Click to add value'}
                  </div>
                )}
              </div>

              {/* Item Label */}
              <div data-draggable="true" style={{ width: '100%' }}>
                {isEditable && editingItemLabels.includes(idx) ? (
                  <InlineEditor
                    initialValue={item.label || ''}
                    onSave={(newLabel) => handleItemLabelSave(idx, newLabel)}
                    onCancel={() => handleItemLabelCancel(idx)}
                    multiline={true}
                    placeholder="Enter label..."
                    className="inline-editor-item-label"
                    style={{
                      ...labelStyles,
                      // Ensure label behaves exactly like div element
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
                    }}
                  />
                ) : (
                  <div 
                    style={labelStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingItemLabel(idx);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {item.label || 'Click to add label'}
                  </div>
                )}
              </div>

              {/* Item Description */}
              <div data-draggable="true" style={{ width: '100%' }}>
                {isEditable && editingItemDescriptions.includes(idx) ? (
                  <InlineEditor
                    initialValue={item.description || ''}
                    onSave={(newDescription) => handleItemDescriptionSave(idx, newDescription)}
                    onCancel={() => handleItemDescriptionCancel(idx)}
                    multiline={true}
                    placeholder="Enter description..."
                    className="inline-editor-item-description"
                    style={{
                      ...descriptionStyles,
                      // Ensure description behaves exactly like div element
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
                    }}
                  />
                ) : (
                  <div 
                    style={descriptionStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingItemDescription(idx);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {item.description || 'Click to add description'}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            color: '#ff6b6b',
            fontWeight: 600,
            padding: '20px',
            textAlign: 'center',
            gridColumn: '1 / -1'
          }}>
            Error: This slide requires exactly 3 items with "value", "label", and "description" fields.
            {!Array.isArray(items) && <div>Found: {typeof items}</div>}
            {Array.isArray(items) && <div>Found {items.length} items (need 3)</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BigNumbersTemplate; 