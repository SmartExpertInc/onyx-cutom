import React, { useState, useRef, useEffect } from 'react';
import { MetricsAnalyticsTemplateProps } from '@/types/slideTemplates';
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
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const MetricsAnalyticsTemplate: React.FC<MetricsAnalyticsTemplateProps> = ({
  title = 'Metrics and analytics',
  metrics = [
    { number: '01', text: 'Key performance indicators (KPIs)' },
    { number: '02', text: 'Funnel analytics' },
    { number: '03', text: 'Traffic sources and attribution' },
    { number: '04', text: 'Customer lifetime value (CLV)' },
    { number: '05', text: 'A/B testing and experimentation' },
    { number: '06', text: 'Data visualization' }
  ],
  titleColor,
  numberColor,
  textColor,
  backgroundColor,
  slideId,
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const numColor = numberColor || '#60a5fa';
  const txtColor = textColor || currentTheme.colors.contentColor;
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<{ [key: number]: boolean }>({});

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleMetricSave = (index: number, field: 'number' | 'text', value: string) => {
    if (onUpdate) {
      const updatedMetrics = [...metrics];
      updatedMetrics[index] = { ...updatedMetrics[index], [field]: value };
      onUpdate({ metrics: updatedMetrics });
    }
    setEditingMetrics(prev => ({ ...prev, [index]: false }));
  };

  const handleMetricCancel = (index: number) => {
    setEditingMetrics(prev => ({ ...prev, [index]: false }));
  };

  const handleMetricEdit = (index: number) => {
    if (!isEditable) return;
    setEditingMetrics(prev => ({ ...prev, [index]: true }));
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
      <div style={{ marginBottom: '40px' }}>
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
              fontFamily: currentTheme.fonts.titleFont
            }}
          />
        ) : (
          <div
            style={{
              fontWeight: 700,
              fontSize: currentTheme.fonts.titleSize,
              color: tColor,
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

      {/* Metrics Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '30px',
        flex: 1,
        position: 'relative'
      }}>
        {/* Top Row */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: numColor,
            marginBottom: '8px',
            fontFamily: currentTheme.fonts.titleFont
          }}>
            {metrics[0]?.number || '01'}
          </div>
          <div style={{
            fontSize: currentTheme.fonts.contentSize,
            color: txtColor,
            lineHeight: '1.4',
            fontFamily: currentTheme.fonts.contentFont
          }}>
            {metrics[0]?.text || (isEditable ? 'Click to add text' : '')}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: numColor,
            marginBottom: '8px',
            fontFamily: currentTheme.fonts.titleFont
          }}>
            {metrics[1]?.number || '02'}
          </div>
          <div style={{
            fontSize: currentTheme.fonts.contentSize,
            color: txtColor,
            lineHeight: '1.4',
            fontFamily: currentTheme.fonts.contentFont
          }}>
            {metrics[1]?.text || (isEditable ? 'Click to add text' : '')}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: numColor,
            marginBottom: '8px',
            fontFamily: currentTheme.fonts.titleFont
          }}>
            {metrics[2]?.number || '03'}
          </div>
          <div style={{
            fontSize: currentTheme.fonts.contentSize,
            color: txtColor,
            lineHeight: '1.4',
            fontFamily: currentTheme.fonts.contentFont
          }}>
            {metrics[2]?.text || (isEditable ? 'Click to add text' : '')}
          </div>
        </div>

        {/* Connecting Line - Top */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          right: '10%',
          height: '2px',
          backgroundColor: numColor,
          transform: 'translateY(-50%)'
        }} />

        {/* Bottom Row */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: '60px'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: numColor,
            marginBottom: '8px',
            fontFamily: currentTheme.fonts.titleFont
          }}>
            {metrics[3]?.number || '04'}
          </div>
          <div style={{
            fontSize: currentTheme.fonts.contentSize,
            color: txtColor,
            lineHeight: '1.4',
            fontFamily: currentTheme.fonts.contentFont
          }}>
            {metrics[3]?.text || (isEditable ? 'Click to add text' : '')}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: '60px'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: numColor,
            marginBottom: '8px',
            fontFamily: currentTheme.fonts.titleFont
          }}>
            {metrics[4]?.number || '05'}
          </div>
          <div style={{
            fontSize: currentTheme.fonts.contentSize,
            color: txtColor,
            lineHeight: '1.4',
            fontFamily: currentTheme.fonts.contentFont
          }}>
            {metrics[4]?.text || (isEditable ? 'Click to add text' : '')}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: '60px'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: numColor,
            marginBottom: '8px',
            fontFamily: currentTheme.fonts.titleFont
          }}>
            {metrics[5]?.number || '06'}
          </div>
          <div style={{
            fontSize: currentTheme.fonts.contentSize,
            color: txtColor,
            lineHeight: '1.4',
            fontFamily: currentTheme.fonts.contentFont
          }}>
            {metrics[5]?.text || (isEditable ? 'Click to add text' : '')}
          </div>
        </div>

        {/* Connecting Line - Bottom */}
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '10%',
          right: '10%',
          height: '2px',
          backgroundColor: numColor
        }} />

        {/* Vertical Connecting Lines */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '2px',
          height: '60px',
          backgroundColor: numColor,
          transform: 'translateX(-50%)'
        }} />
      </div>

      {/* Square Markers */}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: numColor,
            borderRadius: '0',
            transform: 'translate(-50%, -50%)'
          }}
          className={`metric-marker-${index}`}
        />
      ))}
    </div>
  );
};

export default MetricsAnalyticsTemplate; 