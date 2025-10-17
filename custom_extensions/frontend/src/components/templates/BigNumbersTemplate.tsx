import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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
    fontSize: '1.5rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.subtitleColor, // Use theme subtitle color
    textAlign: 'left',
    width: '95%',
    wordWrap: 'break-word',
    lineHeight: '1.5',
    opacity: 0.9
  };

  // Main content area styles (white background)
  const contentStyles: React.CSSProperties = {
    padding: '64px',
    paddingTop: '20px',
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
    textAlign: 'center',
    padding: '32px 24px',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '3rem',
    color: currentTheme.colors.contentColor, // Use content color (same as label)
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
            <WysiwygEditor
              initialValue={title || ''}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.2'
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
              dangerouslySetInnerHTML={{ __html: title || 'Stress Management Made Simple' }}
            />
          )}
        </div>

        {/* Subtitle */}
        <div 
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true" 
          style={{ display: 'inline-block', width: '100%' }}
        >
          {isEditable && editingSubtitle ? (
            <WysiwygEditor
              initialValue={subtitle || 'Maria can help you identify the sources of your stress and provide strategies for managing it in a healthy way. Learn the tools to handle stress effectively and be productive in the workplace.'}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.5'
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
              dangerouslySetInnerHTML={{ __html: subtitle || 'Maria can help you identify the sources of your stress and provide strategies for managing it in a healthy way. Learn the tools to handle stress effectively and be productive in the workplace.' }}
            />
          )}
        </div>
      </div>

      {/* Main Content Area - White Background */}
      <div style={contentStyles}>

        <div style={gridStyles}>
          {/* Render actual steps data or placeholder */}
          {(steps && steps.length >= 3 ? steps.slice(0, 3) : [
            { value: '85%', label: 'Increase Productivity', description: 'Gain the skills to be productive and successful in the workplace.' },
            { value: '90%', label: 'Reduce Stress', description: 'Learn effective stress management techniques.' },
            { value: '95%', label: 'Improve Balance', description: 'Achieve better work-life balance.' }
          ]).map((item, idx) => (
            <div key={idx} style={itemStyles}>
              {/* Item Value */}
              <div 
                data-moveable-element={`${slideId}-item-${idx}-value`}
                data-draggable="true" 
                style={{ width: '100%' }}
              >
                {isEditable && editingItemValues.includes(idx) ? (
                  <WysiwygEditor
                    initialValue={item.value || ''}
                    onSave={(newValue) => handleItemValueSave(idx, newValue)}
                    onCancel={() => handleItemValueCancel(idx)}
                    placeholder="Enter value..."
                    className="inline-editor-item-value"
                    style={{
                      ...valueStyles,
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      lineHeight: '1.2'
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
                    dangerouslySetInnerHTML={{ __html: item.value || '' }}
                  />
                )}
              </div>
              
              {/* Item Label */}
              <div 
                data-moveable-element={`${slideId}-item-${idx}-label`}
                data-draggable="true" 
                style={{ width: '100%' }}
              >
                {isEditable && editingItemLabels.includes(idx) ? (
                  <WysiwygEditor
                    initialValue={item.label || ''}
                    onSave={(newLabel) => handleItemLabelSave(idx, newLabel)}
                    onCancel={() => handleItemLabelCancel(idx)}
                    placeholder="Enter label..."
                    className="inline-editor-item-label"
                    style={{
                      ...labelStyles,
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      lineHeight: '1.2'
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
                    dangerouslySetInnerHTML={{ __html: item.label || '' }}
                  />
                )}
              </div>

              {/* Item Description */}
              <div 
                data-moveable-element={`${slideId}-item-${idx}-description`}
                data-draggable="true" 
                style={{ width: '100%' }}
              >
                {isEditable && editingItemDescriptions.includes(idx) ? (
                  <WysiwygEditor
                    initialValue={item.description || ''}
                    onSave={(newDescription) => handleItemDescriptionSave(idx, newDescription)}
                    onCancel={() => handleItemDescriptionCancel(idx)}
                    placeholder="Enter description..."
                    className="inline-editor-item-description"
                    style={{
                      ...descriptionStyles,
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      lineHeight: '1.5'
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
                    dangerouslySetInnerHTML={{ __html: item.description || '' }}
                  />
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