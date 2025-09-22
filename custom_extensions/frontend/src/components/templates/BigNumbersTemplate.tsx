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
  subtitle?: string;  // Added subtitle prop
  steps: BigNumberItem[];  // Changed from 'items' to 'steps'
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
  subtitle,  // Added subtitle prop
  steps,  // Changed from 'items' to 'steps'
  theme,
  onUpdate,
  isEditable = false
}: BigNumbersTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);  // Added subtitle editing state
  const [editingItemValues, setEditingItemValues] = useState<number[]>([]);
  const [editingItemLabels, setEditingItemLabels] = useState<number[]>([]);
  const [editingItemDescriptions, setEditingItemDescriptions] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for draggable elements (following Big Image Left pattern)
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Use existing slideId for element positioning (following Big Image Left pattern)
  
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
    background: 'white', // White background for main content area
    display: 'flex',
    flexDirection: 'column',
    fontFamily: currentTheme.fonts.contentFont,
  };

  // Header section styles (using dark purple theme background)
  const headerStyles: React.CSSProperties = {
    background: currentTheme.colors.backgroundColor, // Use theme background gradient
    padding: '48px 64px 48px 64px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor, // Use theme title color
    textAlign: 'left',
    marginBottom: '24px',
    width: '100%',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    lineHeight: '1.2'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.subtitleColor, // Use theme subtitle color
    textAlign: 'left',
    width: '100%',
    wordWrap: 'break-word',
    lineHeight: '1.5',
    opacity: 0.9
  };

  // Main content area styles (white background)
  const contentStyles: React.CSSProperties = {
    padding: '64px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '48px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'start',
    padding: '32px 24px',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '3rem',
    color: currentTheme.colors.accentColor, // Use theme accent color
    marginBottom: '16px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    color: currentTheme.colors.contentColor, // Use content color (black) for labels on white background
    marginBottom: '12px',
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word',
    fontWeight: '600'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '1rem',
    color: currentTheme.colors.contentColor, // Use theme content color
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

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  // Handle item value editing
  const handleItemValueSave = (index: number, newValue: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], value: newValue };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemValues(editingItemValues.filter(i => i !== index));
  };

  const handleItemValueCancel = (index: number) => {
    setEditingItemValues(editingItemValues.filter(i => i !== index));
  };

  // Handle item label editing
  const handleItemLabelSave = (index: number, newLabel: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], label: newLabel };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemLabels(editingItemLabels.filter(i => i !== index));
  };

  const handleItemLabelCancel = (index: number) => {
    setEditingItemLabels(editingItemLabels.filter(i => i !== index));
  };

  // Handle item description editing
  const handleItemDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], description: newDescription };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemDescriptions(editingItemDescriptions.filter(i => i !== index));
  };

  const handleItemDescriptionCancel = (index: number) => {
    setEditingItemDescriptions(editingItemDescriptions.filter(i => i !== index));
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
      {/* Header Section - Dark Blue Background */}
      <div style={headerStyles}>
        {/* Title */}
        <div 
          ref={titleRef}
          data-moveable-element={`${slideId}-title`}
          data-draggable="true" 
          style={{ display: 'inline-block', width: '100%' }}
        >
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
              {title || 'Stress Management Made Simple'}
            </h1>
          )}
        </div>

        {/* Subtitle */}
        <div 
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true" 
          style={{ display: 'inline-block', width: '100%' }}
        >
          {isEditable && editingSubtitle ? (
            <InlineEditor
              initialValue={subtitle || 'Maria can help you identify the sources of your stress and provide strategies for managing it in a healthy way. Learn the tools to handle stress effectively and be productive in the workplace.'}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              multiline={true}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                // Ensure subtitle behaves exactly like p element
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
            <p 
              style={subtitleStyles}
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingSubtitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {subtitle || 'Maria can help you identify the sources of your stress and provide strategies for managing it in a healthy way. Learn the tools to handle stress effectively and be productive in the workplace.'}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area - White Background */}
      <div style={contentStyles}>

        <div style={gridStyles}>
          {/* Three identical blocks with "Increase Productivity" */}
          {[1, 2, 3].map((idx) => (
            <div key={idx} style={itemStyles}>
              {/* Item Label - "Increase Productivity" */}
              <div 
                data-moveable-element={`${slideId}-item-${idx}-label`}
                data-draggable="true" 
                style={{ width: '100%' }}
              >
                {isEditable && editingItemLabels.includes(idx) ? (
                  <InlineEditor
                    initialValue="Increase Productivity"
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
                    Increase Productivity
                  </div>
                )}
              </div>

              {/* Item Description - Same for all blocks */}
              <div 
                data-moveable-element={`${slideId}-item-${idx}-description`}
                data-draggable="true" 
                style={{ width: '100%' }}
              >
                {isEditable && editingItemDescriptions.includes(idx) ? (
                  <InlineEditor
                    initialValue="Gain the skills to be productive and successful in the workplace."
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
                    Gain the skills to be productive and successful in the workplace.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BigNumbersTemplate; 