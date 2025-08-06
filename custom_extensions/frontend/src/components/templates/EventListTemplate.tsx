import React, { useState, useRef, useEffect } from 'react';
import { EventListTemplateProps } from '@/types/slideTemplates';
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

const EventListTemplate: React.FC<EventListTemplateProps> = ({
  events = [],
  isEditable = false,
  onUpdate,
  titleColor,
  descriptionColor,
  backgroundColor,
  slideId,
  theme,
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const dColor = descriptionColor || currentTheme.colors.contentColor;
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  // Inline editing state
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'date' | 'description' | null>(null);

  const handleEventChange = (idx: number, key: 'date' | 'description', value: string) => {
    if (!onUpdate) return;
    const updated = events.map((ev, i) => i === idx ? { ...ev, [key]: value } : ev);
    onUpdate({ events: updated });
    setEditingIdx(null);
    setEditingField(null);
  };

  const handleEditStart = (idx: number, field: 'date' | 'description') => {
    if (!isEditable) return;
    setEditingIdx(idx);
    setEditingField(field);
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditingField(null);
  };

  return (
    <div
      style={{
        background: bgColor,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: currentTheme.fonts.contentFont,
        position: 'relative',
        padding: '40px',
        boxSizing: 'border-box'
      }}
    >
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Chevron arrows */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '4px'
        }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              backgroundColor: tColor,
              opacity: 0.3,
              transform: 'rotate(45deg)'
            }} />
          ))}
        </div>
        
        {/* Cloud */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '20px',
          width: '30px',
          height: '20px',
          backgroundColor: tColor,
          borderRadius: '15px',
          opacity: 0.3
        }} />
        
        {/* WiFi */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '24px',
          height: '16px',
          border: `2px solid ${tColor}`,
          borderRadius: '0 0 12px 12px',
          opacity: 0.3
        }} />
        
        {/* Gears */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '20px',
          height: '20px',
          border: `2px solid ${tColor}`,
          borderRadius: '50%',
          opacity: 0.3
        }} />
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          width: '12px',
          height: '12px',
          border: `2px solid ${tColor}`,
          borderRadius: '50%',
          opacity: 0.3
        }} />
        
        {/* Chevron arrows bottom */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '4px'
        }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              backgroundColor: tColor,
              opacity: 0.3,
              transform: 'rotate(45deg)'
            }} />
          ))}
        </div>
      </div>

      {/* Events List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px'
      }}>
        {events.map((event, idx) => (
          <div key={idx} style={{ 
            margin: '24px 0', 
            textAlign: 'center', 
            width: '100%',
            position: 'relative'
          }}>
            {/* Separator line (except for first item) */}
            {idx > 0 && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '1px',
                backgroundColor: tColor,
                opacity: 0.3
              }} />
            )}
            
            {/* Date */}
            {isEditable && editingIdx === idx && editingField === 'date' ? (
              <InlineEditor
                initialValue={event.date}
                onSave={val => handleEventChange(idx, 'date', val)}
                onCancel={handleEditCancel}
                multiline={false}
                placeholder="Enter event date..."
                className="inline-editor-date"
                style={{
                  fontWeight: 700,
                  fontSize: 40,
                  color: tColor,
                  textAlign: 'center',
                  marginBottom: 8,
                  width: '100%',
                  fontFamily: currentTheme.fonts.titleFont
                }}
              />
            ) : (
              <div
                style={{ 
                  fontWeight: 700, 
                  fontSize: 40, 
                  color: tColor, 
                  marginBottom: 8, 
                  cursor: isEditable ? 'pointer' : 'default',
                  fontFamily: currentTheme.fonts.titleFont
                }}
                onClick={() => handleEditStart(idx, 'date')}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {event.date || (isEditable ? 'Click to add date' : '')}
              </div>
            )}
            
            {/* Description */}
            {isEditable && editingIdx === idx && editingField === 'description' ? (
              <InlineEditor
                initialValue={event.description}
                onSave={val => handleEventChange(idx, 'description', val)}
                onCancel={handleEditCancel}
                multiline={false}
                placeholder="Enter event description..."
                className="inline-editor-description"
                style={{
                  fontWeight: 400,
                  fontSize: 22,
                  color: dColor,
                  textAlign: 'center',
                  width: '100%',
                  fontFamily: currentTheme.fonts.contentFont
                }}
              />
            ) : (
              <div
                style={{ 
                  fontWeight: 400, 
                  fontSize: 22, 
                  color: dColor, 
                  cursor: isEditable ? 'pointer' : 'default',
                  fontFamily: currentTheme.fonts.contentFont
                }}
                onClick={() => handleEditStart(idx, 'description')}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {event.description || (isEditable ? 'Click to add description' : '')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventListTemplate;