// custom_extensions/frontend/src/components/templates/IntroductionDataAnalysisSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface IntroductionDataAnalysisProps extends BaseTemplateProps {
  title: string;
  avatarPath?: string;
  iconPath?: string;
}

export const IntroductionDataAnalysisSlideTemplate: React.FC<IntroductionDataAnalysisProps & { theme?: SlideTheme | string }> = ({
  title = 'Introduction to Data Analysis',
  avatarPath = '',
  iconPath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const [editKey, setEditKey] = useState<string | null>(null);

  const slide: React.CSSProperties = { 
    width:'100%', 
    aspectRatio:'16/9', 
    background:'#102412', 
    color:'#FFFFFF', 
    fontFamily: currentTheme.fonts.titleFont, 
    position:'relative' 
  };

  // Left side - avatar frame
  const avatarFrame: React.CSSProperties = {
    position:'absolute',
    left:'80px',
    top:'120px',
    width:'280px',
    height:'360px',
    background:'#6CDC78',
    borderRadius:'24px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  };

  const avatarContainer: React.CSSProperties = {
    width:'240px',
    height:'320px',
    borderRadius:'16px',
    overflow:'hidden',
    background:'#FFFFFF'
  };

  // Right side - title
  const titleContainer: React.CSSProperties = {
    position:'absolute',
    right:'80px',
    top:'120px',
    width:'400px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize:'48px',
    fontWeight:700,
    color:'#FFFFFF',
    lineHeight:1.2,
    marginBottom:'40px'
  };

  // Icon frame
  const iconFrame: React.CSSProperties = {
    position:'absolute',
    right:'80px',
    top:'280px',
    width:'120px',
    height:'120px',
    background:'#FFFFFF',
    borderRadius:'16px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  };

  const iconContainer: React.CSSProperties = {
    width:'80px',
    height:'80px',
    borderRadius:'8px',
    overflow:'hidden'
  };

  // Arrow below icon
  const arrowStyle: React.CSSProperties = {
    position:'absolute',
    right:'130px',
    top:'420px',
    fontSize:'24px',
    color:'#666666'
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
      {/* Left side - Avatar frame */}
      <div style={avatarFrame}>
        <div style={avatarContainer}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageChange={(path) => onUpdate && onUpdate({ avatarPath: path })}
            description="Avatar" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>

      {/* Right side - Title */}
      <div style={titleContainer}>
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

      {/* Icon frame */}
      <div style={iconFrame}>
        <div style={iconContainer}>
          <ClickableImagePlaceholder
            imagePath={iconPath}
            onImageChange={(path) => onUpdate && onUpdate({ iconPath: path })}
            description="Icon" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>

      {/* Arrow */}
      <div style={arrowStyle}>↓</div>
    </div>
  );
};

export default IntroductionDataAnalysisSlideTemplate;