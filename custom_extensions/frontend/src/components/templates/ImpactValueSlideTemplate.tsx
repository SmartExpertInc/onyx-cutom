// custom_extensions/frontend/src/components/templates/ImpactValueSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface ImpactValueSlideProps extends BaseTemplateProps {
  year: string;
  subtitle: string;
  title: string;
  metrics: Array<{
    value: string;
    description: string;
    imagePath?: string;
  }>;
  avatarPath?: string;
}

export const ImpactValueSlideTemplate: React.FC<ImpactValueSlideProps & { theme?: SlideTheme | string }> = ({
  year = '2024',
  subtitle = 'Presentation',
  title = 'Impact Value',
  metrics = [
    { value: '+30%', description: 'Trust and loyalty', imagePath: '' },
    { value: '$3.9', description: 'Saved in costs', imagePath: '' },
    { value: '-15%', description: 'Legal expenses', imagePath: '' }
  ],
  avatarPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#FFD700', 
    color:'#333333', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative',
    padding:'40px'
  };

  // Top section
  const topSection: React.CSSProperties = {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-start',
    marginBottom:'40px'
  };

  const yearStyle: React.CSSProperties = {
    fontSize:'16px',
    fontWeight:400,
    color:'#666666'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize:'16px',
    fontWeight:400,
    color:'#666666'
  };

  // Title section
  const titleSection: React.CSSProperties = {
    marginBottom:'60px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize:'64px',
    fontWeight:700,
    color:'#333333',
    lineHeight:1.1
  };

  // Metrics section
  const metricsSection: React.CSSProperties = {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-start',
    marginBottom:'40px'
  };

  const metricStyle: React.CSSProperties = {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:'16px',
    flex:1
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize:'48px',
    fontWeight:700,
    color:'#333333',
    lineHeight:1
  };

  // Bottom section with images
  const bottomSection: React.CSSProperties = {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-end',
    gap:'20px'
  };

  const imageBlock: React.CSSProperties = {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:'12px',
    flex:1
  };

  const imageContainer: React.CSSProperties = {
    width:'120px',
    height:'120px',
    borderRadius:'8px',
    overflow:'hidden',
    background:'#FFFFFF'
  };

  const imageDescriptionStyle: React.CSSProperties = {
    fontSize:'14px',
    fontWeight:400,
    color:'#666666',
    textAlign:'center',
    lineHeight:1.3
  };

  // Avatar (first block)
  const avatarBlock: React.CSSProperties = {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:'12px',
    flex:1
  };

  const avatarContainer: React.CSSProperties = {
    width:'120px',
    height:'120px',
    borderRadius:'8px',
    overflow:'hidden',
    background:'#000000'
  };

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

  return (
    <div style={slide}>
      {/* Top section */}
      <div style={topSection}>
        <div style={yearStyle} onClick={() => isEditable && setEditKey('year')}>
          {isEditable && editKey === 'year' ? (
            <ImprovedInlineEditor 
              initialValue={year} 
              onSave={(value) => { 
                onUpdate && onUpdate({ year: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(yearStyle)} 
            />
          ) : (
            year
          )}
        </div>
        <div style={subtitleStyle} onClick={() => isEditable && setEditKey('subtitle')}>
          {isEditable && editKey === 'subtitle' ? (
            <ImprovedInlineEditor 
              initialValue={subtitle} 
              onSave={(value) => { 
                onUpdate && onUpdate({ subtitle: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(subtitleStyle)} 
            />
          ) : (
            subtitle
          )}
        </div>
      </div>

      {/* Title section */}
      <div style={titleSection}>
        <div style={titleStyle} onClick={() => isEditable && setEditKey('title')}>
          {isEditable && editKey === 'title' ? (
            <ImprovedInlineEditor 
              initialValue={title} 
              multiline={true}
              onSave={(value) => { 
                onUpdate && onUpdate({ title: value }); 
                setEditKey(null); 
              }} 
              onCancel={() => setEditKey(null)} 
              style={inline(titleStyle)} 
            />
          ) : (
            title
          )}
        </div>
      </div>

      {/* Metrics section */}
      <div style={metricsSection}>
        {metrics.map((metric, index) => (
          <div key={index} style={metricStyle}>
            <div 
              style={metricValueStyle} 
              onClick={() => isEditable && setEditKey(`metric-value-${index}`)}
            >
              {isEditable && editKey === `metric-value-${index}` ? (
                <ImprovedInlineEditor 
                  initialValue={metric.value} 
                  onSave={(value) => { 
                    const newMetrics = [...metrics];
                    newMetrics[index] = { ...newMetrics[index], value: value };
                    onUpdate && onUpdate({ metrics: newMetrics }); 
                    setEditKey(null); 
                  }} 
                  onCancel={() => setEditKey(null)} 
                  style={inline(metricValueStyle)} 
                />
              ) : (
                metric.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section with images */}
      <div style={bottomSection}>
        {/* Avatar block */}
        <div style={avatarBlock}>
          <div style={avatarContainer}>
            <ClickableImagePlaceholder
              imagePath={avatarPath}
              onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
              description="Avatar" 
              isEditable={isEditable} 
              style={{ width:'100%', height:'100%', objectFit:'cover' }} 
            />
          </div>
        </div>

        {/* Metric image blocks */}
        {metrics.map((metric, index) => (
          <div key={index} style={imageBlock}>
            <div style={imageContainer}>
              <ClickableImagePlaceholder
                imagePath={metric.imagePath || ''}
                onImageUploaded={(path) => {
                  const newMetrics = [...metrics];
                  newMetrics[index] = { ...newMetrics[index], imagePath: path };
                  onUpdate && onUpdate({ metrics: newMetrics });
                }}
                description="Metric Image" 
                isEditable={isEditable} 
                style={{ width:'100%', height:'100%', objectFit:'cover' }} 
              />
            </div>
            <div 
              style={imageDescriptionStyle} 
              onClick={() => isEditable && setEditKey(`metric-desc-${index}`)}
            >
              {isEditable && editKey === `metric-desc-${index}` ? (
                <ImprovedInlineEditor 
                  initialValue={metric.description} 
                  onSave={(value) => { 
                    const newMetrics = [...metrics];
                    newMetrics[index] = { ...newMetrics[index], description: value };
                    onUpdate && onUpdate({ metrics: newMetrics }); 
                    setEditKey(null); 
                  }} 
                  onCancel={() => setEditKey(null)} 
                  style={inline(imageDescriptionStyle)} 
                />
              ) : (
                metric.description
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactValueSlideTemplate;