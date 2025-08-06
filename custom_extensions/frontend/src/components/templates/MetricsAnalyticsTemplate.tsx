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

const MetricsAnalyticsTemplate: React.FC<MetricsAnalyticsTemplateProps> = ({
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
  const numColor = numberColor || currentTheme.colors.accentColor;
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

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '40px',
        flex: 1,
        position: 'relative'
      }}>
        {/* Connecting Lines - Rectangular Frame */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: numColor,
          opacity: 0.3,
          zIndex: 1
        }} />
        
        <div style={{
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '50%',
          width: '2px',
          backgroundColor: numColor,
          opacity: 0.3,
          zIndex: 1
        }} />

        {/* Top horizontal line connecting top row */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: numColor,
          opacity: 0.3,
          zIndex: 1
        }} />

        {/* Bottom horizontal line connecting bottom row */}
        <div style={{
          position: 'absolute',
          top: '75%',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: numColor,
          opacity: 0.3,
          zIndex: 1
        }} />

        {/* Left vertical line connecting left column */}
        <div style={{
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '16.67%',
          width: '2px',
          backgroundColor: numColor,
          opacity: 0.3,
          zIndex: 1
        }} />

        {/* Right vertical line connecting right column */}
        <div style={{
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '83.33%',
          width: '2px',
          backgroundColor: numColor,
          opacity: 0.3,
          zIndex: 1
        }} />

        {metrics.map((metric, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Number */}
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: numColor,
              marginBottom: '12px',
              fontFamily: currentTheme.fonts.titleFont
            }}>
              {metric.number}
            </div>
            
            {/* Text */}
            <div style={{
              fontSize: currentTheme.fonts.contentSize,
              color: txtColor,
              lineHeight: '1.4',
              fontFamily: currentTheme.fonts.contentFont
            }}>
              {metric.text || (isEditable ? 'Click to add text' : '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsAnalyticsTemplate; 