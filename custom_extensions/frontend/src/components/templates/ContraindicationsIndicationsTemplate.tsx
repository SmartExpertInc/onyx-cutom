import React, { useState, useRef, useEffect } from 'react';
import { ContraindicationsIndicationsTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

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
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
        display: 'block',
        lineHeight: '1.2'
      }}
    />
  );
}

const ContraindicationsIndicationsTemplate: React.FC<ContraindicationsIndicationsTemplateProps> = ({
  title = 'Contraindications and indications',
  contraindications = [
    'Describe the things patients should do here',
    'Describe the things patients should do here',
    'Describe the things patients should do here',
    'Describe the things patients should do here',
    'Describe the things patients should do here'
  ],
  indications = [
    'Describe the things patients shouldn\'t do here',
    'Describe the things patients shouldn\'t do here',
    'Describe the things patients shouldn\'t do here',
    'Describe the things patients shouldn\'t do here',
    'Describe the things patients shouldn\'t do here'
  ],
  titleColor,
  contraindicationsColor,
  indicationsColor,
  backgroundColor,
  slideId,
  theme,
  isEditable = false,
  onUpdate
}) => {
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = getSlideTheme(effectiveTheme);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const contraColor = contraindicationsColor || currentTheme.colors.contentColor;
  const indColor = indicationsColor || currentTheme.colors.contentColor;
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContraindications, setEditingContraindications] = useState<{ [key: number]: boolean }>({});
  const [editingIndications, setEditingIndications] = useState<{ [key: number]: boolean }>({});

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleContraindicationSave = (index: number, value: string) => {
    if (onUpdate) {
      const updatedContraindications = [...contraindications];
      updatedContraindications[index] = value;
      onUpdate({ contraindications: updatedContraindications });
    }
    setEditingContraindications(prev => ({ ...prev, [index]: false }));
  };

  const handleIndicationSave = (index: number, value: string) => {
    if (onUpdate) {
      const updatedIndications = [...indications];
      updatedIndications[index] = value;
      onUpdate({ indications: updatedIndications });
    }
    setEditingIndications(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div
      style={{
        background: bgColor,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: currentTheme.fonts.contentFont,
        position: 'relative',
        padding: '40px',
        boxSizing: 'border-box'
      }}
    >
      {/* Title Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={title}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={false}
            placeholder="Enter title..."
            style={{
              fontWeight: 700,
              fontSize: currentTheme.fonts.titleSize,
              color: tColor,
              textAlign: 'center',
              width: '100%',
              fontFamily: currentTheme.fonts.titleFont
            }}
          />
        ) : (
          <div
            style={{
              fontWeight: 700,
              fontSize: currentTheme.fonts.titleSize,
              color: tColor,
              textAlign: 'center',
              cursor: isEditable ? 'pointer' : 'default',
              fontFamily: currentTheme.fonts.titleFont
            }}
            onClick={() => isEditable && setEditingTitle(true)}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {title || (isEditable ? 'Click to add title' : '')}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ 
        display: 'flex', 
        gap: '40px',
        flex: 1
      }}>
        {/* Left Column - Contraindications */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontWeight: 600,
              fontSize: '18px',
              color: '#6c757d',
              fontFamily: currentTheme.fonts.titleFont
            }}>
              You shouldn't
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            {contraindications.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                padding: '8px',
                borderRadius: '4px',
                cursor: isEditable ? 'pointer' : 'default'
              }}
              onClick={() => isEditable && setEditingContraindications(prev => ({ ...prev, [index]: true }))}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ff6b6b',
                  marginRight: '12px',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                {isEditable && editingContraindications[index] ? (
                  <InlineEditor
                    initialValue={item}
                    onSave={(value) => handleContraindicationSave(index, value)}
                    onCancel={() => setEditingContraindications(prev => ({ ...prev, [index]: false }))}
                    multiline={true}
                    placeholder="Enter contraindication..."
                    style={{
                      fontSize: currentTheme.fonts.contentSize,
                      color: contraColor,
                      lineHeight: '1.4',
                      flex: 1
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: currentTheme.fonts.contentSize,
                    color: contraColor,
                    lineHeight: '1.4',
                    flex: 1
                  }}>
                    {item || (isEditable ? 'Click to add contraindication' : '')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Indications */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontWeight: 600,
              fontSize: '18px',
              color: '#6c757d',
              fontFamily: currentTheme.fonts.titleFont
            }}>
              You should
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            {indications.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                padding: '8px',
                borderRadius: '4px',
                cursor: isEditable ? 'pointer' : 'default'
              }}
              onClick={() => isEditable && setEditingIndications(prev => ({ ...prev, [index]: true }))}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ff6b6b',
                  marginRight: '12px',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                {isEditable && editingIndications[index] ? (
                  <InlineEditor
                    initialValue={item}
                    onSave={(value) => handleIndicationSave(index, value)}
                    onCancel={() => setEditingIndications(prev => ({ ...prev, [index]: false }))}
                    multiline={true}
                    placeholder="Enter indication..."
                    style={{
                      fontSize: currentTheme.fonts.contentSize,
                      color: indColor,
                      lineHeight: '1.4',
                      flex: 1
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: currentTheme.fonts.contentSize,
                    color: indColor,
                    lineHeight: '1.4',
                    flex: 1
                  }}>
                    {item || (isEditable ? 'Click to add indication' : '')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContraindicationsIndicationsTemplate; 