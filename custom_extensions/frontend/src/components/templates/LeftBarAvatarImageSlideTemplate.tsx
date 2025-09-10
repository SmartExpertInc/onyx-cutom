// custom_extensions/frontend/src/components/templates/LeftBarAvatarImageSlideTemplate.tsx

import React from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface LeftBarAvatarImageProps extends BaseTemplateProps {
  avatarPath?: string;
  mainImagePath?: string;
}

export const LeftBarAvatarImageSlideTemplate: React.FC<LeftBarAvatarImageProps & { theme?: SlideTheme | string }> = ({
  slideId,
  avatarPath = '',
  mainImagePath = '',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', fontFamily: currentTheme.fonts.titleFont, position:'relative', overflow:'hidden' };
  const leftBar: React.CSSProperties = { position:'absolute', left:0, top:0, bottom:0, width:'190px', background:'#000000' };
  const avatarWrap: React.CSSProperties = { position:'absolute', left:'118px', top:'265px', width:'230px', height:'230px', borderRadius:'50%', overflow:'hidden', boxShadow:'0 0 0 6px rgba(255,255,255,0.85) inset' };
  const frame: React.CSSProperties = { position:'absolute', left:'330px', top:'100px', right:'70px', bottom:'100px', border:'2px solid #C7C7C7' };

  return (
    <div className="leftbar-avatar-image inter-theme" style={slide}>
      <div style={leftBar} />
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>
      <div style={frame}>
        <ClickableImagePlaceholder imagePath={mainImagePath} onImageUploaded={(p)=> onUpdate&&onUpdate({ mainImagePath:p })} size="LARGE" position="CENTER" description="Main image" isEditable={isEditable} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>
    </div>
  );
};

export default LeftBarAvatarImageSlideTemplate;

