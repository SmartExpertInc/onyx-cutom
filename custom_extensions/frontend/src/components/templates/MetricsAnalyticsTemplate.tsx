import React, { useState, useRef, useEffect } from 'react';
import { MetricsAnalyticsTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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
  const [editingMetrics, setEditingMetrics] = useState<{ [key: number]: { number?: boolean; text?: boolean } }>({});

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
    setEditingMetrics(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: false } 
    }));
  };

  const handleMetricCancel = (index: number, field: 'number' | 'text') => {
    setEditingMetrics(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: false } 
    }));
  };

  const handleMetricEdit = (index: number, field: 'number' | 'text') => {
    if (!isEditable) return;
    setEditingMetrics(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: true } 
    }));
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
          <WysiwygEditor
            initialValue={title}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            placeholder="Enter title..."
            className="inline-editor-title"
            style={{
              fontWeight: 700,
              fontSize: currentTheme.fonts.titleSize,
              color: tColor,
              textAlign: 'center',
              width: '100%',
              fontFamily: currentTheme.fonts.titleFont,
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
            dangerouslySetInnerHTML={{ __html: title || (isEditable ? 'Click to add title' : '') }}
          />
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

        {metrics.map((metric, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            cursor: isEditable ? 'pointer' : 'default'
          }}>
            {/* Number */}
            {isEditable && editingMetrics[index]?.number ? (
              <WysiwygEditor
                initialValue={metric.number}
                onSave={(value) => handleMetricSave(index, 'number', value)}
                onCancel={() => handleMetricCancel(index, 'number')}
                placeholder="Enter number..."
                className="inline-editor-metric-number"
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: numColor,
                  marginBottom: '16px',
                  fontFamily: currentTheme.fonts.titleFont,
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: numColor,
                  marginBottom: '16px',
                  fontFamily: currentTheme.fonts.titleFont,
                  cursor: isEditable ? 'pointer' : 'default',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onClick={() => isEditable && handleMetricEdit(index, 'number')}
                dangerouslySetInnerHTML={{ __html: metric.number }}
              />
            )}
            
            {/* Text */}
            {isEditable && editingMetrics[index]?.text ? (
              <WysiwygEditor
                initialValue={metric.text}
                onSave={(value) => handleMetricSave(index, 'text', value)}
                onCancel={() => handleMetricCancel(index, 'text')}
                placeholder="Enter text..."
                className="inline-editor-metric-text"
                style={{
                  fontSize: currentTheme.fonts.contentSize,
                  color: txtColor,
                  lineHeight: '1.5',
                  fontFamily: currentTheme.fonts.contentFont,
                  textAlign: 'center',
                  fontWeight: '500',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <div 
                style={{
                  fontSize: currentTheme.fonts.contentSize,
                  color: txtColor,
                  lineHeight: '1.5',
                  fontFamily: currentTheme.fonts.contentFont,
                  cursor: isEditable ? 'pointer' : 'default',
                  fontWeight: '500'
                }}
                onClick={() => isEditable && handleMetricEdit(index, 'text')}
                dangerouslySetInnerHTML={{ __html: metric.text || (isEditable ? 'Click to add text' : '') }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsAnalyticsTemplate; 