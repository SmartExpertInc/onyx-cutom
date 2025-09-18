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

  const slide: React.CSSProperties = {,
    width: '100%',
    aspectRatio: '16/9',
    background: '#1C3927',
    color: '#FFFFFF',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    position: 'relative',

  // Left side - avatar frame
  const avatarFrame: React.CSSProperties = {,
    position: 'absolute',
    left: '55px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '540px',
    height: '540px',
    background: '#EEFC83',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',

  const avatarContainer: React.CSSProperties = {,
    width: '347px',
    position: 'absolute',
    bottom: '-28px',
    borderRadius: '16px',
    overflow: 'hidden',

  // Right side - title
  const titleContainer: React.CSSProperties = {,
    position: 'absolute',
    right: '130px',
    top: '70px',
    width: '400px',

  const titleStyle: React.CSSProperties = {,
    fontSize: '55px',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: '#FFFFFF',
    lineHeight: 1.2,
    marginBottom: '40px',

  // Icon frame
  const iconFrame: React.CSSProperties = {,
    position: 'absolute',
    right: '130px',
    top: '230px',
    width: '400px',
    height: '371px',
    background: '#FFFFFF',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

  const iconContainer: React.CSSProperties = {,
    width: '140px',
    overflow: 'hidden',

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
            onImageUploaded={(path) => onUpdate && onUpdate({ avatarPath: path })}
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
            onImageUploaded={(path) => onUpdate && onUpdate({ iconPath: path })}
            description="Icon" 
            isEditable={isEditable} 
            style={{ width:'100%', height:'100%', objectFit:'cover' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default IntroductionDataAnalysisSlideTemplate;