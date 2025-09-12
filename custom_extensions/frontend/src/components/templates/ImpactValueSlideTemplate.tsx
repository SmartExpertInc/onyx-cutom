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
    padding:'60px 80px'
  };

  // Top section with year and subtitle
  const topSection: React.CSSProperties = {
    position:'absolute',
    top:'60px',
    left:'80px',
    right:'80px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-start'
  };

  const yearStyle: React.CSSProperties = {
    fontSize:'18px',
    fontWeight:400,
    color:'#666666'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize:'18px',
    fontWeight:400,
    color:'#666666'
  };

  // Title section - positioned on the left
  const titleSection: React.CSSProperties = {
    position:'absolute',
    left:'80px',
    top:'140px',
    width:'400px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize:'72px',
    fontWeight:700,
    color:'#333333',
    lineHeight:0.9
  };

  // Metrics section - positioned on the right of title
  const metricsSection: React.CSSProperties = {
    position:'absolute',
    right:'80px',
    top:'140px',
    width:'500px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-start'
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize:'56px',
    fontWeight:700,
    color:'#333333',
    lineHeight:1
  };

  // Bottom section with 4 images
  const bottomSection: React.CSSProperties = {
    position:'absolute',
    bottom:'60px',
    left:'80px',
    right:'80px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-end',
    gap:'40px'
  };

  const imageBlock: React.CSSProperties = {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:'16px',
    flex:1
  };

  const imageContainer: React.CSSProperties = {
    width:'140px',
    height:'140px',
    borderRadius:'12px',
    overflow:'hidden',
    background:'#FFFFFF'
  };

  const avatarContainer: React.CSSProperties = {
    width:'140px',
    height:'140px',
    borderRadius:'12px',
    overflow:'hidden',
    background:'#000000'
  };

  const imageDescriptionStyle: React.CSSProperties = {
    fontSize:'16px',
    fontWeight:400,
    color:'#666666',
    textAlign:'center',
    lineHeight:1.3,
    maxWidth:'140px'
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
          <div key={index}>
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

      {/* Bottom section with 4 images */}
      <div style={bottomSection}>
        {/* Avatar block (leftmost) */}
        <div style={imageBlock}>
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