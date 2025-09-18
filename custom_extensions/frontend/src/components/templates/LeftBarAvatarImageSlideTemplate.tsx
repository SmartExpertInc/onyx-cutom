// custom_extensions/frontend/src/components/templates/LeftBarAvatarImageSlideTemplate.tsx

import React, { useState } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export interface LeftBarAvatarImageProps extends BaseTemplateProps {
  avatarPath?: string;
  mainImagePath?: string;
  logoPath?: string;
  pageNumber?: string;
}

export const LeftBarAvatarImageSlideTemplate: React.FC<LeftBarAvatarImageProps & { theme?: SlideTheme | string }> = ({
  slideId,
  avatarPath = '',
  mainImagePath = '',
  logoPath = '',
  pageNumber = '04',
  isEditable = false,
  onUpdate,
  theme
}) => {
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);
  
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ avatarPath, mainImagePath, logoPath, pageNumber }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ avatarPath, mainImagePath, logoPath, pageNumber }, logoPath: newLogoPath });
    }
  };

  const slide: React.CSSProperties = { width:'100%', aspectRatio:'16/9', background:'#FFFFFF', fontFamily: 'Lora-Bold, serif', position:'relative', overflow:'hidden' };
  const leftBar: React.CSSProperties = { position:'absolute', left:0, top:0, bottom:0, width:'200px', background:'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)' };
  const avatarWrap: React.CSSProperties = { position:'absolute', left:'85px', border:'1px solid #E0E7FF', zIndex:'10', top:'50%', transform:'translateY(-50%)', width:'230px', height:'230px', borderRadius:'50%', overflow:'hidden', background:'#ffffff' };
  const frame: React.CSSProperties = { position:'absolute', left:'330px', top:'100px', right:'70px', bottom:'100px' };

  return (
    <div className="leftbar-avatar-image inter-theme" style={slide}>
      <div style={leftBar}>
        {/* Logo in top-left corner */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '30px'
        }}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#ffffff"
            text="Your Logo"
          />
        </div>

        {/* Page number with line */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '0px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Small line */}
          <div style={{
            width: '20px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }} />
          {/* Page number */}
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={handlePageNumberCancel}
              className="page-number-editor"
              style={{
                color: '#ffffff',
                fontSize: '17px',
                fontFamily: 'Lora-Bold, serif',
                width: '30px',
                height: 'auto'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingPageNumber(true)}
              style={{
                color: '#ffffff',
                fontSize: '17px',
                fontFamily: 'Lora-Bold, serif',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
            </div>
          )}
        </div>
      </div>
      <div style={avatarWrap}>
        <ClickableImagePlaceholder imagePath={avatarPath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath:p, mainImagePath, logoPath, pageNumber })} size="LARGE" position="CENTER" description="Avatar" isEditable={isEditable} style={{ width:'88%', height:'100%', marginTop:'6px', objectFit:'cover' }} />
      </div>
      <div style={frame}>
        <ClickableImagePlaceholder imagePath={mainImagePath} onImageUploaded={(p)=> onUpdate&&onUpdate({ avatarPath, mainImagePath:p, logoPath, pageNumber })} size="LARGE" position="CENTER" description="Main image" isEditable={isEditable} style={{ width:'100%', borderRadius:'0px', height:'100%', objectFit:'cover' }} />
      </div>
    </div>
  );
};

export default LeftBarAvatarImageSlideTemplate;

